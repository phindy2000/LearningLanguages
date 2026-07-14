import { STATUS_META, STORAGE_KEYS } from '../config/app-config.js';
import { createId, normalizeChinese, normalizeEnglish } from '../core/utils.js';

export class InventoryService extends EventTarget {
  constructor(storage) {
    super();
    this.storage = storage;
    const loaded = storage.getJSON(STORAGE_KEYS.inventory, []);
    this.items = Array.isArray(loaded) ? loaded : [];
  }

  getAll() {
    return [...this.items];
  }

  getById(id) {
    return this.items.find((item) => item.id === id) || null;
  }

  getCounts() {
    const counts = Object.fromEntries(Object.keys(STATUS_META).map((key) => [key, 0]));
    for (const item of this.items) counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }

  getMasteredCount() {
    return this.items.filter((item) => item.status === 'mastered').length;
  }

  search({ query = '', status = 'all' } = {}) {
    const needle = query.trim().toLowerCase();
    return this.items.filter((item) => {
      const statusMatches = status === 'all' || item.status === status;
      const textMatches = !needle
        || item.en.toLowerCase().includes(needle)
        || item.zh.includes(needle)
        || item.pinyin.toLowerCase().includes(needle);
      return statusMatches && textMatches;
    });
  }

  add(item, type = 'phrase') {
    if (!item?.en?.trim() || !item?.zh?.trim()) {
      return { ok: false, message: 'Cần nhập đủ tiếng Anh và tiếng Trung.' };
    }

    const duplicate = this.items.some((existing) => (
      normalizeEnglish(existing.en) === normalizeEnglish(item.en)
      || normalizeChinese(existing.zh) === normalizeChinese(item.zh)
    ));
    if (duplicate) return { ok: false, message: 'Nội dung này đã có trong Inventory.' };

    const created = {
      id: createId('inventory'),
      en: item.en.trim(),
      zh: item.zh.trim(),
      pinyin: item.pinyin?.trim() || '',
      cat: item.cat?.trim() || 'Tự thêm',
      type,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    this.items.unshift(created);
    this.persist();
    return { ok: true, message: 'Đã thêm vào Inventory.', item: created };
  }

  updateStatus(id, status) {
    if (!STATUS_META[status]) return false;
    const item = this.getById(id);
    if (!item) return false;
    item.status = status;
    this.persist();
    return true;
  }

  delete(id) {
    const before = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    if (this.items.length === before) return false;
    this.persist();
    return true;
  }

  getReviewQueue(shuffleFunction) {
    const pending = this.items.filter((item) => item.status !== 'mastered');
    const source = pending.length ? pending : this.items;
    return shuffleFunction(source);
  }

  persist() {
    this.storage.setJSON(STORAGE_KEYS.inventory, this.items);
    this.dispatchEvent(new CustomEvent('change', { detail: this.getAll() }));
  }
}
