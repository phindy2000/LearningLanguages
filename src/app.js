import { VIEW_META } from './config/app-config.js';
import { $, $$, requireElement } from './core/dom.js';
import { StorageService } from './core/storage.js';
import { phrases } from './data/phrases.js';
import { vocabulary } from './data/vocabulary.js';
import { chapters } from './data/chapters.js';
import { InventoryService } from './services/inventory-service.js';
import { ProgressService } from './services/progress-service.js';
import { SpeechService } from './services/speech-service.js';
import { TranslationService } from './services/translation-service.js';
import { StoryController } from './controllers/story-controller.js';
import { LookupController } from './controllers/lookup-controller.js';
import { TranslationController } from './controllers/translation-controller.js';
import { InventoryController } from './controllers/inventory-controller.js';

class LinguaQuestApp {
  constructor() {
    this.storage = new StorageService();
    this.progress = new ProgressService(this.storage);
    this.inventory = new InventoryService(this.storage);
    this.phraseMap = new Map(phrases.map((phrase) => [phrase.id, phrase]));
    this.elements = this.collectElements();
    this.toastTimer = null;

    this.speech = new SpeechService(this.storage, {
      englishSelect: this.elements.voiceEnglish,
      chineseSelect: this.elements.voiceChinese,
      statusElement: this.elements.voiceStatus,
      notify: (message) => this.toast(message),
    });
    this.translator = new TranslationService(phrases, vocabulary);

    this.story = new StoryController({
      elements: this.elements.story,
      chapters,
      phraseMap: this.phraseMap,
      speech: this.speech,
      progress: this.progress,
      inventory: this.inventory,
      notify: (message) => this.toast(message),
      onStatsChange: (stats) => this.updateStats(stats),
    });
    this.lookup = new LookupController({
      elements: this.elements.lookup,
      phrases,
      vocabulary,
      speech: this.speech,
      inventory: this.inventory,
      notify: (message) => this.toast(message),
    });
    this.translation = new TranslationController({
      elements: this.elements.translation,
      translator: this.translator,
      speech: this.speech,
      inventory: this.inventory,
      notify: (message) => this.toast(message),
    });
    this.inventoryController = new InventoryController({
      elements: this.elements.inventory,
      inventory: this.inventory,
      speech: this.speech,
      notify: (message) => this.toast(message),
      onInventoryChange: () => this.updateRank(),
    });
  }

  collectElements() {
    return {
      sidebar: requireElement('#sidebar'),
      menuButton: requireElement('#menuBtn'),
      viewHeading: requireElement('#viewHeading'),
      viewSubheading: requireElement('#viewSubheading'),
      chapterNavWrap: requireElement('#chapterNavWrap'),
      voiceEnglish: requireElement('#voiceEn'),
      voiceChinese: requireElement('#voiceZh'),
      voiceStatus: requireElement('#voiceStatus'),
      xp: requireElement('#xp'),
      streak: requireElement('#streak'),
      hearts: requireElement('#hearts'),
      rankName: requireElement('#rankName'),
      rankFill: requireElement('#rankFill'),
      rankNext: requireElement('#rankNext'),
      toast: requireElement('#toast'),
      story: {
        chapterList: requireElement('#chapterList'),
        progressFill: requireElement('#progressFill'),
        sceneCount: requireElement('#sceneCount'),
        sceneVisual: requireElement('#sceneVisual'),
        sceneTitle: requireElement('#sceneTitle'),
        sceneContext: requireElement('#sceneContext'),
        modeTag: requireElement('#modeTag'),
        gameBody: requireElement('#gameBody'),
        gameFooter: requireElement('#gameFooter'),
        nextButton: requireElement('#nextBtn'),
        replayButton: requireElement('#replayBtn'),
        completeView: requireElement('#completeView'),
        completeText: requireElement('#completeText'),
        resultCorrect: requireElement('#resultCorrect'),
        resultXp: requireElement('#resultXp'),
        resultAccuracy: requireElement('#resultAccuracy'),
        restartButton: requireElement('#restartBtn'),
      },
      lookup: {
        input: requireElement('#lookupInput'),
        category: requireElement('#lookupCategory'),
        searchButton: requireElement('#lookupBtn'),
        summary: requireElement('#lookupSummary'),
        results: requireElement('#lookupResults'),
      },
      translation: {
        sourceLanguage: requireElement('#sourceLang'),
        input: requireElement('#translateInput'),
        output: requireElement('#translationOutput'),
        pinyin: requireElement('#translationPinyin'),
        quality: requireElement('#translationQuality'),
        targetLabel: requireElement('#targetLangLabel'),
        googleLink: requireElement('#googleTranslateLink'),
        translateButton: requireElement('#translateBtn'),
        swapButton: requireElement('#swapLangBtn'),
        speakSourceButton: requireElement('#speakSourceBtn'),
        speakTranslationButton: requireElement('#speakTranslationBtn'),
        addButton: requireElement('#addTranslationBtn'),
      },
      inventory: {
        navCount: requireElement('#inventoryNavCount'),
        form: requireElement('#inventoryForm'),
        english: requireElement('#invEn'),
        chinese: requireElement('#invZh'),
        pinyin: requireElement('#invPinyin'),
        category: requireElement('#invCategory'),
        type: requireElement('#invType'),
        search: requireElement('#inventorySearch'),
        statusFilter: requireElement('#inventoryStatusFilter'),
        reviewButton: requireElement('#reviewBtn'),
        list: requireElement('#inventoryList'),
        countNew: requireElement('#countNew'),
        countUnlearned: requireElement('#countUnlearned'),
        countReview: requireElement('#countReview'),
        countMastered: requireElement('#countMastered'),
        reviewBackdrop: requireElement('#reviewBackdrop'),
        closeReviewButton: requireElement('#closeReviewBtn'),
        reviewProgress: requireElement('#reviewProgress'),
        reviewEnglish: requireElement('#reviewEn'),
        reviewAnswer: requireElement('#reviewAnswer'),
        reviewChinese: requireElement('#reviewZh'),
        reviewPinyin: requireElement('#reviewPinyin'),
        reviewControls: requireElement('#reviewControls'),
      },
    };
  }

