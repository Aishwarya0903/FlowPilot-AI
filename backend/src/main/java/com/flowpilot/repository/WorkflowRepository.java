package com.flowpilot.repository;

import com.flowpilot.entity.Workflow;
import com.flowpilot.entity.enums.WorkflowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface WorkflowRepository extends JpaRepository<Workflow, Long>, JpaSpecificationExecutor<Workflow> {
    long countByStatus(WorkflowStatus status);
    long countByOwnerIdAndStatus(Long ownerId, WorkflowStatus status);
}
