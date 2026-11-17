package com.aiinterview.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestResult {
    private int testCaseIndex;
    private String input;
    private String expectedOutput;
    private String actualOutput;
    private boolean passed;
    private String errorMessage;
    private long executionTimeMs;
    private boolean hidden;
}
