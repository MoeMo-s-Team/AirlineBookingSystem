package com.airline.application.service;

import com.airline.domain.entity.AdditionalService;
import com.airline.domain.entity.Booking;
import com.airline.domain.entity.BookingServiceItem;
import com.airline.domain.entity.FareClass;
import com.airline.domain.entity.Flight;
import com.airline.domain.entity.Passenger;
import com.airline.domain.entity.Profile;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.repository.BookingRepository;
import com.airline.domain.repository.FareClassRepository;
import com.airline.domain.repository.FlightRepository;
import com.airline.domain.repository.ProfileRepository;
import com.airline.domain.repository.ServiceRepository;
import com.airline.pattern.state.BookingStateContext;
import com.airline.presentation.dto.request.BookingRequest;
import com.airline.presentation.dto.request.BookingServiceRequest;
import com.airline.presentation.dto.request.PassengerRequest;
import com.airline.presentation.dto.response.BookingDetailResponse;
import com.airline.presentation.dto.response.BookingResponse;
import com.airline.presentation.dto.response.BookingServiceItemResponse;
import com.airline.presentation.dto.response.FareClassResponse;
import com.airline.presentation.dto.response.FlightResponse;
import com.airline.presentation.dto.response.PassengerResponse;
import com.airline.presentation.dto.response.PriceBreakdownResponse;
import com.airline.presentation.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private static final String BOOKING_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int BOOKING_CODE_LENGTH = 6;
    private static final int BOOKING_CODE_ATTEMPTS = 10;

    private final BookingRepository bookingRepository;
    private final ProfileRepository profileRepository;
    private final FlightRepository flightRepository;
    private final FareClassRepository fareClassRepository;
    private final ServiceRepository serviceRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public BookingDetailResponse createBooking(UUID userId, BookingRequest request) {
        validateRequest(request);

        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ người dùng"));
        Flight flight = flightRepository.findById(request.getFlightId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chuyến bay với ID: " + request.getFlightId()));
        FareClass fareClass = fareClassRepository.findById(request.getFareClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hạng vé với ID: " + request.getFareClassId()));
        if (!Boolean.TRUE.equals(fareClass.getActive())) {
            throw new IllegalArgumentException("Hạng vé không còn hoạt động");
        }

        Booking booking = Booking.builder()
                .bookingCode(generateBookingCode())
                .user(user)
                .flight(flight)
                .fareClass(fareClass)
                .build();

        List<Passenger> passengers = toPassengers(booking, request.getPassengers());
        List<BookingServiceItem> services = toServiceItems(booking, request.getServices());
        BigDecimal baseFare = calculateBaseFare(flight, fareClass, passengers.size());
        BigDecimal servicesTotal = calculateServicesTotal(services);

        booking.setPassengers(passengers);
        booking.setServices(services);
        booking.setTotalPrice(baseFare.add(servicesTotal));

        return toDetailResponse(bookingRepository.save(booking), baseFare, servicesTotal);
    }

    @Transactional(readOnly = true)
    public BookingDetailResponse getBooking(UUID userId, Long bookingId) {
        Booking booking = findBookingForUser(userId, bookingId);
        return toDetailResponse(booking, calculateBaseFare(booking), calculateServicesTotal(booking.getServices()));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(UUID userId, BookingStatus status) {
        List<Booking> bookings = status == null
                ? bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                : bookingRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
        return bookings
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public BookingResponse cancelBooking(UUID userId, Long bookingId) {
        Booking booking = findBookingForUser(userId, bookingId);
        new BookingStateContext(booking).cancel();
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> getAdminBookings(BookingStatus status, UUID userId, int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw new IllegalArgumentException("Thông tin phân trang không hợp lệ");
        }

        Specification<Booking> specification = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        if (status != null) {
            specification = specification.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("status"), status));
        }
        if (userId != null) {
            specification = specification.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("user").get("id"), userId));
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return bookingRepository.findAll(specification, pageable).map(this::toResponse);
    }

    public BookingResponse updateBookingStatus(Long bookingId, BookingStatus targetStatus) {
        if (targetStatus == null || targetStatus == BookingStatus.PENDING) {
            throw new IllegalArgumentException("Trạng thái đích không hợp lệ");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy booking với ID: " + bookingId));
        BookingStateContext context = new BookingStateContext(booking);
        switch (targetStatus) {
            case CONFIRMED -> context.confirm();
            case CANCELLED -> context.cancel();
            case PAYMENT_FAILED -> context.paymentFailed();
            case PENDING -> throw new IllegalArgumentException("Trạng thái đích không hợp lệ");
        }
        return toResponse(bookingRepository.save(booking));
    }

    private Booking findBookingForUser(UUID userId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy booking với ID: " + bookingId));
        if (!booking.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy booking với ID: " + bookingId);
        }
        return booking;
    }

    private List<Passenger> toPassengers(Booking booking, List<PassengerRequest> requests) {
        Set<String> passportNumbers = new HashSet<>();
        return requests.stream().map(request -> {
            validatePassenger(request);
            String passportNo = request.getPassportNo().trim().toUpperCase();
            if (!passportNumbers.add(passportNo)) {
                throw new IllegalArgumentException("Số hộ chiếu không được trùng trong cùng booking");
            }
            return Passenger.builder()
                    .booking(booking)
                    .fullName(request.getFullName().trim())
                    .dateOfBirth(request.getDateOfBirth())
                    .passportNo(passportNo)
                    .phone(request.getPhone().trim())
                    .build();
        }).toList();
    }

    private List<BookingServiceItem> toServiceItems(Booking booking, List<BookingServiceRequest> requests) {
        if (requests == null) {
            return List.of();
        }
        Set<Long> serviceIds = new HashSet<>();
        return requests.stream().map(request -> {
            if (request == null || request.getServiceId() == null || request.getQuantity() == null || request.getQuantity() < 1) {
                throw new IllegalArgumentException("Dịch vụ đặt kèm không hợp lệ");
            }
            if (!serviceIds.add(request.getServiceId())) {
                throw new IllegalArgumentException("Dịch vụ không được trùng trong cùng booking");
            }
            AdditionalService service = serviceRepository.findById(request.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + request.getServiceId()));
            if (!Boolean.TRUE.equals(service.getActive())) {
                throw new IllegalArgumentException("Dịch vụ không còn hoạt động: " + service.getName());
            }
            return BookingServiceItem.builder()
                    .booking(booking)
                    .service(service)
                    .quantity(request.getQuantity())
                    .unitPrice(service.getPrice())
                    .build();
        }).toList();
    }

    private void validateRequest(BookingRequest request) {
        if (request == null || request.getFlightId() == null || request.getFareClassId() == null) {
            throw new IllegalArgumentException("Thông tin booking không hợp lệ");
        }
        if (request.getPassengers() == null || request.getPassengers().isEmpty()) {
            throw new IllegalArgumentException("Booking phải có ít nhất một hành khách");
        }
    }

    private void validatePassenger(PassengerRequest request) {
        if (request == null
                || isBlank(request.getFullName())
                || request.getDateOfBirth() == null
                || !request.getDateOfBirth().isBefore(LocalDate.now())
                || isBlank(request.getPassportNo())
                || isBlank(request.getPhone())
                || !request.getPhone().trim().matches("^[0-9+()\\- ]{8,20}$")) {
            throw new IllegalArgumentException("Thông tin hành khách không hợp lệ");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private BigDecimal calculateBaseFare(Flight flight, FareClass fareClass, int passengerCount) {
        return flight.getBasePrice()
                .multiply(fareClass.getPriceMultiplier())
                .multiply(BigDecimal.valueOf(passengerCount))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateBaseFare(Booking booking) {
        return calculateBaseFare(booking.getFlight(), booking.getFareClass(), booking.getPassengers().size());
    }

    private BigDecimal calculateServicesTotal(List<BookingServiceItem> services) {
        return services.stream()
                .map(service -> service.getUnitPrice().multiply(BigDecimal.valueOf(service.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String generateBookingCode() {
        for (int attempt = 0; attempt < BOOKING_CODE_ATTEMPTS; attempt++) {
            StringBuilder code = new StringBuilder("BK-");
            for (int index = 0; index < BOOKING_CODE_LENGTH; index++) {
                code.append(BOOKING_CODE_ALPHABET.charAt(secureRandom.nextInt(BOOKING_CODE_ALPHABET.length())));
            }
            if (!bookingRepository.existsByBookingCode(code.toString())) {
                return code.toString();
            }
        }
        throw new IllegalStateException("Không thể tạo mã booking duy nhất");
    }

    private BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .status(booking.getStatus())
                .flight(toFlightResponse(booking.getFlight()))
                .fareClass(FareClassResponse.fromEntity(booking.getFareClass()))
                .totalPrice(booking.getTotalPrice())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    private BookingDetailResponse toDetailResponse(Booking booking, BigDecimal baseFare, BigDecimal servicesTotal) {
        return BookingDetailResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .status(booking.getStatus())
                .flight(toFlightResponse(booking.getFlight()))
                .fareClass(FareClassResponse.fromEntity(booking.getFareClass()))
                .passengers(booking.getPassengers().stream().map(this::toPassengerResponse).toList())
                .services(booking.getServices().stream().map(this::toServiceResponse).toList())
                .priceBreakdown(PriceBreakdownResponse.builder()
                        .baseFare(baseFare)
                        .servicesTotal(servicesTotal)
                        .total(booking.getTotalPrice())
                        .build())
                .totalPrice(booking.getTotalPrice())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    private FlightResponse toFlightResponse(Flight flight) {
        return FlightResponse.builder()
                .id(flight.getId())
                .flightNumber(flight.getFlightNumber())
                .origin(flight.getOrigin())
                .destination(flight.getDestination())
                .departureTime(flight.getDepartureTime())
                .arrivalTime(flight.getArrivalTime())
                .basePrice(flight.getBasePrice())
                .availableSeats(flight.getAvailableSeats())
                .build();
    }

    private PassengerResponse toPassengerResponse(Passenger passenger) {
        return PassengerResponse.builder()
                .id(passenger.getId())
                .fullName(passenger.getFullName())
                .dateOfBirth(passenger.getDateOfBirth())
                .passportNo(passenger.getPassportNo())
                .phone(passenger.getPhone())
                .build();
    }

    private BookingServiceItemResponse toServiceResponse(BookingServiceItem service) {
        return BookingServiceItemResponse.builder()
                .serviceId(service.getService().getId())
                .name(service.getService().getName())
                .quantity(service.getQuantity())
                .unitPrice(service.getUnitPrice())
                .build();
    }
}
