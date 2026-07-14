import { MODE_NAMES } from '../config/app-config.js';
import { $, $$ } from '../core/dom.js';
import { escapeHtml, normalizeChinese, normalizeEnglish, shuffle } from '../core/utils.js';

export class StoryController {
  constructor({ elements, chapters, phraseMap, speech, progress, inventory, notify, onStatsChange }) {
    this.elements = elements;
    this.chapters = chapters;
    this.phraseMap = phraseMap;
    this.speech = speech;
    this.progress = progress;
    this.inventory = inventory;
    this.notify = notify;
    this.onStatsChange = onStatsChange;
    this.state = {
      chapterIndex: 0,
      sceneIndex: 0,
      selected: null,
      checked: false,
      hearts: 3,
      streak: 0,
      correct: 0,
      attempts: 0,
      chapterXp: 0,
      answerWords: [],
    };
  }

  initialize() {
    this.elements.nextButton.addEventListener('click', () => this.checkAnswer());
    this.elements.replayButton.addEventListener('click', () => this.replayCurrentPhrase());
    this.elements.restartButton.addEventListener('click', () => this.startChapter(this.state.chapterIndex));
    this.renderChapters();
    this.renderScene();
  }

  getPhrase(id) {
    return this.phraseMap.get(id);
  }

  getCurrentChapter() {
    return this.chapters[this.state.chapterIndex];
  }

  getCurrentScene() {
    return this.getCurrentChapter().scenes[this.state.sceneIndex];
  }

  getCurrentPhrase() {
    return this.getPhrase(this.getCurrentScene().focus);
  }

  getStats() {
    return {
      xp: this.progress.xp,
      streak: this.state.streak,
      hearts: this.state.hearts,
    };
  }

  renderChapters() {
    this.elements.chapterList.innerHTML = this.chapters.map((chapter, index) => {
      const done = this.progress.getChapterDone(chapter.id, chapter.scenes.length);
      return `<button class="chapter-btn ${index === this.state.chapterIndex ? 'active' : ''}" data-chapter="${index}">
        <span class="chapter-icon">${chapter.icon}</span>
        <span>
          <div class="chapter-name">${escapeHtml(chapter.title)}</div>
          <div class="chapter-meta">${escapeHtml(chapter.subtitle)}</div>
        </span>
        <span class="chapter-progress">${done}/${chapter.scenes.length}</span>
      </button>`;
    }).join('');

    $$('[data-chapter]', this.elements.chapterList).forEach((button) => {
      button.addEventListener('click', () => this.startChapter(Number(button.dataset.chapter)));
    });
  }

  startChapter(index) {
    this.speech.cancel();
    this.state.chapterIndex = index;
    this.state.sceneIndex = 0;
    this.state.correct = 0;
    this.state.attempts = 0;
    this.state.chapterXp = 0;
    this.state.hearts = 3;
    this.state.streak = 0;
    this.resetScene();
    this.elements.completeView.classList.remove('show');
    this.elements.gameBody.style.display = 'grid';
    this.elements.gameFooter.style.display = 'flex';
    this.renderChapters();
    this.renderScene();
    this.onStatsChange(this.getStats());
  }

  resetScene() {
    this.state.selected = null;
    this.state.checked = false;
    this.state.answerWords = [];
  }

  renderScene() {
    const chapter = this.getCurrentChapter();
    const scene = this.getCurrentScene();
    const phrase = this.getCurrentPhrase();

    this.elements.progressFill.style.width = `${(this.state.sceneIndex / chapter.scenes.length) * 100}%`;
    this.elements.sceneCount.textContent = `${this.state.sceneIndex + 1} / ${chapter.scenes.length}`;
    this.elements.sceneVisual.textContent = scene.visual;
    this.elements.sceneTitle.textContent = scene.title;
    this.elements.sceneContext.textContent = scene.context;
    this.elements.modeTag.textContent = MODE_NAMES[scene.type];
    this.elements.nextButton.textContent = 'Kiểm tra';
    this.elements.nextButton.disabled = true;
    this.elements.replayButton.style.visibility = 'visible';

    const intro = scene.line
      ? this.storyBubble(this.getPhrase(scene.line), scene.speaker, scene.avatar)
      : '';
    let question = '';
    if (scene.type === 'match') question = this.renderMatch(scene, phrase);
    else if (scene.type === 'reply') question = this.renderReply(scene);
    else if (scene.type === 'listen') question = this.renderListen(scene, phrase);
    else question = this.renderOrder(scene, phrase);

    this.elements.gameBody.innerHTML = `${intro}
      <div class="question-label">${MODE_NAMES[scene.type]}</div>
      ${question}
      <div class="feedback" id="feedback"></div>
      <div id="revealWrap" style="display:none">${this.fullPhrasePanel(phrase, true)}</div>`;

    this.bindSceneEvents();
    this.onStatsChange(this.getStats());
    if (scene.type === 'listen') {
      setTimeout(() => this.speech.speak(phrase[scene.listenLang], scene.listenLang), 320);
    }
  }

