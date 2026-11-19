package com.airline.pattern.facade;

import com.airline.application.dto.*;
import com.airline.application.service.BookingService;
import com.airline.application.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Single entry point for booking workflow commands. The booking subsystem owns
 * inventory locks, Strategy ticket pricing, Decorator service pricing, initial
 * State and Observer publication. Payment owns the gateway and subsequent States.
 * Read-only queries stay on BookingService.
 */
@Service
@RequiredArgsConstructor
public class BookingFacade {
    private final BookingService bookings;
    private final PaymentService payments;

    public BookingView createBooking(ProfileIdentity customer, CreateBookingCommand command) {
        return bookings.createBooking(customer, command);
    }

    public BookingView cancelBooking(ProfileIdentity customer, Long id) {
        return bookings.cancelBooking(customer, id);
    }

    public PaymentResult pay(ProfileIdentity customer, ProcessPaymentCommand command) {
        return payments.processPayment(customer, command);
    }
}
