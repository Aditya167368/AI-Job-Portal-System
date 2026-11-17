package com.aiinterview.dto;

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
public class AiReviewResponse {
    private int overallScore; // 0 to 100
    private String timeComplexity;
    private String spaceComplexity;
    private String optimalityVerdict; // Optimal, Sub-optimal, Brute-force
    @Builder.Default
    private List<String> positivePoints = new ArrayList<>();
    @Builder.Default
    private List<String> improvementAreas = new ArrayList<>();
    @Builder.Default
    private List<String> edgeCasesToConsider = new ArrayList<>();
    private String refactoredCodeSnippet;
    private String generalSummary;
}