  initialize() {
    this.bindNavigation();
    this.speech.initialize();
    this.story.initialize();
    this.lookup.initialize();
    this.translation.initialize();
    this.inventoryController.initialize();
    this.updateStats(this.story.getStats());
    this.updateRank();
  }

  bindNavigation() {
    $$('.nav-btn').forEach((button) => {
      button.addEventListener('click', () => this.switchView(button.dataset.view));
    });
    this.elements.menuButton.addEventListener('click', () => this.elements.sidebar.classList.toggle('open'));
    document.addEventListener('click', (event) => {
      if (window.innerWidth <= 900
        && this.elements.sidebar.classList.contains('open')
        && !this.elements.sidebar.contains(event.target)
        && event.target !== this.elements.menuButton) {
        this.elements.sidebar.classList.remove('open');
      }
    });
  }

  switchView(view) {
    $$('.view').forEach((element) => element.classList.toggle('active', element.id === `${view}View`));
    $$('.nav-btn').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
    this.elements.chapterNavWrap.style.display = view === 'story' ? 'block' : 'none';
    this.elements.viewHeading.textContent = VIEW_META[view][0];
    this.elements.viewSubheading.textContent = VIEW_META[view][1];
    this.elements.sidebar.classList.remove('open');
    if (view === 'lookup') this.lookup.render();
    if (view === 'inventory') this.inventoryController.render();
  }

  updateStats(stats) {
    this.elements.xp.textContent = stats.xp;
    this.elements.streak.textContent = stats.streak;
    this.elements.hearts.textContent = stats.hearts;
    this.updateRank();
  }

  updateRank() {
    const rank = this.progress.getRank(this.inventory.getMasteredCount());
    this.elements.rankName.textContent = rank.name;
    this.elements.rankFill.style.width = `${rank.percent}%`;
    this.elements.rankNext.textContent = rank.next
      ? `${rank.score} / ${rank.next} điểm rank`
      : `${rank.score} điểm rank · Cấp cao nhất`;
  }

  toast(message) {
    this.elements.toast.textContent = message;
    this.elements.toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.elements.toast.classList.remove('show'), 1900);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  try {
    const app = new LinguaQuestApp();
    app.initialize();
  } catch (error) {
    console.error('Lingua Quest initialization failed:', error);
    const toast = $('#toast');
    if (toast) {
      toast.textContent = 'Không thể khởi tạo ứng dụng. Hãy kiểm tra Console.';
      toast.classList.add('show');
    }
  }
});
