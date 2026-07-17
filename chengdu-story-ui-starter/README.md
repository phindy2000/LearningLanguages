# CHENGDU STORY

Webgame học giao tiếp tiếng Trung dạng nhắn tin, lấy bối cảnh tại Thành Đô.

## Có sẵn

- UI desktop ba vùng và mobile một cột.
- Tạo tài khoản cục bộ bằng email, tên tài khoản và mật khẩu; mỗi email chỉ đăng ký một lần trên thiết bị.
- Đăng nhập để tải đúng tiến trình riêng của email.
- Màn hình loading kiểm tra thư viện đã lưu và tải phần cập nhật trước khi vào game.
- Màn hình xem từ/mẫu câu trước chương.
- Hội thoại chữ Hán giản thể + Pinyin.
- Bật/tắt Pinyin.
- Chế độ học thường và luyện nghe.
- Phát âm bằng Web Speech API của Chrome.
- Lựa chọn được lưu, không cho quay lại.
- Phản ứng ngắn theo lựa chọn.
- Từ điển Trung–Việt, tìm kiếm và lưu từ.
- Lưu tiến độ bằng `localStorage`.
- Cấp Player ID và quản lý tài khoản cục bộ qua `account.js`.
- Tự động ghi log riêng theo Player ID; có thể xuất thành `Log_<PlayerID>.js` trong Cài đặt.
- PWA cache cơ bản khi chạy qua HTTP/HTTPS.
- Toàn bộ nội dung Chương 1 — Những ngày ở nhờ, gồm 12 lựa chọn và cảnh kết thúc.
- Theo dõi chỉ số và lịch sử tương tác với NPC.

## Chạy nhanh trên Windows

### Cách 1 — PowerShell

Nhấp phải trong thư mục, mở PowerShell rồi chạy:

```powershell
./run-local.ps1
```

Mở Chrome tại `http://localhost:8080`.

### Cách 2 — CMD

Chạy:

```bat
run-local.bat
```

### Cách 3 — GitHub Pages

1. Tạo repository mới.
2. Upload toàn bộ file trong thư mục này vào nhánh `main`.
3. Mở `Settings` → `Pages`.
4. Chọn `Deploy from a branch`.
5. Chọn `main` và `/root`.

## Sửa nội dung

Chỉnh `data.js`. Xem quy ước chi tiết tại `docs/CONTENT_GUIDE.md`.

## Lưu tài khoản và tiến trình

GitHub Pages không thể tự ghi ngược vào file trong repository. `account.js` định nghĩa cấu trúc và lớp lưu tài khoản; dữ liệu thực tế được lưu trong `localStorage` của trình duyệt. Nút **Xuất file tiến trình** tạo bản sao `Log_<PlayerID>.js` để sao lưu hoặc kết nối backend sau này.

Đây là hệ tài khoản dành cho bản game một người chơi. Mật khẩu được băm trước khi lưu nhưng toàn bộ dữ liệu vẫn nằm trên thiết bị, chưa phải cơ chế bảo mật hoặc đồng bộ tài khoản online.

## Giới hạn hiện tại

- Audio dùng giọng có sẵn của Chrome/hệ điều hành, chưa phải audio thu sẵn.
- Nền cảnh và avatar là placeholder UI.
- Tài khoản và tiến trình không tự chuyển sang trình duyệt hoặc thiết bị khác.
