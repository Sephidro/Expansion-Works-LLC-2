# StackBrief data spine

StackBrief uses browser storage to preserve an unfinished brief and carry a completed diagnosis into the Expansion Works application. This is continuity infrastructure, not a replacement for an analytics database.

## Versions

- Funnel utility: `1.0.0`
- Quiz ruleset: `2026-10-13.1`
- Product catalog: `2026-08-11.1`

Changing question IDs or recommendation behavior should increment the ruleset. Changing vendor facts or destinations should increment the catalog.

## Browser storage

| Key | Purpose |
| --- | --- |
| `stackbrief_visitor_v1` | Anonymous browser-level visitor ID |
| `stackbrief_attribution_v1` | First-touch and latest campaign/referrer data |
| `stackbrief_quiz_v2` | Current answers and resume position |
| `stackbrief_result_v2` | Latest completed brief and stable brief ID |
| `stackbrief_events_v1` | Last 100 local instrumentation events |

Answers stay in the browser until the visitor explicitly submits the beta-review or implementation form. The DFY URL carries only the brief ID and plan level. It does not expose individual answers.

## Instrumented events

- `quiz_started`
- `quiz_resumed`
- `quiz_answered`
- `quiz_completed`
- `quiz_result_revisited`
- `quiz_restarted`
- `recommendation_clicked`
- `lead_captured`
- `dfy_handoff_clicked`
- `dfy_page_viewed`
- `dfy_inquiry_submitted`

Events are pushed to `dataLayer` and, when present, PostHog, Plausible, or Vercel Analytics. They are also kept locally for QA. No external analytics destination is configured by this repository alone.

Additional paid-path events currently instrumented include service-page views, application starts, confirmed or failed handoffs, and Build Review booking-link requests. These events are still instrumented rather than collected until an external destination is connected and verified.

## Form handoff

Both Formspree conversion paths include structured fields for:

- brief ID and ruleset
- starter, working, or growth route
- stack level
- 90-day goal
- implementation preference
- recommended products
- first-touch attribution
- quiz start and completion times

The Expansion Works form also receives the symptom, complete portable brief, and selected system decisions.

## 90-day revenue-per-lead joins

The stable `stackbrief_id` is the join key:

1. Attach the ID to the captured lead.
2. Record every referred vendor click with the same ID when an analytics destination is connected.
3. Import approved partner commissions with vendor, approval date, and the best available referral identifier.
4. Attribute approved revenue occurring within 90 days of lead capture.

Until an external analytics destination and partner reporting workflow are connected, clicks are instrumented but not durably collected across devices. Do not report 90-day revenue per lead as measured before that boundary is completed.

## Finished paid-path join

The intended paid flow preserves `stackbrief_id` through:

1. Qualified result.
2. Checkout creation.
3. Payment confirmation webhook.
4. Paid scheduling.
5. Meeting packet.
6. Build Review outcome.
7. Diagnostic or installation revenue.

The current Formspree request step does not complete this join. It remains a temporary handoff until payment and scheduling credentials are connected.

## October 13 rule-based repair release

`assets/stackbrief-rules.js` contains nine process questions and authored result modules. `assets/stackbrief.js` renders them immediately without a scan, API, or free manual review. Catalog facts and affiliate relationships do not control the result. Low inquiries do not prove low traffic or poor conversion. Specific reported defects can be repaired while demand remains uncertain.

The existing storage keys, brief ID, and attribution remain. Sessions from older rulesets restart rather than mixing incompatible answers. Results can be copied or downloaded. Email delivery is not connected or advertised.

The service form accepts implementation, optional review, or diagnostic inquiries. Direct buyers do not need a quiz. A matching browser-local result is attached only when the visitor follows the result handoff. Answers are not placed in the URL. No test lead was submitted.

Paid fit requires reported repair evidence, five or more inquiries, at least $5,000 customer value, and an implementation-help preference. This is screening logic, not proof of ROI. Other visitors retain useful materials and can visit the service page directly.

Public offer uses Customer Journey Repair as its working name, existing installation range and 50/50 payment structure. Exact scope, dates, support, and failure remedy must be settled in the proposal. No new universal timeline or revenue guarantee is published.

## BANT deposit route

Xavier selected the $4,000 standard package and $2,000 deposit via the existing Square account. /sales now uses need, budget, authority, timing, and scope questions. Answers stay locally in repair_fit_v1 until a deliberate onboarding submission. Low-fit visitors receive free resources without a sales form. Checkout receives payment/contact data directly in Square; card details never enter the site. The real Square-hosted checkout redirects to /onboarding after payment. The page does not assert paid status. Every onboarding record is unverified until matched in Square. No payment webhooks or automatic project activation are claimed.

## Sales-page revision, October 13

The priced package and BANT rules remain. Ruleset 2026-10-13.2 requires a deliberate setup-confirmation submission after qualification, before a Square deposit link is sent. It collects name, email, page, current tools, preferred start date, fit answers, and an explicitly attached brief through the existing Formspree endpoint. Qualification alone cannot verify compatibility or availability. Xavier manually confirms supported setup, start date, milestones, acceptance tests, preparation, support allowance, and failure remedy in the written order. No automatic email or payment verification is connected. Low-fit branches remain free; shared approval and larger scope have a contact route. Existing Square checkout and post-payment onboarding remain available for confirmed orders. Earlier order terms are preserved at /repair-terms-v1.html. Form submission delivery has not been tested by creating a lead.
