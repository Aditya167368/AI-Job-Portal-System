package com.aiinterview.service;

import com.aiinterview.dto.CodeRunRequest;
import com.aiinterview.dto.CodeRunResponse;
import com.aiinterview.model.SubmissionStatus;
import com.aiinterview.model.TestCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class CodeExecutionServiceTest {

    private CodeExecutionService codeExecutionService;

    @BeforeEach
    void setUp() {
        codeExecutionService = new CodeExecutionService();
    }

    @Test
    void testJavaScriptExecutionSuccess() {
        String code = """
                function twoSum(nums, target) {
                    const map = new Map();
                    for (let i = 0; i < nums.length; i++) {
                        const comp = target - nums[i];
                        if (map.has(comp)) return [map.get(comp), i];
                        map.set(nums[i], i);
                    }
                    return [];
                }
                """;

        List<TestCase> testCases = List.of(
                new TestCase("1", "[2,7,11,15], 9", "[0,1]", false),
                new TestCase("2", "[3,2,4], 6", "[1,2]", false)
        );

        CodeRunRequest request = CodeRunRequest.builder()
                .questionId("q-test")
                .language("javascript")
                .code(code)
                .build();

        CodeRunResponse response = codeExecutionService.execute(request, testCases);

        assertNotNull(response);
        assertEquals(2, response.getTotalTests());
        assertEquals(2, response.getPassedTests());
        assertEquals(SubmissionStatus.ACCEPTED, response.getStatus());
    }

    @Test
    void testJavaScriptExecutionFailure() {
        String code = """
                function twoSum(nums, target) {
                    return [0, 0]; // Incorrect
                }
                """;

        List<TestCase> testCases = List.of(
                new TestCase("1", "[2,7,11,15], 9", "[0,1]", false)
        );

        CodeRunRequest request = CodeRunRequest.builder()
                .questionId("q-test")
                .language("javascript")
                .code(code)
                .build();

        CodeRunResponse response = codeExecutionService.execute(request, testCases);

        assertNotNull(response);
        assertEquals(1, response.getTotalTests());
        assertEquals(0, response.getPassedTests());
        assertEquals(SubmissionStatus.WRONG_ANSWER, response.getStatus());
    }
}
