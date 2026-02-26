## Mini Dating App Prototype – Technical Test

Ứng dụng này là bản prototype mini của một Dating App (tương tự Breeze) được xây dựng cho bài test Web Developer Intern tại Clique83.com.

### 1. Cách tôi tổ chức hệ thống

- **Monorepo `dating-app`**
  - **`backend/`**: API server dùng **Node.js + Express + MongoDB (Mongoose)**.
    - `src/models/`: các model `User`, `Like`, `Match`.
    - `src/controllers/`: xử lý logic nghiệp vụ cho `auth`, `user`, `like`, `match`.
    - `src/routes/`: định nghĩa endpoint REST (`/auth`, `/users`, `/likes`, `/matches`).
    - `src/utils/`: tiện ích như `jwt` (tạo/verify token), `response` (format JSON), `slotMatcher` (tìm slot trùng).
    - `src/middlewares/`: `auth` (JWT guard), `validate`, `errorHandler`, rate limit, CORS, helmet.
  - **`frontend/`**: web app dùng **Next.js (App Router) + TypeScript + Zustand + axios**.
    - `src/app/`: page chính: `register`, `login`, `discover`, `matches`, `matches/[matchId]`, `profile`.
    - `src/components/layout/`: `AuthGuard` (bảo vệ route), `Navbar`.
    - `src/store/authStore.ts`: Zustand store lưu user + token, đồng bộ với `localStorage`.
    - `src/lib/api.ts` + `src/lib/services.ts`: cấu hình axios client và các service call API.
    - `src/types/`: định nghĩa type `User`, `Match`, `TimeSlot`… dùng chung cho toàn FE.

Nhìn chung: **BE** chịu trách nhiệm toàn bộ business logic & lưu trữ data, **FE** chỉ gọi API, giữ state đăng nhập và render UI.

### 2. Lưu trữ dữ liệu (data storage)

- **Backend / Database**
  - Sử dụng **MongoDB** với **Mongoose**:
    - `User`: email, password (hash), name, age, gender, bio, location, interests, avatar…
    - `Like`: `liker` – `liked` để lưu lượt like giữa 2 user (có unique index tránh trùng like).
    - `Match`: `users` \[userA, userB], trạng thái match và lịch rảnh/schedule của 2 bên.
  - Toàn bộ **profile, like, match, availability, lịch hẹn** được lưu trong database → không mất khi reload.

- **Frontend / Local storage**
  - **Chỉ lưu**:
    - `token`: JWT trả về sau `register`/`login`.
    - `user`: thông tin user hiện tại để hiển thị nhanh trên FE.
  - Mọi dữ liệu nghiệp vụ (danh sách profile, like, match, slot…) đều lấy từ backend qua API, **không phụ thuộc localStorage**.

### 3. Logic match hoạt động thế nào?

- **Tạo profile & đăng ký**
  - User đăng ký qua `/api/auth/register` với: **email, password, name, age, gender**, kèm **bio, location** (tùy chọn).
  - Backend tạo `User` mới, hash password, trả về `token` + `user` public.
  - FE lưu `token` + `user` vào `localStorage` thông qua `authStore`.

- **Hiển thị danh sách profile & nút Like**
  - FE gọi `GET /api/users`:
    - Backend trả về tất cả user **khác** user hiện tại, chỉ những user `isActive: true`.
    - Với mỗi user, backend thêm các flag:
      - `isLikedByMe`: tôi đã like người này chưa?
      - `likedMe`: người này đã like tôi chưa?
      - `isMatch`: cả hai đã like nhau chưa?
  - Page `discover` hiển thị list profile; mỗi card có nút **Like / Bỏ like**.