  storyBubble(phrase, speaker, avatar) {
    return `<div class="speaker-line">
      <div class="avatar">${avatar}</div>
      <div class="bubble">
        <strong>${escapeHtml(speaker)}</strong>
        <div class="bubble-en">${escapeHtml(phrase.en)}</div>
        <div class="bubble-zh">${escapeHtml(phrase.zh)}</div>
        <div class="bubble-pinyin">${escapeHtml(phrase.pinyin)}</div>
      </div>
    </div>`;
  }

  renderMatch(scene, phrase) {
    const source = scene.source;
    const target = source === 'en' ? 'zh' : 'en';
    return `${this.singlePhraseRow(phrase, source)}
      <div class="question-text">Chọn bản tương ứng bằng ${target === 'zh' ? 'tiếng Trung' : 'tiếng Anh'}.</div>
      ${this.choiceList(scene.options, target)}`;
  }

  renderReply(scene) {
    return `<div class="question-text">Chọn câu phản hồi phù hợp. Tất cả lựa chọn đều hiển thị Anh–Trung.</div>
      ${this.choiceList(scene.options, 'both')}`;
  }

  renderListen(scene, phrase) {
    return `<div class="listen-box">
      <button class="speak-btn" data-speak-text="${escapeHtml(phrase[scene.listenLang])}" data-speak-lang="${scene.listenLang}">🔊</button>
      <b>Nghe câu ${scene.listenLang === 'en' ? 'tiếng Anh' : 'tiếng Trung'}</b>
      <span>Có thể bấm lại nhiều lần trước khi chọn.</span>
    </div>
    <div class="question-text">Chọn câu tương ứng bằng ${scene.optionLang === 'zh' ? 'tiếng Trung' : 'tiếng Anh'}.</div>
    ${this.choiceList(scene.options, scene.optionLang)}`;
  }

  renderOrder(scene, phrase) {
    const clueLanguage = scene.orderLang === 'en' ? 'zh' : 'en';
    scene._chunks = shuffle(scene.chunks);
    return `${this.singlePhraseRow(phrase, clueLanguage)}
      <div class="question-text">Sắp xếp thành câu ${scene.orderLang === 'en' ? 'tiếng Anh' : 'tiếng Trung'}.</div>
      <div class="answer-zone" id="answerZone"><span class="hint">Câu trả lời sẽ xuất hiện tại đây…</span></div>
      <div class="word-bank" id="wordBank">
        ${scene._chunks.map((word, index) => `<button class="word-chip" data-word-index="${index}">${escapeHtml(word)}</button>`).join('')}
      </div>`;
  }

  singlePhraseRow(phrase, language) {
    return `<div class="phrase-panel">
      <div class="phrase-row">
        <span class="lang">${language === 'en' ? 'EN' : '中'}</span>
        <div>
          <div class="phrase-main">${escapeHtml(phrase[language])}</div>
          ${language === 'zh' ? `<div class="phrase-sub">${escapeHtml(phrase.pinyin)}</div>` : ''}
        </div>
        <button class="speak-btn" data-speak-text="${escapeHtml(phrase[language])}" data-speak-lang="${language}">🔊</button>
      </div>
    </div>`;
  }

