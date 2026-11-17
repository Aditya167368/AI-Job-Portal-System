package com.aiinterview.service;

import com.aiinterview.dto.*;
import com.aiinterview.model.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
public class OpenAiService {

    @Value("${app.openai.api-key:}")
    private String defaultApiKey;

    @Value("${app.openai.api-url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${app.openai.model:gpt-4o-mini}")
    private String modelName;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate a novel LeetCode style question dynamically
     */
    public Question generateQuestion(GenerateQuestionRequest request, String overrideApiKey) {
        String apiKey = StringUtils.hasText(overrideApiKey) ? overrideApiKey : defaultApiKey;
        Difficulty difficulty = request.getDifficulty() != null ? request.getDifficulty() : Difficulty.MEDIUM;
        String topic = StringUtils.hasText(request.getTopic()) ? request.getTopic() : "Dynamic Programming";
        String company = StringUtils.hasText(request.getTargetCompany()) ? request.getTargetCompany() : "Google";

        if (StringUtils.hasText(apiKey)) {
            try {
                return generateQuestionWithOpenAi(request, difficulty, topic, company, apiKey);
            } catch (Exception ex) {
                log.warn("OpenAI API call failed: {}. Falling back to dynamic algorithmic generator.", ex.getMessage());
            }
        }

        return generateFallbackQuestion(difficulty, topic, company);
    }

    private Question generateQuestionWithOpenAi(GenerateQuestionRequest request, Difficulty difficulty,
                                                String topic, String company, String apiKey) throws Exception {
        String systemPrompt = """
                You are a Senior Principal Staff Software Engineer and Senior Technical Interviewer at top tech companies.
                Create a high quality, LeetCode-style algorithmic coding interview problem.
                Respond strictly with valid JSON with the exact following schema:
                {
                  "title": "Problem Title",
                  "slug": "problem-title-lowercase-slug",
                  "difficulty": "EASY" or "MEDIUM" or "HARD",
                  "topics": ["Array", "Dynamic Programming"],
                  "companies": ["Google", "Meta"],
                  "descriptionMarkdown": "Clear problem statement in markdown...",
                  "inputFormat": "Description of input parameters",
                  "outputFormat": "Description of return value",
                  "constraints": ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
                  "examples": [
                    { "input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0] + nums[1] == 9" }
                  ],
                  "starterCode": {
                    "javascript": "function solve(input) {\\n    // Write code here\\n}",
                    "python": "def solve(input):\\n    # Write code here\\n    pass",
                    "java": "class Solution {\\n    public int[] solve(int[] input) {\\n        // Write code here\\n        return new int[]{};\\n    }\\n}",
                    "cpp": "class Solution {\\npublic:\\n    vector<int> solve(vector<int>& input) {\\n        // Write code here\\n    }\\n};"
                  },
                  "testCases": [
                    { "input": "[2,7,11,15], 9", "expectedOutput": "[0,1]", "hidden": false },
                    { "input": "[3,2,4], 6", "expectedOutput": "[1,2]", "hidden": false },
                    { "input": "[3,3], 6", "expectedOutput": "[0,1]", "hidden": true }
                  ],
                  "hints": [
                    "Consider using a Hash Map for O(N) lookup.",
                    "What happens if you store the complement (target - nums[i])?"
                  ],
                  "solutionApproach": "Detailed explanation of optimal approach...",
                  "timeComplexity": "O(N)",
                  "spaceComplexity": "O(N)"
                }
                Do not include markdown triple backticks around the json, return raw json only.
                """;

        String userPrompt = String.format(
                "Generate a %s difficulty coding interview problem focusing on topic '%s' commonly asked at '%s'. %s",
                difficulty.name(), topic, company,
                StringUtils.hasText(request.getCustomPrompt()) ? "Additional context: " + request.getCustomPrompt() : ""
        );

        String jsonResponse = callOpenAiChat(systemPrompt, userPrompt, apiKey);
        return parseQuestionFromJson(jsonResponse, difficulty, topic, company);
    }

