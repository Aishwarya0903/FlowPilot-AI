package com.flowpilot.controller;

import com.flowpilot.dto.NotificationResponse;
import com.flowpilot.dto.PageResponse;
import com.flowpilot.entity.User;
import com.flowpilot.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notification center")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "List the current user's notifications, most recent first")
    public ResponseEntity<PageResponse<NotificationResponse>> getMine(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 15) Pageable pageable) {
        return ResponseEntity.ok(notificationService.getForUser(currentUser.getId(), pageable));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get the current user's unread notification count")
    public ResponseEntity<Map<String, Long>> unreadCount(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.unreadCount(currentUser.getId())));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a single notification as read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        notificationService.markAsRead(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
