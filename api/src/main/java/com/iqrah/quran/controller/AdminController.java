//package com.iqrah.quran.controller;
//
//import com.iqrah.quran.service.DataImportService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.HashMap;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/admin")
//@CrossOrigin(origins = "*")
//public class AdminController {
//
//    @Autowired
//    private DataImportService dataImportService;
//
//    @PostMapping("/import-data")
//    public ResponseEntity<Map<String, Object>> importQuranData() {
//        Map<String, Object> response = new HashMap<>();
//
//        try {
//            dataImportService.importQuranData();
//
//            long ayaCount = dataImportService.getAyaCount();
//            long translationCount = dataImportService.getTranslationCount();
//            long audioCount = dataImportService.getAudioCount();
//
//            response.put("success", true);
//            response.put("message", "Quran data imported successfully");
//            response.put("ayasImported", ayaCount);
//            response.put("translationsImported", translationCount);
//            response.put("audioImported", audioCount);
//
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            response.put("success", false);
//            response.put("message", "Error importing data: " + e.getMessage());
//            return ResponseEntity.internalServerError().body(response);
//        }
//    }
//
//    @PostMapping("/import-husary-audio")
//    public ResponseEntity<Map<String, Object>> importHusaryAudio() {
//        Map<String, Object> response = new HashMap<>();
//
//        try {
//            dataImportService.importHusaryAudio();
//
//            long audioCount = dataImportService.getAudioCount();
//
//            response.put("success", true);
//            response.put("message", "Husary audio imported successfully");
//            response.put("totalAudioCount", audioCount);
//
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            response.put("success", false);
//            response.put("message", "Error importing Husary audio: " + e.getMessage());
//            return ResponseEntity.internalServerError().body(response);
//        }
//    }
//
//    @PostMapping("/import-maher-audio")
//    public ResponseEntity<Map<String, Object>> importMaherAlMuaiqlyAudio() {
//        Map<String, Object> response = new HashMap<>();
//
//        try {
//            dataImportService.importMaherAlMuaiqlyAudio();
//
//            long audioCount = dataImportService.getAudioCount();
//
//            response.put("success", true);
//            response.put("message", "Maher Al Muaiqly audio imported successfully");
//            response.put("totalAudioCount", audioCount);
//
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            response.put("success", false);
//            response.put("message", "Error importing Maher Al Muaiqly audio: " + e.getMessage());
//            return ResponseEntity.internalServerError().body(response);
//        }
//    }
//
////    @PostMapping("/import-saad-audio")
////    public ResponseEntity<Map<String, Object>> importSaadAlGhamdiAudio() {
////        Map<String, Object> response = new HashMap<>();
////
////        try {
////            dataImportService.importSaadAlGhamdiAudio();
////
////            long audioCount = dataImportService.getAudioCount();
////
////            response.put("success", true);
////            response.put("message", "Saad Al Ghamdi audio imported successfully");
////            response.put("totalAudioCount", audioCount);
////
////            return ResponseEntity.ok(response);
////        } catch (Exception e) {
////            response.put("success", false);
////            response.put("message", "Error importing Saad Al Ghamdi audio: " + e.getMessage());
////            return ResponseEntity.internalServerError().body(response);
////        }
////    }
//
//    @PostMapping("/import-badr-audio")
//    public ResponseEntity<Map<String, Object>> importBadrAlTurkiAudio() {
//        Map<String, Object> response = new HashMap<>();
//
//        try {
//            dataImportService.importBadrAlTurkiAudio();
//
//            long audioCount = dataImportService.getAudioCount();
//
//            response.put("success", true);
//            response.put("message", "Badr Al Turki audio imported successfully");
//            response.put("totalAudioCount", audioCount);
//
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            response.put("success", false);
//            response.put("message", "Error importing Badr Al Turki audio: " + e.getMessage());
//            return ResponseEntity.internalServerError().body(response);
//        }
//    }
//
//    @GetMapping("/stats")
//    public ResponseEntity<Map<String, Object>> getStats() {
//        Map<String, Object> stats = new HashMap<>();
//
//        stats.put("ayaCount", dataImportService.getAyaCount());
//        stats.put("translationCount", dataImportService.getTranslationCount());
//        stats.put("audioCount", dataImportService.getAudioCount());
//
//        return ResponseEntity.ok(stats);
//    }
//}