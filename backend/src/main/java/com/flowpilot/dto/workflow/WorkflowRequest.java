package com.flowpilot.dto.workflow;

import com.flowpilot.entity.enums.Priority;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class WorkflowRequest {

    @NotBlank
    @Size(max = 150)
    private String title;

    @Size(max = 2000)
    private String description;

    @NotNull
    private Long departmentId;

    @NotNull
    private Priority priority;

    @FutureOrPresent(message = "Due date cannot be in the past")
    private LocalDate dueDate;

    /** Ordered list of approver user IDs; one ApprovalStep is created per entry. */
    @NotEmpty(message = "At least one approver is required")
    private List<Long> approverIds;
}
