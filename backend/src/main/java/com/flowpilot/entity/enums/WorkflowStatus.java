package com.flowpilot.entity.enums;

/** Lifecycle state of a Workflow instance. */
public enum WorkflowStatus {
    DRAFT,
    IN_PROGRESS,
    APPROVED,
    REJECTED,
    SENT_BACK,
    COMPLETED,
    ARCHIVED
}
