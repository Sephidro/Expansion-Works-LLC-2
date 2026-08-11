# StackBrief data spine

StackBrief uses browser storage to preserve an unfinished brief and carry a completed diagnosis into the Expansion Works application. This is continuity infrastructure, not a replacement for an analytics database.

## Versions

- Funnel utility: `1.0.0`
- Quiz ruleset: `2026-08-11.2`
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
