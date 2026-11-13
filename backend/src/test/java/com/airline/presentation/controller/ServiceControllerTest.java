package com.airline.presentation.controller;

import com.airline.application.service.AdditionalServiceService;
import com.airline.domain.enums.ServiceType;
import com.airline.presentation.dto.request.ServiceRequest;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.ServiceResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test cho ServiceController - Tầng Presentation")
class ServiceControllerTest {

    @Mock
    private AdditionalServiceService additionalServiceService;

    @InjectMocks
    private ServiceController serviceController;

    private ServiceResponse sampleService;

    @BeforeEach
    void setUp() {
        sampleService = ServiceResponse.builder()
                .id(1L)
                .name("Extra Baggage 20kg")
                .type(ServiceType.BAGGAGE)
                .price(new BigDecimal("500000"))
                .active(true)
                .build();
    }

    @Test
    @DisplayName("GET /api/services - Lấy danh sách dịch vụ active không truyền type")
    void testGetAllActiveServices_WithoutType() {
        when(additionalServiceService.getAllActiveServices()).thenReturn(List.of(sampleService));

        ResponseEntity<ApiResponse<List<ServiceResponse>>> response = serviceController.getAllActiveServices(null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().size());
        verify(additionalServiceService, times(1)).getAllActiveServices();
    }

    @Test
    @DisplayName("GET /api/services?type=BAGGAGE - Lấy danh sách dịch vụ active lọc theo type")
    void testGetAllActiveServices_WithType() {
        when(additionalServiceService.getServicesByType(ServiceType.BAGGAGE)).thenReturn(List.of(sampleService));

        ResponseEntity<ApiResponse<List<ServiceResponse>>> response = serviceController.getAllActiveServices(ServiceType.BAGGAGE);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getData().size());
        assertEquals(ServiceType.BAGGAGE, response.getBody().getData().get(0).getType());
        verify(additionalServiceService, times(1)).getServicesByType(ServiceType.BAGGAGE);
    }

    @Test
    @DisplayName("GET /api/services/all - Lấy toàn bộ dịch vụ (Admin)")
    void testGetAllServices() {
        ServiceResponse inactiveService = ServiceResponse.builder()
                .id(2L)
                .name("Expired Meal")
                .type(ServiceType.MEAL)
                .price(new BigDecimal("100000"))
                .active(false)
                .build();
        when(additionalServiceService.getAllServices()).thenReturn(List.of(sampleService, inactiveService));

        ResponseEntity<ApiResponse<List<ServiceResponse>>> response = serviceController.getAllServices();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(additionalServiceService, times(1)).getAllServices();
    }

    @Test
    @DisplayName("GET /api/services/{id} - Lấy chi tiết dịch vụ theo ID")
    void testGetServiceById() {
        when(additionalServiceService.getServiceById(1L)).thenReturn(sampleService);

        ResponseEntity<ApiResponse<ServiceResponse>> response = serviceController.getServiceById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Extra Baggage 20kg", response.getBody().getData().getName());
        verify(additionalServiceService, times(1)).getServiceById(1L);
    }

    @Test
    @DisplayName("POST /api/services - Thêm mới dịch vụ trả về 201 Created")
    void testCreateService() {
        ServiceRequest request = ServiceRequest.builder()
                .name("In-flight Wifi")
                .type(ServiceType.PRIORITY_BOARDING)
                .price(new BigDecimal("150000"))
                .active(true)
                .build();

        ServiceResponse created = ServiceResponse.builder()
                .id(10L)
                .name("In-flight Wifi")
                .type(ServiceType.PRIORITY_BOARDING)
                .price(new BigDecimal("150000"))
                .active(true)
                .build();

        when(additionalServiceService.createService(request)).thenReturn(created);

        ResponseEntity<ApiResponse<ServiceResponse>> response = serviceController.createService(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("In-flight Wifi", response.getBody().getData().getName());
        verify(additionalServiceService, times(1)).createService(request);
    }

    @Test
    @DisplayName("PUT /api/services/{id} - Cập nhật dịch vụ trả về 200 OK")
    void testUpdateService() {
        ServiceRequest request = ServiceRequest.builder()
                .name("Extra Baggage 25kg")
                .type(ServiceType.BAGGAGE)
                .price(new BigDecimal("600000"))
                .active(true)
                .build();

        ServiceResponse updated = ServiceResponse.builder()
                .id(1L)
                .name("Extra Baggage 25kg")
                .type(ServiceType.BAGGAGE)
                .price(new BigDecimal("600000"))
                .active(true)
                .build();

        when(additionalServiceService.updateService(1L, request)).thenReturn(updated);

        ResponseEntity<ApiResponse<ServiceResponse>> response = serviceController.updateService(1L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Extra Baggage 25kg", response.getBody().getData().getName());
        verify(additionalServiceService, times(1)).updateService(1L, request);
    }

    @Test
    @DisplayName("DELETE /api/services/{id} - Xóa dịch vụ trả về 200 OK")
    void testDeleteService() {
        doNothing().when(additionalServiceService).deleteService(1L);

        ResponseEntity<ApiResponse<Void>> response = serviceController.deleteService(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        verify(additionalServiceService, times(1)).deleteService(1L);
    }
}