- **Khi User A bấm Like User B**
  - FE gọi `POST /api/likes/:userId`.
  - BE thực hiện trong `likeUser`:
    - Không cho like chính mình.
    - Kiểm tra tồn tại user được like.
    - Kiểm tra đã like trước đó chưa (tránh duplicate).
    - Tạo bản ghi `Like { liker: A, liked: B }`.
    - Sau đó kiểm tra xem **B đã từng like A** chưa:
      - Nếu **chưa**: chỉ trả về `"Đã like thành công!"`, `isMatch = false`.
      - Nếu **rồi**:
        - Tìm `Match` giữa A và B nếu đã có.
        - Nếu chưa có, tạo `Match { users: [A, B], status: "matched" }`.
        - Trả về `isMatch = true` + `matchId`.
  - FE nếu nhận `isMatch = true` sẽ:
    - Cập nhật state user đó thành `isMatch = true`.
    - Hiển thị modal **“It’s a Match!”** và nút dẫn tới `/matches/[matchId]` để chọn lịch.

- **Lưu ý**: Match được lưu trong collection `Match` với index **unique trên `users`** → một cặp chỉ có tối đa 1 match, đúng yêu cầu “Match nên được lưu lại”.

### 4. Logic tìm slot trùng hoạt động thế nào?

- **Format availability**
  - Một slot có dạng:
    - `{ date: "YYYY-MM-DD", startTime: "HH:MM", endTime: "HH:MM" }`.
  - FE cho phép user chọn **nhiều slot**, với ngày trong 3 tuần tới.
  - Khi gửi, FE gọi `POST /api/matches/:matchId/availability` với `{ slots: TimeSlot[] }`.

- **Validate và lưu availability**
  - Middleware `availabilityValidator` kiểm tra:
    - Đầy đủ `date`, `startTime`, `endTime`.
    - Format hợp lệ.
  - Trong `submitAvailability`:
    - Dùng hàm `isValidSlot`:
      - `startTime < endTime`.
      - `date` **nằm trong 3 tuần tới** (`isWithinNextThreeWeeks`).
    - Nếu có slot không hợp lệ → trả về lỗi 400.
    - Nếu hợp lệ:
      - Cập nhật hoặc thêm bản ghi availability của **chính user** trong `match.availability`.
      - Kiểm tra xem **người kia** đã gửi availability chưa.

- **Tìm first common slot (first common availability)**
  - Sử dụng hàm `findFirstCommonSlot(slotsA, slotsB)` trong `slotMatcher.js`:
    - Group toàn bộ `slotsB` theo `date` để tra cứu nhanh.
    - Sort `slotsA` theo:
      - `date` tăng dần.
      - `startTime` tăng dần.
    - Với mỗi slot A:
      - Lấy tất cả slot B cùng `date`.
      - Đổi `startTime`, `endTime` sang phút từ 0h (hàm `timeToMinutes`).
      - Tính **khoảng giao nhau**:
        - `overlapStart = max(startA, startB)`.
        - `overlapEnd = min(endA, endB)`.
        - Nếu `overlapStart < overlapEnd` → tìm được **slot trùng**.
      - Chuyển `overlapStart`, `overlapEnd` về dạng `"HH:MM"` và trả về:
        - `{ date, startTime: overlapStart, endTime: overlapEnd }`.
    - Nếu duyệt xong không có giao → trả về `null`.

- **Cập nhật trạng thái match sau khi cả hai gửi lịch**
  - Khi cả A và B đều có availability:
    - Gọi `findFirstCommonSlot(mySlots, theirSlots)`.
    - Nếu **có** slot chung:
      - Lưu vào `match.scheduledDate`.
      - Đặt `status = "scheduled"`.
      - FE hiển thị:
        - `✅ Hai bạn có date hẹn vào: [ngày] [giờ]`.
    - Nếu **không có** slot chung:
      - Đặt `status = "no_slot"`.
      - Xoá `scheduledDate` (set `null`).
      - FE hiển thị:
        - `"Chưa tìm được thời gian trùng. Vui lòng chọn lại."`
  - Nếu mới chỉ một bên gửi lịch:
    - `status = "availability_pending"`.
    - FE hiển thị trạng thái “chờ người kia gửi lịch”.

