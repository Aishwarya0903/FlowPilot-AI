package com.flowpilot.controller;

import com.flowpilot.dto.PageResponse;
import com.flowpilot.dto.workflow.*;
import com.flowpilot.entity.User;
import com.flowpilot.entity.enums.Priority;
import com.flowpilot.entity.enums.WorkflowStatus;
import com.flowpilot.service.WorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
@Tag(name = "Workflows", description = "Create, manage, search and approve workflows")
public class WorkflowController {

    private final WorkflowService workflowService;

    @PostMapping
    @Operation(summary = "Create a new workflow")
    public ResponseEntity<WorkflowResponse> create(@Valid @RequestBody WorkflowRequest request,
                                                     @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workflowService.create(request, currentUser));
    }

    @GetMapping
    @Operation(summary = "Search, filter, sort and paginate workflows")
    public ResponseEntity<PageResponse<WorkflowResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) WorkflowStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) Boolean archived,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(
                workflowService.search(keyword, status, priority, departmentId, ownerId, archived, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single workflow by id")
    public ResponseEntity<WorkflowResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(workflowService.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a workflow's details (owner or admin only)")
    public ResponseEntity<WorkflowResponse> update(@PathVariable Long id,
                                                     @Valid @RequestBody WorkflowRequest request,
                                                     @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(workflowService.update(id, request, currentUser));
    }

    @PatchMapping("/{id}/archive")
    @Operation(summary = "Archive a workflow (owner or admin only)")
    public ResponseEntity<Void> archive(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        workflowService.archive(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Permanently delete a workflow (owner or admin only)")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        workflowService.delete(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/approval-action")
    @Operation(summary = "Approve, reject, or send back the current approval stage")
    public ResponseEntity<WorkflowResponse> processApproval(@PathVariable Long id,
                                                              @Valid @RequestBody ApprovalActionRequest request,
                                                              @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(workflowService.processApproval(id, request, currentUser));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add a comment to a workflow's activity thread")
    public ResponseEntity<Void> addComment(@PathVariable Long id,
                                            @Valid @RequestBody CommentRequest request,
                                            @AuthenticationPrincipal User currentUser) {
        workflowService.addComment(id, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
