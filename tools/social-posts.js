// Builds four social posts (Facebook, Instagram, X) plus a square image card for each.
// Usage: node tools/social-posts.js [YYYY-MM-DD]   (default: today, Eastern time)
// Output: social/<date>/posts.md and social/<date>/post-1.png ... post-4.png
// Text comes only from what the reports already say (headline strip and newest study).
// Needs Playwright with Chromium (PLAYWRIGHT_BROWSERS_PATH is set in the cloud sandbox).
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const SITE = 'https://curechecker.com/';

const date = process.argv[2] ||
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
const dow = new Date(date + 'T12:00:00Z').getUTCDay();   // 1 = Monday
const dayNo = Math.floor(new Date(date + 'T12:00:00Z') / 864e5);

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/diseases.js'), 'utf8'), ctx);
const all = ctx.window.CURECHECKER_DISEASES;
const pool = all.filter(d => d.cadence === 'daily' || dow === 1);

const css = fs.readFileSync(path.join(root, 'assets/curechecker.css'), 'utf8');
function palette(name) {
  const m = css.match(new RegExp('\\[data-palette="' + name + '"\\]\\{([^}]*)\\}'));
  const v = {};
  (m ? m[1] : '').replace(/--([\w-]+):\s*(#[0-9A-Fa-f]{6})/g, (_, k, c) => (v[k] = c));
  return v;
}
const clean = s => s.replace(/<[^>]+>/g, '')
  .replace(/&middot;/g, '·').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
  .replace(/&rsquo;|&#8217;/g, "'").replace(/&ndash;/g, '–').replace(/&times;/g, '×')
  .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const firstSentence = s => (s.match(/^.*?[.!?](?=\s|$)/) || [s])[0];
const sentences = (s, n) => { let o = ''; for (const t of s.match(/[^.!?]+[.!?]+(\s|$)/g) || [s]) { if ((o + t).length > n && o) break; o += t; } return o.trim(); };
const trim = (s, n) => s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';

function read(d) {
  const html = fs.readFileSync(path.join(root, d.page), 'utf8');
  const headline = clean((html.match(/id="headline">([\s\S]*?)<\/span>/) || [, ''])[1]);
  const st = html.match(/<div class="study"[^>]*><time>([^<]*)<\/time><div><h3>([\s\S]*?)<\/h3><p>([\s\S]*?)<\/p>/);
  return { headline, study: st ? { when: clean(st[1]), title: clean(st[2]), text: clean(st[3]) } : null };
}

// Rotate through the list so every report comes round; 4 distinct per day.
const picks = [0, 1, 2, 3].map(i => pool[(dayNo * 4 + i) % pool.length]);

const tag = d => '#' + d.name.replace(/\(.*?\)/g, '').replace(/[^A-Za-z0-9]+/g, '');
const out = path.join(root, 'social', date);
fs.mkdirSync(out, { recursive: true });

const posts = picks.map((d, i) => {
  const { headline, study } = read(d);
  const link = SITE + d.page;
  const fact = headline || d.summary;
  const detail = study ? `${study.title} (${study.when}): ${firstSentence(study.text)}` : d.summary;
  const short = d.name.replace(/\s*\(.*?\)/, '');
  const tags = [tag({ name: short }), '#ClinicalTrials', '#MedicalResearch', '#CureChecker'];
  const fb = `${short}: what's new\n\n${fact}\n\nLatest study we logged: ${detail}\n\nFull report with sources: ${link}\n\nCure Checker is gathered by AI each day and is not medical advice. Talk to your doctor before making health decisions.`;
  const ig = `${short}: what's new\n\n${fact}\n\n${trim(detail, 300)}\n\nFull report with sources at the link in our bio.\nNot medical advice.\n\n${tags.join(' ')}`;
  let x = `${short}: ${fact}`;
  const room = 280 - 23 - 1 - tags[0].length - 1 - 2;      // link counts as 23, plus gaps
  x = `${trim(x, room)}\n${link}\n${tags[0]}`;
  const p = palette(d.palette);
  return { d, short, fact, fb, ig, x, p, file: `post-${i + 1}.png` };
});

const card = (po, label) => `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;width:1080px;height:1080px;background:${po.p.paper || '#F3F8FC'};
font-family:Georgia,'Times New Roman',serif;color:${po.p.ink || '#12263A'};display:flex;flex-direction:column;position:relative;overflow:hidden}
.band{height:44px;background:${po.p.signal || '#1C86C9'}}
.in{position:relative;z-index:1;padding:70px 80px 0;flex:1;display:flex;flex-direction:column}
.k{font:700 28px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${po.p.blue || po.p.signal}}
h1{font-size:92px;line-height:1.02;margin:26px 0 34px}
p{font-size:56px;line-height:1.26;margin:0;color:${po.p.ink}}
.ft{display:flex;justify-content:space-between;align-items:center;padding:34px 80px;background:${po.p['signal-soft'] || '#DAEDFA'};font:700 30px Arial,sans-serif}
.circ{position:absolute;right:-170px;top:120px;width:480px;height:480px;border-radius:50%;background:${po.p.sky || '#B9DDF5'};opacity:.55}
</style><div class="band"></div><div class="circ"></div><div class="in"><div class="k">${label}</div>
<h1>${esc(po.short)}</h1><p>${esc(sentences(po.fact, 200))}</p></div>
<div class="ft"><span>Cure Checker</span><span>curechecker.com/${po.d.page}</span></div>`;

(async () => {
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  for (const po of posts) {
    await pg.setContent(card(po, 'Research update · ' + date));
    await pg.screenshot({ path: path.join(out, po.file) });
  }
  await b.close();
  const md = [`# Cure Checker social posts, ${date}`, '',
    'Each post: Facebook text, Instagram caption, X post (280 characters or fewer, link counted as 23), and an image card. Review before posting.', ''];
  posts.forEach((po, i) => md.push(`## Post ${i + 1}: ${po.d.name}`, '', `Image: ${po.file}`, '',
    '**Facebook**', '', po.fb, '', '**Instagram**', '', po.ig, '', `**X** (${po.x.length - po.x.split('\n')[1].length + 23} chars)`, '', po.x, '', '---', ''));
  fs.writeFileSync(path.join(out, 'posts.md'), md.join('\n'));
  console.log('wrote', out, posts.map(p => p.short).join(', '));
})();
