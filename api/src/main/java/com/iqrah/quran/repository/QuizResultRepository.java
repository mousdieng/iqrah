package com.iqrah.quran.repository;

import com.iqrah.quran.entity.QuizResult;
import com.iqrah.quran.entity.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {

    // Find by session
    List<QuizResult> findBySessionId(Long sessionId);

    // Find by ayah
    List<QuizResult> findByAyahId(Integer ayahId);

    // Find correct answers by ayah
    List<QuizResult> findByAyahIdAndIsCorrectTrue(Integer ayahId);

    // Find incorrect answers by ayah
    List<QuizResult> findByAyahIdAndIsCorrectFalse(Integer ayahId);

    // Count correct by session
    Long countBySessionIdAndIsCorrectTrue(Long sessionId);

    // Count incorrect by session
    Long countBySessionIdAndIsCorrectFalse(Long sessionId);

    // Find by quiz type
    List<QuizResult> findByQuizType(QuizSession.QuizType quizType);

    // Find recent results
    @Query("SELECT qr FROM QuizResult qr ORDER BY qr.answeredAt DESC LIMIT :limit")
    List<QuizResult> findRecent(@Param("limit") int limit);

    // Find results by date range
    @Query("SELECT qr FROM QuizResult qr WHERE qr.answeredAt >= :start AND qr.answeredAt < :end")
    List<QuizResult> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Calculate accuracy for ayah
    @Query("SELECT (COUNT(CASE WHEN qr.isCorrect = true THEN 1 END) * 100.0 / COUNT(*)) FROM QuizResult qr WHERE qr.ayahId = :ayahId")
    Double calculateAccuracyForAyah(@Param("ayahId") Integer ayahId);

    // Find most difficult ayahs (most incorrect answers)
    @Query("SELECT qr.ayahId, COUNT(*) as failCount FROM QuizResult qr WHERE qr.isCorrect = false GROUP BY qr.ayahId ORDER BY failCount DESC LIMIT :limit")
    List<Object[]> findMostDifficultAyahs(@Param("limit") int limit);

    // Delete by session
    void deleteBySessionId(Long sessionId);
}
