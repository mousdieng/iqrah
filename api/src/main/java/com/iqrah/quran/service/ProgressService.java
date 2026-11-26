package com.iqrah.quran.service;

import com.iqrah.quran.entity.UserProgress;
import com.iqrah.quran.repository.UserProgressRepository;
import com.iqrah.quran.repository.AyahRepository;
import com.iqrah.quran.entity.Ayah;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProgressService {

    @Autowired
    private UserProgressRepository progressRepository;

    @Autowired
    private AyahRepository ayahRepository;

    // SM-2 Algorithm constants
    private static final BigDecimal MIN_EASE_FACTOR = new BigDecimal("1.30");
    private static final BigDecimal DEFAULT_EASE_FACTOR = new BigDecimal("2.50");

    /**
     * Get all progress records
     */
    public List<UserProgress> getAllProgress() {
        return progressRepository.findAll();
    }

    /**
     * Get progress for a specific ayah
     */
    public Optional<UserProgress> getProgressByAyahId(Integer ayahId) {
        return progressRepository.findByAyahId(ayahId);
    }

    /**
     * Get all memorized ayahs
     */
    public List<UserProgress> getMemorizedAyahs() {
        return progressRepository.findByMemorizedTrue();
    }

    /**
     * Get ayahs due for review
     */
    public List<UserProgress> getDueForReview() {
        return progressRepository.findDueForReview(LocalDateTime.now());
    }

    /**
     * Get ayahs due for review with limit
     */
    public List<UserProgress> getDueForReview(int limit) {
        return progressRepository.findDueForReviewWithLimit(LocalDateTime.now(), limit);
    }

    /**
     * Get progress by surah
     */
    public List<UserProgress> getProgressBySurah(Integer surahId) {
        return progressRepository.findBySurahId(surahId);
    }

    /**
     * Count memorized ayahs
     */
    public Long countMemorized() {
        return progressRepository.countMemorized();
    }

    /**
     * Count due for review
     */
    public Long countDueForReview() {
        return progressRepository.countDueForReview(LocalDateTime.now());
    }

    /**
     * Create or update progress for an ayah
     */
    @Transactional
    public UserProgress saveProgress(UserProgress progress) {
        // If it's a new record, set initial next review date
        if (progress.getId() == null && progress.getNextReviewDate() == null) {
            progress.setNextReviewDate(LocalDateTime.now().plusDays(1));
        }
        return progressRepository.save(progress);
    }

    /**
     * Mark an ayah as memorized
     */
    @Transactional
    public UserProgress markAsMemorized(Integer ayahId, Integer surahId) {
        UserProgress progress = progressRepository.findByAyahId(ayahId)
                .orElse(UserProgress.builder()
                        .ayahId(ayahId)
                        .surahId(surahId)
                        .build());

        progress.setMemorized(true);
        progress.setLastReviewDate(LocalDateTime.now());
        progress.setNextReviewDate(LocalDateTime.now().plusDays(1));

        return progressRepository.save(progress);
    }

    /**
     * Remove memorized status
     */
    @Transactional
    public UserProgress unmarkMemorized(Integer ayahId) {
        return progressRepository.findByAyahId(ayahId)
                .map(progress -> {
                    progress.setMemorized(false);
                    progress.setReviewCount(0);
                    progress.setConsecutiveCorrect(0);
                    progress.setEaseFactor(DEFAULT_EASE_FACTOR);
                    progress.setIntervalDays(1);
                    progress.setNextReviewDate(null);
                    return progressRepository.save(progress);
                })
                .orElse(null);
    }

    /**
     * Record a review result and calculate next review date using SM-2 algorithm
     *
     * @param ayahId The ayah that was reviewed
     * @param quality Quality of recall (0-5):
     *                0 = complete blackout
     *                1 = incorrect, remembered after seeing answer
     *                2 = incorrect, easy recall after seeing answer
     *                3 = correct with serious difficulty
     *                4 = correct with hesitation
     *                5 = perfect recall
     */
    @Transactional
    public UserProgress recordReview(Integer ayahId, int quality) {
        UserProgress progress = progressRepository.findByAyahId(ayahId)
                .orElseThrow(() -> new RuntimeException("Progress not found for ayah: " + ayahId));

        return applySmTwoAlgorithm(progress, quality);
    }

    /**
     * Record a simple correct/incorrect review
     */
    @Transactional
    public UserProgress recordReview(Integer ayahId, boolean correct) {
        // Map correct/incorrect to quality score
        int quality = correct ? 4 : 1;
        return recordReview(ayahId, quality);
    }

    /**
     * Apply SM-2 spaced repetition algorithm
     */
    private UserProgress applySmTwoAlgorithm(UserProgress progress, int quality) {
        // Clamp quality to 0-5
        quality = Math.max(0, Math.min(5, quality));

        BigDecimal easeFactor = progress.getEaseFactor();
        int interval = progress.getIntervalDays();
        int reviewCount = progress.getReviewCount();
        int consecutiveCorrect = progress.getConsecutiveCorrect();

        // Calculate new ease factor
        // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        double q = quality;
        double efChange = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
        BigDecimal newEaseFactor = easeFactor.add(new BigDecimal(efChange));

        // Ensure ease factor doesn't go below minimum
        if (newEaseFactor.compareTo(MIN_EASE_FACTOR) < 0) {
            newEaseFactor = MIN_EASE_FACTOR;
        }

        // Calculate new interval based on quality
        if (quality >= 3) {
            // Correct response
            consecutiveCorrect++;

            if (reviewCount == 0) {
                interval = 1;
            } else if (reviewCount == 1) {
                interval = 6;
            } else {
                // interval = previous interval * EF
                interval = newEaseFactor.multiply(new BigDecimal(interval))
                        .setScale(0, RoundingMode.HALF_UP)
                        .intValue();
            }

            reviewCount++;
        } else {
            // Incorrect response - reset to beginning
            consecutiveCorrect = 0;
            interval = 1;
            // Don't increment review count for failed reviews
        }

        // Update difficulty based on quality
        UserProgress.Difficulty difficulty;
        if (quality >= 4) {
            difficulty = UserProgress.Difficulty.EASY;
        } else if (quality >= 3) {
            difficulty = UserProgress.Difficulty.MEDIUM;
        } else {
            difficulty = UserProgress.Difficulty.HARD;
        }

        // Update progress
        progress.setEaseFactor(newEaseFactor.setScale(2, RoundingMode.HALF_UP));
        progress.setIntervalDays(interval);
        progress.setReviewCount(reviewCount);
        progress.setConsecutiveCorrect(consecutiveCorrect);
        progress.setDifficulty(difficulty);
        progress.setLastReviewDate(LocalDateTime.now());
        progress.setNextReviewDate(LocalDateTime.now().plusDays(interval));

        return progressRepository.save(progress);
    }

    /**
     * Update notes for an ayah
     */
    @Transactional
    public UserProgress updateNotes(Integer ayahId, String notes) {
        return progressRepository.findByAyahId(ayahId)
                .map(progress -> {
                    progress.setNotes(notes);
                    return progressRepository.save(progress);
                })
                .orElse(null);
    }

    /**
     * Delete progress for an ayah
     */
    @Transactional
    public void deleteProgress(Integer ayahId) {
        progressRepository.deleteByAyahId(ayahId);
    }

    /**
     * Bulk sync progress from frontend (localStorage migration)
     */
    @Transactional
    public List<UserProgress> syncProgress(List<UserProgress> progressList) {
        for (UserProgress incoming : progressList) {
            Optional<UserProgress> existing = progressRepository.findByAyahId(incoming.getAyahId());

            if (existing.isPresent()) {
                UserProgress current = existing.get();
                // Only update if incoming has newer data
                if (incoming.getLastReviewDate() != null &&
                    (current.getLastReviewDate() == null ||
                     incoming.getLastReviewDate().isAfter(current.getLastReviewDate()))) {

                    current.setMemorized(incoming.getMemorized());
                    current.setDifficulty(incoming.getDifficulty());
                    current.setLastReviewDate(incoming.getLastReviewDate());
                    current.setNextReviewDate(incoming.getNextReviewDate());
                    current.setReviewCount(incoming.getReviewCount());
                    current.setConsecutiveCorrect(incoming.getConsecutiveCorrect());
                    current.setEaseFactor(incoming.getEaseFactor());
                    current.setIntervalDays(incoming.getIntervalDays());
                    current.setNotes(incoming.getNotes());
                    progressRepository.save(current);
                }
            } else {
                progressRepository.save(incoming);
            }
        }
        return progressRepository.findAll();
    }

    /**
     * Get progress for multiple ayahs
     */
    public List<UserProgress> getProgressByAyahIds(List<Integer> ayahIds) {
        return progressRepository.findByAyahIdIn(ayahIds);
    }
}
