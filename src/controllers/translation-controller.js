export class TranslationController {
  constructor({ elements, translator, speech, inventory, notify }) {
    this.elements = elements;
    this.translator = translator;
    this.speech = speech;
    this.inventory = inventory;
    this.notify = notify;
    this.current = null;
    this.isTranslating = false;
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
      if (this.current?.text) this.speech.speak(this.current.text, this.current.target);
    });
    this.elements.swapButton.addEventListener('click', () => this.swap());
    this.elements.addButton.addEventListener('click', () => this.addCurrentToInventory());
  }

  async translate() {
    const text = this.elements.input.value.trim();
    if (!text) {
      this.notify('Hãy nhập nội dung cần dịch');
      return;
    }
    if (this.isTranslating) return;

    this.setLoading(true);
    try {
      this.current = await this.translator.translate(
        text,
        this.elements.sourceLanguage.value,
      );

      this.elements.targetLabel.textContent = this.current.target === 'zh'
        ? 'Bản dịch tiếng Trung'
        : 'English translation';
      this.elements.output.textContent = this.current.text || 'Không tìm thấy bản dịch.';
      this.elements.pinyin.textContent = this.current.target === 'zh'
        ? this.current.pinyin || ''
        : '';
      this.renderQuality(this.current);
      this.elements.googleLink.href = this.translator.buildGoogleTranslateUrl(
        text,
        this.current.source,
        this.current.target,
      );
      this.elements.googleLink.style.display = this.current.quality === 'none'
        ? 'inline'
        : 'none';

      if (this.current.remoteError && this.current.quality !== 'exact') {
        this.notify(`Không gọi được dịch trực tuyến: ${this.current.remoteError}`);
      }
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(isLoading) {
    this.isTranslating = isLoading;
    this.elements.translateButton.disabled = isLoading;
    this.elements.translateButton.textContent = isLoading ? 'Đang dịch…' : 'Dịch';
    if (isLoading) {
      this.elements.output.textContent = 'Đang kết nối dịch vụ dịch thuật…';
      this.elements.pinyin.textContent = '';
      this.elements.quality.textContent = 'Đang xử lý';
      this.elements.quality.className = 'quality-tag quality-loading';
    }
  }

  renderQuality(result) {
    let meta;
    switch (result.quality) {
      case 'exact':
        meta = ['Khớp kho học', 'quality-exact'];
        break;
      case 'remote':
        meta = [result.provider === 'google-cloud' ? 'Google Cloud' : 'Dịch trực tuyến', 'quality-remote'];
        break;
      case 'partial':
        meta = ['Ghép từ cục bộ', 'quality-partial'];
        break;
      default:
        meta = ['Không dịch được', 'quality-none'];
        break;
    }
    this.elements.quality.textContent = meta[0];
    this.elements.quality.className = `quality-tag ${meta[1]}`;
  }

  async swap() {
    const text = this.elements.input.value.trim();
    const currentLanguage = this.elements.sourceLanguage.value === 'auto'
      ? this.translator.detectLanguage(text)
      : this.elements.sourceLanguage.value;

    this.elements.sourceLanguage.value = currentLanguage === 'en' ? 'zh' : 'en';
    if (this.current?.text) this.elements.input.value = this.current.text;
    if (this.elements.input.value.trim()) await this.translate();
  }

  addCurrentToInventory() {
    if (!this.current?.text) {
      this.notify('Chưa có bản dịch để thêm');
      return;
    }
    if (!['exact', 'remote'].includes(this.current.quality)) {
      this.notify('Bản ghép từ hoặc bản lỗi không được thêm tự động');
      return;
    }

    const result = this.inventory.add({
      en: this.current.en,
      zh: this.current.zh,
      pinyin: this.current.pinyin || '',
      cat: this.current.quality === 'exact' ? 'Kho học tích hợp' : 'Dịch cá nhân',
    }, 'phrase');
    this.notify(result.message);
  }
}
