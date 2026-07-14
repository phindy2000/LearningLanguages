export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[char]));
}

export function normalizeEnglish(value) {
  return String(value)
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeChinese(value) {
  return String(value).replace(/[，。！？、；：“”‘’\s]/g, '').trim();
}

export function shuffle(items) {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [output[index], output[target]] = [output[target], output[index]];
  }
  return output;
}

export function createId(prefix = 'item') {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
