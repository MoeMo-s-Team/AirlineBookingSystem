# Thiết kế xác thực Supabase cho Airline Booking System

Ngày: 2026-10-13  
Trạng thái: Đã duyệt trong hội thoại, chờ người dùng review đặc tả

## Mục tiêu

Thay đăng nhập/đăng ký mô phỏng bằng Supabase Auth thật, theo hai giai đoạn có thể triển khai và kiểm tra riêng:

1. Backend xác minh danh tính Supabase, áp dụng role tin cậy từ database và trả thông tin hồ sơ hiện tại.
2. Frontend dùng Supabase Auth cho đăng ký, đăng nhập, đăng xuất và gửi access token khi gọi backend.

Đăng ký công khai luôn tạo role `CUSTOMER`. `ADMIN` chỉ được cấp riêng qua quy trình quản trị, không qua form đăng ký hay metadata người dùng.

## Hiện trạng liên quan

- `AuthContext` đang cấp session giả từ `MOCK_ACCOUNTS`; password không được xác minh.
- `apiClient` tìm token trong nhiều khóa storage và có fallback cho session giả.
- Backend có `SupabaseJwtFilter` dùng secret HS256, lấy role từ JWT và đang chấp nhận `user_metadata.role`.
- Entity `Profile` và `Role` tồn tại; SQL init có `profiles`, trigger tạo profile sau khi user được tạo và seed `CUSTOMER`/`ADMIN`.
- Chưa có `ProfileRepository`, service hồ sơ hoặc endpoint hồ sơ hiện tại.
- Frontend chưa cài `@supabase/supabase-js`.
- `GET /api/fares/dev-token` phát hành token giả để thử Swagger.

## Thiết kế kiến trúc

Frontend giao tiếp trực tiếp với Supabase Auth cho thao tác có password. Backend không nhận, lưu hoặc chuyển tiếp password. Supabase phát hành access token; frontend gửi token đó trong header `Authorization: Bearer …` khi gọi endpoint được bảo vệ.

Backend xác minh chữ ký JWT bằng Supabase JWKS, đồng thời kiểm tra issuer, audience và thời hạn token. `sub` là UUID của người dùng. Backend dùng UUID này để tra `Profile`; role lấy từ quan hệ `Profile.role` trong database. Backend không lấy quyền từ `user_metadata`, `app_metadata` hoặc claim role của token.

Sử dụng Spring Security OAuth2 Resource Server/Nimbus để xác minh JWT và tải JWKS, thay cho việc tự viết tải khóa/cache JWKS. Cấu hình issuer/JWKS phải trỏ đúng project Supabase. Project cần phát hành user access token bằng signing key được công bố qua JWKS; không âm thầm fallback sang secret khi JWKS không xác minh được token.

Mỗi request được bảo vệ tra role của `sub` từ database để thay đổi role có hiệu lực ở request kế tiếp, không phải chờ user refresh token. Principal trong Spring Security chứa UUID và authority `ROLE_CUSTOMER` hoặc `ROLE_ADMIN` lấy từ profile.

## Hợp đồng API

### `GET /api/profile/me`

- Yêu cầu JWT Supabase hợp lệ.
- Tìm profile bằng `sub` trong token.
- Trả `ApiResponse` hiện có với `id`, `email`, `fullName`, `role`.
- Không chấp nhận user ID từ query, path hoặc body; người dùng chỉ đọc hồ sơ của chính mình.
- Nếu JWT hợp lệ nhưng profile không tồn tại, trả lỗi xác thực/authorization rõ ràng, không tự tạo profile và không gán role mặc định.

Các endpoint chuyến bay, hạng vé và dịch vụ public hiện tại tiếp tục public. Quy tắc admin hiện tại tiếp tục dùng `hasRole('ADMIN')`, nhưng authority được lấy từ profile tin cậy.

Không tạo endpoint backend cho signup, signin hay signout. Các thao tác đó thuộc Supabase Auth SDK.

## Dữ liệu và phân quyền

Trigger `handle_new_user` tiếp tục tạo profile dùng `NEW.id`, email, `raw_user_meta_data.full_name` và role `CUSTOMER`. Cần bảo đảm role `CUSTOMER` đã được seed; lỗi trigger phải làm signup thất bại rõ ràng thay vì tạo tài khoản không có profile.

Role `ADMIN` được cấp bằng thao tác quản trị riêng trên dữ liệu profile/role. Không thêm trường role có thể sửa vào DTO đăng ký hoặc API tự phục vụ. Profile thiếu hoặc role không hợp lệ không được nâng thành admin; request bị từ chối.

## Giai đoạn 1: Backend

