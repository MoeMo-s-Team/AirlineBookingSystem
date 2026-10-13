# Thiết kế xác thực Supabase cho Airline Booking System

Ngày: 2026-10-13  
Trạng thái: Approved for implementation

## Mục tiêu

Thay đăng nhập/đăng ký mô phỏng bằng Supabase Auth thật, theo hai giai đoạn có thể triển khai và kiểm tra riêng:

1. Backend xác minh danh tính Supabase, áp dụng role tin cậy từ database và trả thông tin hồ sơ hiện tại.
2. Frontend dùng Supabase Auth cho đăng ký, đăng nhập, đăng xuất và gửi access token khi gọi backend.

Đăng ký công khai luôn tạo role `CUSTOMER`. `ADMIN` chỉ được cấp riêng qua quy trình quản trị, không qua form đăng ký hay metadata người dùng.

## Hiện trạng liên quan

- `frontend/src/context/AuthContext.tsx` import và tra `MOCK_ACCOUNTS`; password bị bỏ qua, và role còn có thể được tự gán theo email chứa `admin`.
- `apiClient` tìm token trong nhiều khóa storage và có fallback cho session giả.
- `backend/src/main/java/com/airline/infrastructure/security/SupabaseJwtFilter.java` dùng JJWT `Keys.hmacShaKeyFor` với secret cấu hình, tức xác minh HS256; filter lấy role từ claims và đang chấp nhận `user_metadata.role`.
- Entity `Profile` và `Role` tồn tại; SQL init có `profiles`, trigger tạo profile sau khi user được tạo và seed `CUSTOMER`/`ADMIN`.
- Chưa có `ProfileRepository`, service hồ sơ hoặc endpoint hồ sơ hiện tại.
- `@supabase/supabase-js` chưa có trong dependencies của `frontend/package.json` hoặc `frontend/pnpm-lock.yaml`.
- `backend/src/main/java/com/airline/presentation/controller/FareController.java` có `GET /api/fares/dev-token`: endpoint không yêu cầu role, mặc định tạo token role `ADMIN`, ký bằng secret cấu hình và hết hạn sau bảy ngày. `SecurityConfig` permit GET `/api/fares/**`, nên endpoint này public.

## Thiết kế kiến trúc

Frontend giao tiếp trực tiếp với Supabase Auth cho thao tác có password. Backend không nhận, lưu hoặc chuyển tiếp password. Supabase phát hành access token; frontend gửi token đó trong header `Authorization: Bearer …` khi gọi endpoint được bảo vệ.

Security flow theo thứ tự trên các protected routes: (1) xác minh chữ ký JWT bằng Supabase JWKS và kiểm tra issuer, audience, thời hạn; (2) lấy UUID từ `sub`; (3) query `Profile` và quan hệ `Role` theo UUID; (4) tạo authority `ROLE_CUSTOMER` hoặc `ROLE_ADMIN` từ role trong database. `ProfileAuthorizationFilter` chỉ chạy trên protected routes; public GET và Swagger/API docs được bỏ qua, kể cả request public có bearer token hợp lệ. Không query profile trước khi token được xác minh. Backend không lấy quyền từ `user_metadata`, `app_metadata` hoặc claim role của token.

Sử dụng Spring Security OAuth2 Resource Server/Nimbus để xác minh JWT và tải JWKS, thay cho việc tự viết tải khóa/cache JWKS. Cấu hình issuer/JWKS phải trỏ đúng project Supabase. `SUPABASE_JWT_AUDIENCE` là cấu hình bắt buộc theo môi trường, không hard-code audience trong code. Project cần phát hành user access token bằng signing key được công bố qua JWKS; không âm thầm fallback sang secret khi JWKS không xác minh được token.

Mỗi request được bảo vệ tra role của `sub` từ database để thay đổi role có hiệu lực ở request kế tiếp, không phải chờ user refresh token. Principal trong Spring Security chứa UUID và authority `ROLE_CUSTOMER` hoặc `ROLE_ADMIN` lấy từ profile.

## Hợp đồng API

### `GET /api/profile/me`

