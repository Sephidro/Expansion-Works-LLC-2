# Site QA tools

Added 2026-08-09 during the full redesign, as permanent infrastructure rather than one-off
scratchpad scripts. Zero dependencies, matches the site's own no-build-step philosophy.

- **`qa-check.mjs`** — run after any edit: `node tools/qa-check.mjs`. Checks every tracked HTML
  file for JS syntax errors in inline `<script>` blocks, `getElementById()` calls with no matching
  `id`, and local links/anchors that don't resolve. Exits 1 on failure, so it can be wired into a
  pre-commit hook later if this ever gets real CI.
- **`serve.mjs`** — local static server: `node tools/serve.mjs 8080`. cleanUrls-aware, matches
  `vercel.json` (so `/sales` and `/guides/` resolve the same way they do in production).
- **`screenshot.mjs`** — headless-Chrome screenshot, no puppeteer/playwright install needed:
  `node tools/screenshot.mjs http://localhost:8080/ out/home.png 1440 900`. Useful for a quick
  visual check or a before/after comparison after a CSS change.

New file added to `FILES` in `qa-check.mjs` whenever a new page is added to the site, or it won't
get checked.
