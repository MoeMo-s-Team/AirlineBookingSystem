package com.airline.presentation.controller;

import com.airline.application.service.FareService;
import com.airline.presentation.dto.request.FareClassRequest;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.FareClassResponse;
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
@DisplayName("Unit Test cho FareController - Tầng Presentation")
class FareControllerTest {

    @Mock
    private FareService fareService;

    @InjectMocks
    private FareController fareController;

    private FareClassResponse sampleFare;

    @BeforeEach
    void setUp() {
        sampleFare = FareClassResponse.builder()
                .id(1L)
                .code("ECONOMY")
                .name("Economy Standard")
                .priceMultiplier(new BigDecimal("1.00"))
                .active(true)
                .build();
    }

    @Test
    @DisplayName("GET /api/fares - Lấy danh sách hạng vé đang active")
    void testGetAllActiveFares() {
        when(fareService.getAllActiveFares()).thenReturn(List.of(sampleFare));

        ResponseEntity<ApiResponse<List<FareClassResponse>>> response = fareController.getAllActiveFares();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().size());
        assertEquals("ECONOMY", response.getBody().getData().get(0).getCode());
        verify(fareService, times(1)).getAllActiveFares();
    }

    @Test
    @DisplayName("GET /api/fares/all - Lấy toàn bộ hạng vé (Admin)")
    void testGetAllFares() {
        FareClassResponse inactiveFare = FareClassResponse.builder()
                .id(2L)
                .code("PROMO")
                .name("Promo Class")
                .priceMultiplier(new BigDecimal("0.80"))
                .active(false)
                .build();
        when(fareService.getAllFares()).thenReturn(List.of(sampleFare, inactiveFare));

        ResponseEntity<ApiResponse<List<FareClassResponse>>> response = fareController.getAllFares();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(fareService, times(1)).getAllFares();
    }

    @Test
    @DisplayName("GET /api/fares/{id} - Lấy chi tiết hạng vé theo ID")
    void testGetFareById() {
        when(fareService.getFareById(1L)).thenReturn(sampleFare);

        ResponseEntity<ApiResponse<FareClassResponse>> response = fareController.getFareById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("ECONOMY", response.getBody().getData().getCode());
        verify(fareService, times(1)).getFareById(1L);
    }

    @Test
    @DisplayName("POST /api/fares - Thêm mới hạng vé trả về 201 Created")
    void testCreateFare() {
        FareClassRequest request = FareClassRequest.builder()
                .code("BUSINESS")
                .name("Business Class")
                .priceMultiplier(new BigDecimal("2.50"))
                .active(true)
                .build();

        FareClassResponse created = FareClassResponse.builder()
                .id(3L)
                .code("BUSINESS")
                .name("Business Class")
                .priceMultiplier(new BigDecimal("2.50"))
                .active(true)
                .build();

        when(fareService.createFare(request)).thenReturn(created);

        ResponseEntity<ApiResponse<FareClassResponse>> response = fareController.createFare(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("BUSINESS", response.getBody().getData().getCode());
        verify(fareService, times(1)).createFare(request);
    }

    @Test
    @DisplayName("PUT /api/fares/{id} - Cập nhật hạng vé trả về 200 OK")
    void testUpdateFare() {
        FareClassRequest request = FareClassRequest.builder()
                .code("ECONOMY")
                .name("Economy Plus")
                .priceMultiplier(new BigDecimal("1.10"))
                .active(true)
                .build();

        FareClassResponse updated = FareClassResponse.builder()
                .id(1L)
                .code("ECONOMY")
                .name("Economy Plus")
                .priceMultiplier(new BigDecimal("1.10"))
                .active(true)
                .build();

        when(fareService.updateFare(1L, request)).thenReturn(updated);

        ResponseEntity<ApiResponse<FareClassResponse>> response = fareController.updateFare(1L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Economy Plus", response.getBody().getData().getName());
        verify(fareService, times(1)).updateFare(1L, request);
    }

    @Test
    @DisplayName("DELETE /api/fares/{id} - Xóa hạng vé trả về 200 OK")
    void testDeleteFare() {
        doNothing().when(fareService).deleteFare(1L);

        ResponseEntity<ApiResponse<Void>> response = fareController.deleteFare(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        verify(fareService, times(1)).deleteFare(1L);
    }
}
