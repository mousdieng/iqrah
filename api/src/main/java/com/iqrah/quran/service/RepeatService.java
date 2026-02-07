//package com.iqrah.quran.service;
//
//import com.iqrah.quran.dto.AyaDTO;
//import com.iqrah.quran.dto.RepeatRequestDTO;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class RepeatService {
//
//    @Autowired
//    private QuranService quranService;
//
//    public List<AyaDTO> repeatAya(Integer surahNumber, Integer ayaNumber, RepeatRequestDTO request) {
//        Optional<AyaDTO> ayaOpt = quranService.getAya(surahNumber, ayaNumber, request.getReciter(), null, null);
//        if (ayaOpt.isEmpty()) {
//            return List.of();
//        }
//
//        List<AyaDTO> repeatedAyas = new ArrayList<>();
//        AyaDTO aya = ayaOpt.get();
//
//        int count = request.getCount() != null ? request.getCount() : 1;
//        for (int i = 0; i < count; i++) {
//            repeatedAyas.add(aya);
//        }
//
//        return repeatedAyas;
//    }
//
//    public List<AyaDTO> repeatSurah(Integer surahNumber, RepeatRequestDTO request) {
//        List<AyaDTO> surahAyas = quranService.getSurah(surahNumber, request.getReciter(), null, null);
//        if (surahAyas.isEmpty()) {
//            return List.of();
//        }
//
//        List<AyaDTO> repeatedAyas = new ArrayList<>();
//        int count = request.getCount() != null ? request.getCount() : 1;
//
//        for (int i = 0; i < count; i++) {
//            repeatedAyas.addAll(surahAyas);
//        }
//
//        return repeatedAyas;
//    }
//
//    public List<AyaDTO> repeatJuz(Integer juzNumber, RepeatRequestDTO request) {
//        List<AyaDTO> juzAyas = quranService.getJuz(juzNumber, request.getReciter(), null, null);
//        if (juzAyas.isEmpty()) {
//            return List.of();
//        }
//
//        List<AyaDTO> repeatedAyas = new ArrayList<>();
//        int count = request.getCount() != null ? request.getCount() : 1;
//
//        for (int i = 0; i < count; i++) {
//            repeatedAyas.addAll(juzAyas);
//        }
//
//        return repeatedAyas;
//    }
//
//    // For future implementation: repeat by page
//    public List<AyaDTO> repeatPage(Integer pageNumber, RepeatRequestDTO request) {
//        // This would require a page-to-aya mapping
//        // For now, return empty list
//        return List.of();
//    }
//}