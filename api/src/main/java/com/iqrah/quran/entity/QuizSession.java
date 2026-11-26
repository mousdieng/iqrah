package com.iqrah.quran.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "quiz_type", nullable = false, length = 30)
    private QuizType quizType;

    @Column(name = "started_at", nullable = false)
    @Builder.Default
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "correct_answers")
    @Builder.Default
    private Integer correctAnswers = 0;

    @Column(name = "score_percentage", precision = 5, scale = 2)
    private BigDecimal scorePercentage;

    @Column(name = "surah_id")
    private Integer surahId;

    @Column(name = "juz_number")
    private Integer juzNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", length = 10)
    @Builder.Default
    private DifficultyLevel difficultyLevel = DifficultyLevel.MIXED;

    @Column(name = "ayah_count")
    private Integer ayahCount;

    public enum QuizType {
        FILL_BLANK,
        AUDIO_RECOGNITION,
        SEQUENCE_ORDER,
        WRITING
    }

    public enum DifficultyLevel {
        EASY,
        MEDIUM,
        HARD,
        MIXED
    }

    /**
     * Calculate and set score percentage when completing the quiz
     */
    public void complete() {
        this.completedAt = LocalDateTime.now();
        if (totalQuestions != null && totalQuestions > 0) {
            double percentage = (double) correctAnswers / totalQuestions * 100;
            this.scorePercentage = new BigDecimal(percentage).setScale(2, java.math.RoundingMode.HALF_UP);
        }
    }

    /**
     * Increment correct answers
     */
    public void addCorrectAnswer() {
        this.correctAnswers++;
    }
}
