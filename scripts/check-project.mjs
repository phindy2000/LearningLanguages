import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'index.html',
  'server.mjs',
  'server/translation-provider.mjs',
  'assets/css/tokens.css',
  'assets/css/layout.css',
  'assets/css/components.css',
  'assets/css/responsive.css',
  'src/app.js',
  'src/data/phrases.js',
  'src/data/vocabulary.js',
  'src/data/chapters.js',
  'src/services/speech-service.js',
  'src/services/local-translation-service.js',
  'src/services/translation-api-service.js',
  'src/services/translation-service.js',
  'src/services/inventory-service.js',
  'docs/TRANSLATION.md',
];

for (const file of requiredFiles) await access(path.join(root, file));

const html = await readFile(path.join(root, 'index.html'), 'utf8');
for (const marker of ['id="storyView"', 'id="lookupView"', 'id="translateView"', 'id="inventoryView"']) {
  if (!html.includes(marker)) throw new Error(`Thiếu marker giao diện: ${marker}`);
}

const { phrases } = await import('../src/data/phrases.js');
const { vocabulary } = await import('../src/data/vocabulary.js');
const { chapters } = await import('../src/data/chapters.js');
const { LocalTranslationService } = await import('../src/services/local-translation-service.js');
const { TranslationApiService } = await import('../src/services/translation-api-service.js');
const ids = new Set(phrases.map((item) => item.id));

for (const chapter of chapters) {
  for (const scene of chapter.scenes) {
    if (!ids.has(scene.focus)) throw new Error(`Scene tham chiếu phrase không tồn tại: ${scene.focus}`);
    if (scene.line && !ids.has(scene.line)) throw new Error(`Scene line không tồn tại: ${scene.line}`);
    for (const option of scene.options || []) {
      if (!ids.has(option)) throw new Error(`Option không tồn tại: ${option}`);
    }
  }
}

const localTranslator = new LocalTranslationService(phrases, vocabulary);
const dog = localTranslator.translate('Dog', 'en');
if (dog.quality !== 'exact' || dog.text !== '狗' || dog.pinyin !== 'gǒu') {
  throw new Error('Kiểm tra dịch offline Dog → 狗 thất bại.');
}

const originalFetch = globalThis.fetch;
globalThis.fetch = async () => ({
  ok: true,
  status: 200,
  async text() {
    return JSON.stringify({
      translation: '这是一次模拟翻译。',
      provider: 'test-provider',
      detectedSource: 'en',
    });
  },
});

try {
  const apiTranslator = new TranslationApiService({ endpoint: '/api/translate', timeoutMs: 1000 });
  const remote = await apiTranslator.translate({ text: 'This is a test.', source: 'en', target: 'zh' });
  if (remote.text !== '这是一次模拟翻译。' || remote.provider !== 'test-provider') {
    throw new Error('Kiểm tra TranslationApiService thất bại.');
  }
} finally {
  globalThis.fetch = originalFetch;
}

const originalProvider = process.env.TRANSLATION_PROVIDER;
const originalServerFetch = globalThis.fetch;
process.env.TRANSLATION_PROVIDER = 'mymemory';
globalThis.fetch = async () => ({
  ok: true,
  status: 200,
  async text() {
    return JSON.stringify({
      responseStatus: 200,
      responseData: { translatedText: '狗' },
    });
  },
});

try {
  const { translateText } = await import('../server/translation-provider.mjs');
  const serverResult = await translateText({ text: 'dog', source: 'en', target: 'zh' });
  if (serverResult.translation !== '狗' || serverResult.provider !== 'mymemory') {
    throw new Error('Kiểm tra translation provider phía server thất bại.');
  }
} finally {
  globalThis.fetch = originalServerFetch;
  if (originalProvider === undefined) delete process.env.TRANSLATION_PROVIDER;
  else process.env.TRANSLATION_PROVIDER = originalProvider;
}

console.log(
  `OK: ${chapters.length} chương, ${chapters.reduce((sum, chapter) => sum + chapter.scenes.length, 0)} scene, `
  + `${phrases.length} câu, ${vocabulary.length} từ; local và API translation hợp lệ.`,
);
