package com.aiinterview.controller;

import com.aiinterview.dto.DashboardStatsResponse;
import com.aiinterview.model.UserPerformanceProfile;
import com.aiinterview.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboard(Authentication authentication) {
        String userId = (authentication != null && authentication.getName() != null) ? authentication.getName() : "demo-user";
        return ResponseEntity.ok(analyticsService.getDashboardStats(userId));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserPerformanceProfile>> getLeaderboard() {
        return ResponseEntity.ok(analyticsService.getLeaderboard());
    }
}
