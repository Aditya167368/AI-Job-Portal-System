package com.aiinterview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartAdaptiveSessionRequest {
    private String targetCompany; // e.g. "Google", "Amazon", "Meta"
    private String targetRole;    // e.g. "Software Engineer II", "Full Stack Engineer"
    private String initialFocusTopic; // Optional
}
