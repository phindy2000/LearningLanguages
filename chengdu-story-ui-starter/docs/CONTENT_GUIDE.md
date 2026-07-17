# Hướng dẫn thay nội dung

## Trạng thái

Dữ liệu trong `data.js` là nội dung chính thức của chương đang phát hành.

## Vị trí cần thay

- `window.GAME_CONTENT.chapter`: metadata, từ đầu chương, mẫu câu, cảnh và lựa chọn.
- `window.GAME_CONTENT.dictionary`: nghĩa tiếng Việt, từ loại và ví dụ.

## Quy tắc nội dung

1. `messages[].zh`, `messages[].pinyin`, lựa chọn và lời dẫn thuộc cốt truyện chỉ dùng tiếng Trung giản thể + Pinyin.
2. Nghĩa tiếng Việt chỉ đặt trong `dictionary[].vi` và các lớp hỗ trợ.
3. Lựa chọn đã xác nhận được lưu trong `localStorage` và không có nút quay lại.
4. Tên động không nên xuất hiện trong file audio thu sẵn.
5. Mỗi `choice.id`, `option.id`, `message.id` phải duy nhất.

## Mẫu dữ liệu tin nhắn

```js
{
  id: "m01",
  type: "incoming", // incoming | outgoing | system
  speakerZh: "亲戚",
  speakerPinyin: "Qīnqi",
  zh: "……",
  pinyin: "……"
}
```

## Mẫu lựa chọn

```js
{
  id: "choice-01",
  promptZh: "你会怎么回复？",
  promptPinyin: "Nǐ huì zěnme huífù?",
  options: [
    {
      id: "c01-a",
      tone: "direct",
      zh: "……",
      pinyin: "……",
      effect: { trust: 1, calm: 1, flag: "example" }
    }
  ],
  reactions: {
    "c01-a": []
  }
}
```
