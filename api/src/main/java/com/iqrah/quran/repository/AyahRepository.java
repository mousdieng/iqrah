package com.iqrah.quran.repository;

import com.iqrah.quran.entity.Ayah;
import com.iqrah.quran.entity.Surah;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AyahRepository extends JpaRepository<Ayah, Integer> {
    List<Ayah> findBySurah_IdAndPage(Integer surahId, Integer page);

    List<Ayah> findBySurah_Id(Integer surahId);

    List<Ayah> findAyahsByJuz(Integer juz);

    @Query(value = "SELECT * FROM ayahs ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Optional<Ayah> findRandomAyah();

    List<Ayah> findByIdBetween(Integer from, Integer to);

    List<Ayah> findAyahsByPage(Integer page);


    @Query("select min(a.page) from Ayah a where a.surah.id = :surahId")
    Integer findStartPageBySurahId(Integer surahId);

    @Query("select max(a.page) from Ayah a where a.surah.id = :surahId")
    Integer findEndPageBySurahId(Integer surahId);

}