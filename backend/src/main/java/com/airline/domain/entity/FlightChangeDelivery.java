package com.airline.domain.entity;

import com.airline.domain.enums.FlightStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "flight_change_deliveries")
@Getter @Setter @NoArgsConstructor
public class FlightChangeDelivery {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long flightId;
    @Column(nullable = false, length = 20) private String flightNumber;
    @Column(nullable = false) private LocalDateTime oldDeparture;
    @Column(nullable = false) private LocalDateTime oldArrival;
    @Column(nullable = false) private LocalDateTime departure;
    @Column(nullable = false) private LocalDateTime arrival;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private FlightStatus oldStatus;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private FlightStatus status;
    @Column(nullable = false) private boolean processed;
    @Column(nullable = false) private boolean seatsChanged;

}