    private Question parseQuestionFromJson(String jsonContent, Difficulty fallbackDiff, String topic, String company) {
        try {
            String cleanJson = jsonContent.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            JsonNode node = objectMapper.readTree(cleanJson);

            String title = node.has("title") ? node.get("title").asText() : "Dynamic " + topic + " Challenge";
            String slug = node.has("slug") ? node.get("slug").asText() : generateSlug(title);
            String diffStr = node.has("difficulty") ? node.get("difficulty").asText() : fallbackDiff.name();
            Difficulty diff = Difficulty.valueOf(diffStr.toUpperCase());

            List<String> topics = new ArrayList<>();
            if (node.has("topics") && node.get("topics").isArray()) {
                node.get("topics").forEach(t -> topics.add(t.asText()));
            } else {
                topics.add(topic);
            }

            List<String> companies = new ArrayList<>();
            if (node.has("companies") && node.get("companies").isArray()) {
                node.get("companies").forEach(c -> companies.add(c.asText()));
            } else {
                companies.add(company);
            }

            List<String> constraints = new ArrayList<>();
            if (node.has("constraints") && node.get("constraints").isArray()) {
                node.get("constraints").forEach(c -> constraints.add(c.asText()));
            }

            List<Example> examples = new ArrayList<>();
            if (node.has("examples") && node.get("examples").isArray()) {
                node.get("examples").forEach(e -> examples.add(new Example(
                        e.has("input") ? e.get("input").asText() : "",
                        e.has("output") ? e.get("output").asText() : "",
                        e.has("explanation") ? e.get("explanation").asText() : ""
                )));
            }

            Map<String, String> starterCode = new HashMap<>();
            if (node.has("starterCode") && node.get("starterCode").isObject()) {
                Iterator<Map.Entry<String, JsonNode>> fields = node.get("starterCode").fields();
                while (fields.hasNext()) {
                    Map.Entry<String, JsonNode> field = fields.next();
                    starterCode.put(field.getKey(), field.getValue().asText());
                }
            }

            List<TestCase> testCases = new ArrayList<>();
            if (node.has("testCases") && node.get("testCases").isArray()) {
                int tcIdx = 1;
                for (JsonNode tcNode : node.get("testCases")) {
                    testCases.add(TestCase.builder()
                            .id("tc-" + tcIdx++)
                            .input(tcNode.has("input") ? tcNode.get("input").asText() : "")
                            .expectedOutput(tcNode.has("expectedOutput") ? tcNode.get("expectedOutput").asText() : "")
                            .hidden(tcNode.has("hidden") && tcNode.get("hidden").asBoolean())
                            .build());
                }
            }

            List<String> hints = new ArrayList<>();
            if (node.has("hints") && node.get("hints").isArray()) {
                node.get("hints").forEach(h -> hints.add(h.asText()));
            }

            return Question.builder()
                    .slug(slug + "-" + UUID.randomUUID().toString().substring(0, 6))
                    .title(title)
                    .difficulty(diff)
                    .topics(topics)
                    .companies(companies)
                    .descriptionMarkdown(node.has("descriptionMarkdown") ? node.get("descriptionMarkdown").asText() : "")
                    .inputFormat(node.has("inputFormat") ? node.get("inputFormat").asText() : "")
                    .outputFormat(node.has("outputFormat") ? node.get("outputFormat").asText() : "")
                    .constraints(constraints)
                    .examples(examples)
                    .starterCode(starterCode)
                    .testCases(testCases)
                    .hints(hints)
                    .solutionApproach(node.has("solutionApproach") ? node.get("solutionApproach").asText() : "")
                    .timeComplexity(node.has("timeComplexity") ? node.get("timeComplexity").asText() : "O(N)")
                    .spaceComplexity(node.has("spaceComplexity") ? node.get("spaceComplexity").asText() : "O(N)")
                    .isAiGenerated(true)
                    .generatedPrompt("Generated via OpenAI GPT model")
                    .createdAt(Instant.now())
                    .build();
        } catch (Exception e) {
            log.error("Failed to parse JSON into Question: {}", e.getMessage());
            return generateFallbackQuestion(fallbackDiff, topic, company);
        }
    }

