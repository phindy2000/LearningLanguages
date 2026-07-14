# Chuẩn dữ liệu

## Phrase

```js
{
  id: 'p53',
  en: 'Could you help me?',
  zh: '你能帮我吗？',
  pinyin: 'Nǐ néng bāng wǒ ma?',
  cat: 'Thông dụng'
}
```

Quy tắc:

- `id` duy nhất.
- `en` và `zh` bắt buộc.
- `pinyin` nên có dấu thanh.
- `cat` dùng để lọc ở màn hình Tra cứu.

## Vocabulary

```js
{
  id: 'v53',
  en: 'schedule',
  zh: '日程',
  pinyin: 'rìchéng',
  cat: 'Công sở',
  type: 'word'
}
```

## Chapter

```js
{
  id: 'office',
  icon: '💼',
  title: 'Tại công sở',
  subtitle: 'Họp và xử lý công việc',
  scenes: []
}
```

## Scene: match

```js
{
  type: 'match',
  focus: 'p01',
  source: 'en',
  options: ['p03', 'p01', 'p05', 'p07'],
  title: 'Gặp Anna',
  context: 'Minh gặp Anna trước giờ làm.',
  visual: '👋',
  speaker: 'Anna',
  avatar: '👩'
}
```

## Scene: reply

```js
{
  type: 'reply',
  line: 'p01',
  focus: 'p02',
  options: ['p02', 'p10', 'p14', 'p41'],
  title: 'Trả lời lời chào',
  context: 'Phản hồi tự nhiên và hỏi lại.',
  visual: '🙂',
  speaker: 'Anna',
  avatar: '👩'
}
```

## Scene: listen

```js
{
  type: 'listen',
  focus: 'p03',
  listenLang: 'en',
  optionLang: 'zh',
  options: ['p03', 'p05', 'p17', 'p29'],
  title: 'Chuyện tối qua',
  context: 'Nghe câu hỏi của Anna.',
  visual: '🌙',
  speaker: 'Anna',
  avatar: '👩'
}
```

## Scene: order

```js
{
  type: 'order',
  focus: 'p05',
  orderLang: 'en',
  chunks: ['Shall', 'we', 'get', 'some', 'coffee', 'before', 'work?'],
  title: 'Rủ đi cà phê',
  context: 'Sắp xếp lời đề nghị.',
  visual: '☕',
  speaker: 'Minh',
  avatar: '👨'
}
```

## Inventory item

```js
{
  id: 'inventory_...',
  en: 'meeting',
  zh: '会议',
  pinyin: 'huìyì',
  cat: 'Công sở',
  type: 'word',
  status: 'new',
  createdAt: '2026-07-14T...Z'
}
```

Giá trị `status` hợp lệ:

- `new`
- `unlearned`
- `review`
- `mastered`
