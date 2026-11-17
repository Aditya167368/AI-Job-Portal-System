package com.aiinterview.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeSubmitRequest {
    @NotBlank(message = "Question ID is required")
    private String questionId;

    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Code is required")
    private String code;
}
