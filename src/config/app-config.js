/** Central configuration. Change labels, storage keys and ranks here. */
export const STORAGE_KEYS = Object.freeze({
  inventory: 'lqx2_inventory',
  progress: 'lqx2_progress',
  xp: 'lqx2_xp',
  legacyXp: 'lq_xp',
  voiceEn: 'lqx2_voice_en',
  voiceZh: 'lqx2_voice_zh',
});

export const STATUS_META = Object.freeze({
  new: { label: 'Mới thêm', className: 'status-new' },
  unlearned: { label: 'Chưa thuộc', className: 'status-unlearned' },
  review: { label: 'Ôn tập', className: 'status-review' },
  mastered: { label: 'Đã thuộc', className: 'status-mastered' },
});

export const VIEW_META = Object.freeze({
  story: ['Game Story', 'Học câu giao tiếp theo tình huống nối tiếp'],
  lookup: ['Tra cứu', 'Tìm câu, từ và nghe phát âm'],
  translate: ['Dịch Anh–Trung', 'Dịch từ kho nội dung có kiểm soát'],
  inventory: ['Inventory', 'Quản lý trạng thái ghi nhớ của từ và câu'],
});

export const MODE_NAMES = Object.freeze({
  match: 'Ghép Anh–Trung',
  reply: 'Chọn phản hồi',
  listen: 'Nghe và chọn',
  order: 'Sắp xếp câu',
});

export const RANKS = Object.freeze([
  { name: 'Starter', min: 0, next: 150 },
  { name: 'Explorer', min: 150, next: 450 },
  { name: 'Communicator', min: 450, next: 900 },
  { name: 'Navigator', min: 900, next: 1600 },
  { name: 'Bilingual Builder', min: 1600, next: 2600 },
  { name: 'Polyglot', min: 2600, next: null },
]);
