package com.airline.application.service;

import com.airline.domain.entity.FareClass;
import com.airline.domain.entity.Flight;
import com.airline.domain.repository.FareClassRepository;
import com.airline.domain.repository.FlightRepository;
import com.airline.presentation.dto.request.FlightRequest;
import com.airline.presentation.dto.request.FlightUpdateRequest;
import com.airline.presentation.dto.response.FlightResponse;
import com.airline.presentation.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class FlightService {

    private final FlightRepository flightRepository;
    private final FareClassRepository fareClassRepository;

    @Transactional(readOnly = true)
    public List<FlightResponse> searchFlights(String origin, String destination, LocalDate date) {
        String normalizedOrigin = normalizeAirportCode(origin, "Mã sân bay đi");
        String normalizedDestination = normalizeAirportCode(destination, "Mã sân bay đến");
        validateRoute(normalizedOrigin, normalizedDestination);
        if (date == null) {
            throw new IllegalArgumentException("Ngày bay không được để trống");
        }

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime startOfNextDay = date.plusDays(1).atStartOfDay();
        List<FareClass> activeFares = fareClassRepository.findByActiveTrue();

        return flightRepository
                .findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThanOrderByDepartureTimeAsc(
                        normalizedOrigin, normalizedDestination, startOfDay, startOfNextDay)
                .stream()
                .map(flight -> toResponse(flight, activeFares))
                .toList();
    }

    @Transactional(readOnly = true)
    public FlightResponse getFlightById(Long id) {
        Flight flight = findFlight(id);
        return toResponse(flight, fareClassRepository.findByActiveTrue());
    }

    public FlightResponse createFlight(FlightRequest request) {
        String flightNumber = normalizeFlightNumber(request.getFlightNumber());
        if (flightRepository.existsByFlightNumberIgnoreCase(flightNumber)) {
            throw new IllegalArgumentException("Số hiệu chuyến bay đã tồn tại: " + flightNumber);
        }

        String origin = normalizeAirportCode(request.getOrigin(), "Mã sân bay đi");
        String destination = normalizeAirportCode(request.getDestination(), "Mã sân bay đến");
        validateRoute(origin, destination);
        validateSchedule(request.getDepartureTime(), request.getArrivalTime());

        Flight flight = Flight.builder()
                .flightNumber(flightNumber)
                .origin(origin)
                .destination(destination)
                .departureTime(request.getDepartureTime())
                .arrivalTime(request.getArrivalTime())
                .basePrice(request.getBasePrice())
                .availableSeats(request.getAvailableSeats())
                .build();

        return toResponse(flightRepository.save(flight), fareClassRepository.findByActiveTrue());
    }

    public FlightResponse updateFlight(Long id, FlightUpdateRequest request) {
        Flight flight = findFlight(id);

        if (request.getFlightNumber() != null) {
            String flightNumber = normalizeFlightNumber(request.getFlightNumber());
            if (flightRepository.existsByFlightNumberIgnoreCaseAndIdNot(flightNumber, id)) {
                throw new IllegalArgumentException("Số hiệu chuyến bay đã tồn tại: " + flightNumber);
            }
            flight.setFlightNumber(flightNumber);
        }
        if (request.getOrigin() != null) {
            flight.setOrigin(normalizeAirportCode(request.getOrigin(), "Mã sân bay đi"));
        }
        if (request.getDestination() != null) {
            flight.setDestination(normalizeAirportCode(request.getDestination(), "Mã sân bay đến"));
        }
        if (request.getDepartureTime() != null) {
            flight.setDepartureTime(request.getDepartureTime());
        }
        if (request.getArrivalTime() != null) {
            flight.setArrivalTime(request.getArrivalTime());
        }
        if (request.getBasePrice() != null) {
            flight.setBasePrice(request.getBasePrice());
        }
        if (request.getAvailableSeats() != null) {
            flight.setAvailableSeats(request.getAvailableSeats());
        }

        validateRoute(flight.getOrigin(), flight.getDestination());
        validateSchedule(flight.getDepartureTime(), flight.getArrivalTime());
        return toResponse(flightRepository.save(flight), fareClassRepository.findByActiveTrue());
    }

    public void deleteFlight(Long id) {
        Flight flight = findFlight(id);
        flightRepository.delete(flight);
    }

    private Flight findFlight(Long id) {
        return flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chuyến bay với ID: " + id));
    }

    private FlightResponse toResponse(Flight flight, List<FareClass> activeFares) {
        Map<String, BigDecimal> prices = new LinkedHashMap<>();
        activeFares.stream()
                .sorted((left, right) -> left.getId().compareTo(right.getId()))
                .forEach(fare -> prices.put(
                        fare.getCode().toLowerCase(Locale.ROOT),
                        flight.getBasePrice()
                                .multiply(fare.getPriceMultiplier())
                                .setScale(2, RoundingMode.HALF_UP)));

        return FlightResponse.builder()
                .id(flight.getId())
                .flightNumber(flight.getFlightNumber())
                .origin(flight.getOrigin())
                .destination(flight.getDestination())
                .departureTime(flight.getDepartureTime())
                .arrivalTime(flight.getArrivalTime())
                .basePrice(flight.getBasePrice())
                .availableSeats(flight.getAvailableSeats())
                .prices(prices)
                .build();
    }

    private String normalizeFlightNumber(String flightNumber) {
        if (flightNumber == null || flightNumber.isBlank()) {
            throw new IllegalArgumentException("Số hiệu chuyến bay không được để trống");
        }
        return flightNumber.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeAirportCode(String code, String fieldName) {
        if (code == null || !code.trim().matches("[A-Za-z]{3}")) {
            throw new IllegalArgumentException(fieldName + " phải gồm đúng 3 chữ cái");
        }
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private void validateRoute(String origin, String destination) {
        if (origin.equalsIgnoreCase(destination)) {
            throw new IllegalArgumentException("Sân bay đi và sân bay đến phải khác nhau");
        }
    }

    private void validateSchedule(LocalDateTime departureTime, LocalDateTime arrivalTime) {
        if (departureTime == null || arrivalTime == null) {
            throw new IllegalArgumentException("Thời gian khởi hành và thời gian đến không được để trống");
        }
        if (!arrivalTime.isAfter(departureTime)) {
            throw new IllegalArgumentException("Thời gian đến phải sau thời gian khởi hành");
        }
    }
}
