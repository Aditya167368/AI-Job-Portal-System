package com.aiinterview.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCase {
    private String id;
    private String input;
    private String expectedOutput;
    @Builder.Default
    private boolean hidden = false;
}
