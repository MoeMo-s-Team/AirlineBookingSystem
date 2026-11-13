package com.airline.presentation.dto.response;

import com.airline.domain.entity.FareClass;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FareClassResponse {

    private Long id;
    private String code;
    private String name;

    private String baggage;

    private String seatPitch;

    private String meal;

    private BigDecimal priceMultiplier;
    private Boolean active;

    public static FareClassResponse fromEntity(FareClass entity) {
        if (entity == null) {
            return null;
        }
        return FareClassResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .baggage(entity.getBaggage())
                .seatPitch(entity.getSeatPitch())
                .meal(entity.getMeal())
                .priceMultiplier(entity.getPriceMultiplier())
                .active(entity.getActive())
                .build();
    }
}
