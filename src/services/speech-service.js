import { STORAGE_KEYS } from '../config/app-config.js';
import { escapeHtml } from '../core/utils.js';

export class SpeechService {
  constructor(storage, { englishSelect, chineseSelect, statusElement, notify }) {
    this.storage = storage;
    this.englishSelect = englishSelect;
    this.chineseSelect = chineseSelect;
    this.statusElement = statusElement;
    this.notify = notify;
    this.voices = [];
  }

  initialize() {
    if (!('speechSynthesis' in window)) {
      this.statusElement.textContent = 'Trình duyệt không hỗ trợ đọc giọng nói';
      return;
    }
    this.englishSelect.addEventListener('change', () => {
      this.storage.set(STORAGE_KEYS.voiceEn, this.englishSelect.value);
      this.notify('Đã đổi giọng tiếng Anh');
    });
    this.chineseSelect.addEventListener('change', () => {
      this.storage.set(STORAGE_KEYS.voiceZh, this.chineseSelect.value);
      this.notify('Đã đổi giọng tiếng Trung');
    });
    speechSynthesis.onvoiceschanged = () => this.loadVoices();
    setTimeout(() => this.loadVoices(), 100);
    setTimeout(() => this.loadVoices(), 850);
  }

  loadVoices() {
    this.voices = speechSynthesis.getVoices();
    const english = this.rankVoices('en');
    const chinese = this.rankVoices('zh');
    this.fillSelect(this.englishSelect, english, STORAGE_KEYS.voiceEn);
    this.fillSelect(this.chineseSelect, chinese, STORAGE_KEYS.voiceZh);

    const hasEnglishGoogle = english.some((voice) => /google/i.test(voice.name));
    const hasChineseGoogle = chinese.some((voice) => /google/i.test(voice.name));
    this.statusElement.textContent = hasEnglishGoogle && hasChineseGoogle
      ? 'Google voice EN & 中文'
      : hasEnglishGoogle || hasChineseGoogle
        ? 'Có một Google voice; ngôn ngữ còn lại dùng dự phòng'
        : 'Đang dùng voice hệ thống';
  }

  rankVoices(language) {
    const prefix = language === 'en' ? 'en' : 'zh';
    return this.voices
      .filter((voice) => voice.lang.toLowerCase().startsWith(prefix))
      .sort((a, b) => this.voiceScore(b) - this.voiceScore(a));
  }

  voiceScore(voice) {
    return (/google/i.test(voice.name) ? 100 : 0)
      + (/natural|premium|enhanced/i.test(voice.name) ? 20 : 0)
      + (voice.default ? 5 : 0);
  }

  fillSelect(select, voices, storageKey) {
    const previous = this.storage.get(storageKey, '');
    select.innerHTML = voices.length
      ? voices.map((voice) => `<option value="${escapeHtml(voice.name)}" ${voice.name === previous ? 'selected' : ''}>${/google/i.test(voice.name) ? 'Google · ' : ''}${escapeHtml(voice.name)}</option>`).join('')
      : '<option value="">Voice mặc định</option>';
  }

  getSelectedVoice(language) {
    const select = language === 'en' ? this.englishSelect : this.chineseSelect;
    return this.voices.find((voice) => voice.name === select.value)
      || this.rankVoices(language)[0]
      || null;
  }

  speak(text, language) {
    if (!text || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
    utterance.rate = language === 'zh' ? 0.76 : 0.83;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voice = this.getSelectedVoice(language);
    if (voice) utterance.voice = voice;
    speechSynthesis.speak(utterance);
  }

  cancel() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
}
