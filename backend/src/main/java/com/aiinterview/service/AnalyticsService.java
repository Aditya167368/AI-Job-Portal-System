package com.aiinterview.service;

import com.aiinterview.dto.DashboardStatsResponse;
import com.aiinterview.model.Submission;
import com.aiinterview.model.TopicStats;
import com.aiinterview.model.UserPerformanceProfile;
import com.aiinterview.repository.QuestionRepository;
import com.aiinterview.repository.SubmissionRepository;
import com.aiinterview.repository.UserPerformanceProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserPerformanceProfileRepository profileRepository;
    private final SubmissionRepository submissionRepository;
    private final QuestionRepository questionRepository;

    public DashboardStatsResponse getDashboardStats(String userId) {
        UserPerformanceProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> UserPerformanceProfile.builder()
                        .userId(userId)
                        .eloRating(1200)
                        .peakRating(1200)
                        .build());

        long totalQuestions = questionRepository.count();
        List<Submission> recents = submissionRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);

        // Compute Percentile
        List<UserPerformanceProfile> allProfiles = profileRepository.findAll();
        double percentile = 50.0;
        if (!allProfiles.isEmpty()) {
            long lowerCount = allProfiles.stream().filter(p -> p.getEloRating() <= profile.getEloRating()).count();
            percentile = Math.round(((double) lowerCount / allProfiles.size()) * 1000.0) / 10.0;
        }

        Map<String, TopicStats> topicMastery = profile.getTopicMastery();
        if (topicMastery == null || topicMastery.isEmpty()) {
            topicMastery = defaultTopicStats();
        }

        List<Integer> ratingHistory = profile.getRecentRatingChanges();
        if (ratingHistory == null || ratingHistory.isEmpty()) {
            ratingHistory = List.of(1200);
        }

        return DashboardStatsResponse.builder()
                .eloRating(profile.getEloRating())
                .peakRating(profile.getPeakRating())
                .rankingTier(profile.getRankingTier())
                .totalSolved(profile.getTotalSolved())
                .easySolved(profile.getEasySolved())
                .mediumSolved(profile.getMediumSolved())
                .hardSolved(profile.getHardSolved())
                .totalSubmissions(profile.getTotalSubmissions())
                .acceptedSubmissions(profile.getAcceptedSubmissions())
                .acceptanceRate(profile.getAcceptanceRate())
                .currentStreak(profile.getCurrentStreak())
                .longestStreak(profile.getLongestStreak())
                .topicMastery(topicMastery)
                .ratingHistory(ratingHistory)
                .activityCalendar(profile.getActivityCalendar() != null ? profile.getActivityCalendar() : new HashMap<>())
                .recentSubmissions(recents)
                .totalAvailableQuestions((int) totalQuestions)
                .percentileRank(percentile)
                .build();
    }

    public List<UserPerformanceProfile> getLeaderboard() {
        return profileRepository.findTop10ByOrderByEloRatingDesc();
    }

    private Map<String, TopicStats> defaultTopicStats() {
        Map<String, TopicStats> defaults = new LinkedHashMap<>();
        List<String> coreTopics = List.of("Arrays & Hashing", "Two Pointers", "Sliding Window", "Stack", "Trees", "Graphs", "Dynamic Programming");
        for (String topic : coreTopics) {
            defaults.put(topic, TopicStats.builder().topic(topic).solvedCount(0).attemptedCount(0).accuracy(0.0).masteryScore(0).build());
        }
        return defaults;
    }
}
