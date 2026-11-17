package com.aiinterview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiHintResponse {
    private String hint;
    private int hintLevel;
    private String recommendedTechnique;
    private String timeComplexityTarget;
    private String spaceComplexityTarget;
}
