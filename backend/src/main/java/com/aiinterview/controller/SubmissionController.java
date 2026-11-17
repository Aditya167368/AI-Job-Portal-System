package com.aiinterview.controller;

import com.aiinterview.dto.CodeRunRequest;
import com.aiinterview.dto.CodeRunResponse;
import com.aiinterview.dto.CodeSubmitRequest;
import com.aiinterview.model.Submission;
import com.aiinterview.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping("/run")
    public ResponseEntity<CodeRunResponse> runCode(@Valid @RequestBody CodeRunRequest request) {
        return ResponseEntity.ok(submissionService.runCode(request));
    }

    @PostMapping("/submit")
    public ResponseEntity<Submission> submitCode(
            @Valid @RequestBody CodeSubmitRequest request,
            Authentication authentication) {
        String userId = (authentication != null && authentication.getName() != null) ? authentication.getName() : "anonymous-user";
        String username = (authentication != null) ? authentication.getName() : "Guest";
        return ResponseEntity.ok(submissionService.submitCode(userId, username, request));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<Submission>> getMySubmissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(submissionService.getUserSubmissions(authentication.getName(), page, size));
    }
}
