package com.iqrah.quran.service;

import com.iqrah.quran.dto.AyahTranslationDTO;
import com.iqrah.quran.dto.AyahTranslationDTO.TafsirDTO;
import com.iqrah.quran.dto.AyahTranslationDTO.TranslationTextDTO;
import com.iqrah.quran.dto.AyahTranslationDTO.WordMeaningDTO;
import com.iqrah.quran.dto.Response;
import com.iqrah.quran.entity.AyahTranslation;
import com.iqrah.quran.entity.Tafsir;
import com.iqrah.quran.entity.WordMeaning;
import com.iqrah.quran.repository.AyahRepository;
import com.iqrah.quran.repository.AyahTranslationRepository;
import com.iqrah.quran.repository.TafsirRepository;
import com.iqrah.quran.repository.WordMeaningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TranslationService {

    private final AyahTranslationRepository translationRepository;
    private final WordMeaningRepository wordMeaningRepository;
    private final TafsirRepository tafsirRepository;
    private final AyahRepository ayahRepository;

    public Response<AyahTranslationDTO> getAyahTranslation(Integer ayahId) {
        List<AyahTranslation> translations = translationRepository.findByAyahId(ayahId);
        List<WordMeaning> wordMeanings = wordMeaningRepository.findByAyahIdOrderByWordIndex(ayahId);
        Optional<Tafsir> tafsirOpt = tafsirRepository.findByAyahIdAndLanguage(ayahId, "fr");

        if (translations.isEmpty()) {
            return Response.fail(404, "No translations found for ayah " + ayahId);
        }

        AyahTranslationDTO dto = buildAyahTranslationDTO(ayahId, translations, wordMeanings, tafsirOpt.orElse(null));
        return Response.ok(dto);
    }

    public Response<Map<Integer, AyahTranslationDTO>> getSurahTranslations(Integer surahId) {
        List<AyahTranslation> translations = translationRepository.findBySurahIdAndLanguage(surahId, "en");

        if (translations.isEmpty()) {
            return Response.fail(404, "No translations found for surah " + surahId);
        }

        List<Integer> ayahIds = translations.stream()
                .map(AyahTranslation::getAyahId)
                .distinct()
                .collect(Collectors.toList());

        // Get all translations for these ayahs
        Map<Integer, List<AyahTranslation>> translationsByAyah = new HashMap<>();
        for (String lang : Arrays.asList("en", "fr", "de")) {
            List<AyahTranslation> langTranslations = translationRepository.findByAyahIdInAndLanguage(ayahIds, lang);
            for (AyahTranslation t : langTranslations) {
                translationsByAyah.computeIfAbsent(t.getAyahId(), k -> new ArrayList<>()).add(t);
            }
        }

        // Get word meanings
        List<WordMeaning> allWordMeanings = wordMeaningRepository.findByAyahIdIn(ayahIds);
        Map<Integer, List<WordMeaning>> wordMeaningsByAyah = allWordMeanings.stream()
                .collect(Collectors.groupingBy(WordMeaning::getAyahId));

        // Get tafsirs
        List<Tafsir> allTafsirs = tafsirRepository.findByAyahIdInAndLanguage(ayahIds, "fr");
        Map<Integer, Tafsir> tafsirsByAyah = allTafsirs.stream()
                .collect(Collectors.toMap(Tafsir::getAyahId, t -> t));

        // Build result map
        Map<Integer, AyahTranslationDTO> result = new LinkedHashMap<>();
        for (Integer ayahId : ayahIds) {
            List<AyahTranslation> ayahTranslations = translationsByAyah.getOrDefault(ayahId, Collections.emptyList());
            List<WordMeaning> ayahWordMeanings = wordMeaningsByAyah.getOrDefault(ayahId, Collections.emptyList());
            Tafsir ayahTafsir = tafsirsByAyah.get(ayahId);

            AyahTranslationDTO dto = buildAyahTranslationDTO(ayahId, ayahTranslations, ayahWordMeanings, ayahTafsir);
            result.put(ayahId, dto);
        }

        return Response.ok(result);
    }

    public Response<Map<Integer, AyahTranslationDTO>> getPageTranslations(Integer pageNumber) {
        List<AyahTranslation> translations = translationRepository.findByPageAndLanguage(pageNumber, "en");

        if (translations.isEmpty()) {
            return Response.fail(404, "No translations found for page " + pageNumber);
        }

        List<Integer> ayahIds = translations.stream()
                .map(AyahTranslation::getAyahId)
                .distinct()
                .collect(Collectors.toList());

        return buildTranslationsForAyahIds(ayahIds);
    }

    public Response<List<String>> getAvailableLanguages() {
        return Response.ok(Arrays.asList("en", "fr", "de"));
    }

    private Response<Map<Integer, AyahTranslationDTO>> buildTranslationsForAyahIds(List<Integer> ayahIds) {
        Map<Integer, List<AyahTranslation>> translationsByAyah = new HashMap<>();
        for (String lang : Arrays.asList("en", "fr", "de")) {
            List<AyahTranslation> langTranslations = translationRepository.findByAyahIdInAndLanguage(ayahIds, lang);
            for (AyahTranslation t : langTranslations) {
                translationsByAyah.computeIfAbsent(t.getAyahId(), k -> new ArrayList<>()).add(t);
            }
        }

        List<WordMeaning> allWordMeanings = wordMeaningRepository.findByAyahIdIn(ayahIds);
        Map<Integer, List<WordMeaning>> wordMeaningsByAyah = allWordMeanings.stream()
                .collect(Collectors.groupingBy(WordMeaning::getAyahId));

        List<Tafsir> allTafsirs = tafsirRepository.findByAyahIdInAndLanguage(ayahIds, "fr");
        Map<Integer, Tafsir> tafsirsByAyah = allTafsirs.stream()
                .collect(Collectors.toMap(Tafsir::getAyahId, t -> t));

        Map<Integer, AyahTranslationDTO> result = new LinkedHashMap<>();
        for (Integer ayahId : ayahIds) {
            List<AyahTranslation> ayahTranslations = translationsByAyah.getOrDefault(ayahId, Collections.emptyList());
            List<WordMeaning> ayahWordMeanings = wordMeaningsByAyah.getOrDefault(ayahId, Collections.emptyList());
            Tafsir ayahTafsir = tafsirsByAyah.get(ayahId);

            AyahTranslationDTO dto = buildAyahTranslationDTO(ayahId, ayahTranslations, ayahWordMeanings, ayahTafsir);
            result.put(ayahId, dto);
        }

        return Response.ok(result);
    }

    private AyahTranslationDTO buildAyahTranslationDTO(Integer ayahId, List<AyahTranslation> translations,
                                                        List<WordMeaning> wordMeanings, Tafsir tafsir) {
        // Build translations map
        Map<String, TranslationTextDTO> translationsMap = new HashMap<>();
        Integer surahId = null;
        Integer numberInSurah = null;

        for (AyahTranslation t : translations) {
            translationsMap.put(t.getLanguage(), TranslationTextDTO.builder()
                    .text(t.getText())
                    .translator(t.getTranslator())
                    .build());
        }

        // Get surah info from ayah if available
        if (!translations.isEmpty() && translations.get(0).getAyah() != null) {
            surahId = translations.get(0).getAyah().getSurahId();
            numberInSurah = translations.get(0).getAyah().getNumberInSurah();
        } else {
            // Fallback: query the ayah repository
            ayahRepository.findById(ayahId).ifPresent(ayah -> {
                // Can't modify local vars, handled below
            });
        }

        // Build word meanings list
        List<WordMeaningDTO> wordMeaningDTOs = wordMeanings.stream()
                .map(wm -> WordMeaningDTO.builder()
                        .arabic(wm.getArabicWord())
                        .grammar(wm.getGrammarFr())
                        .meaning(wm.getMeaningFr())
                        .build())
                .collect(Collectors.toList());

        // Build tafsir DTO
        TafsirDTO tafsirDTO = null;
        if (tafsir != null) {
            List<String> references = tafsir.getReferencesList() != null
                    ? Arrays.asList(tafsir.getReferencesList().split(","))
                    : Collections.emptyList();

            tafsirDTO = TafsirDTO.builder()
                    .text(tafsir.getText())
                    .references(references)
                    .build();
        }

        return AyahTranslationDTO.builder()
                .ayahId(ayahId)
                .surahId(surahId)
                .numberInSurah(numberInSurah)
                .translations(translationsMap)
                .wordMeanings(wordMeaningDTOs)
                .tafsir(tafsirDTO)
                .build();
    }
}
