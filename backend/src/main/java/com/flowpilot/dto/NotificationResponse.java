package com.flowpilot.dto;

import com.flowpilot.entity.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String message;
    private Long relatedWorkflowId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
