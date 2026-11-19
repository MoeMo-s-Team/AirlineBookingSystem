package com.airline.presentation.controller;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.service.BookingService;
import com.airline.pattern.factory.*;
import com.airline.presentation.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings/{id}")
@RequiredArgsConstructor
public class TicketController {
    private final BookingService bookingService;
    private final ETicketFactory eTicketFactory;
    private final BoardingPassFactory boardingPassFactory;

    @GetMapping("/ticket")
    public ApiResponse<TicketDocument> ticket(@AuthenticationPrincipal ProfileIdentity principal, @PathVariable Long id) {
        return ApiResponse.success(eTicketFactory.create(bookingService.getBookingDetail(principal, id)));
    }

    @GetMapping("/boarding-pass")
    public ApiResponse<TicketDocument> boardingPass(@AuthenticationPrincipal ProfileIdentity principal, @PathVariable Long id) {
        return ApiResponse.success(boardingPassFactory.create(bookingService.getBookingDetail(principal, id)));
    }
}
