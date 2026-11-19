package com.airline.application.service;

import com.airline.domain.entity.FareClass;
import com.airline.domain.entity.Flight;
import com.airline.domain.repository.FareClassRepository;
import com.airline.domain.repository.FlightRepository;
import com.airline.domain.repository.BookingRepository;
import com.airline.application.exception.BookingConflictException;
import com.airline.presentation.dto.request.FlightRequest;
import com.airline.presentation.dto.request.FlightUpdateRequest;
import com.airline.presentation.dto.response.FlightResponse;
import com.airline.presentation.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.springframework.data.domain.Sort;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FlightServiceTest {

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private FareClassRepository fareClassRepository;

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private com.airline.pattern.observer.FlightSubject flightSubject;

    private FlightService flightService;

    @BeforeEach
    void setUp() {
        flightService = new FlightService(flightRepository, fareClassRepository, bookingRepository,
                flightSubject);
    }

    @Test
    void listFlightsReturnsAdminSchedule() {
        when(flightRepository.findAll(Sort.by(Sort.Direction.ASC, "departureTime")))
                .thenReturn(List.of(sampleFlight()));
        when(fareClassRepository.findByActiveTrue()).thenReturn(sampleFares());

        assertThat(flightService.listFlights()).extracting(FlightResponse::getFlightNumber)
                .containsExactly("VN1234");
    }

    @Test
    void deleteFlightRejectsExistingBookings() {
        when(flightRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(sampleFlight()));
        when(bookingRepository.existsByFlightId(1L)).thenReturn(true);

        assertThatThrownBy(() -> flightService.deleteFlight(1L))
                .isInstanceOf(BookingConflictException.class)
                .hasMessage("Không thể xóa chuyến bay đã có đặt vé");
        verify(flightRepository, never()).delete(any());
    }

    @Test
    void searchFlightsUsesExactDayAndCalculatesPrices() {
        LocalDate date = LocalDate.of(2026, 12, 25);
        Flight flight = sampleFlight();
        when(flightRepository
                .findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThanOrderByDepartureTimeAsc(
                        "HAN", "SGN", date.atStartOfDay(), date.plusDays(1).atStartOfDay()))
                .thenReturn(List.of(flight));
        when(fareClassRepository.findByActiveTrue()).thenReturn(sampleFares());

        List<FlightResponse> result = flightService.searchFlights(" han ", "sgn", date);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getPrices())
                .containsEntry("economy", new BigDecimal("1200000.00"))
                .containsEntry("premium", new BigDecimal("1800000.00"))
                .containsEntry("business", new BigDecimal("3000000.00"));
    }

    @Test
    void createFlightNormalizesCodesBeforeSaving() {
        FlightRequest request = FlightRequest.builder()
                .flightNumber(" vn1234 ")
                .origin(" han ")
                .destination("sgn")
                .departureTime(LocalDateTime.now().plusDays(2))
                .arrivalTime(LocalDateTime.now().plusDays(2).plusHours(2))
                .basePrice(new BigDecimal("1200000"))
                .availableSeats(100)
                .build();
        when(flightRepository.existsByFlightNumberIgnoreCase("VN1234")).thenReturn(false);
        when(flightRepository.save(any(Flight.class))).thenAnswer(invocation -> {
            Flight saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        when(fareClassRepository.findByActiveTrue()).thenReturn(sampleFares());

        flightService.createFlight(request);

        ArgumentCaptor<Flight> captor = ArgumentCaptor.forClass(Flight.class);
        verify(flightRepository).save(captor.capture());
        assertThat(captor.getValue().getFlightNumber()).isEqualTo("VN1234");
        assertThat(captor.getValue().getOrigin()).isEqualTo("HAN");
        assertThat(captor.getValue().getDestination()).isEqualTo("SGN");
    }

    @Test
    void updateFlightRejectsArrivalBeforeDeparture() {
        Flight flight = sampleFlight();
        when(flightRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(flight));
        FlightUpdateRequest request = FlightUpdateRequest.builder()
                .arrivalTime(flight.getDepartureTime().minusMinutes(1))
                .build();

        assertThatThrownBy(() -> flightService.updateFlight(1L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Thời gian đến phải sau thời gian khởi hành");
        verify(flightRepository, never()).save(any());
    }

    @Test
    void deleteFlightReturnsNotFoundForUnknownId() {
        when(flightRepository.findByIdForUpdate(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> flightService.deleteFlight(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Không tìm thấy chuyến bay với ID: 99");
        verify(flightRepository, never()).delete(any());
    }

    private Flight sampleFlight() {
        return Flight.builder()
                .id(1L)
                .flightNumber("VN1234")
                .origin("HAN")
                .destination("SGN")
                .departureTime(LocalDateTime.of(2026, 12, 25, 6, 0))
                .arrivalTime(LocalDateTime.of(2026, 12, 25, 8, 30))
                .basePrice(new BigDecimal("1200000"))
                .availableSeats(45)
                .build();
    }

    @Test
    void postponingFlightPublishesScheduleChangeAndMarksDelayed() {
        Flight flight = sampleFlight();
        var previous = flight.getDepartureTime();
        when(flightRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(flight));
        when(flightRepository.save(any())).thenAnswer(call -> call.getArgument(0));
        var request = FlightUpdateRequest.builder().departureTime(previous.plusHours(1))
                .arrivalTime(flight.getArrivalTime().plusHours(1)).build();
        var response = flightService.updateFlight(1L, request);
        assertThat(response.getStatus()).isEqualTo(com.airline.domain.enums.FlightStatus.DELAYED);
        verify(flightSubject).publish(org.mockito.ArgumentMatchers.argThat(event ->
                event.oldDeparture().equals(previous) && event.departure().equals(previous.plusHours(1))));
    }

    @Test
    void cancelledFlightsAreExcludedFromSearchAndCannotBeReopened() {
        Flight flight = sampleFlight(); flight.setStatus(com.airline.domain.enums.FlightStatus.CANCELLED);
        var date = flight.getDepartureTime().toLocalDate();
        when(flightRepository.findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThanOrderByDepartureTimeAsc(
                "HAN", "SGN", date.atStartOfDay(), date.plusDays(1).atStartOfDay())).thenReturn(List.of(flight));
        assertThat(flightService.searchFlights("HAN", "SGN", date)).isEmpty();
        when(flightRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(flight));
        assertThatThrownBy(() -> flightService.updateFlight(1L,
                FlightUpdateRequest.builder().status(com.airline.domain.enums.FlightStatus.SCHEDULED).build()))
                .isInstanceOf(BookingConflictException.class);
    }

    @Test
    void nearbySearchKeepsExactResultsWithoutExpandingWindow() {
        LocalDate date = LocalDate.of(2026, 12, 25);
        when(flightRepository
                .findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThanOrderByDepartureTimeAsc(
                        "HAN", "SGN", date.atStartOfDay(), date.plusDays(1).atStartOfDay()))
                .thenReturn(List.of(sampleFlight()));
        assertThat(flightService.searchFlightsWithNearbyDates("HAN", "SGN", date)).hasSize(1);
        verify(flightRepository, org.mockito.Mockito.times(1))
                .findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThanOrderByDepartureTimeAsc(
                        any(), any(), any(), any());
    }

    @Test
    void nearbySearchExpandsThreeDaysAndExcludesSoldOutFlights() {
        LocalDate date = LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(10);
        Flight nearby = sampleFlight();
        nearby.setDepartureTime(date.plusDays(1).atTime(6, 0));
        Flight soldOut = sampleFlight();
        soldOut.setAvailableSeats(0);
        soldOut.setDepartureTime(date.minusDays(1).atTime(8, 0));
        when(flightRepository
                .findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThanOrderByDepartureTimeAsc(
                        "HAN", "SGN", date.atStartOfDay(), date.plusDays(1).atStartOfDay()))
                .thenReturn(List.of());
        when(flightRepository
                .findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThanOrderByDepartureTimeAsc(
                        "HAN", "SGN", date.minusDays(3).atStartOfDay(), date.plusDays(4).atStartOfDay()))
                .thenReturn(List.of(soldOut, nearby));
        assertThat(flightService.searchFlightsWithNearbyDates(" han ", "sgn", date))
                .extracting(FlightResponse::getDepartureTime).containsExactly(nearby.getDepartureTime());
    }

    private List<FareClass> sampleFares() {
        return List.of(
                fare(1L, "ECONOMY", "1.0"),
                fare(2L, "PREMIUM", "1.5"),
                fare(3L, "BUSINESS", "2.5"));
    }

    @Test
    void nearbySearchFallsBackWhenExactFlightsCannotFitTheWholeParty() {
        LocalDate date = LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(10);
        Flight tooSmall = sampleFlight();
        tooSmall.setDepartureTime(date.atTime(8, 0));
        tooSmall.setAvailableSeats(1);
        Flight available = sampleFlight();
        available.setDepartureTime(date.plusDays(3).atTime(8, 0));
        available.setAvailableSeats(2);
        Flight cancelled = sampleFlight();
        cancelled.setDepartureTime(date.minusDays(3).atTime(8, 0));
        cancelled.setStatus(com.airline.domain.enums.FlightStatus.CANCELLED);
        when(fareClassRepository.findByActiveTrue()).thenReturn(sampleFares());
        when(flightRepository
                .findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThanOrderByDepartureTimeAsc(
                        "HAN", "SGN", date.atStartOfDay(), date.plusDays(1).atStartOfDay()))
                .thenReturn(List.of(tooSmall));
        when(flightRepository
                .findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThanOrderByDepartureTimeAsc(
                        "HAN", "SGN", date.minusDays(3).atStartOfDay(), date.plusDays(4).atStartOfDay()))
                .thenReturn(List.of(tooSmall, cancelled, available));
        assertThat(flightService.searchFlightsWithNearbyDates("HAN", "SGN", date, 2, null, null))
                .extracting(FlightResponse::getDepartureTime).containsExactly(available.getDepartureTime());
    }

    @Test
    void nearbySearchRespectsArrivalTimeAndLatestAllowedDate() {
        LocalDate date = LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(10);
        LocalDateTime arrival = date.atTime(12, 0);
        Flight tooEarly = sampleFlight();
        tooEarly.setDepartureTime(date.atTime(8, 0));
        Flight validReturn = sampleFlight();
        validReturn.setDepartureTime(date.plusDays(1).atTime(8, 0));
        when(flightRepository
                .findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThanOrderByDepartureTimeAsc(
                        "HAN", "SGN", date.atStartOfDay(), date.plusDays(1).atStartOfDay()))
                .thenReturn(List.of(tooEarly));
        when(flightRepository
                .findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThanOrderByDepartureTimeAsc(
                        "HAN", "SGN", arrival, date.plusDays(2).atStartOfDay()))
                .thenReturn(List.of(validReturn));
        assertThat(flightService.searchFlightsWithNearbyDates("HAN", "SGN", date, 1, arrival, date.plusDays(1)))
                .extracting(FlightResponse::getDepartureTime).containsExactly(validReturn.getDepartureTime());
        assertThatThrownBy(() -> flightService.searchFlightsWithNearbyDates("HAN", "SGN", date, 0, null, null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private FareClass fare(Long id, String code, String multiplier) {
        return FareClass.builder()
                .id(id)
                .code(code)
                .name(code)
                .priceMultiplier(new BigDecimal(multiplier))
                .active(true)
                .build();
    }
}
