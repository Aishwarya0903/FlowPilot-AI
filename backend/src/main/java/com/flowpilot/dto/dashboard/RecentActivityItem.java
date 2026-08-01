package com.flowpilot.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class RecentActivityItem {
    private String action;
    private String entityType;
    private Long entityId;
    private String actorName;
    private String details;
    private LocalDateTime createdAt;
}
