package com.airline.application.service;

import com.airline.domain.entity.FareClass;
import com.airline.domain.repository.FareClassRepository;
import com.airline.presentation.dto.request.FareClassRequest;
import com.airline.presentation.dto.response.FareClassResponse;
import com.airline.presentation.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test cho FareService - Nghiệp vụ Quản lý Hạng vé")
class FareServiceTest {

    @Mock
    private FareClassRepository fareClassRepository;

    @InjectMocks
    private FareService fareService;

    @Test
    @DisplayName("Lấy danh sách hạng vé đang hoạt động (active = true)")
    void testGetAllActiveFares() {
        FareClass economy = FareClass.builder()
                .id(1L).code("ECONOMY").name("Economy").priceMultiplier(new BigDecimal("1.00")).active(true).build();
        FareClass business = FareClass.builder()
                .id(2L).code("BUSINESS").name("Business").priceMultiplier(new BigDecimal("2.50")).active(true).build();

        when(fareClassRepository.findByActiveTrue()).thenReturn(List.of(economy, business));

        List<FareClassResponse> result = fareService.getAllActiveFares();

        assertEquals(2, result.size());
        assertEquals("ECONOMY", result.get(0).getCode());
        assertEquals("BUSINESS", result.get(1).getCode());
        verify(fareClassRepository, times(1)).findByActiveTrue();
    }

    @Test
    @DisplayName("Lấy chi tiết hạng vé theo ID thành công")
    void testGetFareById_Success() {
        FareClass fare = FareClass.builder()
                .id(1L).code("PREMIUM").name("Premium Economy").priceMultiplier(new BigDecimal("1.50")).active(true).build();

        when(fareClassRepository.findById(1L)).thenReturn(Optional.of(fare));

        FareClassResponse result = fareService.getFareById(1L);

        assertNotNull(result);
        assertEquals("PREMIUM", result.getCode());
        assertEquals(new BigDecimal("1.50"), result.getPriceMultiplier());
    }

    @Test
    @DisplayName("Lấy chi tiết hạng vé thất bại khi ID không tồn tại -> Báo ResourceNotFoundException")
    void testGetFareById_NotFound() {
        when(fareClassRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> fareService.getFareById(999L));
    }

    @Test
    @DisplayName("Thêm mới hạng vé thành công")
    void testCreateFare_Success() {
        FareClassRequest request = FareClassRequest.builder()
                .code("FIRST")
                .name("First Class")
                .priceMultiplier(new BigDecimal("4.00"))
                .active(true)
                .build();

        FareClass savedEntity = FareClass.builder()
                .id(10L)
                .code("FIRST")
                .name("First Class")
                .priceMultiplier(new BigDecimal("4.00"))
                .active(true)
                .build();

        when(fareClassRepository.existsByCode("FIRST")).thenReturn(false);
        when(fareClassRepository.save(any(FareClass.class))).thenReturn(savedEntity);

        FareClassResponse response = fareService.createFare(request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("FIRST", response.getCode());
        verify(fareClassRepository).save(any(FareClass.class));
    }

    @Test
    @DisplayName("Thêm mới hạng vé thất bại khi trùng mã code -> Báo IllegalArgumentException")
    void testCreateFare_DuplicateCode() {
        FareClassRequest request = FareClassRequest.builder()
                .code("ECONOMY")
                .name("Economy")
                .priceMultiplier(new BigDecimal("1.00"))
                .build();

        when(fareClassRepository.existsByCode("ECONOMY")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> fareService.createFare(request));
        verify(fareClassRepository, never()).save(any(FareClass.class));
    }

    @Test
    @DisplayName("Cập nhật hạng vé thành công")
    void testUpdateFare_Success() {
        FareClass existing = FareClass.builder()
                .id(1L).code("ECONOMY").name("Economy").priceMultiplier(new BigDecimal("1.00")).active(true).build();

        FareClassRequest updateRequest = FareClassRequest.builder()
                .code("ECONOMY")
                .name("Economy Updated")
                .priceMultiplier(new BigDecimal("1.10"))
                .active(true)
                .build();

        when(fareClassRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(fareClassRepository.save(any(FareClass.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FareClassResponse response = fareService.updateFare(1L, updateRequest);

        assertEquals("Economy Updated", response.getName());
        assertEquals(new BigDecimal("1.10"), response.getPriceMultiplier());
    }

    @Test
    @DisplayName("Xóa hạng vé thành công")
    void testDeleteFare_Success() {
        when(fareClassRepository.existsById(1L)).thenReturn(true);
        doNothing().when(fareClassRepository).deleteById(1L);

        assertDoesNotThrow(() -> fareService.deleteFare(1L));
        verify(fareClassRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Xóa hạng vé thất bại khi ID không tồn tại")
    void testDeleteFare_NotFound() {
        when(fareClassRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> fareService.deleteFare(999L));
        verify(fareClassRepository, never()).deleteById(anyLong());
    }
}
