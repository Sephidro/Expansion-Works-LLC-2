#!/usr/bin/env node
// Repo-native QA gate for the EXPworks static site. No dependencies, no build step,
// matches the site's own "no framework" philosophy. Run after any edit:
//   node tools/qa-check.mjs
//
// Checks, per HTML file discovered in the repository:
//   1. Every inline <script> block is syntactically valid JS.
//   2. Every getElementById('x') call has a matching id="x" somewhere in the same file.
//   3. Every local href (root-relative "/..." or "#...") resolves to a real file/anchor.
// Exits 1 on any failure so it can be dropped into a pre-commit hook or CI later.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function walk(dir, predicate) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full, predicate));
    else if (predicate(full)) found.push(path.relative(root, full).split(path.sep).join('/'));
  }
  return found.sort();
}

const FILES = walk(root, full => full.endsWith('.html'));
const JS_FILES = walk(path.join(root, 'assets'), full => full.endsWith('.js'));

let errors = 0;

function fileExists(p) {
  let clean = p.split('#')[0].split('?')[0];
  if (clean === '/' || clean === '') return fs.existsSync(path.join(root, 'index.html'));
  clean = clean.replace(/^\//, '');
  const direct = path.join(root, clean);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return true;
  if (fs.existsSync(direct + '.html')) return true;
  if (fs.existsSync(path.join(direct, 'index.html'))) return true;
  return false;
}

for (const f of FILES) {
  const full = path.join(root, f);
  if (!fs.existsSync(full)) {
    errors++;
    console.log('[MISSING FILE] ' + f + ' is listed in FILES but does not exist');
    continue;
  }
  const src = fs.readFileSync(full, 'utf8');
  const fileErrors = [];

  const scriptRe = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = scriptRe.exec(src))) {
    const attrs = m[1] || '';
    if (/src=/.test(attrs)) continue;
    if (/type=["']application\/ld\+json["']/.test(attrs)) continue;
    const code = m[2];
    if (!code.trim()) continue;
    try { new Function(code); }
    catch (e) { fileErrors.push('[SYNTAX ERROR] ' + e.message); }
  }

  const idsInFile = new Set([...src.matchAll(/\sid="([^"]+)"/g)].map(x => x[1]));
  const idRefs = [...src.matchAll(/getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)].map(x => x[1]);
  for (const id of idRefs) {
    if (!idsInFile.has(id)) fileErrors.push('[MISSING ID] getElementById("' + id + '") has no id="' + id + '" in this file');
  }

  const hrefs = [...src.matchAll(/href="([^"]+)"/g)].map(x => x[1]);
  for (const href of hrefs) {
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    if (href.startsWith('#')) {
      const anchorId = href.slice(1);
      if (anchorId && !idsInFile.has(anchorId)) fileErrors.push('[BROKEN ANCHOR] href="' + href + '" has no id="' + anchorId + '" in this file');
      continue;
    }
    if (href.startsWith('/')) {
      if (href.includes('#')) {
        const [filePart, anchor] = href.split('#');
        const cleanFilePart = filePart.split('?')[0];
        const targetFile = (cleanFilePart === '' || cleanFilePart === '/') ? 'index.html' : cleanFilePart.replace(/^\//, '');
        const targetFull = path.join(root, targetFile.endsWith('.html') ? targetFile : targetFile + (fs.existsSync(path.join(root, targetFile + '.html')) ? '.html' : ''));
        if (fs.existsSync(targetFull)) {
          const targetIds = new Set([...fs.readFileSync(targetFull, 'utf8').matchAll(/\sid="([^"]+)"/g)].map(x => x[1]));
          if (anchor && !targetIds.has(anchor)) fileErrors.push('[BROKEN CROSS-ANCHOR] href="' + href + '" -> ' + targetFile + ' has no id="' + anchor + '"');
        } else {
          fileErrors.push('[MISSING TARGET FILE] href="' + href + '" -> ' + targetFile + ' not found');
        }
        continue;
      }
      if (!fileExists(href.split('?')[0])) fileErrors.push('[BROKEN LINK] href="' + href + '" does not resolve to a file');
    }
  }

  if (fileErrors.length) {
    console.log('=== ' + f + ' ===');
    fileErrors.forEach(e => console.log('  ' + e));
    errors += fileErrors.length;
  }
}

for (const f of JS_FILES) {
  const full = path.join(root, f);
  if (!fs.existsSync(full)) {
    errors++;
    console.log('[MISSING SCRIPT] ' + f + ' is listed in JS_FILES but does not exist');
    continue;
  }
  try { new Function(fs.readFileSync(full, 'utf8')); }
  catch (e) {
    errors++;
    console.log('=== ' + f + ' ===');
    console.log('  [SYNTAX ERROR] ' + e.message);
  }
}

const bannedClaims = [
  { pattern: /increased application completion from 32% to 72%/i, reason: 'unsupported completion-rate claim' },
  { pattern: /32%\s*(?:to|→|–|-)\s*72%/i, reason: 'unsupported completion-rate claim' }
];

const textFiles = walk(root, full => /\.(?:html|md|txt|json|js|xml)$/.test(full));
for (const f of textFiles) {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  for (const banned of bannedClaims) {
    if (banned.pattern.test(src)) {
      errors++;
      console.log(`=== ${f} ===`);
      console.log(`  [BANNED CLAIM] ${banned.reason}`);
    }
  }
}

console.log('');
console.log(errors === 0
  ? 'QA CHECK PASSED — ' + FILES.length + ' HTML files and ' + JS_FILES.length + ' scripts clean'
  : 'QA CHECK FAILED — ' + errors + ' issue(s) found');
process.exit(errors === 0 ? 0 : 1);
