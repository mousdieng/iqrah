package com.iqrah.quran.service;

import com.iqrah.quran.config.RemoteAudioProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fallback for reciters that are not stored locally: downloads a verse from the configured
 * remote source the first time it is asked for, keeps it in the cache folder, and serves it
 * from there afterwards. Only reciters listed in the configuration are ever fetched.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RemoteAudioService {

    private static final int MAX_AYAH_NUMBER = 286;
    private static final long MAX_FILE_BYTES = 20L * 1024 * 1024;

    private final RemoteAudioProperties properties;

    /** One lock per verse, so two requests for the same verse download it only once */
    private final Map<String, Object> locks = new ConcurrentHashMap<>();

    private HttpClient httpClient;

    public boolean isRemoteReciter(String reciter) {
        return properties.isEnabled() && properties.getReciters().containsKey(reciter);
    }

    /**
     * The cached file of this verse, downloaded first if needed.
     * Returns null when the reciter is not a remote one, the numbers are invalid, or the source fails.
     */
    public Resource resolve(String reciter, int surahNumber, int ayaNumber) {
        if (!isRemoteReciter(reciter)) return null;
        if (surahNumber < 1 || surahNumber > 114 || ayaNumber < 1 || ayaNumber > MAX_AYAH_NUMBER) return null;

        Path cached = cachePath(reciter, surahNumber, ayaNumber);
        if (Files.exists(cached)) return new FileSystemResource(cached);

        String key = reciter + "/" + surahNumber + "/" + ayaNumber;
        synchronized (locks.computeIfAbsent(key, k -> new Object())) {
            try {
                if (Files.exists(cached)) return new FileSystemResource(cached);
                return download(reciter, surahNumber, ayaNumber, cached) ? new FileSystemResource(cached) : null;
            } finally {
                locks.remove(key);
            }
        }
    }

    private boolean download(String reciter, int surahNumber, int ayaNumber, Path target) {
        RemoteAudioProperties.Reciter config = properties.getReciters().get(reciter);
        String url = String.format("%s/%s/%03d%03d.mp3",
                properties.getBaseUrl().replaceAll("/+$", ""), config.getFolder(), surahNumber, ayaNumber);
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(properties.getTimeoutSeconds()))
                    .header("User-Agent", "quran-api")
                    .GET()
                    .build();
            HttpResponse<InputStream> response = client().send(request, HttpResponse.BodyHandlers.ofInputStream());

            String contentType = response.headers().firstValue("Content-Type").orElse("");
            if (response.statusCode() != 200 || !contentType.startsWith("audio")) {
                response.body().close();
                log.warn("Remote audio unavailable ({} {}): {}", response.statusCode(), contentType, url);
                return false;
            }

            // Write to a temporary file first, so a broken download never leaves a partial mp3 in the cache
            Files.createDirectories(target.getParent());
            Path temp = Files.createTempFile(target.getParent(), "dl-", ".part");
            try (InputStream body = response.body()) {
                long size = Files.copy(body, temp, StandardCopyOption.REPLACE_EXISTING);
                if (size == 0 || size > MAX_FILE_BYTES) {
                    log.warn("Remote audio rejected ({} bytes): {}", size, url);
                    return false;
                }
                Files.move(temp, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
                log.debug("Cached remote audio {} ({} bytes)", target, size);
                return true;
            } finally {
                Files.deleteIfExists(temp);
            }
        } catch (IOException e) {
            log.warn("Remote audio download failed: {} ({})", url, e.getMessage());
            return false;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private Path cachePath(String reciter, int surahNumber, int ayaNumber) {
        return Paths.get(properties.getCacheDir(), "reciter", reciter, surahNumber + "_" + ayaNumber + ".mp3");
    }

    private HttpClient client() {
        if (httpClient == null) {
            httpClient = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(properties.getTimeoutSeconds()))
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .build();
        }
        return httpClient;
    }
}