- Yêu cầu JWT Supabase hợp lệ.
- Tìm profile bằng `sub` trong token.
- Trả `ApiResponse` hiện có với `id`, `email`, `fullName`, `role`.
- Không chấp nhận user ID từ query, path hoặc body; người dùng chỉ đọc hồ sơ của chính mình.
- JWT sai chữ ký, sai issuer/audience hoặc hết hạn trả `401 Unauthorized`.
- JWT thiếu trên protected route cũng trả `401 Unauthorized`; mọi `401` dùng JSON `ApiResponse` có `success: false`, `code: "UNAUTHORIZED"` và thông điệp lỗi.
- JWT hợp lệ nhưng không có profile trả `403 Forbidden` với mã lỗi `PROFILE_NOT_FOUND`; role thiếu/không hợp lệ trả `403 Forbidden` với mã `PROFILE_ROLE_INVALID`.
- Lỗi database trong security filter trả `5xx` với mã `PROFILE_LOOKUP_FAILED`; không biến thành `403`, không tạo authority và không fallback sang `CUSTOMER`.
- Error response thêm trường `code` vào cấu trúc `ApiResponse` hiện tại; success responses giữ nguyên. Mã xác thực dùng các giá trị ổn định trên, không suy luận từ chuỗi `message`.

### Phân loại route

| Phân loại | Method và endpoint | Ghi chú |
|---|---|---|
| Public | `GET /api/flights`, `GET /api/flights/{id}` | Tìm kiếm, xem chuyến bay |
| Admin | `POST /api/flights`, `PUT /api/flights/{id}`, `DELETE /api/flights/{id}` | CRUD chuyến bay |
| Public | `GET /api/fares`, `GET /api/fares/{id}` | Hạng vé đang mở bán và chi tiết |
| Admin | `GET /api/fares/all`, `POST /api/fares`, `PUT /api/fares/{id}`, `DELETE /api/fares/{id}` | Toàn bộ danh sách và CRUD hạng vé |
| Public | `GET /api/services`, `GET /api/services/{id}` | Dịch vụ đang hoạt động và chi tiết |
| Admin | `GET /api/services/all`, `POST /api/services`, `PUT /api/services/{id}`, `DELETE /api/services/{id}` | Toàn bộ danh sách và CRUD dịch vụ |
| Đã tồn tại, cần xóa | `GET /api/fares/dev-token` | Hiện public; phát hành token giả role tùy query |
| Authenticated | `GET /api/profile/me` | Endpoint mới, chỉ đọc profile của subject trong token |

Swagger/API docs hiện public. Mọi request khác cần xác thực; CRUD quản trị và danh sách `/all` yêu cầu role `ADMIN`. Các resource CRUD hiện thực thi role bằng `@PreAuthorize("hasRole('ADMIN')")`.

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
- Cập nhật cấu hình backend để dùng issuer/JWKS URL và `SUPABASE_JWT_AUDIENCE` của project Supabase; không đưa secret/service key vào frontend.

Điều kiện hoàn tất giai đoạn:

- JWT hợp lệ của user hiện có xác thực được; `/api/profile/me` trả đúng profile và role.
- Token thiếu trên route cần auth, sai chữ ký, sai issuer/audience hoặc hết hạn bị từ chối với JSON `401` theo `ApiResponse`; test audience đúng và sai.
- JWT hợp lệ nhưng thiếu profile trả `403 PROFILE_NOT_FOUND`; role thiếu/không hợp lệ trả `403 PROFILE_ROLE_INVALID`; metadata/claim role không làm thay đổi quyền.
- Lỗi database khi filter tra profile trả `5xx PROFILE_LOOKUP_FAILED`; public GET không gọi profile lookup.
- Customer không gọi được endpoint admin; admin có role trong database gọi được.
- Kiểm tra được độc lập bằng token Supabase thật qua Swagger/curl.

## Giai đoạn 2: Frontend

Phạm vi:

