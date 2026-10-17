package com.airline.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.airline.application.dto.PaymentResult;
import com.airline.application.dto.ProcessPaymentCommand;
import com.airline.application.dto.ProfileIdentity;
import com.airline.application.exception.BookingConflictException;
import com.airline.domain.entity.Booking;
import com.airline.domain.entity.Payment;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.enums.PaymentStatus;
import com.airline.domain.repository.BookingRepository;
import com.airline.domain.repository.PaymentRepository;
import com.airline.pattern.observer.BookingSubject;
import com.airline.presentation.exception.ResourceNotFoundException;

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

        ProcessPaymentCommand request = new ProcessPaymentCommand(1L, "CREDIT_CARD");

        PaymentResult response = paymentService.processPayment(customerPrincipal, request);

        assertNotNull(response);
        assertEquals(50L, response.id());
        assertEquals(PaymentStatus.SUCCESS, response.status());
        assertEquals(new BigDecimal("1500000.00"), response.amount());
        assertNotNull(response.transactionRef());
        assertNotNull(response.paidAt());
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

        ProcessPaymentCommand request = new ProcessPaymentCommand(1L, "CREDIT_CARD");

        PaymentResult response = paymentService.processPayment(customerPrincipal, request);

        assertNotNull(response);
        assertEquals(51L, response.id());
        assertEquals(PaymentStatus.FAILED, response.status());
        assertNull(response.transactionRef());
        assertNull(response.paidAt());
        assertEquals(BookingStatus.PAYMENT_FAILED, booking.getStatus());

        verify(bookingSubject).publishStatusChanged(booking, BookingStatus.PENDING);
    }

    @ParameterizedTest
    @EnumSource(value = BookingStatus.class, names = {"CONFIRMED", "CANCELLED", "PAYMENT_FAILED"})
    void processPayment_notPending_throwsConflictBeforeGateway(BookingStatus status) {
        Booking booking = Booking.builder()
                .id(1L)
                .status(status)
                .totalPrice(new BigDecimal("1500000.00"))
                .build();

        when(bookingRepository.findByIdAndUserIdForUpdate(1L, userId)).thenReturn(Optional.of(booking));

        ProcessPaymentCommand request = new ProcessPaymentCommand(1L, "CREDIT_CARD");

        assertThrows(BookingConflictException.class, () -> paymentService.processPayment(customerPrincipal, request));
        verify(paymentRepository, never()).save(any());
        verify(bookingSubject, never()).publishStatusChanged(any(), any());
        verifyNoInteractions(paymentGateway);
    }

    @Test
    void processPayment_notOwner_throwsNotFound() {
        when(bookingRepository.findByIdAndUserIdForUpdate(1L, userId)).thenReturn(Optional.empty());

        ProcessPaymentCommand request = new ProcessPaymentCommand(1L, "CREDIT_CARD");

        assertThrows(ResourceNotFoundException.class, () -> paymentService.processPayment(customerPrincipal, request));
    }
}
