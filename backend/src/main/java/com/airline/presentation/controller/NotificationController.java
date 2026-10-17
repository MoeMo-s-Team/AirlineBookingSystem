package com.airline.presentation.controller;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.dto.NotificationPageView;
import com.airline.application.service.NotificationService;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.NotificationPageResponse;
import com.airline.presentation.dto.response.NotificationReadResponse;
import com.airline.presentation.dto.response.NotificationReadAllResponse;
import com.airline.presentation.dto.response.NotificationResponse;
import com.airline.presentation.dto.response.NotificationUnreadCountResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
            @AuthenticationPrincipal ProfileIdentity principal,
            @RequestParam(required = false) String isRead,
            @RequestParam(defaultValue = "20") String limit,
            @RequestParam(defaultValue = "0") String offset) {
        NotificationPageView page = notificationService.list(
                principal.getId(),
                parseReadStatus(isRead),
                parseInteger(limit, "limit"),
                parseInteger(offset, "offset"));
        return ResponseEntity.ok(new NotificationPageResponse(
                true,
                page.data().stream().map(item -> new NotificationResponse(
                        item.id(), item.type(), item.message(), item.isRead(),
                        item.bookingId(), item.createdAt())).toList(),
                new NotificationPageResponse.Pagination(page.total(), page.limit(), page.offset())));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Số thông báo chưa đọc")
    public ResponseEntity<ApiResponse<NotificationUnreadCountResponse>> unreadCount(
            @AuthenticationPrincipal ProfileIdentity principal) {
        long count = notificationService.unreadCount(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(new NotificationUnreadCountResponse(count)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Đánh dấu thông báo của mình đã đọc")
    public ResponseEntity<ApiResponse<NotificationReadResponse>> markRead(
            @AuthenticationPrincipal ProfileIdentity principal, @PathVariable String id) {
        long notificationId = parseLong(id, "id");
        notificationService.markRead(principal.getId(), notificationId);
        return ResponseEntity.ok(ApiResponse.success(new NotificationReadResponse(notificationId, true)));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Đánh dấu tất cả thông báo của mình đã đọc")
    public ResponseEntity<ApiResponse<NotificationReadAllResponse>> markAllRead(
            @AuthenticationPrincipal ProfileIdentity principal) {
        int updatedCount = notificationService.markAllRead(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(new NotificationReadAllResponse(updatedCount)));
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
}
