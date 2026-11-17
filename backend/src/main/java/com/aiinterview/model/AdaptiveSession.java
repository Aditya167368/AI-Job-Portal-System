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
@Document(collection = "adaptive_sessions")
public class AdaptiveSession {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String targetCompany;

    private String targetRole;

    @Builder.Default
    private InterviewStage currentStage = InterviewStage.WARMUP;

    @Builder.Default
    private int stageIndex = 0;

    @Builder.Default
    private int totalStages = 3;

    @Builder.Default
    private String status = "IN_PROGRESS"; // IN_PROGRESS, COMPLETED, ABANDONED

    private int startingElo;

    private int currentElo;

    private int endingElo;

    @Builder.Default
    private List<String> questionIds = new ArrayList<>();

    @Builder.Default
    private List<String> submissionIds = new ArrayList<>();

    @Builder.Default
    private List<String> interviewerFeedback = new ArrayList<>();

    @Builder.Default
    private Instant startTime = Instant.now();

    private Instant endTime;

    @Builder.Default
    private int overallScore = 0; // 0 to 100

    private String finalVerdict; // STRONG_HIRE, HIRE, LEANING_HIRE, NO_HIRE

    private String performanceSummary;
}
