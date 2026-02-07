//package com.iqrah.quran.repository;
//
//import com.iqrah.quran.entity.Translation;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//import java.util.Optional;
//
//@Repository
//public interface TranslationRepository extends JpaRepository<Translation, Long> {
//
//    List<Translation> findByAyaId(Long ayaId);
//
//    List<Translation> findByAyaIdAndLanguage(Long ayaId, String language);
//
//    Optional<Translation> findByAyaIdAndLanguageAndTranslatorName(Long ayaId, String language, String translatorName);
//
//    @Query("SELECT DISTINCT t.language FROM Translation t ORDER BY t.language")
//    List<String> findAllLanguages();
//
//    @Query("SELECT DISTINCT t.translatorName FROM Translation t WHERE t.language = :language ORDER BY t.translatorName")
//    List<String> findTranslatorsByLanguage(@Param("language") String language);
//
//    @Query("SELECT DISTINCT t.translatorName FROM Translation t ORDER BY t.translatorName")
//    List<String> findAllTranslators();
//
//    List<Translation> findByTextContainingIgnoreCase(String text);
//}