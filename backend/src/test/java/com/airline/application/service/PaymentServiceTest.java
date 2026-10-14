package com.airline.application.service;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.exception.BookingConflictException;
import com.airline.domain.entity.Booking;
import com.airline.domain.entity.Payment;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.enums.PaymentStatus;
import com.airline.domain.repository.BookingRepository;
import com.airline.domain.repository.PaymentRepository;
import com.airline.pattern.observer.BookingSubject;
import com.airline.presentation.dto.request.PaymentRequest;
import com.airline.presentation.dto.response.PaymentResponse;
import com.airline.presentation.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private PaymentGateway paymentGateway;
    @Mock
    private BookingSubject bookingSubject;

    private PaymentService paymentService;
    private ProfileIdentity customerPrincipal;
    private UUID userId;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                bookingRepository,
                paymentRepository,
                paymentGateway,
                bookingSubject
        );
        userId = UUID.randomUUID();
        customerPrincipal = ProfileIdentity.builder()
                .id(userId)
                .email("cust@test.com")
                .role("CUSTOMER")
                .build();
    }

    @Test
    void processPayment_success_confirmsBooking_andSetsTransactionRef() {
        Booking booking = Booking.builder()
                .id(1L)
                .status(BookingStatus.PENDING)
                .totalPrice(new BigDecimal("1500000.00"))
                .build();

        when(bookingRepository.findByIdAndUserIdForUpdate(1L, userId)).thenReturn(Optional.of(booking));
        when(paymentGateway.processPayment(1L, "CREDIT_CARD")).thenReturn(PaymentStatus.SUCCESS);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> {
            Payment p = i.getArgument(0);
            p.setId(50L);
            return p;
        });
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        PaymentRequest request = PaymentRequest.builder()
                .bookingId(1L)
                .paymentMethod("CREDIT_CARD")
                .build();

        PaymentResponse response = paymentService.processPayment(customerPrincipal, request);

        assertNotNull(response);
        assertEquals(50L, response.getId());
        assertEquals(PaymentStatus.SUCCESS, response.getStatus());
        assertEquals(new BigDecimal("1500000.00"), response.getAmount());
        assertNotNull(response.getTransactionRef());
        assertNotNull(response.getPaidAt());
        assertEquals(BookingStatus.CONFIRMED, booking.getStatus());

        verify(bookingSubject).publishStatusChanged(booking, BookingStatus.PENDING);
    }

    @Test
    void processPayment_failed_setsTerminalPaymentFailed_andNullTransactionRef() {
        Booking booking = Booking.builder()
                .id(1L)
                .status(BookingStatus.PENDING)
                .totalPrice(new BigDecimal("1500000.00"))
                .build();

        when(bookingRepository.findByIdAndUserIdForUpdate(1L, userId)).thenReturn(Optional.of(booking));
        when(paymentGateway.processPayment(1L, "CREDIT_CARD")).thenReturn(PaymentStatus.FAILED);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> {
            Payment p = i.getArgument(0);
            p.setId(51L);
            return p;
        });
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        PaymentRequest request = PaymentRequest.builder()
                .bookingId(1L)
                .paymentMethod("CREDIT_CARD")
                .build();

        PaymentResponse response = paymentService.processPayment(customerPrincipal, request);

        assertNotNull(response);
        assertEquals(51L, response.getId());
        assertEquals(PaymentStatus.FAILED, response.getStatus());
        assertNull(response.getTransactionRef());
        assertNull(response.getPaidAt());
        assertEquals(BookingStatus.PAYMENT_FAILED, booking.getStatus());

        verify(bookingSubject).publishStatusChanged(booking, BookingStatus.PENDING);
    }

    @Test
    void processPayment_notPending_throwsConflict() {
        Booking booking = Booking.builder()
                .id(1L)
                .status(BookingStatus.CONFIRMED)
                .totalPrice(new BigDecimal("1500000.00"))
                .build();

        when(bookingRepository.findByIdAndUserIdForUpdate(1L, userId)).thenReturn(Optional.of(booking));

        PaymentRequest request = PaymentRequest.builder()
                .bookingId(1L)
                .paymentMethod("CREDIT_CARD")
                .build();

        assertThrows(BookingConflictException.class, () -> paymentService.processPayment(customerPrincipal, request));
        verify(paymentRepository, never()).save(any());
        verify(bookingSubject, never()).publishStatusChanged(any(), any());
    }

    @Test
    void processPayment_notOwner_throwsNotFound() {
        when(bookingRepository.findByIdAndUserIdForUpdate(1L, userId)).thenReturn(Optional.empty());

        PaymentRequest request = PaymentRequest.builder()
                .bookingId(1L)
                .paymentMethod("CREDIT_CARD")
                .build();

        assertThrows(ResourceNotFoundException.class, () -> paymentService.processPayment(customerPrincipal, request));
    }
}
