# CHENGDU STORY

Webgame học giao tiếp tiếng Trung dạng nhắn tin, lấy bối cảnh tại Thành Đô.

## Có sẵn

- UI desktop ba vùng và mobile một cột.
- Nhập tên tiếng Việt + tên tiếng Trung 2–4 chữ Hán.
- Màn hình xem từ/mẫu câu trước chương.
- Hội thoại chữ Hán giản thể + Pinyin.
- Bật/tắt Pinyin.
- Chế độ học thường và luyện nghe.
- Phát âm bằng Web Speech API của Chrome.
- Lựa chọn được lưu, không cho quay lại.
- Phản ứng ngắn theo lựa chọn.
- Từ điển Trung–Việt, tìm kiếm và lưu từ.
- Lưu tiến độ bằng `localStorage`.
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

## Giới hạn hiện tại

- Audio dùng giọng có sẵn của Chrome/hệ điều hành, chưa phải audio thu sẵn.
- Nền cảnh và avatar là placeholder UI.
