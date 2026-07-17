/* Dữ liệu tài khoản và tiến trình cục bộ cho bản chạy trên GitHub Pages. */
(function () {
  "use strict";

  const ACCOUNT_KEY = "chengduStory.accounts.v1";
  const CURRENT_PLAYER_KEY = "chengduStory.currentPlayer.v1";
  const LOG_PREFIX = "chengduStory.log.";
  const LOG_SUFFIX = ".v1";

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch (error) {
      console.info("Không đọc được dữ liệu người chơi:", error);
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function readAccounts() {
    const data = readJson(ACCOUNT_KEY, { schemaVersion: 1, accounts: [] });
    return Array.isArray(data.accounts) ? data : { schemaVersion: 1, accounts: [] };
  }

  function generatePlayerId() {
    const time = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `P-${time}-${random}`;
  }

  function ensureAccount(profile, preferredId) {
    const file = readAccounts();
    const currentId = preferredId || null;
    let account = file.accounts.find(item => item.id === currentId);
    const timestamp = new Date().toISOString();

    if (!account) {
      account = {
        id: preferredId || generatePlayerId(),
        profile: { nameVi: profile.nameVi, nameZh: profile.nameZh },
        createdAt: timestamp,
        lastPlayedAt: timestamp
      };
      file.accounts.push(account);
    } else {
      account.profile = { nameVi: profile.nameVi, nameZh: profile.nameZh };
      account.lastPlayedAt = timestamp;
    }

    writeJson(ACCOUNT_KEY, file);
    localStorage.setItem(CURRENT_PLAYER_KEY, account.id);
    window.ACCOUNT_FILE = file;
    return account;
  }

  function logKey(playerId) {
    return `${LOG_PREFIX}${playerId}${LOG_SUFFIX}`;
  }

  function progressSnapshot(state) {
    return {
      profile: state.profile,
      pinyinVisible: state.pinyinVisible,
      mode: state.mode,
      speechRate: state.speechRate,
      sceneIndex: state.sceneIndex,
      selectedChoices: state.selectedChoices,
      savedWords: state.savedWords,
      started: state.started,
      activeView: state.activeView
    };
  }

  function saveProgress(playerId, state) {
    if (!playerId) return null;
    const timestamp = new Date().toISOString();
    const existing = readJson(logKey(playerId), {
      schemaVersion: 1,
      playerId,
      chapterId: "S01-C01",
      createdAt: timestamp,
      updatedAt: timestamp,
      progress: {},
      history: []
    });
    const progress = progressSnapshot(state);
    const marker = `${progress.sceneIndex}:${Object.keys(progress.selectedChoices || {}).length}:${(progress.savedWords || []).length}`;
    const lastEvent = existing.history[existing.history.length - 1];

    existing.updatedAt = timestamp;
    existing.progress = progress;
    if (!lastEvent || lastEvent.marker !== marker) {
      existing.history.push({
        at: timestamp,
        marker,
        sceneIndex: progress.sceneIndex,
        choicesCompleted: Object.keys(progress.selectedChoices || {}).length,
        savedWords: (progress.savedWords || []).length
      });
      existing.history = existing.history.slice(-100);
    }
    writeJson(logKey(playerId), existing);
    return existing;
  }

  function loadProgress(playerId) {
    const log = readJson(logKey(playerId), null);
    return log?.progress || null;
  }

  function exportProgress(playerId) {
    const log = readJson(logKey(playerId), null);
    if (!log) return false;
    const source = `window.PLAYER_PROGRESS_LOG = ${JSON.stringify(log, null, 2)};\n`;
    const url = URL.createObjectURL(new Blob([source], { type: "text/javascript;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `Log_${playerId}.js`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return true;
  }

  window.ACCOUNT_FILE = readAccounts();
  window.PLAYER_DATA_STORE = {
    ensureAccount,
    saveProgress,
    loadProgress,
    exportProgress,
    getCurrentPlayerId: () => localStorage.getItem(CURRENT_PLAYER_KEY)
  };
})();