### 5. Đánh giá so với yêu cầu bài test

- **Phần A – Tạo profile**
  - Đáp ứng: user có thể đăng ký với **Tên, Tuổi, Giới tính, Bio, Email**, và chỉnh sửa profile ở màn `profile`.
  - Dữ liệu được lưu trong database (MongoDB), hiển thị lại sau khi reload / login lại.
- **Phần B – Hiển thị & Like + Logic Match**
  - Đáp ứng: màn `discover` hiển thị danh sách profile (trừ chính mình), có nút Like/Bỏ like.
  - Khi A like B và B đã like A → backend tạo `Match` và trả về `isMatch = true`, FE hiện modal **“It’s a Match”** và lưu match vào DB.
- **Phần C – Đề xuất lịch hẹn**
  - Đáp ứng: mỗi bên chọn được nhiều slot trong 3 tuần tới ở `/matches/[matchId]`.
  - Sau khi cả hai gửi lịch, backend tìm slot trùng đầu tiên bằng thuật toán overlap ở trên, lưu lại, và FE hiển thị đúng 2 trường hợp:
    - Có slot chung → thông báo lịch hẹn cụ thể.
    - Không có slot chung → thông báo “Chưa tìm được thời gian trùng. Vui lòng chọn lại”.

Nhìn chung **logic chính đã đúng yêu cầu**; không có bug logic nghiêm trọng cần fix gấp. Một số điểm có thể cải tiến được liệt kê ở phần tiếp theo.

### 6. Nếu có thêm thời gian tôi sẽ cải thiện gì?

- **Cải thiện UX Khám phá & Match**
  - Thêm filter tìm kiếm theo giới tính, độ tuổi, địa điểm để user dễ tìm profile phù hợp hơn.
  - Thêm UI dạng “card swipe” (trái/phải) để trải nghiệm giống các dating app phổ biến.
- **Cải thiện bảo mật & auth**
  - Chuyển JWT từ `localStorage` sang **HttpOnly cookie** để giảm nguy cơ XSS.
  - Thêm tính năng **quên mật khẩu / reset password**, xác thực email.
- **Cải thiện trải nghiệm chọn lịch hẹn**
  - Highlight trực quan những ngày/giờ có khả năng trùng nhau cao.
  - Thêm chế độ xem lịch theo tuần để user dễ hình dung.

### 7. 1–3 tính năng đề xuất thêm & lý do

- **(1) Hệ thống gợi ý match dựa trên sở thích & độ tuổi**
  - Backend có sẵn trường `interests`, `age`, `gender`, `location` → có thể xây thuật toán score đơn giản (ví dụ: số sở thích chung, khoảng cách độ tuổi, cùng khu vực).
  - Lý do: giúp match trở nên “chất lượng” hơn, tăng khả năng hai người hợp nhau.

- **(2) Chat đơn giản cho các cặp đã match**
  - Mỗi `Match` có thể gắn với một room chat (realtime bằng WebSocket/Socket.io hoặc polling đơn giản).
  - Lý do: sau khi có lịch hẹn, user thường muốn trò chuyện thêm trước khi gặp mặt, tăng tính thực tế của sản phẩm.

- **(3) Nhắc lịch hẹn & lịch sử date**
  - Lưu thêm trường “đã diễn ra” cho `scheduledDate`, và gửi email / in-app notification trước giờ hẹn.
  - Cho phép xem lại lịch sử các date đã diễn ra.
  - Lý do: tăng trải nghiệm người dùng và tạo dữ liệu cho các tính năng phân tích sau này.

---

Nếu anh/chị cần thêm thông tin (ví dụ: cách chạy project, config MongoDB hoặc demo API), em có thể bổ sung thêm vào README theo format mong muốn.
