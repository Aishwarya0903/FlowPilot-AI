package com.flowpilot.dto.workflow;

import com.flowpilot.entity.enums.ApprovalAction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApprovalActionRequest {

    @NotNull
    private ApprovalAction action;

    @Size(max = 1000)
    private String remarks;
}
