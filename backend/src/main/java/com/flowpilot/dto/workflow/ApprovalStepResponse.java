package com.flowpilot.dto.workflow;

import com.flowpilot.entity.enums.ApprovalStepStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ApprovalStepResponse {
    private Long id;
    private Integer stepOrder;
    private Long approverId;
    private String approverName;
    private ApprovalStepStatus status;
    private String remarks;
    private LocalDateTime actedAt;
}
