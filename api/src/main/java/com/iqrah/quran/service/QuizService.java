package com.iqrah.quran.service;

import com.iqrah.quran.entity.Ayah;
import com.iqrah.quran.entity.QuizResult;
import com.iqrah.quran.entity.QuizSession;
import com.iqrah.quran.entity.UserProgress;
import com.iqrah.quran.repository.AyahRepository;
import com.iqrah.quran.repository.QuizResultRepository;
import com.iqrah.quran.repository.QuizSessionRepository;
import com.iqrah.quran.repository.UserProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizService {

    @Autowired
    private QuizSessionRepository sessionRepository;

    @Autowired
    private QuizResultRepository resultRepository;

    @Autowired
    private AyahRepository ayahRepository;

    @Autowired
    private UserProgressRepository progressRepository;

    @Autowired
    private ProgressService progressService;

    /**
     * Start a new quiz session
     */
    @Transactional
    public QuizSession startSession(QuizSession.QuizType quizType, Integer surahId, Integer juzNumber,
                                    QuizSession.DifficultyLevel difficulty, Integer questionCount) {
        QuizSession session = QuizSession.builder()
                .quizType(quizType)
                .surahId(surahId)
                .juzNumber(juzNumber)
                .difficultyLevel(difficulty != null ? difficulty : QuizSession.DifficultyLevel.MIXED)
                .totalQuestions(questionCount)
                .build();

        return sessionRepository.save(session);
    }

    /**
     * Complete a quiz session and calculate score
     */
    @Transactional
    public QuizSession completeSession(Long sessionId) {
        QuizSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        // Count correct answers from results
        Long correctCount = resultRepository.countBySessionIdAndIsCorrectTrue(sessionId);
        session.setCorrectAnswers(correctCount != null ? correctCount.intValue() : 0);

        session.complete();
        return sessionRepository.save(session);
    }

    /**
     * Submit an answer for a quiz question
     */
    @Transactional
    public QuizResult submitAnswer(Long sessionId, Integer ayahId, QuizSession.QuizType quizType,
                                   String userAnswer, String correctAnswer, boolean isCorrect,
                                   Integer timeTakenSeconds, Integer hintsUsed) {
        // Get session to validate it exists
        QuizSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        // Create quiz result
        QuizResult result = QuizResult.builder()
                .sessionId(sessionId)
                .ayahId(ayahId)
                .quizType(quizType)
                .userAnswer(userAnswer)
                .correctAnswer(correctAnswer)
                .isCorrect(isCorrect)
                .timeTakenSeconds(timeTakenSeconds)
                .hintsUsed(hintsUsed != null ? hintsUsed : 0)
                .build();

        QuizResult savedResult = resultRepository.save(result);

        // Update session correct count
        if (isCorrect) {
            session.addCorrectAnswer();
            sessionRepository.save(session);
        }

        // Update spaced repetition for this ayah if progress exists
        progressRepository.findByAyahId(ayahId).ifPresent(progress -> {
            // Map correct/incorrect to quality score (4 for correct, 1 for incorrect)
            int quality = isCorrect ? 4 : 1;
            progressService.recordReview(ayahId, quality);
        });

        return savedResult;
    }

    /**
     * Get session by ID
     */
    public Optional<QuizSession> getSession(Long sessionId) {
        return sessionRepository.findById(sessionId);
    }

    /**
     * Get session results
     */
    public List<QuizResult> getSessionResults(Long sessionId) {
        return resultRepository.findBySessionId(sessionId);
    }

    /**
     * Get recent completed sessions
     */
    public List<QuizSession> getRecentSessions(int limit) {
        return sessionRepository.findRecentCompleted(limit);
    }

    /**
     * Get ayahs for quiz from memorized collection
     */
    public List<Ayah> getAyahsForQuiz(Integer surahId, Integer juzNumber, int count) {
        List<UserProgress> memorized;

        if (surahId != null) {
            // Get memorized ayahs from specific surah
            memorized = progressRepository.findBySurahIdAndMemorizedTrue(surahId);
        } else if (juzNumber != null) {
            // Get memorized ayahs from specific juz
            List<Ayah> juzAyahs = ayahRepository.findAyahsByJuz(juzNumber);
            List<Integer> juzAyahIds = juzAyahs.stream().map(Ayah::getId).collect(Collectors.toList());
            memorized = progressRepository.findByAyahIdIn(juzAyahIds).stream()
                    .filter(UserProgress::getMemorized)
                    .collect(Collectors.toList());
        } else {
            // Get all memorized ayahs
            memorized = progressRepository.findByMemorizedTrue();
        }

        // Shuffle and limit
        Collections.shuffle(memorized);
        List<Integer> selectedAyahIds = memorized.stream()
                .limit(count)
                .map(UserProgress::getAyahId)
                .collect(Collectors.toList());

        // Fetch full ayah objects
        return ayahRepository.findAllById(selectedAyahIds);
    }

    /**
     * Get ayahs due for review for quiz
     */
    public List<Ayah> getDueAyahsForQuiz(int count) {
        List<UserProgress> due = progressRepository.findDueForReviewWithLimit(LocalDateTime.now(), count);
        List<Integer> ayahIds = due.stream()
                .map(UserProgress::getAyahId)
                .collect(Collectors.toList());
        return ayahRepository.findAllById(ayahIds);
    }

    /**
     * Generate fill-in-the-blank question for an ayah
     * Returns a map with the ayah text with blanks and the words that were hidden
     */
    public Map<String, Object> generateFillBlankQuestion(Integer ayahId, QuizSession.DifficultyLevel difficulty) {
        Ayah ayah = ayahRepository.findById(ayahId)
                .orElseThrow(() -> new RuntimeException("Ayah not found: " + ayahId));

        String text = ayah.getText();
        String[] words = text.split("\\s+");

        // Determine how many words to hide based on difficulty
        double hidePercentage;
        switch (difficulty) {
            case EASY:
                hidePercentage = 0.2;
                break;
            case HARD:
                hidePercentage = 0.5;
                break;
            case MEDIUM:
            default:
                hidePercentage = 0.35;
                break;
        }

        int wordsToHide = Math.max(1, (int) (words.length * hidePercentage));

        // Randomly select word indices to hide
        List<Integer> indices = new ArrayList<>();
        for (int i = 0; i < words.length; i++) {
            indices.add(i);
        }
        Collections.shuffle(indices);
        List<Integer> hiddenIndices = indices.subList(0, Math.min(wordsToHide, indices.size()));
        Collections.sort(hiddenIndices);

        // Build the text with blanks and collect hidden words
        List<Map<String, Object>> blanks = new ArrayList<>();
        StringBuilder textWithBlanks = new StringBuilder();

        for (int i = 0; i < words.length; i++) {
            if (hiddenIndices.contains(i)) {
                textWithBlanks.append("______");
                Map<String, Object> blank = new HashMap<>();
                blank.put("index", i);
                blank.put("word", words[i]);
                blanks.add(blank);
            } else {
                textWithBlanks.append(words[i]);
            }
            if (i < words.length - 1) {
                textWithBlanks.append(" ");
            }
        }

        Map<String, Object> question = new HashMap<>();
        question.put("ayahId", ayahId);
        question.put("surahId", ayah.getSurah().getId());
        question.put("surahName", ayah.getSurah().getName());
        question.put("ayahNumber", ayah.getNumberInSurah());
        question.put("originalText", text);
        question.put("textWithBlanks", textWithBlanks.toString());
        question.put("blanks", blanks);
        question.put("totalWords", words.length);

        return question;
    }

    /**
     * Generate sequence ordering question
     * Returns consecutive ayahs in scrambled order
     */
    public Map<String, Object> generateSequenceQuestion(Integer startAyahId, int count) {
        List<Ayah> ayahs = new ArrayList<>();
        int currentId = startAyahId;

        for (int i = 0; i < count; i++) {
            Optional<Ayah> ayah = ayahRepository.findById(currentId);
            if (ayah.isPresent()) {
                ayahs.add(ayah.get());
                currentId++;
            } else {
                break;
            }
        }

        // Create correct order list
        List<Map<String, Object>> correctOrder = new ArrayList<>();
        for (int i = 0; i < ayahs.size(); i++) {
            Ayah a = ayahs.get(i);
            Map<String, Object> item = new HashMap<>();
            item.put("id", a.getId());
            item.put("text", a.getText());
            item.put("position", i);
            correctOrder.add(item);
        }

        // Create scrambled order
        List<Map<String, Object>> scrambledOrder = new ArrayList<>(correctOrder);
        Collections.shuffle(scrambledOrder);

        Map<String, Object> question = new HashMap<>();
        question.put("startAyahId", startAyahId);
        question.put("count", ayahs.size());
        question.put("scrambledAyahs", scrambledOrder);
        question.put("correctOrder", correctOrder);

        if (!ayahs.isEmpty()) {
            question.put("surahId", ayahs.get(0).getSurah().getId());
            question.put("surahName", ayahs.get(0).getSurah().getName());
        }

        return question;
    }

    /**
     * Generate writing question (just the reference, user writes from memory)
     */
    public Map<String, Object> generateWritingQuestion(Integer ayahId) {
        Ayah ayah = ayahRepository.findById(ayahId)
                .orElseThrow(() -> new RuntimeException("Ayah not found: " + ayahId));

        String[] words = ayah.getText().split("\\s+");

        Map<String, Object> question = new HashMap<>();
        question.put("ayahId", ayahId);
        question.put("surahId", ayah.getSurah().getId());
        question.put("surahName", ayah.getSurah().getName());
        question.put("ayahNumber", ayah.getNumberInSurah());
        question.put("correctText", ayah.getText());
        question.put("wordCount", words.length);
        // Progressive hints
        question.put("firstWord", words.length > 0 ? words[0] : "");
        question.put("firstLetters", getFirstLetters(words));

        return question;
    }

    /**
     * Get first letter of each word as a hint
     */
    private String getFirstLetters(String[] words) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            if (words[i].length() > 0) {
                sb.append(words[i].charAt(0));
            }
            if (i < words.length - 1) {
                sb.append(" ");
            }
        }
        return sb.toString();
    }

    /**
     * Validate an answer with Arabic normalization
     */
    public boolean validateAnswer(String userAnswer, String correctAnswer) {
        String normalizedUser = normalizeArabic(userAnswer);
        String normalizedCorrect = normalizeArabic(correctAnswer);
        return normalizedUser.equals(normalizedCorrect);
    }

    /**
     * Normalize Arabic text for comparison
     * Removes tashkeel (diacritics), normalizes hamza forms, etc.
     */
    private String normalizeArabic(String text) {
        if (text == null) return "";

        return text
                // Remove tashkeel (diacritics)
                .replaceAll("[\\u064B-\\u065F]", "")
                // Remove superscript alef
                .replaceAll("[\\u0670]", "")
                // Normalize alef with hamza forms to plain alef
                .replace("أ", "ا")
                .replace("إ", "ا")
                .replace("آ", "ا")
                .replace("ٱ", "ا")
                // Normalize taa marbuta to haa
                .replace("ة", "ه")
                // Normalize alef maksura to yaa
                .replace("ى", "ي")
                // Remove tatweel (kashida)
                .replace("ـ", "")
                // Normalize whitespace
                .replaceAll("\\s+", " ")
                .trim();
    }

    /**
     * Calculate accuracy percentage for quiz type
     */
    public Double getAccuracyByQuizType(QuizSession.QuizType quizType) {
        return sessionRepository.calculateAverageScoreByType(quizType);
    }

    /**
     * Get most difficult ayahs (most failed in quizzes)
     */
    public List<Map<String, Object>> getMostDifficultAyahs(int limit) {
        List<Object[]> results = resultRepository.findMostDifficultAyahs(limit);
        List<Map<String, Object>> difficult = new ArrayList<>();

        for (Object[] row : results) {
            Integer ayahId = (Integer) row[0];
            Long failCount = (Long) row[1];

            ayahRepository.findById(ayahId).ifPresent(ayah -> {
                Map<String, Object> item = new HashMap<>();
                item.put("ayahId", ayahId);
                item.put("surahId", ayah.getSurah().getId());
                item.put("surahName", ayah.getSurah().getName());
                item.put("ayahNumber", ayah.getNumberInSurah());
                item.put("text", ayah.getText());
                item.put("failCount", failCount);
                difficult.add(item);
            });
        }

        return difficult;
    }
}
