package com.airline.presentation.controller;

import com.airline.application.service.BookingService;
import com.airline.domain.enums.BookingStatus;
import com.airline.presentation.dto.request.BookingRequest;
import com.airline.presentation.dto.request.BookingStatusUpdateRequest;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.BookingDetailResponse;
import com.airline.presentation.dto.response.BookingResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@Validated
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking", description = "APIs tạo và quản lý booking")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Tạo booking (Customer)")
    public ResponseEntity<ApiResponse<BookingDetailResponse>> createBooking(
            Authentication authentication,
            @Valid @RequestBody BookingRequest request) {
        BookingDetailResponse created = bookingService.createBooking(currentUserId(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo booking thành công", created));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy lịch sử booking của người dùng hiện tại")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            Authentication authentication,
            @RequestParam(required = false) BookingStatus status) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.getUserBookings(currentUserId(authentication), status)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết booking của người dùng hiện tại")
    public ResponseEntity<ApiResponse<BookingDetailResponse>> getBooking(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.getBooking(currentUserId(authentication), id)));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Hủy booking đang chờ thanh toán")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Hủy booking thành công",
                bookingService.cancelBooking(currentUserId(authentication), id)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy danh sách booking (Admin)")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAdminBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) UUID userId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        Page<BookingResponse> bookings = bookingService.getAdminBookings(status, userId, page, size);
        ApiResponse.Pagination pagination = ApiResponse.Pagination.builder()
                .total(bookings.getTotalElements())
                .page(bookings.getNumber())
                .size(bookings.getSize())
                .totalPages(bookings.getTotalPages())
                .build();
        return ResponseEntity.ok(ApiResponse.successWithPagination(bookings.getContent(), pagination));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật trạng thái booking (Admin)")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật trạng thái booking thành công",
                bookingService.updateBookingStatus(id, request.getStatus())));
    }

    private UUID currentUserId(Authentication authentication) {
        try {
            return UUID.fromString(authentication.getName());
        } catch (RuntimeException ex) {
            throw new IllegalArgumentException("JWT subject không hợp lệ");
        }
    }
}
