package com.airline.application.service;

import com.airline.domain.entity.Booking;
import com.airline.domain.entity.Payment;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.enums.PaymentStatus;
import com.airline.domain.repository.BookingRepository;
import com.airline.domain.repository.PaymentRepository;
import com.airline.infrastructure.external.MockPaymentGateway;
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
@Transactional
public class PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final MockPaymentGateway paymentGateway;

    public PaymentResponse processPayment(UUID userId, PaymentRequest request) {
        if (request == null || request.getBookingId() == null || request.getPaymentMethod() == null) {
            throw new IllegalArgumentException("Thông tin thanh toán không hợp lệ");
        }

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> bookingNotFound(request.getBookingId()));
        if (booking.getUser() == null || !userId.equals(booking.getUser().getId())) {
            throw bookingNotFound(request.getBookingId());
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Chỉ có thể thanh toán booking đang ở trạng thái PENDING");
        }

        MockPaymentGateway.PaymentResult result = paymentGateway.processPayment(
                request.getPaymentMethod(), booking.getTotalPrice());
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalPrice())
                .paymentMethod(request.getPaymentMethod())
                .status(result.successful() ? PaymentStatus.SUCCESS : PaymentStatus.FAILED)
                .transactionRef(result.transactionRef())
                .paidAt(result.successful() ? LocalDateTime.now() : null)
                .build();
        Payment saved = paymentRepository.save(payment);

        BookingStateContext state = new BookingStateContext(booking);
        if (result.successful()) {
            state.confirm();
        } else {
            state.paymentFailed();
        }
        bookingRepository.save(booking);
        return PaymentResponse.fromEntity(saved);
    }

    private ResourceNotFoundException bookingNotFound(Long bookingId) {
        return new ResourceNotFoundException("Không tìm thấy booking với ID: " + bookingId);
    }
}
