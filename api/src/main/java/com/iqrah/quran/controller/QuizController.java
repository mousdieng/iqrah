package com.iqrah.quran.controller;

import com.iqrah.quran.dto.Response;
import com.iqrah.quran.entity.Ayah;
import com.iqrah.quran.entity.QuizResult;
import com.iqrah.quran.entity.QuizSession;
import com.iqrah.quran.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    /**
     * Start a new quiz session
     */
    @PostMapping("/session/start")
    public ResponseEntity<Response<QuizSession>> startSession(@RequestBody Map<String, Object> request) {
        QuizSession.QuizType quizType = QuizSession.QuizType.valueOf(
                (String) request.get("quizType"));

        Integer surahId = request.get("surahId") != null ?
                ((Number) request.get("surahId")).intValue() : null;

        Integer juzNumber = request.get("juzNumber") != null ?
                ((Number) request.get("juzNumber")).intValue() : null;

        QuizSession.DifficultyLevel difficulty = request.get("difficulty") != null ?
                QuizSession.DifficultyLevel.valueOf((String) request.get("difficulty")) : null;

        Integer questionCount = request.get("questionCount") != null ?
                ((Number) request.get("questionCount")).intValue() : 10;

        QuizSession session = quizService.startSession(quizType, surahId, juzNumber, difficulty, questionCount);
        return ResponseEntity.ok(Response.ok("Quiz session started", session));
    }

    /**
     * Complete a quiz session
     */
    @PutMapping("/session/{sessionId}/complete")
    public ResponseEntity<Response<QuizSession>> completeSession(@PathVariable Long sessionId) {
        try {
            QuizSession session = quizService.completeSession(sessionId);
            return ResponseEntity.ok(Response.ok("Quiz session completed", session));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(Response.fail(404, e.getMessage()));
        }
    }

    /**
     * Get session by ID
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<Response<QuizSession>> getSession(@PathVariable Long sessionId) {
        return quizService.getSession(sessionId)
                .map(session -> ResponseEntity.ok(Response.ok("Session found", session)))
                .orElse(ResponseEntity.ok(Response.fail(404, "Session not found")));
    }

    /**
     * Get session results
     */
    @GetMapping("/session/{sessionId}/results")
    public ResponseEntity<Response<List<QuizResult>>> getSessionResults(@PathVariable Long sessionId) {
        List<QuizResult> results = quizService.getSessionResults(sessionId);
        return ResponseEntity.ok(Response.ok("Results retrieved", results));
    }

    /**
     * Submit an answer
     */
    @PostMapping("/answer")
    public ResponseEntity<Response<QuizResult>> submitAnswer(@RequestBody Map<String, Object> request) {
        Long sessionId = ((Number) request.get("sessionId")).longValue();
        Integer ayahId = ((Number) request.get("ayahId")).intValue();
        QuizSession.QuizType quizType = QuizSession.QuizType.valueOf((String) request.get("quizType"));
        String userAnswer = (String) request.get("userAnswer");
        String correctAnswer = (String) request.get("correctAnswer");
        boolean isCorrect = (Boolean) request.get("isCorrect");

        Integer timeTakenSeconds = request.get("timeTakenSeconds") != null ?
                ((Number) request.get("timeTakenSeconds")).intValue() : null;

        Integer hintsUsed = request.get("hintsUsed") != null ?
                ((Number) request.get("hintsUsed")).intValue() : 0;

        try {
            QuizResult result = quizService.submitAnswer(sessionId, ayahId, quizType,
                    userAnswer, correctAnswer, isCorrect, timeTakenSeconds, hintsUsed);
            return ResponseEntity.ok(Response.ok("Answer submitted", result));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(Response.fail(400, e.getMessage()));
        }
    }

    /**
     * Validate an answer (server-side validation with Arabic normalization)
     */
    @PostMapping("/validate")
    public ResponseEntity<Response<Map<String, Object>>> validateAnswer(@RequestBody Map<String, String> request) {
        String userAnswer = request.get("userAnswer");
        String correctAnswer = request.get("correctAnswer");

        boolean isCorrect = quizService.validateAnswer(userAnswer, correctAnswer);

        Map<String, Object> result = Map.of(
                "isCorrect", isCorrect,
                "userAnswer", userAnswer,
                "correctAnswer", correctAnswer
        );

        return ResponseEntity.ok(Response.ok("Validation complete", result));
    }

    /**
     * Get recent completed sessions
     */
    @GetMapping("/sessions/recent")
    public ResponseEntity<Response<List<QuizSession>>> getRecentSessions(
            @RequestParam(defaultValue = "10") int limit) {
        List<QuizSession> sessions = quizService.getRecentSessions(limit);
        return ResponseEntity.ok(Response.ok("Recent sessions retrieved", sessions));
    }

    /**
     * Get ayahs for quiz from memorized collection
     */
    @GetMapping("/ayahs")
    public ResponseEntity<Response<List<Ayah>>> getAyahsForQuiz(
            @RequestParam(required = false) Integer surahId,
            @RequestParam(required = false) Integer juzNumber,
            @RequestParam(defaultValue = "10") int count) {
        List<Ayah> ayahs = quizService.getAyahsForQuiz(surahId, juzNumber, count);
        return ResponseEntity.ok(Response.ok("Quiz ayahs retrieved", ayahs));
    }

    /**
     * Get ayahs due for review for quiz
     */
    @GetMapping("/ayahs/due")
    public ResponseEntity<Response<List<Ayah>>> getDueAyahsForQuiz(
            @RequestParam(defaultValue = "10") int count) {
        List<Ayah> ayahs = quizService.getDueAyahsForQuiz(count);
        return ResponseEntity.ok(Response.ok("Due ayahs retrieved", ayahs));
    }

    /**
     * Generate fill-in-the-blank question
     */
    @GetMapping("/fill-blank/{ayahId}")
    public ResponseEntity<Response<Map<String, Object>>> getFillBlankQuestion(
            @PathVariable Integer ayahId,
            @RequestParam(defaultValue = "MEDIUM") String difficulty) {
        try {
            QuizSession.DifficultyLevel level = QuizSession.DifficultyLevel.valueOf(difficulty);
            Map<String, Object> question = quizService.generateFillBlankQuestion(ayahId, level);
            return ResponseEntity.ok(Response.ok("Fill-blank question generated", question));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(Response.fail(404, e.getMessage()));
        }
    }

    /**
     * Generate sequence ordering question
     */
    @GetMapping("/sequence/{startAyahId}")
    public ResponseEntity<Response<Map<String, Object>>> getSequenceQuestion(
            @PathVariable Integer startAyahId,
            @RequestParam(defaultValue = "4") int count) {
        Map<String, Object> question = quizService.generateSequenceQuestion(startAyahId, count);
        return ResponseEntity.ok(Response.ok("Sequence question generated", question));
    }

    /**
     * Generate writing question
     */
    @GetMapping("/writing/{ayahId}")
    public ResponseEntity<Response<Map<String, Object>>> getWritingQuestion(@PathVariable Integer ayahId) {
        try {
            Map<String, Object> question = quizService.generateWritingQuestion(ayahId);
            return ResponseEntity.ok(Response.ok("Writing question generated", question));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(Response.fail(404, e.getMessage()));
        }
    }

    /**
     * Get accuracy by quiz type
     */
    @GetMapping("/accuracy/{quizType}")
    public ResponseEntity<Response<Map<String, Object>>> getAccuracyByType(@PathVariable String quizType) {
        try {
            QuizSession.QuizType type = QuizSession.QuizType.valueOf(quizType);
            Double accuracy = quizService.getAccuracyByQuizType(type);

            Map<String, Object> result = Map.of(
                    "quizType", quizType,
                    "accuracy", accuracy != null ? accuracy : 0.0
            );

            return ResponseEntity.ok(Response.ok("Accuracy retrieved", result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(Response.fail(400, "Invalid quiz type"));
        }
    }

    /**
     * Get most difficult ayahs
     */
    @GetMapping("/difficult-ayahs")
    public ResponseEntity<Response<List<Map<String, Object>>>> getMostDifficultAyahs(
            @RequestParam(defaultValue = "10") int limit) {
        List<Map<String, Object>> difficult = quizService.getMostDifficultAyahs(limit);
        return ResponseEntity.ok(Response.ok("Difficult ayahs retrieved", difficult));
    }
}
