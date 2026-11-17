package com.aiinterview.service;

import com.aiinterview.dto.GenerateQuestionRequest;
import com.aiinterview.model.Difficulty;
import com.aiinterview.model.Example;
import com.aiinterview.model.Question;
import com.aiinterview.model.TestCase;
import com.aiinterview.repository.QuestionRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final OpenAiService openAiService;

    public Page<Question> getQuestions(int page, int size, String difficulty, String topic, String company, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "difficulty").and(Sort.by("title")));

        if (StringUtils.hasText(search)) {
            return questionRepository.searchByKeyword(search.trim(), pageable);
        }
        if (StringUtils.hasText(difficulty)) {
            try {
                Difficulty diff = Difficulty.valueOf(difficulty.toUpperCase().trim());
                return questionRepository.findByDifficulty(diff, pageable);
            } catch (IllegalArgumentException ignored) {}
        }
        if (StringUtils.hasText(topic)) {
            return questionRepository.findByTopic(topic.trim(), pageable);
        }
        if (StringUtils.hasText(company)) {
            return questionRepository.findByCompany(company.trim(), pageable);
        }

        return questionRepository.findAll(pageable);
    }

    public Optional<Question> getQuestionById(String id) {
        return questionRepository.findById(id).or(() -> questionRepository.findBySlug(id));
    }

    public Question getDailyQuestion() {
        List<Question> all = questionRepository.findAll();
        if (all.isEmpty()) {
            return null;
        }
        // Consistent daily index based on epoch day
        long dayIndex = Instant.now().getEpochSecond() / 86400;
        int idx = (int) (dayIndex % all.size());
        return all.get(idx);
    }

    public Question generateAndSaveQuestion(GenerateQuestionRequest request, String apiKey) {
        Question generated = openAiService.generateQuestion(request, apiKey);
        return questionRepository.save(generated);
    }

    public List<String> getAvailableTopics() {
        Set<String> topics = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        questionRepository.findAll().forEach(q -> {
            if (q.getTopics() != null) topics.addAll(q.getTopics());
        });
        if (topics.isEmpty()) {
            return List.of("Arrays & Hashing", "Two Pointers", "Sliding Window", "Stack", "Binary Search", "Trees", "Graphs", "Dynamic Programming", "Trie");
        }
        return new ArrayList<>(topics);
    }

    public List<String> getAvailableCompanies() {
        Set<String> companies = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        questionRepository.findAll().forEach(q -> {
            if (q.getCompanies() != null) companies.addAll(q.getCompanies());
        });
        if (companies.isEmpty()) {
            return List.of("Google", "Amazon", "Meta", "Microsoft", "Apple", "Netflix", "Uber");
        }
        return new ArrayList<>(companies);
    }

    /**
     * Seeds initial questions upon startup if collection is empty
     */
    @PostConstruct
    public void seedInitialQuestionsIfEmpty() {
        if (questionRepository.count() > 0) {
            log.info("Database already populated with {} questions.", questionRepository.count());
            return;
        }

        log.info("Seeding initial high-yield LeetCode problems...");

        List<Question> seedList = new ArrayList<>();

        // 1. Two Sum
        seedList.add(Question.builder()
                .slug("two-sum")
                .title("Two Sum")
                .difficulty(Difficulty.EASY)
                .topics(List.of("Arrays & Hashing", "Two Pointers"))
                .companies(List.of("Google", "Amazon", "Meta", "Apple", "Microsoft"))
                .descriptionMarkdown("""
                        Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.
                        
                        You may assume that each input would have **exactly one solution**, and you may not use the same element twice.
                        
                        You can return the answer in any order.
                        """)
                .inputFormat("nums = [2,7,11,15], target = 9")
                .outputFormat("[0,1]")
                .constraints(List.of(
                        "2 <= nums.length <= 10^4",
                        "-10^9 <= nums[i] <= 10^9",
                        "-10^9 <= target <= 10^9",
                        "Only one valid answer exists."
                ))
                .examples(List.of(
                        new Example("[2,7,11,15], 9", "[0,1]", "Because nums[0] + nums[1] == 9, we return [0, 1]."),
                        new Example("[3,2,4], 6", "[1,2]", "Because nums[1] + nums[2] == 6, we return [1, 2]."),
                        new Example("[3,3], 6", "[0,1]", "Because nums[0] + nums[1] == 6, we return [0, 1].")
                ))
                .starterCode(Map.of(
                        "javascript", """
                                /**
                                 * @param {number[]} nums
                                 * @param {number} target
                                 * @return {number[]}
                                 */
                                function twoSum(nums, target) {
                                    const map = new Map();
                                    for (let i = 0; i < nums.length; i++) {
                                        const complement = target - nums[i];
                                        if (map.has(complement)) {
                                            return [map.get(complement), i];
                                        }
                                        map.set(nums[i], i);
                                    }
                                    return [];
                                }
                                """,
                        "python", """
                                def twoSum(nums: list[int], target: int) -> list[int]:
                                    seen = {}
                                    for i, num in enumerate(nums):
                                        diff = target - num
                                        if diff in seen:
                                            return [seen[diff], i]
                                        seen[num] = i
                                    return []
                                """,
                        "java", """
                                class Solution {
                                    public int[] twoSum(int[] nums, int target) {
                                        Map<Integer, Integer> map = new HashMap<>();
                                        for (int i = 0; i < nums.length; i++) {
                                            int complement = target - nums[i];
                                            if (map.containsKey(complement)) {
                                                return new int[] { map.get(complement), i };
                                            }
                                            map.put(nums[i], i);
                                        }
                                        return new int[] {};
                                    }
                                }
                                """
                ))
                .testCases(List.of(
                        new TestCase("tc-1", "[2,7,11,15], 9", "[0,1]", false),
                        new TestCase("tc-2", "[3,2,4], 6", "[1,2]", false),
                        new TestCase("tc-3", "[3,3], 6", "[0,1]", true),
                        new TestCase("tc-4", "[1,5,8,3], 11", "[2,3]", true)
                ))
                .hints(List.of(
                        "Can you solve this faster than brute force O(N^2) by using extra memory?",
                        "A Hash Map allows O(1) lookups for the complement (target - num)."
                ))
                .solutionApproach("Use a Hash Table to look up the difference in O(1) time while making a single pass.")
                .timeComplexity("O(N)")
                .spaceComplexity("O(N)")
                .acceptanceRate(52.4)
                .createdAt(Instant.now())
                .build());

        // 2. Valid Parentheses
        seedList.add(Question.builder()
                .slug("valid-parentheses")
                .title("Valid Parentheses")
                .difficulty(Difficulty.EASY)
                .topics(List.of("Stack", "Strings"))
                .companies(List.of("Meta", "Google", "Amazon", "Microsoft"))
                .descriptionMarkdown("""
                        Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.
                        
                        An input string is valid if:
                        1. Open brackets must be closed by the same type of brackets.
                        2. Open brackets must be closed in the correct order.
                        3. Every close bracket has a corresponding open bracket of the same type.
                        """)
                .inputFormat("s = \"()[]{}\"")
                .outputFormat("true")
                .constraints(List.of(
                        "1 <= s.length <= 10^4",
                        "s consists of parentheses only '()[]{}'."
                ))
                .examples(List.of(
                        new Example("\"()\"", "true", "Matching open and close parentheses."),
                        new Example("\"()[]{}\"", "true", "All pairs match in order."),
                        new Example("\"(]\"", "false", "Bracket types do not match.")
                ))
                .starterCode(Map.of(
                        "javascript", """
                                /**
                                 * @param {string} s
                                 * @return {boolean}
                                 */
                                function isValid(s) {
                                    const stack = [];
                                    const map = { ')': '(', '}': '{', ']': '[' };
                                    for (let char of s) {
                                        if (map[char]) {
                                            if (stack.pop() !== map[char]) return false;
                                        } else {
                                            stack.push(char);
                                        }
                                    }
                                    return stack.length === 0;
                                }
                                """,
                        "python", """
                                def isValid(s: str) -> bool:
                                    stack = []
                                    mapping = {')': '(', '}': '{', ']': '['}
                                    for char in s:
                                        if char in mapping:
                                            top = stack.pop() if stack else '#'
                                            if mapping[char] != top:
                                                return False
                                        else:
                                            stack.append(char)
                                    return not stack
                                """
                ))
                .testCases(List.of(
                        new TestCase("tc-1", "\"()\"", "true", false),
                        new TestCase("tc-2", "\"()[]{}\"", "true", false),
                        new TestCase("tc-3", "\"(]\"", "false", false),
                        new TestCase("tc-4", "\"{[]}\"", "true", true)
                ))
                .hints(List.of(
                        "An opening bracket must be closed in LIFO order.",
                        "Use a Stack data structure to keep track of the most recent opening brackets."
                ))
                .solutionApproach("Iterate characters using a stack to ensure innermost parentheses close first.")
                .timeComplexity("O(N)")
                .spaceComplexity("O(N)")
                .acceptanceRate(41.1)
                .createdAt(Instant.now())
                .build());

        // 3. Longest Substring Without Repeating Characters
        seedList.add(Question.builder()
                .slug("longest-substring-without-repeating-characters")
                .title("Longest Substring Without Repeating Characters")
                .difficulty(Difficulty.MEDIUM)
                .topics(List.of("Sliding Window", "Strings", "Hash Table"))
                .companies(List.of("Amazon", "Microsoft", "Meta", "Google", "Apple"))
                .descriptionMarkdown("""
                        Given a string `s`, find the length of the **longest substring** without repeating characters.
                        
                        A **substring** is a contiguous non-empty sequence of characters within a string.
                        """)
                .inputFormat("s = \"abcabcbb\"")
                .outputFormat("3")
                .constraints(List.of(
                        "0 <= s.length <= 5 * 10^4",
                        "s consists of English letters, digits, symbols and spaces."
                ))
                .examples(List.of(
                        new Example("\"abcabcbb\"", "3", "The answer is \"abc\", with the length of 3."),
                        new Example("\"bbbbb\"", "1", "The answer is \"b\", with the length of 1."),
                        new Example("\"pwwkew\"", "3", "The answer is \"wke\", with the length of 3.")
                ))
                .starterCode(Map.of(
                        "javascript", """
                                /**
                                 * @param {string} s
                                 * @return {number}
                                 */
                                function lengthOfLongestSubstring(s) {
                                    let set = new Set();
                                    let left = 0, maxLen = 0;
                                    for (let right = 0; right < s.length; right++) {
                                        while (set.has(s[right])) {
                                            set.delete(s[left]);
                                            left++;
                                        }
                                        set.add(s[right]);
                                        maxLen = Math.max(maxLen, right - left + 1);
                                    }
                                    return maxLen;
                                }
                                """,
                        "python", """
                                def lengthOfLongestSubstring(s: str) -> int:
                                    char_set = set()
                                    l = 0
                                    res = 0
                                    for r in range(len(s)):
                                        while s[r] in char_set:
                                            char_set.remove(s[l])
                                            l += 1
                                        char_set.add(s[r])
                                        res = max(res, r - l + 1)
                                    return res
                                """
                ))
                .testCases(List.of(
                        new TestCase("tc-1", "\"abcabcbb\"", "3", false),
                        new TestCase("tc-2", "\"bbbbb\"", "1", false),
                        new TestCase("tc-3", "\"pwwkew\"", "3", false),
                        new TestCase("tc-4", "\"\"", "0", true)
                ))
                .hints(List.of(
                        "Use two pointers to define a sliding window [left, right].",
                        "Use a Set or Map to detect when a character is duplicated."
                ))
                .solutionApproach("Sliding window with two pointers and a hash set.")
                .timeComplexity("O(N)")
                .spaceComplexity("O(min(N, M))")
                .acceptanceRate(34.8)
                .createdAt(Instant.now())
                .build());

        // 4. Coin Change
        seedList.add(Question.builder()
                .slug("coin-change")
                .title("Coin Change")
                .difficulty(Difficulty.MEDIUM)
                .topics(List.of("Dynamic Programming", "Breadth-First Search"))
                .companies(List.of("Amazon", "Uber", "Apple", "Microsoft"))
                .descriptionMarkdown("""
                        You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.
                        
                        Return the *fewest number of coins* that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.
                        
                        You may assume that you have an infinite number of each kind of coin.
                        """)
                .inputFormat("coins = [1,2,5], amount = 11")
                .outputFormat("3")
                .constraints(List.of(
                        "1 <= coins.length <= 12",
                        "1 <= coins[i] <= 2^31 - 1",
                        "0 <= amount <= 10^4"
                ))
                .examples(List.of(
                        new Example("[1,2,5], 11", "3", "11 = 5 + 5 + 1 (3 coins)"),
                        new Example("[2], 3", "-1", "Cannot make amount 3 with only 2"),
                        new Example("[1], 0", "0", "0 amount requires 0 coins")
                ))
                .starterCode(Map.of(
                        "javascript", """
                                /**
                                 * @param {number[]} coins
                                 * @param {number} amount
                                 * @return {number}
                                 */
                                function coinChange(coins, amount) {
                                    const dp = new Array(amount + 1).fill(Infinity);
                                    dp[0] = 0;
                                    for (let i = 1; i <= amount; i++) {
                                        for (let coin of coins) {
                                            if (i - coin >= 0) {
                                                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                                            }
                                        }
                                    }
                                    return dp[amount] === Infinity ? -1 : dp[amount];
                                }
                                """,
                        "python", """
                                def coinChange(coins: list[int], amount: int) -> int:
                                    dp = [float('inf')] * (amount + 1)
                                    dp[0] = 0
                                    for a in range(1, amount + 1):
                                        for c in coins:
                                            if a - c >= 0:
                                                dp[a] = min(dp[a], 1 + dp[a - c])
                                    return dp[amount] if dp[amount] != float('inf') else -1
                                """
                ))
                .testCases(List.of(
                        new TestCase("tc-1", "[1,2,5], 11", "3", false),
                        new TestCase("tc-2", "[2], 3", "-1", false),
                        new TestCase("tc-3", "[1], 0", "0", false),
                        new TestCase("tc-4", "[186,419,83,408], 6249", "20", true)
                ))
                .hints(List.of(
                        "Define dp[i] as the minimum coins needed to make amount i.",
                        "dp[i] = min(dp[i], dp[i - coin] + 1) for every coin <= i."
                ))
                .solutionApproach("Bottom-up Dynamic Programming array of size amount + 1.")
                .timeComplexity("O(amount * coins.length)")
                .spaceComplexity("O(amount)")
                .acceptanceRate(43.1)
                .createdAt(Instant.now())
                .build());

        // 5. Trapping Rain Water
        seedList.add(Question.builder()
                .slug("trapping-rain-water")
                .title("Trapping Rain Water")
                .difficulty(Difficulty.HARD)
                .topics(List.of("Two Pointers", "Dynamic Programming", "Stack"))
                .companies(List.of("Google", "Meta", "Amazon", "Goldman Sachs", "Apple"))
                .descriptionMarkdown("""
                        Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.
                        """)
                .inputFormat("height = [0,1,0,2,1,0,1,3,2,1,2,1]")
                .outputFormat("6")
                .constraints(List.of(
                        "n == height.length",
                        "1 <= n <= 2 * 10^4",
                        "0 <= height[i] <= 10^5"
                ))
                .examples(List.of(
                        new Example("[0,1,0,2,1,0,1,3,2,1,2,1]", "6", "The elevation map traps 6 units of rain water."),
                        new Example("[4,2,0,3,2,5]", "9", "Traps 9 units of rain water.")
                ))
                .starterCode(Map.of(
                        "javascript", """
                                /**
                                 * @param {number[]} height
                                 * @return {number}
                                 */
                                function trap(height) {
                                    let l = 0, r = height.length - 1;
                                    let leftMax = 0, rightMax = 0;
                                    let res = 0;
                                    while (l < r) {
                                        if (height[l] < height[r]) {
                                            if (height[l] >= leftMax) leftMax = height[l];
                                            else res += leftMax - height[l];
                                            l++;
                                        } else {
                                            if (height[r] >= rightMax) rightMax = height[r];
                                            else res += rightMax - height[r];
                                            r--;
                                        }
                                    }
                                    return res;
                                }
                                """,
                        "python", """
                                def trap(height: list[int]) -> int:
                                    l, r = 0, len(height) - 1
                                    left_max, right_max = 0, 0
                                    res = 0
                                    while l < r:
                                        if height[l] < height[r]:
                                            if height[l] >= left_max:
                                                left_max = height[l]
                                            else:
                                                res += left_max - height[l]
                                            l += 1
                                        else:
                                            if height[r] >= right_max:
                                                right_max = height[r]
                                            else:
                                                res += right_max - height[r]
                                            r -= 1
                                    return res
                                """
                ))
                .testCases(List.of(
                        new TestCase("tc-1", "[0,1,0,2,1,0,1,3,2,1,2,1]", "6", false),
                        new TestCase("tc-2", "[4,2,0,3,2,5]", "9", false),
                        new TestCase("tc-3", "[2,0,2]", "2", true)
                ))
                .hints(List.of(
                        "For each bar, how much water can it hold above it? min(leftMax, rightMax) - height[i].",
                        "Can you eliminate the O(N) extra space by using Two Pointers from both ends?"
                ))
                .solutionApproach("Two pointers moving inward updating leftMax and rightMax in O(1) space.")
                .timeComplexity("O(N)")
                .spaceComplexity("O(1)")
                .acceptanceRate(61.0)
                .createdAt(Instant.now())
                .build());

        // 6. Course Schedule
        seedList.add(Question.builder()
                .slug("course-schedule")
                .title("Course Schedule")
                .difficulty(Difficulty.MEDIUM)
                .topics(List.of("Graphs", "Topological Sort", "BFS", "DFS"))
                .companies(List.of("Amazon", "Google", "Microsoft", "Meta"))
                .descriptionMarkdown("""
                        There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a_i, b_i]` indicates that you must take course `b_i` first if you want to take course `a_i`.
                        
                        Return `true` if you can finish all courses. Otherwise, return `false`.
                        """)
                .inputFormat("numCourses = 2, prerequisites = [[1,0]]")
                .outputFormat("true")
                .constraints(List.of(
                        "1 <= numCourses <= 2000",
                        "0 <= prerequisites.length <= 5000",
                        "prerequisites[i].length == 2",
                        "0 <= a_i, b_i < numCourses"
                ))
                .examples(List.of(
                        new Example("2, [[1,0]]", "true", "Take 0 then 1."),
                        new Example("2, [[1,0],[0,1]]", "false", "Cycle detected between course 0 and 1.")
                ))
                .starterCode(Map.of(
                        "javascript", """
                                /**
                                 * @param {number} numCourses
                                 * @param {number[][]} prerequisites
                                 * @return {boolean}
                                 */
                                function canFinish(numCourses, prerequisites) {
                                    const inDegree = new Array(numCourses).fill(0);
                                    const adj = Array.from({ length: numCourses }, () => []);
                                    for (let [dest, src] of prerequisites) {
                                        inDegree[dest]++;
                                        adj[src].push(dest);
                                    }
                                    const queue = [];
                                    for (let i = 0; i < numCourses; i++) {
                                        if (inDegree[i] === 0) queue.push(i);
                                    }
                                    let visited = 0;
                                    while (queue.length > 0) {
                                        const node = queue.shift();
                                        visited++;
                                        for (let neighbor of adj[node]) {
                                            inDegree[neighbor]--;
                                            if (inDegree[neighbor] === 0) queue.push(neighbor);
                                        }
                                    }
                                    return visited === numCourses;
                                }
                                """,
                        "python", """
                                def canFinish(numCourses: int, prerequisites: list[list[int]]) -> bool:
                                    from collections import deque
                                    in_degree = [0] * numCourses
                                    adj = [[] for _ in range(numCourses)]
                                    for dest, src in prerequisites:
                                        in_degree[dest] += 1
                                        adj[src].append(dest)
                                    queue = deque([i for i in range(numCourses) if in_degree[i] == 0])
                                    visited = 0
                                    while queue:
                                        node = queue.popleft()
                                        visited += 1
                                        for neighbor in adj[node]:
                                            in_degree[neighbor] -= 1
                                            if in_degree[neighbor] == 0:
                                                queue.append(neighbor)
                                    return visited == numCourses
                                """
                ))
                .testCases(List.of(
                        new TestCase("tc-1", "2, [[1,0]]", "true", false),
                        new TestCase("tc-2", "2, [[1,0],[0,1]]", "false", false),
                        new TestCase("tc-3", "3, [[1,0],[2,1]]", "true", true)
                ))
                .hints(List.of(
                        "This problem is equivalent to finding if a cycle exists in a directed graph.",
                        "Use Kahn's Algorithm (BFS topological sort) using in-degrees."
                ))
                .solutionApproach("Kahn's Algorithm for Topological Sort using In-Degree array and BFS Queue.")
                .timeComplexity("O(V + E)")
                .spaceComplexity("O(V + E)")
                .acceptanceRate(46.8)
                .createdAt(Instant.now())
                .build());

        questionRepository.saveAll(seedList);
        log.info("Successfully seeded {} questions.", seedList.size());
    }
}
