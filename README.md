# Expansion Works: Public Site

The public-facing brand for Expansion Works / EXPworks (Xavier Pearson). Vanilla HTML + GSAP, no build step. Deploys to Vercel on every push to `main`.

## Pages

| URL | File | Job |
|-----|------|-----|
| `/` | `index.html` | **StackBrief homepage.** Founder-led positioning, decision-led product explanation, the embedded 5-question software-stack diagnostic, transparent editorial rules, and the Expansion Works implementation upsell. The result is shown before email capture. |
| `/sales` | `sales.html` | **Expansion Works implementation page.** Fit filter → connected-system map → three scoped service ranges → operating proof → implementation inquiry form (Formspree). |
| `/qualify.html` | `qualify.html` | **Booking-intent lead capture.** Industry, lead volume, biggest bottleneck, scored client-side for the on-page message + email subject line. |
| `/audit-request.html` | `audit-request.html` | **Written-breakdown request.** Lower-commitment alternative to booking a call: send a URL, get a real (human-run, not automated) conversion audit back. |
| `/guides/` | `guides/index.html` | **Guides hub.** 6 long-form articles, one per lead-system pillar (speed-to-lead, attribution, follow-up, close rate, CRM tooling, follow-up copy). No email gate — verdict/value before any ask. |
| `/work/donation` | `work/donation.html` | Case study 01: Donation Page Rebuild |
| `/work/staff` | `work/staff.html` | Case study 02: Staff Appreciation Redesign |
| `/work/ibucks` | `work/ibucks.html` | Case study 03: iBucks Economy |

> The 3 case studies still use the older "terminal/HUD" treatment (Syncopate / JetBrains Mono, cyan + copper), not the current design system below. Flagged, not yet redesigned — a real gap, not a mistake.

The service offer remains Lead Visibility Sprint / Lead Recovery Installation / Continuous Optimization. StackBrief now sits in front of the service as the free decision product. Legacy qualification and audit pages remain live for existing guide links.

## Design systems

`assets/stackbrief.css` + `assets/stackbrief.js` power the new StackBrief homepage and Expansion Works implementation page. The system uses midnight navy, electric cyan, and conversion-only orange with condensed display typography and technical module frames.

`assets/style.css` + `assets/site.js` remain the source of truth for the guide, qualification, audit, and older case-study pages while those surfaces are migrated.

- **StackBrief palette:** midnight navy `#06111F`, electric cyan `#11C8E8`, warm orange `#F28C38`, and off-white `#F4F6F7`.
- **StackBrief type:** Barlow Condensed (display), Inter (body/UI), IBM Plex Mono (labels and system data).
- **Editorial rule:** the recommendation result appears before the optional email save. Partner status is explicitly separated from recommendation logic.
- `vercel.json` → `cleanUrls: true` (so `sales.html` serves at `/sales`)

## Before going live

1. **Formspree, `/sales`:** real form ID already wired (`xeewjjlv`).
2. **Formspree, `/qualify.html`:** still a placeholder (`YOUR_QUALIFY_FORM_ID`). Create a form at formspree.io, drop the ID into the form `action`, submit once to verify.
3. **Formspree, `/audit-request.html`:** same deal, separate placeholder (`YOUR_AUDIT_FORM_ID`), keep it a distinct form from `/qualify.html` so notification threads don't mix.
4. **Domain:** `robots.txt` and `sitemap.xml` both reference `REPLACE-WITH-PRODUCTION-DOMAIN` on purpose. Swap in the real domain once one exists, then uncomment the `Sitemap:` line in `robots.txt`.
5. **OG image URLs:** `og:image` / `twitter:image` are root-relative (`/assets/xp-logo.png`). Once the domain is known, switch to absolute `https://<domain>/assets/xp-logo.png` so social cards render.

## QA tooling

`tools/` — zero-dependency scripts, run after any edit:

- `node tools/qa-check.mjs` — checks every tracked page for JS syntax errors, broken local links/anchors, and `getElementById()` calls with no matching `id`.
- `node tools/serve.mjs 8080` — local static server, cleanUrls-aware (mirrors production routing).
- `node tools/screenshot.mjs <url> <out.png>` — headless-Chrome screenshot, no puppeteer/playwright install needed.

## The dashboard is NOT here

The LinkedIn asset builder (the React/Vite "Factory") lives in `../EXP-Linkedin-Factory` and is an **in-house tool, run locally** (`npm run dev`). It is intentionally disconnected from this public site and is not deployed to this Vercel project.
