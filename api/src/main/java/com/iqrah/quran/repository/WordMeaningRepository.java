package com.iqrah.quran.repository;

import com.iqrah.quran.entity.WordMeaning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordMeaningRepository extends JpaRepository<WordMeaning, Long> {

    List<WordMeaning> findByAyahIdOrderByWordIndex(Integer ayahId);

    List<WordMeaning> findByAyahIdIn(List<Integer> ayahIds);

    @Query("SELECT wm FROM WordMeaning wm WHERE wm.ayah.surah.id = :surahId ORDER BY wm.ayahId, wm.wordIndex")
    List<WordMeaning> findBySurahId(Integer surahId);
}
