package com.flowpilot.dto.workflow;

import com.flowpilot.entity.enums.Priority;
import com.flowpilot.entity.enums.WorkflowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class WorkflowResponse {
    private Long id;
    private String title;
    private String description;
    private Long departmentId;
    private String departmentName;
    private Long ownerId;
    private String ownerName;
    private Priority priority;
    private WorkflowStatus status;
    private Integer currentStage;
    private LocalDate dueDate;
    private boolean archived;
    private List<ApprovalStepResponse> approvalSteps;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
