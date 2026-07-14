# Kiến trúc hệ thống

## 1. Nguyên tắc phân lớp

Dự án sử dụng bốn lớp chính:

```text
UI HTML/CSS
    ↓
Controllers
    ↓
Services
    ↓
Data + Storage
```

### UI

`index.html` chỉ khai báo khung màn hình và các vùng có `id`. HTML không chứa dữ liệu bài học, thuật toán dịch, xử lý tiến độ hoặc Inventory.

### Controllers

Controller chịu trách nhiệm:

- Bắt sự kiện người dùng.
- Render dữ liệu vào đúng màn hình.
- Gọi service nghiệp vụ.
- Không trực tiếp đọc/ghi LocalStorage.

Mỗi chức năng có controller riêng:

| Controller | Trách nhiệm |
|---|---|
| `story-controller.js` | Chương, scene, chấm đáp án, XP trong lượt chơi |
| `lookup-controller.js` | Tìm câu/từ và thêm vào Inventory |
| `translation-controller.js` | Điều phối dịch Anh–Trung và Google Translate fallback |
| `inventory-controller.js` | Danh sách học cá nhân, trạng thái và ôn nhanh |

### Services

Service không phụ thuộc trực tiếp vào bố cục HTML:

| Service | Trách nhiệm |
|---|---|
| `SpeechService` | Tìm voice, ưu tiên Google voice, phát âm |
| `TranslationService` | Chuẩn hóa và tra cứu bản dịch trong corpus |
| `InventoryService` | CRUD Inventory và phát sự kiện thay đổi |
| `ProgressService` | XP, tiến độ chương và xếp rank |

### Data

Các file trong `src/data` chỉ chứa dữ liệu tĩnh. Scene tham chiếu câu bằng `phrase ID`, tránh lặp lại tiếng Anh, tiếng Trung và Pinyin ở nhiều nơi.

## 2. Luồng khởi tạo

1. `index.html` tải `src/app.js` bằng ES Module.
2. `app.js` khởi tạo Storage, Services và Controllers.
3. Controllers bind event và render dữ liệu ban đầu.
4. Khi Inventory thay đổi, `InventoryService` phát sự kiện `change`.
5. `InventoryController` render lại danh sách; `app.js` tính lại rank.

## 3. Luồng Story

```text
Chọn chương
  → lấy scene từ chapters.js
  → lấy nội dung câu từ phrases.js bằng ID
  → render loại game
  → kiểm tra đáp án
  → ProgressService ghi XP/tiến độ
  → có thể thêm câu vào InventoryService
```

## 4. Luồng Inventory

```text
Thêm từ/câu
  → InventoryService kiểm tra dữ liệu bắt buộc
  → kiểm tra trùng English hoặc 中文
  → gán trạng thái new
  → ghi LocalStorage
  → phát sự kiện change
  → giao diện và rank cập nhật
```

## 5. Hướng mở rộng backend

Khi cần đăng nhập và đồng bộ nhiều thiết bị:

- Giữ nguyên controllers và dữ liệu hiển thị.
- Tạo `ApiStorageService` thay cho `StorageService`.
- Chuyển `InventoryService` sang gọi REST API hoặc Google Apps Script API.
- Thêm `AuthService` và user ID.
- Tách dữ liệu bài học sang JSON/API nếu cần quản trị nội dung từ xa.

Không nên cho controller gọi `fetch` trực tiếp. Mọi kết nối backend nên nằm trong service.
