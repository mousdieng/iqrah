package com.iqrah.quran.controller;

import com.iqrah.quran.service.AudioService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audio")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.OPTIONS})
public class AudioController {
    private final AudioService audioService;

    @GetMapping("/reciter/{reciter}/{surahNumber}/{ayaNumber}")
    public ResponseEntity<Resource> serveReciterAudioByPath(
            @PathVariable String reciter,
            @PathVariable int surahNumber,
            @PathVariable int ayaNumber) {

        return audioService.serveReciterAudioByPath(reciter, surahNumber, ayaNumber);
    }

    @GetMapping("/tafsir/{tafsir}/{surahNumber}/{ayaNumber}")
    public ResponseEntity<Resource> serveTafsirAudioByPath(
            @PathVariable String tafsir,
            @PathVariable int surahNumber,
            @PathVariable int ayaNumber) {

        return audioService.serveTafsirAudioByPath(tafsir, surahNumber, ayaNumber);

    }
}