    /**
     * Socratic AI Hint generation
     */
    public AiHintResponse getHint(AiHintRequest request, Question question, String overrideApiKey) {
        String apiKey = StringUtils.hasText(overrideApiKey) ? overrideApiKey : defaultApiKey;
        int level = Math.max(1, Math.min(3, request.getHintLevel()));

        if (StringUtils.hasText(apiKey)) {
            try {
                String systemPrompt = """
                        You are an encouraging Socratic coding interview mentor at a top tech company.
                        Your job is to provide a gentle, targeted hint that guides the candidate without giving away the complete solution.
                        - Hint Level 1: High level intuitive guidance and problem breakdown.
                        - Hint Level 2: Recommended algorithmic pattern / data structure to consider.
                        - Hint Level 3: Conceptual step-by-step logic or invariant.
                        Respond strictly with JSON:
                        {
                          "hint": "The hint message...",
                          "recommendedTechnique": "e.g., Two Pointers / Sliding Window",
                          "timeComplexityTarget": "O(N)",
                          "spaceComplexityTarget": "O(1)"
                        }
                        """;

                String userPrompt = String.format(
                        "Problem: %s\nDifficulty: %s\nCurrent candidate code (%s):\n```\n%s\n```\nCandidate question: %s\nProvide hint level %d.",
                        question.getTitle(), question.getDifficulty().name(), request.getLanguage(),
                        request.getCurrentCode(), request.getUserQuery() != null ? request.getUserQuery() : "How do I approach this efficiently?",
                        level
                );

                String json = callOpenAiChat(systemPrompt, userPrompt, apiKey);
                JsonNode node = objectMapper.readTree(cleanJsonString(json));

                return AiHintResponse.builder()
                        .hint(node.has("hint") ? node.get("hint").asText() : "Think about how you can avoid redundant work.")
                        .hintLevel(level)
                        .recommendedTechnique(node.has("recommendedTechnique") ? node.get("recommendedTechnique").asText() : question.getTopics().isEmpty() ? "Algorithm" : question.getTopics().get(0))
                        .timeComplexityTarget(node.has("timeComplexityTarget") ? node.get("timeComplexityTarget").asText() : question.getTimeComplexity())
                        .spaceComplexityTarget(node.has("spaceComplexityTarget") ? node.get("spaceComplexityTarget").asText() : question.getSpaceComplexity())
                        .build();
            } catch (Exception e) {
                log.warn("OpenAI hint generation error: {}", e.getMessage());
            }
        }

        // High quality fallback hint
        String fallbackHint;
        if (question.getHints() != null && !question.getHints().isEmpty()) {
            int hintIdx = Math.min(level - 1, question.getHints().size() - 1);
            fallbackHint = question.getHints().get(hintIdx);
        } else {
            fallbackHint = switch (level) {
                case 1 -> "Consider what information can be stored or tracked as you iterate through the input to avoid an O(N^2) brute force.";
                case 2 -> "Try identifying if a Map/Set, Two Pointers, or Dynamic Programming state matches the problem constraints.";
                default -> "Focus on optimal subproblems: can solving the prefix or suffix help construct the final answer?";
            };
        }

        return AiHintResponse.builder()
                .hint(fallbackHint)
                .hintLevel(level)
                .recommendedTechnique(question.getTopics().isEmpty() ? "Hash Map / Two Pointers" : question.getTopics().get(0))
                .timeComplexityTarget(question.getTimeComplexity() != null ? question.getTimeComplexity() : "O(N)")
                .spaceComplexityTarget(question.getSpaceComplexity() != null ? question.getSpaceComplexity() : "O(N)")
                .build();
    }

