package com.aiinterview.controller;

import com.aiinterview.dto.AdaptiveRecommendationResponse;
import com.aiinterview.dto.StartAdaptiveSessionRequest;
import com.aiinterview.model.AdaptiveSession;
import com.aiinterview.repository.AdaptiveSessionRepository;
import com.aiinterview.service.AdaptiveDifficultyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/adaptive")
@RequiredArgsConstructor
public class AdaptiveDifficultyController {

    private final AdaptiveDifficultyService adaptiveService;
    private final AdaptiveSessionRepository sessionRepository;

    @GetMapping("/recommend")
    public ResponseEntity<AdaptiveRecommendationResponse> getRecommendation(Authentication authentication) {
        String userId = (authentication != null && authentication.getName() != null) ? authentication.getName() : "demo-user";
        return ResponseEntity.ok(adaptiveService.getRecommendation(userId));
    }

    @PostMapping("/session/start")
    public ResponseEntity<AdaptiveSession> startSession(
            @RequestBody(required = false) StartAdaptiveSessionRequest request,
            Authentication authentication) {
        String userId = (authentication != null && authentication.getName() != null) ? authentication.getName() : "demo-user";
        StartAdaptiveSessionRequest req = request != null ? request : new StartAdaptiveSessionRequest();
        return ResponseEntity.ok(adaptiveService.startAdaptiveSession(userId, req));
    }

    @PostMapping("/session/{sessionId}/progress")
    public ResponseEntity<AdaptiveSession> progressSession(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "true") boolean passed,
            @RequestParam(required = false) String submissionId) {
        return ResponseEntity.ok(adaptiveService.progressStage(sessionId, passed, submissionId));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<AdaptiveSession> getSession(@PathVariable String sessionId) {
        return sessionRepository.findById(sessionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
