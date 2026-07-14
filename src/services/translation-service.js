import { LocalTranslationService } from './local-translation-service.js';
import { TranslationApiService } from './translation-api-service.js';

/**
 * Translation orchestrator.
 * 1. Exact local phrase/word matches are returned immediately.
 * 2. Unknown content is sent to the app backend for real translation.
 * 3. If the backend is unavailable, the deterministic local partial result is
 *    returned together with an error so the UI does not pretend it is exact.
 */
export class TranslationService {
  constructor(phrases, vocabulary, options = {}) {
    this.local = new LocalTranslationService(phrases, vocabulary);
    this.remote = new TranslationApiService(options.remote);
  }

  detectLanguage(text) {
    return this.local.detectLanguage(text);
  }

  async translate(text, requestedSource = 'auto') {
    const localResult = this.local.translate(text, requestedSource);
    if (localResult.quality === 'exact') return localResult;

    try {
      const remoteResult = await this.remote.translate({
        text: localResult.input,
        source: localResult.source,
        target: localResult.target,
      });

      const en = localResult.target === 'en' ? remoteResult.text : localResult.input;
      const zh = localResult.target === 'zh' ? remoteResult.text : localResult.input;

      return {
        ...localResult,
        text: remoteResult.text,
        pinyin: '',
        quality: 'remote',
        provider: remoteResult.provider,
        source: remoteResult.detectedSource || localResult.source,
        en,
        zh,
      };
    } catch (error) {
      return {
        ...localResult,
        remoteError: error instanceof Error ? error.message : String(error),
      };
    }
  }

  buildGoogleTranslateUrl(text, source, target) {
    const targetCode = target === 'zh' ? 'zh-CN' : 'en';
    const sourceCode = source === 'zh' ? 'zh-CN' : 'en';
    return `https://translate.google.com/?sl=${sourceCode}&tl=${targetCode}&text=${encodeURIComponent(text)}&op=translate`;
  }
}
