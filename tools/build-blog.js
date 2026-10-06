// Builds the blog from blog/src/*.json:
//   blog/<slug>.html   one static, crawlable post (SEO tags, JSON-LD Article + FAQ + breadcrumbs)
//   blog/img/<slug>.png  1200x630 share image (needs Playwright; skipped if missing)
//   blog.html          the blog index, newest first
//   sitemap.xml, robots.txt
// Usage: node tools/build-blog.js
// Post spec (blog/src/<slug>.json):
//   { slug, title, description (<=160 chars), date "YYYY-MM-DD", disease (slug in assets/diseases.js),
//     keywords: [..], summary, sections: [{ h, p: [..], ul: [..] }],
//     faq: [{ q, a }], sources: [{ title, publisher, url }] }
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const SITE = 'https://curechecker.com';
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/diseases.js'), 'utf8'), ctx);
const diseases = ctx.window.CURECHECKER_DISEASES;
const css = fs.readFileSync(path.join(root, 'assets/curechecker.css'), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const human = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

const posts = fs.readdirSync(path.join(root, 'blog/src')).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(root, 'blog/src', f), 'utf8')))
  .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
const dis = s => diseases.find(d => d.slug === s);

function check(p) {
  const bad = [];
  if (!/^[a-z0-9-]+$/.test(p.slug)) bad.push('slug');
  if (!dis(p.disease)) bad.push('disease');
  if (!p.description || p.description.length > 160) bad.push('description must be 1-160 chars');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) bad.push('date');
  if (!p.sources || !p.sources.length) bad.push('sources (every post needs at least one)');
  if (!p.sections || !p.sections.length) bad.push('sections');
  if (bad.length) throw new Error(p.slug + ': ' + bad.join(', '));
}

const head = (o) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}">
<link rel="canonical" href="${o.url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:site_name" content="Cure Checker">
<meta property="og:type" content="${o.type}">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:url" content="${o.url}">
<meta property="og:image" content="${o.image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(o.title)}">
<meta name="twitter:description" content="${esc(o.description)}">
<meta name="twitter:image" content="${o.image}">
<link rel="icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${o.ld.map(j => '<script type="application/ld+json">' + JSON.stringify(j) + '</script>').join('\n')}
<style>html{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body${o.palette ? ' data-palette="' + o.palette + '"' : ''}>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Source+Sans+3:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/assets/curechecker.css">
<div class="wrap">

<nav class="crumbs" aria-label="Breadcrumb">
  <a href="/index.html">← All conditions/diseases</a>
  <a href="/blog.html">Blog</a>
</nav>

<header class="mast">
  <div class="brand">
    <div>
      <a class="logo" href="/index.html" aria-label="Cure Checker home">
        <span class="lg-box" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="var(--paper)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <span class="lg-text" aria-hidden="true"><span class="lg-1">Cure</span><span class="lg-2">Checker</span></span>
      </a>
      <div class="tag">Blog</div>
    </div>
  </div>
</header>
`;
const foot = `
<footer>
  <div><b>About Cure Checker.</b> An independent, AI-assisted daily digest of medical research, rebuilt every morning (weekly for non-incurable conditions) from trial announcements, peer-reviewed papers and patient-organization updates.</div>
  <div><b>Not medical advice.</b> No doctors review these pages. Talk with your doctor before changing treatment or starting supplements.</div>
  <div class="foot-links"><a href="/index.html">All conditions/diseases</a><a href="/blog.html">Blog</a><a href="/about.html">About us</a><a href="/about.html#contact">Contact</a><a href="/terms.html">Terms of Use</a><a href="https://clinicaltrials.gov" target="_blank" rel="noopener">ClinicalTrials.gov</a></div>
</footer>
</div>

<script src="/assets/analytics.js"></script>
</body>
</html>
`;

function postHtml(p) {
  const d = dis(p.disease), url = `${SITE}/blog/${p.slug}.html`, image = `${SITE}/blog/img/${p.slug}.png`;
  const title = `${p.title} | Cure Checker`;
  const ld = [{
    '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: p.description,
    datePublished: p.date, dateModified: p.date, image: [image], keywords: (p.keywords || []).join(', '),
    mainEntityOfPage: url, about: d.name,
    author: { '@type': 'Organization', name: 'Cure Checker', url: SITE + '/' },
    publisher: { '@type': 'Organization', name: 'Cure Checker', logo: { '@type': 'ImageObject', url: SITE + '/apple-touch-icon.png' } }
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Cure Checker', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE + '/blog.html' },
      { '@type': 'ListItem', position: 3, name: p.title, item: url }]
  }];
  if (p.faq && p.faq.length) ld.push({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: p.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  });
  const body = p.sections.map(s => `  <h2>${esc(s.h)}</h2>\n` +
    (s.p || []).map(t => `  <p>${esc(t)}</p>\n`).join('') +
    (s.ul ? '  <ul>\n' + s.ul.map(t => `    <li>${esc(t)}</li>\n`).join('') + '  </ul>\n' : '')).join('');
  const faq = p.faq && p.faq.length ? '  <h2>Frequently asked questions</h2>\n' +
    p.faq.map(f => `  <h3>${esc(f.q)}</h3>\n  <p>${esc(f.a)}</p>\n`).join('') : '';
  const src = '  <h2>Sources</h2>\n  <ul>\n' + p.sources.map(s =>
    `    <li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>${s.publisher ? '. ' + esc(s.publisher) : ''}</li>\n`).join('') + '  </ul>\n';
  const more = posts.filter(o => o.slug !== p.slug).slice(0, 3);
  const moreHtml = more.length ? '  <h2>More from the blog</h2>\n  <ul>\n' + more.map(o =>
    `    <li><a href="/blog/${o.slug}.html">${esc(o.title)}</a> (${human(o.date)})</li>\n`).join('') + '  </ul>\n' : '';
  return head({ title, description: p.description, url, image, type: 'article', ld, palette: d.palette }) + `
<main class="legal blog-post">
  <article>
  <p class="meta"><a href="/blog.html">Blog</a> · ${esc(d.name)} · <time datetime="${p.date}">${human(p.date)}</time></p>
  <h1>${esc(p.title)}</h1>

  <p class="summary"><b>In short:</b> ${esc(p.summary)}</p>
  <img class="blog-hero" src="/blog/img/${p.slug}.png" width="1200" height="630" alt="${esc(p.title)}">

${body}${faq}  <p class="blog-cta"><a href="/${d.page}"><b>Read the full ${esc(d.name)} report</b></a>: latest studies, treatments, trials near you, expert care centers and support groups, updated ${d.cadence === 'weekly' ? 'weekly' : 'daily'}.</p>

${src}${moreHtml}  <p class="meta">This post was written with AI from the sources listed above and has not been reviewed by a doctor. It is not medical advice. Talk with your doctor before changing treatment. See our <a href="/terms.html">Terms of Use</a>.</p>
  </article>
</main>
` + foot;
}

function indexHtml() {
  const url = SITE + '/blog.html';
  const desc = 'Plain-language news on the latest cure and treatment research for serious conditions and diseases, written daily from trial announcements and peer-reviewed papers.';
  const ld = [{ '@context': 'https://schema.org', '@type': 'Blog', name: 'Cure Checker Blog', url, description: desc,
    blogPost: posts.map(p => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE}/blog/${p.slug}.html`, datePublished: p.date })) }];
  const list = posts.length ? posts.map(p => { const d = dis(p.disease); return `    <article class="blog-card" data-palette="${d.palette}">
      <p class="meta">${esc(d.name)} · <time datetime="${p.date}">${human(p.date)}</time></p>
      <h2><a href="/blog/${p.slug}.html">${esc(p.title)}</a></h2>
      <p>${esc(p.description)}</p>
    </article>
`; }).join('') : '    <p>The first post is coming soon.</p>\n';
  return head({ title: 'Cure Checker Blog: latest cure and treatment research news', description: desc, url, image: SITE + '/apple-touch-icon.png', type: 'website', ld }) + `
<main class="legal blog-index">
  <h1>Cure Checker Blog</h1>
  <p class="meta">One new post a day on the biggest update in the research we track</p>
  <p class="summary"><b>In short:</b> Every day we look through all the conditions and diseases on Cure Checker for new studies, approvals and trial news, then write up the most important update in plain language, with sources.</p>
  <!-- CURECHECKER:BLOG-LIST -->
  <div class="blog-list">
${list}  </div>
</main>
` + foot;
}

