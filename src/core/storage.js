/** Safe localStorage wrapper. */
export class StorageService {
  get(key, fallback = '') {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  getJSON(key, fallback) {
    try {
      return JSON.parse(this.get(key, JSON.stringify(fallback)));
    } catch {
      return fallback;
    }
  }

  setJSON(key, value) {
    return this.set(key, JSON.stringify(value));
  }
}
