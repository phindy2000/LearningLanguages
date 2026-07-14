# Kiến trúc hệ thống

## 1. Phân lớp

```text
UI HTML/CSS
    ↓
Controllers
    ↓
Client Services
    ↓
Local Data / LocalStorage / HTTP API
    ↓
Node Server
    ↓
Translation Provider
```

### UI

`index.html` chỉ chứa khung màn hình và các vùng hiển thị. Dữ liệu bài học, dịch thuật, tiến độ và Inventory không được nhúng vào HTML.

### Controllers

| Controller | Trách nhiệm |
|---|---|
| `story-controller.js` | Chương, scene, chấm đáp án, XP trong lượt chơi |
| `lookup-controller.js` | Tìm câu/từ và thêm vào Inventory |
| `translation-controller.js` | Điều khiển trạng thái dịch, loading, kết quả, nghe và thêm Inventory |
| `inventory-controller.js` | Danh sách học cá nhân, trạng thái và ôn nhanh |

Controller không gọi nhà cung cấp dịch trực tiếp.

### Client Services

| Service | Trách nhiệm |
|---|---|
| `SpeechService` | Tìm voice, ưu tiên Google voice, phát âm |
| `LocalTranslationService` | Tra cứu chính xác và ghép từ cục bộ |
| `TranslationApiService` | Gọi endpoint `/api/translate`, timeout và xử lý lỗi HTTP |
| `TranslationService` | Điều phối local-first rồi remote fallback |
| `InventoryService` | CRUD Inventory và sự kiện thay đổi |
| `ProgressService` | XP, tiến độ chương và xếp rank |

### Server

| Thành phần | Trách nhiệm |
|---|---|
| `server.mjs` | Static server, REST endpoint, giới hạn body và phản hồi JSON |
| `server/translation-provider.mjs` | Chọn provider, giữ API key, gọi Google Cloud/MyMemory |

### Data

Các file trong `src/data` chỉ chứa dữ liệu tĩnh. Scene tham chiếu câu bằng `phrase ID`, tránh lặp nội dung Anh–Trung–Pinyin.

## 2. Luồng khởi tạo

1. `index.html` tải `src/app.js` bằng ES Module.
2. `app.js` khởi tạo Storage, Services và Controllers.
3. Controllers bind event và render dữ liệu ban đầu.
4. Inventory thay đổi sẽ phát sự kiện `change`.
5. Giao diện Inventory và rank được tính lại.

## 3. Luồng dịch

```text
Người dùng bấm Dịch
  → TranslationController bật trạng thái loading
  → TranslationService thử LocalTranslationService
  → Nếu exact: trả ngay
  → Nếu chưa exact: TranslationApiService gọi POST /api/translate
  → Node server chọn Google Cloud hoặc MyMemory
  → Kết quả trả về UI kèm tên provider
  → Nếu lỗi mạng: trả fallback cục bộ có nhãn rõ ràng
```

## 4. Luồng Story

```text
Chọn chương
  → lấy scene từ chapters.js
  → lấy câu từ phrases.js bằng ID
  → render mini game
  → kiểm tra đáp án
  → ProgressService ghi XP/tiến độ
  → tùy chọn thêm câu vào InventoryService
```

## 5. Luồng Inventory

```text
Thêm từ/câu
  → InventoryService kiểm tra bắt buộc và trùng
  → gán trạng thái new
  → ghi LocalStorage
  → phát change
  → giao diện và rank cập nhật
```

## 6. Hướng mở rộng

- Thay LocalStorage bằng API database mà không viết lại controller.
- Bổ sung đăng nhập và user ID.
- Chuyển dữ liệu bài học sang JSON/API quản trị nội dung.
- Thay provider dịch trong server mà không sửa giao diện.
- Không đặt credential trong mã JavaScript phía trình duyệt.
