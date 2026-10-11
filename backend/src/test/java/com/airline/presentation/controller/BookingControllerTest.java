package com.airline.presentation.controller;

import com.airline.application.service.BookingService;
import com.airline.domain.enums.BookingStatus;
import com.airline.presentation.dto.response.BookingResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    private static final UUID USER_ID = UUID.fromString("72a8b0a7-d05d-4a29-82b5-bdc6ef826a1c");

    @Mock
    private BookingService bookingService;

    private BookingController controller;

    @BeforeEach
    void setUp() {
        controller = new BookingController(bookingService);
    }

    @Test
    void getMyBookingsUsesAuthenticatedUserAndOptionalStatus() {
        when(bookingService.getUserBookings(USER_ID, BookingStatus.CONFIRMED))
                .thenReturn(List.of(BookingResponse.builder().id(10L).status(BookingStatus.CONFIRMED).build()));

        var response = controller.getMyBookings(authentication(), BookingStatus.CONFIRMED);

        assertThat(response.getBody().getData()).singleElement().extracting("id").isEqualTo(10L);
        verify(bookingService).getUserBookings(USER_ID, BookingStatus.CONFIRMED);
    }

    @Test
    void getAdminBookingsReturnsPaginationMetadata() {
        when(bookingService.getAdminBookings(null, USER_ID, 1, 10))
                .thenReturn(new PageImpl<>(List.of(BookingResponse.builder().id(10L).build()), PageRequest.of(1, 10), 11));

        var response = controller.getAdminBookings(null, USER_ID, 1, 10);

        assertThat(response.getBody().getPagination().getTotal()).isEqualTo(11);
        assertThat(response.getBody().getPagination().getTotalPages()).isEqualTo(2);
    }

    private UsernamePasswordAuthenticationToken authentication() {
        return new UsernamePasswordAuthenticationToken(USER_ID.toString(), null);
    }
}
