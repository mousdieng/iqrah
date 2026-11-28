package com.iqrah.quran.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iqrah.quran.entity.AyahTranslation;
import com.iqrah.quran.entity.Tafsir;
import com.iqrah.quran.entity.WordMeaning;
import com.iqrah.quran.repository.AyahTranslationRepository;
import com.iqrah.quran.repository.TafsirRepository;
import com.iqrah.quran.repository.WordMeaningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.StringJoiner;

@Service
@RequiredArgsConstructor
public class TranslationImportService {

    private static final String TRANSLATIONS_DIR = "translations/";

    private final AyahTranslationRepository translationRepository;
    private final WordMeaningRepository wordMeaningRepository;
    private final TafsirRepository tafsirRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void importTranslationsIfMissing() throws Exception {

        List<AyahTranslation> translationBatch = new ArrayList<>();
        List<WordMeaning> wordMeaningBatch = new ArrayList<>();
        List<Tafsir> tafsirBatch = new ArrayList<>();

        // translations/index.json lists the surahs; each one lives in translations/surah-NNN.json
        JsonNode index = readJson(TRANSLATIONS_DIR + "index.json");
        // Only surahs not in the database yet: adding a surah file imports it on the next start
        List<Integer> imported = new ArrayList<>();
        for (JsonNode surah : index.get("surahs")) {
            if (translationRepository.existsByAyahId(surah.get("startAyahId").asInt())) continue;
            String file = String.format("%ssurah-%03d.json", TRANSLATIONS_DIR, surah.get("id").asInt());
            collectSurah(readJson(file).get("ayahs"), translationBatch, wordMeaningBatch, tafsirBatch);
            imported.add(surah.get("id").asInt());
        }

        if (imported.isEmpty()) {
            System.out.println("Translations up to date. Skipping...");
            return;
        }

        translationRepository.saveAll(translationBatch);
        wordMeaningRepository.saveAll(wordMeaningBatch);
        tafsirRepository.saveAll(tafsirBatch);

        System.out.println("Translation import finished (surahs " + imported + "). Translations: " + translationRepository.count() +
                ", Word meanings: " + wordMeaningRepository.count() +
                ", Tafsirs: " + tafsirRepository.count());
    }

    private JsonNode readJson(String path) throws Exception {
        try (InputStream inputStream = new ClassPathResource(path).getInputStream()) {
            return objectMapper.readTree(inputStream);
        }
    }

    private void collectSurah(JsonNode ayahsNode,
                              List<AyahTranslation> translationBatch,
                              List<WordMeaning> wordMeaningBatch,
                              List<Tafsir> tafsirBatch) {
        Iterator<String> ayahIds = ayahsNode.fieldNames();
        while (ayahIds.hasNext()) {
            String ayahIdStr = ayahIds.next();
            JsonNode ayahNode = ayahsNode.get(ayahIdStr);

            Integer ayahId = ayahNode.get("ayahId").asInt();
            Integer surahId = ayahNode.get("surahId").asInt();

            // Import translations for each language
            JsonNode translationsNode = ayahNode.get("translations");
            if (translationsNode != null) {
                Iterator<String> languages = translationsNode.fieldNames();
                while (languages.hasNext()) {
                    String lang = languages.next();
                    JsonNode langNode = translationsNode.get(lang);

                    AyahTranslation translation = AyahTranslation.builder()
                            .ayahId(ayahId)
                            .language(lang)
                            .text(langNode.get("text").asText())
                            .translator(langNode.has("translator") ? langNode.get("translator").asText() : null)
                            .build();

                    translationBatch.add(translation);
                }
            }

            // Import word meanings (French only for now)
            JsonNode wordMeaningsNode = ayahNode.get("wordMeanings");
            if (wordMeaningsNode != null && wordMeaningsNode.has("fr")) {
                JsonNode frWordsNode = wordMeaningsNode.get("fr");
                int wordIndex = 0;
                for (JsonNode wordNode : frWordsNode) {
                    WordMeaning wordMeaning = WordMeaning.builder()
                            .ayahId(ayahId)
                            .wordIndex(wordIndex++)
                            .arabicWord(wordNode.get("arabic").asText())
                            .grammarFr(wordNode.has("grammar") ? wordNode.get("grammar").asText() : null)
                            .meaningFr(wordNode.get("meaning").asText())
                            .build();

                    wordMeaningBatch.add(wordMeaning);
                }
            }

            // Import tafsir (French only for now)
            JsonNode tafsirNode = ayahNode.get("tafsir");
            if (tafsirNode != null && tafsirNode.has("fr")) {
                JsonNode frTafsirNode = tafsirNode.get("fr");

                String referencesStr = null;
                if (frTafsirNode.has("references")) {
                    StringJoiner joiner = new StringJoiner(",");
                    for (JsonNode ref : frTafsirNode.get("references")) {
                        joiner.add(ref.asText());
                    }
                    referencesStr = joiner.toString();
                }

                Tafsir tafsir = Tafsir.builder()
                        .ayahId(ayahId)
                        .language("fr")
                        .text(frTafsirNode.get("text").asText())
                        .referencesList(referencesStr)
                        .build();

                tafsirBatch.add(tafsir);
            }
        }
    }
}
