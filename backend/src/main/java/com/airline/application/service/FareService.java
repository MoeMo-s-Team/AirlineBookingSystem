package com.airline.application.service;

import com.airline.domain.entity.FareClass;
import com.airline.domain.repository.FareClassRepository;
import com.airline.presentation.dto.request.FareClassRequest;
import com.airline.presentation.dto.response.FareClassResponse;
import com.airline.presentation.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FareService {

    private final FareClassRepository fareClassRepository;

    /**
     * Lấy danh sách các hạng vé đang mở bán (active = true)
     * Dành cho Khách hàng khi xem hoặc đặt chuyến bay
     */
    @Transactional(readOnly = true)
    public List<FareClassResponse> getAllActiveFares() {
        return fareClassRepository.findByActiveTrue()
                .stream()
                .map(FareClassResponse::fromEntity)
                .toList();
    }

    /**
     * Lấy danh sách toàn bộ hạng vé (cả active và inactive)
     * Dành cho Quản trị viên (Admin)
     */
    @Transactional(readOnly = true)
    public List<FareClassResponse> getAllFares() {
        return fareClassRepository.findAll()
                .stream()
                .map(FareClassResponse::fromEntity)
                .toList();
    }

    /**
     * Xem thông tin chi tiết một hạng vé theo ID
     */
    @Transactional(readOnly = true)
    public FareClassResponse getFareById(Long id) {
        FareClass fareClass = fareClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hạng vé với ID: " + id));
        return FareClassResponse.fromEntity(fareClass);
    }

    /**
     * Thêm mới một hạng vé (Admin)
     */
    public FareClassResponse createFare(FareClassRequest request) {
        if (fareClassRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Mã hạng vé đã tồn tại: " + request.getCode());
        }

        FareClass fareClass = FareClass.builder()
                .code(request.getCode().toUpperCase().trim())
                .name(request.getName().trim())
                .priceMultiplier(request.getPriceMultiplier())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        FareClass saved = fareClassRepository.save(fareClass);
        return FareClassResponse.fromEntity(saved);
    }

    /**
     * Cập nhật thông tin hạng vé theo ID (Admin)
     */
    public FareClassResponse updateFare(Long id, FareClassRequest request) {
        FareClass fareClass = fareClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hạng vé với ID: " + id));

        // Nếu thay đổi code, kiểm tra xem code mới đã bị trùng với bản ghi khác chưa
        if (!fareClass.getCode().equalsIgnoreCase(request.getCode()) && fareClassRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Mã hạng vé đã tồn tại: " + request.getCode());
        }

        fareClass.setCode(request.getCode().toUpperCase().trim());
        fareClass.setName(request.getName().trim());
        fareClass.setPriceMultiplier(request.getPriceMultiplier());
        if (request.getActive() != null) {
            fareClass.setActive(request.getActive());
        }

        FareClass updated = fareClassRepository.save(fareClass);
        return FareClassResponse.fromEntity(updated);
    }

    /**
     * Xóa một hạng vé theo ID (Admin)
     */
    public void deleteFare(Long id) {
        if (!fareClassRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy hạng vé với ID: " + id);
        }
        fareClassRepository.deleteById(id);
    }
}
