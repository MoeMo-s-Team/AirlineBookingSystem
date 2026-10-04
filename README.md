# ✈️ Airline Booking System

## Thành viên

| MSSV    | Họ và tên              | Email              | GitHub                                               |
| ------- | ---------------------- | ------------------ | ---------------------------------------------------- |
| 2312617 | Trần Xuân Hiếu         | 2312617@dlu.edu.vn | [@ThanhXuanHieu](https://github.com/ThanhXuanHieu)   |
| 2312693 | Nguyễn Thị Trà My      | 2312693@dlu.edu.vn | [@My6325](https://github.com/My6325)                 |
| 2312609 | Nguyễn Ngọc Thanh Hiền | 2312609@dlu.edu.vn | [@hiendotforwork](https://github.com/hiendotforwork) |
| 2115182 | Đặng Ân Thùy Anh | | [@danganthuyanh03](https://github.com/danganthuyanh03)
## 1. Giới thiệu

**Airline Booking System** là hệ thống website **cổng đặt vé máy bay đa hạng vé và xử lý các dịch vụ đi kèm**, được xây dựng bằng **Java Spring Boot** và áp dụng các **Design Patterns** trong quá trình thiết kế và phát triển.

Hệ thống cho phép khách hàng tìm kiếm chuyến bay, lựa chọn hạng vé, thêm các dịch vụ đi kèm, thực hiện đặt vé và thanh toán giả lập. Đồng thời, quản trị viên có thể quản lý chuyến bay, dịch vụ và đơn đặt vé.

**Mục tiêu chính:**

- Xây dựng hệ thống đặt vé máy bay có nghiệp vụ thực tế.
- Áp dụng OOP và SOLID trong thiết kế.
- Vận dụng Design Patterns để giải quyết các bài toán nghiệp vụ.
- Xây dựng RESTful API và giao diện web.
- Thực hành quy trình phát triển phần mềm theo nhóm với Git/GitHub.

---

## 2. Công nghệ sử dụng

### Backend

| Công nghệ                       | Mục đích                            |
| ------------------------------- | ----------------------------------- |
| **Java 21**                     | Ngôn ngữ lập trình chính            |
| **Spring Boot**                 | Xây dựng Backend và REST API        |
| **Spring Web**                  | Xây dựng RESTful API                |
| **Spring Data JPA**             | ORM và truy cập cơ sở dữ liệu       |
| **Hibernate**                   | Persistence Framework               |
| **Spring Security**             | API Security + Authorization        |
| **Supabase JWT Verification**   | Authentication (external)           |
| **Spring Validation**           | Kiểm tra dữ liệu đầu vào            |
| **SpringDoc OpenAPI / Swagger** | Tài liệu và kiểm thử API            |
| **Maven**                       | Quản lý dependency và build project |

### Frontend

| Công nghệ        | Mục đích                       |
| ---------------- | ------------------------------ |
| **React**        | Xây dựng giao diện             |
| **TypeScript**   | Type-safe frontend development |
| **Vite**         | Frontend build tool            |
| **Tailwind CSS** | Xây dựng giao diện UI          |

### Database

- **Supabase PostgreSQL** — cloud-hosted PostgreSQL, lưu trữ toàn bộ dữ liệu người dùng, chuyến bay, vé, booking, dịch vụ và thanh toán.
- **Supabase Auth** — quản lý xác thực người dùng (email/password, OAuth)

### Testing & Development

- **JUnit 5** — Unit Testing
- **Mockito** — Mocking và kiểm thử
- **Postman** — API Testing
- **Git / GitHub** — Version Control & Collaboration
- **Docker** — Containerization

---

## 3. Design Patterns

Hệ thống tập trung áp dụng các Design Patterns vào nghiệp vụ:

| Pattern       | Áp dụng                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------ |
| **Strategy**  | Tính giá vé linh hoạt theo từng hạng vé (Economy, Premium Economy, Business)               |
| **State**     | Quản lý vòng đời và chuyển đổi trạng thái Booking (Pending, Confirmed, Cancelled, Failed)  |
| **Observer**  | Xử lý gửi thông báo đa kênh (Email, SMS, Admin) khi trạng thái Booking thay đổi            |
| **Factory**   | Khởi tạo các loại vé và tài liệu chuyến bay (E-Ticket, Boarding Pass)                     |
| **Decorator** | Tính toán và cộng dồn linh hoạt chi phí các dịch vụ bổ trợ đi kèm                          |
| **Facade**    | Cung cấp interface đơn giản hóa toàn bộ quy trình đặt vé cho client                        |

---

## 4. Chức năng chính

### 👤 Khách hàng

| Chức năng                     | Mô tả chi tiết                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| **Đăng ký / Đăng nhập**       | Tạo tài khoản mới, xác thực và đăng nhập vào hệ thống                                     |
| **Tìm kiếm & Xem chuyến bay** | Tìm kiếm chuyến bay theo điểm đi, điểm đến, ngày bay và xem thông tin chi tiết chuyến bay |
| **Lựa chọn hạng vé**          | Hỗ trợ nhiều phân hạng vé: Economy, Premium Economy, Business                             |
| **Thông tin hành khách**      | Nhập và lưu trữ thông tin chi tiết người bay                                              |
| **Dịch vụ đi kèm**            | Tùy chọn các dịch vụ bổ trợ: Hành lý, suất ăn, chọn ghế, ưu tiên lên máy bay              |
| **Tính giá tự động**          | Tự động tính toán tổng chi phí gồm giá vé gốc và các dịch vụ đi kèm đã chọn               |
| **Đặt vé & Thanh toán**       | Thực hiện tạo đơn đặt vé và mô phỏng thanh toán giả lập                                   |
| **Lịch sử đặt vé**            | Tra cứu và xem lại danh sách các đơn đặt vé đã thực hiện                                  |
| **Hủy vé**                    | Hủy vé theo quy định trạng thái Booking hiện tại                                          |

### 👨‍💼 Quản trị viên

| Chức năng                       | Mô tả chi tiết                                            |
| ------------------------------- | --------------------------------------------------------- |
| **Quản lý chuyến bay**          | Thêm mới, chỉnh sửa, xóa và xem danh sách các chuyến bay  |
| **Quản lý hạng vé**             | Thiết lập, cấu hình các hạng vé và mức giá tương ứng      |
| **Quản lý dịch vụ đi kèm**      | Quản lý danh mục, tùy chọn và giá của các dịch vụ bổ trợ  |
| **Quản lý đơn đặt vé**          | Xem danh sách, tra cứu chi tiết và quản lý các đơn đặt vé |
| **Theo dõi trạng thái Booking** | Giám sát và cập nhật trạng thái vòng đời của đơn đặt vé   |

---

## 5. Quy trình đặt vé

```text
Tìm kiếm chuyến bay
        ↓
Chọn chuyến bay
        ↓
Chọn hạng vé
        ↓
Nhập thông tin hành khách
        ↓
Chọn dịch vụ đi kèm
        ↓
Tính tổng tiền
        ↓
Xác nhận Booking
        ↓
Thanh toán
        ↓
Booking được xác nhận
```

Ví dụ:

```text
Business Class
+ 20kg hành lý
+ Suất ăn đặc biệt
+ Ghế 12A
+ Priority
        ↓
    Tổng tiền
```

---

## 6. Kiến trúc hệ thống

```text
React + TypeScript
        │
        │ REST API (JWT)
        ▼
Spring Boot
 ├── Presentation
 ├── Application
 ├── Domain
 └── Infrastructure
        │
        ▼
   Supabase PostgreSQL
   + Supabase Auth
```

Hệ thống được xây dựng theo hướng **Modular Monolith**, tập trung xử lý nghiệp vụ trong Backend và áp dụng Design Patterns tại tầng Domain/Application.

---

## 7. Phạm vi dự án

Dự án được phát triển trong **3 tuần**, tập trung vào:

- OOP & SOLID.
- Design Patterns.
- Business Logic.
- REST API.
- Database Design.
- Supabase Integration (PostgreSQL + Auth).
- Unit Testing.
- Git/GitHub Collaboration.

Các chức năng như thanh toán ngân hàng thật, tích hợp API hãng hàng không thực tế, hệ thống vé điện tử chuẩn hàng không và các dịch vụ phức tạp nằm ngoài phạm vi phiên bản này.

---

## 8. Cấu trúc dự án

```text
AirlineBookingSystem_DesignPattern/
├── backend/                          # Spring Boot API
│   ├── src/main/java/com/airline/
│   │   ├── config/                  # Cấu hình hệ thống
│   │   ├── presentation/            # Controller, DTO, Exception
│   │   ├── application/             # Application Services
│   │   ├── domain/                  # Entities, Repositories, Enums
│   │   ├── infrastructure/          # Security, external services
│   │   ├── pattern/                 # Triển khai Design Patterns
│   │   └── AirlineApplication.java  # Main application class
│   ├── src/main/resources/          # Cấu hình application.yml
│   ├── pom.xml                      # Maven dependencies
│   └── Dockerfile
├── frontend/                         # React SPA
│   ├── public/                      # Static assets
│   ├── src/                         # Source code (API, Components, Pages)
│   ├── package.json                 # Node dependencies
│   ├── vite.config.js               # Cấu hình Vite
│   ├── tailwind.config.js           # Cấu hình Tailwind CSS
│   ├── nginx.conf                   # Cấu hình Nginx reverse proxy
│   └── Dockerfile
├── docker-compose.yml                # Docker Compose orchestration
├── .env.example                     # Biến môi trường mẫu
└── README.md
```

---

## 9. Hướng dẫn cài đặt & Khởi động nhanh

### Yêu cầu môi trường

- **Java**: 21+
- **Node.js**: 18+
- **Docker & Docker Compose** (chỉ cần cho Backend và Frontend)
- **Supabase Account**: [supabase.com](https://supabase.com)

### Khởi chạy bằng Docker Compose (Khuyến nghị)

```bash
# Tạo project Supabase tại supabase.com và lấy credentials
# Copy .env.example thành .env và điền Supabase credentials

# Khởi động Backend và Frontend (Database trên Supabase Cloud)
docker-compose up -d

# Truy cập ứng dụng:
# - Frontend: http://localhost:5173
# - Backend:  http://localhost:8080
# - Swagger:  http://localhost:8080/swagger-ui.html
# - Supabase Dashboard: https://supabase.com/dashboard

# Dừng và hạ toàn bộ services:
docker-compose down
```

### Cài đặt thủ công (Manual Setup)

### Backend Development

```bash
cd backend
mvn spring-boot:run
```

### Frontend Development

```bash
cd frontend
pnpm install
pnpm dev
```

### Docker

```bash
docker-compose up -d
```

## API Documentation

Swagger UI: http://localhost:8080/swagger-ui.html
