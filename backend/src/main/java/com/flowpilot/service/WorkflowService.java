package com.flowpilot.service;

import com.flowpilot.dto.PageResponse;
import com.flowpilot.dto.workflow.ApprovalActionRequest;
import com.flowpilot.dto.workflow.ApprovalStepResponse;
import com.flowpilot.dto.workflow.CommentRequest;
import com.flowpilot.dto.workflow.WorkflowRequest;
import com.flowpilot.dto.workflow.WorkflowResponse;
import com.flowpilot.entity.*;
import com.flowpilot.entity.enums.*;
import com.flowpilot.exception.BadRequestException;
import com.flowpilot.exception.ForbiddenActionException;
import com.flowpilot.exception.ResourceNotFoundException;
import com.flowpilot.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    // ---------------------------------------------------------------- CREATE

    @Transactional
    public WorkflowResponse create(WorkflowRequest request, User owner) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        Workflow workflow = Workflow.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .department(department)
                .owner(owner)
                .priority(request.getPriority())
                .status(WorkflowStatus.IN_PROGRESS)
                .currentStage(0)
                .dueDate(request.getDueDate())
                .build();

        List<ApprovalStep> steps = new ArrayList<>();
        int order = 0;
        for (Long approverId : request.getApproverIds()) {
            User approver = userRepository.findById(approverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Approver not found: id=" + approverId));
            steps.add(ApprovalStep.builder()
                    .workflow(workflow)
                    .stepOrder(order++)
                    .approver(approver)
                    .status(ApprovalStepStatus.PENDING)
                    .build());
        }
        workflow.setApprovalSteps(steps);

        workflow = workflowRepository.save(workflow);

        // Notify the first approver
        if (!steps.isEmpty()) {
            User firstApprover = steps.get(0).getApprover();
            notificationService.notify(firstApprover, NotificationType.APPROVAL_REQUIRED,
                    "Workflow \"" + workflow.getTitle() + "\" requires your approval", workflow.getId());
        }

        auditLogService.log(owner, "WORKFLOW_CREATED", "WORKFLOW", workflow.getId(),
                "Created workflow \"" + workflow.getTitle() + "\"");

        return toResponse(workflow);
    }

    // ------------------------------------------------------------------ READ

    public WorkflowResponse getById(Long id) {
        return toResponse(findWorkflowOrThrow(id));
    }

    /**
     * Search + filter + paginate workflows. All filters are optional; null
     * values are simply excluded from the generated SQL predicate.
     */
    public PageResponse<WorkflowResponse> search(String keyword, WorkflowStatus status, Priority priority,
                                                  Long departmentId, Long ownerId, Boolean archived, Pageable pageable) {

        Specification<Workflow> spec = Specification.where(null);

        if (keyword != null && !keyword.isBlank()) {
            String like = "%" + keyword.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("title")), like));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (priority != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("priority"), priority));
        }
        if (departmentId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("department").get("id"), departmentId));
        }
        if (ownerId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("owner").get("id"), ownerId));
        }
        spec = spec.and((root, query, cb) -> cb.equal(root.get("archived"), archived != null && archived));

        Page<Workflow> page = workflowRepository.findAll(spec, pageable);
        return PageResponse.from(page, this::toResponse);
    }

    // ---------------------------------------------------------------- UPDATE

    @Transactional
    public WorkflowResponse update(Long id, WorkflowRequest request, User requester) {
        Workflow workflow = findWorkflowOrThrow(id);
        assertOwnerOrAdmin(workflow, requester);

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        workflow.setTitle(request.getTitle());
        workflow.setDescription(request.getDescription());
        workflow.setDepartment(department);
        workflow.setPriority(request.getPriority());
        workflow.setDueDate(request.getDueDate());

        workflow = workflowRepository.save(workflow);
        auditLogService.log(requester, "WORKFLOW_UPDATED", "WORKFLOW", workflow.getId(), "Workflow details updated");

        return toResponse(workflow);
    }

    @Transactional
    public void archive(Long id, User requester) {
        Workflow workflow = findWorkflowOrThrow(id);
        assertOwnerOrAdmin(workflow, requester);
        workflow.setArchived(true);
        workflow.setStatus(WorkflowStatus.ARCHIVED);
        workflowRepository.save(workflow);
        auditLogService.log(requester, "WORKFLOW_ARCHIVED", "WORKFLOW", workflow.getId(), "Workflow archived");
    }

    @Transactional
    public void delete(Long id, User requester) {
        Workflow workflow = findWorkflowOrThrow(id);
        assertOwnerOrAdmin(workflow, requester);
        workflowRepository.delete(workflow);
        auditLogService.log(requester, "WORKFLOW_DELETED", "WORKFLOW", id, "Workflow permanently deleted");
    }

    // ------------------------------------------------------------- APPROVALS

    @Transactional
    public WorkflowResponse processApproval(Long workflowId, ApprovalActionRequest request, User actingManager) {
        Workflow workflow = findWorkflowOrThrow(workflowId);

        if (workflow.getStatus() == WorkflowStatus.COMPLETED || workflow.getStatus() == WorkflowStatus.ARCHIVED) {
            throw new BadRequestException("This workflow is already closed");
        }

        List<ApprovalStep> steps = workflow.getApprovalSteps();
        int currentStage = workflow.getCurrentStage();

        if (currentStage >= steps.size()) {
            throw new BadRequestException("No pending approval step for this workflow");
        }

        ApprovalStep currentStep = steps.get(currentStage);

        if (!currentStep.getApprover().getId().equals(actingManager.getId())
                && actingManager.getRole() != RoleName.ADMIN) {
            throw new ForbiddenActionException("You are not the assigned approver for the current stage");
        }

        currentStep.setRemarks(request.getRemarks());
        currentStep.setActedAt(java.time.LocalDateTime.now());

        switch (request.getAction()) {
            case APPROVE -> {
                currentStep.setStatus(ApprovalStepStatus.APPROVED);
                int nextStage = currentStage + 1;
                workflow.setCurrentStage(nextStage);

                if (nextStage >= steps.size()) {
                    workflow.setStatus(WorkflowStatus.COMPLETED);
                    notifyOwner(workflow, "Workflow \"" + workflow.getTitle() + "\" has been fully approved",
                            NotificationType.WORKFLOW_APPROVED);
                } else {
                    User nextApprover = steps.get(nextStage).getApprover();
                    notificationService.notify(nextApprover, NotificationType.APPROVAL_REQUIRED,
                            "Workflow \"" + workflow.getTitle() + "\" requires your approval", workflow.getId());
                }
                auditLogService.log(actingManager, "WORKFLOW_STEP_APPROVED", "WORKFLOW", workflow.getId(),
                        "Stage " + (currentStage + 1) + " approved");
            }
            case REJECT -> {
                currentStep.setStatus(ApprovalStepStatus.REJECTED);
                workflow.setStatus(WorkflowStatus.REJECTED);
                notifyOwner(workflow, "Workflow \"" + workflow.getTitle() + "\" was rejected",
                        NotificationType.WORKFLOW_REJECTED);
                auditLogService.log(actingManager, "WORKFLOW_REJECTED", "WORKFLOW", workflow.getId(),
                        "Rejected at stage " + (currentStage + 1));
            }
            case SEND_BACK -> {
                currentStep.setStatus(ApprovalStepStatus.SENT_BACK);
                workflow.setStatus(WorkflowStatus.SENT_BACK);
                notifyOwner(workflow, "Workflow \"" + workflow.getTitle() + "\" was sent back for revision",
                        NotificationType.WORKFLOW_SENT_BACK);
                auditLogService.log(actingManager, "WORKFLOW_SENT_BACK", "WORKFLOW", workflow.getId(),
                        "Sent back at stage " + (currentStage + 1));
            }
        }

        workflow = workflowRepository.save(workflow);
        return toResponse(workflow);
    }

    // -------------------------------------------------------------- COMMENTS

    @Transactional
    public void addComment(Long workflowId, CommentRequest request, User author) {
        Workflow workflow = findWorkflowOrThrow(workflowId);
        Comment comment = Comment.builder()
                .workflow(workflow)
                .author(author)
                .content(request.getContent())
                .build();
        commentRepository.save(comment);
        auditLogService.log(author, "COMMENT_ADDED", "WORKFLOW", workflowId, "Comment added");
    }

    // --------------------------------------------------------------- HELPERS

    private void notifyOwner(Workflow workflow, String message, NotificationType type) {
        notificationService.notify(workflow.getOwner(), type, message, workflow.getId());
    }

    private void assertOwnerOrAdmin(Workflow workflow, User requester) {
        boolean isOwner = workflow.getOwner().getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() == RoleName.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new ForbiddenActionException("Only the workflow owner or an admin can perform this action");
        }
    }

    private Workflow findWorkflowOrThrow(Long id) {
        return workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found with id: " + id));
    }

    private WorkflowResponse toResponse(Workflow w) {
        List<ApprovalStepResponse> stepResponses = w.getApprovalSteps().stream()
                .map(s -> ApprovalStepResponse.builder()
                        .id(s.getId())
                        .stepOrder(s.getStepOrder())
                        .approverId(s.getApprover().getId())
                        .approverName(s.getApprover().getFullName())
                        .status(s.getStatus())
                        .remarks(s.getRemarks())
                        .actedAt(s.getActedAt())
                        .build())
                .toList();

        return WorkflowResponse.builder()
                .id(w.getId())
                .title(w.getTitle())
                .description(w.getDescription())
                .departmentId(w.getDepartment().getId())
                .departmentName(w.getDepartment().getName())
                .ownerId(w.getOwner().getId())
                .ownerName(w.getOwner().getFullName())
                .priority(w.getPriority())
                .status(w.getStatus())
                .currentStage(w.getCurrentStage())
                .dueDate(w.getDueDate())
                .archived(w.isArchived())
                .approvalSteps(stepResponses)
                .createdAt(w.getCreatedAt())
                .updatedAt(w.getUpdatedAt())
                .build();
    }
}
