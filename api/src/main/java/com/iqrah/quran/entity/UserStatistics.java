package com.iqrah.quran.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_statistics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatistics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stat_date", nullable = false, unique = true)
    private LocalDate statDate;

    @Column(name = "ayahs_reviewed")
    @Builder.Default
    private Integer ayahsReviewed = 0;

    @Column(name = "ayahs_memorized")
    @Builder.Default
    private Integer ayahsMemorized = 0;

    @Column(name = "quizzes_completed")
    @Builder.Default
    private Integer quizzesCompleted = 0;

    @Column(name = "quiz_accuracy", precision = 5, scale = 2)
    private BigDecimal quizAccuracy;

    @Column(name = "study_time_minutes")
    @Builder.Default
    private Integer studyTimeMinutes = 0;

    @Column(name = "current_streak")
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(name = "longest_streak")
    @Builder.Default
    private Integer longestStreak = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Increment review count
     */
    public void addReview() {
        this.ayahsReviewed++;
    }

    /**
     * Increment memorized count
     */
    public void addMemorized() {
        this.ayahsMemorized++;
    }

    /**
     * Increment quiz count and update accuracy
     */
    public void addQuizResult(BigDecimal accuracy) {
        this.quizzesCompleted++;

        // Calculate running average
        if (this.quizAccuracy == null) {
            this.quizAccuracy = accuracy;
        } else {
            BigDecimal total = this.quizAccuracy.multiply(new BigDecimal(this.quizzesCompleted - 1));
            total = total.add(accuracy);
            this.quizAccuracy = total.divide(new BigDecimal(this.quizzesCompleted), 2, java.math.RoundingMode.HALF_UP);
        }
    }

    /**
     * Add study time
     */
    public void addStudyTime(int minutes) {
        this.studyTimeMinutes += minutes;
    }

    /**
     * Update streak
     */
    public void updateStreak(int newStreak) {
        this.currentStreak = newStreak;
        if (newStreak > this.longestStreak) {
            this.longestStreak = newStreak;
        }
    }
}
