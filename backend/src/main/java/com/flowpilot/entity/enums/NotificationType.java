package com.flowpilot.entity.enums;

/** Category of a notification, used for icon/routing on the frontend. */
public enum NotificationType {
    WORKFLOW_ASSIGNED,
    APPROVAL_REQUIRED,
    WORKFLOW_APPROVED,
    WORKFLOW_REJECTED,
    WORKFLOW_SENT_BACK,
    COMMENT_ADDED,
    WORKFLOW_DUE_SOON
}
