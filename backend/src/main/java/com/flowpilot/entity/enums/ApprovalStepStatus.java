package com.flowpilot.entity.enums;

/** State of a single step within a workflow's approval chain. */
public enum ApprovalStepStatus {
    PENDING,
    APPROVED,
    REJECTED,
    SENT_BACK,
    SKIPPED
}
