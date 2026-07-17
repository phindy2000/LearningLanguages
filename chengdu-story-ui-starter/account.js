/* Tài khoản và tiến trình cục bộ cho bản game một người chơi. */
(function () {
  "use strict";

  const ACCOUNT_KEY = "chengduStory.accounts.v2";
  const LEGACY_ACCOUNT_KEY = "chengduStory.accounts.v1";
  const CURRENT_PLAYER_KEY = "chengduStory.currentPlayer.v1";
  const SESSION_KEY = "chengduStory.sessionPlayer.v1";
  const LOG_PREFIX = "chengduStory.log.";
  const LOG_SUFFIX = ".v1";
  const ASSET_CACHE = "chengdu-story-assets-v26";
  const ASSETS = [
    "./styles.css?v=26",
    "./account.js?v=26",
    "./data.js?v=26",
    "./app.js?v=26",
    "./manifest.webmanifest",
    "./assets/app-icon.svg"
  ];

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
    const data = readJson(ACCOUNT_KEY, { schemaVersion: 2, accounts: [] });
    return Array.isArray(data.accounts) ? data : { schemaVersion: 2, accounts: [] };
  }

  function generatePlayerId() {
    const time = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `P-${time}-${random}`;
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLocaleLowerCase("en-US");
  }

  async function hashPassword(password) {
    const bytes = new TextEncoder().encode(String(password));
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  }

  function publicAccount(account) {
    if (!account) return null;
    return {
      id: account.id,
      email: account.email,
      username: account.username,
      profile: account.profile,
      createdAt: account.createdAt,
      lastPlayedAt: account.lastPlayedAt
    };
  }

  function setSession(account) {
    sessionStorage.setItem(SESSION_KEY, account.id);
    localStorage.setItem(CURRENT_PLAYER_KEY, account.id);
    return publicAccount(account);
  }

  async function register({ email, username, password }) {
    const normalizedEmail = normalizeEmail(email);
    const cleanUsername = String(username || "").trim();
    const file = readAccounts();

    if (file.accounts.some(account => account.email === normalizedEmail)) {
      throw new Error("Email này đã được dùng để tạo tài khoản trên thiết bị.");
    }

    const timestamp = new Date().toISOString();
    const account = {
      id: generatePlayerId(),
      email: normalizedEmail,
      username: cleanUsername,
      passwordHash: await hashPassword(password),
      profile: { nameVi: cleanUsername, nameZh: "玩家" },
      createdAt: timestamp,
      lastPlayedAt: timestamp
    };
    file.accounts.push(account);
    writeJson(ACCOUNT_KEY, file);

    // Nếu trước đây người chơi đã thử bản cũ, chuyển tiến trình gần nhất sang tài khoản đầu tiên.
    const legacyId = localStorage.getItem(CURRENT_PLAYER_KEY);
    const legacyAccounts = readJson(LEGACY_ACCOUNT_KEY, { accounts: [] });
    if (file.accounts.length === 1 && legacyId && legacyAccounts.accounts?.some(item => item.id === legacyId)) {
      const legacyLog = readJson(logKey(legacyId), null);
      if (legacyLog) {
        legacyLog.playerId = account.id;
        legacyLog.progress.profile = account.profile;
        writeJson(logKey(account.id), legacyLog);
      }
    }

    window.ACCOUNT_FILE = file;
    return setSession(account);
  }

  async function login({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    const file = readAccounts();
    const account = file.accounts.find(item => item.email === normalizedEmail);
    const passwordHash = await hashPassword(password);
    if (!account || account.passwordHash !== passwordHash) {
      throw new Error("Email hoặc mật khẩu chưa đúng.");
    }
    account.lastPlayedAt = new Date().toISOString();
    writeJson(ACCOUNT_KEY, file);
    window.ACCOUNT_FILE = file;
    return setSession(account);
  }

  function getSessionAccount() {
    const playerId = sessionStorage.getItem(SESSION_KEY);
    return publicAccount(readAccounts().accounts.find(account => account.id === playerId));
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function ensureAccount(profile, preferredId) {
    const file = readAccounts();
    const account = file.accounts.find(item => item.id === preferredId);
    if (!account) return null;
    account.profile = { nameVi: profile.nameVi, nameZh: profile.nameZh };
    account.username = profile.nameVi;
    account.lastPlayedAt = new Date().toISOString();
    writeJson(ACCOUNT_KEY, file);
    return publicAccount(account);
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

  async function prepareGameAssets(onProgress) {
    if (!("caches" in window)) {
      onProgress?.(100, "Đã tải thư viện trò chơi");
      return;
    }
    const cache = await caches.open(ASSET_CACHE);
    for (let index = 0; index < ASSETS.length; index += 1) {
      const asset = ASSETS[index];
      const cached = await cache.match(asset);
      try {
        const response = await fetch(asset, { cache: "no-cache" });
        if (response.ok) await cache.put(asset, response.clone());
      } catch (error) {
        if (!cached) throw error;
      }
      const progress = Math.round(((index + 1) / ASSETS.length) * 100);
      onProgress?.(progress, cached ? "Đang kiểm tra bản cập nhật" : "Đang tải thư viện trò chơi");
    }
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("chengdu-story-assets-") && key !== ASSET_CACHE).map(key => caches.delete(key)));
  }

  window.ACCOUNT_FILE = readAccounts();
  window.PLAYER_DATA_STORE = {
    register,
    login,
    logout,
    getSessionAccount,
    ensureAccount,
    saveProgress,
    loadProgress,
    exportProgress,
    prepareGameAssets,
    getCurrentPlayerId: () => getSessionAccount()?.id || null
  };
})();
