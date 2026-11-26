package com.iqrah.quran.repository;

import com.iqrah.quran.entity.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QuizSessionRepository extends JpaRepository<QuizSession, Long> {

    // Find by quiz type
    List<QuizSession> findByQuizType(QuizSession.QuizType quizType);

    // Find completed sessions
    List<QuizSession> findByCompletedAtIsNotNull();

    // Find recent sessions
    @Query("SELECT qs FROM QuizSession qs WHERE qs.completedAt IS NOT NULL ORDER BY qs.completedAt DESC LIMIT :limit")
    List<QuizSession> findRecentCompleted(@Param("limit") int limit);

    // Find sessions by date range
    @Query("SELECT qs FROM QuizSession qs WHERE qs.startedAt >= :start AND qs.startedAt < :end")
    List<QuizSession> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Count completed quizzes
    @Query("SELECT COUNT(qs) FROM QuizSession qs WHERE qs.completedAt IS NOT NULL")
    Long countCompleted();

    // Count by quiz type
    Long countByQuizType(QuizSession.QuizType quizType);

    // Find by surah
    List<QuizSession> findBySurahId(Integer surahId);

    // Calculate average score
    @Query("SELECT AVG(qs.scorePercentage) FROM QuizSession qs WHERE qs.completedAt IS NOT NULL")
    Double calculateAverageScore();

    // Calculate average score for specific quiz type
    @Query("SELECT AVG(qs.scorePercentage) FROM QuizSession qs WHERE qs.quizType = :quizType AND qs.completedAt IS NOT NULL")
    Double calculateAverageScoreByType(@Param("quizType") QuizSession.QuizType quizType);
}
