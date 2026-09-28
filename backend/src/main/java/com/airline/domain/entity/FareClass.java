package com.airline.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "fare_classes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FareClass {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "price_multiplier", nullable = false, precision = 5, scale = 2)
    private BigDecimal priceMultiplier;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
