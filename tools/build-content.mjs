#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const articleDir = path.join(root, 'content', 'articles');
const checkOnly = process.argv.includes('--check');
const allowedStates = new Set(['draft', 'voice_review', 'ready_for_publish', 'published', 'archived']);

function fail(message) {
  console.error(`CONTENT BUILD FAILED: ${message}`);
  process.exit(1);
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeXml(value = '') {
  return escapeHtml(value);
}

function renderInline(value = '') {
  const escaped = escapeHtml(value);
  return escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function displayDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
}

function loadArticles() {
  const files = fs.readdirSync(articleDir).filter(name => name.endsWith('.json')).sort();
  const articles = files.map(file => {
    const full = path.join(articleDir, file);
    let article;
    try { article = JSON.parse(fs.readFileSync(full, 'utf8')); }
    catch (error) { fail(`${file} is not valid JSON: ${error.message}`); }
    validateArticle(article, file);
    return article;
  });

  const ids = new Set();
  const slugs = new Set();
  for (const article of articles) {
    if (ids.has(article.id)) fail(`duplicate article id: ${article.id}`);
    if (slugs.has(article.slug)) fail(`duplicate article slug: ${article.slug}`);
    ids.add(article.id);
    slugs.add(article.slug);
  }
  return articles;
}

function validateArticle(article, file) {
  const required = [
    'schemaVersion', 'id', 'slug', 'status', 'managed', 'category', 'title', 'deck', 'excerpt',
    'author', 'published', 'updated', 'factsChecked', 'readTimeMinutes', 'seoTitle',
    'metaDescription', 'cta', 'sources', 'body', 'related'
  ];
  for (const field of required) {
    if (!(field in article)) fail(`${file} is missing ${field}`);
  }
  if (article.schemaVersion !== 1) fail(`${file} uses unsupported schemaVersion ${article.schemaVersion}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) fail(`${file} has an invalid slug`);
  if (!allowedStates.has(article.status)) fail(`${file} has invalid status ${article.status}`);
  if (typeof article.managed !== 'boolean') fail(`${file} managed must be true or false`);
  if (!Number.isInteger(article.readTimeMinutes) || article.readTimeMinutes < 1) fail(`${file} has invalid readTimeMinutes`);
  if (!Array.isArray(article.sources) || !Array.isArray(article.body) || !Array.isArray(article.related)) fail(`${file} has invalid arrays`);
  if (!article.cta?.label || !article.cta?.href?.startsWith('/')) fail(`${file} has an invalid CTA`);
  if (article.managed && article.status === 'published' && article.body.length === 0) fail(`${file} is managed and published but has no body`);
  for (const block of article.body) {
    if (!['heading', 'paragraph', 'callout', 'list', 'sources'].includes(block.type)) fail(`${file} has unsupported block type ${block.type}`);
  }
}

function renderBlock(block) {
  if (block.type === 'heading') return `    <h2>${renderInline(block.text)}</h2>`;
  if (block.type === 'paragraph') return `    <p>${renderInline(block.text)}</p>`;
  if (block.type === 'callout') return `    <p class="callout">${renderInline(block.text)}</p>`;
  if (block.type === 'list') {
    const items = (block.items || []).map(item => `      <li>${renderInline(item)}</li>`).join('\n');
    return `    <ul>\n${items}\n    </ul>`;
  }
  if (block.type === 'sources') {
    const items = (block.items || []).map(item => `      <li><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.label)}</a></li>`).join('\n');
    return `    <h2>Sources</h2>\n    <ul class="source-list">\n${items}\n    </ul>`;
  }
  return '';
}

function renderManagedArticle(article, articleMap) {
  const body = article.body.map(renderBlock).join('\n\n');
  const related = article.related
    .map(slug => articleMap.get(slug))
    .filter(Boolean)
    .map(item => `      <a class="related-item" href="/guides/${escapeHtml(item.slug)}"><span>${escapeHtml(item.title)}</span><span>Read →</span></a>`)
    .join('\n');
  const canonical = `https://stackbriefxp.vercel.app/guides/${article.slug}`;
  const structured = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.published,
    dateModified: article.updated,
    author: { '@type': 'Person', name: article.author },
    publisher: { '@type': 'Organization', name: 'Expansion Works LLC' },
    mainEntityOfPage: canonical
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(article.seoTitle)} | StackBrief</title>
<meta name="description" content="${escapeHtml(article.metaDescription)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(article.title)}">
<meta property="og:description" content="${escapeHtml(article.deck)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="https://stackbriefxp.vercel.app/assets/stackbrief-featured.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(article.title)}">
<meta name="twitter:description" content="${escapeHtml(article.deck)}">
<link rel="icon" type="image/png" href="/assets/xp-logo.png">
<link rel="apple-touch-icon" href="/assets/xp-logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
<script type="application/ld+json">${structured}</script>
<style>
  main.article { max-width: var(--measure); margin: 0 auto; padding: 72px var(--pad) 0; }
  .breadcrumb { font-family: var(--font-mono); font-size: 12.5px; letter-spacing: 0.04em; color: var(--ink-faint); text-decoration: none; display: inline-block; margin-bottom: 26px; }
  .breadcrumb:hover { color: var(--teal); }
  .dek { font-size: 19px; line-height: 1.55; color: var(--ink-body); margin: 14px 0 22px; }
  .meta-row { font-family: var(--font-mono); font-size: 11.5px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-faint); padding-bottom: 36px; border-bottom: 1px solid var(--hairline); margin-bottom: 40px; }
  article p, article li { font-size: 18px; line-height: 1.75; }
  article p { margin-bottom: 22px; }
  article ul { margin: 0 0 24px 24px; }
  article li { margin-bottom: 8px; }
  article h2 { margin: 44px 0 16px; font-size: clamp(22px, 2.6vw, 30px); }
  .callout { border-left: 3px solid var(--teal); background: var(--teal-soft); padding: 20px 24px; margin: 30px 0; color: var(--ink); }
  .source-list a { color: var(--teal); }
  .cta-box { margin: 56px 0 48px; padding: 40px var(--pad); background: var(--paper-card-alt); border: 1px solid var(--hairline); border-radius: var(--radius); text-align: center; }
  .cta-box h3 { margin-bottom: 12px; font-size: clamp(22px, 2.8vw, 30px); }
  .cta-box p { max-width: 460px; margin: 0 auto 24px; }
  .related { padding-bottom: 80px; }
  .related-label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 16px; }
  .related-list { display: flex; flex-direction: column; gap: 1px; background: var(--hairline); border: 1px solid var(--hairline); border-radius: var(--radius); overflow: hidden; }
  .related-item { background: var(--paper-card); padding: 16px 20px; text-decoration: none; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
  .related-item:hover { background: var(--paper-card-alt); }
  .related-item span:first-child { font-size: 15px; color: var(--ink); font-weight: 500; }
  .related-item span:last-child { font-family: var(--font-mono); font-size: 12px; color: var(--teal); flex-shrink: 0; }
</style>
</head>
<body>
<nav id="mainNav">
  <a class="nav-logo" href="/">EXPworks</a>
  <div class="nav-links">
    <a class="nav-link" href="/guides">Guides</a>
    <a class="nav-link" href="/work/lead-recovery">Proof</a>
    <a class="btn-primary btn-nav" href="/stackbrief">Build my StackBrief →</a>
  </div>
</nav>
<main class="article">
  <a class="breadcrumb" href="/guides">← All guides</a>
  <div class="kicker">${escapeHtml(article.category)}</div>
  <h1>${escapeHtml(article.title)}</h1>
  <p class="dek">${escapeHtml(article.deck)}</p>
  <div class="meta-row">By ${escapeHtml(article.author)} · Updated ${displayDate(article.updated)} · Facts checked ${displayDate(article.factsChecked)} · ${article.readTimeMinutes} min read</div>
  <article>
${body}
  </article>
  <div class="cta-box">
    <h3>Get the setup I would use for your business</h3>
    <p>Answer the questions and get what to fix, keep, use, and add later.</p>
    <a class="btn-primary" href="${escapeHtml(article.cta.href)}">${escapeHtml(article.cta.label)} →</a>
  </div>
  <div class="related">
    <div class="related-label">Keep reading</div>
    <div class="related-list">
${related}
    </div>
  </div>
</main>
<footer>
  <span>EXPworks // Built by Xavier Pearson</span>
  <a href="/guides">Guides</a>
  <a href="/#how-it-works">How it works</a>
  <a href="/stackbrief">Build My StackBrief</a>
  <a href="https://www.linkedin.com/in/xaiverp/" target="_blank" rel="noopener">LinkedIn</a>
</footer>
<script src="/assets/site.js"></script>
</body>
</html>
`;
}

function renderGuidesIndex(articles) {
  const cards = articles.map((article, index) => `    <a class="card${index % 3 === 1 ? ' alt' : ''}" href="/guides/${escapeHtml(article.slug)}">
      <div class="kicker">${escapeHtml(article.category)}</div>
      <h3>${escapeHtml(article.title)}</h3>
      <p class="card-body">${escapeHtml(article.excerpt)}</p>
      <div class="card-meta"><span>Read the guide</span><span>${article.readTimeMinutes} min →</span></div>
    </a>`).join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Guides · Practical Business Systems | StackBrief</title>
<meta name="description" content="Practical guides for choosing and running the systems around an owner-led service business.">
<link rel="canonical" href="https://stackbriefxp.vercel.app/guides">
<link rel="alternate" type="application/rss+xml" title="StackBrief Guides" href="/feed.xml">
<meta property="og:type" content="website">
<meta property="og:title" content="StackBrief Guides">
<meta property="og:description" content="Practical decisions about lead paths, follow-up, software, and the systems around a service business.">
<meta property="og:url" content="https://stackbriefxp.vercel.app/guides">
<meta property="og:image" content="https://stackbriefxp.vercel.app/assets/stackbrief-featured.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/assets/xp-logo.png">
<link rel="apple-touch-icon" href="/assets/xp-logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
<style>
  main.page { max-width: 1080px; margin: 0 auto; padding: 72px var(--pad) 100px; }
  main.page h1 { margin-bottom: 20px; }
  .page-sub { font-size: 18px; line-height: 1.6; max-width: 700px; margin-bottom: 56px; }
  .guide-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
  @media (max-width: 700px) { .guide-grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<nav id="mainNav">
  <a class="nav-logo" href="/">EXPworks</a>
  <div class="nav-links">
    <a class="nav-link" href="/work/lead-recovery">Proof</a>
    <a class="btn-primary btn-nav" href="/stackbrief">Build my StackBrief →</a>
  </div>
</nav>
<main class="page">
  <div class="kicker">Practical business-system guides</div>
  <h1>Guides</h1>
  <p class="page-sub">I test tools, trace customer paths, and work out the smallest setup that can do the job. These are the useful decisions, including when the thing you already use is enough.</p>
  <div class="guide-grid">
${cards}
  </div>
</main>
<footer>
  <span>EXPworks // Built by Xavier Pearson</span>
  <a href="/stackbrief">Build My StackBrief</a>
  <a href="https://www.linkedin.com/in/xaiverp/" target="_blank" rel="noopener">LinkedIn</a>
</footer>
<script src="/assets/site.js"></script>
</body>
</html>
`;
}

