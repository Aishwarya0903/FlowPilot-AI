package com.flowpilot.service;

import com.flowpilot.dto.dashboard.RecentActivityItem;
import com.flowpilot.entity.AuditLog;
import com.flowpilot.entity.User;
import com.flowpilot.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(User actor, String action, String entityType, Long entityId, String details) {
        AuditLog log = AuditLog.builder()
                .actor(actor)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    public Page<AuditLog> getRecent(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public RecentActivityItem toActivityItem(AuditLog log) {
        return RecentActivityItem.builder()
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .actorName(log.getActor() != null ? log.getActor().getFullName() : "System")
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
