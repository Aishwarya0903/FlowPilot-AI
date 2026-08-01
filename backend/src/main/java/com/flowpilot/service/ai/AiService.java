package com.flowpilot.service.ai;

import com.flowpilot.entity.Workflow;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Facade used by controllers/services. Selects the active {@link AiProvider}
 * at request time based on {@code app.ai.provider}, falling back to the mock
 * provider whenever Gemini is selected but no API key is configured — this
 * keeps the app fully functional without any external credentials.
 */
@Service
public class AiService {

    private final MockAiProvider mockAiProvider;
    private final GeminiAiProvider geminiAiProvider;

    @Value("${app.ai.provider:mock}")
    private String provider;

    @Value("${app.ai.gemini-api-key:}")
    private String geminiApiKey;

    public AiService(MockAiProvider mockAiProvider, GeminiAiProvider geminiAiProvider) {
        this.mockAiProvider = mockAiProvider;
        this.geminiAiProvider = geminiAiProvider;
    }

    private AiProvider activeProvider() {
        boolean useGemini = "gemini".equalsIgnoreCase(provider) && geminiApiKey != null && !geminiApiKey.isBlank();
        return useGemini ? geminiAiProvider : mockAiProvider;
    }

    public List<String> suggestSteps(String title, String description, String department) {
        return activeProvider().suggestSteps(title, description, department);
    }

    public String recommendApprovers(String title, String description, String department, List<String> candidateNames) {
        return activeProvider().recommendApprovers(title, description, department, candidateNames);
    }

    public String predictBottlenecks(Workflow workflow) {
        return activeProvider().predictBottlenecks(workflow);
    }

    public String generateSummary(Workflow workflow) {
        return activeProvider().generateSummary(workflow);
    }

    public String explainImprovements(Workflow workflow) {
        return activeProvider().explainImprovements(workflow);
    }
}
