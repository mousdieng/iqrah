package com.iqrah.quran.service;

import com.iqrah.quran.entity.UserStatistics;
import com.iqrah.quran.repository.QuizSessionRepository;
import com.iqrah.quran.repository.UserProgressRepository;
import com.iqrah.quran.repository.UserStatisticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class StatisticsService {

    @Autowired
    private UserStatisticsRepository statisticsRepository;

    @Autowired
    private UserProgressRepository progressRepository;

    @Autowired
    private QuizSessionRepository sessionRepository;

    private static final int TOTAL_AYAHS = 6236;

    /**
     * Get or create today's statistics record
     */
    @Transactional
    public UserStatistics getTodayStatistics() {
        LocalDate today = LocalDate.now();
        return statisticsRepository.findByStatDate(today)
                .orElseGet(() -> {
                    // Get current streak from yesterday
                    Integer currentStreak = calculateCurrentStreak();
                    Integer longestStreak = statisticsRepository.getLongestStreak();

                    UserStatistics stats = UserStatistics.builder()
                            .statDate(today)
                            .currentStreak(currentStreak != null ? currentStreak : 0)
                            .longestStreak(longestStreak != null ? longestStreak : 0)
                            .build();
                    return statisticsRepository.save(stats);
                });
    }

    /**
     * Record a review activity
     */
    @Transactional
    public UserStatistics recordReview() {
        UserStatistics today = getTodayStatistics();
        today.addReview();
        updateStreak(today);
        return statisticsRepository.save(today);
    }

    /**
     * Record a memorization
     */
    @Transactional
    public UserStatistics recordMemorization() {
        UserStatistics today = getTodayStatistics();
        today.addMemorized();
        updateStreak(today);
        return statisticsRepository.save(today);
    }

    /**
     * Record a completed quiz with accuracy
     */
    @Transactional
    public UserStatistics recordQuizCompletion(BigDecimal accuracy) {
        UserStatistics today = getTodayStatistics();
        today.addQuizResult(accuracy);
        updateStreak(today);
        return statisticsRepository.save(today);
    }

    /**
     * Record study time
     */
    @Transactional
    public UserStatistics recordStudyTime(int minutes) {
        UserStatistics today = getTodayStatistics();
        today.addStudyTime(minutes);
        updateStreak(today);
        return statisticsRepository.save(today);
    }

    /**
     * Update streak based on activity
     */
    private void updateStreak(UserStatistics today) {
        LocalDate yesterday = today.getStatDate().minusDays(1);
        Optional<UserStatistics> yesterdayStats = statisticsRepository.findByStatDate(yesterday);

        int newStreak;
        if (yesterdayStats.isPresent() && hasActivity(yesterdayStats.get())) {
            // Continue streak
            newStreak = yesterdayStats.get().getCurrentStreak() + 1;
        } else if (hasActivity(today)) {
            // Check if we already counted today
            if (today.getCurrentStreak() == 0) {
                newStreak = 1;
            } else {
                newStreak = today.getCurrentStreak();
            }
        } else {
            newStreak = 0;
        }

        today.updateStreak(newStreak);
    }

    /**
     * Check if a day has any activity
     */
    private boolean hasActivity(UserStatistics stats) {
        return (stats.getAyahsReviewed() != null && stats.getAyahsReviewed() > 0) ||
               (stats.getAyahsMemorized() != null && stats.getAyahsMemorized() > 0) ||
               (stats.getQuizzesCompleted() != null && stats.getQuizzesCompleted() > 0);
    }

    /**
     * Calculate current streak
     */
    public Integer calculateCurrentStreak() {
        LocalDate date = LocalDate.now();
        int streak = 0;

        // Check today first
        Optional<UserStatistics> todayStats = statisticsRepository.findByStatDate(date);
        if (todayStats.isPresent() && hasActivity(todayStats.get())) {
            streak = 1;
            date = date.minusDays(1);
        } else {
            // No activity today, start checking from yesterday
            date = date.minusDays(1);
        }

        // Check consecutive days
        while (true) {
            Optional<UserStatistics> dayStats = statisticsRepository.findByStatDate(date);
            if (dayStats.isPresent() && hasActivity(dayStats.get())) {
                streak++;
                date = date.minusDays(1);
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * Get dashboard overview statistics
     */
    public Map<String, Object> getOverview() {
        Map<String, Object> overview = new HashMap<>();

        // Memorization stats
        Long memorizedCount = progressRepository.countMemorized();
        Long dueForReviewCount = progressRepository.countDueForReview(LocalDateTime.now());

        overview.put("totalAyahs", TOTAL_AYAHS);
        overview.put("memorized", memorizedCount != null ? memorizedCount : 0L);
        overview.put("memorizedPercentage", calculatePercentage(memorizedCount, TOTAL_AYAHS));
        overview.put("dueForReview", dueForReviewCount != null ? dueForReviewCount : 0L);

        // Quiz stats
        Long totalQuizzes = sessionRepository.countCompleted();
        Double averageScore = sessionRepository.calculateAverageScore();

        overview.put("totalQuizzes", totalQuizzes != null ? totalQuizzes : 0L);
        overview.put("averageQuizScore", averageScore != null ?
                new BigDecimal(averageScore).setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO);

        // Streak info
        Integer currentStreak = calculateCurrentStreak();
        Integer longestStreak = statisticsRepository.getLongestStreak();

        overview.put("currentStreak", currentStreak != null ? currentStreak : 0);
        overview.put("longestStreak", longestStreak != null ? longestStreak : 0);

        // Today's activity
        UserStatistics today = getTodayStatistics();
        overview.put("todayReviewed", today.getAyahsReviewed());
        overview.put("todayMemorized", today.getAyahsMemorized());
        overview.put("todayQuizzes", today.getQuizzesCompleted());
        overview.put("todayStudyMinutes", today.getStudyTimeMinutes());

        return overview;
    }

    /**
     * Get daily statistics for last N days
     */
    public List<UserStatistics> getDailyStats(int days) {
        LocalDate since = LocalDate.now().minusDays(days);
        return statisticsRepository.findSince(since);
    }

    /**
     * Get statistics by date range
     */
    public List<UserStatistics> getStatsByDateRange(LocalDate startDate, LocalDate endDate) {
        return statisticsRepository.findByStatDateBetweenOrderByStatDateDesc(startDate, endDate);
    }

    /**
     * Get weekly summary
     */
    public Map<String, Object> getWeeklySummary() {
        LocalDate weekStart = LocalDate.now().minusDays(7);
        Object[] summary = statisticsRepository.getWeeklySummary(weekStart);

        Map<String, Object> result = new HashMap<>();
        if (summary != null && summary.length > 0 && summary[0] != null) {
            result.put("weeklyReviewed", summary[0] != null ? ((Number) summary[0]).intValue() : 0);
            result.put("weeklyMemorized", summary.length > 1 && summary[1] != null ?
                    ((Number) summary[1]).intValue() : 0);
            result.put("weeklyQuizzes", summary.length > 2 && summary[2] != null ?
                    ((Number) summary[2]).intValue() : 0);
            result.put("weeklyAccuracy", summary.length > 3 && summary[3] != null ?
                    new BigDecimal(((Number) summary[3]).doubleValue()).setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        } else {
            result.put("weeklyReviewed", 0);
            result.put("weeklyMemorized", 0);
            result.put("weeklyQuizzes", 0);
            result.put("weeklyAccuracy", BigDecimal.ZERO);
        }

        return result;
    }

    /**
     * Get streak information
     */
    public Map<String, Object> getStreakInfo() {
        Map<String, Object> info = new HashMap<>();

        Integer currentStreak = calculateCurrentStreak();
        Integer longestStreak = statisticsRepository.getLongestStreak();

        info.put("currentStreak", currentStreak != null ? currentStreak : 0);
        info.put("longestStreak", longestStreak != null ? longestStreak : 0);

        // Get activity history for calendar view (last 30 days)
        LocalDate since = LocalDate.now().minusDays(30);
        List<UserStatistics> recent = statisticsRepository.findSince(since);

        List<Map<String, Object>> activityDays = new ArrayList<>();
        for (UserStatistics stat : recent) {
            Map<String, Object> day = new HashMap<>();
            day.put("date", stat.getStatDate().toString());
            day.put("hasActivity", hasActivity(stat));
            day.put("ayahsReviewed", stat.getAyahsReviewed());
            day.put("quizzesCompleted", stat.getQuizzesCompleted());
            activityDays.add(day);
        }

        info.put("activityDays", activityDays);

        return info;
    }

    /**
     * Get memorization progress by surah
     */
    public List<Map<String, Object>> getProgressBySurah() {
        // Get counts grouped by surah
        List<Object[]> surahCounts = progressRepository.countMemorizedBySurah();

        List<Map<String, Object>> progress = new ArrayList<>();
        for (Object[] row : surahCounts) {
            Integer surahId = (Integer) row[0];
            Long memorizedCount = (Long) row[1];

            Map<String, Object> surah = new HashMap<>();
            surah.put("surahId", surahId);
            surah.put("memorized", memorizedCount);
            progress.add(surah);
        }

        return progress;
    }

    /**
     * Calculate percentage
     */
    private BigDecimal calculatePercentage(Long count, int total) {
        if (count == null || count == 0 || total == 0) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(count)
                .multiply(new BigDecimal(100))
                .divide(new BigDecimal(total), 2, RoundingMode.HALF_UP);
    }

    /**
     * Get all-time totals
     */
    public Map<String, Object> getAllTimeTotals() {
        Map<String, Object> totals = new HashMap<>();

        Long totalReviewed = statisticsRepository.getTotalAyahsReviewed();
        Long totalQuizzes = statisticsRepository.getTotalQuizzesCompleted();
        Double avgAccuracy = statisticsRepository.getAverageQuizAccuracy();

        totals.put("totalReviewed", totalReviewed != null ? totalReviewed : 0L);
        totals.put("totalQuizzes", totalQuizzes != null ? totalQuizzes : 0L);
        totals.put("averageAccuracy", avgAccuracy != null ?
                new BigDecimal(avgAccuracy).setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO);

        return totals;
    }
}
