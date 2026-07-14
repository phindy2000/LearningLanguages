import { RANKS, STORAGE_KEYS } from '../config/app-config.js';

export class ProgressService {
  constructor(storage) {
    this.storage = storage;
    const legacyXp = Number(storage.get(STORAGE_KEYS.legacyXp, '0')) || 0;
    this.xp = Number(storage.get(STORAGE_KEYS.xp, String(legacyXp))) || 0;
    this.chapterProgress = storage.getJSON(STORAGE_KEYS.progress, {});
  }

  addXp(amount) {
    this.xp += amount;
    this.storage.set(STORAGE_KEYS.xp, String(this.xp));
    return this.xp;
  }

  getChapterDone(chapterId, maximum) {
    return Math.min(Number(this.chapterProgress[chapterId] || 0), maximum);
  }

  markScene(chapterId, sceneCount) {
    this.chapterProgress[chapterId] = Math.max(
      Number(this.chapterProgress[chapterId] || 0),
      sceneCount,
    );
    this.storage.setJSON(STORAGE_KEYS.progress, this.chapterProgress);
  }

  completeChapter(chapterId, sceneCount) {
    this.chapterProgress[chapterId] = sceneCount;
    this.storage.setJSON(STORAGE_KEYS.progress, this.chapterProgress);
  }

  getRank(masteredCount) {
    const score = this.xp + masteredCount * 25;
    let current = RANKS[0];
    for (const rank of RANKS) {
      if (score >= rank.min) current = rank;
    }
    const percent = current.next
      ? Math.max(0, Math.min(100, ((score - current.min) / (current.next - current.min)) * 100))
      : 100;
    return { ...current, score, percent };
  }
}