    /**
     * AI Code Review & Complexity Analysis
     */
    public AiReviewResponse reviewCode(AiReviewRequest request, Question question, String overrideApiKey) {
        String apiKey = StringUtils.hasText(overrideApiKey) ? overrideApiKey : defaultApiKey;

        if (StringUtils.hasText(apiKey)) {
            try {
                String systemPrompt = """
                        You are a Lead Staff Software Engineer reviewing an interviewee's solution.
                        Analyze the code for:
                        1. Correctness & edge cases
                        2. Time & space complexity
                        3. Code clarity, naming, idioms
                        4. Optimality vs known best approaches
                        Respond strictly with JSON:
                        {
                          "overallScore": 88,
                          "timeComplexity": "O(N)",
                          "spaceComplexity": "O(1)",
                          "optimalityVerdict": "Optimal",
                          "positivePoints": ["Clean variable naming", "Handles single element edge case"],
                          "improvementAreas": ["Could avoid duplicate conversions"],
                          "edgeCasesToConsider": ["Empty input", "Very large numbers causing overflow"],
                          "refactoredCodeSnippet": "// cleaner version",
                          "generalSummary": "Solid implementation demonstrating strong algorithmic grasp."
                        }
                        """;

                String userPrompt = String.format(
                        "Problem: %s (%s)\nLanguage: %s\nCode:\n```\n%s\n```",
                        question.getTitle(), question.getDifficulty().name(), request.getLanguage(), request.getCode()
                );

                String json = callOpenAiChat(systemPrompt, userPrompt, apiKey);
                JsonNode node = objectMapper.readTree(cleanJsonString(json));

                List<String> positives = new ArrayList<>();
                if (node.has("positivePoints") && node.get("positivePoints").isArray()) {
                    node.get("positivePoints").forEach(p -> positives.add(p.asText()));
                }

                List<String> improvements = new ArrayList<>();
                if (node.has("improvementAreas") && node.get("improvementAreas").isArray()) {
                    node.get("improvementAreas").forEach(i -> improvements.add(i.asText()));
                }

                List<String> edgeCases = new ArrayList<>();
                if (node.has("edgeCasesToConsider") && node.get("edgeCasesToConsider").isArray()) {
                    node.get("edgeCasesToConsider").forEach(e -> edgeCases.add(e.asText()));
                }

                return AiReviewResponse.builder()
                        .overallScore(node.has("overallScore") ? node.get("overallScore").asInt() : 85)
                        .timeComplexity(node.has("timeComplexity") ? node.get("timeComplexity").asText() : "O(N)")
                        .spaceComplexity(node.has("spaceComplexity") ? node.get("spaceComplexity").asText() : "O(1)")
                        .optimalityVerdict(node.has("optimalityVerdict") ? node.get("optimalityVerdict").asText() : "Optimal")
                        .positivePoints(positives.isEmpty() ? List.of("Clean logic structure", "Well-defined loop bounds") : positives)
                        .improvementAreas(improvements.isEmpty() ? List.of("Consider adding comments for tricky pointer logic") : improvements)
                        .edgeCasesToConsider(edgeCases.isEmpty() ? List.of("Null or empty inputs", "Maximum integer boundary values") : edgeCases)
                        .refactoredCodeSnippet(node.has("refactoredCodeSnippet") ? node.get("refactoredCodeSnippet").asText() : "")
                        .generalSummary(node.has("generalSummary") ? node.get("generalSummary").asText() : "Well-written solution meeting standard performance expectations.")
                        .build();
            } catch (Exception e) {
                log.warn("OpenAI review code error: {}", e.getMessage());
            }
        }

        // Fallback review
        return AiReviewResponse.builder()
                .overallScore(85)
                .timeComplexity(question.getTimeComplexity() != null ? question.getTimeComplexity() : "O(N)")
                .spaceComplexity(question.getSpaceComplexity() != null ? question.getSpaceComplexity() : "O(N)")
                .optimalityVerdict("Near Optimal")
                .positivePoints(List.of(
                        "Code executes clearly with good algorithmic flow",
                        "Appropriate choice of variables and data types"
                ))
                .improvementAreas(List.of(
                        "Ensure all edge cases (null, empty arrays, duplicate entries) are checked up front",
                        "Evaluate if auxiliary space can be reduced to O(1)"
                ))
                .edgeCasesToConsider(List.of(
                        "Empty input or array length <= 1",
                        "Negative numbers and extreme boundary integers",
                        "Duplicate elements causing unexpected set behavior"
                ))
                .refactoredCodeSnippet("// Optimal standard pattern\n" + question.getStarterCode().getOrDefault("javascript", ""))
                .generalSummary("Strong foundational logic. Focus on verbalizing time/space tradeoffs clearly to your interviewer.")
                .build();
    }

