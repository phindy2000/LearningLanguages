# Dịch thuật Anh–Trung

## Luồng xử lý

```text
TranslationController
  → TranslationService (điều phối)
      → LocalTranslationService
      → TranslationApiService
          → POST /api/translate
              → server/translation-provider.mjs
                  → Google Cloud Translation hoặc MyMemory
```

## Nguyên tắc

1. Từ/câu khớp chính xác trong `phrases.js` hoặc `vocabulary.js` được trả ngay, không gửi ra Internet.
2. Nội dung ngoài kho được gửi tới backend `/api/translate`.
3. Backend giữ khóa dịch vụ; trình duyệt không nhìn thấy API key.
4. Nếu dịch vụ trực tuyến lỗi, giao diện chỉ hiển thị bản ghép từ cục bộ và gắn nhãn `Ghép từ cục bộ` hoặc `Không dịch được`.
5. Pinyin chỉ có sẵn cho nội dung đã được khai báo trong kho học. Bản dịch trực tuyến không tự bịa Pinyin.

## Nhà cung cấp

Biến môi trường `TRANSLATION_PROVIDER` hỗ trợ:

| Giá trị | Hành vi |
|---|---|
| `auto` | Có Google API key thì dùng Google Cloud; nếu không thì dùng MyMemory |
| `google-cloud` | Chỉ dùng Google Cloud Translation |
| `mymemory` | Chỉ dùng MyMemory |
| `local` | Tắt dịch trực tuyến, chỉ dùng kho cục bộ |

Mặc định là `auto`.

## Google Cloud Translation

Thiết lập biến môi trường trước khi chạy:

### Windows CMD

```bat
set TRANSLATION_PROVIDER=google-cloud
set GOOGLE_TRANSLATE_API_KEY=YOUR_API_KEY
node server.mjs
```

Hoặc chạy `start-google-cloud.bat` và nhập API key khi được hỏi.

API key chỉ tồn tại trong tiến trình Node và không được ghi vào mã nguồn.

## MyMemory

Nếu không có Google API key, chế độ `auto` dùng MyMemory làm dịch vụ mặc định. Có thể khai báo email liên hệ theo khuyến nghị của nhà cung cấp:

```bat
set MYMEMORY_CONTACT_EMAIL=your@email.com
node server.mjs
```

## Kiểm tra trạng thái

Mở endpoint sau khi server chạy:

```text
http://127.0.0.1:8080/api/translation-status
```

Ví dụ kết quả:

```json
{
  "configured": "auto",
  "active": "mymemory",
  "hasGoogleKey": false,
  "maxTextLength": 2000
}
```

## Giới hạn

- Cần Internet khi nội dung không có trong kho cục bộ.
- Dịch máy có thể sai ngữ cảnh; người học nên kiểm tra câu quan trọng.
- Văn bản gửi dịch trực tuyến sẽ được chuyển tới nhà cung cấp đang hoạt động.
- Không đưa API key vào JavaScript phía trình duyệt.