(async () => {
  posts.forEach(check);
  posts.forEach(p => fs.writeFileSync(path.join(root, 'blog', p.slug + '.html'), postHtml(p)));
  fs.writeFileSync(path.join(root, 'blog.html'), indexHtml());

  const urls = ['/', '/blog.html', ...diseases.map(d => '/' + d.page), '/about.html', '/terms.html']
    .map(u => `  <url><loc>${SITE}${u}</loc></url>`)
    .concat(posts.map(p => `  <url><loc>${SITE}/blog/${p.slug}.html</loc><lastmod>${p.date}</lastmod></url>`));
  fs.writeFileSync(path.join(root, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

  try {
    const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1200, height: 630 } });
    for (const p of posts) {
      const f = path.join(root, 'blog/img', p.slug + '.png');
      if (fs.existsSync(f)) continue;
      const d = dis(p.disease), v = {};
      (css.match(new RegExp('\\[data-palette="' + d.palette + '"\\]\\{([^}]*)\\}')) || [, ''])[1]
        .replace(/--([\w-]+):\s*(#[0-9A-Fa-f]{6})/g, (_, k, c) => (v[k] = c));
      await pg.setContent(`<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:${v.paper};color:${v.ink};font-family:Georgia,serif;display:flex;flex-direction:column}
.band{height:36px;background:${v.signal}}.in{flex:1;padding:44px 70px 0}.k{font:700 24px Arial;letter-spacing:.14em;text-transform:uppercase;color:${v.blue}}
h1{font-size:${p.title.length > 70 ? 52 : 60}px;line-height:1.1;margin:22px 0 0}.ft{display:flex;justify-content:space-between;padding:26px 70px;background:${v['signal-soft']};font:700 26px Arial}</style>
<div class="band"></div><div class="in"><div class="k">${esc(d.name)} · research update</div><h1>${esc(p.title)}</h1></div>
<div class="ft"><span>Cure Checker</span><span>curechecker.com</span></div>`);
      await pg.screenshot({ path: f });
    }
    await b.close();
  } catch (e) { console.log('Share images skipped:', e.message.split('\n')[0]); }
  console.log('Built', posts.length, 'post(s), blog.html, sitemap.xml, robots.txt');
})();
