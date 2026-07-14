/**
 * Client for the app's own translation backend.
 * API credentials never reach the browser. The local Node server decides
 * whether to use Google Cloud Translation or the configured public fallback.
 */
export class TranslationApiService {
  constructor({ endpoint = '/api/translate', timeoutMs = 12000 } = {}) {
    this.endpoint = endpoint;
    this.timeoutMs = timeoutMs;
  }

  async translate({ text, source, target }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source, target }),
        signal: controller.signal,
      });

      const payload = await this.readJson(response);
      if (!response.ok) {
        throw new Error(payload?.message || `Translation API returned HTTP ${response.status}`);
      }
      if (!payload?.translation) {
        throw new Error('Translation API did not return translated text');
      }

      return {
        text: String(payload.translation).trim(),
        provider: payload.provider || 'remote',
        detectedSource: payload.detectedSource || source,
      };
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error('Dịch trực tuyến quá thời gian chờ');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async readJson(response) {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }
}
