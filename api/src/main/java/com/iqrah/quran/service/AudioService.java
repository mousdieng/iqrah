package com.iqrah.quran.service;

import com.iqrah.quran.dto.AudioType;
import com.iqrah.quran.config.RemoteAudioProperties;
import com.iqrah.quran.dto.ReciterDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class AudioService {

    private final RemoteAudioService remoteAudioService;
    private final RemoteAudioProperties remoteAudioProperties;

    @Value("${audio.base-path:#{null}}")
    private String externalAudioPath;

    private static final String RECITER_CLASSPATH = "classpath:audio/reciter/*";
    private static final String TAFSIR_CLASSPATH  = "classpath:audio/tafsir/*";

    public ResponseEntity<Resource> serveAudioByPath(
            AudioType type,
            String sourceName,
            int surahNumber,
            int ayaNumber
    ) {
        try {
            String relativePath = buildRelativePath(type, sourceName, surahNumber, ayaNumber);
            Resource resource = resolveAudioResource(relativePath);

            // Not stored locally: configured remote reciters are fetched (and cached) by the backend
            if ((resource == null || !resource.exists()) && type == AudioType.RECITATION) {
                resource = remoteAudioService.resolve(sourceName, surahNumber, ayaNumber);
            }

            if (resource == null || !resource.exists()) {
                System.err.println("Audio file not found: " + relativePath);
                return ResponseEntity.notFound().build();
            }

            String filename = resource.getFilename() != null ? resource.getFilename() : "audio.mp3";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, OPTIONS")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "*")
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000")
                    .contentType(MediaType.parseMediaType("audio/mpeg"))
                    .contentLength(resource.contentLength())
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private String buildRelativePath(AudioType type, String sourceName, int surahNumber, int ayaNumber) {
        return switch (type) {
            // audio/reciter/<reciter>/<surah>_<ayah>.mp3
            case RECITATION -> String.format("audio/reciter/%s/%d_%d.mp3", sourceName, surahNumber, ayaNumber);
            // audio/tafsir/<tafsir>/<surah>/<surah>_<ayah>.mp3
            case TRANSLATOR -> String.format("audio/tafsir/%s/%d/%d_%d.mp3", sourceName, surahNumber, surahNumber, ayaNumber);
        };
    }

    private Resource resolveAudioResource(String relativePath) {
        // 1. Try external path if configured
        if (externalAudioPath != null && !externalAudioPath.isBlank()) {
            Path externalFile = Paths.get(externalAudioPath, relativePath);
            if (Files.exists(externalFile)) {
                return new FileSystemResource(externalFile);
            }
        }

        // 2. Try classpath resource (works in JAR and IDE)
        Resource classpathResource = new ClassPathResource(relativePath);
        if (classpathResource.exists()) {
            return classpathResource;
        }

        // 3. Fallback: try relative to working directory (for development)
        Path workingDirPath = Paths.get("src/main/resources", relativePath);
        if (Files.exists(workingDirPath)) {
            return new FileSystemResource(workingDirPath);
        }

        return null;
    }

    public ResponseEntity<Resource> serveReciterAudioByPath(String reciter, int surahNumber, int ayaNumber) {
        return serveAudioByPath(AudioType.RECITATION, reciter, surahNumber, ayaNumber);
    }

    public ResponseEntity<Resource> serveTafsirAudioByPath(String tafsir, int surahNumber, int ayaNumber) {
        return serveAudioByPath(AudioType.TRANSLATOR, tafsir, surahNumber, ayaNumber);
    }

    /** Local reciters (audio folders) followed by the remote ones from the configuration */
    public List<String> getAllReciter() {
        return getReciterDetails().stream().map(ReciterDTO::getId).toList();
    }

    /** Every reciter with its display name and where its audio comes from */
    public List<ReciterDTO> getReciterDetails() {
        List<ReciterDTO> reciters = new ArrayList<>();
        List<String> local = listFolderNamesFromClasspath(RECITER_CLASSPATH);
        for (String id : local) {
            reciters.add(new ReciterDTO(id, remoteAudioProperties.getLocalNames().getOrDefault(id, id), "local"));
        }
        if (remoteAudioProperties.isEnabled()) {
            remoteAudioProperties.getReciters().forEach((id, reciter) -> {
                if (!local.contains(id)) {
                    reciters.add(new ReciterDTO(id, reciter.getName() != null ? reciter.getName() : id, "remote"));
                }
            });
        }
        return reciters;
    }

    public List<String> getAllTranslator() {
        return listFolderNamesFromClasspath(TAFSIR_CLASSPATH);
    }

    private List<String> listFolderNamesFromClasspath(String pattern) {
        try {
            PathMatchingResourcePatternResolver resolver =
                    new PathMatchingResourcePatternResolver();

            Resource[] resources = resolver.getResources(pattern);

            return Arrays.stream(resources)
                    .map(Resource::getFilename)   // ✅ correct
                    .filter(name -> name != null && !name.isBlank())
                    .distinct()
                    .sorted()
                    .toList();

        } catch (IOException e) {
            throw new RuntimeException("Failed to scan folders: " + pattern, e);
        }
    }
}
