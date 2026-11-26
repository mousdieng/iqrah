package com.iqrah.quran.repository;

import com.iqrah.quran.entity.AyahTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AyahTranslationRepository extends JpaRepository<AyahTranslation, Long> {

    List<AyahTranslation> findByAyahId(Integer ayahId);

    Optional<AyahTranslation> findByAyahIdAndLanguage(Integer ayahId, String language);

    List<AyahTranslation> findByAyahIdInAndLanguage(List<Integer> ayahIds, String language);

    @Query("SELECT at FROM AyahTranslation at WHERE at.ayah.surah.id = :surahId AND at.language = :language")
    List<AyahTranslation> findBySurahIdAndLanguage(Integer surahId, String language);

    @Query("SELECT at FROM AyahTranslation at WHERE at.ayah.page = :page AND at.language = :language")
    List<AyahTranslation> findByPageAndLanguage(Integer page, String language);
}
