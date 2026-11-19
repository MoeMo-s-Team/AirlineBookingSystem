package com.airline.application.service;

import com.airline.domain.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingExpirationJob {
    private final BookingRepository bookingRepository;
    private final BookingHoldService bookingHoldService;

    @Scheduled(fixedDelayString = "${booking.hold.cleanup-interval-ms:30000}",
            initialDelayString = "${booking.hold.cleanup-interval-ms:30000}")
    public void expirePendingBookings() {
        // Bounded batch; each booking commits independently and is checked again under lock.
        for (Long id : bookingRepository.findExpiredPendingIds(bookingHoldService.now(), PageRequest.of(0, 100))) {
            try {
                bookingHoldService.expireBooking(id);
            } catch (RuntimeException ex) {
                log.error("Unable to expire booking {}", id, ex);
            }
        }
    }
}
