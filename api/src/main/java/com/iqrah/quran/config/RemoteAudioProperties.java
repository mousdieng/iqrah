package com.iqrah.quran.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Extra reciters whose audio is not stored with the API: when a verse is missing locally,
 * the backend downloads it from {@code baseUrl}/{folder}/{SSSAAA}.mp3 and keeps a copy in {@code cacheDir}.
 */
@Data
@ConfigurationProperties(prefix = "audio.remote")
public class RemoteAudioProperties {

    /** Turns the remote fallback on or off */
    private boolean enabled = true;

    /** Root of the remote audio, e.g. https://everyayah.com/data */
    private String baseUrl = "https://everyayah.com/data";

    /** Where downloaded verses are kept, so each one is fetched only once */
    private String cacheDir = "audio-cache";

    /** Maximum wait for the remote server, in seconds */
    private int timeoutSeconds = 15;

    /** Remote reciters by id (the id used in /api/audio/reciter/{id}/...) */
    private Map<String, Reciter> reciters = new LinkedHashMap<>();

    /** Display names of the reciters stored locally, by folder name */
    private Map<String, String> localNames = new LinkedHashMap<>();

    @Data
    public static class Reciter {
        /** Name shown to the user */
        private String name;
        /** Folder of this reciter on the remote server */
        private String folder;
    }
}
