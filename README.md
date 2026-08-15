# Expansion Works: Public Site

The public-facing brand for Expansion Works / EXPworks (Xavier Pearson). Vanilla HTML + GSAP, no build step. Deploys to Vercel on every push to `main`.

## Pages

| URL | File | Job |
|-----|------|-----|
| `/` | `index.html` | **StackBrief homepage.** Lead-to-revenue positioning for 1–5 person consulting and advisory firms, with the diagnostic and the implementation path separated by buyer intent. |
| `/stackbrief` | `stackbrief.html` | **Rules-based diagnostic.** Nine evidence questions for established firms, a separate early-stage tool-plan branch, result before email, and an explicit 14-day test with falsifiers. |
| `/crm-or-spreadsheet-for-consultants` | `crm-or-spreadsheet-for-consultants.html` | **Search-native decision tool.** Six evidence questions identify the operating breakpoint between keeping a spreadsheet, repairing the process, adopting a light CRM, or connecting the lead path. |
| `/sales` | `sales.html` | **Expansion Works implementation page.** Last 10 Leads Diagnostic, Lead Recovery Installation, economic fit filter, acceptance tests, and the verified Formspree intake. |
| `/qualify` and `/audit-request` | `vercel.json` redirects | **Legacy routes.** Permanently redirect to `/sales#apply`; the placeholder forms are not public conversion paths. |
| `/guides` | `guides/index.html` | **Guides hub.** Six query-matched lead-system articles with destination-accurate CTAs and no email wall. |
| `/work/lead-recovery` | `work/lead-recovery.html` | **Primary proof page.** Recovery mechanism, direct counts, associated funding estimate, and attribution limitations. |
| `/work/donation` | `work/donation.html` | Case study 01: Donation Page Rebuild |
| `/work/staff` | `work/staff.html` | Case study 02: Staff Appreciation Redesign |
| `/work/ibucks` | `work/ibucks.html` | Case study 03: iBucks Economy |
| `/privacy` | `privacy.html` | Privacy, form-processing, local-storage, analytics, and affiliate-disclosure boundaries. |

> The 3 case studies still use the older "terminal/HUD" treatment (Syncopate / JetBrains Mono, cyan + copper), not the current design system below. Flagged, not yet redesigned — a real gap, not a mistake.

The premium front door is the fixed-scope Last 10 Leads Diagnostic ($1,500), followed when justified by the Lead Recovery Installation ($4,000–$7,500). StackBrief remains the free decision product and the search/DIY lane. Software is one possible output, not the product category.

## Design systems

`assets/stackbrief.css` + the StackBrief and service scripts power the homepage, diagnostic, CRM-breakpoint tool, and implementation page. The system uses midnight navy, electric cyan, and conversion-only orange with condensed display typography and technical module frames.

`assets/style.css` + `assets/site.js` remain the source of truth for the guide, qualification, audit, and older case-study pages while those surfaces are migrated.

- **StackBrief palette:** midnight navy `#06111F`, electric cyan `#11C8E8`, warm orange `#F28C38`, and off-white `#F4F6F7`.
- **StackBrief type:** Barlow Condensed (display), Inter (body/UI), IBM Plex Mono (labels and system data).
- **Editorial rule:** the recommendation result appears before the optional email save. Partner status is explicitly separated from recommendation logic.
- `vercel.json` → `cleanUrls: true` (so `sales.html` serves at `/sales`)

## Production gates

1. **Formspree, `/sales`:** real form ID already wired (`xeewjjlv`).
2. **Legacy intake routes:** `/qualify` and `/audit-request` permanently redirect to the verified `/sales#apply` intake so no public CTA can submit to a placeholder endpoint.
3. **Domain:** canonical URLs, social images, `robots.txt`, and `sitemap.xml` use `https://stackbriefxp.vercel.app`.
4. **Analytics:** Vercel Analytics loading and browser-side events are instrumented. Analytics still needs to be enabled for this Vercel project before durable funnel reporting can be claimed.
5. **Discovery:** submit `/sitemap.xml` in Google Search Console and Bing Webmaster Tools after property verification. Repository changes alone cannot perform account-level verification.

## QA tooling

`tools/` — zero-dependency scripts, run after any edit:

- `node tools/qa-check.mjs` — checks every tracked page for JS syntax errors, broken local links/anchors, and `getElementById()` calls with no matching `id`.
- `node tools/serve.mjs 8080` — local static server, cleanUrls-aware (mirrors production routing).
- `node tools/screenshot.mjs <url> <out.png>` — headless-Chrome screenshot, no puppeteer/playwright install needed.

## The dashboard is NOT here

The LinkedIn asset builder (the React/Vite "Factory") lives in `../EXP-Linkedin-Factory` and is an **in-house tool, run locally** (`npm run dev`). It is intentionally disconnected from this public site and is not deployed to this Vercel project.
