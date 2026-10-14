package com.airline.pattern.state;

import com.airline.application.exception.BookingConflictException;
import com.airline.domain.enums.BookingStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BookingStateContextTest {

    @Test
    void pendingState_canTransitionToConfirmed() {
        BookingStateContext context = new BookingStateContext(BookingStatus.PENDING);
        context.confirm();
        assertEquals(BookingStatus.CONFIRMED, context.getStatus());
    }

    @Test
    void pendingState_canTransitionToCancelled() {
        BookingStateContext context = new BookingStateContext(BookingStatus.PENDING);
        context.cancel();
        assertEquals(BookingStatus.CANCELLED, context.getStatus());
    }

    @Test
    void pendingState_canTransitionToPaymentFailed() {
        BookingStateContext context = new BookingStateContext(BookingStatus.PENDING);
        context.failPayment();
        assertEquals(BookingStatus.PAYMENT_FAILED, context.getStatus());
    }

    @Test
    void confirmedState_cannotTransition() {
        BookingStateContext context = new BookingStateContext(BookingStatus.CONFIRMED);
        assertThrows(BookingConflictException.class, context::confirm);
        assertThrows(BookingConflictException.class, context::cancel);
        assertThrows(BookingConflictException.class, context::failPayment);
    }

    @Test
    void cancelledState_cannotTransition() {
        BookingStateContext context = new BookingStateContext(BookingStatus.CANCELLED);
        assertThrows(BookingConflictException.class, context::confirm);
        assertThrows(BookingConflictException.class, context::cancel);
        assertThrows(BookingConflictException.class, context::failPayment);
    }

    @Test
    void paymentFailedState_cannotTransition() {
        BookingStateContext context = new BookingStateContext(BookingStatus.PAYMENT_FAILED);
        assertThrows(BookingConflictException.class, context::confirm);
        assertThrows(BookingConflictException.class, context::cancel);
        assertThrows(BookingConflictException.class, context::failPayment);
    }
}
