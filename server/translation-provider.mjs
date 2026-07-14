const MAX_TEXT_LENGTH = 2000;
const REQUEST_TIMEOUT_MS = 12000;

export function getTranslationProviderStatus() {
  const configured = normalizeProvider(process.env.TRANSLATION_PROVIDER || 'auto');
  const hasGoogleKey = Boolean(process.env.GOOGLE_TRANSLATE_API_KEY);
  const active = configured === 'auto'
    ? (hasGoogleKey ? 'google-cloud' : 'mymemory')
    : configured;

  return {
    configured,
    active,
    hasGoogleKey,
    maxTextLength: MAX_TEXT_LENGTH,
  };
}

export async function translateText({ text, source, target }) {
  const cleanText = String(text || '').trim();
  validateRequest(cleanText, source, target);

  const configured = normalizeProvider(process.env.TRANSLATION_PROVIDER || 'auto');
  const hasGoogleKey = Boolean(process.env.GOOGLE_TRANSLATE_API_KEY);

  if (configured === 'google-cloud') {
    if (!hasGoogleKey) {
      throw new TranslationProviderError(
        'GOOGLE_TRANSLATE_API_KEY chưa được cấu hình trên server.',
        503,
      );
    }
    return translateWithGoogleCloud(cleanText, source, target);
  }

  if (configured === 'mymemory') {
    return translateWithMyMemory(cleanText, source, target);
  }

  if (configured === 'local') {
    throw new TranslationProviderError('Dịch trực tuyến đang bị tắt.', 503);
  }

  if (hasGoogleKey) {
    try {
      return await translateWithGoogleCloud(cleanText, source, target);
    } catch (error) {
      console.warn('[translate] Google Cloud failed; falling back to MyMemory:', error.message);
    }
  }

  return translateWithMyMemory(cleanText, source, target);
}

async function translateWithGoogleCloud(text, source, target) {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  const url = new URL('https://translation.googleapis.com/language/translate/v2');
  url.searchParams.set('key', key);

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      q: text,
      source: toGoogleLanguageCode(source),
      target: toGoogleLanguageCode(target),
      format: 'text',
      model: 'base',
    }),
  });

  const payload = await readJson(response);
  if (!response.ok) {
    const message = payload?.error?.message || `Google Cloud Translation HTTP ${response.status}`;
    throw new TranslationProviderError(message, 502);
  }

  const translation = payload?.data?.translations?.[0]?.translatedText;
  if (!translation) {
    throw new TranslationProviderError('Google Cloud không trả về bản dịch.', 502);
  }

  return {
    translation: decodeHtmlEntities(translation),
    provider: 'google-cloud',
    detectedSource: source,
  };
}

async function translateWithMyMemory(text, source, target) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', `${toMemoryLanguageCode(source)}|${toMemoryLanguageCode(target)}`);
  url.searchParams.set('mt', '1');

  if (process.env.MYMEMORY_CONTACT_EMAIL) {
    url.searchParams.set('de', process.env.MYMEMORY_CONTACT_EMAIL);
  }

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': 'LinguaQuest/2.1',
    },
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new TranslationProviderError(`MyMemory HTTP ${response.status}`, 502);
  }

  const status = Number(payload?.responseStatus || 200);
  const translation = payload?.responseData?.translatedText;
  if (status >= 400 || !translation) {
    throw new TranslationProviderError(
      payload?.responseDetails || 'MyMemory không trả về bản dịch.',
      502,
    );
  }

  return {
    translation: decodeHtmlEntities(translation),
    provider: 'mymemory',
    detectedSource: source,
  };
}

function validateRequest(text, source, target) {
  if (!text) throw new TranslationProviderError('Thiếu văn bản cần dịch.', 400);
  if (text.length > MAX_TEXT_LENGTH) {
    throw new TranslationProviderError(`Văn bản tối đa ${MAX_TEXT_LENGTH} ký tự.`, 400);
  }
  if (!['en', 'zh'].includes(source)) {
    throw new TranslationProviderError('Ngôn ngữ nguồn không hợp lệ.', 400);
  }
  if (!['en', 'zh'].includes(target) || source === target) {
    throw new TranslationProviderError('Ngôn ngữ đích không hợp lệ.', 400);
  }
}

function normalizeProvider(value) {
  const provider = String(value).toLowerCase().trim();
  return ['auto', 'google-cloud', 'mymemory', 'local'].includes(provider)
    ? provider
    : 'auto';
}

function toGoogleLanguageCode(language) {
  return language === 'zh' ? 'zh-CN' : 'en';
}

function toMemoryLanguageCode(language) {
  return language === 'zh' ? 'zh-CN' : 'en';
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new TranslationProviderError('Dịch vụ dịch thuật quá thời gian chờ.', 504);
    }
    throw new TranslationProviderError(`Không kết nối được dịch vụ dịch thuật: ${error.message}`, 502);
  } finally {
    clearTimeout(timeout);
  }
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { responseDetails: text };
  }
}

function decodeHtmlEntities(value) {
  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

export class TranslationProviderError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'TranslationProviderError';
    this.statusCode = statusCode;
  }
}
