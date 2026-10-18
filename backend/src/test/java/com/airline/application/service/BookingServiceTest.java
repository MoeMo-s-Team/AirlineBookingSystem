package com.airline.application.service;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.dto.BookingView;
import com.airline.application.dto.CreateBookingCommand;
import com.airline.application.exception.BookingConflictException;
import com.airline.domain.entity.*;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.repository.*;
import com.airline.pattern.observer.BookingSubject;
import com.airline.pattern.strategy.PricingContext;
import com.airline.pattern.strategy.PricingStrategy;
import com.airline.pattern.strategy.PricingStrategyFactory;
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
    @Mock
    private PricingStrategyFactory pricingStrategyFactory;
    @Mock
    private PricingContext pricingContext;
    @Mock
    private PricingStrategy selectedPricingStrategy;

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
                bookingSubject,
                pricingStrategyFactory,
                pricingContext
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
        FareClass fareClass = FareClass.builder().id(2L).code("BUSINESS").name("BUSINESS").priceMultiplier(new BigDecimal("2.00")).active(true).build();
        AdditionalService service = AdditionalService.builder().id(3L).name("Baggage 20kg").price(new BigDecimal("200000.00")).active(true).build();

        when(profileRepository.findById(userId)).thenReturn(Optional.of(user));
        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));
        when(fareClassRepository.findById(2L)).thenReturn(Optional.of(fareClass));
        when(additionalServiceRepository.findById(3L)).thenReturn(Optional.of(service));
        when(pricingStrategyFactory.getStrategy("BUSINESS")).thenReturn(selectedPricingStrategy);
        when(pricingContext.executeStrategy(selectedPricingStrategy, flight.getBasePrice(), fareClass.getPriceMultiplier(), 1))
                .thenReturn(new BigDecimal("2000000.00"));
        when(bookingRepository.existsByBookingCode(any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(10L);
            return b;
        });

        CreateBookingCommand request = new CreateBookingCommand(1L, 2L,
                List.of(new CreateBookingCommand.PassengerInput("Nguyen Van A", LocalDate.of(1990, 1, 1), "B1234567", "0901234567")),
                List.of(new CreateBookingCommand.ServiceInput(3L, 2)));

        BookingView response = bookingService.createBooking(customerPrincipal, request);

        assertNotNull(response);
        assertEquals(10L, response.id());
        assertEquals(BookingStatus.PENDING, response.status());
        // Price: 1,000,000 * 2.00 * 1 passenger + 200,000 * 2 = 2,000,000 + 400,000 = 2,400,000
        assertEquals(new BigDecimal("2400000.00"), response.totalPrice());
        assertEquals(3L, response.services().getFirst().id());
        assertEquals(0, new BigDecimal("2000000.00").compareTo(response.priceBreakdown().baseFare()));
        assertEquals(0, new BigDecimal("400000.00").compareTo(response.priceBreakdown().servicesTotal()));
        verify(pricingStrategyFactory).getStrategy("BUSINESS");
        verify(pricingContext).executeStrategy(
                selectedPricingStrategy, flight.getBasePrice(), fareClass.getPriceMultiplier(), 1);

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

        CreateBookingCommand request = new CreateBookingCommand(1L, 2L,
                List.of(new CreateBookingCommand.PassengerInput("A", LocalDate.of(1990, 1, 1), "P1", "090")), List.of());

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

        CreateBookingCommand request = new CreateBookingCommand(1L, 2L, List.of(
                new CreateBookingCommand.PassengerInput("A", LocalDate.of(1990, 1, 1), "P123", "0901"),
                new CreateBookingCommand.PassengerInput("B", LocalDate.of(1992, 1, 1), "p123", "0902")), List.of());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> bookingService.createBooking(customerPrincipal, request));
        assertTrue(ex.getMessage().contains("trùng lặp"));
    }

    @Test
    void cancelBooking_onlyWhenPending_andPublishesOnce() {
        Booking booking = Booking.builder()
                .id(10L)
                .status(BookingStatus.PENDING)
                .totalPrice(new BigDecimal("1000000.00"))
                .flight(Flight.builder().basePrice(new BigDecimal("1000000.00")).build())
                .fareClass(FareClass.builder().priceMultiplier(BigDecimal.ONE).build())
                .build();

        when(bookingRepository.findByIdAndUserIdForUpdate(10L, userId)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingView response = bookingService.cancelBooking(customerPrincipal, 10L);

        assertEquals(BookingStatus.CANCELLED, response.status());
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

    @Test
    void mapToView_usesPersistedServicePriceForHistoricalBreakdown() {
        Booking booking = Booking.builder()
                .id(1L)
                .status(BookingStatus.CONFIRMED)
                .flight(Flight.builder().basePrice(new BigDecimal("9000000.00")).build())
                .fareClass(FareClass.builder().priceMultiplier(new BigDecimal("2.00")).build())
                .totalPrice(new BigDecimal("7300000.00"))
                .services(List.of(BookingServiceItem.builder()
                        .id(5L)
                        .service(AdditionalService.builder().id(3L).name("Baggage").price(new BigDecimal("900000.00")).build())
                        .quantity(2)
                        .unitPrice(new BigDecimal("650000.00"))
                        .build()))
                .build();

        BookingView view = bookingService.mapToView(booking);

        assertEquals(0, new BigDecimal("6000000.00").compareTo(view.priceBreakdown().baseFare()));
        assertEquals(0, new BigDecimal("1300000.00").compareTo(view.priceBreakdown().servicesTotal()));
        assertEquals(3L, view.services().getFirst().id());
    }
}
