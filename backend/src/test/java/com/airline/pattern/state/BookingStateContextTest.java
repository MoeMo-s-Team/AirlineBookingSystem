package com.airline.pattern.state;

import com.airline.domain.entity.Booking;
import com.airline.domain.enums.BookingStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BookingStateContextTest {

    @Test
    void pendingBookingCanBeConfirmed() {
        Booking booking = bookingWithStatus(BookingStatus.PENDING);
        BookingStateContext context = new BookingStateContext(booking);

        context.confirm();

        assertThat(context.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test
    void pendingBookingCanBeCancelled() {
        Booking booking = bookingWithStatus(BookingStatus.PENDING);
        BookingStateContext context = new BookingStateContext(booking);

        context.cancel();

        assertThat(context.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
    }

    @Test
    void pendingBookingCanBeMarkedPaymentFailed() {
        Booking booking = bookingWithStatus(BookingStatus.PENDING);
        BookingStateContext context = new BookingStateContext(booking);

        context.paymentFailed();

        assertThat(context.getStatus()).isEqualTo(BookingStatus.PAYMENT_FAILED);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.PAYMENT_FAILED);
    }

    @Test
    void terminalStatesRejectFurtherTransitions() {
        for (BookingStatus status : new BookingStatus[] {
                BookingStatus.CONFIRMED,
                BookingStatus.CANCELLED,
                BookingStatus.PAYMENT_FAILED
        }) {
            BookingStateContext context = new BookingStateContext(bookingWithStatus(status));

            assertThatThrownBy(context::confirm).isInstanceOf(IllegalStateException.class);
            assertThatThrownBy(context::cancel).isInstanceOf(IllegalStateException.class);
            assertThatThrownBy(context::paymentFailed).isInstanceOf(IllegalStateException.class);
        }
    }

    @Test
    void contextRejectsNullBooking() {
        assertThatThrownBy(() -> new BookingStateContext(null))
                .isInstanceOf(NullPointerException.class);
    }

    private Booking bookingWithStatus(BookingStatus status) {
        return Booking.builder().status(status).build();
    }
}
