package com.aiinterview.dto;

import com.aiinterview.model.Difficulty;
import com.aiinterview.model.RankingTier;
import com.aiinterview.model.Submission;
import com.aiinterview.model.TopicStats;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private int eloRating;
    private int peakRating;
    private RankingTier rankingTier;
    private int totalSolved;
    private int easySolved;
    private int mediumSolved;
    private int hardSolved;
    private int totalSubmissions;
    private int acceptedSubmissions;
    private double acceptanceRate;
    private int currentStreak;
    private int longestStreak;
    @Builder.Default
    private Map<String, TopicStats> topicMastery = new HashMap<>();
    @Builder.Default
    private List<Integer> ratingHistory = new ArrayList<>();
    @Builder.Default
    private Map<String, Integer> activityCalendar = new HashMap<>();
    @Builder.Default
    private List<Submission> recentSubmissions = new ArrayList<>();
    private int totalAvailableQuestions;
    private double percentileRank;
}
