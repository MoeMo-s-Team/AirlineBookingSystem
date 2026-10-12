package com.airline.application.service;

import com.airline.domain.entity.AdditionalService;
import com.airline.domain.enums.ServiceType;
import com.airline.domain.repository.ServiceRepository;
import com.airline.presentation.dto.request.ServiceRequest;
import com.airline.presentation.dto.response.ServiceResponse;
import com.airline.presentation.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test cho AdditionalServiceService - Nghiệp vụ Quản lý Dịch vụ Bổ trợ")
class AdditionalServiceServiceTest {

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private AdditionalServiceService additionalServiceService;

    @Test
    @DisplayName("Lấy danh sách tất cả dịch vụ đang hoạt động")
    void testGetAllActiveServices() {
        AdditionalService baggage = AdditionalService.builder()
                .id(1L).name("Extra Baggage 20kg").type(ServiceType.BAGGAGE).price(new BigDecimal("500000")).active(true).build();
        AdditionalService meal = AdditionalService.builder()
                .id(2L).name("Special Meal").type(ServiceType.MEAL).price(new BigDecimal("200000")).active(true).build();

        when(serviceRepository.findByActiveTrue()).thenReturn(List.of(baggage, meal));

        List<ServiceResponse> result = additionalServiceService.getAllActiveServices();

        assertEquals(2, result.size());
        assertEquals("Extra Baggage 20kg", result.get(0).getName());
        assertEquals(ServiceType.MEAL, result.get(1).getType());
    }

    @Test
    @DisplayName("Lọc danh sách dịch vụ theo loại (BAGGAGE)")
    void testGetServicesByType() {
        AdditionalService baggage = AdditionalService.builder()
                .id(1L).name("Extra Baggage 20kg").type(ServiceType.BAGGAGE).price(new BigDecimal("500000")).active(true).build();

        when(serviceRepository.findByTypeAndActiveTrue(ServiceType.BAGGAGE)).thenReturn(List.of(baggage));

        List<ServiceResponse> result = additionalServiceService.getServicesByType(ServiceType.BAGGAGE);

        assertEquals(1, result.size());
        assertEquals(ServiceType.BAGGAGE, result.get(0).getType());
    }

    @Test
    @DisplayName("Thêm dịch vụ mới thành công")
    void testCreateService_Success() {
        ServiceRequest request = ServiceRequest.builder()
                .name("VIP Lounge Access")
                .type(ServiceType.PRIORITY_BOARDING)
                .price(new BigDecimal("450000"))
                .active(true)
                .build();

        AdditionalService saved = AdditionalService.builder()
                .id(10L)
                .name("VIP Lounge Access")
                .type(ServiceType.PRIORITY_BOARDING)
                .price(new BigDecimal("450000"))
                .active(true)
                .build();

        when(serviceRepository.existsByName("VIP Lounge Access")).thenReturn(false);
        when(serviceRepository.save(any(AdditionalService.class))).thenReturn(saved);

        ServiceResponse response = additionalServiceService.createService(request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("VIP Lounge Access", response.getName());
    }

    @Test
    @DisplayName("Thêm dịch vụ thất bại khi trùng tên -> Báo IllegalArgumentException")
    void testCreateService_DuplicateName() {
        ServiceRequest request = ServiceRequest.builder()
                .name("Special Meal")
                .type(ServiceType.MEAL)
                .price(new BigDecimal("200000"))
                .build();

        when(serviceRepository.existsByName("Special Meal")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> additionalServiceService.createService(request));
        verify(serviceRepository, never()).save(any(AdditionalService.class));
    }

    @Test
    @DisplayName("Xóa dịch vụ thành công")
    void testDeleteService_Success() {
        when(serviceRepository.existsById(1L)).thenReturn(true);
        doNothing().when(serviceRepository).deleteById(1L);

        assertDoesNotThrow(() -> additionalServiceService.deleteService(1L));
        verify(serviceRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Xóa dịch vụ thất bại khi không tìm thấy ID -> Báo ResourceNotFoundException")
    void testDeleteService_NotFound() {
        when(serviceRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> additionalServiceService.deleteService(999L));
    }
}
