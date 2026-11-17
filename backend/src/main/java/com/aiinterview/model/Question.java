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
@Document(collection = "questions")
public class Question {

    @Id
    private String id;

    @Indexed(unique = true)
    private String slug;

    private String title;

    private Difficulty difficulty;

    @Builder.Default
    private List<String> topics = new ArrayList<>();

    @Builder.Default
    private List<String> companies = new ArrayList<>();

    private String descriptionMarkdown;

    private String inputFormat;

    private String outputFormat;

    @Builder.Default
    private List<String> constraints = new ArrayList<>();

    @Builder.Default
    private List<Example> examples = new ArrayList<>();

    @Builder.Default
    private Map<String, String> starterCode = new HashMap<>();

    @Builder.Default
    private List<TestCase> testCases = new ArrayList<>();

    @Builder.Default
    private List<String> hints = new ArrayList<>();

    private String solutionApproach;

    private String timeComplexity;

    private String spaceComplexity;

    @Builder.Default
    private boolean isAiGenerated = false;

    private String generatedPrompt;

    @Builder.Default
    private int totalSubmissions = 0;

    @Builder.Default
    private int acceptedSubmissions = 0;

    @Builder.Default
    private double acceptanceRate = 0.0;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
