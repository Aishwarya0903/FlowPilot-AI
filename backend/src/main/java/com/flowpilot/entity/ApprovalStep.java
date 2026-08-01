package com.flowpilot.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.flowpilot.entity.enums.ApprovalStepStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * A single approval gate within a {@link Workflow}. Steps are ordered by
 * {@link #stepOrder} and processed sequentially.
 */
@Entity
@Table(name = "approval_steps", indexes = {
        @Index(name = "idx_approval_steps_workflow", columnList = "workflow_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workflow_id")
    @JsonIgnore
    private Workflow workflow;

    @Column(nullable = false)
    private Integer stepOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "approver_id")
    private User approver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ApprovalStepStatus status = ApprovalStepStatus.PENDING;

    @Column(length = 1000)
    private String remarks;

    private LocalDateTime actedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
