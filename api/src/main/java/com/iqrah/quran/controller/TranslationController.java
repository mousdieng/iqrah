package com.iqrah.quran.controller;

import com.iqrah.quran.dto.AyahTranslationDTO;
import com.iqrah.quran.dto.Response;
import com.iqrah.quran.service.TranslationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/translations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TranslationController {

    private final TranslationService translationService;

    @GetMapping("/ayah/{ayahId}")
    public ResponseEntity<Response<AyahTranslationDTO>> getAyahTranslation(
            @PathVariable Integer ayahId) {
        Response<AyahTranslationDTO> response = translationService.getAyahTranslation(ayahId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/surah/{surahId}")
    public ResponseEntity<Response<Map<Integer, AyahTranslationDTO>>> getSurahTranslations(
            @PathVariable Integer surahId) {
        Response<Map<Integer, AyahTranslationDTO>> response = translationService.getSurahTranslations(surahId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/page/{pageNumber}")
    public ResponseEntity<Response<Map<Integer, AyahTranslationDTO>>> getPageTranslations(
            @PathVariable Integer pageNumber) {
        Response<Map<Integer, AyahTranslationDTO>> response = translationService.getPageTranslations(pageNumber);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/languages")
    public ResponseEntity<Response<List<String>>> getAvailableLanguages() {
        Response<List<String>> response = translationService.getAvailableLanguages();
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
