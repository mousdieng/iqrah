package com.iqrah.quran.repository;

import com.iqrah.quran.entity.Tafsir;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TafsirRepository extends JpaRepository<Tafsir, Long> {

    Optional<Tafsir> findByAyahIdAndLanguage(Integer ayahId, String language);

    List<Tafsir> findByAyahIdInAndLanguage(List<Integer> ayahIds, String language);

    @Query("SELECT t FROM Tafsir t WHERE t.ayah.surah.id = :surahId AND t.language = :language")
    List<Tafsir> findBySurahIdAndLanguage(Integer surahId, String language);
}
