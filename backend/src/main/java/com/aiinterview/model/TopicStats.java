package com.aiinterview.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicStats {
    private String topic;
    @Builder.Default
    private int solvedCount = 0;
    @Builder.Default
    private int attemptedCount = 0;
    @Builder.Default
    private double accuracy = 0.0;
    @Builder.Default
    private int masteryScore = 0; // 0 to 100
}
