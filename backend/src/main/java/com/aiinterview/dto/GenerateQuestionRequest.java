package com.aiinterview.dto;

import com.aiinterview.model.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateQuestionRequest {
    private String topic; // e.g. "Dynamic Programming", "Graph", "Binary Tree", "Sliding Window"
    private Difficulty difficulty; // EASY, MEDIUM, HARD
    private String targetCompany; // e.g. "Google", "Amazon", "Meta", "Microsoft"
    private String customPrompt; // Optional prompt refinement
    private String language; // Default starter language requested
}
