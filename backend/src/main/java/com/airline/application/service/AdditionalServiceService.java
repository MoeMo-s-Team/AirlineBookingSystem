package com.airline.application.service;

import com.airline.domain.entity.AdditionalService;
import com.airline.domain.enums.ServiceType;
import com.airline.domain.repository.ServiceRepository;
import com.airline.presentation.dto.request.ServiceRequest;
import com.airline.presentation.dto.response.ServiceResponse;
import com.airline.presentation.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdditionalServiceService {

    private final ServiceRepository serviceRepository;

    /**
     * Lấy danh sách tất cả các dịch vụ đi kèm đang hoạt động (active = true)
     * Dành cho Khách hàng chọn khi đặt vé
     */
    @Transactional(readOnly = true)
    public List<ServiceResponse> getAllActiveServices() {
        return serviceRepository.findByActiveTrue()
                .stream()
                .map(ServiceResponse::fromEntity)
                .toList();
    }

    /**
     * Lấy danh sách toàn bộ dịch vụ (cả active và inactive)
     * Dành cho Quản trị viên (Admin)
     */
    @Transactional(readOnly = true)
    public List<ServiceResponse> getAllServices() {
        return serviceRepository.findAll()
                .stream()
                .map(ServiceResponse::fromEntity)
                .toList();
    }

    /**
     * Lấy dịch vụ theo loại cụ thể (BAGGAGE, MEAL, SEAT, PRIORITY_BOARDING)
     */
    @Transactional(readOnly = true)
    public List<ServiceResponse> getServicesByType(ServiceType type) {
        return serviceRepository.findByTypeAndActiveTrue(type)
                .stream()
                .map(ServiceResponse::fromEntity)
                .toList();
    }

    /**
     * Lấy chi tiết dịch vụ theo ID
     */
    @Transactional(readOnly = true)
    public ServiceResponse getServiceById(Long id) {
        AdditionalService service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + id));
        return ServiceResponse.fromEntity(service);
    }

    /**
     * Thêm mới dịch vụ bổ trợ (Admin)
     */
    public ServiceResponse createService(ServiceRequest request) {
        if (serviceRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Tên dịch vụ đã tồn tại: " + request.getName());
        }

        AdditionalService service = AdditionalService.builder()
                .name(request.getName().trim())
                .type(request.getType())
                .price(request.getPrice())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        AdditionalService saved = serviceRepository.save(service);
        return ServiceResponse.fromEntity(saved);
    }

    /**
     * Cập nhật thông tin dịch vụ theo ID (Admin)
     */
    public ServiceResponse updateService(Long id, ServiceRequest request) {
        AdditionalService service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + id));

        // Nếu thay đổi tên, kiểm tra trùng tên với dịch vụ khác
        if (!service.getName().equalsIgnoreCase(request.getName()) && serviceRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Tên dịch vụ đã tồn tại: " + request.getName());
        }

        service.setName(request.getName().trim());
        service.setType(request.getType());
        service.setPrice(request.getPrice());
        if (request.getActive() != null) {
            service.setActive(request.getActive());
        }

        AdditionalService updated = serviceRepository.save(service);
        return ServiceResponse.fromEntity(updated);
    }

    /**
     * Xóa dịch vụ theo ID (Admin)
     */
    public void deleteService(Long id) {
        if (!serviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + id);
        }
        serviceRepository.deleteById(id);
    }
}
