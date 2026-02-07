package com.iqrah.quran.controller;

import com.iqrah.quran.dto.Response;
import com.iqrah.quran.dto.SurahDTO;
import com.iqrah.quran.entity.Ayah;
import com.iqrah.quran.entity.Surah;
import com.iqrah.quran.service.QuranService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quran")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class QuranController {

    private final QuranService quranService;

    @GetMapping("/aya/{ayaNumber}")
    public ResponseEntity<Response<Ayah>> getAya(@PathVariable Integer ayaNumber) {
        Response<Ayah> response = quranService.getAya(ayaNumber);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/surah/{surahNumber}")
    public ResponseEntity<Response<SurahDTO>> getSurah(@PathVariable Integer surahNumber) {
        Response<SurahDTO> response = quranService.getSurah(surahNumber);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/surahs")
    public ResponseEntity<Response<List<SurahDTO>>> getAllSurahs() {
        Response<List<SurahDTO>> response = quranService.getAllSurah();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/juz/{juzNumber}")
    public ResponseEntity<Response<List<Ayah>>> getJuz(@PathVariable Integer juzNumber) {
        Response<List<Ayah>> response = quranService.getJuz(juzNumber);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/page/{pageNumber}")
    public ResponseEntity<Response<List<Ayah>>> getPage(@PathVariable Integer pageNumber) {
        Response<List<Ayah>> response = quranService.getPage(pageNumber);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/page/{surahNumber}/{pageNumber}")
    public ResponseEntity<Response<List<Ayah>>> getPage(
            @PathVariable Integer surahNumber,
            @PathVariable Integer pageNumber) {
        Response<List<Ayah>> response = quranService.getPage(surahNumber, pageNumber);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/random")
    public ResponseEntity<Response<Ayah>> getRandomAya() {
        Response<Ayah> response = quranService.getRandomAya();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/range")
    public ResponseEntity<Response<List<Ayah>>> getAyasRange(
            @RequestParam Integer from,
            @RequestParam Integer to) {
        Response<List<Ayah>> response = quranService.getAyasRange(from, to);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/reciters")
    public ResponseEntity<Response<List<String>>> getAllReciters() {
        Response<List<String>> response = quranService.getAllReciters();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/translators")
    public ResponseEntity<Response<List<String>>> getAllTranslators() {
        Response<List<String>> response = quranService.getAllTranslators();
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}