package com.iqrah.quran.repository;

import com.iqrah.quran.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    // Find by ayah
    Optional<UserProgress> findByAyahId(Integer ayahId);

    // Find all memorized ayahs
    List<UserProgress> findByMemorizedTrue();

    // Find all by surah
    List<UserProgress> findBySurahId(Integer surahId);

    // Find memorized by surah
    List<UserProgress> findBySurahIdAndMemorizedTrue(Integer surahId);

    // Find ayahs due for review (next_review_date <= now)
    @Query("SELECT up FROM UserProgress up WHERE up.nextReviewDate <= :now AND up.memorized = true ORDER BY up.nextReviewDate ASC")
    List<UserProgress> findDueForReview(@Param("now") LocalDateTime now);

    // Find ayahs due for review with limit
    @Query("SELECT up FROM UserProgress up WHERE up.nextReviewDate <= :now AND up.memorized = true ORDER BY up.nextReviewDate ASC LIMIT :limit")
    List<UserProgress> findDueForReviewWithLimit(@Param("now") LocalDateTime now, @Param("limit") int limit);

    // Count memorized
    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.memorized = true")
    Long countMemorized();

    // Count memorized by surah
    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.surahId = :surahId AND up.memorized = true")
    Long countMemorizedBySurah(@Param("surahId") Integer surahId);

    // Count due for review
    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.nextReviewDate <= :now AND up.memorized = true")
    Long countDueForReview(@Param("now") LocalDateTime now);

    // Find by difficulty
    List<UserProgress> findByDifficulty(UserProgress.Difficulty difficulty);

    // Find recently reviewed (for statistics)
    @Query("SELECT up FROM UserProgress up WHERE up.lastReviewDate >= :since ORDER BY up.lastReviewDate DESC")
    List<UserProgress> findReviewedSince(@Param("since") LocalDateTime since);

    // Find by multiple ayah IDs (for bulk operations)
    List<UserProgress> findByAyahIdIn(List<Integer> ayahIds);

    // Check if ayah has progress
    boolean existsByAyahId(Integer ayahId);

    // Delete by ayah ID
    void deleteByAyahId(Integer ayahId);

    // Count memorized grouped by surah
    @Query("SELECT up.surahId, COUNT(up) FROM UserProgress up WHERE up.memorized = true GROUP BY up.surahId ORDER BY up.surahId")
    List<Object[]> countMemorizedBySurah();
}
