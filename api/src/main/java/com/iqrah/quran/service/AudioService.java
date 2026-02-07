package com.iqrah.quran.service;

import com.iqrah.quran.dto.AudioType;
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
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class AudioService {
//
    private static final String AUDIO_BASE_PATH_RECITER = "api/src/main/resources/audio/reciter/";
    private static final String AUDIO_BASE_PATH_TRANSLATOR = "api/src/main/resources/audio/tafsir/";
    private static final String RECITER_CLASSPATH = "classpath:audio/reciter/*";
    private static final String TAFSIR_CLASSPATH  = "classpath:audio/tafsir/*";

    public ResponseEntity<Resource> serveAudioByPath(
            AudioType type,
            String sourceName,
            int surahNumber,
            int ayaNumber
    ) {
        try {
            Path filePath = buildFilePath(type, sourceName, surahNumber, ayaNumber);
            File file = filePath.toFile();

            if (!file.exists() || !file.isFile()) {
                System.err.println("Audio file not found: " + filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, OPTIONS")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "*")
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000")
                    .contentType(MediaType.parseMediaType("audio/mpeg"))
                    .contentLength(file.length())
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private Path buildFilePath(AudioType type, String sourceName, int surahNumber, int ayaNumber) {

        return switch (type) {

            // reciter/<reciter>/<surah>_<ayah>.mp3
            case RECITATION -> Paths.get(
                    AUDIO_BASE_PATH_RECITER,
                    String.format("%s/%d_%d.mp3", sourceName, surahNumber, ayaNumber)
            );

            // tafsir/<tafsir>/<surah>/<ayah>.mp3
            case TRANSLATOR -> Paths.get(
                    AUDIO_BASE_PATH_TRANSLATOR,
                    String.format("%s/%d/%d.mp3", sourceName, surahNumber, ayaNumber)
            );
        };
    }

    public ResponseEntity<Resource> serveReciterAudioByPath(String reciter, int surahNumber, int ayaNumber) {
        return serveAudioByPath(AudioType.RECITATION, reciter, surahNumber, ayaNumber);
    }

    public ResponseEntity<Resource> serveTafsirAudioByPath(String tafsir, int surahNumber, int ayaNumber) {
        return serveAudioByPath(AudioType.TRANSLATOR, tafsir, surahNumber, ayaNumber);
    }

    public List<String> getAllReciter() {
        return listFolderNamesFromClasspath(RECITER_CLASSPATH);
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