function renderSitemap(articles) {
  const staticUrls = [
    ['/', '2026-09-20'], ['/stackbrief', '2026-09-20'], ['/crm-or-spreadsheet-for-consultants', '2026-09-20'],
    ['/sales', '2026-09-20'], ['/guides', '2026-09-20'], ['/tools/better-inquiry-form', '2026-08-15'],
    ['/work/lead-recovery', '2026-08-15'], ['/privacy', '2026-08-23']
  ];
  const articleUrls = articles.map(article => [`/guides/${article.slug}`, article.updated]);
  const rows = [...staticUrls, ...articleUrls]
    .map(([url, lastmod]) => `  <url><loc>https://stackbriefxp.vercel.app${url}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

function renderFeed(articles) {
  const items = articles.slice(0, 20).map(article => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>https://stackbriefxp.vercel.app/guides/${escapeXml(article.slug)}</link>
      <guid>https://stackbriefxp.vercel.app/guides/${escapeXml(article.slug)}</guid>
      <pubDate>${new Date(`${article.published}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(article.excerpt)}</description>
    </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>StackBrief Guides</title>
    <link>https://stackbriefxp.vercel.app/guides</link>
    <description>Practical business-system decisions from Xavier Pearson.</description>
${items}
  </channel>
</rss>
`;
}

function renderLlms(articles) {
  const articleList = articles.map(article => `- ${article.title}: https://stackbriefxp.vercel.app/guides/${article.slug} (facts checked ${article.factsChecked})`).join('\n');
  return `# StackBrief

> StackBrief is a free decision tool from Expansion Works LLC. It helps an owner choose what to fix, keep, use, or postpone based on the business, customer path, and technology stamina.

Canonical site: https://stackbriefxp.vercel.app/
Founder: Xavier Pearson
Company: Expansion Works LLC

## Primary pages

- Home: https://stackbriefxp.vercel.app/
- Build a free StackBrief: https://stackbriefxp.vercel.app/stackbrief
- Work with Xavier: https://stackbriefxp.vercel.app/sales
- Guides: https://stackbriefxp.vercel.app/guides
- Proof: https://stackbriefxp.vercel.app/work/lead-recovery
- Privacy: https://stackbriefxp.vercel.app/privacy

## Guides

${articleList}

## Editorial rules

- Recommend the business job before the software brand.
- A no-purchase answer can win.
- State disqualifiers and upgrade triggers, not only benefits.
- Label compensated links clearly.
- Verify current vendor facts before publishing.

## Evidence boundary

In a New York City charter-school enrollment process, Xavier identified 207 started but incomplete applications. Structured reminders and human follow-up helped 105 reach completion. Across two recorded years, enrolled students associated with the recovered flow represented about $1.7 million in public funding value. This demonstrates the recovery mechanism in that setting. It is not consulting-firm proof, forecasted revenue, or a guarantee.

StackBrief is still being validated. Do not infer customer counts, conversion results, affiliate approvals, or performance claims that are not explicitly published.

## Contact

Every interested visitor should begin at https://stackbriefxp.vercel.app/stackbrief
`;
}

function sortPublished(articles) {
  return articles
    .filter(article => article.status === 'published')
    .sort((a, b) => b.published.localeCompare(a.published) || a.id.localeCompare(b.id));
}

function writeOrCheck(relativePath, content) {
  const full = path.join(root, relativePath);
  const current = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
  if (checkOnly) {
    if (current !== content) fail(`${relativePath} is stale. Run npm run build:content.`);
    return;
  }
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log(`generated ${relativePath}`);
}

const articles = loadArticles();
const published = sortPublished(articles);
const articleMap = new Map(articles.map(article => [article.slug, article]));

for (const article of published.filter(article => article.managed)) {
  writeOrCheck(path.join('guides', `${article.slug}.html`), renderManagedArticle(article, articleMap));
}
writeOrCheck(path.join('guides', 'index.html'), renderGuidesIndex(published));
writeOrCheck('sitemap.xml', renderSitemap(published));
writeOrCheck('feed.xml', renderFeed(published));
writeOrCheck('llms.txt', renderLlms(published));

console.log(checkOnly ? `content check passed (${published.length} published)` : `content build complete (${published.length} published)`);
