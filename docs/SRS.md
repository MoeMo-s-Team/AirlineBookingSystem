# SOFTWARE SYSTEM REQUIREMENTS

# SRS --- AIRLINE BOOKING SYSTEM

**Tên dự án:** Xây dựng website Cổng Đặt vé Máy bay Đa Hạng vé và Xử lý
Dịch vụ Đi kèm dựa trên Design Patterns bằng Java\
**Thời gian thực hiện:** 3 tuần\
**Phiên bản tài liệu:** 1.0

---

## Mục lục

- [1. Giới thiệu](#1-giới-thiệu)
  - [1.1. Mục đích tài liệu](#11-mục-đích-tài-liệu)
  - [1.2. Phạm vi hệ thống](#12-phạm-vi-hệ-thống)
  - [1.3. Mục tiêu](#13-mục-tiêu)
  - [1.4. Ràng buộc và giới hạn](#14-ràng-buộc-và-giới-hạn)
- [2. Tổng quan hệ thống](#2-tổng-quan-hệ-thống)
  - [2.1. Mô tả hệ thống](#21-mô-tả-hệ-thống)
  - [2.2. Đối tượng sử dụng](#22-đối-tượng-sử-dụng)
  - [2.3. Bối cảnh hệ thống](#23-bối-cảnh-hệ-thống)
  - [2.4. Quy trình nghiệp vụ tổng
    quát](#24-quy-trình-nghiệp-vụ-tổng-quát)
- [3. Các module chức năng](#3-các-module-chức-năng)
  - [3.1. Module Xác thực và tài
    khoản](#31-module-xác-thực-và-tài-khoản)
  - [3.2. Module Tìm kiếm và quản lý chuyến
    bay](#32-module-tìm-kiếm-và-quản-lý-chuyến-bay)
  - [3.3. Module Hạng vé](#33-module-hạng-vé)
  - [3.4. Module Thông tin hành
    khách](#34-module-thông-tin-hành-khách)
  - [3.5. Module Dịch vụ đi kèm](#35-module-dịch-vụ-đi-kèm)
  - [3.6. Module Tính giá](#36-module-tính-giá)
  - [3.7. Module Đặt vé](#37-module-đặt-vé)
  - [3.8. Module Thanh toán](#38-module-thanh-toán)
  - [3.9. Module Quản lý trạng thái
    Booking](#39-module-quản-lý-trạng-thái-booking)
  - [3.10. Module Thông báo](#310-module-thông-báo)
- [4. Yêu cầu chức năng](#4-yêu-cầu-chức-năng)
- [5. Đặc tả Use Case](#5-đặc-tả-use-case)
  - [5.1. Danh sách Use Case](#51-danh-sách-use-case)
  - [5.2. Quan hệ giữa các Use Case](#52-quan-hệ-giữa-các-use-case)
- [6. Quy tắc nghiệp vụ](#6-quy-tắc-nghiệp-vụ)
- [7. Yêu cầu phi chức năng](#7-yêu-cầu-phi-chức-năng)
- [8. Yêu cầu dữ liệu](#8-yêu-cầu-dữ-liệu)
  - [8.1. Mô hình dữ liệu](#81-mô-hình-dữ-liệu)
  - [8.2. Các bảng dữ liệu](#82-các-bảng-dữ-liệu)
  - [8.3. Quan hệ dữ liệu](#83-quan-hệ-dữ-liệu)
- [9. Yêu cầu API](#9-yêu-cầu-api)
  - [9.1. Auth API](#91-auth-api)
  - [9.2. Flight API](#92-flight-api)
  - [9.3. Fare API](#93-fare-api)
  - [9.4. Service API](#94-service-api)
  - [9.5. Booking API](#95-booking-api)
  - [9.6. Payment API](#96-payment-api)
  - [9.7. Notification API](#97-notification-api)
  - [9.8. Phân quyền API](#98-phân-quyền-api)
- [10. Kiến trúc hệ thống](#10-kiến-trúc-hệ-thống)
  - [10.1. Kiến trúc tổng thể](#101-kiến-trúc-tổng-thể)
  - [10.2. Các tầng hệ thống](#102-các-tầng-hệ-thống)
- [11. Design Patterns](#11-design-patterns)
  - [11.1. Strategy Pattern](#111-strategy-pattern)
  - [11.2. Decorator Pattern](#112-decorator-pattern)
  - [11.3. Factory Pattern](#113-factory-pattern)
  - [11.4. State Pattern](#114-state-pattern)
  - [11.5. Observer Pattern](#115-observer-pattern)
  - [11.6. Facade Pattern](#116-facade-pattern)
- [12. Thiết kế Class](#12-thiết-kế-class)
- [13. Ma trận truy vết yêu cầu](#13-ma-trận-truy-vết-yêu-cầu)
- [14. Phạm vi triển khai và kiểm
  thử](#14-phạm-vi-triển-khai-và-kiểm-thử)

---

# 1. Giới thiệu

## 1.1. Mục đích tài liệu

Tài liệu SSR mô tả các yêu cầu của hệ thống **Airline Booking System**,
bao gồm phạm vi, đối tượng sử dụng, chức năng, quy tắc nghiệp vụ, dữ
liệu, API, kiến trúc hệ thống, Design Patterns và mối liên hệ giữa các
yêu cầu với thành phần triển khai.

Tài liệu là cơ sở để thiết kế, phát triển, kiểm thử và đánh giá hệ thống
trong thời gian thực hiện dự án 3 tuần.

## 1.2. Phạm vi hệ thống

Hệ thống là website Cổng Đặt vé Máy bay Đa Hạng vé và Xử lý Dịch vụ Đi
kèm bằng Java Spring Boot và Design Patterns.

Khách hàng có thể:

- Đăng ký và đăng nhập.
- Tìm kiếm chuyến bay.
- Xem chi tiết chuyến bay.
- Lựa chọn hạng vé.
- Nhập thông tin hành khách.
- Lựa chọn dịch vụ đi kèm.
- Tính tổng giá.
- Tạo Booking.
- Thanh toán mock.
- Xem lịch sử Booking.
- Hủy Booking theo trạng thái Booking.

Admin có thể:

- Quản lý chuyến bay.
- Quản lý hạng vé.
- Quản lý dịch vụ.
- Quản lý Booking.
- Theo dõi và cập nhật trạng thái Booking.

Các hạng vé chính:

- Economy.
- Premium Economy.
- Business.

Các dịch vụ đi kèm:

- Baggage.
- Meal.
- Seat.
- Priority Boarding.

## 1.3. Mục tiêu

Hệ thống hướng đến các mục tiêu:

- Xây dựng website đặt vé máy bay có nhiều hạng vé.
- Xử lý các dịch vụ đi kèm trong quá trình đặt vé.
- Áp dụng OOP và SOLID.
- Áp dụng Design Patterns vào business logic.
- Xây dựng REST API bằng Java Spring Boot.
- Thiết kế cơ sở dữ liệu Supabase PostgreSQL.
- Tích hợp frontend với backend.
- Thực hiện Unit Testing.
- Hoàn thành trong thời gian 3 tuần.

## 1.4. Ràng buộc và giới hạn

Hệ thống được triển khai trong phạm vi project 3 tuần.

Không nằm trong phạm vi:

- Thanh toán ngân hàng thật.
- Tích hợp API hãng hàng không thật.
- Hệ thống phát hành e-ticket theo tiêu chuẩn ngành.
- Các dịch vụ phức tạp ngoài phạm vi hệ thống.

Payment trong phạm vi hệ thống là mock payment.

---

# 2. Tổng quan hệ thống

## 2.1. Mô tả hệ thống

Airline Booking System là một hệ thống website cho phép khách hàng tìm
kiếm chuyến bay, lựa chọn hạng vé, nhập thông tin hành khách, lựa chọn
dịch vụ đi kèm, tính giá, tạo Booking và thực hiện thanh toán mock.

Hệ thống đồng thời cung cấp khu vực quản trị cho Admin để quản lý các dữ
liệu và Booking liên quan.

Kiến trúc được lựa chọn là **Modular Monolith**.

## 2.2. Đối tượng sử dụng

### Customer

Customer sử dụng hệ thống để:

- Đăng ký.
- Đăng nhập.
- Tìm kiếm và xem chuyến bay.
- Chọn hạng vé.
- Nhập thông tin hành khách.
- Chọn dịch vụ đi kèm.
- Tính giá.
- Tạo Booking.
- Thanh toán.
- Xem Booking.
- Xem lịch sử Booking.
- Hủy Booking.

### Admin

Admin sử dụng hệ thống để:

- Quản lý chuyến bay.
- Quản lý hạng vé.
- Quản lý dịch vụ.
- Quản lý Booking.
- Theo dõi và cập nhật trạng thái Booking.

### System

System thực hiện các xử lý tự động:

- Tính giá.
- Quản lý chuyển trạng thái Booking.
- Gửi/tạo thông báo khi Booking thay đổi.

## 2.3. Bối cảnh hệ thống

```text
React + TypeScript
        |
        | REST API
        v
Spring Boot
        |
        +---------------- Presentation
        |
        +---------------- Application
        |
        +---------------- Domain
        |
        +---------------- Infrastructure
        |
        v
PostgreSQL
```

## 2.4. Quy trình nghiệp vụ tổng quát

```text
Search Flight
      ↓
Select Flight
      ↓
Select Fare Class
      ↓
Enter Passenger Information
      ↓
Select Additional Services
      ↓
Calculate Total Price
      ↓
Create Booking (PENDING)
      ↓
Make Payment
      ↓
Booking CONFIRMED / PAYMENT_FAILED
      ↓
Notification
```

---

# 3. Các module chức năng

## 3.1. Module Xác thực và tài khoản

### Mục đích

Quản lý tài khoản người dùng và xác thực truy cập hệ thống.

### Chức năng

ID Chức năng Actor

---

FR-AUTH-001 Register Customer
FR-AUTH-002 Login Customer/Admin

### Register

Customer nhập thông tin đăng ký qua Supabase Auth. Hệ thống tự động tạo profile người dùng trong bảng `profiles` thông qua database trigger.

### Login

Người dùng đăng nhập qua Supabase Auth. Frontend gửi yêu cầu đăng nhập trực tiếp đến Supabase, nhận JWT và sử dụng token này để gọi các API backend yêu cầu xác thực.

---

## 3.2. Module Tìm kiếm và quản lý chuyến bay

### Mục đích

Cho phép Customer tìm kiếm, xem thông tin chuyến bay và cho phép Admin
quản lý dữ liệu chuyến bay.

### Chức năng

ID Chức năng Actor

---

FR-FLT-001 Search Flights Customer
FR-FLT-002 View Flight Detail Customer
FR-FLT-003 Manage Flights Admin

### Search Flights

Customer cung cấp:

- Điểm đi.
- Điểm đến.
- Ngày bay.

Hệ thống trả về các chuyến bay phù hợp.

### View Flight Detail

Customer xem thông tin chi tiết của chuyến bay.

### Manage Flights

Admin thực hiện:

- Create Flight.
- View Flight.
- Update Flight.
- Delete Flight.

Thông tin chuyến bay gồm số hiệu chuyến bay, điểm đi, điểm đến, thời
gian khởi hành, thời gian đến và số ghế còn lại.

---

## 3.3. Module Hạng vé

### Mục đích

Quản lý và lựa chọn hạng vé của chuyến bay.

### Chức năng

ID Chức năng Actor

---

FR-FARE-001 Select Fare Class Customer
FR-FARE-002 Manage Fare Classes Admin

### Hạng vé

Hệ thống hỗ trợ:

- Economy.
- Premium Economy.
- Business.

### Select Fare Class

Customer lựa chọn hạng vé trong quá trình đặt Booking.

### Manage Fare Classes

Admin thực hiện:

- Create.
- View.
- Update.
- Delete.

Fare Class chứa thông tin về mã, tên, price multiplier và trạng thái
active.

---

## 3.4. Module Thông tin hành khách

### Mục đích

Thu thập và quản lý thông tin Passenger trong Booking.

### Chức năng

ID Chức năng Actor

---

FR-PAX-001 Enter Passenger Information Customer

### Quy định

Một Booking có tối thiểu 1 Passenger và có thể có nhiều Passenger.

```text
Booking 1 ─────── N Passenger
```

### Thông tin Passenger

- Full name.
- Date of birth.
- Passport number.
- Phone.

---

## 3.5. Module Dịch vụ đi kèm

### Mục đích

Cho phép Customer lựa chọn các dịch vụ bổ sung trong quá trình đặt vé và
cho phép Admin quản lý danh mục dịch vụ.

### Chức năng

ID Chức năng Actor

---

FR-SVC-001 Select Additional Services Customer
FR-SVC-002 Manage Additional Services Admin

### Dịch vụ

- Baggage.
- Meal.
- Seat.
- Priority Boarding.

### Select Additional Services

Customer có thể lựa chọn một hoặc nhiều dịch vụ trong Booking.

### Manage Additional Services

Admin thực hiện:

- Create.
- View.
- Update.
- Delete.

Thông tin dịch vụ gồm tên, loại, giá và trạng thái active.

---

## 3.6. Module Tính giá

### Mục đích

Tính giá vé dựa trên giá cơ bản, hạng vé và dịch vụ đi kèm.

### Chức năng

ID Chức năng Actor

---

FR-PRICE-001 Calculate Total Price System

### Công thức

```text
Ticket Price
    = Base Flight Price × Fare Multiplier

Total Price
    = Σ Ticket Price + Σ Additional Service Price
```

Pricing được thiết kế để áp dụng Strategy Pattern.

---

## 3.7. Module Đặt vé

### Mục đích

Quản lý toàn bộ vòng đời Booking từ khi tạo đến khi xem, hủy hoặc quản
lý bởi Admin.

### Chức năng

ID Chức năng Actor

---

FR-BOOK-001 Create Booking Customer
FR-BOOK-002 View Booking Customer
FR-BOOK-003 View Booking History Customer
FR-BOOK-004 Cancel Booking Customer
FR-BOOK-005 Manage Bookings Admin
FR-BOOK-006 Update Booking Status Admin/System

### Create Booking

Quy trình tạo Booking bao gồm:

1.  Chọn Flight.
2.  Chọn Fare Class.
3.  Nhập Passenger Information.
4.  Chọn Additional Services.
5.  Calculate Total Price.
6.  Tạo Booking với trạng thái `PENDING`.

### View Booking

Customer xem thông tin một Booking.

### View Booking History

Customer xem các Booking của mình.

### Cancel Booking

Customer hủy Booking theo trạng thái Booking.

### Manage Bookings

Admin quản lý các Booking trong hệ thống.

### Update Booking Status

Admin/System cập nhật trạng thái Booking theo các transition được quy
định.

---

## 3.8. Module Thanh toán

### Mục đích

Thực hiện thanh toán mock cho Booking.

### Chức năng

ID Chức năng Actor

---

FR-PAY-001 Make Payment Customer

### Mock Payment Gateway

Payment được xử lý thông qua Mock Payment Gateway.

Kết quả payment:

- SUCCESS.
- FAILED.

Luồng:

```text
Booking PENDING
      ↓
Mock Payment Gateway
      ↓
 ┌────┴────┐
SUCCESS   FAILED
   ↓         ↓
CONFIRMED  PAYMENT_FAILED
```

Payment không kết nối ngân hàng hoặc cổng thanh toán thật.

---

## 3.9. Module Quản lý trạng thái Booking

### Mục đích

Quản lý lifecycle của Booking bằng State Pattern.

### Các trạng thái

- PENDING.
- CONFIRMED.
- CANCELLED.
- PAYMENT_FAILED.

### State Transition

```text
PENDING
 ├──→ CONFIRMED
 ├──→ CANCELLED
 └──→ PAYMENT_FAILED
```

Các transition không hợp lệ phải bị từ chối.

Booking sau khi `CANCELLED` không được quay trở lại `CONFIRMED`.

---

## 3.10. Module Thông báo

### Mục đích

Tạo và quản lý thông báo trong hệ thống khi Booking có thay đổi.

### Chức năng

ID Chức năng Actor

---

FR-NOTI-001 Send Booking Notification System

### Channel

MVP sử dụng **In-app Notification**.

Luồng:

```text
Booking Event
     ↓
Observer
     ↓
NotificationService
     ↓
Notification
     ↓
Database
```

Customer có thể xem notification trong hệ thống.

---

# 4. Yêu cầu chức năng

| Module       | ID           | Yêu cầu chức năng           |
| ------------ | ------------ | --------------------------- |
| AUTH         | FR-AUTH-001  | Register                    |
| AUTH         | FR-AUTH-002  | Login                       |
| FLIGHT       | FR-FLT-001   | Search Flights              |
| FLIGHT       | FR-FLT-002   | View Flight Detail          |
| FLIGHT       | FR-FLT-003   | Manage Flights              |
| FARE         | FR-FARE-001  | Select Fare Class           |
| FARE         | FR-FARE-002  | Manage Fare Classes         |
| PASSENGER    | FR-PAX-001   | Enter Passenger Information |
| SERVICE      | FR-SVC-001   | Select Additional Services  |
| SERVICE      | FR-SVC-002   | Manage Additional Services  |
| PRICING      | FR-PRICE-001 | Calculate Total Price       |
| BOOKING      | FR-BOOK-001  | Create Booking              |
| BOOKING      | FR-BOOK-002  | View Booking                |
| BOOKING      | FR-BOOK-003  | View Booking History        |
| BOOKING      | FR-BOOK-004  | Cancel Booking              |
| BOOKING      | FR-BOOK-005  | Manage Bookings             |
| BOOKING      | FR-BOOK-006  | Update Booking Status       |
| PAYMENT      | FR-PAY-001   | Make Payment                |
| NOTIFICATION | FR-NOTI-001  | Send Booking Notification   |

---

# 5. Đặc tả Use Case

## 5.1. Danh sách Use Case

| ID   | Use Case Actor                           |
| ---- | ---------------------------------------- |
| UC01 | Register Customer                        |
| UC02 | Login Customer/Admin                     |
| UC03 | Search Flights Customer                  |
| UC04 | View Flight Detail Customer              |
| UC05 | Select Fare Class Customer               |
| UC06 | Enter Passenger Info Customer            |
| UC07 | Select Additional Services Customer      |
| UC08 | Calculate Total Price System             |
| UC09 | Create Booking Customer                  |
| UC10 | Make Payment Customer                    |
| UC11 | View Booking History Customer            |
| UC12 | Cancel Booking Customer                  |
| UC13 | Manage Flights Admin                     |
| UC14 | Manage Fare Classes Admin                |
| UC15 | Manage Services Admin                    |
| UC16 | Manage Bookings Admin                    |
| UC17 | Track/Update Booking Status Admin/System |
| UC18 | Send Booking Notification System         |

## 5.2. Quan hệ giữa các Use Case

`Create Booking` bao gồm các chức năng:

- Enter Passenger Info.
- Select Additional Services.
- Calculate Total Price.
- Select Fare Class.

Payment là Use Case được thực hiện sau khi Booking được tạo.

Quy trình:

```text
UC03 Search Flights
       ↓
UC04 View Flight Detail
       ↓
UC05 Select Fare Class
       ↓
UC06 Enter Passenger Info
       ↓
UC07 Select Additional Services
       ↓
UC08 Calculate Total Price
       ↓
UC09 Create Booking
       ↓
UC10 Make Payment
```

---

# 6. Quy tắc nghiệp vụ

## BR-001 --- Passenger trong Booking

Một Booking phải có tối thiểu 1 Passenger và có thể có nhiều Passenger.

## BR-002 --- Pricing

Giá vé được tính theo:

```text
Ticket Price
    = Base Flight Price × Fare Multiplier

Total Price
    = Σ Ticket Price + Σ Additional Service Price
```

## BR-003 --- Booking State

Booking có các trạng thái:

```text
PENDING
CONFIRMED
CANCELLED
PAYMENT_FAILED
```

Transition:

```text
PENDING → CONFIRMED
PENDING → CANCELLED
PENDING → PAYMENT_FAILED
```

Booking ở trạng thái `CANCELLED` không được chuyển trở lại `CONFIRMED`.

## BR-004 --- Payment

Payment là mock payment.

Payment có thể trả về:

- SUCCESS.
- FAILED.

Khi payment thành công, Booking chuyển sang `CONFIRMED`.

Khi payment thất bại, Booking chuyển sang `PAYMENT_FAILED`.

## BR-005 --- Notification

Khi Booking phát sinh thay đổi cần thông báo, hệ thống tạo In-app
Notification thông qua Observer.

---

# 7. Yêu cầu phi chức năng

## 7.1. Công nghệ

Backend:

- Java 21.
- Spring Boot.
- Spring Web.
- Spring Data JPA.
- Hibernate.
- Spring Security.
- Supabase Auth (xác thực và quản lý người dùng).
- Supabase PostgreSQL (lưu trữ dữ liệu).
- Spring Validation.
- SpringDoc OpenAPI / Swagger.
- Maven.

Frontend:

- React.
- TypeScript.
- Vite.
- Tailwind CSS.

Database:

- Supabase PostgreSQL.

Testing và công cụ:

- JUnit 5.
- Mockito.
- Postman.
- Git/GitHub.
- Docker.

## 7.2. Kiến trúc và chất lượng mã nguồn

Hệ thống hướng đến:

- OOP.
- SOLID.
- Design Patterns.
- Modular Monolith.
- Phân tách Presentation, Application, Domain và Infrastructure.
- Unit Testing.

## 7.3. API Documentation

REST API được mô tả bằng SpringDoc OpenAPI / Swagger.

## 7.4. Authentication và Authorization

Supabase Auth được sử dụng cho xác thực người dùng. Frontend gọi Supabase Auth API trực tiếp cho signup/login/logout. Backend verify Supabase JWT trong Spring Security filter để phân quyền.

Admin chỉ được truy cập các chức năng quản trị tương ứng.

---

# 8. Yêu cầu dữ liệu

## 8.1. Mô hình dữ liệu

Các entity chính:

```text
Role
Profile
Flight
FareClass
Booking
Passenger
AdditionalService
BookingService
Payment
Notification
```

## 8.2. Các bảng dữ liệu

### roles

Field Mô tả

---

id ID
name Tên role

### profiles

Field Mô tả

---

id ID (UUID từ auth.users)
email Email
full_name Họ tên
role_id Role
created_at Thời gian tạo
updated_at Thời gian cập nhật

### flights

Field Mô tả

---

id ID
flight_number Số hiệu chuyến bay
origin Điểm đi
destination Điểm đến
departure_time Thời gian khởi hành
arrival_time Thời gian đến
available_seats Số ghế còn lại
created_at Thời gian tạo
updated_at Thời gian cập nhật

### fare_classes

Field Mô tả

---

id ID
code Mã hạng vé
name Tên hạng vé
price_multiplier Hệ số giá
active Trạng thái

### bookings

Field Mô tả

---

id ID
booking_code Mã Booking
user_id User
flight_id Flight
fare_class_id Fare Class
status Booking Status
total_price Tổng giá
created_at Thời gian tạo
updated_at Thời gian cập nhật

### passengers

Field Mô tả

---

id ID
booking_id Booking
full_name Họ tên
date_of_birth Ngày sinh
passport_no Số hộ chiếu
phone Số điện thoại

### additional_services

Field Mô tả

---

id ID
name Tên dịch vụ
type Loại dịch vụ
price Giá
active Trạng thái

### booking_services

Field Mô tả

---

id ID
booking_id Booking
service_id Additional Service
quantity Số lượng
unit_price Đơn giá

`unit_price` được lưu để giữ lại giá dịch vụ tại thời điểm Booking.

### payments

Field Mô tả

---

id ID
booking_id Booking
amount Số tiền
payment_method Phương thức
status Payment Status
transaction_ref Transaction Reference
paid_at Thời gian thanh toán
created_at Thời gian tạo

### notifications

Field Mô tả

---

id ID
user_id User
booking_id Booking
type Loại notification
message Nội dung
is_read Trạng thái đã đọc
created_at Thời gian tạo

## 8.3. Quan hệ dữ liệu

```text
Role 1 ───── N Profile

Profile 1 ───── N Booking

Flight 1 ───── N Booking

FareClass 1 ───── N Booking

Booking 1 ───── N Passenger

Booking 1 ───── N Payment

Booking N ───── M AdditionalService
        thông qua BookingService

Profile 1 ───── N Notification

Booking 1 ───── N Notification
```

---

# 9. Yêu cầu API

## 9.1. Auth API

Auth endpoints đã được chuyển sang Supabase Auth. Frontend gọi trực tiếp:
- `supabase.auth.signUp()` — Đăng ký
- `supabase.auth.signInWithPassword()` — Đăng nhập
- `supabase.auth.signOut()` — Đăng xuất

Backend không expose auth endpoints. JWT được verify bởi `SupabaseJwtFilter`.

## 9.2. Flight API

---

Method Endpoint Chức năng

---

GET `/api/flights?origin=...&destination=...&date=...` Search Flights

GET `/api/flights/{id}` View Flight

POST `/api/flights` Create Flight

PUT `/api/flights/{id}` Update Flight

DELETE `/api/flights/{id}` Delete Flight

---

## 9.3. Fare API

Method Endpoint Chức năng

---

GET `/api/fares` List Fare Classes
GET `/api/fares/{id}` View Fare Class
POST `/api/fares` Create Fare Class
PUT `/api/fares/{id}` Update Fare Class
DELETE `/api/fares/{id}` Delete Fare Class

## 9.4. Service API

Method Endpoint Chức năng

---

GET `/api/services` List Services
GET `/api/services/{id}` View Service
POST `/api/services` Create Service
PUT `/api/services/{id}` Update Service
DELETE `/api/services/{id}` Delete Service

## 9.5. Booking API

Method Endpoint Chức năng

---

POST `/api/bookings` Create Booking
GET `/api/bookings/{id}` View Booking
GET `/api/bookings/me` View Booking History
PATCH `/api/bookings/{id}/cancel` Cancel Booking
GET `/api/bookings` Manage/List Bookings
PATCH `/api/bookings/{id}/status` Update Booking Status

## 9.6. Payment API

Method Endpoint Chức năng

---

POST `/api/payments` Make Payment

## 9.7. Notification API

Method Endpoint Chức năng

---

GET `/api/notifications` Get Notifications
PATCH `/api/notifications/{id}/read` Mark as Read

## 9.8. Phân quyền API

Các endpoint quản trị yêu cầu role `ADMIN`:

- Flight CRUD.
- Fare Class CRUD.
- Service CRUD.
- Booking management.
- Booking status management.

## 9.9. API Contract Specification

### Authentication

> **Lưu ý:** Auth endpoints không qua backend — Supabase Auth xử lý trực tiếp từ frontend.

**Frontend Supabase Client:**
```javascript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

**Sign Up:**
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: { data: { full_name: 'Nguyen Van A' } }
})
```

**Sign In:**
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
// Response: { session: { access_token, refresh_token }, user }
```

**Sign Out:**
```javascript
await supabase.auth.signOut()
```

**Get Current User:**
```javascript
const { data: { user } } = await supabase.auth.getUser()
// Requires: Authorization header with Bearer token
```

---

### Common Types

```typescript
// API Response Wrapper
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}

// Standard Error Response
interface ErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
}
```

---

### Profile API

#### GET /api/profile/me

**Mô tả:** Lấy thông tin profile của user hiện tại.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "CUSTOMER"
  }
}
```

**Response 401:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### Flight API

#### GET /api/flights

**Mô tả:** Tìm kiếm chuyến bay.

**Query Parameters:**
| Param | Type | Required | Mô tả |
|-------|------|----------|--------|
| origin | String | Yes | Mã sân bay đi (VD: HAN) |
| destination | String | Yes | Mã sân bay đến (VD: SGN) |
| date | Date | Yes | Ngày bay (YYYY-MM-DD) |

**Example:**
```
GET /api/flights?origin=HAN&destination=SGN&date=2026-12-25
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "flightNumber": "VN1234",
      "origin": "HAN",
      "destination": "SGN",
      "departureTime": "2026-12-25T06:00:00",
      "arrivalTime": "2026-12-25T08:30:00",
      "availableSeats": 45,
      "prices": {
        "economy": 1200000,
        "premium": 1800000,
        "business": 3000000
      }
    }
  ]
}
```

---

#### GET /api/flights/{id}

**Mô tả:** Lấy chi tiết chuyến bay.

**Path Parameters:**
| Param | Type | Mô tả |
|-------|------|--------|
| id | Long | Flight ID |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "flightNumber": "VN1234",
    "origin": "HAN",
    "destination": "SGN",
    "departureTime": "2026-12-25T06:00:00",
    "arrivalTime": "2026-12-25T08:30:00",
    "availableSeats": 45,
    "prices": {
      "economy": 1200000,
      "premium": 1800000,
      "business": 3000000
    }
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "message": "Flight not found"
}
```

---

#### POST /api/flights (Admin)

**Mô tả:** Tạo chuyến bay mới.

**Headers:**
```
Authorization: Bearer {access_token}
Role: ADMIN
```

**Request Body:**
```json
{
  "flightNumber": "VN5678",
  "origin": "SGN",
  "destination": "DAD",
  "departureTime": "2026-12-26T10:00:00",
  "arrivalTime": "2026-12-26T12:30:00",
  "basePrice": 1200000,
  "availableSeats": 100
}
```

**Validation:**
- `flightNumber`: Required, unique, max 20 chars
- `origin`: Required, 3 chars
- `destination`: Required, 3 chars
- `departureTime`: Required, must be future
- `arrivalTime`: Required, must be after departureTime
- `basePrice`: Required, positive number
- `availableSeats`: Required, positive integer

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "flightNumber": "VN5678",
    "origin": "SGN",
    "destination": "DAD",
    "departureTime": "2026-12-26T10:00:00",
    "arrivalTime": "2026-12-26T12:30:00",
    "availableSeats": 100
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "flightNumber", "message": "Flight number already exists" }
  ]
}
```

---

#### PUT /api/flights/{id} (Admin)

**Mô tả:** Cập nhật chuyến bay.

**Path Parameters:**
| Param | Type | Mô tả |
|-------|------|--------|
| id | Long | Flight ID |

**Request Body:**
```json
{
  "departureTime": "2026-12-26T11:00:00",
  "arrivalTime": "2026-12-26T13:30:00",
  "availableSeats": 80
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### DELETE /api/flights/{id} (Admin)

**Mô tả:** Xóa chuyến bay.

**Response 200:**
```json
{
  "success": true,
  "message": "Flight deleted successfully"
}
```

---

### Fare API

#### GET /api/fares

**Mô tả:** Lấy danh sách fare classes.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "ECONOMY",
      "name": "Economy",
      "priceMultiplier": 1.0,
      "active": true
    },
    {
      "id": 2,
      "code": "PREMIUM",
      "name": "Premium Economy",
      "priceMultiplier": 1.5,
      "active": true
    },
    {
      "id": 3,
      "code": "BUSINESS",
      "name": "Business",
      "priceMultiplier": 2.5,
      "active": true
    }
  ]
}
```

---

#### POST /api/fares (Admin)

**Request Body:**
```json
{
  "code": "FIRST",
  "name": "First Class",
  "priceMultiplier": 4.0,
  "active": true
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "code": "FIRST",
    "name": "First Class",
    "priceMultiplier": 4.0,
    "active": true
  }
}
```

---

### Service API

#### GET /api/services

**Mô tả:** Lấy danh sách additional services.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Extra Baggage 20kg",
      "type": "BAGGAGE",
      "price": 500000,
      "active": true
    },
    {
      "id": 2,
      "name": "Special Meal",
      "type": "MEAL",
      "price": 200000,
      "active": true
    },
    {
      "id": 3,
      "name": "Seat Selection",
      "type": "SEAT",
      "price": 150000,
      "active": true
    },
    {
      "id": 4,
      "name": "Priority Boarding",
      "type": "PRIORITY_BOARDING",
      "price": 300000,
      "active": true
    }
  ]
}
```

---

### Booking API

#### POST /api/bookings

**Mô tả:** Tạo booking mới.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "flightId": 1,
  "fareClassId": 3,
  "passengers": [
    {
      "fullName": "Nguyen Van A",
      "dateOfBirth": "1990-05-15",
      "passportNo": "B1234567",
      "phone": "0912345678"
    },
    {
      "fullName": "Tran Thi B",
      "dateOfBirth": "1992-08-20",
      "passportNo": "B7654321",
      "phone": "0987654321"
    }
  ],
  "services": [
    { "serviceId": 1, "quantity": 2 },
    { "serviceId": 3, "quantity": 2 }
  ]
}
```

**Validation:**
- `flightId`: Required, must exist
- `fareClassId`: Required, must exist
- `passengers`: Required, min 1 item
  - `fullName`: Required, max 255 chars
  - `dateOfBirth`: Required, valid date, must be in past
  - `passportNo`: Required, unique within booking
  - `phone`: Required, valid phone format
- `services`: Optional array
  - `serviceId`: Required, must exist
  - `quantity`: Required, min 1

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "bookingCode": "BK-ABC123",
    "status": "PENDING",
    "flight": {
      "id": 1,
      "flightNumber": "VN1234",
      "origin": "HAN",
      "destination": "SGN",
      "departureTime": "2026-12-25T06:00:00"
    },
    "fareClass": {
      "id": 3,
      "code": "BUSINESS",
      "name": "Business"
    },
    "passengers": [
      {
        "id": 1,
        "fullName": "Nguyen Van A",
        "dateOfBirth": "1990-05-15",
        "passportNo": "B1234567"
      }
    ],
    "services": [
      {
        "id": 1,
        "name": "Extra Baggage 20kg",
        "quantity": 2,
        "unitPrice": 500000
      }
    ],
    "priceBreakdown": {
      "baseFare": 6000000,
      "servicesTotal": 1300000,
      "total": 7300000
    },
    "totalPrice": 7300000,
    "createdAt": "2026-09-26T10:00:00"
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "passengers[0].passportNo", "message": "Passport number is required" }
  ]
}
```

**Response 401:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

#### GET /api/bookings/me

**Mô tả:** Lấy danh sách booking của user hiện tại.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
| Param | Type | Required | Mô tả |
|-------|------|----------|--------|
| status | String | No | Filter by status |

**Example:**
```
GET /api/bookings/me?status=PENDING
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bookingCode": "BK-ABC123",
      "status": "PENDING",
      "flight": { ... },
      "fareClass": { ... },
      "totalPrice": 7300000,
      "createdAt": "2026-09-26T10:00:00"
    }
  ]
}
```

---

#### GET /api/bookings/{id}

**Mô tả:** Lấy chi tiết booking.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "bookingCode": "BK-ABC123",
    "status": "CONFIRMED",
    "flight": { ... },
    "fareClass": { ... },
    "passengers": [ ... ],
    "services": [ ... ],
    "priceBreakdown": { ... },
    "totalPrice": 7300000,
    "payment": {
      "id": 1,
      "amount": 7300000,
      "status": "SUCCESS",
      "paidAt": "2026-09-26T10:05:00"
    },
    "createdAt": "2026-09-26T10:00:00",
    "updatedAt": "2026-09-26T10:05:00"
  }
}
```

---

#### PATCH /api/bookings/{id}/cancel

**Mô tả:** Hủy booking.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Validation:**
- Chỉ booking ở trạng thái PENDING mới được hủy

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "bookingCode": "BK-ABC123",
    "status": "CANCELLED"
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "Cannot cancel booking with status CONFIRMED"
}
```

---

### Payment API

#### POST /api/payments

**Mô tả:** Thực hiện thanh toán (mock).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "bookingId": 1,
  "paymentMethod": "CREDIT_CARD"
}
```

**Payment Methods:**
- `CREDIT_CARD`
- `BANK_TRANSFER`
- `MOCK`

**Response 200 (Success):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "bookingId": 1,
    "amount": 7300000,
    "paymentMethod": "CREDIT_CARD",
    "status": "SUCCESS",
    "transactionRef": "TXN-ABC123",
    "paidAt": "2026-09-26T10:05:00"
  }
}
```

**Response 200 (Failed):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "bookingId": 1,
    "amount": 7300000,
    "paymentMethod": "CREDIT_CARD",
    "status": "FAILED",
    "transactionRef": null
  }
}
```

---

### Notification API

#### GET /api/notifications

**Mô tả:** Lấy danh sách thông báo của user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
| Param | Type | Required | Mô tả |
|-------|------|----------|--------|
| isRead | Boolean | No | Filter by read status |
| limit | Integer | No | Default: 20 |
| offset | Integer | No | Default: 0 |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "BOOKING_CONFIRMED",
      "message": "Your booking BK-ABC123 has been confirmed.",
      "isRead": false,
      "bookingId": 1,
      "createdAt": "2026-09-26T10:05:00"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 20,
    "offset": 0
  }
}
```

---

#### PATCH /api/notifications/{id}/read

**Mô tả:** Đánh dấu thông báo đã đọc.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isRead": true
  }
}
```

---

### Admin APIs

#### GET /api/bookings (Admin)

**Mô tả:** Lấy tất cả bookings (admin).

**Headers:**
```
Authorization: Bearer {access_token}
Role: ADMIN
```

**Query Parameters:**
| Param | Type | Required | Mô tả |
|-------|------|----------|--------|
| status | String | No | Filter by status |
| userId | UUID | No | Filter by user |
| page | Integer | No | Default: 0 |
| size | Integer | No | Default: 20 |

**Response 200:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 0,
    "size": 20,
    "totalPages": 5
  }
}
```

---

#### PATCH /api/bookings/{id}/status (Admin)

**Mô tả:** Cập nhật trạng thái booking (admin).

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Allowed Transitions:**
- `PENDING` → `CONFIRMED`, `CANCELLED`, `PAYMENT_FAILED`
- `CONFIRMED` → không thể chuyển về `PENDING`
- `CANCELLED` → terminal state
- `PAYMENT_FAILED` → có thể retry payment

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "bookingCode": "BK-ABC123",
    "status": "CONFIRMED"
  }
}
```

---

### HTTP Status Codes

| Code | Mô tả |
|------|--------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden (không đủ quyền) |
| 404 | Not Found |
| 409 | Conflict (VD: duplicate) |
| 500 | Internal Server Error |

---

# 10. Kiến trúc hệ thống

## 10.1. Kiến trúc tổng thể

Hệ thống sử dụng kiến trúc **Modular Monolith**:

```text
┌─────────────────────────────┐
│ React + TypeScript + Vite   │
│ Tailwind CSS                │
└──────┬───────────┬──────────┘
       │ REST API  │ Supabase Auth
       ▼           ▼
┌────────────┐  ┌──────────────────┐
│ Spring Boot│  │ Supabase Auth    │
│            │  │ (GoTrue)         │
│ Presentat. │  └──────────────────┘
│ Applicat.  │
│ Domain     │
│ Infrastr.  │
└──────┬─────┘
       │
       ▼
┌─────────────────────────────┐
│ Supabase PostgreSQL         │
└─────────────────────────────┘
```

## 10.2. Các tầng hệ thống

### Presentation Layer

Các Controller:

- FlightController.
- FareController.
- ServiceController.
- BookingController.
- PaymentController.
- NotificationController.

### Application Layer

Các service:

- FlightService.
- FareService.
- AdditionalService.
- BookingFacade.
- PaymentService.
- PricingService.

### Domain Layer

Các domain entity:

- Profile.
- Flight.
- FareClass.
- Booking.
- Passenger.
- Payment.
- AdditionalService.

### Infrastructure Layer

Các Repository:

- ProfileRepository.
- FlightRepository.
- FareRepository.
- BookingRepository.
- PassengerRepository.
- PaymentRepository.
- AdditionalServiceRepository.
- NotificationRepository.

Infrastructure sử dụng Supabase PostgreSQL cho lưu trữ dữ liệu và Supabase Auth cho xác thực. Backend verify JWT bằng `SupabaseJwtFilter`.

---

# 11. Design Patterns

## 11.1. Strategy Pattern

### Mục đích

Sử dụng Strategy để xử lý pricing theo Fare Class và payment method.

### Pricing

```text
PricingStrategy
      │
      ├── EconomyPricingStrategy
      ├── PremiumPricingStrategy
      └── BusinessPricingStrategy
```

### Payment

Payment có thể được tổ chức theo Strategy để xử lý payment method và kết
nối với Mock Payment Gateway.

---

## 11.2. Decorator Pattern

### Mục đích

Cho phép kết hợp nhiều Additional Services vào Booking/giá vé.

```text
BookingPrice
      │
      ├── BaggageDecorator
      ├── MealDecorator
      ├── SeatDecorator
      └── PriorityBoardingDecorator
```

Decorator giúp kết hợp nhiều dịch vụ mà không phải tạo class cho từng tổ
hợp dịch vụ.

---

## 11.3. Factory Pattern

### Mục đích

Sử dụng Factory để tạo các đối tượng nghiệp vụ liên quan đến
ticket/business object.

```text
TicketFactory
      ↓
createTicket(type)
```

Factory giúp tập trung logic khởi tạo object.

---

## 11.4. State Pattern

### Mục đích

Quản lý lifecycle của Booking.

```text
BookingState
      │
      ├── PendingState
      ├── ConfirmedState
      ├── CancelledState
      └── PaymentFailedState
```

Booking sử dụng state hiện tại để quyết định các transition hợp lệ.

---

## 11.5. Observer Pattern

### Mục đích

Tạo notification khi Booking có thay đổi.

```text
BookingSubject
      │
      ▼
BookingObserver
      │
      ▼
NotificationService
      │
      ▼
InAppNotification
```

Observer giúp tách logic notification khỏi logic chính của Booking.

---

## 11.6. Facade Pattern

### Mục đích

Đơn giản hóa toàn bộ quy trình tạo Booking.

```text
BookingFacade
      │
      ├── Flight availability
      ├── Fare validation
      ├── Passenger validation
      ├── Service selection
      ├── Pricing
      └── Booking persistence
```

Customer-facing booking flow được điều phối thông qua `BookingFacade`.

---

# 12. Thiết kế Class

## 12.1. Presentation

```text
AuthController
FlightController
FareController
ServiceController
BookingController
PaymentController
NotificationController
```

## 12.2. Application

```text
AuthService
FlightService
FareService
AdditionalService
BookingFacade
PaymentService
PricingService
```

## 12.3. Domain

```text
User
Flight
FareClass
Booking
Passenger
Payment
AdditionalService
```

## 12.4. Pattern Classes

### Strategy

```text
PricingStrategy
 ├── EconomyPricingStrategy
 ├── PremiumPricingStrategy
 └── BusinessPricingStrategy
```

### Decorator

```text
BookingPrice
 ├── BaggageDecorator
 ├── MealDecorator
 ├── SeatDecorator
 └── PriorityBoardingDecorator
```

### Factory

```text
TicketFactory
```

### State

```text
BookingState
 ├── PendingState
 ├── ConfirmedState
 ├── CancelledState
 └── PaymentFailedState
```

### Observer

```text
BookingSubject
BookingObserver
NotificationService
InAppNotification
```

### Facade

```text
BookingFacade
```

---

# 13. Ma trận truy vết yêu cầu

---

Yêu cầu Entity API Thành phần xử lý Pattern

---

Register Customer — Supabase Auth
Frontend: supabase.auth.signUp()

Login Customer — Supabase Auth
Frontend: supabase.auth.signInWithPassword()

Search Flight Flight GET `/flights` FlightService \-

View Flight Flight GET FlightService \-
`/flights/{id}`

Manage Flight Flight Flight CRUD FlightService Factory

Select Fare FareClass GET `/fares` PricingService Strategy

Manage Fare FareClass Fare CRUD FareService Factory

Passenger Passenger `/bookings` Passenger handling \-

Additional AdditionalService, `/services` Service handling Decorator
Service BookingService

Calculate Pricing \- PricingService Strategy +
Price Decorator

Create Booking Booking POST `/bookings` BookingFacade Facade

View Booking Booking GET BookingService \-
`/bookings/{id}`

Booking Booking GET `/bookings/me` BookingService \-
History

Cancel Booking Booking PATCH `/cancel` Booking State State

Manage Booking Booking `/bookings` BookingService \-

Payment Payment POST `/payments` PaymentService Strategy

Booking Status Booking PATCH `/status` Booking State State

Notification Notification `/notifications` NotificationService Observer

---

---

# 14. Phạm vi triển khai và kiểm thử

## 14.1. Phạm vi triển khai

Project tập trung vào:

- OOP.
- SOLID.
- Design Patterns.
- Business Logic.
- REST API.
- Database Design.
- Frontend Integration.
- Unit Testing.

## 14.2. Kiểm thử

Công cụ:

- JUnit 5.
- Mockito.
- Postman.

Unit Testing tập trung vào business logic và các thành phần có Design
Pattern.

## 14.3. Công cụ phát triển

- Maven.
- Git/GitHub.
- Docker.

## 14.4. Phạm vi ngoài hệ thống

Không triển khai:

- Real bank payment.
- Real airline API.
- Industry-standard e-ticketing.
- Complex ancillary services ngoài phạm vi đã xác định.

---

# Kết thúc tài liệu

Tài liệu SSR này mô tả phạm vi, yêu cầu chức năng, Use Case, Business
Rules, dữ liệu, API, kiến trúc, Design Patterns, Class Design và
Requirement Traceability của Airline Booking System trong phạm vi dự án
3 tuần.
