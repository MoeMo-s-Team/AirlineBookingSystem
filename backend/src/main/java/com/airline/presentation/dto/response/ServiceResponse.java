package com.airline.presentation.dto.response;

import com.airline.domain.entity.AdditionalService;
import com.airline.domain.enums.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponse {

    private Long id;
    private String name;
    private ServiceType type;
    private BigDecimal price;
    private Boolean active;

    public static ServiceResponse fromEntity(AdditionalService entity) {
        if (entity == null) {
            return null;
        }
        return ServiceResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .type(entity.getType())
                .price(entity.getPrice())
                .active(entity.getActive())
                .build();
    }
}
