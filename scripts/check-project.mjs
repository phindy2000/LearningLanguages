import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'index.html',
  'assets/css/tokens.css',
  'assets/css/layout.css',
  'assets/css/components.css',
  'assets/css/responsive.css',
  'src/app.js',
  'src/data/phrases.js',
  'src/data/vocabulary.js',
  'src/data/chapters.js',
  'src/services/speech-service.js',
  'src/services/translation-service.js',
  'src/services/inventory-service.js',
];

for (const file of requiredFiles) await access(path.join(root, file));
const html = await readFile(path.join(root, 'index.html'), 'utf8');
for (const marker of ['id="storyView"', 'id="lookupView"', 'id="translateView"', 'id="inventoryView"']) {
  if (!html.includes(marker)) throw new Error(`Thiếu marker giao diện: ${marker}`);
}

const { phrases } = await import('../src/data/phrases.js');
const { vocabulary } = await import('../src/data/vocabulary.js');
const { chapters } = await import('../src/data/chapters.js');
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

console.log(`OK: ${chapters.length} chương, ${chapters.reduce((sum, chapter) => sum + chapter.scenes.length, 0)} scene, ${phrases.length} câu, ${vocabulary.length} từ.`);
