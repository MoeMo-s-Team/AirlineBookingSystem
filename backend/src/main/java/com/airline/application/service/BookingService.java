package com.airline.application.service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airline.application.dto.BookingView;
import com.airline.application.dto.CreateBookingCommand;
import com.airline.application.dto.ProfileIdentity;
import com.airline.domain.entity.AdditionalService;
import com.airline.domain.entity.Booking;
import com.airline.domain.entity.BookingServiceItem;
import com.airline.domain.entity.FareClass;
import com.airline.domain.entity.Flight;
import com.airline.domain.entity.Passenger;
import com.airline.domain.entity.Payment;
import com.airline.domain.entity.Profile;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.repository.BookingRepository;
import com.airline.domain.repository.FareClassRepository;
import com.airline.domain.repository.FlightRepository;
import com.airline.domain.repository.ProfileRepository;
import com.airline.domain.repository.ServiceRepository;
import com.airline.pattern.observer.BookingSubject;
import com.airline.pattern.state.BookingStateContext;
import com.airline.pattern.strategy.PricingContext;
import com.airline.pattern.strategy.PricingStrategy;
import com.airline.pattern.strategy.PricingStrategyFactory;
import com.airline.presentation.exception.ResourceNotFoundException;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    private final FareClassRepository fareClassRepository;
    private final ServiceRepository additionalServiceRepository;
    private final ProfileRepository profileRepository;
    private final BookingSubject bookingSubject;
    private final PricingStrategyFactory pricingStrategyFactory;
    private final PricingContext pricingContext;
    private final BookingHoldService bookingHoldService;
    private final BookingPricingService bookingPricingService;

    private static final String CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public BookingService(BookingRepository bookingRepository,
                          FlightRepository flightRepository,
                          FareClassRepository fareClassRepository,
                          ServiceRepository additionalServiceRepository,
                          ProfileRepository profileRepository,
                          BookingSubject bookingSubject,
                          PricingStrategyFactory pricingStrategyFactory,
                          PricingContext pricingContext,
                          BookingHoldService bookingHoldService,
                          BookingPricingService bookingPricingService) {
        this.bookingRepository = bookingRepository;
        this.flightRepository = flightRepository;
        this.fareClassRepository = fareClassRepository;
        this.additionalServiceRepository = additionalServiceRepository;
        this.profileRepository = profileRepository;
        this.bookingSubject = bookingSubject;
        this.pricingStrategyFactory = pricingStrategyFactory;
        this.pricingContext = pricingContext;
        this.bookingHoldService = bookingHoldService;
        this.bookingPricingService = bookingPricingService;
    }

    @Transactional
    public BookingView createBooking(ProfileIdentity principal, CreateBookingCommand request) {
        Profile user = profileRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));

        if ((request.returnFlightId() == null) != (request.returnFareClassId() == null)) {
            throw new IllegalArgumentException("Return flight and return fare must be selected together");
        }
        if (request.flightId().equals(request.returnFlightId())) {
            throw new IllegalArgumentException("Outbound and return flights must be different");
        }
        // Always lock both flights in ID order, including journeys on opposite routes.
        java.util.Map<Long, Flight> lockedFlights = new java.util.HashMap<>();
        java.util.stream.Stream.of(request.flightId(), request.returnFlightId()).filter(java.util.Objects::nonNull)
                .sorted().forEach(id -> lockedFlights.put(id, flightRepository.findByIdForUpdate(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Chuyến bay không tồn tại"))));
        Flight flight = lockedFlights.get(request.flightId());
        Flight returnFlight = lockedFlights.get(request.returnFlightId());
        FareClass returnFare = null;
        if (returnFlight != null) {
            if (!flight.getOrigin().equalsIgnoreCase(returnFlight.getDestination())
                    || !flight.getDestination().equalsIgnoreCase(returnFlight.getOrigin())
                    || !returnFlight.getDepartureTime().isAfter(flight.getArrivalTime())) {
                throw new IllegalArgumentException("Return flight must reverse the route and depart after outbound arrival");
            }
            returnFare = fareClassRepository.findById(request.returnFareClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Return fare class not found"));
            if (!Boolean.TRUE.equals(returnFare.getActive())) {
                throw new IllegalArgumentException("Return fare class is inactive");
            }
        }

        FareClass fareClass = fareClassRepository.findById(request.fareClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Hạng vé không tồn tại"));

        if (Boolean.FALSE.equals(fareClass.getActive())) {
            throw new IllegalArgumentException("Hạng vé đã ngừng áp dụng");
        }

        // Validate passengers
        if (request.passengers() == null || request.passengers().isEmpty()) {
            throw new IllegalArgumentException("Danh sách hành khách không được để trống");
        }

        Set<String> passportSet = new HashSet<>();
        for (CreateBookingCommand.PassengerInput pReq : request.passengers()) {
            if (!passportSet.add(pReq.passportNo().trim().toUpperCase())) {
                throw new IllegalArgumentException("Số hộ chiếu/CCCD trùng lặp trong cùng đơn đặt vé: " + pReq.passportNo());
            }
        }

        // Calculate passenger flight fare: flight.basePrice * fareClass.priceMultiplier * passengerCount
        BigDecimal flightBasePrice = flight.getBasePrice();
        BigDecimal fareMultiplier = fareClass.getPriceMultiplier();
        PricingStrategy pricingStrategy = pricingStrategyFactory.getStrategy(fareClass.getCode(), fareClass.getPriceMultiplier());
        BigDecimal totalPassengerFare = pricingContext.executeStrategy(
                pricingStrategy, flightBasePrice, fareMultiplier, request.passengers().size());
        if (returnFlight != null) {
            totalPassengerFare = totalPassengerFare.add(pricingContext.executeStrategy(
                    pricingStrategyFactory.getStrategy(returnFare.getCode(), returnFare.getPriceMultiplier()), returnFlight.getBasePrice(),
                    returnFare.getPriceMultiplier(), request.passengers().size()));
        }

        List<BookingServiceItem> serviceItems = new ArrayList<>();
        Set<Long> serviceIds = new HashSet<>();

        if (request.services() != null) {
            for (CreateBookingCommand.ServiceInput sReq : request.services()) {
                if (!serviceIds.add(sReq.serviceId())) throw new IllegalArgumentException("Duplicate service selection");
                if (sReq.quantity() == null || sReq.quantity() <= 0) {
                    throw new IllegalArgumentException("Số lượng dịch vụ phải lớn hơn 0");
                }
                AdditionalService service = additionalServiceRepository.findById(sReq.serviceId())
                        .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ bổ sung không tồn tại: " + sReq.serviceId()));

                if (Boolean.FALSE.equals(service.getActive())) {
                    throw new IllegalArgumentException("Dịch vụ bổ sung đã ngừng cung cấp: " + service.getName());
                }

                BookingServiceItem item = BookingServiceItem.builder()
                        .service(service)
                        .quantity(sReq.quantity())
                        .unitPrice(service.getPrice())
                        .build();
                serviceItems.add(item);
            }
        }

        BookingPricingService.Price price = bookingPricingService.calculate(totalPassengerFare, serviceItems, request.serviceBundle());
        BigDecimal totalPrice = price.total();
        java.time.LocalDateTime expiresAt = bookingHoldService.reserve(flight, request.passengers().size());
        if (returnFlight != null) {
            java.time.LocalDateTime returnExpiry = bookingHoldService.reserve(returnFlight, request.passengers().size());
            if (returnExpiry.isBefore(expiresAt)) expiresAt = returnExpiry;
        }
        String bookingCode = generateUniqueBookingCode();

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .user(user)
                .flight(flight)
                .fareClass(fareClass)
                .returnFlight(returnFlight)
                .returnFareClass(returnFare)
                .status(BookingStatus.PENDING)
                .totalPrice(totalPrice)
                .serviceDiscount(price.discount())
                .expiresAt(expiresAt)
                .seatsHeld(true)
                .build();

        for (CreateBookingCommand.PassengerInput pReq : request.passengers()) {
            Passenger passenger = Passenger.builder()
                    .booking(booking)
                    .fullName(pReq.fullName().trim())
                    .dateOfBirth(pReq.dateOfBirth())
                    .passportNo(pReq.passportNo().trim().toUpperCase())
                    .phone(pReq.phone().trim())
                    .build();
            booking.getPassengers().add(passenger);
        }

        for (BookingServiceItem item : serviceItems) {
            item.setBooking(booking);
            booking.getServices().add(item);
        }

        Booking savedBooking = bookingRepository.save(booking);

        // Publish event: created with previousStatus = null
        bookingSubject.publishStatusChanged(savedBooking, null);

        return mapToView(savedBooking);
    }

    @Transactional
    public BookingView getBookingDetail(ProfileIdentity principal, Long id) {
        Booking booking = bookingRepository.findByIdAndUserIdForUpdate(id, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Đơn đặt vé không tồn tại"));
        bookingHoldService.expireIfNecessary(booking);
        return mapToView(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingView> getMyBookings(ProfileIdentity principal, BookingStatus status) {
        List<Booking> bookings = (status != null)
                ? bookingRepository.findByUserIdAndStatusOrderByCreatedAtDesc(principal.getId(), status)
                : bookingRepository.findByUserIdOrderByCreatedAtDesc(principal.getId());
        return bookings.stream().map(this::mapToView).toList();
    }

    @Transactional(readOnly = true)
    public Page<BookingView> getBookingsAdmin(BookingStatus status, UUID userId, Pageable pageable) {
        return bookingRepository.findWithFilters(status, userId, pageable)
                .map(this::mapToView);
    }

    @Transactional(readOnly = true)
    public BookingView getBookingAdmin(Long id) {
        return mapToView(bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found")));
    }

    @Transactional
    public BookingView cancelBooking(ProfileIdentity principal, Long id) {
        Booking booking = bookingRepository.findByIdAndUserIdForUpdate(id, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Đơn đặt vé không tồn tại"));

        BookingStatus previousStatus = booking.getStatus();
        BookingStateContext context = new BookingStateContext(previousStatus);
        context.cancel();

        bookingHoldService.release(booking);
        booking.setStatus(context.getStatus());
        Booking saved = bookingRepository.save(booking);

        bookingSubject.publishStatusChanged(saved, previousStatus);
        return mapToView(saved);
    }

    private String generateUniqueBookingCode() {
        for (int i = 0; i < 10; i++) {
            StringBuilder sb = new StringBuilder("BK");
            for (int j = 0; j < 6; j++) {
                sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            }
            String code = sb.toString();
            if (!bookingRepository.existsByBookingCode(code)) {
                return code;
            }
        }
        return "BK" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
    }

    public BookingView mapToView(Booking booking) {
        List<BookingView.PassengerView> passengerResponses = booking.getPassengers().stream()
                .map(p -> new BookingView.PassengerView(p.getId(), p.getFullName(), p.getDateOfBirth(), p.getPassportNo()))
                .toList();

        List<BookingView.ServiceView> serviceResponses = booking.getServices().stream()
                .map(s -> new BookingView.ServiceView(s.getService() == null ? null : s.getService().getId(),
                        s.getService() == null ? null : s.getService().getName(), s.getQuantity(), s.getUnitPrice()))
                .toList();

        BigDecimal servicesTotal = booking.getServices().stream()
                .map(s -> s.getUnitPrice().multiply(BigDecimal.valueOf(s.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal discount = booking.getServiceDiscount();
        BigDecimal baseFare = booking.getTotalPrice().add(discount).subtract(servicesTotal);
        Payment latestPayment = booking.getPayments().stream()
                .max(Comparator.comparing(Payment::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder())))
                .orElse(null);

        BookingView.UserSummary userSummary = booking.getUser() == null ? null :
                new BookingView.UserSummary(
                        booking.getUser().getId(),
                        booking.getUser().getFullName(),
                        booking.getUser().getEmail());

        return new BookingView(
                booking.getId(),
                booking.getBookingCode(),
                booking.getStatus(),
                userSummary,
                new BookingView.FlightSummary(booking.getFlight().getId(), booking.getFlight().getFlightNumber(),
                        booking.getFlight().getOrigin(), booking.getFlight().getDestination(), booking.getFlight().getDepartureTime(), booking.getFlight().getStatus(), booking.getFlight().getArrivalTime()),
                new BookingView.FareClassSummary(booking.getFareClass().getId(), booking.getFareClass().getCode(), booking.getFareClass().getName()),
                passengerResponses,
                serviceResponses,
                new BookingView.PriceBreakdown(baseFare, servicesTotal, booking.getTotalPrice(), discount),
                booking.getTotalPrice(),
                latestPayment == null ? null : new BookingView.PaymentSummary(
                        latestPayment.getId(), latestPayment.getAmount(), latestPayment.getStatus(), latestPayment.getPaidAt()),
                booking.getCreatedAt(),
                booking.getUpdatedAt(), booking.getExpiresAt(),
                booking.getReturnFlight() == null ? null : new BookingView.FlightSummary(
                        booking.getReturnFlight().getId(), booking.getReturnFlight().getFlightNumber(),
                        booking.getReturnFlight().getOrigin(), booking.getReturnFlight().getDestination(),
                        booking.getReturnFlight().getDepartureTime(), booking.getReturnFlight().getStatus(), booking.getReturnFlight().getArrivalTime()),
                booking.getReturnFareClass() == null ? null : new BookingView.FareClassSummary(
                        booking.getReturnFareClass().getId(), booking.getReturnFareClass().getCode(), booking.getReturnFareClass().getName()));
    }
}
