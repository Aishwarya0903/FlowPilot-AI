package com.flowpilot.repository;

import com.flowpilot.entity.ApprovalStep;
import com.flowpilot.entity.enums.ApprovalStepStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApprovalStepRepository extends JpaRepository<ApprovalStep, Long> {
    Page<ApprovalStep> findByApproverIdAndStatus(Long approverId, ApprovalStepStatus status, Pageable pageable);
}
