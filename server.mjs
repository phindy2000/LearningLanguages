import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getTranslationProviderStatus,
  translateText,
  TranslationProviderError,
} from './server/translation-provider.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8080);
const MAX_BODY_BYTES = 16 * 1024;
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname === '/api/translation-status' && request.method === 'GET') {
      sendJson(response, 200, getTranslationProviderStatus());
      return;
    }

    if (url.pathname === '/api/translate' && request.method === 'POST') {
      const body = await readJsonBody(request);
      const result = await translateText(body);
      sendJson(response, 200, result);
      return;
    }

    if (url.pathname.startsWith('/api/')) {
      sendJson(response, 404, { message: 'API endpoint không tồn tại.' });
      return;
    }

    await serveStaticFile(url.pathname, response);
  } catch (error) {
    if (error instanceof TranslationProviderError) {
      sendJson(response, error.statusCode, { message: error.message });
      return;
    }

    console.error(error);
    sendJson(response, 500, { message: 'Lỗi server nội bộ.' });
  }
});

async function serveStaticFile(pathname, response) {
  try {
    const requestedPath = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
    const filePath = path.resolve(root, `.${requestedPath}`);
    if (!filePath.startsWith(root)) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    const info = await stat(filePath);
    if (!info.isFile()) throw new Error('Not a file');
    const content = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(content);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('404 - File not found');
  }
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new TranslationProviderError('Nội dung yêu cầu quá lớn.', 413));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve(text ? JSON.parse(text) : {});
      } catch {
        reject(new TranslationProviderError('JSON không hợp lệ.', 400));
      }
    });

    request.on('error', reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(payload));
}

server.listen(port, '127.0.0.1', () => {
  const status = getTranslationProviderStatus();
  console.log(`Lingua Quest đang chạy tại http://127.0.0.1:${port}`);
  console.log(`Dịch trực tuyến: ${status.active}`);
  console.log('Nhấn Ctrl+C để dừng server.');
});
