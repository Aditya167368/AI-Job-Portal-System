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
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "submissions")
public class Submission {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String username;

    @Indexed
    private String questionId;

    private String questionTitle;

    private Difficulty difficulty;

    private String language;

    private String code;

    private SubmissionStatus status;

    private long runtimeMs;

    private double memoryMb;

    private int passedTests;

    private int totalTests;

    @Builder.Default
    private List<TestResult> testResults = new ArrayList<>();

    private String aiFeedback;

    private String timeComplexityEstimate;

    private String spaceComplexityEstimate;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