Phạm vi:

- Thay bộ lọc HS256 thủ công bằng xác minh JWT qua Spring Security Resource Server và JWKS, kiểm tra issuer/audience/thời hạn.
- Thêm repository/service đọc profile theo UUID; nạp authority từ role trong database.
- Thêm `GET /api/profile/me` và response DTO phù hợp.
- Giữ các route public; xác nhận các route CRUD admin vẫn yêu cầu `ROLE_ADMIN` từ database.
- Xóa `/api/fares/dev-token`, endpoint phát hành JWT giả không thuộc luồng xác thực thật.
- Cập nhật cấu hình backend để dùng issuer/JWKS URL của project Supabase; không đưa secret/service key vào frontend.

Điều kiện hoàn tất giai đoạn:

- JWT hợp lệ của user hiện có xác thực được; `/api/profile/me` trả đúng profile và role.
- Token thiếu, sai chữ ký, sai issuer/audience hoặc hết hạn bị từ chối.
- User không có profile bị từ chối; metadata role không làm thay đổi quyền.
- Customer không gọi được endpoint admin; admin có role trong database gọi được.
- Kiểm tra được độc lập bằng token Supabase thật qua Swagger/curl.

## Giai đoạn 2: Frontend

Phạm vi:

- Cài `@supabase/supabase-js`; khởi tạo client từ `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` (hoặc publishable key tương ứng).
- Thay mock `AuthContext` bằng `supabase.auth.signUp`, `signInWithPassword`, `signOut`, `getSession` và listener thay đổi auth state.
- Signup gửi `full_name` qua user metadata để trigger database tạo profile. Role không gửi từ client.
- Sau khi có session, gọi `GET /api/profile/me`; role dùng cho route guard, menu admin và hiển thị user lấy từ response backend.
- API client lấy `access_token` từ session Supabase hiện tại, chỉ gắn Bearer token khi có session; bỏ token giả và fallback storage tự quản lý.
- Giữ hành vi đăng xuất đồng bộ với Supabase và cập nhật UI qua listener session.
- Xóa tài khoản mock và mọi logic tự gán `admin` theo email hoặc nội dung người dùng.
- Hỗ trợ cả hai cấu hình xác nhận email: khi signup không trả session, hiển thị hướng dẫn xác nhận email; khi có session, tải profile và tiếp tục.

Điều kiện hoàn tất giai đoạn:

- Người dùng đăng ký mới có profile `CUSTOMER`; Supabase xác thực password.
- Đăng nhập sai password hiển thị lỗi và không tạo session frontend.
- Session được khôi phục sau reload; đăng xuất xóa session Supabase và cập nhật route/UI.
- API backend nhận Bearer access token hiện hành; lỗi hết hạn/không hợp lệ hiển thị phù hợp và không giữ role giả.
- Frontend không chứa Supabase service/secret key.

## Lỗi và ranh giới tin cậy

- JWT không hợp lệ: Spring Security trả `401`; request không được tiếp tục như user anonymous cho route cần xác thực.
- JWT hợp lệ nhưng không có profile/role hợp lệ: từ chối truy cập; không cấp role fallback.
- Lỗi signup từ Supabase hoặc trigger profile được hiển thị qua UI; không giả định signup thành công khi Supabase trả lỗi.
- Lỗi tải `/api/profile/me` không được thay bằng role suy đoán từ email hoặc metadata.
- Frontend chỉ dùng publishable/anon key. Supabase service role key và signing key chỉ nằm phía server hoặc dashboard.
- Do backend xác minh JWT stateless, signout xóa session phía client; access token bị đánh cắp có thể còn hợp lệ tới hạn hết hạn. TTL và quy trình thu hồi khóa nằm ngoài phạm vi hai giai đoạn này.

## Kiểm chứng

Giai đoạn backend cần unit/integration coverage cho token hợp lệ, chữ ký sai, issuer/audience sai, hết hạn, profile thiếu, role CUSTOMER và role ADMIN. Có ít nhất một kiểm tra HTTP cho `/api/profile/me` và route admin.

Giai đoạn frontend cần kiểm tra signup với cấu hình xác nhận email bật/tắt, signin đúng/sai, session restore, signout, lỗi `/api/profile/me`, customer/admin route guards và việc gắn Bearer token vào API request.

## Ngoài phạm vi

- OAuth providers, MFA, reset password, xác minh email tùy biến và quản lý session thiết bị.
- API quản trị để cấp role `ADMIN`.
- Đặt chỗ, lưu hành khách, thanh toán thật hoặc thay thế các mock booking hiện tại.
- Đồng bộ profile ngoài trigger Supabase hiện có.
