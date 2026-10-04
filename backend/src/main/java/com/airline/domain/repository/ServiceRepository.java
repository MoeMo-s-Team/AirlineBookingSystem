package com.airline.domain.repository;

import com.airline.domain.entity.AdditionalService;
import com.airline.domain.enums.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<AdditionalService, Long> {

    /**
     * Lấy danh sách tất cả các dịch vụ đi kèm đang hoạt động (active = true)
     * Dùng cho khách hàng lựa chọn khi đặt vé
     */
    List<AdditionalService> findByActiveTrue();

    /**
     * Lấy danh sách dịch vụ đang hoạt động theo từng loại cụ thể (BAGGAGE, MEAL, SEAT, PRIORITY_BOARDING)
     */
    List<AdditionalService> findByTypeAndActiveTrue(ServiceType type);

    /**
     * Lấy danh sách dịch vụ theo loại (dành cho Admin quản lý)
     */
    List<AdditionalService> findByType(ServiceType type);

    /**
     * Kiểm tra xem tên dịch vụ đã tồn tại chưa (phục vụ validation khi tạo mới)
     */
    boolean existsByName(String name);
}
