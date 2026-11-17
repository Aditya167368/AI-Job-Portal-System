package com.aiinterview.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_performance_profiles")
public class UserPerformanceProfile {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String username;

    @Builder.Default
    private int eloRating = 1200;

    @Builder.Default
    private int peakRating = 1200;

    @Builder.Default
    private RankingTier rankingTier = RankingTier.INTERMEDIATE;

    @Builder.Default
    private int totalSolved = 0;

    @Builder.Default
    private int easySolved = 0;

    @Builder.Default
    private int mediumSolved = 0;

    @Builder.Default
    private int hardSolved = 0;

    @Builder.Default
    private int totalSubmissions = 0;

    @Builder.Default
    private int acceptedSubmissions = 0;

    @Builder.Default
    private double acceptanceRate = 0.0;

    @Builder.Default
    private Map<String, TopicStats> topicMastery = new HashMap<>();

    @Builder.Default
    private int currentStreak = 0;

    @Builder.Default
    private int longestStreak = 0;

    private Instant lastSubmissionDate;

    @Builder.Default
    private List<Integer> recentRatingChanges = new ArrayList<>();

    // Key: "YYYY-MM-DD", Value: submission count
    @Builder.Default
    private Map<String, Integer> activityCalendar = new HashMap<>();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