  choiceList(ids, mode) {
    return `<div class="choices">${ids.map((id, index) => {
      const phrase = this.getPhrase(id);
      let content = '';
      if (mode === 'both') {
        content = `<div>
          <div class="choice-en">${escapeHtml(phrase.en)}</div>
          <div class="choice-zh">${escapeHtml(phrase.zh)}</div>
          <div class="choice-pinyin">${escapeHtml(phrase.pinyin)}</div>
        </div>`;
      } else if (mode === 'zh') {
        content = `<div>
          <div class="choice-zh">${escapeHtml(phrase.zh)}</div>
          <div class="choice-pinyin">${escapeHtml(phrase.pinyin)}</div>
        </div>`;
      } else {
        content = `<div class="choice-en">${escapeHtml(phrase.en)}</div>`;
      }
      return `<button class="choice" data-choice-id="${id}">
        <span class="choice-index">${String.fromCharCode(65 + index)}</span>${content}
      </button>`;
    }).join('')}</div>`;
  }

  fullPhrasePanel(phrase, withAdd = false) {
    return `<div class="phrase-panel">
      <div class="phrase-row">
        <span class="lang">EN</span>
        <div><div class="phrase-main">${escapeHtml(phrase.en)}</div></div>
        <button class="speak-btn" data-speak-text="${escapeHtml(phrase.en)}" data-speak-lang="en">🔊</button>
      </div>
      <div class="phrase-row">
        <span class="lang">中</span>
        <div>
          <div class="phrase-main">${escapeHtml(phrase.zh)}</div>
          <div class="phrase-sub">${escapeHtml(phrase.pinyin)}</div>
        </div>
        <button class="speak-btn" data-speak-text="${escapeHtml(phrase.zh)}" data-speak-lang="zh">🔊</button>
      </div>
      ${withAdd ? `<div><button class="small-btn" data-add-phrase="${phrase.id}" style="color:var(--primary)">＋ Thêm câu này vào Inventory</button></div>` : ''}
    </div>`;
  }

  bindSceneEvents() {
    $$('[data-speak-text]', this.elements.gameBody).forEach((button) => {
      button.addEventListener('click', () => this.speech.speak(button.dataset.speakText, button.dataset.speakLang));
    });
    $$('[data-choice-id]', this.elements.gameBody).forEach((button) => {
      button.addEventListener('click', () => {
        if (this.state.checked) return;
        this.state.selected = button.dataset.choiceId;
        $$('[data-choice-id]', this.elements.gameBody).forEach((choice) => choice.classList.remove('selected'));
        button.classList.add('selected');
        this.elements.nextButton.disabled = false;
      });
    });
    $$('[data-word-index]', this.elements.gameBody).forEach((button) => {
      button.addEventListener('click', () => this.addWord(Number(button.dataset.wordIndex)));
    });
  }

  addWord(index) {
    if (this.state.checked || this.state.answerWords.includes(index)) return;
    this.state.answerWords.push(index);
    this.refreshOrder();
    this.elements.nextButton.disabled = false;
  }

  refreshOrder() {
    const scene = this.getCurrentScene();
    const answerZone = $('#answerZone', this.elements.gameBody);
    const wordBank = $('#wordBank', this.elements.gameBody);
    answerZone.innerHTML = this.state.answerWords.length
      ? this.state.answerWords.map((index, position) => `<button class="word-chip" data-answer-pos="${position}">${escapeHtml(scene._chunks[index])}</button>`).join('')
      : '<span class="hint">Câu trả lời sẽ xuất hiện tại đây…</span>';
    [...wordBank.querySelectorAll('.word-chip')].forEach((button, index) => {
      button.disabled = this.state.answerWords.includes(index);
    });
    $$('[data-answer-pos]', answerZone).forEach((button) => {
      button.addEventListener('click', () => {
        if (this.state.checked) return;
        this.state.answerWords.splice(Number(button.dataset.answerPos), 1);
        this.refreshOrder();
        this.elements.nextButton.disabled = this.state.answerWords.length === 0;
      });
    });
  }

