package com.aiinterview.dto;

import com.aiinterview.model.Difficulty;
import com.aiinterview.model.Question;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdaptiveRecommendationResponse {
    private int userElo;
    private String userTier;
    private Difficulty recommendedDifficulty;
    private String recommendedTopic;
    private String reason; // AI/ML rationale for recommendation
    private double estimatedSuccessProbability;
    @Builder.Default
    private List<Question> recommendedQuestions = new ArrayList<>();
    @Builder.Default
    private List<String> focusAreas = new ArrayList<>();
}
