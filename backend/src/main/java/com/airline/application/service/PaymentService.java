package com.airline.application.service;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.dto.PaymentResult;
import com.airline.application.dto.ProcessPaymentCommand;
import com.airline.application.exception.BookingConflictException;
import com.airline.domain.entity.Booking;
import com.airline.domain.entity.Payment;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.enums.PaymentStatus;
import com.airline.domain.repository.BookingRepository;
import com.airline.domain.repository.PaymentRepository;
import com.airline.pattern.observer.BookingSubject;
import com.airline.pattern.state.BookingStateContext;
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
    public PaymentResult processPayment(ProfileIdentity principal, ProcessPaymentCommand request) {
        Booking booking = bookingRepository.findByIdAndUserIdForUpdate(request.bookingId(), principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Đơn đặt vé không tồn tại"));

        BookingStatus previousStatus = booking.getStatus();
        BookingStateContext stateContext = new BookingStateContext(previousStatus);

        if (previousStatus != BookingStatus.PENDING) {
            throw new BookingConflictException("Only pending bookings can be paid");
        }

        PaymentStatus gatewayResult = paymentGateway.processPayment(booking.getId(), request.paymentMethod());

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
                .paymentMethod(request.paymentMethod())
                .status(gatewayResult)
                .transactionRef(transactionRef)
                .paidAt(paidAt)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        booking.setStatus(stateContext.getStatus());
        Booking savedBooking = bookingRepository.save(booking);

        bookingSubject.publishStatusChanged(savedBooking, previousStatus);

        return new PaymentResult(savedPayment.getId(), booking.getId(), savedPayment.getAmount(),
                savedPayment.getPaymentMethod(), savedPayment.getStatus(), savedPayment.getTransactionRef(),
                savedPayment.getPaidAt(), savedPayment.getCreatedAt());
    }
}
