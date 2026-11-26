package com.iqrah.quran.controller;

import com.iqrah.quran.dto.Response;
import com.iqrah.quran.entity.UserStatistics;
import com.iqrah.quran.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    /**
     * Get dashboard overview statistics
     */
    @GetMapping("/overview")
    public ResponseEntity<Response<Map<String, Object>>> getOverview() {
        Map<String, Object> overview = statisticsService.getOverview();
        return ResponseEntity.ok(Response.ok("Overview retrieved", overview));
    }

    /**
     * Get today's statistics
     */
    @GetMapping("/today")
    public ResponseEntity<Response<UserStatistics>> getTodayStatistics() {
        UserStatistics today = statisticsService.getTodayStatistics();
        return ResponseEntity.ok(Response.ok("Today's statistics retrieved", today));
    }

    /**
     * Get daily statistics for last N days
     */
    @GetMapping("/daily")
    public ResponseEntity<Response<List<UserStatistics>>> getDailyStats(
            @RequestParam(defaultValue = "30") int days) {
        List<UserStatistics> stats = statisticsService.getDailyStats(days);
        return ResponseEntity.ok(Response.ok("Daily statistics retrieved", stats));
    }

    /**
     * Get statistics by date range
     */
    @GetMapping("/range")
    public ResponseEntity<Response<List<UserStatistics>>> getStatsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<UserStatistics> stats = statisticsService.getStatsByDateRange(startDate, endDate);
        return ResponseEntity.ok(Response.ok("Statistics by range retrieved", stats));
    }

    /**
     * Get weekly summary
     */
    @GetMapping("/weekly")
    public ResponseEntity<Response<Map<String, Object>>> getWeeklySummary() {
        Map<String, Object> summary = statisticsService.getWeeklySummary();
        return ResponseEntity.ok(Response.ok("Weekly summary retrieved", summary));
    }

    /**
     * Get streak information
     */
    @GetMapping("/streak")
    public ResponseEntity<Response<Map<String, Object>>> getStreakInfo() {
        Map<String, Object> streakInfo = statisticsService.getStreakInfo();
        return ResponseEntity.ok(Response.ok("Streak info retrieved", streakInfo));
    }

    /**
     * Get memorization progress by surah
     */
    @GetMapping("/progress-by-surah")
    public ResponseEntity<Response<List<Map<String, Object>>>> getProgressBySurah() {
        List<Map<String, Object>> progress = statisticsService.getProgressBySurah();
        return ResponseEntity.ok(Response.ok("Progress by surah retrieved", progress));
    }

    /**
     * Get all-time totals
     */
    @GetMapping("/totals")
    public ResponseEntity<Response<Map<String, Object>>> getAllTimeTotals() {
        Map<String, Object> totals = statisticsService.getAllTimeTotals();
        return ResponseEntity.ok(Response.ok("All-time totals retrieved", totals));
    }

    /**
     * Record a review activity
     */
    @PostMapping("/record/review")
    public ResponseEntity<Response<UserStatistics>> recordReview() {
        UserStatistics stats = statisticsService.recordReview();
        return ResponseEntity.ok(Response.ok("Review recorded", stats));
    }

    /**
     * Record a memorization
     */
    @PostMapping("/record/memorization")
    public ResponseEntity<Response<UserStatistics>> recordMemorization() {
        UserStatistics stats = statisticsService.recordMemorization();
        return ResponseEntity.ok(Response.ok("Memorization recorded", stats));
    }

    /**
     * Record a completed quiz
     */
    @PostMapping("/record/quiz")
    public ResponseEntity<Response<UserStatistics>> recordQuiz(@RequestBody Map<String, Object> request) {
        Double accuracy = request.get("accuracy") != null ?
                ((Number) request.get("accuracy")).doubleValue() : 0.0;
        UserStatistics stats = statisticsService.recordQuizCompletion(new BigDecimal(accuracy));
        return ResponseEntity.ok(Response.ok("Quiz completion recorded", stats));
    }

    /**
     * Record study time
     */
    @PostMapping("/record/study-time")
    public ResponseEntity<Response<UserStatistics>> recordStudyTime(@RequestBody Map<String, Object> request) {
        Integer minutes = request.get("minutes") != null ?
                ((Number) request.get("minutes")).intValue() : 0;
        UserStatistics stats = statisticsService.recordStudyTime(minutes);
        return ResponseEntity.ok(Response.ok("Study time recorded", stats));
    }
}
