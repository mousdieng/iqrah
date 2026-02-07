package com.iqrah.quran.service;

import com.iqrah.quran.dto.*;
import com.iqrah.quran.entity.*;
import com.iqrah.quran.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class QuranService {

    private final AyahRepository ayahRepository;
    private final SurahRepository surahRepository;
    private final AudioService audioService;

    public Response<Ayah> getAya(Integer ayaNumber) {
        return ayahRepository.findById(ayaNumber)
                .map(ayah -> Response.ok("Ayah found", ayah))
                .orElseGet(() -> Response.fail(404, "Ayah not found"));
    }

    public Response<SurahDTO> getSurah(Integer surahNumber) {
        return surahRepository.findById(surahNumber)
                .map(surah -> {
                    Integer startPage = ayahRepository.findStartPageBySurahId(surahNumber);
                    Integer endPage = ayahRepository.findEndPageBySurahId(surahNumber);
//                    List<Ayah> ayahs = ayahRepository.findBySurah_Id(surahNumber);
                    return Response.ok("Surah found", SurahDTO.fromSurahEntity(surah, startPage, endPage));
                }).orElseGet(() -> Response.fail(404, "Surah not found"));
    }

    public Response<List<SurahDTO>> getAllSurah() {
        List<Surah> surahs = surahRepository.findAll();
        return surahs.isEmpty()
                ? Response.fail(404, "No surahs found")
                : Response.ok("All surahs", SurahDTO.fromSurahEntity(surahs));
    }

    public Response<List<Ayah>> getJuz(Integer juzNumber) {
        List<Ayah> juz = ayahRepository.findAyahsByJuz(juzNumber);
        return juz.isEmpty()
                ? Response.fail(404, "Juz not found")
                : Response.ok("Juz found", juz);
    }

    public Response<List<String>> getAllReciters() {
        List<String> reciters = audioService.getAllReciter();
        return reciters.isEmpty()
                ? Response.fail(404, "No reciters Found")
                : Response.ok("Reciters found", reciters);
    }

    public Response<List<String>> getAllTranslators() {
        List<String> translators = audioService.getAllTranslator();
        return translators.isEmpty()
                ? Response.fail(404, "No translators Found")
                : Response.ok("Translators found", translators);
    }

    public Response<Ayah> getRandomAya() {
        return ayahRepository.findRandomAyah()
                .map(ayah -> Response.ok("Random ayah", ayah))
                .orElseGet(() -> Response.fail(404, "No ayah found"));
    }

    public Response<List<Ayah>> getAyasRange(Integer from, Integer to) {

        if (from == null || to == null || from > to) {
            return Response.fail(400, "Invalid range");
        }

        List<Ayah> ayas = ayahRepository.findByIdBetween(from, to);

        if (ayas.isEmpty()) {
            return Response.fail(404, "No ayahs found in this range");
        }

        return Response.ok("Ayahs found", ayas);
    }

    // Search Ayas
//    public List<AyaDTO> searchAyahs(String query, String reciter, String translator, String language) {
//        List<Aya> ayas = ayaRepository.findByArabicTextContainingIgnoreCase(query);
//
//        // Also search in translations
//        List<Translation> translations = translationRepository.findByTextContainingIgnoreCase(query);
//        List<Aya> ayasFromTranslations = translations.stream()
//                .map(Translation::getAya)
//                .distinct()
//                .collect(Collectors.toList());
//
//        // Combine results and remove duplicates
//        ayas.addAll(ayasFromTranslations);
//        List<Aya> distinctAyas = ayas.stream().distinct().collect(Collectors.toList());
//
//        return distinctAyas.stream()
//                .map(aya -> convertToDTO(aya, reciter, translator, language))
//                .collect(Collectors.toList());
//    }

    public Response<List<Ayah>> getPage(Integer pageNumber) {
        List<Ayah> page = ayahRepository.findAyahsByPage(pageNumber);
        return page.isEmpty()
                ? Response.fail(404, "Page not found")
                : Response.ok("Page found", page);
    }

    public Response<List<Ayah>> getPage(Integer surahNumber, Integer pageNumber) {
        List<Ayah> page = ayahRepository.findBySurah_IdAndPage(surahNumber, pageNumber);
        return page.isEmpty()
                ? Response.fail(404, "Page not found")
                : Response.ok("Page found", page);
    }

    // User Progress Management
//    public UserProgressDTO markAsMemorized(Long ayaId, String userId, Boolean memorized) {
//        Optional<UserProgress> existingProgress = userProgressRepository.findByAyaIdAndUserId(ayaId, userId);
//        UserProgress progress;
//
//        if (existingProgress.isPresent()) {
//            progress = existingProgress.get();
//            progress.setMemorized(memorized);
//            progress.setLastReviewed(LocalDateTime.now());
//            progress.setReviewCount(progress.getReviewCount() + 1);
//        } else {
//            Optional<Aya> ayaOpt = ayaRepository.findById(ayaId);
//            if (ayaOpt.isEmpty()) {
//                throw new IllegalArgumentException("Aya not found");
//            }
//            progress = new UserProgress(ayaOpt.get(), userId, memorized);
//        }
//
//        progress = userProgressRepository.save(progress);
//        return convertProgressToDTO(progress);
//    }

    // Get user progress
//    public List<UserProgressDTO> getUserProgress(String userId) {
//        List<UserProgress> progressList = userProgressRepository.findByUserId(userId);
//        return progressList.stream()
//                .map(this::convertProgressToDTO)
//                .collect(Collectors.toList());
//    }
//
//    // Get memorized ayas for user
//    public List<UserProgressDTO> getMemorizedAyas(String userId) {
//        List<UserProgress> memorizedList = userProgressRepository.findByUserIdAndMemorized(userId, true);
//        return memorizedList.stream()
//                .map(this::convertProgressToDTO)
//                .collect(Collectors.toList());
//    }
//
//    // Favorite Management
//    public void addToFavorites(Long ayaId, String userId) {
//        if (!favoriteAyaRepository.existsByAyaIdAndUserId(ayaId, userId)) {
//            Optional<Aya> ayaOpt = ayaRepository.findById(ayaId);
//            if (ayaOpt.isPresent()) {
//                FavoriteAya favorite = new FavoriteAya(ayaOpt.get(), userId);
//                favoriteAyaRepository.save(favorite);
//            }
//        }
//    }
//
//    public void removeFromFavorites(Long ayaId, String userId) {
//        favoriteAyaRepository.deleteByAyaIdAndUserId(ayaId, userId);
//    }
//
//    public List<AyaDTO> getFavoriteAyas(String userId) {
//        List<FavoriteAya> favorites = favoriteAyaRepository.findByUserIdOrderByCreatedAtDesc(userId);
//        return favorites.stream()
//                .map(fav -> convertToDTO(fav.getAya(), null, null, null))
//                .collect(Collectors.toList());
//    }
}