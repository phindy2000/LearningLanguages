# Lingua Quest — English × 中文

WebApp học song ngữ Anh–Trung theo mini game story. Dự án được tách thành frontend modules, dữ liệu, services, controllers và Node backend.

## Chạy ứng dụng

### Windows

1. Cài Node.js 18 trở lên.
2. Chạy `start.bat`.
3. Mở `http://127.0.0.1:8080`.

### Terminal

```bash
npm start
```

Không cần `npm install` và không nên mở trực tiếp `index.html` bằng `file://`.

## Dịch thuật đã sửa

Bản cũ chỉ tra kho dữ liệu nên từ như `Dog` bị hiển thị `[Dog]`. Bản hiện tại dùng luồng:

1. Khớp từ/câu trong kho cục bộ.
2. Nếu ngoài kho, gọi backend `/api/translate`.
3. Backend mặc định dùng MyMemory.
4. Khi có `GOOGLE_TRANSLATE_API_KEY`, chế độ `auto` ưu tiên Google Cloud Translation.
5. Nếu mất mạng, chỉ hiển thị fallback cục bộ và gắn nhãn rõ ràng.

`dog → 狗 (gǒu)` đã có sẵn trong kho cục bộ nên vẫn dùng được khi offline.

Xem cấu hình chi tiết tại `docs/TRANSLATION.md`.

## Chọn nhà cung cấp

### Mặc định — không cần API key

```bash
npm start
```

Server dùng MyMemory cho nội dung ngoài kho.

### Google Cloud Translation

Windows có thể chạy:

```text
start-google-cloud.bat
```

Hoặc thiết lập biến môi trường:

```bat
set TRANSLATION_PROVIDER=google-cloud
set GOOGLE_TRANSLATE_API_KEY=YOUR_API_KEY
node server.mjs
```

API key nằm ở server, không được gửi xuống trình duyệt.

### Chỉ dùng offline

```text
start-local-only.bat
```

## Kiểm tra

```bash
npm run check
```

Lệnh này kiểm tra cấu trúc, dữ liệu Story, từ `dog`, dịch local và mô phỏng dịch API.

## Cấu trúc chính

```text
lingua-quest-modular/
├── index.html
├── server.mjs
├── server/translation-provider.mjs
├── assets/css/
├── src/
│   ├── app.js
│   ├── config/
│   ├── core/
│   ├── data/
│   ├── services/
│   └── controllers/
├── scripts/
└── docs/
```

## Nơi chỉnh nội dung

- Câu mới: `src/data/phrases.js`
- Từ mới: `src/data/vocabulary.js`
- Story: `src/data/chapters.js`
- Rank: `src/config/app-config.js`
- Giao diện: `assets/css/`
- Dịch phía trình duyệt: `src/services/*translation*`
- Provider dịch phía server: `server/translation-provider.mjs`

## Lưu trữ

Inventory, tiến độ, XP và voice vẫn được lưu bằng LocalStorage. Dịch trực tuyến cần Internet và văn bản sẽ được gửi tới provider đang hoạt động.
