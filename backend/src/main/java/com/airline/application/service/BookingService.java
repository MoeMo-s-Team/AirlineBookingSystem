package com.airline.application.service;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.exception.BookingConflictException;
import com.airline.domain.entity.*;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.repository.*;
import com.airline.pattern.observer.BookingSubject;
import com.airline.pattern.state.BookingStateContext;
import com.airline.presentation.dto.request.BookingCreateRequest;
import com.airline.presentation.dto.request.BookingServiceItemRequest;
import com.airline.presentation.dto.request.PassengerRequest;
import com.airline.presentation.dto.response.BookingResponse;
import com.airline.presentation.dto.response.BookingServiceItemResponse;
import com.airline.presentation.dto.response.PassengerResponse;
import com.airline.presentation.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    private final FareClassRepository fareClassRepository;
    private final ServiceRepository additionalServiceRepository;
    private final ProfileRepository profileRepository;
    private final BookingSubject bookingSubject;

    private static final String CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public BookingResponse createBooking(ProfileIdentity principal, BookingCreateRequest request) {
        Profile user = profileRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));

        Flight flight = flightRepository.findById(request.getFlightId())
                .orElseThrow(() -> new ResourceNotFoundException("Chuyến bay không tồn tại"));

        FareClass fareClass = fareClassRepository.findById(request.getFareClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Hạng vé không tồn tại"));

        if (Boolean.FALSE.equals(fareClass.getActive())) {
            throw new IllegalArgumentException("Hạng vé đã ngừng áp dụng");
        }

        // Validate passengers
        if (request.getPassengers() == null || request.getPassengers().isEmpty()) {
            throw new IllegalArgumentException("Danh sách hành khách không được để trống");
        }

        Set<String> passportSet = new HashSet<>();
        for (PassengerRequest pReq : request.getPassengers()) {
            if (!passportSet.add(pReq.getPassportNo().trim().toUpperCase())) {
                throw new IllegalArgumentException("Số hộ chiếu/CCCD trùng lặp trong cùng đơn đặt vé: " + pReq.getPassportNo());
            }
        }

        // Calculate passenger flight fare: flight.basePrice * fareClass.priceMultiplier * passengerCount
        BigDecimal flightBasePrice = flight.getBasePrice();
        BigDecimal fareMultiplier = fareClass.getPriceMultiplier();
        BigDecimal perPassengerFare = flightBasePrice.multiply(fareMultiplier);
        BigDecimal totalPassengerFare = perPassengerFare.multiply(BigDecimal.valueOf(request.getPassengers().size()));

        BigDecimal totalServiceFare = BigDecimal.ZERO;
        List<BookingServiceItem> serviceItems = new ArrayList<>();

        if (request.getServices() != null) {
            for (BookingServiceItemRequest sReq : request.getServices()) {
                if (sReq.getQuantity() == null || sReq.getQuantity() <= 0) {
                    throw new IllegalArgumentException("Số lượng dịch vụ phải lớn hơn 0");
                }
                AdditionalService service = additionalServiceRepository.findById(sReq.getServiceId())
                        .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ bổ sung không tồn tại: " + sReq.getServiceId()));

                if (Boolean.FALSE.equals(service.getActive())) {
                    throw new IllegalArgumentException("Dịch vụ bổ sung đã ngừng cung cấp: " + service.getName());
                }

                BigDecimal lineTotal = service.getPrice().multiply(BigDecimal.valueOf(sReq.getQuantity()));
                totalServiceFare = totalServiceFare.add(lineTotal);

                BookingServiceItem item = BookingServiceItem.builder()
                        .service(service)
                        .quantity(sReq.getQuantity())
                        .unitPrice(service.getPrice())
                        .build();
                serviceItems.add(item);
            }
        }

        BigDecimal totalPrice = totalPassengerFare.add(totalServiceFare).setScale(2, java.math.RoundingMode.HALF_UP);
        String bookingCode = generateUniqueBookingCode();

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .user(user)
                .flight(flight)
                .fareClass(fareClass)
                .status(BookingStatus.PENDING)
                .totalPrice(totalPrice)
                .build();

        for (PassengerRequest pReq : request.getPassengers()) {
            Passenger passenger = Passenger.builder()
                    .booking(booking)
                    .fullName(pReq.getFullName().trim())
                    .dateOfBirth(pReq.getDateOfBirth())
                    .passportNo(pReq.getPassportNo().trim().toUpperCase())
                    .phone(pReq.getPhone().trim())
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

        return mapToResponse(savedBooking);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingDetail(ProfileIdentity principal, Long id) {
        Booking booking = bookingRepository.findByIdAndUserId(id, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Đơn đặt vé không tồn tại"));
        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(ProfileIdentity principal, BookingStatus status) {
        List<Booking> bookings = (status != null)
                ? bookingRepository.findByUserIdAndStatusOrderByCreatedAtDesc(principal.getId(), status)
                : bookingRepository.findByUserIdOrderByCreatedAtDesc(principal.getId());
        return bookings.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> getBookingsAdmin(BookingStatus status, UUID userId, Pageable pageable) {
        return bookingRepository.findWithFilters(status, userId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public BookingResponse cancelBooking(ProfileIdentity principal, Long id) {
        Booking booking = bookingRepository.findByIdAndUserIdForUpdate(id, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Đơn đặt vé không tồn tại"));

        BookingStatus previousStatus = booking.getStatus();
        BookingStateContext context = new BookingStateContext(previousStatus);
        context.cancel();

        booking.setStatus(context.getStatus());
        Booking saved = bookingRepository.save(booking);

        bookingSubject.publishStatusChanged(saved, previousStatus);
        return mapToResponse(saved);
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

    public BookingResponse mapToResponse(Booking booking) {
        List<PassengerResponse> passengerResponses = booking.getPassengers().stream()
                .map(p -> PassengerResponse.builder()
                        .id(p.getId())
                        .fullName(p.getFullName())
                        .dateOfBirth(p.getDateOfBirth())
                        .passportNo(p.getPassportNo())
                        .phone(p.getPhone())
                        .build())
                .toList();

        List<BookingServiceItemResponse> serviceResponses = booking.getServices().stream()
                .map(s -> BookingServiceItemResponse.builder()
                        .id(s.getId())
                        .serviceId(s.getService() != null ? s.getService().getId() : null)
                        .serviceName(s.getService() != null ? s.getService().getName() : null)
                        .quantity(s.getQuantity())
                        .unitPrice(s.getUnitPrice())
                        .totalPrice(s.getUnitPrice() != null && s.getQuantity() != null
                                ? s.getUnitPrice().multiply(BigDecimal.valueOf(s.getQuantity()))
                                : BigDecimal.ZERO)
                        .build())
                .toList();

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .flightId(booking.getFlight() != null ? booking.getFlight().getId() : null)
                .flightNumber(booking.getFlight() != null ? booking.getFlight().getFlightNumber() : null)
                .fareClassId(booking.getFareClass() != null ? booking.getFareClass().getId() : null)
                .fareClassName(booking.getFareClass() != null ? booking.getFareClass().getName() : null)
                .status(booking.getStatus())
                .totalPrice(booking.getTotalPrice())
                .passengers(passengerResponses)
                .services(serviceResponses)
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
