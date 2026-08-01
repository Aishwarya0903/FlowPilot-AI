package com.flowpilot.service.ai;

import com.flowpilot.entity.Workflow;

import java.util.List;

/**
 * Abstraction over an AI backend used for workflow assistance features.
 * Swapping providers (mock, Gemini, OpenAI, etc.) only requires a new
 * implementation of this interface plus a wiring change in {@link AiService}
 * — no controller/service code elsewhere needs to change.
 */
public interface AiProvider {

    /** Suggests an ordered list of approval step descriptions for a new workflow. */
    List<String> suggestSteps(String title, String description, String department);

    /** Recommends which existing users (by name) look like good approvers, with reasoning. */
    String recommendApprovers(String title, String description, String department, List<String> candidateNames);

    /** Flags likely bottlenecks given a workflow's current approval chain state. */
    String predictBottlenecks(Workflow workflow);

    /** Produces a short human-readable summary of a workflow's purpose and status. */
    String generateSummary(Workflow workflow);

    /** Suggests concrete process improvements for a workflow. */
    String explainImprovements(Workflow workflow);
}