    /**
     * AI Interactive Interviewer Chat
     */
    public AiChatResponse chat(AiChatRequest request, Question question, String overrideApiKey) {
        String apiKey = StringUtils.hasText(overrideApiKey) ? overrideApiKey : defaultApiKey;

        if (StringUtils.hasText(apiKey)) {
            try {
                String systemPrompt = String.format(
                        "You are a friendly, realistic Senior Interviewer at Google/Meta conducting a live technical interview for '%s'.\n" +
                                "The candidate is currently solving: '%s' (%s).\n" +
                                "Keep your response concise (2-4 sentences max), encouraging, and inquisitive. Guide them Socratic-style.",
                        question.getCompanies().isEmpty() ? "Tech Company" : question.getCompanies().get(0),
                        question.getTitle(), question.getDifficulty().name()
                );

                String userPrompt = "Candidate says: " + request.getMessage() + "\nCurrent Code:\n" + request.getCurrentCode();

                String reply = callOpenAiChat(systemPrompt, userPrompt, apiKey);
                return AiChatResponse.builder()
                        .reply(reply.trim())
                        .suggestedFollowUp("Can you walk me through the time and space complexity?")
                        .build();
            } catch (Exception e) {
                log.warn("OpenAI chat error: {}", e.getMessage());
            }
        }

        String query = request.getMessage().toLowerCase();
        String reply;
        String followUp = "How would this handle input sizes up to 100,000?";

        if (query.contains("hint") || query.contains("stuck")) {
            reply = "Great initiative asking for guidance. Before jumping into code, what is the brute-force way to solve this, and where do you think redundant work happens?";
            followUp = "Could a Hash Map or sorting pre-process step help reduce lookups?";
        } else if (query.contains("complexity") || query.contains("time") || query.contains("space")) {
            reply = String.format("For this problem, the optimal target is %s time and %s space. Think about whether your current approach meets that.",
                    question.getTimeComplexity() != null ? question.getTimeComplexity() : "O(N)",
                    question.getSpaceComplexity() != null ? question.getSpaceComplexity() : "O(1)");
        } else if (query.contains("edge") || query.contains("case")) {
            reply = "Good engineers always probe edge cases! Consider empty inputs, all identical values, negative integers, and boundary limits.";
        } else {
            reply = "I like your line of reasoning. Walk me through your test inputs, and tell me what the state looks like after the first iteration.";
        }

        return AiChatResponse.builder()
                .reply(reply)
                .suggestedFollowUp(followUp)
                .build();
    }

