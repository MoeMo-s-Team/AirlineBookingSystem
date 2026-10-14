package com.airline.presentation.controller;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.exception.BookingConflictException;
import com.airline.application.service.BookingService;
import com.airline.domain.enums.BookingStatus;
import com.airline.presentation.dto.request.BookingCreateRequest;
import com.airline.presentation.dto.request.PassengerRequest;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.BookingResponse;
import com.airline.presentation.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    private BookingController controller;
    private ProfileIdentity customerPrincipal;
    private UUID userId;

    @BeforeEach
    void setUp() {
        controller = new BookingController(bookingService);
        userId = UUID.randomUUID();
        customerPrincipal = ProfileIdentity.builder()
                .id(userId)
                .email("user@test.com")
                .role("CUSTOMER")
                .build();
    }

    @Test
    void createBooking_returnsCreated() {
        BookingCreateRequest request = BookingCreateRequest.builder()
                .flightId(1L)
                .fareClassId(1L)
                .passengers(List.of(PassengerRequest.builder()
                        .fullName("Test")
                        .dateOfBirth(LocalDate.of(2000, 1, 1))
                        .passportNo("A123")
                        .phone("0987654321")
                        .build()))
                .build();

        BookingResponse mockResponse = BookingResponse.builder()
                .id(100L)
                .bookingCode("BK123456")
                .totalPrice(new BigDecimal("1500000.00"))
                .status(BookingStatus.PENDING)
                .build();

        when(bookingService.createBooking(customerPrincipal, request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<BookingResponse>> response = controller.createBooking(customerPrincipal, request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("BK123456", response.getBody().getData().getBookingCode());
    }

    @Test
    void cancelBooking_returnsOk() {
        BookingResponse mockResponse = BookingResponse.builder()
                .id(100L)
                .status(BookingStatus.CANCELLED)
                .build();

        when(bookingService.cancelBooking(customerPrincipal, 100L)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<BookingResponse>> response = controller.cancelBooking(customerPrincipal, 100L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(BookingStatus.CANCELLED, response.getBody().getData().getStatus());
    }
}
