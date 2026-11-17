package com.aiinterview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiHintRequest {
    private String questionId;
    private String currentCode;
    private String language;
    private int hintLevel; // 1 = High level intuition, 2 = Data structure suggestion, 3 = Pseudocode nudge
    private String userQuery; // Optional specific question candidate is asking
}
