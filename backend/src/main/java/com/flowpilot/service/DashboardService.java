package com.flowpilot.service;

import com.flowpilot.dto.dashboard.DashboardResponse;
import com.flowpilot.entity.Workflow;
import com.flowpilot.entity.enums.WorkflowStatus;
import com.flowpilot.repository.AuditLogRepository;
import com.flowpilot.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final WorkflowRepository workflowRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;

    public DashboardResponse getSummary() {
        List<Workflow> all = workflowRepository.findAll();

        long total = all.size();
        long pending = all.stream().filter(w -> w.getStatus() == WorkflowStatus.IN_PROGRESS).count();
        long completed = all.stream().filter(w -> w.getStatus() == WorkflowStatus.COMPLETED).count();
        long rejected = all.stream().filter(w -> w.getStatus() == WorkflowStatus.REJECTED).count();

        long decided = completed + rejected;
        double approvalRate = decided == 0 ? 0.0 : (completed * 100.0) / decided;

        Map<String, Long> byStatus = all.stream()
                .collect(Collectors.groupingBy(w -> w.getStatus().name(), LinkedHashMap::new, Collectors.counting()));

        Map<String, Long> byDepartment = all.stream()
                .collect(Collectors.groupingBy(w -> w.getDepartment().getName(), LinkedHashMap::new, Collectors.counting()));

        var recentActivity = auditLogService.getRecent(PageRequest.of(0, 10)).getContent()
                .stream()
                .map(auditLogService::toActivityItem)
                .toList();

        return DashboardResponse.builder()
                .totalWorkflows(total)
                .pendingWorkflows(pending)
                .completedWorkflows(completed)
                .rejectedWorkflows(rejected)
                .approvalRate(Math.round(approvalRate * 10.0) / 10.0)
                .workflowsByStatus(byStatus)
                .workflowsByDepartment(byDepartment)
                .recentActivity(recentActivity)
                .build();
    }
}
