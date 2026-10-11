package com.airline.application.service;

import com.airline.domain.entity.AdditionalService;
import com.airline.domain.entity.Booking;
import com.airline.domain.entity.FareClass;
import com.airline.domain.entity.Flight;
import com.airline.domain.entity.Profile;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.enums.ServiceType;
import com.airline.domain.repository.BookingRepository;
import com.airline.domain.repository.FareClassRepository;
import com.airline.domain.repository.FlightRepository;
import com.airline.domain.repository.ProfileRepository;
import com.airline.domain.repository.ServiceRepository;
import com.airline.presentation.dto.request.BookingRequest;
import com.airline.presentation.dto.request.BookingServiceRequest;
import com.airline.presentation.dto.request.PassengerRequest;
import com.airline.presentation.dto.response.BookingDetailResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    private static final UUID USER_ID = UUID.fromString("72a8b0a7-d05d-4a29-82b5-bdc6ef826a1c");

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private FlightRepository flightRepository;
    @Mock
    private FareClassRepository fareClassRepository;
    @Mock
    private ServiceRepository serviceRepository;

    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(
                bookingRepository,
                profileRepository,
                flightRepository,
                fareClassRepository,
                serviceRepository);
    }

    @Test
    void createBookingCalculatesPriceAndSnapshotsServicePrice() {
        when(profileRepository.findById(USER_ID)).thenReturn(Optional.of(profile()));
        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight()));
        when(fareClassRepository.findById(2L)).thenReturn(Optional.of(fare()));
        when(serviceRepository.findById(3L)).thenReturn(Optional.of(service()));
        when(bookingRepository.existsByBookingCode(any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId(10L);
            return booking;
        });

        BookingDetailResponse response = bookingService.createBooking(USER_ID, request());

        ArgumentCaptor<Booking> captor = ArgumentCaptor.forClass(Booking.class);
        verify(bookingRepository).save(captor.capture());
        Booking saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(saved.getBookingCode()).matches("BK-[A-Z0-9]{6}");
        assertThat(saved.getTotalPrice()).isEqualByComparingTo("3400000.00");
        assertThat(saved.getPassengers()).hasSize(2);
        assertThat(saved.getServices()).singleElement().satisfies(item -> {
            assertThat(item.getQuantity()).isEqualTo(2);
            assertThat(item.getUnitPrice()).isEqualByComparingTo("200000");
        });
        assertThat(response.getPriceBreakdown().getBaseFare()).isEqualByComparingTo("3000000.00");
        assertThat(response.getPriceBreakdown().getServicesTotal()).isEqualByComparingTo("400000.00");
    }

    @Test
    void createBookingRejectsDuplicatePassportNumbers() {
        when(profileRepository.findById(USER_ID)).thenReturn(Optional.of(profile()));
        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight()));
        when(fareClassRepository.findById(2L)).thenReturn(Optional.of(fare()));
        BookingRequest request = request();
        request.getPassengers().get(1).setPassportNo(" p1234567 ");

        assertThatThrownBy(() -> bookingService.createBooking(USER_ID, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("không được trùng");
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBookingRejectsInactiveFareClass() {
        FareClass inactiveFare = fare();
        inactiveFare.setActive(false);
        when(profileRepository.findById(USER_ID)).thenReturn(Optional.of(profile()));
        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight()));
        when(fareClassRepository.findById(2L)).thenReturn(Optional.of(inactiveFare));

        assertThatThrownBy(() -> bookingService.createBooking(USER_ID, request()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("không còn hoạt động");
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void cancelBookingUsesStatePatternAndPersistsCancellation() {
        Booking booking = booking(BookingStatus.PENDING, USER_ID);
        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);

        var response = bookingService.cancelBooking(USER_ID, 10L);

        assertThat(response.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        verify(bookingRepository).save(booking);
    }

    @Test
    void cancelBookingRejectsTerminalStatusWithoutSaving() {
        Booking booking = booking(BookingStatus.CONFIRMED, USER_ID);
        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking(USER_ID, 10L))
                .isInstanceOf(IllegalStateException.class);
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void getBookingDoesNotExposeAnotherUsersBooking() {
        Booking booking = booking(BookingStatus.PENDING, UUID.randomUUID());
        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.getBooking(USER_ID, 10L))
                .isInstanceOf(com.airline.presentation.exception.ResourceNotFoundException.class);
    }

    @Test
    void getAdminBookingsAppliesRequestedPagination() {
        Booking booking = booking(BookingStatus.PENDING, USER_ID);
        when(bookingRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(booking), org.springframework.data.domain.PageRequest.of(1, 10), 11));

        var result = bookingService.getAdminBookings(BookingStatus.PENDING, USER_ID, 1, 10);

        assertThat(result.getContent()).singleElement().extracting("id").isEqualTo(10L);
        assertThat(result.getTotalElements()).isEqualTo(11);
    }

    @Test
    void updateBookingStatusUsesStatePattern() {
        Booking booking = booking(BookingStatus.PENDING, USER_ID);
        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);

        var response = bookingService.updateBookingStatus(10L, BookingStatus.CONFIRMED);

        assertThat(response.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        verify(bookingRepository).save(booking);
    }

    private BookingRequest request() {
        return BookingRequest.builder()
                .flightId(1L)
                .fareClassId(2L)
                .passengers(List.of(
                        passenger("Nguyen Van A", "P1234567", "0901234567"),
                        passenger("Tran Thi B", "P7654321", "0912345678")))
                .services(List.of(BookingServiceRequest.builder().serviceId(3L).quantity(2).build()))
                .build();
    }

    private PassengerRequest passenger(String name, String passportNo, String phone) {
        return PassengerRequest.builder()
                .fullName(name)
                .dateOfBirth(LocalDate.of(1990, 5, 15))
                .passportNo(passportNo)
                .phone(phone)
                .build();
    }

    private Profile profile() {
        return Profile.builder().id(USER_ID).email("user@example.com").fullName("User").build();
    }

    private Flight flight() {
        return Flight.builder()
                .id(1L)
                .flightNumber("VN1234")
                .origin("HAN")
                .destination("SGN")
                .departureTime(LocalDateTime.of(2026, 12, 25, 6, 0))
                .arrivalTime(LocalDateTime.of(2026, 12, 25, 8, 30))
                .basePrice(new BigDecimal("1000000"))
                .availableSeats(45)
                .build();
    }

    private FareClass fare() {
        return FareClass.builder()
                .id(2L)
                .code("PREMIUM")
                .name("Premium Economy")
                .priceMultiplier(new BigDecimal("1.5"))
                .active(true)
                .build();
    }

    private AdditionalService service() {
        return AdditionalService.builder()
                .id(3L)
                .name("Special Meal")
                .type(ServiceType.MEAL)
                .price(new BigDecimal("200000"))
                .active(true)
                .build();
    }

    private Booking booking(BookingStatus status, UUID userId) {
        return Booking.builder()
                .id(10L)
                .bookingCode("BK-ABC123")
                .user(Profile.builder().id(userId).build())
                .flight(flight())
                .fareClass(fare())
                .status(status)
                .totalPrice(new BigDecimal("1500000.00"))
                .build();
    }
}
