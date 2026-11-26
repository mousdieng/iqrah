package com.iqrah.quran.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AyahTranslationDTO {

    private Integer ayahId;
    private Integer surahId;
    private Integer numberInSurah;
    private Map<String, TranslationTextDTO> translations;
    private List<WordMeaningDTO> wordMeanings;
    private TafsirDTO tafsir;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TranslationTextDTO {
        private String text;
        private String translator;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WordMeaningDTO {
        private String arabic;
        private String grammar;
        private String meaning;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TafsirDTO {
        private String text;
        private List<String> references;
    }
}
