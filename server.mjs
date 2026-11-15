#!/usr/bin/env node
/**
 * Zero-dependency static server for DeepSeek Mobile.
 *
 *   node server.mjs                 # http://0.0.0.0:8080
 *   node server.mjs --port 3000     # custom port
 *   node server.mjs --open          # open the default browser
 *
 * Note: service workers (offline + "install app") require HTTPS or localhost.
 * Plain http://LAN-IP works for browsing, but installability depends on the
 * browser. For a fully installable app, deploy the folder to any HTTPS static
 * host (GitHub Pages, Vercel, Netlify, Cloudflare Pages).
 */

import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
};

function parseArgs(argv) {
  const options = { port: 8080, host: '0.0.0.0', open: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--port' || arg === '-p') options.port = Number(argv[++i]) || 8080;
    else if (arg === '--host' || arg === '-H') options.host = argv[++i] || '0.0.0.0';
    else if (arg === '--open' || arg === '-o') options.open = true;
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node server.mjs [--port 8080] [--host 0.0.0.0] [--open]');
      process.exit(0);
    }
  }
  return options;
}

function lanAddresses() {
  const list = [];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const info of interfaces[name] || []) {
      if (info.family === 'IPv4' && !info.internal) list.push(info.address);
    }
  }
  return list;
}

function safePath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  } catch {
    return null;
  }
  if (decoded === '/' || decoded === '') decoded = '/index.html';
  const resolved = path.resolve(ROOT, '.' + path.posix.normalize(decoded));
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) return null;
  return resolved;
}

async function handle(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end('Method Not Allowed');
    return;
  }

  const filePath = safePath(req.url || '/');
  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  let stat;
  try {
    stat = await fsp.stat(filePath);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found: ' + req.url);
    return;
  }

  let target = filePath;
  if (stat.isDirectory()) {
    target = path.join(filePath, 'index.html');
    try {
      stat = await fsp.stat(target);
    } catch {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
  }

  const ext = path.extname(target).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  const headers = {
    'Content-Type': type,
    'Content-Length': stat.size,
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
  };

  res.writeHead(200, headers);
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  fs.createReadStream(target).on('error', () => res.destroy()).pipe(res);
}

function openBrowser(url) {
  const command =
    process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(command, { windowsHide: true }, () => {});
}

function listen(server, options, attempt = 0) {
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && attempt < 10) {
      const next = options.port + 1;
      console.log(`端口 ${options.port} 已被占用，尝试 ${next} …`);
      options.port = next;
      setTimeout(() => listen(server, options, attempt + 1), 120);
      return;
    }
    console.error('启动失败:', error.message);
    process.exit(1);
  });
  server.listen(options.port, options.host, () => {
    const port = server.address().port;
    const local = `http://localhost:${port}`;
    const lan = lanAddresses().map((ip) => `http://${ip}:${port}`);
    console.log('');
    console.log('  DeepSeek 手机版 · 本地服务已启动');
    console.log('');
    console.log('  电脑访问   ' + local);
    if (lan.length) {
      console.log('  手机访问   ' + lan[0] + '   （手机需与电脑连同一 Wi-Fi）');
      lan.slice(1).forEach((url) => console.log('             ' + url));
    }
    console.log('');
    console.log('  手机上打开后：Chrome 菜单 →「安装应用 / 添加到主屏幕」');
    console.log('  iPhone：Safari 分享 →「添加到主屏幕」');
    console.log('');
    console.log('  按 Ctrl+C 停止服务');
    console.log('');
    if (options.open) openBrowser(local);
  });
}

const options = parseArgs(process.argv.slice(2));
const server = http.createServer((req, res) => {
  handle(req, res).catch((error) => {
    console.error(error);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  });
});
listen(server, options);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log('\n已停止。');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 500);
  });
}
