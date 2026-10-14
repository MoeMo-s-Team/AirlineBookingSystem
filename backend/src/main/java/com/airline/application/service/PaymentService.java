package com.airline.application.service;

import com.airline.application.dto.ProfileIdentity;
import com.airline.domain.entity.Booking;
import com.airline.domain.entity.Payment;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.enums.PaymentStatus;
import com.airline.domain.repository.BookingRepository;
import com.airline.domain.repository.PaymentRepository;
import com.airline.pattern.observer.BookingSubject;
import com.airline.pattern.state.BookingStateContext;
import com.airline.presentation.dto.request.PaymentRequest;
import com.airline.presentation.dto.response.PaymentResponse;
import com.airline.presentation.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentGateway paymentGateway;
    private final BookingSubject bookingSubject;

    @Transactional
    public PaymentResponse processPayment(ProfileIdentity principal, PaymentRequest request) {
        Booking booking = bookingRepository.findByIdAndUserIdForUpdate(request.getBookingId(), principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Đơn đặt vé không tồn tại"));

        BookingStatus previousStatus = booking.getStatus();
        BookingStateContext stateContext = new BookingStateContext(previousStatus);

        PaymentStatus gatewayResult = paymentGateway.processPayment(booking.getId(), request.getPaymentMethod());

        String transactionRef = null;
        LocalDateTime paidAt = null;

        if (gatewayResult == PaymentStatus.SUCCESS) {
            stateContext.confirm();
            transactionRef = "TXN_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
            paidAt = LocalDateTime.now();
        } else {
            stateContext.failPayment();
        }

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalPrice())
                .paymentMethod(request.getPaymentMethod())
                .status(gatewayResult)
                .transactionRef(transactionRef)
                .paidAt(paidAt)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        booking.setStatus(stateContext.getStatus());
        Booking savedBooking = bookingRepository.save(booking);

        bookingSubject.publishStatusChanged(savedBooking, previousStatus);

        return PaymentResponse.builder()
                .id(savedPayment.getId())
                .bookingId(booking.getId())
                .amount(savedPayment.getAmount())
                .paymentMethod(savedPayment.getPaymentMethod())
                .status(savedPayment.getStatus())
                .transactionRef(savedPayment.getTransactionRef())
                .paidAt(savedPayment.getPaidAt())
                .createdAt(savedPayment.getCreatedAt())
                .build();
    }
}
