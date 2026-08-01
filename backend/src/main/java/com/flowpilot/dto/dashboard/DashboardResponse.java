package com.flowpilot.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class DashboardResponse {
    private long totalWorkflows;
    private long pendingWorkflows;
    private long completedWorkflows;
    private long rejectedWorkflows;
    private double approvalRate; // percentage, 0-100
    private Map<String, Long> workflowsByStatus;
    private Map<String, Long> workflowsByDepartment;
    private List<RecentActivityItem> recentActivity;
}