    private String callOpenAiChat(String systemPrompt, String userPrompt, String apiKey) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", modelName);
        requestBody.put("temperature", 0.7);

        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
        );
        requestBody.put("messages", messages);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices").get(0).path("message").path("content").asText();
        } else {
            throw new RuntimeException("OpenAI API returned status: " + response.getStatusCode());
        }
    }

    private String cleanJsonString(String str) {
        String clean = str.trim();
        if (clean.startsWith("```json")) {
            clean = clean.substring(7);
        }
        if (clean.startsWith("```")) {
            clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
            clean = clean.substring(0, clean.length() - 3);
        }
        return clean.trim();
    }

    private String generateSlug(String title) {
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");
    }

    /**
     * Fallback generator providing rich, diverse LeetCode questions
     */
    public Question generateFallbackQuestion(Difficulty difficulty, String topic, String company) {
        long timestamp = System.currentTimeMillis();
        String title;
        String desc;
        List<Example> examples = new ArrayList<>();
        List<TestCase> testCases = new ArrayList<>();
        List<String> constraints = new ArrayList<>();
        Map<String, String> starterCode = new HashMap<>();
        List<String> hints = new ArrayList<>();

        if ("Dynamic Programming".equalsIgnoreCase(topic) || "DP".equalsIgnoreCase(topic)) {
            title = difficulty == Difficulty.HARD ? "Optimal Coin Partition Path" : "Maximum Alternating Subsequence";
            desc = "Given an integer array `nums`, return the maximum alternating sum of any subsequence of `nums`. An alternating sum of a sequence `[s0, s1, s2, s3, ...]` is defined as `s0 - s1 + s2 - s3 + ...`. A subsequence of an array is a sequence that can be derived from the array by deleting some or no elements without changing the order of the remaining elements.";
            constraints = List.of("1 <= nums.length <= 10^5", "1 <= nums[i] <= 10^5");
            examples.add(new Example("[4,2,5,3]", "7", "Optimal subsequence is [4, 2, 5], sum = 4 - 2 + 5 = 7."));
            examples.add(new Example("[5,6,7,8]", "8", "Optimal subsequence is [8], sum = 8."));
            testCases.add(new TestCase("tc-1", "[4,2,5,3]", "7", false));
            testCases.add(new TestCase("tc-2", "[5,6,7,8]", "8", false));
            testCases.add(new TestCase("tc-3", "[6,2,1,2,4,5]", "10", true));

            starterCode.put("javascript", """
                    /**
                     * @param {number[]} nums
                     * @return {number}
                     */
                    function maxAlternatingSum(nums) {
                        // Write your solution here
                        let even = 0, odd = 0;
                        for (let x of nums) {
                            even = Math.max(even, odd + x);
                            odd = Math.max(odd, even - x);
                        }
                        return even;
                    }
                    """);
            starterCode.put("python", """
                    def maxAlternatingSum(nums: list[int]) -> int:
                        # Write your solution here
                        pass
                    """);
            starterCode.put("java", """
                    class Solution {
                        public long maxAlternatingSum(int[] nums) {
                            // Write your solution here
                            return 0;
                        }
                    }
                    """);
            hints = List.of(
                    "Can you maintain two states: ending with an addition (even index) vs ending with a subtraction (odd index)?",
                    "For each number x: newEven = max(even, odd + x), newOdd = max(odd, even - x)."
            );
        } else if ("Graph".equalsIgnoreCase(topic) || "Graphs".equalsIgnoreCase(topic)) {
            title = "Valid Network Component Ring";
            desc = "You are given an undirected graph with `n` nodes labeled from `0` to `n - 1` and a list of `edges`. Determine if the graph forms a single valid ring cycle containing all nodes without branching.";
            constraints = List.of("1 <= n <= 10^4", "0 <= edges.length <= 10^4");
            examples.add(new Example("n = 3, edges = [[0,1],[1,2],[2,0]]", "true", "The 3 nodes form a single cycle without branches."));
            examples.add(new Example("n = 4, edges = [[0,1],[1,2],[2,3]]", "false", "Not closed into a ring."));
            testCases.add(new TestCase("tc-1", "3, [[0,1],[1,2],[2,0]]", "true", false));
            testCases.add(new TestCase("tc-2", "4, [[0,1],[1,2],[2,3]]", "false", false));
            testCases.add(new TestCase("tc-3", "4, [[0,1],[1,2],[2,3],[3,0]]", "true", true));

            starterCode.put("javascript", """
                    /**
                     * @param {number} n
                     * @param {number[][]} edges
                     * @return {boolean}
                     */
                    function isRingCycle(n, edges) {
                        // Write your code here
                        if (edges.length !== n) return false;
                        const deg = new Array(n).fill(0);
                        for (let [u, v] of edges) {
                            deg[u]++;
                            deg[v]++;
                        }
                        return deg.every(d => d === 2);
                    }
                    """);
            starterCode.put("python", """
                    def isRingCycle(n: int, edges: list[list[int]]) -> bool:
                        # Write your code here
                        pass
                    """);
            starterCode.put("java", """
                    class Solution {
                        public boolean isRingCycle(int n, int[][] edges) {
                            // Write your code here
                            return false;
                        }
                    }
                    """);
            hints = List.of(
                    "In a pure ring graph of n nodes, what must the degree of every vertex be?",
                    "Every vertex must have degree exactly 2, and the graph must be fully connected."
            );
        } else {
            // Default Arrays / Sliding Window / String
            title = difficulty == Difficulty.EASY ? "Target Sum Pair Index" : "Longest Distinct Subarray Window";
            desc = "Given an array of integers `nums` and an integer `k`, find the length of the longest contiguous subarray containing at most `k` distinct elements.";
            constraints = List.of("1 <= nums.length <= 10^5", "1 <= k <= nums.length");
            examples.add(new Example("nums = [1,2,1,2,3], k = 2", "4", "Subarray [1,2,1,2] has 2 distinct values and length 4."));
            examples.add(new Example("nums = [1,2,1,3,4], k = 3", "4", "Subarray [1,2,1,3] has 3 distinct values and length 4."));
            testCases.add(new TestCase("tc-1", "[1,2,1,2,3], 2", "4", false));
            testCases.add(new TestCase("tc-2", "[1,2,1,3,4], 3", "4", false));
            testCases.add(new TestCase("tc-3", "[1,1,1,1], 1", "4", true));

            starterCode.put("javascript", """
                    /**
                     * @param {number[]} nums
                     * @param {number} k
                     * @return {number}
                     */
                    function longestSubarrayWithKDistinct(nums, k) {
                        // Write your solution here
                        let map = new Map();
                        let left = 0, maxLen = 0;
                        for (let right = 0; right < nums.length; right++) {
                            map.set(nums[right], (map.get(nums[right]) || 0) + 1);
                            while (map.size > k) {
                                let cnt = map.get(nums[left]) - 1;
                                if (cnt === 0) map.delete(nums[left]);
                                else map.set(nums[left], cnt);
                                left++;
                            }
                            maxLen = Math.max(maxLen, right - left + 1);
                        }
                        return maxLen;
                    }
                    """);
            starterCode.put("python", """
                    def longestSubarrayWithKDistinct(nums: list[int], k: int) -> int:
                        # Write your solution here
                        pass
                    """);
            starterCode.put("java", """
                    class Solution {
                        public int longestSubarrayWithKDistinct(int[] nums, int k) {
                            // Write your solution here
                            return 0;
                        }
                    }
                    """);
            hints = List.of(
                    "Think about a Two Pointer / Sliding Window technique where the right pointer expands and left pointer shrinks.",
                    "Use a hash map to keep frequency count of elements currently inside the window."
            );
        }

        return Question.builder()
                .slug(generateSlug(title) + "-" + (timestamp % 10000))
                .title(title)
                .difficulty(difficulty)
                .topics(List.of(topic))
                .companies(List.of(company))
                .descriptionMarkdown(desc)
                .inputFormat("Input array and target constraints")
                .outputFormat("Calculated result value")
                .constraints(constraints)
                .examples(examples)
                .starterCode(starterCode)
                .testCases(testCases)
                .hints(hints)
                .solutionApproach("Use optimal sliding window with frequency map.")
                .timeComplexity("O(N)")
                .spaceComplexity("O(K)")
                .isAiGenerated(true)
                .generatedPrompt("Dynamic algorithmic problem generator")
                .createdAt(Instant.now())
                .build();
    }
}
