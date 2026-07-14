export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function requireElement(selector, root = document) {
  const element = $(selector, root);
  if (!element) throw new Error(`Không tìm thấy phần tử bắt buộc: ${selector}`);
  return element;
}
