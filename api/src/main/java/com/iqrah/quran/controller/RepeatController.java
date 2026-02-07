//package com.iqrah.quran.controller;
//
//import com.iqrah.quran.dto.AyaDTO;
//import com.iqrah.quran.dto.RepeatRequestDTO;
//import com.iqrah.quran.service.RepeatService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/quran/repeat")
//@CrossOrigin(origins = "*")
//public class RepeatController {
//
//    @Autowired
//    private RepeatService repeatService;
//
//    @GetMapping("/aya/{surah}/{aya}")
//    public ResponseEntity<List<AyaDTO>> repeatAya(
//            @PathVariable Integer surah,
//            @PathVariable Integer aya,
//            @RequestParam(defaultValue = "3") Integer count,
//            @RequestParam(required = false) String reciter,
//            @RequestParam(defaultValue = "0") Integer pauseDuration) {
//
//        RepeatRequestDTO request = new RepeatRequestDTO(count, reciter, pauseDuration);
//        List<AyaDTO> repeatedAyas = repeatService.repeatAya(surah, aya, request);
//        return ResponseEntity.ok(repeatedAyas);
//    }
//
//    @GetMapping("/surah/{surah}")
//    public ResponseEntity<List<AyaDTO>> repeatSurah(
//            @PathVariable Integer surah,
//            @RequestParam(defaultValue = "3") Integer count,
//            @RequestParam(required = false) String reciter,
//            @RequestParam(defaultValue = "0") Integer pauseDuration) {
//
//        RepeatRequestDTO request = new RepeatRequestDTO(count, reciter, pauseDuration);
//        List<AyaDTO> repeatedAyas = repeatService.repeatSurah(surah, request);
//        return ResponseEntity.ok(repeatedAyas);
//    }
//
//    @GetMapping("/juz/{juz}")
//    public ResponseEntity<List<AyaDTO>> repeatJuz(
//            @PathVariable Integer juz,
//            @RequestParam(defaultValue = "3") Integer count,
//            @RequestParam(required = false) String reciter,
//            @RequestParam(defaultValue = "0") Integer pauseDuration) {
//
//        RepeatRequestDTO request = new RepeatRequestDTO(count, reciter, pauseDuration);
//        List<AyaDTO> repeatedAyas = repeatService.repeatJuz(juz, request);
//        return ResponseEntity.ok(repeatedAyas);
//    }
//
//    @GetMapping("/page/{page}")
//    public ResponseEntity<List<AyaDTO>> repeatPage(
//            @PathVariable Integer page,
//            @RequestParam(defaultValue = "3") Integer count,
//            @RequestParam(required = false) String reciter,
//            @RequestParam(defaultValue = "0") Integer pauseDuration) {
//
//        RepeatRequestDTO request = new RepeatRequestDTO(count, reciter, pauseDuration);
//        List<AyaDTO> repeatedAyas = repeatService.repeatPage(page, request);
//        return ResponseEntity.ok(repeatedAyas);
//    }
//}