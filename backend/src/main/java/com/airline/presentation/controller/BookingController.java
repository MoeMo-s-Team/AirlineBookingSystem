package com.airline.presentation.controller;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.dto.CreateBookingCommand;
import com.airline.application.service.BookingService;
import com.airline.domain.enums.BookingStatus;
import com.airline.presentation.dto.request.BookingCreateRequest;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.BookingResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking", description = "APIs đặt vé máy bay và quản lý đơn đặt chỗ")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Tạo đơn đặt vé mới (Customer)")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @AuthenticationPrincipal ProfileIdentity principal,
            @Valid @RequestBody BookingCreateRequest request) {
        BookingResponse created = BookingResponse.from(bookingService.createBooking(principal, toCommand(request)));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đặt vé thành công", created));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy lịch sử đơn đặt vé của bản thân (Customer)")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal ProfileIdentity principal,
            @RequestParam(required = false) BookingStatus status) {
        List<BookingResponse> list = bookingService.getMyBookings(principal, status).stream().map(BookingResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết đơn đặt vé (Chính chủ)")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @AuthenticationPrincipal ProfileIdentity principal,
            @PathVariable Long id) {
        BookingResponse booking = BookingResponse.from(bookingService.getBookingDetail(principal, id));
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Hủy đơn đặt vé ở trạng thái PENDING (Chính chủ)")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @AuthenticationPrincipal ProfileIdentity principal,
            @PathVariable Long id) {
        BookingResponse cancelled = BookingResponse.from(bookingService.cancelBooking(principal, id));
        return ResponseEntity.ok(ApiResponse.success("Hủy đơn đặt vé thành công", cancelled));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Danh sách đơn đặt vé có phân trang và lọc (Admin)")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getBookingsAdmin(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) UUID userId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<BookingResponse> page = bookingService.getBookingsAdmin(status, userId, pageable).map(BookingResponse::from);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    private CreateBookingCommand toCommand(BookingCreateRequest request) {
        return new CreateBookingCommand(request.getFlightId(), request.getFareClassId(),
                request.getPassengers().stream()
                        .map(p -> new CreateBookingCommand.PassengerInput(p.getFullName(), p.getDateOfBirth(), p.getPassportNo(), p.getPhone()))
                        .toList(),
                request.getServices() == null ? List.of() : request.getServices().stream()
                        .map(s -> new CreateBookingCommand.ServiceInput(s.getServiceId(), s.getQuantity()))
                        .toList());
    }
}
