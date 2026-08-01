package com.flowpilot.service;

import com.flowpilot.dto.NotificationResponse;
import com.flowpilot.dto.PageResponse;
import com.flowpilot.entity.Notification;
import com.flowpilot.entity.User;
import com.flowpilot.entity.enums.NotificationType;
import com.flowpilot.exception.ResourceNotFoundException;
import com.flowpilot.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void notify(User recipient, NotificationType type, String message, Long relatedWorkflowId) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .message(message)
                .relatedWorkflowId(relatedWorkflowId)
                .build();
        notificationRepository.save(notification);
    }

    public PageResponse<NotificationResponse> getForUser(Long userId, Pageable pageable) {
        return PageResponse.from(
                notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable),
                this::toResponse
        );
    }

    public long unreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long requestingUserId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getRecipient().getId().equals(requestingUserId)) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .message(n.getMessage())
                .relatedWorkflowId(n.getRelatedWorkflowId())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
