package com.airline.application.service;

import com.airline.domain.entity.Booking;
import com.airline.domain.entity.Payment;
import com.airline.domain.entity.Profile;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.enums.PaymentStatus;
import com.airline.domain.repository.BookingRepository;
import com.airline.domain.repository.PaymentRepository;
import com.airline.infrastructure.external.MockPaymentGateway;
import com.airline.presentation.dto.request.PaymentRequest;
import com.airline.presentation.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    private static final UUID USER_ID = UUID.fromString("72a8b0a7-d05d-4a29-82b5-bdc6ef826a1c");

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private MockPaymentGateway paymentGateway;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(bookingRepository, paymentRepository, paymentGateway);
    }

    @Test
    void successfulPaymentUsesBookingTotalAndConfirmsBooking() {
        Booking booking = booking(BookingStatus.PENDING, USER_ID);
        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(paymentGateway.processPayment("CREDIT_CARD", booking.getTotalPrice()))
                .thenReturn(new MockPaymentGateway.PaymentResult(true, "TXN-test"));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment payment = invocation.getArgument(0);
            payment.setId(20L);
            return payment;
        });

        var response = paymentService.processPayment(USER_ID,
                PaymentRequest.builder().bookingId(10L).paymentMethod("CREDIT_CARD").build());

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());
        assertThat(paymentCaptor.getValue().getAmount()).isEqualByComparingTo("1500000.00");
        assertThat(paymentCaptor.getValue().getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(response.getTransactionRef()).isEqualTo("TXN-test");
        assertThat(response.getPaidAt()).isNotNull();
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        verify(bookingRepository).save(booking);
    }

    @Test
    void failedMockPaymentPersistsFailureAndMarksBookingFailed() {
        Booking booking = booking(BookingStatus.PENDING, USER_ID);
        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(paymentGateway.processPayment("MOCK", booking.getTotalPrice()))
                .thenReturn(new MockPaymentGateway.PaymentResult(false, null));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = paymentService.processPayment(USER_ID,
                PaymentRequest.builder().bookingId(10L).paymentMethod("MOCK").build());

        assertThat(response.getStatus()).isEqualTo(PaymentStatus.FAILED);
        assertThat(response.getTransactionRef()).isNull();
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.PAYMENT_FAILED);
        verify(bookingRepository).save(booking);
    }

    @Test
    void foreignBookingIsReportedAsNotFound() {
        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking(BookingStatus.PENDING, UUID.randomUUID())));

        assertThatThrownBy(() -> paymentService.processPayment(USER_ID,
                PaymentRequest.builder().bookingId(10L).paymentMethod("MOCK").build()))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void nonPendingBookingCannotBePaid() {
        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking(BookingStatus.CONFIRMED, USER_ID)));

        assertThatThrownBy(() -> paymentService.processPayment(USER_ID,
                PaymentRequest.builder().bookingId(10L).paymentMethod("MOCK").build()))
                .isInstanceOf(IllegalStateException.class);
        verify(paymentRepository, never()).save(any());
    }

    private Booking booking(BookingStatus status, UUID userId) {
        return Booking.builder()
                .id(10L)
                .user(Profile.builder().id(userId).build())
                .status(status)
                .totalPrice(new BigDecimal("1500000.00"))
                .build();
    }
}
