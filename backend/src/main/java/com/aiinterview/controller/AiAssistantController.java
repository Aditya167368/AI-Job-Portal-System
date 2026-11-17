package com.aiinterview.controller;

import com.aiinterview.dto.*;
import com.aiinterview.model.Question;
import com.aiinterview.repository.QuestionRepository;
import com.aiinterview.service.OpenAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiAssistantController {

    private final OpenAiService openAiService;
    private final QuestionRepository questionRepository;

    @PostMapping("/hint")
    public ResponseEntity<AiHintResponse> getHint(
            @RequestBody AiHintRequest request,
            @RequestHeader(value = "X-OpenAI-Key", required = false) String apiKeyHeader) {
        Question question = questionRepository.findById(request.getQuestionId())
                .or(() -> questionRepository.findBySlug(request.getQuestionId()))
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        return ResponseEntity.ok(openAiService.getHint(request, question, apiKeyHeader));
    }

    @PostMapping("/review")
    public ResponseEntity<AiReviewResponse> reviewCode(
            @RequestBody AiReviewRequest request,
            @RequestHeader(value = "X-OpenAI-Key", required = false) String apiKeyHeader) {
        Question question = questionRepository.findById(request.getQuestionId())
                .or(() -> questionRepository.findBySlug(request.getQuestionId()))
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        return ResponseEntity.ok(openAiService.reviewCode(request, question, apiKeyHeader));
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chatWithInterviewer(
            @RequestBody AiChatRequest request,
            @RequestHeader(value = "X-OpenAI-Key", required = false) String apiKeyHeader) {
        Question question = questionRepository.findById(request.getQuestionId())
                .or(() -> questionRepository.findBySlug(request.getQuestionId()))
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        return ResponseEntity.ok(openAiService.chat(request, question, apiKeyHeader));
    }
}
