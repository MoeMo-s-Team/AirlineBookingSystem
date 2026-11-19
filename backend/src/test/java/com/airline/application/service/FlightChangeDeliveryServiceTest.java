package com.airline.application.service;

import com.airline.domain.entity.FlightChangeDelivery;
import com.airline.domain.enums.FlightStatus;
import com.airline.domain.repository.FlightChangeDeliveryRepository;
import com.airline.pattern.observer.*;
import java.time.LocalDateTime;
import java.util.*;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class FlightChangeDeliveryServiceTest {
    FlightChangeDelivery delivery() {
        var item = new FlightChangeDelivery();
        item.setId(1L); item.setFlightId(2L); item.setFlightNumber("VN123");
        item.setOldDeparture(LocalDateTime.of(2026, 12, 1, 10, 0)); item.setDeparture(item.getOldDeparture().plusHours(1));
        item.setOldArrival(item.getOldDeparture().plusHours(2)); item.setArrival(item.getDeparture().plusHours(2));
        item.setOldStatus(FlightStatus.SCHEDULED); item.setStatus(FlightStatus.DELAYED);
        return item;
    }
    @Test void dispatchesEachPersistedChangeOnlyOnce() {
        var repository = mock(FlightChangeDeliveryRepository.class);
        var observer = mock(FlightObserver.class);
        var item = delivery(); when(repository.findForUpdate(1L)).thenReturn(Optional.of(item));
        var service = new FlightChangeDeliveryService(repository, List.of(observer));
        service.deliver(1L); service.deliver(1L);
        verify(observer, times(1)).onFlightChanged(any());
        assertThat(item.isProcessed()).isTrue();
    }
    @Test void failedDispatchRemainsPendingForRetry() {
        var repository = mock(FlightChangeDeliveryRepository.class);
        var observer = mock(FlightObserver.class);
        var item = delivery(); when(repository.findForUpdate(1L)).thenReturn(Optional.of(item));
        doThrow(new IllegalStateException("temporary failure")).when(observer).onFlightChanged(any());
        assertThatThrownBy(() -> new FlightChangeDeliveryService(repository, List.of(observer)).deliver(1L))
                .isInstanceOf(IllegalStateException.class);
        assertThat(item.isProcessed()).isFalse(); verify(repository, never()).save(any());
    }
    @Test void unchangedScheduleIsNotQueued() {
        var repository = mock(FlightChangeDeliveryRepository.class);
        var item = delivery();
        new FlightSubject(repository).publish(new FlightChangedEvent(2L, "VN123", item.getOldDeparture(), item.getOldArrival(),
                FlightStatus.SCHEDULED, item.getOldDeparture(), item.getOldArrival(), FlightStatus.SCHEDULED, false));
        verifyNoInteractions(repository);
    }

    @Test void seatOnlyUpdateIsQueuedAndDeliveredAsASeatChange() {
        var repository = mock(FlightChangeDeliveryRepository.class);
        var observer = mock(FlightObserver.class);
        var departure = LocalDateTime.of(2026, 12, 1, 10, 0);
        var status = FlightStatus.SCHEDULED;
        var event = new FlightChangedEvent(2L, "VN123", departure, departure.plusHours(2), status,
                departure, departure.plusHours(2), status, true);

        new FlightSubject(repository).publish(event);
        var captured = org.mockito.ArgumentCaptor.forClass(FlightChangeDelivery.class);
        verify(repository).save(captured.capture());
        when(repository.findForUpdate(1L)).thenReturn(Optional.of(captured.getValue()));

        new FlightChangeDeliveryService(repository, List.of(observer)).deliver(1L);

        verify(observer).onFlightChanged(event);
    }
}
