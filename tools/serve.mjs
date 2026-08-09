#!/usr/bin/env node
// Minimal local static server for this site, no dependencies. cleanUrls-aware
// (matches vercel.json: /sales resolves to sales.html, /guides/ resolves to
// guides/index.html), so it previews the same routing Vercel uses in production.
//
// Usage: node tools/serve.mjs [port]   (default port 8080)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const port = Number(process.argv[2] || 8080);
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  if (p === '/') p = '/index.html';
  let file = path.join(root, p);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file = file + '.html';
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('404 ' + p); return; }
  const ext = path.extname(file);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(file).on('error', () => res.end()).pipe(res);
}).listen(port, () => console.log('serving ' + root + ' on http://localhost:' + port));
