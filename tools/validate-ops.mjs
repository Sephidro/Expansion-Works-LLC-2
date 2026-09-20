#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const opsDir = path.join(root, 'ops');
const required = {
  'catalog-candidates.json': 'candidates',
  'content-queue.json': 'items',
  'experiments.json': 'experiments',
  'connections.json': 'connections',
  'run-ledger.json': 'runs'
};

const allowedCatalogStates = new Set(['discovered', 'source_verified', 'test_queued', 'tested', 'recommendation_proposed', 'approved_for_publish', 'live', 'monitored', 'retired']);
const allowedContentStates = new Set(['research_ready', 'drafting', 'voice_review', 'ready_for_publish', 'published', 'distributed', 'measuring', 'archived']);
const allowedRunStates = new Set(['running', 'completed', 'failed', 'blocked', 'no_op']);
const allowedConnectionStates = new Set(['blocked', 'ready', 'degraded']);
let errors = 0;

function report(message) {
  errors += 1;
  console.error(message);
}

function readJson(file) {
  const full = path.join(opsDir, file);
  if (!fs.existsSync(full)) {
    report(`[MISSING] ops/${file}`);
    return null;
  }
  try { return JSON.parse(fs.readFileSync(full, 'utf8')); }
  catch (error) {
    report(`[INVALID JSON] ops/${file}: ${error.message}`);
    return null;
  }
}

function uniqueIds(items, file) {
  const ids = new Set();
  for (const item of items) {
    if (!item.id) report(`[MISSING ID] ${file}`);
    else if (ids.has(item.id)) report(`[DUPLICATE ID] ${file}: ${item.id}`);
    else ids.add(item.id);
  }
}

for (const [file, collection] of Object.entries(required)) {
  const data = readJson(file);
  if (!data) continue;
  if (data.schemaVersion !== 1) report(`[SCHEMA] ops/${file} must use schemaVersion 1`);
  if (!Array.isArray(data[collection])) report(`[COLLECTION] ops/${file} must contain ${collection}[]`);
  else uniqueIds(data[collection], `ops/${file}`);
}

const catalog = readJson('catalog-candidates.json');
for (const item of catalog?.candidates || []) if (!allowedCatalogStates.has(item.status)) report(`[STATE] catalog candidate ${item.id}: ${item.status}`);

const content = readJson('content-queue.json');
for (const item of content?.items || []) if (!allowedContentStates.has(item.status)) report(`[STATE] content item ${item.id}: ${item.status}`);

const runs = readJson('run-ledger.json');
for (const item of runs?.runs || []) if (!allowedRunStates.has(item.status)) report(`[STATE] run ${item.id}: ${item.status}`);

const connections = readJson('connections.json');
for (const item of connections?.connections || []) {
  if (!allowedConnectionStates.has(item.status)) report(`[STATE] connection ${item.id}: ${item.status}`);
  for (const forbidden of ['secret', 'token', 'password', 'apiKey', 'webhookSecret']) {
    if (Object.hasOwn(item, forbidden)) report(`[SECRET FIELD] connection ${item.id} contains ${forbidden}`);
  }
}

console.log(errors === 0 ? 'OPS CHECK PASSED' : `OPS CHECK FAILED: ${errors} issue(s)`);
process.exit(errors === 0 ? 0 : 1);
