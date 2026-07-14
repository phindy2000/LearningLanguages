import { normalizeChinese, normalizeEnglish } from '../core/utils.js';

/**
 * Offline dictionary translator.
 * It is deterministic and safe for exact entries, but it is not a full
 * sentence translation engine. Partial output is used only as a fallback.
 */
export class LocalTranslationService {
  constructor(phrases, vocabulary) {
    this.phrases = phrases;
    this.vocabulary = vocabulary;

    const all = [...phrases, ...vocabulary];
    this.maps = {
      en: new Map(all.map((item) => [normalizeEnglish(item.en), item])),
      zh: new Map(all.map((item) => [normalizeChinese(item.zh), item])),
      wordsEn: new Map(vocabulary.map((item) => [normalizeEnglish(item.en), item])),
      zhTerms: [...vocabulary].sort((a, b) => b.zh.length - a.zh.length),
    };
  }

  detectLanguage(text) {
    return /[\u3400-\u9fff]/.test(text) ? 'zh' : 'en';
  }

  translate(text, requestedSource = 'auto') {
    const input = text.trim();
    const source = requestedSource === 'auto' ? this.detectLanguage(input) : requestedSource;
    const target = source === 'en' ? 'zh' : 'en';
    const result = source === 'en'
      ? this.translateEnglish(input)
      : this.translateChinese(input);

    return {
      source,
      target,
      input,
      provider: 'local',
      ...result,
    };
  }

  translateEnglish(text) {
    const exact = this.maps.en.get(normalizeEnglish(text));
    if (exact) {
      return {
        text: exact.zh,
        pinyin: exact.pinyin || '',
        quality: 'exact',
        en: exact.en,
        zh: exact.zh,
      };
    }

    const tokens = text.match(/[A-Za-z']+|\d+|[^A-Za-z'\d\s]+/g) || [];
    let known = 0;
    let total = 0;
    const output = tokens.map((token) => {
      if (!/[A-Za-z]/.test(token)) return token;
      total += 1;
      const match = this.maps.wordsEn.get(normalizeEnglish(token));
      if (match) {
        known += 1;
        return match.zh;
      }
      return `[${token}]`;
    }).join('');

    return {
      text: output,
      pinyin: '',
      quality: known && known / Math.max(total, 1) >= 0.55 ? 'partial' : 'none',
      en: text,
      zh: output,
    };
  }

  translateChinese(text) {
    const exact = this.maps.zh.get(normalizeChinese(text));
    if (exact) {
      return {
        text: exact.en,
        pinyin: '',
        quality: 'exact',
        en: exact.en,
        zh: exact.zh,
      };
    }

    const source = normalizeChinese(text);
    const output = [];
    let knownLength = 0;
    let index = 0;

    while (index < source.length) {
      const match = this.maps.zhTerms.find((item) => source.startsWith(item.zh, index));
      if (match) {
        output.push(match.en);
        knownLength += match.zh.length;
        index += match.zh.length;
      } else {
        output.push(`[${source[index]}]`);
        index += 1;
      }
    }

    return {
      text: output.join(' '),
      pinyin: '',
      quality: knownLength && knownLength / Math.max(source.length, 1) >= 0.55
        ? 'partial'
        : 'none',
      en: output.join(' '),
      zh: text,
    };
  }
}
