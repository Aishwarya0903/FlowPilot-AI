package com.flowpilot.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowpilot.entity.Workflow;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Real AI provider backed by Google's Gemini API. Only activated when
 * {@code app.ai.provider=gemini} AND a non-blank {@code app.ai.gemini-api-key}
 * is configured; otherwise {@link AiService} falls back to {@link MockAiProvider}.
 */
@Component
public class GeminiAiProvider implements AiProvider {

    @Value("${app.ai.gemini-api-key:}")
    private String apiKey;

    @Value("${app.ai.gemini-model:gemini-1.5-flash}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String callGemini(String prompt) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + model + ":generateContent?key=" + apiKey;

            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            JsonNode response = restTemplate.postForObject(url, entity, JsonNode.class);
            return response
                    .path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text").asText("AI response unavailable.");
        } catch (Exception ex) {
            return "AI service temporarily unavailable: " + ex.getMessage();
        }
    }

    @Override
    public List<String> suggestSteps(String title, String description, String department) {
        String prompt = String.format(
                "Suggest 3-5 short approval step names (comma separated only, no numbering) " +
                "for a workflow titled '%s' in the '%s' department. Description: %s",
                title, department, description);
        String raw = callGemini(prompt);
        List<String> steps = new ArrayList<>();
        for (String s : raw.split(",")) {
            String trimmed = s.trim();
            if (!trimmed.isEmpty()) steps.add(trimmed);
        }
        return steps.isEmpty() ? List.of("Manager review") : steps;
    }

    @Override
    public String recommendApprovers(String title, String description, String department, List<String> candidateNames) {
        String prompt = String.format(
                "Given candidates %s for approving a '%s' department workflow titled '%s', " +
                "recommend the best approver and briefly explain why (2 sentences max).",
                candidateNames, department, title);
        return callGemini(prompt);
    }

    @Override
    public String predictBottlenecks(Workflow workflow) {
        String prompt = "Analyze this workflow JSON and predict likely bottlenecks in 2-3 sentences: "
                + workflow.getTitle() + " | status=" + workflow.getStatus()
                + " | stage=" + workflow.getCurrentStage() + "/" + workflow.getApprovalSteps().size();
        return callGemini(prompt);
    }

    @Override
    public String generateSummary(Workflow workflow) {
        String prompt = "Summarize this workflow in 2 sentences for a busy manager: title='"
                + workflow.getTitle() + "', description='" + workflow.getDescription() + "'.";
        return callGemini(prompt);
    }

    @Override
    public String explainImprovements(Workflow workflow) {
        String prompt = "Suggest 1-2 concrete process improvements for this workflow: title='"
                + workflow.getTitle() + "', steps=" + workflow.getApprovalSteps().size() + ".";
        return callGemini(prompt);
    }
}
