package com.flowpilot.entity.enums;

/**
 * System-defined roles. Kept as an enum (rather than a free-text column) so that
 * role checks in {@code @PreAuthorize} expressions and JWT claims stay type-safe.
 */
public enum RoleName {
    EMPLOYEE,
    MANAGER,
    ADMIN
}
