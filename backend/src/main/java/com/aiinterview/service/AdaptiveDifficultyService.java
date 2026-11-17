package com.aiinterview.service;

import com.aiinterview.dto.AdaptiveRecommendationResponse;
import com.aiinterview.dto.StartAdaptiveSessionRequest;
import com.aiinterview.model.*;
import com.aiinterview.repository.AdaptiveSessionRepository;
import com.aiinterview.repository.QuestionRepository;
import com.aiinterview.repository.UserPerformanceProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdaptiveDifficultyService {

    private final UserPerformanceProfileRepository profileRepository;
    private final QuestionRepository questionRepository;
    private final AdaptiveSessionRepository sessionRepository;

    private static final int BASE_EASY_ELO = 1050;
    private static final int BASE_MEDIUM_ELO = 1450;
    private static final int BASE_HARD_ELO = 1850;

    /**
     * Calculate Elo rating change after a submission
     */
    public int calculateRatingDelta(int currentElo, Difficulty difficulty, boolean isPassed, int totalAttempts) {
        int problemRating = switch (difficulty) {
            case EASY -> BASE_EASY_ELO;
            case MEDIUM -> BASE_MEDIUM_ELO;
            case HARD -> BASE_HARD_ELO;
        };

        // Expected score E = 1 / (1 + 10^((R_prob - R_user) / 400))
        double exponent = (problemRating - currentElo) / 400.0;
        double expectedScore = 1.0 / (1.0 + Math.pow(10.0, exponent));

        double actualScore = isPassed ? 1.0 : 0.0;

        // Dynamic K-factor: higher for early submissions, lower for seasoned users
        int kFactor = totalAttempts < 10 ? 40 : 24;

        int delta = (int) Math.round(kFactor * (actualScore - expectedScore));

        // Soft penalty mitigation on hard questions for beginners
        if (!isPassed && difficulty == Difficulty.HARD && currentElo < 1300) {
            delta = Math.max(delta, -8);
        }

        return delta;
    }

    /**
     * Determine ranking tier from Elo rating
     */
    public RankingTier computeTier(int elo) {
        if (elo < 1200) return RankingTier.BEGINNER;
        if (elo < 1500) return RankingTier.INTERMEDIATE;
        if (elo < 1800) return RankingTier.ADVANCED;
        return RankingTier.EXPERT;
    }

    /**
     * Recommend next difficulty, topic, and targeted questions
     */
    public AdaptiveRecommendationResponse getRecommendation(String userId) {
        UserPerformanceProfile profile = profileRepository.findByUserId(userId)
                .orElse(UserPerformanceProfile.builder().eloRating(1200).rankingTier(RankingTier.INTERMEDIATE).build());

        int userElo = profile.getEloRating();
        Difficulty recommendedDiff;

        if (userElo < 1250) {
            recommendedDiff = Difficulty.EASY;
        } else if (userElo < 1650) {
            recommendedDiff = Difficulty.MEDIUM;
        } else {
            recommendedDiff = Difficulty.HARD;
        }

        // Find focus topic: pick topic with lowest accuracy or unattempted high-yield topic
        String recommendedTopic = "Dynamic Programming";
        List<String> coreTopics = List.of("Arrays & Hashing", "Two Pointers", "Sliding Window", "Binary Search", "Trees", "Graphs", "Dynamic Programming");
        double lowestAccuracy = 1.0;

        if (profile.getTopicMastery() != null && !profile.getTopicMastery().isEmpty()) {
            for (Map.Entry<String, TopicStats> entry : profile.getTopicMastery().entrySet()) {
                TopicStats stats = entry.getValue();
                if (stats.getAttemptedCount() > 0 && stats.getAccuracy() < lowestAccuracy) {
                    lowestAccuracy = stats.getAccuracy();
                    recommendedTopic = entry.getKey();
                }
            }
        } else {
            recommendedTopic = "Arrays & Hashing";
        }

        // Calculate estimated probability of success on recommended difficulty
        int targetRating = switch (recommendedDiff) {
            case EASY -> BASE_EASY_ELO;
            case MEDIUM -> BASE_MEDIUM_ELO;
            case HARD -> BASE_HARD_ELO;
        };
        double prob = 1.0 / (1.0 + Math.pow(10.0, (targetRating - userElo) / 400.0));

        // Fetch candidate questions matching recommendation
        List<Question> candidates = questionRepository.findByDifficulty(recommendedDiff);
        if (candidates.isEmpty()) {
            candidates = questionRepository.findAll();
        }

        final String targetTopic = recommendedTopic;
        List<Question> filtered = new ArrayList<>();
        for (Question q : candidates) {
            if (q.getTopics().stream().anyMatch(t -> t.equalsIgnoreCase(targetTopic))) {
                filtered.add(q);
            }
        }
        if (filtered.isEmpty()) {
            filtered = candidates.subList(0, Math.min(3, candidates.size()));
        } else if (filtered.size() > 3) {
            filtered = filtered.subList(0, 3);
        }

        String reason = String.format(
                "Based on your current skill rating of %d (%s) and recent solve performance in '%s', this %s challenge provides an optimal cognitive frontier (estimated %d%% success probability).",
                userElo, profile.getRankingTier().name(), recommendedTopic, recommendedDiff.name(), (int)(prob * 100)
        );

        return AdaptiveRecommendationResponse.builder()
                .userElo(userElo)
                .userTier(profile.getRankingTier().name())
                .recommendedDifficulty(recommendedDiff)
                .recommendedTopic(recommendedTopic)
                .reason(reason)
                .estimatedSuccessProbability(Math.round(prob * 100.0) / 100.0)
                .recommendedQuestions(filtered)
                .focusAreas(List.of("Time Complexity Optimization", "Pointer Invariants", "Edge Case Boundaries"))
                .build();
    }

    /**
     * Start an Adaptive Mock Interview session
     */
    public AdaptiveSession startAdaptiveSession(String userId, StartAdaptiveSessionRequest req) {
        UserPerformanceProfile profile = profileRepository.findByUserId(userId)
                .orElse(UserPerformanceProfile.builder().eloRating(1200).build());

        String company = req.getTargetCompany() != null ? req.getTargetCompany() : "Google";
        String role = req.getTargetRole() != null ? req.getTargetRole() : "Software Engineer";

        // Select initial warmup question
        Difficulty initialDiff = profile.getEloRating() < 1300 ? Difficulty.EASY : Difficulty.MEDIUM;
        List<Question> questions = questionRepository.findByDifficulty(initialDiff);
        String warmupQId = !questions.isEmpty() ? questions.get(0).getId() : null;

        List<String> qIds = new ArrayList<>();
        if (warmupQId != null) qIds.add(warmupQId);

        AdaptiveSession session = AdaptiveSession.builder()
                .userId(userId)
                .targetCompany(company)
                .targetRole(role)
                .currentStage(InterviewStage.WARMUP)
                .stageIndex(0)
                .totalStages(3)
                .status("IN_PROGRESS")
                .startingElo(profile.getEloRating())
                .currentElo(profile.getEloRating())
                .questionIds(qIds)
                .interviewerFeedback(new ArrayList<>(List.of(
                        "Welcome to your " + company + " technical mock interview. Let's start with a warm-up coding question."
                )))
                .startTime(Instant.now())
                .build();

        return sessionRepository.save(session);
    }

    /**
     * Progress adaptive mock interview stage after code submission
     */
    public AdaptiveSession progressStage(String sessionId, boolean passed, String submissionId) {
        AdaptiveSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        if (!"IN_PROGRESS".equals(session.getStatus())) {
            return session;
        }

        if (submissionId != null) {
            session.getSubmissionIds().add(submissionId);
        }

        int currentStageIdx = session.getStageIndex();
        int newStageIdx = currentStageIdx + 1;

        if (newStageIdx >= session.getTotalStages()) {
            // Conclude interview
            session.setStatus("COMPLETED");
            session.setEndTime(Instant.now());

            int passes = (int) session.getInterviewerFeedback().stream().filter(f -> f.contains("Passed")).count() + (passed ? 1 : 0);
            int score = (int) Math.round((passes / (double) session.getTotalStages()) * 100);
            session.setOverallScore(score);

            if (score >= 90) {
                session.setFinalVerdict("STRONG_HIRE");
                session.setPerformanceSummary("Outstanding technical execution, prompt edge-case coverage, and optimal algorithmic asymptotic bounds.");
            } else if (score >= 65) {
                session.setFinalVerdict("HIRE");
                session.setPerformanceSummary("Solid problem solving and clean implementations. Good grasp of data structures.");
            } else if (score >= 35) {
                session.setFinalVerdict("LEANING_HIRE");
                session.setPerformanceSummary("Demonstrated good baseline reasoning, but struggled with optimal runtime complexity on harder constraints.");
            } else {
                session.setFinalVerdict("NO_HIRE");
                session.setPerformanceSummary("Encountered roadblocks in standard graph/DP patterns. Recommend focused practice on Medium arrays and trees.");
            }

            return sessionRepository.save(session);
        }

        // Advance to next stage dynamically
        InterviewStage nextStage = switch (newStageIdx) {
            case 1 -> InterviewStage.CORE_ALGORITHM;
            case 2 -> InterviewStage.OPTIMIZATION_VARIATION;
            default -> InterviewStage.SYSTEM_DESIGN_OR_DEEPDIVE;
        };

        // If passed previous stage, increase challenge! If failed, maintain or calibrate
        Difficulty nextDiff = passed ? Difficulty.HARD : Difficulty.MEDIUM;
        List<Question> questions = questionRepository.findByDifficulty(nextDiff);
        if (questions.isEmpty()) {
            questions = questionRepository.findAll();
        }

        // Pick question not yet used
        Question nextQ = questions.stream()
                .filter(q -> !session.getQuestionIds().contains(q.getId()))
                .findFirst()
                .orElse(questions.get(0));

        session.setStageIndex(newStageIdx);
        session.setCurrentStage(nextStage);
        session.getQuestionIds().add(nextQ.getId());

        String feedback = passed
                ? String.format("Stage %d Passed! Scaling difficulty to %s for the next challenge: '%s'.", currentStageIdx + 1, nextDiff.name(), nextQ.getTitle())
                : String.format("Stage %d completed with some edge-case gaps. Let's pivot to a calibrating %s problem: '%s'.", currentStageIdx + 1, nextDiff.name(), nextQ.getTitle());

        session.getInterviewerFeedback().add(feedback);

        return sessionRepository.save(session);
    }
}
