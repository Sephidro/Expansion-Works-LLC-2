# Expansion Works — Public Site

The public-facing brand for Expansion Works / EXPworks (Xaiver Pearson). Vanilla HTML + GSAP, no build step. Deploys to Vercel on every push to `main`.

## Pages

| URL | File | Job |
|-----|------|-----|
| `/` | `index.html` | **Homepage.** Brand hub, personal-forward (Xaiver). Who he is, the work, case-study showcase. Every CTA points to `/sales`. |
| `/sales` | `sales.html` | **Sales page.** One job: conversion. Diagnosis → process → pricing → FAQ → 2-min audit quiz → the URL-capture form (Formspree). **Reflects the pre-pivot "website teardown" offer — see note below.** |
| `/qualify` | `qualify.html` | **Lead capture for the current offer** (Lead Systems / Visibility Sprint, pivoted 2026-08-02). A 3-question qualification form — industry, lead volume, biggest bottleneck — scored client-side for the on-page message + email subject line, and authoritatively on the EXP OS server once it lands. Feeds the Funnel dashboard at `localhost:8770` via the `/funnel-intake` skill. |
| `/work/donation` | `work/donation.html` | Case study 01 — Donation Page Rebuild |
| `/work/staff` | `work/staff.html` | Case study 02 — Staff Appreciation Redesign |
| `/work/ibucks` | `work/ibucks.html` | Case study 03 — iBucks Economy |

> **Offer mismatch, unresolved:** `/sales` still sells the old "$2,500 website build / free
> teardown" offer. The business pivoted to Lead Systems on 2026-08-02
> (`memory/project_expansion_works_v2.md`), and `/qualify` reflects that new offer. Nothing
> currently links `/` or `/sales` to `/qualify`, and `/sales` hasn't been retired or
> rewritten — that's a scope decision for Xavier, not made here. Until it's resolved, treat
> `/qualify` as a standalone funnel entry point (LinkedIn bio link, DM follow-up, etc.), not
> as something the homepage routes people through yet.

The case studies are the **top of the LinkedIn funnel**: profile → featured case study → tactical breakdown → CTA → `/sales` → URL-capture form → Loom teardown → pitch the build.

## Design system (shared across all pages)

- Colors: bg `#060b14`, bg2 `#0a1120`, cyan `#00c8df`, orange `#d35f18`
- Fonts: Anton (display) + Barlow Condensed (body)
- Motion: GSAP + ScrollTrigger, scramble hero, spotlight cards, particle CTA button
- `vercel.json` → `cleanUrls: true` (so `sales.html` serves at `/sales`)

> Note: the 3 case-study pages still use the older "terminal/HUD" treatment (Syncopate / JetBrains Mono, cyan `#00E5FF` + copper `#D9774B`). Close but not identical to the main system. Decide whether to keep that as a deliberate "tactical breakdown" look or unify them to Anton/Barlow.

## Before going live

1. **Formspree:** in `sales.html`, replace `YOUR_FORM_ID` in the form `action` with the real Expansion Works form ID from formspree.io. Submit once to verify the activation email.
2. **Formspree, `/qualify`:** same deal, separate form. In `qualify.html`, replace `YOUR_QUALIFY_FORM_ID` in the form `action` with a **new** Formspree form ID (keep it separate from the `/sales` form so notification threads and submission counts don't mix). Submit once to verify.
3. **Loom walkthrough:** every confirmation email `/qualify` generates links to a Loom of "what I actually do." Record it, then drop the URL (just the URL, nothing else) into `exp-os/data/loom-url.txt`. Until that file exists, every draft ships with a visible `[LOOM_URL_NOT_SET]` placeholder instead of silently linking nowhere.
4. **OG image URLs:** `og:image` / `twitter:image` are root-relative (`/assets/xp-logo.png`). Once the domain is known, switch them to absolute `https://<domain>/assets/xp-logo.png` so social cards render.
5. **Logo asset:** `assets/xp-logo.png` is the favicon + social card. Swap for a tighter square crop if desired.

## The dashboard is NOT here

The LinkedIn asset builder (the React/Vite "Factory") lives in `../EXP-Linkedin-Factory` and is an **in-house tool, run locally** (`npm run dev`). It is intentionally disconnected from this public site and is not deployed to this Vercel project.
