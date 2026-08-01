package com.flowpilot.controller;

import com.flowpilot.entity.User;
import com.flowpilot.entity.Workflow;
import com.flowpilot.exception.ResourceNotFoundException;
import com.flowpilot.repository.WorkflowRepository;
import com.flowpilot.service.UserService;
import com.flowpilot.service.ai.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Assistant", description = "AI-assisted workflow suggestions (Gemini-backed, mock fallback)")
public class AiController {

    private final AiService aiService;
    private final WorkflowRepository workflowRepository;

    public record SuggestStepsRequest(@NotBlank String title, String description, @NotBlank String department) {}

    @PostMapping("/suggest-steps")
    @Operation(summary = "Suggest approval steps for a new workflow before it is created")
    public ResponseEntity<List<String>> suggestSteps(@RequestBody SuggestStepsRequest request) {
        return ResponseEntity.ok(aiService.suggestSteps(request.title(), request.description(), request.department()));
    }

    @GetMapping("/workflows/{id}/predict-bottlenecks")
    @Operation(summary = "Predict likely bottlenecks for an existing workflow")
    public ResponseEntity<Map<String, String>> predictBottlenecks(@PathVariable Long id) {
        Workflow workflow = findOrThrow(id);
        return ResponseEntity.ok(Map.of("result", aiService.predictBottlenecks(workflow)));
    }

    @GetMapping("/workflows/{id}/summary")
    @Operation(summary = "Generate a short AI summary of a workflow")
    public ResponseEntity<Map<String, String>> generateSummary(@PathVariable Long id) {
        Workflow workflow = findOrThrow(id);
        return ResponseEntity.ok(Map.of("result", aiService.generateSummary(workflow)));
    }

    @GetMapping("/workflows/{id}/improvements")
    @Operation(summary = "Get AI-suggested process improvements for a workflow")
    public ResponseEntity<Map<String, String>> explainImprovements(@PathVariable Long id) {
        Workflow workflow = findOrThrow(id);
        return ResponseEntity.ok(Map.of("result", aiService.explainImprovements(workflow)));
    }

    private Workflow findOrThrow(Long id) {
        return workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found with id: " + id));
    }
}
