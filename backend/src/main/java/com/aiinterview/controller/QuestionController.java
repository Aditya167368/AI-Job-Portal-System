package com.aiinterview.controller;

import com.aiinterview.dto.GenerateQuestionRequest;
import com.aiinterview.model.Question;
import com.aiinterview.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping
    public ResponseEntity<Page<Question>> getAllQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(questionService.getQuestions(page, size, difficulty, topic, company, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable String id) {
        return questionService.getQuestionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/daily")
    public ResponseEntity<Question> getDailyQuestion() {
        Question daily = questionService.getDailyQuestion();
        if (daily == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(daily);
    }

    @PostMapping("/generate")
    public ResponseEntity<Question> generateQuestion(
            @RequestBody GenerateQuestionRequest request,
            @RequestHeader(value = "X-OpenAI-Key", required = false) String apiKeyHeader) {
        Question generated = questionService.generateAndSaveQuestion(request, apiKeyHeader);
        return ResponseEntity.ok(generated);
    }

    @GetMapping("/topics")
    public ResponseEntity<List<String>> getTopics() {
        return ResponseEntity.ok(questionService.getAvailableTopics());
    }

    @GetMapping("/companies")
    public ResponseEntity<List<String>> getCompanies() {
        return ResponseEntity.ok(questionService.getAvailableCompanies());
    }
}
