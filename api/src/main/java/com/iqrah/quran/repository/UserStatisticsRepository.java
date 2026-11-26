package com.iqrah.quran.repository;

import com.iqrah.quran.entity.UserStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserStatisticsRepository extends JpaRepository<UserStatistics, Long> {

    // Find by date
    Optional<UserStatistics> findByStatDate(LocalDate statDate);

    // Find by date range
    List<UserStatistics> findByStatDateBetweenOrderByStatDateDesc(LocalDate startDate, LocalDate endDate);

    // Find recent statistics
    @Query("SELECT us FROM UserStatistics us ORDER BY us.statDate DESC LIMIT :limit")
    List<UserStatistics> findRecent(@Param("limit") int limit);

    // Find last N days
    @Query("SELECT us FROM UserStatistics us WHERE us.statDate >= :since ORDER BY us.statDate DESC")
    List<UserStatistics> findSince(@Param("since") LocalDate since);

    // Get total ayahs reviewed
    @Query("SELECT SUM(us.ayahsReviewed) FROM UserStatistics us")
    Long getTotalAyahsReviewed();

    // Get total quizzes completed
    @Query("SELECT SUM(us.quizzesCompleted) FROM UserStatistics us")
    Long getTotalQuizzesCompleted();

    // Get average quiz accuracy
    @Query("SELECT AVG(us.quizAccuracy) FROM UserStatistics us WHERE us.quizAccuracy IS NOT NULL")
    Double getAverageQuizAccuracy();

    // Get current streak
    @Query("SELECT us.currentStreak FROM UserStatistics us ORDER BY us.statDate DESC LIMIT 1")
    Integer getCurrentStreak();

    // Get longest streak
    @Query("SELECT MAX(us.longestStreak) FROM UserStatistics us")
    Integer getLongestStreak();

    // Get weekly summary
    @Query("SELECT SUM(us.ayahsReviewed), SUM(us.ayahsMemorized), SUM(us.quizzesCompleted), AVG(us.quizAccuracy) " +
           "FROM UserStatistics us WHERE us.statDate >= :weekStart")
    Object[] getWeeklySummary(@Param("weekStart") LocalDate weekStart);

    // Check if activity exists for today
    boolean existsByStatDate(LocalDate statDate);
}
