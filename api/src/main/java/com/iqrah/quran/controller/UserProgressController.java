//package com.iqrah.quran.controller;
//
//import com.iqrah.quran.dto.UserProgressDTO;
//import com.iqrah.quran.service.QuranService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/quran/progress")
//@CrossOrigin(origins = "*")
//public class UserProgressController {
//
//    @Autowired
//    private QuranService quranService;
//
//    @PostMapping
//    public ResponseEntity<UserProgressDTO> markAsMemorized(@RequestBody Map<String, Object> request) {
//        Long ayaId = Long.valueOf(request.get("ayaId").toString());
//        String userId = request.get("userId").toString();
//        Boolean memorized = Boolean.valueOf(request.get("memorized").toString());
//
//        UserProgressDTO progress = quranService.markAsMemorized(ayaId, userId, memorized);
//        return ResponseEntity.ok(progress);
//    }
//
//    @GetMapping("/{userId}")
//    public ResponseEntity<List<UserProgressDTO>> getUserProgress(@PathVariable String userId) {
//        List<UserProgressDTO> progress = quranService.getUserProgress(userId);
//        return ResponseEntity.ok(progress);
//    }
//
//    @GetMapping("/{userId}/memorized")
//    public ResponseEntity<List<UserProgressDTO>> getMemorizedAyas(@PathVariable String userId) {
//        List<UserProgressDTO> memorized = quranService.getMemorizedAyas(userId);
//        return ResponseEntity.ok(memorized);
//    }
//}