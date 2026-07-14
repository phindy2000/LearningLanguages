export class TranslationController {
  constructor({ elements, translator, speech, inventory, notify }) {
    this.elements = elements;
    this.translator = translator;
    this.speech = speech;
    this.inventory = inventory;
    this.notify = notify;
    this.current = null;
  }

  initialize() {
    this.elements.translateButton.addEventListener('click', () => this.translate());
    this.elements.input.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') this.translate();
    });
    this.elements.speakSourceButton.addEventListener('click', () => {
      const text = this.elements.input.value.trim();
      if (!text) return;
      const language = this.elements.sourceLanguage.value === 'auto'
        ? this.translator.detectLanguage(text)
        : this.elements.sourceLanguage.value;
      this.speech.speak(text, language);
    });
    this.elements.speakTranslationButton.addEventListener('click', () => {
      if (this.current) this.speech.speak(this.current.text, this.current.target);
    });
    this.elements.swapButton.addEventListener('click', () => this.swap());
    this.elements.addButton.addEventListener('click', () => this.addCurrentToInventory());
  }

  translate() {
    const text = this.elements.input.value.trim();
    if (!text) {
      this.notify('Hãy nhập nội dung cần dịch');
      return;
    }
    this.current = this.translator.translate(text, this.elements.sourceLanguage.value);
    this.elements.targetLabel.textContent = this.current.target === 'zh'
      ? 'Bản dịch tiếng Trung'
      : 'English translation';
    this.elements.output.textContent = this.current.text || 'Không tìm thấy bản dịch.';
    this.elements.pinyin.textContent = this.current.target === 'zh' ? this.current.pinyin || '' : '';
    this.renderQuality(this.current.quality);
    this.elements.googleLink.href = this.translator.buildGoogleTranslateUrl(
      text,
      this.current.source,
      this.current.target,
    );
    this.elements.googleLink.style.display = this.current.quality === 'exact' ? 'none' : 'inline';
  }

  renderQuality(quality) {
    const meta = quality === 'exact'
      ? ['Khớp chính xác', 'quality-exact']
      : quality === 'partial'
        ? ['Ghép gần đúng', 'quality-partial']
        : ['Ngoài kho', 'quality-none'];
    this.elements.quality.textContent = meta[0];
    this.elements.quality.className = `quality-tag ${meta[1]}`;
  }

  swap() {
    const text = this.elements.input.value.trim();
    const currentLanguage = this.elements.sourceLanguage.value === 'auto'
      ? this.translator.detectLanguage(text)
      : this.elements.sourceLanguage.value;
    this.elements.sourceLanguage.value = currentLanguage === 'en' ? 'zh' : 'en';
    if (this.current) this.elements.input.value = this.current.text;
    this.translate();
  }

  addCurrentToInventory() {
    if (!this.current) {
      this.notify('Chưa có bản dịch để thêm');
      return;
    }
    if (this.current.quality !== 'exact') {
      this.notify('Chỉ bản dịch khớp chính xác mới được thêm tự động');
      return;
    }
    const result = this.inventory.add({
      en: this.current.target === 'en' ? this.current.text : this.current.input,
      zh: this.current.target === 'zh' ? this.current.text : this.current.input,
      pinyin: this.current.pinyin || '',
      cat: 'Dịch cá nhân',
    }, 'phrase');
    this.notify(result.message);
  }
}
