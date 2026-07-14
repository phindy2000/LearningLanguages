import { STATUS_META } from '../config/app-config.js';
import { $, $$ } from '../core/dom.js';
import { escapeHtml, shuffle } from '../core/utils.js';

export class InventoryController {
  constructor({ elements, inventory, speech, notify, onInventoryChange }) {
    this.elements = elements;
    this.inventory = inventory;
    this.speech = speech;
    this.notify = notify;
    this.onInventoryChange = onInventoryChange;
    this.reviewQueue = [];
    this.reviewIndex = 0;
    this.reviewRevealed = false;
  }

  initialize() {
    this.elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const result = this.inventory.add({
        en: this.elements.english.value,
        zh: this.elements.chinese.value,
        pinyin: this.elements.pinyin.value,
        cat: this.elements.category.value || 'Tự thêm',
      }, this.elements.type.value);
      this.notify(result.message);
      if (result.ok) {
        this.elements.form.reset();
        this.elements.category.value = 'Tự thêm';
      }
    });
    this.elements.search.addEventListener('input', () => this.render());
    this.elements.statusFilter.addEventListener('change', () => this.render());
    this.elements.reviewButton.addEventListener('click', () => this.openReview());
    this.elements.closeReviewButton.addEventListener('click', () => this.closeReview());
    this.elements.reviewBackdrop.addEventListener('click', (event) => {
      if (event.target === this.elements.reviewBackdrop) this.closeReview();
    });
    this.inventory.addEventListener('change', () => {
      this.renderSummary();
      this.render();
      this.onInventoryChange();
    });
    this.renderSummary();
    this.render();
  }

  renderSummary() {
    const counts = this.inventory.getCounts();
    this.elements.countNew.textContent = counts.new;
    this.elements.countUnlearned.textContent = counts.unlearned;
    this.elements.countReview.textContent = counts.review;
    this.elements.countMastered.textContent = counts.mastered;
    this.elements.navCount.textContent = this.inventory.getAll().length;
  }

  render() {
    const data = this.inventory.search({
      query: this.elements.search.value,
      status: this.elements.statusFilter.value,
    });
    this.elements.list.innerHTML = data.length
      ? data.map((item) => this.itemTemplate(item)).join('')
      : '<div class="empty">Inventory chưa có nội dung phù hợp.</div>';

    $$('[data-status-id]', this.elements.list).forEach((select) => {
      select.addEventListener('change', () => this.inventory.updateStatus(select.dataset.statusId, select.value));
    });
    $$('[data-inv-speak]', this.elements.list).forEach((button) => {
      button.addEventListener('click', () => {
        const item = this.inventory.getById(button.dataset.invSpeak);
        if (item) this.speech.speak(item[button.dataset.lang], button.dataset.lang);
      });
    });
    $$('[data-delete-id]', this.elements.list).forEach((button) => {
      button.addEventListener('click', () => {
        if (this.inventory.delete(button.dataset.deleteId)) this.notify('Đã xóa khỏi Inventory');
      });
    });
  }

  itemTemplate(item) {
    return `<article class="inventory-item">
      <div>
        <div class="en">${escapeHtml(item.en)}</div>
        <div class="zh">${escapeHtml(item.zh)}</div>
        <div class="py">${escapeHtml(item.pinyin)} · ${escapeHtml(item.cat)}</div>
      </div>
      <select data-status-id="${item.id}" aria-label="Trạng thái">
        ${Object.entries(STATUS_META).map(([key, meta]) => `<option value="${key}" ${item.status === key ? 'selected' : ''}>${meta.label}</option>`).join('')}
      </select>
      <div class="item-actions">
        <button data-inv-speak="${item.id}" data-lang="en" title="Nghe tiếng Anh">EN</button>
        <button data-inv-speak="${item.id}" data-lang="zh" title="Nghe tiếng Trung">中</button>
        <button class="delete" data-delete-id="${item.id}" title="Xóa">✕</button>
      </div>
    </article>`;
  }

  openReview() {
    this.reviewQueue = this.inventory.getReviewQueue(shuffle);
    this.reviewIndex = 0;
    this.reviewRevealed = false;
    if (!this.reviewQueue.length) {
      this.notify('Inventory chưa có nội dung để ôn');
      return;
    }
    this.elements.reviewBackdrop.classList.add('show');
    this.renderReviewCard();
  }

  closeReview() {
    this.elements.reviewBackdrop.classList.remove('show');
  }

  renderReviewCard() {
    const item = this.reviewQueue[this.reviewIndex];
    if (!item) {
      this.closeReview();
      this.render();
      return;
    }
    this.elements.reviewProgress.textContent = `${this.reviewIndex + 1} / ${this.reviewQueue.length}`;
    this.elements.reviewEnglish.textContent = item.en;
    this.elements.reviewChinese.textContent = item.zh;
    this.elements.reviewPinyin.textContent = item.pinyin;
    this.elements.reviewAnswer.classList.toggle('review-hidden', !this.reviewRevealed);

    if (!this.reviewRevealed) {
      this.elements.reviewControls.innerHTML = '<button class="review-reveal" id="revealReviewBtn">Hiện đáp án</button>';
      $('#revealReviewBtn', this.elements.reviewControls).addEventListener('click', () => {
        this.reviewRevealed = true;
        this.renderReviewCard();
      });
      return;
    }

    this.elements.reviewControls.innerHTML = `
      <button class="review-unlearned" data-review-status="unlearned">Chưa thuộc</button>
      <button class="review-review" data-review-status="review">Ôn tập</button>
      <button class="review-mastered" data-review-status="mastered">Đã thuộc</button>`;
    $$('[data-review-status]', this.elements.reviewControls).forEach((button) => {
      button.addEventListener('click', () => {
        this.inventory.updateStatus(item.id, button.dataset.reviewStatus);
        this.reviewIndex += 1;
        this.reviewRevealed = false;
        this.renderReviewCard();
      });
    });
  }
}
