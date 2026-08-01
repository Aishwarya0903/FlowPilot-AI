package com.flowpilot.service.ai;

import com.flowpilot.entity.ApprovalStep;
import com.flowpilot.entity.Workflow;
import com.flowpilot.entity.enums.ApprovalStepStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Deterministic, rule-based stand-in for a real LLM. Used automatically when
 * {@code app.ai.provider=mock} (the default) or when no Gemini API key is
 * configured, so the AI-assisted features work out of the box in local dev
 * and CI without any external dependency.
 */
@Component
public class MockAiProvider implements AiProvider {

    @Override
    public List<String> suggestSteps(String title, String description, String department) {
        return List.of(
                department + " team lead review",
                "Compliance & policy check",
                department + " manager final approval"
        );
    }

    @Override
    public String recommendApprovers(String title, String description, String department, List<String> candidateNames) {
        if (candidateNames.isEmpty()) {
            return "No eligible approvers found in the " + department + " department yet.";
        }
        String top = candidateNames.get(0);
        return "Based on department alignment and current workload, " + top +
                " is recommended as the primary approver, with the remaining " +
                (candidateNames.size() - 1) + " candidate(s) as backups.";
    }

    @Override
    public String predictBottlenecks(Workflow workflow) {
        long pendingCount = workflow.getApprovalSteps().stream()
                .filter(s -> s.getStatus() == ApprovalStepStatus.PENDING)
                .count();

        if (pendingCount == 0) {
            return "No bottlenecks detected — all approval steps are resolved.";
        }
        if (pendingCount == 1) {
            return "Low risk: only one pending approval step remains.";
        }
        return "Potential bottleneck: " + pendingCount +
                " approval steps are still pending, which increases the risk of delay past the due date.";
    }

    @Override
    public String generateSummary(Workflow workflow) {
        String approvers = workflow.getApprovalSteps().stream()
                .map(ApprovalStep::getApprover)
                .filter(a -> a != null)
                .map(a -> a.getFullName())
                .collect(Collectors.joining(", "));

        return String.format(
                "\"%s\" is a %s-priority workflow in %s, currently at stage %d of %d and marked %s. Approvers: %s.",
                workflow.getTitle(),
                workflow.getPriority().name().toLowerCase(),
                workflow.getDepartment().getName(),
                workflow.getCurrentStage() + 1,
                workflow.getApprovalSteps().size(),
                workflow.getStatus().name().toLowerCase().replace('_', ' '),
                approvers.isEmpty() ? "none assigned" : approvers
        );
    }

    @Override
    public String explainImprovements(Workflow workflow) {
        int steps = workflow.getApprovalSteps().size();
        StringBuilder sb = new StringBuilder();
        if (steps > 3) {
            sb.append("Consider consolidating approval steps — chains longer than 3 stages tend to slow throughput. ");
        }
        if (workflow.getDueDate() == null) {
            sb.append("Add a due date so SLA tracking and reminders can kick in. ");
        }
        if (sb.isEmpty()) {
            sb.append("This workflow's structure looks efficient; no immediate improvements suggested.");
        }
        return sb.toString().trim();
    }
}