- Cài `@supabase/supabase-js`; khởi tạo client từ `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` (hoặc publishable key tương ứng).
- Thay mock `AuthContext` bằng `supabase.auth.signUp`, `signInWithPassword`, `signOut`, `getSession` và listener thay đổi auth state.
- Callback `onAuthStateChange` chỉ cập nhật session state, không `await` hoặc gọi API. Một `useEffect` theo session sẽ gọi `/api/profile/me`.
- Bảo vệ profile state khỏi response cũ khi session/user đổi, access token refresh hoặc signout bằng request generation ID hoặc `AbortController`.
- `AuthContext` cung cấp `profileError` và `refreshProfile()` để UI phân biệt chưa đăng nhập với backend không tải được profile.
- Signup gửi `full_name` qua user metadata để trigger database tạo profile. Role không gửi từ client.
- Sau khi có session, gọi `GET /api/profile/me`; role dùng cho route guard, menu admin và hiển thị user lấy từ response backend.
- API client lấy `access_token` từ session Supabase hiện tại, chỉ gắn Bearer token khi có session; bỏ token giả và fallback storage tự quản lý.
- Giữ hành vi đăng xuất đồng bộ với Supabase và cập nhật UI qua listener session.
- Xóa tài khoản mock và mọi logic tự gán `admin` theo email hoặc nội dung người dùng.
- Hỗ trợ cả hai cấu hình xác nhận email: khi signup không trả session, hiển thị hướng dẫn xác nhận email; khi có session, tải profile và tiếp tục.
- Signup đặt `emailRedirectTo` trỏ về route callback trong app; callback chờ auth bootstrap, sau đó xử lý session/profile và chuyển tiếp hoặc hiển thị lỗi. URL callback phải nằm trong allowlist của Supabase.
- Route guards phải chờ auth bootstrap và lần profile resolution ban đầu hoàn tất; không redirect khi `isLoading` còn true.

Điều kiện hoàn tất giai đoạn:

- Người dùng đăng ký mới có profile `CUSTOMER`; Supabase xác thực password.
- Đăng nhập sai password hiển thị lỗi và không tạo session frontend.
- Session được khôi phục sau reload; đăng xuất xóa session Supabase và cập nhật route/UI.
- API backend nhận Bearer access token hiện hành; lỗi hết hạn/không hợp lệ hiển thị phù hợp và không giữ role giả.
- Frontend không chứa Supabase service/secret key.

## Lỗi và ranh giới tin cậy

- JWT thiếu trên protected route, sai chữ ký, sai issuer/audience hoặc hết hạn: trả JSON `401` theo `ApiResponse` với `code=UNAUTHORIZED`.
- JWT hợp lệ nhưng profile không tồn tại: trả `403` với `PROFILE_NOT_FOUND`; role không hợp lệ: trả `403` với `PROFILE_ROLE_INVALID`; không cấp role fallback.
- Lỗi database khi filter tra profile: trả `5xx` với `PROFILE_LOOKUP_FAILED`; không trả `403` hoặc gán `ROLE_CUSTOMER`.
- Lỗi signup từ Supabase hoặc trigger profile được hiển thị qua UI; không giả định signup thành công khi Supabase trả lỗi.
- Lỗi tải `/api/profile/me` không được thay bằng role suy đoán từ email hoặc metadata.
- Frontend chỉ dùng publishable/anon key. Supabase service role key và signing key chỉ nằm phía server hoặc dashboard.
- Do backend xác minh JWT stateless, signout xóa session phía client; access token bị đánh cắp có thể còn hợp lệ tới hạn hết hạn. TTL và quy trình thu hồi khóa nằm ngoài phạm vi hai giai đoạn này.

## Kiểm chứng

Giai đoạn backend cần unit/integration coverage cho token hợp lệ, chữ ký sai, issuer sai, audience đúng, audience sai, hết hạn, profile thiếu, role CUSTOMER và role ADMIN. Có ít nhất một kiểm tra HTTP cho `/api/profile/me` và route admin. Các lỗi xác thực cần kiểm tra cả HTTP status và mã lỗi.

Giai đoạn frontend cần kiểm tra signup với cấu hình xác nhận email bật/tắt, signin đúng/sai, session restore, signout, lỗi `/api/profile/me`, customer/admin route guards và việc gắn Bearer token vào API request.

## Ngoài phạm vi

- OAuth providers, MFA, reset password, xác minh email tùy biến và quản lý session thiết bị.
- API quản trị để cấp role `ADMIN`.
- Đặt chỗ, lưu hành khách, thanh toán thật hoặc thay thế các mock booking hiện tại.
- Đồng bộ profile ngoài trigger Supabase hiện có.
