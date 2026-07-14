import { $$ } from '../core/dom.js';
import { escapeHtml } from '../core/utils.js';

export class LookupController {
  constructor({ elements, phrases, vocabulary, speech, inventory, notify }) {
    this.elements = elements;
    this.phrases = phrases;
    this.vocabulary = vocabulary;
    this.speech = speech;
    this.inventory = inventory;
    this.notify = notify;
    this.corpus = [
      ...phrases.map((item) => ({ ...item, type: 'phrase' })),
      ...vocabulary,
    ];
    this.corpusMap = new Map(this.corpus.map((item) => [item.id, item]));
  }

  initialize() {
    const categories = [...new Set(this.corpus.map((item) => item.cat))].sort();
    this.elements.category.insertAdjacentHTML('beforeend', categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join(''));
    this.elements.searchButton.addEventListener('click', () => this.render());
    this.elements.input.addEventListener('input', () => this.render());
    this.elements.category.addEventListener('change', () => this.render());
    this.render();
  }

  render() {
    const query = this.elements.input.value.trim().toLowerCase();
    const category = this.elements.category.value;
    let data = this.corpus;
    if (category !== 'all') data = data.filter((item) => item.cat === category);
    if (query) {
      data = data.filter((item) => item.en.toLowerCase().includes(query)
        || item.zh.includes(query)
        || item.pinyin.toLowerCase().includes(query));
    } else {
      data = data.slice(0, 18);
    }

    this.elements.summary.textContent = query ? `${data.length} kết quả phù hợp` : 'Một số câu và từ tiêu biểu';
    this.elements.results.innerHTML = data.length
      ? data.map((item) => this.card(item)).join('')
      : '<div class="empty">Không tìm thấy nội dung trong kho tích hợp.</div>';

    $$('[data-lookup-speak]', this.elements.results).forEach((button) => {
      button.addEventListener('click', () => {
        const item = this.corpusMap.get(button.dataset.lookupSpeak);
        this.speech.speak(item[button.dataset.lang], button.dataset.lang);
      });
    });
    $$('[data-lookup-add]', this.elements.results).forEach((button) => {
      button.addEventListener('click', () => {
        const item = this.corpusMap.get(button.dataset.lookupAdd);
        const result = this.inventory.add(item, item.type || 'phrase');
        this.notify(result.message);
      });
    });
  }

  card(item) {
    return `<article class="lookup-card">
      <div class="lookup-top">
        <span class="category-tag">${escapeHtml(item.cat)}</span>
        <span class="category-tag">${item.type === 'word' ? 'Từ' : 'Câu'}</span>
        <div class="lookup-actions">
          <button data-lookup-speak="${item.id}" data-lang="en" title="Nghe tiếng Anh">EN</button>
          <button data-lookup-speak="${item.id}" data-lang="zh" title="Nghe tiếng Trung">中</button>
          <button data-lookup-add="${item.id}" title="Thêm Inventory">＋</button>
        </div>
      </div>
      <div class="lookup-en">${escapeHtml(item.en)}</div>
      <div>
        <div class="lookup-zh">${escapeHtml(item.zh)}</div>
        <div class="lookup-pinyin">${escapeHtml(item.pinyin)}</div>
      </div>
    </article>`;
  }
}
