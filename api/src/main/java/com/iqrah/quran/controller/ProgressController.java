package com.iqrah.quran.controller;

import com.iqrah.quran.dto.Response;
import com.iqrah.quran.entity.UserProgress;
import com.iqrah.quran.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    /**
     * Get all progress records
     */
    @GetMapping
    public ResponseEntity<Response<List<UserProgress>>> getAllProgress() {
        List<UserProgress> progress = progressService.getAllProgress();
        return ResponseEntity.ok(Response.ok("Progress retrieved successfully", progress));
    }

    /**
     * Get progress for a specific ayah
     */
    @GetMapping("/ayah/{ayahId}")
    public ResponseEntity<Response<UserProgress>> getProgressByAyah(@PathVariable Integer ayahId) {
        return progressService.getProgressByAyahId(ayahId)
                .map(progress -> ResponseEntity.ok(Response.ok("Progress found", progress)))
                .orElse(ResponseEntity.ok(Response.ok("No progress found", null)));
    }

    /**
     * Get all memorized ayahs
     */
    @GetMapping("/memorized")
    public ResponseEntity<Response<List<UserProgress>>> getMemorizedAyahs() {
        List<UserProgress> memorized = progressService.getMemorizedAyahs();
        return ResponseEntity.ok(Response.ok("Memorized ayahs retrieved", memorized));
    }

    /**
     * Get ayahs due for review
     */
    @GetMapping("/due-for-review")
    public ResponseEntity<Response<List<UserProgress>>> getDueForReview(
            @RequestParam(required = false) Integer limit) {
        List<UserProgress> dueForReview;
        if (limit != null && limit > 0) {
            dueForReview = progressService.getDueForReview(limit);
        } else {
            dueForReview = progressService.getDueForReview();
        }
        return ResponseEntity.ok(Response.ok("Due for review retrieved", dueForReview));
    }

    /**
     * Get progress by surah
     */
    @GetMapping("/surah/{surahId}")
    public ResponseEntity<Response<List<UserProgress>>> getProgressBySurah(@PathVariable Integer surahId) {
        List<UserProgress> progress = progressService.getProgressBySurah(surahId);
        return ResponseEntity.ok(Response.ok("Surah progress retrieved", progress));
    }

    /**
     * Get counts (memorized and due for review)
     */
    @GetMapping("/counts")
    public ResponseEntity<Response<Map<String, Long>>> getCounts() {
        Map<String, Long> counts = Map.of(
                "memorized", progressService.countMemorized(),
                "dueForReview", progressService.countDueForReview()
        );
        return ResponseEntity.ok(Response.ok("Counts retrieved", counts));
    }

    /**
     * Create or update progress
     */
    @PostMapping
    public ResponseEntity<Response<UserProgress>> saveProgress(@RequestBody UserProgress progress) {
        UserProgress saved = progressService.saveProgress(progress);
        return ResponseEntity.ok(Response.ok("Progress saved", saved));
    }

    /**
     * Mark ayah as memorized
     */
    @PostMapping("/memorize/{ayahId}")
    public ResponseEntity<Response<UserProgress>> markAsMemorized(
            @PathVariable Integer ayahId,
            @RequestParam Integer surahId) {
        UserProgress progress = progressService.markAsMemorized(ayahId, surahId);
        return ResponseEntity.ok(Response.ok("Ayah marked as memorized", progress));
    }

    /**
     * Remove memorized status
     */
    @DeleteMapping("/memorize/{ayahId}")
    public ResponseEntity<Response<UserProgress>> unmarkMemorized(@PathVariable Integer ayahId) {
        UserProgress progress = progressService.unmarkMemorized(ayahId);
        if (progress != null) {
            return ResponseEntity.ok(Response.ok("Memorized status removed", progress));
        }
        return ResponseEntity.ok(Response.fail(404, "Progress not found"));
    }

    /**
     * Record a review result (simple correct/incorrect)
     */
    @PostMapping("/review/{ayahId}")
    public ResponseEntity<Response<UserProgress>> recordReview(
            @PathVariable Integer ayahId,
            @RequestParam boolean correct) {
        try {
            UserProgress progress = progressService.recordReview(ayahId, correct);
            return ResponseEntity.ok(Response.ok("Review recorded", progress));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(Response.fail(404, e.getMessage()));
        }
    }

    /**
     * Record a review with quality score (0-5 for SM-2)
     */
    @PostMapping("/review/{ayahId}/quality")
    public ResponseEntity<Response<UserProgress>> recordReviewWithQuality(
            @PathVariable Integer ayahId,
            @RequestParam int quality) {
        try {
            UserProgress progress = progressService.recordReview(ayahId, quality);
            return ResponseEntity.ok(Response.ok("Review recorded", progress));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(Response.fail(404, e.getMessage()));
        }
    }

    /**
     * Update notes for an ayah
     */
    @PutMapping("/notes/{ayahId}")
    public ResponseEntity<Response<UserProgress>> updateNotes(
            @PathVariable Integer ayahId,
            @RequestBody Map<String, String> body) {
        String notes = body.get("notes");
        UserProgress progress = progressService.updateNotes(ayahId, notes);
        if (progress != null) {
            return ResponseEntity.ok(Response.ok("Notes updated", progress));
        }
        return ResponseEntity.ok(Response.fail(404, "Progress not found"));
    }

    /**
     * Delete progress for an ayah
     */
    @DeleteMapping("/{ayahId}")
    public ResponseEntity<Response<Void>> deleteProgress(@PathVariable Integer ayahId) {
        progressService.deleteProgress(ayahId);
        return ResponseEntity.ok(Response.okMessage("Progress deleted"));
    }

    /**
     * Bulk sync progress from localStorage
     */
    @PostMapping("/sync")
    public ResponseEntity<Response<List<UserProgress>>> syncProgress(
            @RequestBody List<UserProgress> progressList) {
        List<UserProgress> synced = progressService.syncProgress(progressList);
        return ResponseEntity.ok(Response.ok("Progress synced successfully", synced));
    }

    /**
     * Get progress for multiple ayahs
     */
    @PostMapping("/batch")
    public ResponseEntity<Response<List<UserProgress>>> getProgressBatch(
            @RequestBody List<Integer> ayahIds) {
        List<UserProgress> progress = progressService.getProgressByAyahIds(ayahIds);
        return ResponseEntity.ok(Response.ok("Batch progress retrieved", progress));
    }
}
