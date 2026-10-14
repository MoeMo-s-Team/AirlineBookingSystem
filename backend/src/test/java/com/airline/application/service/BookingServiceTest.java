package com.airline.application.service;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.exception.BookingConflictException;
import com.airline.domain.entity.*;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.repository.*;
import com.airline.pattern.observer.BookingSubject;
import com.airline.presentation.dto.request.BookingCreateRequest;
import com.airline.presentation.dto.request.BookingServiceItemRequest;
import com.airline.presentation.dto.request.PassengerRequest;
import com.airline.presentation.dto.response.BookingResponse;
import com.airline.presentation.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private FlightRepository flightRepository;
    @Mock
    private FareClassRepository fareClassRepository;
    @Mock
    private ServiceRepository additionalServiceRepository;
    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private BookingSubject bookingSubject;

    private BookingService bookingService;
    private ProfileIdentity customerPrincipal;
    private UUID userId;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(
                bookingRepository,
                flightRepository,
                fareClassRepository,
                additionalServiceRepository,
                profileRepository,
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
    void createBooking_success_calculatesPricing_andPublishesOnce() {
        Profile user = Profile.builder().id(userId).email("cust@test.com").build();
        Flight flight = Flight.builder().id(1L).flightNumber("VN123").basePrice(new BigDecimal("1000000.00")).build();
        FareClass fareClass = FareClass.builder().id(2L).name("BUSINESS").priceMultiplier(new BigDecimal("2.00")).active(true).build();
        AdditionalService service = AdditionalService.builder().id(3L).name("Baggage 20kg").price(new BigDecimal("200000.00")).active(true).build();

        when(profileRepository.findById(userId)).thenReturn(Optional.of(user));
        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));
        when(fareClassRepository.findById(2L)).thenReturn(Optional.of(fareClass));
        when(additionalServiceRepository.findById(3L)).thenReturn(Optional.of(service));
        when(bookingRepository.existsByBookingCode(any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(10L);
            return b;
        });

        PassengerRequest p1 = PassengerRequest.builder()
                .fullName("Nguyen Van A")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .passportNo("B1234567")
                .phone("0901234567")
                .build();
        BookingServiceItemRequest s1 = BookingServiceItemRequest.builder()
                .serviceId(3L)
                .quantity(2)
                .build();

        BookingCreateRequest request = BookingCreateRequest.builder()
                .flightId(1L)
                .fareClassId(2L)
                .passengers(List.of(p1))
                .services(List.of(s1))
                .build();

        BookingResponse response = bookingService.createBooking(customerPrincipal, request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals(BookingStatus.PENDING, response.getStatus());
        // Price: 1,000,000 * 2.00 * 1 passenger + 200,000 * 2 = 2,000,000 + 400,000 = 2,400,000
        assertEquals(new BigDecimal("2400000.00"), response.getTotalPrice());

        ArgumentCaptor<Booking> bookingCaptor = ArgumentCaptor.forClass(Booking.class);
        verify(bookingSubject).publishStatusChanged(bookingCaptor.capture(), isNull());
        assertEquals(10L, bookingCaptor.getValue().getId());
    }

    @Test
    void createBooking_rejectsInactiveFareClass() {
        Profile user = Profile.builder().id(userId).build();
        Flight flight = Flight.builder().id(1L).basePrice(new BigDecimal("1000000.00")).build();
        FareClass inactiveFare = FareClass.builder().id(2L).active(false).build();

        when(profileRepository.findById(userId)).thenReturn(Optional.of(user));
        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));
        when(fareClassRepository.findById(2L)).thenReturn(Optional.of(inactiveFare));

        BookingCreateRequest request = BookingCreateRequest.builder()
                .flightId(1L)
                .fareClassId(2L)
                .passengers(List.of(PassengerRequest.builder().fullName("A").dateOfBirth(LocalDate.of(1990, 1, 1)).passportNo("P1").phone("090").build()))
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> bookingService.createBooking(customerPrincipal, request));
        assertTrue(ex.getMessage().contains("ngừng áp dụng"));
    }

    @Test
    void createBooking_rejectsDuplicatePassportInSameBooking() {
        Profile user = Profile.builder().id(userId).build();
        Flight flight = Flight.builder().id(1L).basePrice(new BigDecimal("1000000.00")).build();
        FareClass fareClass = FareClass.builder().id(2L).active(true).priceMultiplier(BigDecimal.ONE).build();

        when(profileRepository.findById(userId)).thenReturn(Optional.of(user));
        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));
        when(fareClassRepository.findById(2L)).thenReturn(Optional.of(fareClass));

        PassengerRequest p1 = PassengerRequest.builder().fullName("A").dateOfBirth(LocalDate.of(1990, 1, 1)).passportNo("P123").phone("0901").build();
        PassengerRequest p2 = PassengerRequest.builder().fullName("B").dateOfBirth(LocalDate.of(1992, 1, 1)).passportNo("p123").phone("0902").build();

        BookingCreateRequest request = BookingCreateRequest.builder()
                .flightId(1L)
                .fareClassId(2L)
                .passengers(List.of(p1, p2))
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> bookingService.createBooking(customerPrincipal, request));
        assertTrue(ex.getMessage().contains("trùng lặp"));
    }

    @Test
    void cancelBooking_onlyWhenPending_andPublishesOnce() {
        Booking booking = Booking.builder()
                .id(10L)
                .status(BookingStatus.PENDING)
                .totalPrice(new BigDecimal("1000000.00"))
                .build();

        when(bookingRepository.findByIdAndUserIdForUpdate(10L, userId)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponse response = bookingService.cancelBooking(customerPrincipal, 10L);

        assertEquals(BookingStatus.CANCELLED, response.getStatus());
        verify(bookingSubject).publishStatusChanged(booking, BookingStatus.PENDING);
    }

    @Test
    void cancelBooking_failsWhenNotPending() {
        Booking booking = Booking.builder()
                .id(10L)
                .status(BookingStatus.CONFIRMED)
                .build();

        when(bookingRepository.findByIdAndUserIdForUpdate(10L, userId)).thenReturn(Optional.of(booking));

        assertThrows(BookingConflictException.class, () -> bookingService.cancelBooking(customerPrincipal, 10L));
        verify(bookingSubject, never()).publishStatusChanged(any(), any());
    }

    @Test
    void getBookingDetail_throwsNotFound_whenNotOwner() {
        when(bookingRepository.findByIdAndUserId(10L, userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> bookingService.getBookingDetail(customerPrincipal, 10L));
    }
}
