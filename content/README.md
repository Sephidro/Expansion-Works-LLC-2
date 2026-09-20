# StackBrief content source

Each public guide has one JSON record in `content/articles/`.

- `managed: true` means `tools/build-content.mjs` generates the article HTML.
- `managed: false` keeps an existing hand-authored page while still using its metadata for the guides index, sitemap, feed, and AI-readable site summary.
- `status: published` includes the article in public outputs.
- `draft`, `voice_review`, and `ready_for_publish` remain private workflow states and are not published.

New article records must include a unique ID, slug, title, deck, excerpt, author, dates, read time, SEO fields, CTA, sources, and structured body blocks. Public prose never belongs in the automation run ledger.

Supported body blocks:

- `heading`
- `paragraph`
- `callout`
- `list`
- `sources`

Paragraphs and list items support links written as `[label](https://example.com)`. Raw HTML is not accepted.
