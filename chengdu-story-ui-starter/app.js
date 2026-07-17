(function () {
  "use strict";

  const content = window.GAME_CONTENT;
  const STORAGE_KEY = "chengduStory.v1";

  const defaultState = {
    profile: null,
    pinyinVisible: true,
    mode: "study",
    speechRate: 0.9,
    sceneIndex: 0,
    selectedChoices: {},
    savedWords: [],
    started: false,
    activeView: "story"
  };

  let state = loadState();
  let activeDrawer = null;
  let toastTimer = null;

  function getChapterProgress() {
    const totalChoices = content.chapter.scenes.filter(scene => scene.choice).length;
    if (!totalChoices) return 100;
    const completedChoices = content.chapter.scenes.filter(scene => (
      scene.choice && state.selectedChoices[scene.choice.id]
    )).length;
    return Math.min(100, Math.round((completedChoices / totalChoices) * 100));
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return { ...defaultState, ...(parsed || {}) };
    } catch (error) {
      console.warn("Không đọc được dữ liệu cũ:", error);
      return { ...defaultState };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.info("Không thể lưu localStorage trong ngữ cảnh hiện tại:", error);
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function toast(message) {
    const node = document.getElementById("toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("show"), 1800);
  }

  function speak(text, rate = state.speechRate) {
    if (!text || !("speechSynthesis" in window)) {
      toast("Thiết bị không hỗ trợ giọng đọc trình duyệt.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = Number(rate) || 0.9;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => /zh-CN|Mandarin|Xiaoxiao|普通话/i.test(`${v.lang} ${v.name}`));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }

  function pinyin(text, className = "pinyin-line") {
    if (!state.pinyinVisible) return "";
    return `<div class="${className}">${escapeHtml(text)}</div>`;
  }

  function renderMessage(message) {
    const isSystem = message.type === "system";
    const className = `message ${escapeHtml(message.type || "incoming")}`;
    const audio = isSystem ? "" : `<button class="audio-button" data-speak="${escapeHtml(message.zh)}" aria-label="Nghe câu tiếng Trung">🔊</button>`;
    const speaker = message.speakerZh ? `<div class="speaker">${escapeHtml(message.speakerZh)}${state.pinyinVisible && message.speakerPinyin ? ` · ${escapeHtml(message.speakerPinyin)}` : ""}</div>` : "";
    return `
      <article class="${className}">
        ${speaker}
        <div class="message-row">
          <div>
            <div class="zh-line">${escapeHtml(message.zh)}</div>
            ${pinyin(message.pinyin)}
          </div>
          ${audio}
        </div>
      </article>
    `;
  }

  function getSceneMessages(scene) {
    const messages = [...scene.messages];
    const selected = scene.choice ? state.selectedChoices[scene.choice.id] : null;
    if (scene.choice && selected) {
      const selectedOption = scene.choice.options.find(option => option.id === selected);
      if (selectedOption) {
        messages.push({
          id: `player-${selectedOption.id}`,
          type: "outgoing",
          speakerZh: state.profile?.nameZh || "我",
          speakerPinyin: "Wǒ",
          zh: selectedOption.zh,
          pinyin: selectedOption.pinyin
        });
      }
      messages.push(...(scene.choice.reactions[selected] || []));
    }
    return messages;
  }

  function renderChoices(scene) {
    if (!scene.choice) return "";
    const selected = state.selectedChoices[scene.choice.id];
    const options = scene.choice.options.map((option, index) => {
      const isSelected = selected === option.id;
      const hiddenCopy = state.mode === "listening" && !selected;
      return `
        <div class="choice-button ${isSelected ? "selected" : ""}" data-choice="${escapeHtml(option.id)}" role="button" tabindex="${selected ? "-1" : "0"}" aria-disabled="${Boolean(selected)}">
          <span class="choice-number">${index + 1}</span>
          <span class="choice-copy">
            <span>
              <span class="zh-line">${hiddenCopy ? "点击右侧先听" : escapeHtml(option.zh)}</span>
              ${hiddenCopy ? "" : pinyin(option.pinyin)}
            </span>
            <span class="choice-actions">
              <button class="audio-button" type="button" data-speak="${escapeHtml(option.zh)}" aria-label="Nghe phương án">🔊</button>
            </span>
          </span>
        </div>
      `;
    }).join("");

    const canContinue = selected || !scene.choice;
    return `
      <section class="choice-panel" aria-label="Các lựa chọn trả lời">
        <div class="choice-heading">
          <strong>${escapeHtml(scene.choice.promptZh)}</strong>
          ${pinyin(scene.choice.promptPinyin)}
        </div>
        <div class="choice-list">${options}</div>
        ${canContinue ? `<div class="continue-wrap"><button class="primary-button" data-action="continue">继续 · Jìxù</button></div>` : ""}
      </section>
    `;
  }

  function renderProfile() {
    const nameVi = state.profile?.nameVi || "Người chơi";
    const nameZh = state.profile?.nameZh || "玩家";
    const progress = getChapterProgress();
    return `
      <aside class="left-rail">
        <div class="brand-mini">
          <div class="brand-copy">
            <div class="brand-title">${escapeHtml(content.meta.titleZh)}</div>
            <div class="brand-subtitle">${escapeHtml(content.meta.titlePinyin)}</div>
          </div>
          <button class="icon-button" data-action="open-menu" aria-label="Mở menu">☰</button>
        </div>
        <section class="card profile-card">
          <div class="profile-row">
            <div class="avatar" aria-hidden="true">👩🏻</div>
            <div>
              <div class="profile-name">${escapeHtml(nameVi)}</div>
              <div class="profile-meta">${escapeHtml(nameZh)} · Thành Đô<br>S01 · C01</div>
            </div>
          </div>
          <div class="progress-label"><span>Tiến độ chương</span><strong>${progress}%</strong></div>
          <div class="progress-track"><div class="progress-value" style="width:${progress}%"></div></div>
          <div class="stat-row">
            <div class="stat"><strong>⚡ 120</strong><span>Năng lượng</span></div>
            <div class="stat"><strong>❤ 8</strong><span>Tin tưởng</span></div>
            <div class="stat"><strong>★ 15</strong><span>Thành tích</span></div>
          </div>
        </section>
        <section class="card objective-card">
          <div class="card-title">Mục tiêu chương</div>
          <div class="objective-list">
            <div class="objective-item"><span class="objective-dot done"></span> Xem hội thoại</div>
            <div class="objective-item"><span class="objective-dot ${state.started ? "done" : ""}"></span> Xem từ đầu chương</div>
            <div class="objective-item"><span class="objective-dot ${Object.keys(state.selectedChoices).length ? "done" : ""}"></span> Chọn một phản hồi</div>
          </div>
        </section>
        <div class="left-bottom-nav">
          <button class="nav-button active" data-view="story"><span class="nav-icon">⌂</span> Cốt truyện</button>
          <button class="nav-button" data-action="open-relationships"><span class="nav-icon">♥</span> Quan hệ</button>
          <button class="nav-button" data-drawer="dictionary"><span class="nav-icon">⌕</span> Tra từ</button>
        </div>
      </aside>
    `;
  }

  function renderUtility() {
    const words = content.chapter.previewWords.map(word => {
      const entry = content.dictionary.find(item => item.zh === word);
      return `<button class="word-chip" data-word="${escapeHtml(word)}"><span class="zh">${escapeHtml(word)}</span><span class="py">${escapeHtml(entry?.pinyin || "")}</span></button>`;
    }).join("");

    const patterns = content.chapter.previewPatterns.slice(0, 3).map(item => `
      <div class="pattern-item"><div class="zh">${escapeHtml(item.zh)}</div>${state.pinyinVisible ? `<div class="py">${escapeHtml(item.pinyin)}</div>` : ""}</div>
    `).join("");

    return `
      <aside class="right-rail">
        <section class="card utility-card">
          <div class="card-title">Âm thanh</div>
          <div class="setting-row range-row">
            <span>🔊</span>
            <input type="range" min="0.6" max="1.2" step="0.1" value="${state.speechRate}" data-setting="speechRate" aria-label="Tốc độ giọng đọc" />
          </div>
          <div class="setting-row">
            <span>Pinyin</span>
            <button class="switch ${state.pinyinVisible ? "on" : ""}" data-action="toggle-pinyin" aria-pressed="${state.pinyinVisible}"></button>
          </div>
        </section>
        <section class="card utility-card">
          <div class="card-title">Chế độ</div>
          <div class="mode-grid">
            <button class="mode-card ${state.mode === "study" ? "active" : ""}" data-mode="study"><span class="mode-icon">📖</span><strong>Học thường</strong><small>Hiện chữ + Pinyin</small></button>
            <button class="mode-card ${state.mode === "listening" ? "active" : ""}" data-mode="listening"><span class="mode-icon">🎧</span><strong>Luyện nghe</strong><small>Nghe trước khi đọc</small></button>
          </div>
        </section>
        <section class="card utility-card">
          <div class="setting-row"><div class="card-title">Từ trong chương</div><button class="small-button" data-drawer="dictionary">Xem tất cả</button></div>
          <div class="word-chips">${words}</div>
          <button class="saved-words-shortcut" data-action="open-saved-words">★ Từ đã lưu <strong>${state.savedWords.length}</strong></button>
        </section>
        <section class="card utility-card">
          <div class="setting-row"><div class="card-title">Mẫu câu</div><button class="small-button" data-action="open-prep">Xem tất cả</button></div>
          <div class="pattern-list">${patterns}</div>
        </section>
        <button class="secondary-button" data-action="reset-progress">Đặt lại tiến độ</button>
      </aside>
    `;
  }

  function renderMobileHeader(scene) {
    return `
      <header class="mobile-header">
        <button class="icon-button" data-action="previous-scene" aria-label="Cảnh trước">‹</button>
        <div class="mobile-title">
          <strong>${escapeHtml(content.chapter.titleVi)}</strong>
          <span>${escapeHtml(scene.titleZh)} · ${state.pinyinVisible ? escapeHtml(scene.titlePinyin) : ""}</span>
        </div>
        <button class="icon-button mobile-profile-button" data-action="open-menu" aria-label="Tổng quan người chơi">👩🏻</button>
      </header>
    `;
  }

  function renderMain() {
    const scene = content.chapter.scenes[state.sceneIndex] || content.chapter.scenes[0];
    const messages = getSceneMessages(scene).map(renderMessage).join("");
    return `
      <main class="main-column">
        ${renderMobileHeader(scene)}
        <header class="topbar">
          <div class="topbar-title">
            <h1>${escapeHtml(content.chapter.titleVi)}</h1>
            <p>${escapeHtml(scene.titleZh)} · ${state.pinyinVisible ? escapeHtml(scene.titlePinyin) : ""}</p>
          </div>
          <div class="topbar-actions">
            <button class="text-button" data-action="open-prep">📖 Từ đầu chương</button>
            <button class="text-button" data-action="open-settings">⚙ Cài đặt</button>
          </div>
        </header>
        <section class="story-stage ${scene.choice ? "has-choice" : ""}">
          <div class="stage-overlay">
            <div class="scene-label">${escapeHtml(scene.titleZh)}${state.pinyinVisible ? ` · ${escapeHtml(scene.titlePinyin)}` : ""}</div>
            <div class="chat-feed">${messages}</div>
            ${renderChoices(scene)}
          </div>
        </section>
        <nav class="mobile-nav" aria-label="Điều hướng chính">
          <button class="nav-button active" data-view="story"><span class="nav-icon">⌂</span><span>Cốt truyện</span></button>
          <button class="nav-button" data-action="open-relationships"><span class="nav-icon">♥</span><span>Quan hệ</span></button>
          <button class="nav-button" data-drawer="dictionary"><span class="nav-icon">⌕</span><span>Tra từ</span></button>
          <button class="nav-button" data-action="open-settings"><span class="nav-icon">⚙</span><span>Cài đặt</span></button>
        </nav>
      </main>
    `;
  }

  function renderApp() {
    const app = document.getElementById("app");
    app.innerHTML = `<div class="app-shell">${renderProfile()}${renderMain()}${renderUtility()}</div>`;
    bindEvents();
    if (!state.profile) openOnboarding();
  }

  function bindEvents() {
    document.querySelectorAll("[data-speak]").forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();
        speak(button.dataset.speak);
      });
    });

    document.querySelectorAll("[data-choice]").forEach(button => {
      const activate = event => {
        if (event.target.closest("[data-speak]")) return;
        selectChoice(button.dataset.choice);
      };
      button.addEventListener("click", activate);
      button.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate(event);
        }
      });
    });

    document.querySelectorAll("[data-action]").forEach(button => {
      button.addEventListener("click", () => handleAction(button.dataset.action));
    });

    document.querySelectorAll("[data-mode]").forEach(button => {
      button.addEventListener("click", () => {
        state.mode = button.dataset.mode;
        saveState();
        renderApp();
      });
    });

    document.querySelectorAll("[data-drawer]").forEach(button => {
      button.addEventListener("click", () => openDictionary());
    });

    document.querySelectorAll("[data-word]").forEach(button => {
      button.addEventListener("click", () => openDictionary(button.dataset.word));
    });

    document.querySelectorAll("[data-setting='speechRate']").forEach(input => {
      input.addEventListener("input", () => {
        state.speechRate = Number(input.value);
        saveState();
      });
    });
  }

  function handleAction(action) {
    switch (action) {
      case "toggle-pinyin":
        state.pinyinVisible = !state.pinyinVisible;
        saveState();
        renderApp();
        break;
      case "continue":
        continueScene();
        break;
      case "previous-scene":
        toast("Không thể quay lại lựa chọn đã chốt.");
        break;
      case "open-settings":
        openSettings();
        break;
      case "open-prep":
        openPrep();
        break;
      case "open-saved-words":
        openSavedWords();
        break;
      case "open-relationships":
        openRelationships();
        break;
      case "reset-progress":
        resetProgress();
        break;
      case "open-menu":
        openMenu();
        break;
      default:
        break;
    }
  }

  function selectChoice(optionId) {
    const scene = content.chapter.scenes[state.sceneIndex];
    if (!scene.choice || state.selectedChoices[scene.choice.id]) return;
    const option = scene.choice.options.find(item => item.id === optionId);
    if (!option) return;
    state.selectedChoices[scene.choice.id] = optionId;
    saveState();
    renderApp();
    toast("Lựa chọn đã được lưu và không thể quay lại.");
    setTimeout(() => document.querySelector(".chat-feed")?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
  }

  function continueScene() {
    if (state.sceneIndex < content.chapter.scenes.length - 1) {
      state.sceneIndex += 1;
      saveState();
      renderApp();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast("Bạn đã hoàn thành Chương 1.");
    }
  }

  function resetProgress() {
    const keepProfile = state.profile;
    state = { ...defaultState, profile: keepProfile };
    saveState();
    closeOverlay();
    renderApp();
    toast("Đã đặt lại tiến độ chương.");
  }

  function closeOverlay() {
    document.querySelectorAll(".drawer-backdrop,.modal-backdrop").forEach(node => node.remove());
    activeDrawer = null;
  }

  function overlayTemplate(inner, type = "modal") {
    const backdrop = document.createElement("div");
    backdrop.className = type === "drawer" ? "drawer-backdrop" : "modal-backdrop";
    backdrop.innerHTML = inner;
    backdrop.addEventListener("click", event => {
      if (event.target === backdrop) closeOverlay();
    });
    document.body.appendChild(backdrop);
    return backdrop;
  }

  function openOnboarding() {
    closeOverlay();
    const node = overlayTemplate(`
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
        <h2 id="onboarding-title">Bắt đầu câu chuyện</h2>
        <p>Tên nhân vật của bạn sẽ được lưu trên thiết bị này.</p>
        <form id="profile-form" class="form-grid">
          <div class="form-field">
            <label for="name-vi">Tên tiếng Việt</label>
            <input id="name-vi" name="nameVi" autocomplete="name" placeholder="Ví dụ: Linh" required maxlength="30" />
          </div>
          <div class="form-field">
            <label for="name-zh">Tên tiếng Trung</label>
            <input id="name-zh" name="nameZh" placeholder="2–4 chữ Hán" required maxlength="4" />
            <div class="form-help">Ví dụ: 林安</div>
            <div id="name-error" class="error-text hidden">Tên tiếng Trung phải gồm 2–4 chữ Hán.</div>
          </div>
          <button class="primary-button" type="submit">继续 · Jìxù</button>
        </form>
      </section>
    `);

    node.querySelector("#profile-form").addEventListener("submit", event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const nameVi = String(form.get("nameVi") || "").trim();
      const nameZh = String(form.get("nameZh") || "").trim();
      const validZh = /^[\u3400-\u9fff]{2,4}$/.test(nameZh);
      node.querySelector("#name-error").classList.toggle("hidden", validZh);
      if (!nameVi || !validZh) return;
      state.profile = { nameVi, nameZh };
      saveState();
      closeOverlay();
      renderApp();
      openPrep();
    });
  }

  function openPrep() {
    closeOverlay();
    const words = content.chapter.previewWords.map(word => {
      const entry = content.dictionary.find(item => item.zh === word);
      return `
        <div class="prep-card">
          <div class="zh">${escapeHtml(word)}</div>
          <div class="py">${escapeHtml(entry?.pinyin || "")}</div>
          <button class="small-button" data-prep-speak="${escapeHtml(word)}">🔊</button>
        </div>
      `;
    }).join("");
    const patterns = content.chapter.previewPatterns.map(item => `
      <div class="dictionary-item">
        <div class="dictionary-zh">${escapeHtml(item.zh)}</div>
        <div class="dictionary-py">${escapeHtml(item.pinyin)}</div>
        <div class="dictionary-actions"><button class="small-button" data-prep-speak="${escapeHtml(item.zh)}">🔊 Nghe</button></div>
      </div>
    `).join("");

    const node = overlayTemplate(`
      <section class="modal" role="dialog" aria-modal="true">
        <div class="drawer-header">
          <div>
            <h2>今日词语 · Jīnrì cíyǔ</h2>
            <p>Phần hỗ trợ có thể dùng tiếng Việt; hội thoại trong truyện không hiển thị tiếng Việt.</p>
          </div>
          <button class="icon-button" data-close aria-label="Đóng">×</button>
        </div>
        <div class="prep-grid">${words}</div>
        <div class="section-heading">今日句型 · Jīnrì jùxíng</div>
        <div class="dictionary-list" style="margin-top:12px">${patterns}</div>
        <div style="margin-top:18px"><button class="primary-button" id="start-story">开始 · Kāishǐ</button></div>
      </section>
    `);
    node.querySelector("[data-close]").addEventListener("click", closeOverlay);
    node.querySelectorAll("[data-prep-speak]").forEach(button => button.addEventListener("click", () => speak(button.dataset.prepSpeak)));
    node.querySelector("#start-story").addEventListener("click", () => {
      state.started = true;
      saveState();
      closeOverlay();
      renderApp();
    });
  }

  function openDictionary(initialQuery = "") {
    closeOverlay();
    activeDrawer = "dictionary";
    const node = overlayTemplate(`
      <aside class="drawer" role="dialog" aria-modal="true" aria-label="Dịch Trung Việt">
        <div class="drawer-header"><div><h2>Dịch Trung ↔ Việt</h2><div class="translator-subtitle">Tra từ hoặc dịch cả câu</div></div><button class="icon-button" data-close aria-label="Đóng">×</button></div>
        <form id="translator-form" class="translator-form">
          <div class="translator-direction"><span id="translator-source">Tự nhận diện</span><span aria-hidden="true">→</span><strong id="translator-target">Tiếng Việt</strong></div>
          <textarea class="translator-input" id="translator-input" rows="5" maxlength="1000" placeholder="Nhập tiếng Trung, Pinyin hoặc tiếng Việt…">${escapeHtml(initialQuery)}</textarea>
          <div class="translator-actions">
            <span id="translator-count">${String(initialQuery).length}/1000</span>
            <button class="primary-button translator-submit" type="submit">Dịch</button>
          </div>
        </form>
        <section id="translator-result" class="translator-result hidden" aria-live="polite"></section>
        <div id="translator-status" class="translator-status">Chrome desktop có thể dịch ngay trên thiết bị.</div>
        <button class="dictionary-saved-shortcut" id="open-saved-words">★ Ôn từ đã lưu <strong id="translator-saved-count">${state.savedWords.length}</strong></button>
        <div class="dictionary-section-title">Gợi ý từ liên quan</div>
        <div id="dictionary-results" class="dictionary-list"></div>
      </aside>
    `, "drawer");

    const form = node.querySelector("#translator-form");
    const search = node.querySelector("#translator-input");
    const results = node.querySelector("#dictionary-results");
    const result = node.querySelector("#translator-result");
    const status = node.querySelector("#translator-status");
    const sourceLabel = node.querySelector("#translator-source");
    const targetLabel = node.querySelector("#translator-target");
    const count = node.querySelector("#translator-count");
    const submit = node.querySelector(".translator-submit");
    const savedCount = node.querySelector("#translator-saved-count");

    const findMatches = query => {
      const normalized = query.trim().toLowerCase();
      if (!normalized) return content.dictionary.slice(0, 6);
      return content.dictionary.filter(item => `${item.zh} ${item.pinyin} ${item.vi}`.toLowerCase().includes(normalized)).slice(0, 8);
    };

    const getDirection = query => {
      const normalized = query.trim().toLowerCase();
      const matchesPinyin = content.dictionary.some(item => item.pinyin.toLowerCase() === normalized);
      const sourceLanguage = /[\u3400-\u9fff]/.test(query) || matchesPinyin ? "zh" : "vi";
      return {
        sourceLanguage,
        targetLanguage: sourceLanguage === "zh" ? "vi" : "zh",
        sourceName: sourceLanguage === "zh" ? "Tiếng Trung" : "Tiếng Việt",
        targetName: sourceLanguage === "zh" ? "Tiếng Việt" : "Tiếng Trung"
      };
    };

    const localTranslation = (query, direction) => {
      const normalized = query.trim().toLowerCase();
      const matches = content.dictionary.filter(item => direction.sourceLanguage === "zh"
        ? item.zh === query.trim() || item.pinyin.toLowerCase() === normalized
        : item.vi.toLowerCase().includes(normalized));
      if (!matches.length) return "";
      return direction.sourceLanguage === "zh"
        ? matches.map(item => item.vi).join("; ")
        : [...new Set(matches.map(item => item.zh))].join("、");
    };

    const showTranslation = (translated, direction, note = "") => {
      result.classList.remove("hidden");
      result.innerHTML = `
        <div class="translator-result-label">${escapeHtml(direction.targetName)}</div>
        <div class="translator-result-text">${escapeHtml(translated)}</div>
        ${note ? `<div class="translator-result-note">${escapeHtml(note)}</div>` : ""}
        ${direction.targetLanguage === "zh" ? `<button class="small-button" data-result-speak="${escapeHtml(translated)}">🔊 Nghe</button>` : ""}
      `;
      result.querySelector("[data-result-speak]")?.addEventListener("click", event => speak(event.currentTarget.dataset.resultSpeak));
    };

    const drawResults = () => {
      const query = search.value.trim();
      const direction = getDirection(query);
      sourceLabel.textContent = query ? direction.sourceName : "Tự nhận diện";
      targetLabel.textContent = direction.targetName;
      count.textContent = `${search.value.length}/1000`;
      const items = findMatches(query);
      const preview = query ? localTranslation(query, direction) : "";
      if (preview) showTranslation(preview, direction, "Kết quả từ từ điển cục bộ");
      else result.classList.add("hidden");
      results.innerHTML = items.length ? items.map(item => {
        const saved = state.savedWords.includes(item.id);
        return `
          <article class="dictionary-item">
            <div class="dictionary-top">
              <div><div class="dictionary-zh">${escapeHtml(item.zh)}</div><div class="dictionary-py">${escapeHtml(item.pinyin)}</div></div>
              <button class="audio-button" data-dict-speak="${escapeHtml(item.zh)}">🔊</button>
            </div>
            <div class="dictionary-vi">${escapeHtml(item.vi)}</div>
            <div class="form-help">${escapeHtml(item.type)}</div>
            <div class="dictionary-example"><div>${escapeHtml(item.exampleZh)}</div><div class="dictionary-py">${escapeHtml(item.examplePinyin)}</div></div>
            <div class="dictionary-actions"><button class="small-button ${saved ? "active" : ""}" data-save-word="${escapeHtml(item.id)}">${saved ? "✓ Đã lưu" : "+ Lưu từ"}</button></div>
          </article>
        `;
      }).join("") : `<div class="dictionary-empty">Không có gợi ý cục bộ. Bạn vẫn có thể bấm Dịch để dịch cả câu.</div>`;

      results.querySelectorAll("[data-dict-speak]").forEach(button => button.addEventListener("click", () => speak(button.dataset.dictSpeak)));
      results.querySelectorAll("[data-save-word]").forEach(button => button.addEventListener("click", () => {
        const id = button.dataset.saveWord;
        state.savedWords = state.savedWords.includes(id) ? state.savedWords.filter(value => value !== id) : [...state.savedWords, id];
        saveState();
        savedCount.textContent = state.savedWords.length;
        drawResults();
      }));
    };

    const translate = async () => {
      const query = search.value.trim();
      if (!query) {
        search.focus();
        return;
      }
      const direction = getDirection(query);
      const fallback = localTranslation(query, direction);
      submit.disabled = true;
      submit.textContent = "Đang dịch…";
      status.textContent = "Đang chuẩn bị bộ dịch trên thiết bị…";

      try {
        if (!("Translator" in self)) throw new Error("translator-unavailable");
        const availability = await self.Translator.availability({
          sourceLanguage: direction.sourceLanguage,
          targetLanguage: direction.targetLanguage
        });
        if (availability === "unavailable") throw new Error("language-pair-unavailable");
        if (availability !== "available") status.textContent = "Đang tải gói ngôn ngữ lần đầu…";
        const translator = await self.Translator.create({
          sourceLanguage: direction.sourceLanguage,
          targetLanguage: direction.targetLanguage,
          monitor(monitor) {
            monitor.addEventListener("downloadprogress", event => {
              status.textContent = `Đang tải gói ngôn ngữ ${Math.round(event.loaded * 100)}%…`;
            });
          }
        });
        const translated = await translator.translate(query);
        translator.destroy?.();
        showTranslation(translated, direction, "Dịch ngay trên thiết bị");
        status.textContent = "Nội dung không được gửi lên máy chủ.";
      } catch (error) {
        if (fallback) {
          showTranslation(fallback, direction, "Kết quả từ từ điển cục bộ");
          status.textContent = "Trình duyệt này chưa hỗ trợ dịch câu ngoại tuyến.";
        } else {
          result.classList.remove("hidden");
          result.innerHTML = `<div class="dictionary-empty">Thiết bị này chưa hỗ trợ dịch câu Trung ↔ Việt. Hãy dùng Chrome desktop mới nhất hoặc tra một từ có trong gợi ý.</div>`;
          status.textContent = "Không có bản dịch cục bộ phù hợp.";
        }
      } finally {
        submit.disabled = false;
        submit.textContent = "Dịch";
      }
    };

    node.querySelector("[data-close]").addEventListener("click", closeOverlay);
    node.querySelector("#open-saved-words").addEventListener("click", openSavedWords);
    search.addEventListener("input", drawResults);
    form.addEventListener("submit", event => {
      event.preventDefault();
      translate();
    });
    drawResults();
    setTimeout(() => search.focus(), 40);
  }

  function openSavedWords() {
    closeOverlay();
    activeDrawer = "saved-words";
    const node = overlayTemplate(`
      <aside class="drawer" role="dialog" aria-modal="true" aria-label="Từ đã lưu">
        <div class="drawer-header"><div><h2>Từ đã lưu</h2><div class="translator-subtitle">Ẩn nghĩa, tự nhớ rồi kiểm tra lại</div></div><button class="icon-button" data-close aria-label="Đóng">×</button></div>
        <div id="saved-words-summary" class="saved-words-summary"></div>
        <div id="saved-words-list" class="saved-words-list"></div>
      </aside>
    `, "drawer");
    const summary = node.querySelector("#saved-words-summary");
    const list = node.querySelector("#saved-words-list");

    const drawSavedWords = () => {
      const savedItems = state.savedWords.map(id => content.dictionary.find(item => item.id === id)).filter(Boolean);
      summary.innerHTML = `<strong>${savedItems.length}</strong><span>từ đang chờ ôn</span>`;
      list.innerHTML = savedItems.length ? savedItems.map((item, index) => `
        <article class="saved-word-card">
          <div class="saved-word-number">${index + 1}/${savedItems.length}</div>
          <div class="dictionary-top">
            <div><div class="dictionary-zh">${escapeHtml(item.zh)}</div><div class="dictionary-py">${escapeHtml(item.pinyin)}</div></div>
            <button class="audio-button" data-saved-speak="${escapeHtml(item.zh)}" aria-label="Nghe ${escapeHtml(item.zh)}">🔊</button>
          </div>
          <div class="saved-review-answer hidden" id="saved-answer-${escapeHtml(item.id)}">
            <div class="dictionary-vi">${escapeHtml(item.vi)}</div>
            <div class="form-help">${escapeHtml(item.type)}</div>
            <div class="dictionary-example"><div>${escapeHtml(item.exampleZh)}</div><div class="dictionary-py">${escapeHtml(item.examplePinyin)}</div></div>
          </div>
          <div class="saved-word-actions">
            <button class="small-button" data-reveal-saved="${escapeHtml(item.id)}" aria-expanded="false">Xem nghĩa</button>
            <button class="small-button saved-remove-button" data-remove-saved="${escapeHtml(item.id)}">Bỏ lưu</button>
          </div>
        </article>
      `).join("") : `
        <div class="saved-empty-state">
          <div class="saved-empty-icon">☆</div>
          <strong>Chưa có từ nào được lưu</strong>
          <p>Tra một từ rồi bấm “Lưu từ” để tạo danh sách ôn tập.</p>
          <button class="primary-button" data-find-words>Tra từ ngay</button>
        </div>
      `;

      list.querySelectorAll("[data-saved-speak]").forEach(button => button.addEventListener("click", () => speak(button.dataset.savedSpeak)));
      list.querySelectorAll("[data-reveal-saved]").forEach(button => button.addEventListener("click", () => {
        const answer = list.querySelector(`#saved-answer-${button.dataset.revealSaved}`);
        const willShow = answer.classList.contains("hidden");
        answer.classList.toggle("hidden", !willShow);
        button.textContent = willShow ? "Ẩn nghĩa" : "Xem nghĩa";
        button.setAttribute("aria-expanded", String(willShow));
      }));
      list.querySelectorAll("[data-remove-saved]").forEach(button => button.addEventListener("click", () => {
        state.savedWords = state.savedWords.filter(id => id !== button.dataset.removeSaved);
        saveState();
        drawSavedWords();
      }));
      list.querySelector("[data-find-words]")?.addEventListener("click", () => openDictionary());
    };

    node.querySelector("[data-close]").addEventListener("click", () => {
      closeOverlay();
      renderApp();
    });
    drawSavedWords();
  }

  function openRelationships() {
    closeOverlay();
    const npcs = content.relationships || [];
    const hasMetNpc = npc => Boolean(
      npc.unlockOnStart || (npc.unlockChoiceId && state.selectedChoices[npc.unlockChoiceId])
    );
    const effectsForNpc = npc => content.chapter.scenes.reduce((total, scene) => {
      if (!scene.choice || scene.relationshipNpcId !== npc.id) return total;
      const selectedId = state.selectedChoices[scene.choice.id];
      const selected = scene.choice.options.find(option => option.id === selectedId);
      return {
        trust: total.trust + Number(selected?.effect?.trust || 0),
        calm: total.calm + Number(selected?.effect?.calm || 0)
      };
    }, { trust: 0, calm: 0 });
    const unlockedCount = npcs.filter(hasMetNpc).length;
    const cards = npcs.map(npc => {
      if (!hasMetNpc(npc)) {
        return `
          <article class="npc-card locked" aria-label="Nhân vật chưa gặp, đang khóa">
            <div class="npc-avatar locked-avatar">?</div>
            <div class="npc-locked-copy"><strong>Nhân vật chưa gặp</strong><span>Tiếp tục cốt truyện để mở khóa</span></div>
            <div class="npc-lock" aria-hidden="true">🔒</div>
          </article>
        `;
      }
      const relationshipEffects = effectsForNpc(npc);
      const trust = Number(npc.baseTrust || 0) + relationshipEffects.trust;
      const calm = Number(npc.baseCalm || 0) + relationshipEffects.calm;
      const relevantScenes = content.chapter.scenes.filter(scene => scene.relationshipNpcId === npc.id);
      const completedInteractions = relevantScenes.filter(scene => (
        scene.choice && state.selectedChoices[scene.choice.id]
      )).length;
      const interactions = 1 + completedInteractions;
      const relationLabel = trust >= 4 ? "Tin cậy" : trust >= 1 ? "Đang cởi mở" : trust < 0 ? "Căng thẳng" : "Mới liên lạc";
      const replied = completedInteractions > 0;
      return `
        <article class="npc-card unlocked">
          <div class="npc-card-header">
            <div class="npc-avatar">${escapeHtml(npc.avatar)}</div>
            <div class="npc-identity"><strong>${escapeHtml(npc.nameVi)}</strong><span>${escapeHtml(npc.nameZh)} · ${escapeHtml(npc.pinyin)}</span><small>${escapeHtml(npc.roleVi || "NPC")}</small></div>
            <div class="npc-status">${escapeHtml(relationLabel)}</div>
          </div>
          <div class="relationship-indices" aria-label="Các chỉ số quan hệ">
            <div class="relationship-index"><strong>${trust}</strong><span>Tin tưởng</span></div>
            <div class="relationship-index"><strong>${calm}</strong><span>Thoải mái</span></div>
            <div class="relationship-index"><strong>${interactions}</strong><span>Tương tác</span></div>
          </div>
          <div class="relationship-history">
            <div class="card-title">Tương tác đã ghi nhận</div>
            <div class="relationship-event done"><span>✓</span><div><strong>Lần đầu liên lạc</strong><small>${escapeHtml(npc.firstInteraction || "Đã xuất hiện trong cốt truyện")}</small></div></div>
            <div class="relationship-event ${replied ? "done" : "pending"}"><span>${replied ? "✓" : "○"}</span><div><strong>Phản hồi tin nhắn</strong><small>${replied ? "Lựa chọn của bạn đã ảnh hưởng mối quan hệ" : "Chọn một câu trả lời để cập nhật"}</small></div></div>
            ${state.sceneIndex >= 9 ? `<div class="relationship-event done"><span>✓</span><div><strong>Nhận thông tin thuê nhà</strong><small>Thanh Hà đã gửi ba nguồn phòng vào sáng hôm sau</small></div></div>` : ""}
          </div>
        </article>
      `;
    }).join("");

    const node = overlayTemplate(`
      <aside class="drawer relationships-drawer" role="dialog" aria-modal="true" aria-label="Mối quan hệ">
        <div class="drawer-header"><div><h2>Mối quan hệ</h2><div class="translator-subtitle">Theo dõi chỉ số và lịch sử tương tác với NPC</div></div><button class="icon-button" data-close aria-label="Đóng">×</button></div>
        <div class="relationship-summary"><strong>${unlockedCount}/${npcs.length}</strong><span>NPC đã gặp</span></div>
        <div class="npc-list">${cards}</div>
      </aside>
    `, "drawer");
    node.querySelector("[data-close]").addEventListener("click", closeOverlay);
  }

  function openSettings() {
    closeOverlay();
    const node = overlayTemplate(`
      <section class="modal" role="dialog" aria-modal="true">
        <div class="drawer-header"><h2>Cài đặt</h2><button class="icon-button" data-close aria-label="Đóng">×</button></div>
        <div class="form-grid">
          <div class="setting-row"><span>Hiển thị Pinyin</span><button id="modal-pinyin" class="switch ${state.pinyinVisible ? "on" : ""}"></button></div>
          <div class="form-field"><label for="modal-rate">Tốc độ giọng đọc</label><input id="modal-rate" type="range" min="0.6" max="1.2" step="0.1" value="${state.speechRate}" /></div>
          <div class="form-field"><label>Chế độ câu trả lời</label>
            <div class="mode-grid">
              <button class="mode-card ${state.mode === "study" ? "active" : ""}" data-modal-mode="study"><span class="mode-icon">📖</span><strong>Học thường</strong></button>
              <button class="mode-card ${state.mode === "listening" ? "active" : ""}" data-modal-mode="listening"><span class="mode-icon">🎧</span><strong>Luyện nghe</strong></button>
            </div>
          </div>
          <button class="secondary-button" id="modal-reset">Đặt lại tiến độ chương</button>
        </div>
      </section>
    `);
    node.querySelector("[data-close]").addEventListener("click", closeOverlay);
    node.querySelector("#modal-pinyin").addEventListener("click", event => {
      state.pinyinVisible = !state.pinyinVisible;
      event.currentTarget.classList.toggle("on", state.pinyinVisible);
      saveState();
    });
    node.querySelector("#modal-rate").addEventListener("input", event => {
      state.speechRate = Number(event.currentTarget.value);
      saveState();
    });
    node.querySelectorAll("[data-modal-mode]").forEach(button => button.addEventListener("click", () => {
      state.mode = button.dataset.modalMode;
      saveState();
      closeOverlay();
      renderApp();
    }));
    node.querySelector("#modal-reset").addEventListener("click", resetProgress);
  }

  function openMenu() {
    closeOverlay();
    const nameVi = state.profile?.nameVi || "Người chơi";
    const nameZh = state.profile?.nameZh || "玩家";
    const progress = getChapterProgress();
    const node = overlayTemplate(`
      <section class="modal overview-modal" role="dialog" aria-modal="true" aria-labelledby="overview-title">
        <div class="drawer-header"><h2 id="overview-title">Tổng quan người chơi</h2><button class="icon-button" data-close aria-label="Đóng">×</button></div>
        <div class="overview-profile">
          <div class="avatar overview-avatar" aria-hidden="true">👩🏻</div>
          <div><div class="overview-name">${escapeHtml(nameVi)}</div><div class="overview-meta">${escapeHtml(nameZh)} · Thành Đô<br>S01 · C01</div></div>
        </div>
        <div class="progress-label"><span>Tiến độ chương</span><strong>${progress}%</strong></div>
        <div class="progress-track"><div class="progress-value" style="width:${progress}%"></div></div>
        <div class="stat-row overview-stats">
          <div class="stat"><strong>⚡ 120</strong><span>Năng lượng</span></div>
          <div class="stat"><strong>❤ 8</strong><span>Tin tưởng</span></div>
          <div class="stat"><strong>★ 15</strong><span>Thành tích</span></div>
        </div>
        <div class="overview-section">
          <div class="card-title">Mục tiêu chương</div>
          <div class="objective-list">
            <div class="objective-item"><span class="objective-dot done"></span> Xem hội thoại</div>
            <div class="objective-item"><span class="objective-dot ${state.started ? "done" : ""}"></span> Xem từ đầu chương</div>
            <div class="objective-item"><span class="objective-dot ${Object.keys(state.selectedChoices).length ? "done" : ""}"></span> Chọn một phản hồi</div>
          </div>
        </div>
        <div class="overview-section">
          <div class="card-title">Truy cập nhanh</div>
          <div class="overview-actions">
            <button class="secondary-button" data-menu-prep>📖 Từ vựng & mẫu câu</button>
            <button class="secondary-button" data-menu-dictionary>⌕ Dịch Trung ↔ Việt</button>
            <button class="secondary-button" data-menu-saved>★ Từ đã lưu (${state.savedWords.length})</button>
            <button class="secondary-button" data-menu-relationships>♥ Mối quan hệ</button>
            <button class="secondary-button" data-menu-settings>⚙ Cài đặt học</button>
          </div>
        </div>
        <div class="overview-build-info"><strong>${escapeHtml(content.meta.titleZh)}</strong></div>
      </section>
    `);
    node.querySelector("[data-close]").addEventListener("click", closeOverlay);
    node.querySelector("[data-menu-prep]").addEventListener("click", openPrep);
    node.querySelector("[data-menu-dictionary]").addEventListener("click", () => openDictionary());
    node.querySelector("[data-menu-saved]").addEventListener("click", openSavedWords);
    node.querySelector("[data-menu-relationships]").addEventListener("click", openRelationships);
    node.querySelector("[data-menu-settings]").addEventListener("click", openSettings);
  }

  window.addEventListener("DOMContentLoaded", () => {
    renderApp();
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("./sw.js").catch(error => console.info("Service Worker chưa hoạt động:", error));
    }
  });
})();
