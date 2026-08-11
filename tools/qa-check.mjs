#!/usr/bin/env node
// Repo-native QA gate for the EXPworks static site. No dependencies, no build step,
// matches the site's own "no framework" philosophy. Run after any edit:
//   node tools/qa-check.mjs
//
// Checks, per HTML file in FILES below:
//   1. Every inline <script> block is syntactically valid JS.
//   2. Every getElementById('x') call has a matching id="x" somewhere in the same file.
//   3. Every local href (root-relative "/..." or "#...") resolves to a real file/anchor.
// Exits 1 on any failure so it can be dropped into a pre-commit hook or CI later.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const FILES = [
  'index.html', 'stackbrief.html', 'sales.html', 'qualify.html', 'audit-request.html',
  'guides/index.html', 'guides/leads-go-cold.html', 'guides/where-leads-come-from.html',
  'guides/consistent-followup.html', 'guides/why-isnt-it-closing.html',
  'guides/which-crm-fits.html', 'guides/how-i-write-follow-up.html',
  'work/donation.html', 'work/staff.html', 'work/ibucks.html',
  'tools/better-inquiry-form.html',
];

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
        const targetFile = (filePart === '' || filePart === '/') ? 'index.html' : filePart.replace(/^\//, '');
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

console.log('');
console.log(errors === 0 ? 'QA CHECK PASSED — ' + FILES.length + ' files clean' : 'QA CHECK FAILED — ' + errors + ' issue(s) found');
process.exit(errors === 0 ? 0 : 1);
