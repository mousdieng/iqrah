//package com.iqrah.quran.controller;
//
//import com.iqrah.quran.dto.AyaDTO;
//import com.iqrah.quran.service.QuranService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/quran/favorites")
//@CrossOrigin(origins = "*")
//public class FavoriteController {
//
//    @Autowired
//    private QuranService quranService;
//
//    @PostMapping
//    public ResponseEntity<String> addToFavorites(@RequestBody Map<String, Object> request) {
//        Long ayaId = Long.valueOf(request.get("ayaId").toString());
//        String userId = request.get("userId").toString();
//
//        quranService.addToFavorites(ayaId, userId);
//        return ResponseEntity.ok("Aya added to favorites successfully");
//    }
//
//    @DeleteMapping
//    public ResponseEntity<String> removeFromFavorites(@RequestBody Map<String, Object> request) {
//        Long ayaId = Long.valueOf(request.get("ayaId").toString());
//        String userId = request.get("userId").toString();
//
//        quranService.removeFromFavorites(ayaId, userId);
//        return ResponseEntity.ok("Aya removed from favorites successfully");
//    }
//
//    @GetMapping("/{userId}")
//    public ResponseEntity<List<AyaDTO>> getFavoriteAyas(@PathVariable String userId) {
//        List<AyaDTO> favorites = quranService.getFavoriteAyas(userId);
//        return ResponseEntity.ok(favorites);
//    }
//}