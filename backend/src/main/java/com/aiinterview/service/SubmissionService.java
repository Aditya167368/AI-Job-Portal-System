package com.aiinterview.service;

import com.aiinterview.dto.CodeRunRequest;
import com.aiinterview.dto.CodeRunResponse;
import com.aiinterview.dto.CodeSubmitRequest;
import com.aiinterview.model.*;
import com.aiinterview.repository.QuestionRepository;
import com.aiinterview.repository.SubmissionRepository;
import com.aiinterview.repository.UserPerformanceProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final QuestionRepository questionRepository;
    private final UserPerformanceProfileRepository profileRepository;
    private final CodeExecutionService codeExecutionService;
    private final AdaptiveDifficultyService adaptiveService;

    /**
     * Run visible/custom test cases without recording formal submission
     */
    public CodeRunResponse runCode(CodeRunRequest request) {
        Question question = questionRepository.findById(request.getQuestionId())
                .or(() -> questionRepository.findBySlug(request.getQuestionId()))
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        List<TestCase> casesToRun = new ArrayList<>();
        if (request.getCustomTestCases() != null && !request.getCustomTestCases().isEmpty()) {
            casesToRun.addAll(request.getCustomTestCases());
        } else {
            // Run visible test cases
            for (TestCase tc : question.getTestCases()) {
                if (!tc.isHidden()) {
                    casesToRun.add(tc);
                }
            }
            if (casesToRun.isEmpty()) {
                casesToRun.addAll(question.getTestCases());
            }
        }

        return codeExecutionService.execute(request, casesToRun);
    }

    /**
     * Submit code against full test suite and update user performance metrics and Elo rating
     */
    public Submission submitCode(String userId, String username, CodeSubmitRequest request) {
        Question question = questionRepository.findById(request.getQuestionId())
                .or(() -> questionRepository.findBySlug(request.getQuestionId()))
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        // Execute against all test cases
        CodeRunRequest runRequest = CodeRunRequest.builder()
                .questionId(question.getId())
                .language(request.getLanguage())
                .code(request.getCode())
                .build();

        CodeRunResponse runResponse = codeExecutionService.execute(runRequest, question.getTestCases());

        boolean isAccepted = runResponse.getStatus() == SubmissionStatus.ACCEPTED;

        Submission submission = Submission.builder()
                .userId(userId)
                .username(username)
                .questionId(question.getId())
                .questionTitle(question.getTitle())
                .difficulty(question.getDifficulty())
                .language(request.getLanguage())
                .code(request.getCode())
                .status(runResponse.getStatus())
                .runtimeMs(runResponse.getRuntimeMs())
                .memoryMb(runResponse.getMemoryMb())
                .passedTests(runResponse.getPassedTests())
                .totalTests(runResponse.getTotalTests())
                .testResults(runResponse.getTestResults())
                .aiFeedback(isAccepted ? "Accepted! Code successfully passed all test cases with optimal execution." : "Solution failed on some test cases. Review output differences.")
                .timeComplexityEstimate(question.getTimeComplexity())
                .spaceComplexityEstimate(question.getSpaceComplexity())
                .createdAt(Instant.now())
                .build();

        Submission savedSubmission = submissionRepository.save(submission);

        // Update Question statistics
        question.setTotalSubmissions(question.getTotalSubmissions() + 1);
        if (isAccepted) {
            question.setAcceptedSubmissions(question.getAcceptedSubmissions() + 1);
        }
        if (question.getTotalSubmissions() > 0) {
            question.setAcceptanceRate(Math.round(((double) question.getAcceptedSubmissions() / question.getTotalSubmissions()) * 1000.0) / 10.0);
        }
        questionRepository.save(question);

        // Update User Performance Profile
        if (userId != null && !userId.isBlank()) {
            updateUserProfileOnSubmission(userId, question, isAccepted);
        }

        return savedSubmission;
    }

    private void updateUserProfileOnSubmission(String userId, Question question, boolean isAccepted) {
        UserPerformanceProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> UserPerformanceProfile.builder().userId(userId).build());

        // Check if previously solved
        List<Submission> priorSubmissions = submissionRepository.findByUserIdAndQuestionId(userId, question.getId());
        boolean previouslySolved = priorSubmissions.stream().anyMatch(s -> s.getStatus() == SubmissionStatus.ACCEPTED);

        profile.setTotalSubmissions(profile.getTotalSubmissions() + 1);
        if (isAccepted) {
            profile.setAcceptedSubmissions(profile.getAcceptedSubmissions() + 1);
        }
        profile.setAcceptanceRate(Math.round(((double) profile.getAcceptedSubmissions() / profile.getTotalSubmissions()) * 1000.0) / 10.0);

        // Increment solve count if first time solved
        if (isAccepted && !previouslySolved) {
            profile.setTotalSolved(profile.getTotalSolved() + 1);
            if (question.getDifficulty() == Difficulty.EASY) profile.setEasySolved(profile.getEasySolved() + 1);
            else if (question.getDifficulty() == Difficulty.MEDIUM) profile.setMediumSolved(profile.getMediumSolved() + 1);
            else if (question.getDifficulty() == Difficulty.HARD) profile.setHardSolved(profile.getHardSolved() + 1);

            // Update topic mastery
            if (profile.getTopicMastery() == null) profile.setTopicMastery(new HashMap<>());
            for (String topic : question.getTopics()) {
                TopicStats stats = profile.getTopicMastery().getOrDefault(topic, TopicStats.builder().topic(topic).build());
                stats.setSolvedCount(stats.getSolvedCount() + 1);
                stats.setAttemptedCount(stats.getAttemptedCount() + 1);
                stats.setAccuracy(Math.round(((double) stats.getSolvedCount() / stats.getAttemptedCount()) * 100.0) / 100.0);
                stats.setMasteryScore(Math.min(100, stats.getSolvedCount() * 20));
                profile.getTopicMastery().put(topic, stats);
            }
        } else if (!isAccepted && !previouslySolved) {
            if (profile.getTopicMastery() == null) profile.setTopicMastery(new HashMap<>());
            for (String topic : question.getTopics()) {
                TopicStats stats = profile.getTopicMastery().getOrDefault(topic, TopicStats.builder().topic(topic).build());
                stats.setAttemptedCount(stats.getAttemptedCount() + 1);
                stats.setAccuracy(Math.round(((double) stats.getSolvedCount() / stats.getAttemptedCount()) * 100.0) / 100.0);
                profile.getTopicMastery().put(topic, stats);
            }
        }

        // Elo Rating Delta
        int eloDelta = adaptiveService.calculateRatingDelta(profile.getEloRating(), question.getDifficulty(), isAccepted, profile.getTotalSubmissions());
        int newElo = Math.max(600, Math.min(2800, profile.getEloRating() + eloDelta));
        profile.setEloRating(newElo);
        if (newElo > profile.getPeakRating()) {
            profile.setPeakRating(newElo);
        }
        profile.setRankingTier(adaptiveService.computeTier(newElo));

        if (profile.getRecentRatingChanges() == null) {
            profile.setRecentRatingChanges(new ArrayList<>());
        }
        profile.getRecentRatingChanges().add(newElo);
        if (profile.getRecentRatingChanges().size() > 20) {
            profile.getRecentRatingChanges().remove(0);
        }

        // Activity Calendar & Streak
        String todayStr = LocalDate.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_LOCAL_DATE);
        if (profile.getActivityCalendar() == null) {
            profile.setActivityCalendar(new HashMap<>());
        }
        profile.getActivityCalendar().put(todayStr, profile.getActivityCalendar().getOrDefault(todayStr, 0) + 1);

        // Calculate Streak
        if (profile.getLastSubmissionDate() == null) {
            profile.setCurrentStreak(1);
            profile.setLongestStreak(1);
        } else {
            LocalDate lastDate = profile.getLastSubmissionDate().atZone(ZoneOffset.UTC).toLocalDate();
            LocalDate today = LocalDate.now(ZoneOffset.UTC);
            if (lastDate.equals(today.minusDays(1))) {
                profile.setCurrentStreak(profile.getCurrentStreak() + 1);
                if (profile.getCurrentStreak() > profile.getLongestStreak()) {
                    profile.setLongestStreak(profile.getCurrentStreak());
                }
            } else if (!lastDate.equals(today)) {
                profile.setCurrentStreak(1);
            }
        }

        profile.setLastSubmissionDate(Instant.now());
        profile.setUpdatedAt(Instant.now());
        profileRepository.save(profile);
    }

    public Page<Submission> getUserSubmissions(String userId, int page, int size) {
        return submissionRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }
}
