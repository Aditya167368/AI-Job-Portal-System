package com.aiinterview.dto;

import com.aiinterview.model.TestCase;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeRunRequest {
    @NotBlank(message = "Question ID is required")
    private String questionId;

    @NotBlank(message = "Language is required")
    private String language; // "javascript", "python", "java", "cpp"

    @NotBlank(message = "Code is required")
    private String code;

    private List<TestCase> customTestCases; // Optional custom inputs
}
