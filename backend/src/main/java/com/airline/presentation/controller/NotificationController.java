package com.airline.presentation.controller;

import com.airline.application.service.NotificationService;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.NotificationPageResponse;
import com.airline.presentation.dto.response.NotificationReadResponse;
import com.airline.presentation.dto.response.NotificationUnreadCountResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Notification", description = "Thông báo của người dùng hiện tại")
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Danh sách thông báo của người dùng hiện tại")
    public ResponseEntity<NotificationPageResponse> list(
            Authentication authentication,
            @RequestParam(required = false) String isRead,
            @RequestParam(defaultValue = "20") String limit,
            @RequestParam(defaultValue = "0") String offset) {
        return ResponseEntity.ok(notificationService.list(
                currentUserId(authentication),
                parseReadStatus(isRead),
                parseInteger(limit, "limit"),
                parseInteger(offset, "offset")));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Số thông báo chưa đọc")
    public ResponseEntity<ApiResponse<NotificationUnreadCountResponse>> unreadCount(Authentication authentication) {
        long count = notificationService.unreadCount(currentUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(new NotificationUnreadCountResponse(count)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Đánh dấu thông báo của mình đã đọc")
    public ResponseEntity<ApiResponse<NotificationReadResponse>> markRead(
            Authentication authentication, @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.markRead(
                currentUserId(authentication), parseLong(id, "id"))));
    }

    private Boolean parseReadStatus(String value) {
        if (value == null || value.isBlank()) return null;
        if ("true".equalsIgnoreCase(value)) return true;
        if ("false".equalsIgnoreCase(value)) return false;
        throw new IllegalArgumentException("isRead phải là true hoặc false");
    }

    private int parseInteger(String value, String field) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException(field + " phải là số nguyên");
        }
    }

    private long parseLong(String value, String field) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException(field + " phải là số nguyên");
        }
    }

    private UUID currentUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
