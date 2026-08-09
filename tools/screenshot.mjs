#!/usr/bin/env node
// Repo-native screenshot capture, no dependencies (no puppeteer/playwright install).
// Drives the system's installed Chrome directly in headless mode. Useful for a quick
// visual gut-check after CSS changes, or for before/after comparisons.
//
// Usage:
//   node tools/serve.mjs 8080 &          (start a local static server, see serve.mjs)
//   node tools/screenshot.mjs http://localhost:8080/ out/home.png [width] [height]
//
// Width/height default to a normal desktop viewport (1440x900). For a taller capture
// (e.g. to see below the fold) pass a bigger height — note pages with `min-height: 100dvh`
// sections will stretch to fill whatever height you ask for, so very tall requests can
// look misleading for those sections specifically.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const [, , url, outFile, width = '1440', height = '900'] = process.argv;

if (!url || !outFile) {
  console.error('Usage: node tools/screenshot.mjs <url> <outfile.png> [width] [height]');
  process.exit(1);
}

const chrome = CHROME_CANDIDATES.find(p => fs.existsSync(p));
if (!chrome) {
  console.error('No Chrome/Edge install found in the usual locations. Edit CHROME_CANDIDATES in this file to add yours.');
  process.exit(1);
}

fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });

// Fresh profile dir per run — a reused default profile would let Chrome serve
// cached CSS/JS from a previous invocation instead of the file you just edited.
const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shot-profile-'));

execFileSync(chrome, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  '--disk-cache-dir=' + path.join(profileDir, 'cache'),
  '--user-data-dir=' + profileDir,
  `--window-size=${width},${height}`,
  `--screenshot=${path.resolve(outFile)}`,
  url,
], { stdio: 'inherit' });

fs.rmSync(profileDir, { recursive: true, force: true });

console.log('Saved ' + outFile);
