package com.aiinterview.dto;

import com.aiinterview.model.RankingTier;
import com.aiinterview.model.Role;
import com.aiinterview.model.TopicStats;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private Set<Role> roles;
    private List<String> targetCompanies;
    private String preferredLanguage;
    private int eloRating;
    private int peakRating;
    private RankingTier rankingTier;
    private int totalSolved;
    private int easySolved;
    private int mediumSolved;
    private int hardSolved;
    private int totalSubmissions;
    private double acceptanceRate;
    private int currentStreak;
    private int longestStreak;
    private Map<String, TopicStats> topicMastery;
    private Instant createdAt;
}
