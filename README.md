# Lingua Quest — English × 中文

WebApp học song ngữ Anh–Trung theo mini game story. Bản này đã được tách thành dự án nhiều file, không còn nhúng toàn bộ CSS, dữ liệu và JavaScript trong một HTML.

## Chạy ứng dụng

### Cách 1 — Windows

1. Cài Node.js 18 trở lên.
2. Mở thư mục dự án.
3. Chạy `start.bat`.
4. Mở `http://127.0.0.1:8080`.

### Cách 2 — Terminal

```bash
npm start
```

Không nên mở trực tiếp `index.html` bằng `file://`, vì trình duyệt có thể chặn ES Module. Dự án không cần cài package ngoài và không cần chạy `npm install`.

## Kiểm tra cấu trúc và dữ liệu

```bash
npm run check
```

Lệnh kiểm tra:

- Các file bắt buộc.
- Bốn màn hình chính.
- ID câu được tham chiếu trong Story.
- Các lựa chọn đáp án có tồn tại trong kho câu.

## Cấu trúc chính

```text
lingua-quest-modular/
├── index.html                     # Khung giao diện và các vùng hiển thị
├── server.mjs                     # Web server cục bộ, không cần thư viện ngoài
├── start.bat                      # Chạy nhanh trên Windows
├── package.json
├── assets/
│   └── css/
│       ├── tokens.css             # Biến màu, font và baseline
│       ├── layout.css             # App shell, sidebar, topbar
│       ├── components.css         # Thành phần Story, dịch, tra cứu, inventory
│       └── responsive.css         # Mobile và tablet
├── src/
│   ├── app.js                     # Điểm khởi động và điều phối hệ thống
│   ├── config/
│   │   └── app-config.js          # Nhãn, storage key, rank, mode
│   ├── core/
│   │   ├── dom.js                 # Truy vấn DOM
│   │   ├── storage.js             # LocalStorage an toàn
│   │   └── utils.js               # Chuẩn hóa, escape, shuffle, tạo ID
│   ├── data/
│   │   ├── phrases.js             # Kho câu Anh–Trung
│   │   ├── vocabulary.js          # Kho từ vựng
│   │   └── chapters.js            # Chương và scene của game
│   ├── services/
│   │   ├── inventory-service.js   # Thêm, xóa, lọc, cập nhật trạng thái
│   │   ├── progress-service.js    # XP, tiến độ chương, rank
│   │   ├── speech-service.js      # Google/System SpeechSynthesis voices
│   │   └── translation-service.js # Dịch dựa trên kho nội dung tích hợp
│   └── controllers/
│       ├── story-controller.js
│       ├── lookup-controller.js
│       ├── translation-controller.js
│       └── inventory-controller.js
├── scripts/
│   └── check-project.mjs
└── docs/
    ├── ARCHITECTURE.md
    └── DATA-SCHEMA.md
```

## Nơi chỉnh nội dung

- Thêm câu mới: `src/data/phrases.js`.
- Thêm từ mới: `src/data/vocabulary.js`.
- Tạo chương hoặc scene mới: `src/data/chapters.js`.
- Sửa cấp rank: `src/config/app-config.js`.
- Sửa giao diện: các file trong `assets/css`.
- Sửa logic từng chức năng: controller tương ứng.

## Lưu trữ

Ứng dụng hiện lưu dữ liệu trên trình duyệt bằng LocalStorage:

- `lqx2_inventory`
- `lqx2_progress`
- `lqx2_xp`
- `lqx2_voice_en`
- `lqx2_voice_zh`

Khi chuyển sang hệ thống nhiều người dùng, chỉ cần thay `StorageService` và `InventoryService` bằng API/backend; controller và giao diện không cần viết lại toàn bộ.

## Giới hạn dịch thuật

Chức năng dịch không sử dụng AI và không gọi API trả phí. Hệ thống:

1. Tìm bản khớp chính xác trong kho câu/từ.
2. Thử ghép từ khi không có bản khớp.
3. Gắn nhãn rõ mức độ tin cậy.
4. Cho phép mở Google Dịch khi nội dung nằm ngoài kho.