  checkAnswer() {
    const scene = this.getCurrentScene();
    const phrase = this.getCurrentPhrase();
    if (this.state.checked) {
      this.nextScene();
      return;
    }

    let isCorrect = false;
    if (scene.type === 'order') {
      const built = this.state.answerWords.map((index) => scene._chunks[index]).join(scene.orderLang === 'zh' ? '' : ' ');
      isCorrect = scene.orderLang === 'zh'
        ? normalizeChinese(built) === normalizeChinese(phrase.zh)
        : normalizeEnglish(built) === normalizeEnglish(phrase.en);
    } else {
      isCorrect = this.state.selected === scene.focus;
    }

    this.state.checked = true;
    this.state.attempts += 1;
    const feedback = $('#feedback', this.elements.gameBody);
    if (isCorrect) {
      this.state.correct += 1;
      this.state.streak += 1;
      const gain = 10 + Math.min(this.state.streak * 2, 10);
      this.progress.addXp(gain);
      this.state.chapterXp += gain;
      feedback.className = 'feedback show ok';
      feedback.innerHTML = `<b>Chính xác.</b> Cặp câu Anh–Trung đã được mở. <span style="float:right;font-weight:900">+${gain} XP</span>`;
    } else {
      this.state.hearts = Math.max(0, this.state.hearts - 1);
      this.state.streak = 0;
      feedback.className = 'feedback show bad';
      feedback.innerHTML = '<b>Chưa đúng.</b> Xem lại cặp câu bên dưới rồi tiếp tục.';
    }

    if (scene.type !== 'order') {
      $$('[data-choice-id]', this.elements.gameBody).forEach((button) => {
        button.disabled = true;
        if (button.dataset.choiceId === scene.focus) button.classList.add('correct');
        else if (button.dataset.choiceId === this.state.selected) button.classList.add('wrong');
      });
    } else {
      const answerZone = $('#answerZone', this.elements.gameBody);
      answerZone.style.borderColor = isCorrect ? '#41a77c' : '#e58989';
      if (!isCorrect) {
        answerZone.insertAdjacentHTML('beforeend', `<div style="width:100%;color:#922b2b;font-size:12px;margin-top:4px">Đáp án: <b>${escapeHtml(scene.orderLang === 'zh' ? phrase.zh : phrase.en)}</b></div>`);
      }
    }

    $('#revealWrap', this.elements.gameBody).style.display = 'block';
    $$('[data-add-phrase]', this.elements.gameBody).forEach((button) => {
      button.addEventListener('click', () => {
        const result = this.inventory.add(this.getPhrase(button.dataset.addPhrase), 'phrase');
        this.notify(result.message);
      });
    });
    this.elements.nextButton.textContent = this.state.sceneIndex === this.getCurrentChapter().scenes.length - 1
      ? 'Hoàn thành'
      : 'Tiếp tục';
    this.elements.nextButton.disabled = false;
    this.onStatsChange(this.getStats());
  }

  nextScene() {
    const chapter = this.getCurrentChapter();
    if (this.state.sceneIndex >= chapter.scenes.length - 1) {
      this.completeChapter();
      return;
    }
    this.state.sceneIndex += 1;
    this.resetScene();
    this.progress.markScene(chapter.id, this.state.sceneIndex);
    this.renderScene();
  }

  completeChapter() {
    this.speech.cancel();
    const chapter = this.getCurrentChapter();
    this.progress.completeChapter(chapter.id, chapter.scenes.length);
    this.elements.progressFill.style.width = '100%';
    this.elements.sceneCount.textContent = `${chapter.scenes.length} / ${chapter.scenes.length}`;
    this.elements.gameBody.style.display = 'none';
    this.elements.gameFooter.style.display = 'none';
    this.elements.completeView.classList.add('show');
    this.elements.completeText.textContent = `Bạn đã hoàn thành “${chapter.title}”. Các đáp án trong chương chỉ dùng tiếng Anh và tiếng Trung.`;
    this.elements.resultCorrect.textContent = `${this.state.correct}/${this.state.attempts}`;
    this.elements.resultXp.textContent = this.state.chapterXp;
    this.elements.resultAccuracy.textContent = `${this.state.attempts ? Math.round((this.state.correct / this.state.attempts) * 100) : 0}%`;
    this.renderChapters();
  }

  replayCurrentPhrase() {
    const phrase = this.getCurrentPhrase();
    this.speech.speak(phrase.en, 'en');
    setTimeout(() => this.speech.speak(phrase.zh, 'zh'), Math.max(1400, phrase.en.length * 62));
  }
}
