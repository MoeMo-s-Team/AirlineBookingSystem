package com.airline.presentation.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.airline.application.dto.BookingView;
import com.airline.application.dto.CreateBookingCommand;
import com.airline.application.dto.ProfileIdentity;
import com.airline.application.service.BookingService;
import com.airline.domain.enums.BookingStatus;
import com.airline.presentation.dto.request.BookingCreateRequest;
import com.airline.presentation.dto.request.PassengerRequest;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.BookingResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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

        BookingView mockResponse = bookingView(BookingStatus.PENDING);

        when(bookingService.createBooking(eq(customerPrincipal), any(CreateBookingCommand.class))).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<BookingResponse>> response = controller.createBooking(customerPrincipal, request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("BK123456", response.getBody().getData().getBookingCode());
    }

    @Test
    void cancelBooking_returnsOk() {
        BookingView mockResponse = bookingView(BookingStatus.CANCELLED);

        when(bookingService.cancelBooking(customerPrincipal, 100L)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<BookingResponse>> response = controller.cancelBooking(customerPrincipal, 100L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(BookingStatus.CANCELLED, response.getBody().getData().getStatus());
    }

    @Test
    void createBooking_acceptsExplicitNullServices() {
        BookingCreateRequest request = BookingCreateRequest.builder()
                .flightId(1L)
                .fareClassId(1L)
                .passengers(List.of(PassengerRequest.builder()
                        .fullName("Test")
                        .dateOfBirth(LocalDate.of(2000, 1, 1))
                        .passportNo("A123")
                        .phone("0987654321")
                        .build()))
                .services(null)
                .build();
        when(bookingService.createBooking(eq(customerPrincipal), any(CreateBookingCommand.class)))
                .thenReturn(bookingView(BookingStatus.PENDING));

        controller.createBooking(customerPrincipal, request);

        verify(bookingService).createBooking(eq(customerPrincipal), argThat(command -> command.services().isEmpty()));
    }

    @Test
    void bookingResponse_usesNestedSrsShape() {
        BookingResponse booking = BookingResponse.from(bookingView(BookingStatus.CONFIRMED));

        JsonNode json = new ObjectMapper().valueToTree(booking);

        assertEquals(3L, json.path("flight").path("id").asLong());
        assertEquals("VN123", json.path("flight").path("flightNumber").asText());
        assertEquals("Business", json.path("fareClass").path("name").asText());
        assertEquals(0, new BigDecimal("7300000.00").compareTo(json.path("priceBreakdown").path("total").decimalValue()));
        assertFalse(json.has("flightId"));
        assertFalse(json.has("payment"));
    }

    private BookingView bookingView(BookingStatus status) {
        return new BookingView(100L, "BK123456", status,
                new BookingView.FlightSummary(3L, "VN123", "SGN", "HAN", null),
                new BookingView.FareClassSummary(4L, "BUSINESS", "Business"), List.of(), List.of(),
                new BookingView.PriceBreakdown(new BigDecimal("7300000.00"), BigDecimal.ZERO, new BigDecimal("7300000.00")),
                new BigDecimal("7300000.00"), null, null, null);
    }
}
