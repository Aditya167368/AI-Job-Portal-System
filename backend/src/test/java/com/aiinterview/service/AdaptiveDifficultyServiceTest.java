package com.aiinterview.service;

import com.aiinterview.model.Difficulty;
import com.aiinterview.model.RankingTier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class AdaptiveDifficultyServiceTest {

    private AdaptiveDifficultyService adaptiveService;

    @BeforeEach
    void setUp() {
        // Construct service without repository dependencies for pure calculation tests
        adaptiveService = new AdaptiveDifficultyService(null, null, null);
    }

    @Test
    void testComputeTier() {
        assertEquals(RankingTier.BEGINNER, adaptiveService.computeTier(1150));
        assertEquals(RankingTier.INTERMEDIATE, adaptiveService.computeTier(1250));
        assertEquals(RankingTier.ADVANCED, adaptiveService.computeTier(1600));
        assertEquals(RankingTier.EXPERT, adaptiveService.computeTier(1950));
    }

    @Test
    void testCalculateRatingDeltaWhenPassed() {
        // When a beginner (1100) solves a HARD question (1850), delta should be positive and substantial
        int deltaHard = adaptiveService.calculateRatingDelta(1100, Difficulty.HARD, true, 5);
        assertTrue(deltaHard > 25, "Solving a hard question should grant significant Elo increase");

        // When user solves an easy question at 1100, delta should be positive but smaller
        int deltaEasy = adaptiveService.calculateRatingDelta(1100, Difficulty.EASY, true, 5);
        assertTrue(deltaEasy > 0, "Solving an easy question should grant positive Elo increase");
        assertTrue(deltaHard > deltaEasy, "Hard question reward should exceed easy question reward");
    }

    @Test
    void testCalculateRatingDeltaWhenFailed() {
        // When an expert (1900) fails an EASY question (1050), penalty should be significant
        int deltaEasyFail = adaptiveService.calculateRatingDelta(1900, Difficulty.EASY, false, 25);
        assertTrue(deltaEasyFail < -15, "Failing an easy question for an expert should deduct rating");

        // When a beginner (1100) fails a hard question, penalty should be mild (soft penalty mitigation)
        int deltaHardFail = adaptiveService.calculateRatingDelta(1100, Difficulty.HARD, false, 25);
        assertTrue(deltaHardFail >= -8, "Beginner failing hard question should be protected by soft penalty ceiling");
    }
}
