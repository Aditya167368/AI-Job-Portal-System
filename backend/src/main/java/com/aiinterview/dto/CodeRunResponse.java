package com.aiinterview.dto;

import com.aiinterview.model.SubmissionStatus;
import com.aiinterview.model.TestResult;
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
public class CodeRunResponse {
    private SubmissionStatus status;
    private int passedTests;
    private int totalTests;
    private long runtimeMs;
    private double memoryMb;
    private String compileOutput;
    @Builder.Default
    private List<TestResult> testResults = new ArrayList<>();
    private String error;
}
