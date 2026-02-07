package com.iqrah.quran.repository;

import com.iqrah.quran.entity.Surah;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SurahRepository extends JpaRepository<Surah, Integer> {
}
