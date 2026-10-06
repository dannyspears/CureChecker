// Lists the freshest studies across all reports so the daily blog post can pick the best update.
// Usage: node tools/blog-candidates.js [days=2]
// Ranks: a result (data-k="result") beats underway, which beats science; positive/approval pills first.
// It only lists candidates. Choosing one and writing the post is the daily refresh's job (see CLAUDE.md).
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..'), days = +process.argv[2] || 2;
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/diseases.js'), 'utf8'), ctx);
const used = new Set(fs.readdirSync(path.join(root, 'blog/src')).map(f => JSON.parse(fs.readFileSync(path.join(root, 'blog/src', f), 'utf8'))).map(p => p.disease + '|' + p.title));
const MON = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const today = new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }) + 'T12:00:00Z');
const clean = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const rows = [];
for (const d of ctx.window.CURECHECKER_DISEASES) {
  const html = fs.readFileSync(path.join(root, d.page), 'utf8');
  const re = /<div class="study" data-k="(\w+)"><time>([^<]*)<\/time><div><h3>([\s\S]*?)<\/h3><p>([\s\S]*?)<\/p>([\s\S]*?)<\/div><span class="pill ([\w-]+)">([^<]*)<\/span>/g;
  let m;
  while ((m = re.exec(html))) {
    const t = m[2].match(/^([A-Z][a-z]{2}) (\d{1,2}), (\d{4})$/);
    if (!t) continue;                                    // skip month-only dates: can't tell how fresh
    const when = new Date(Date.UTC(+t[3], MON[t[1]], +t[2], 12));
    if ((today - when) / 864e5 > days) continue;
    const link = (m[5].match(/href="([^"]+)"/) || [])[1] || '';
    const score = { result: 3, underway: 2, science: 1 }[m[1]] + (/good/.test(m[6]) ? 2 : 0);
    rows.push({ score, disease: d.slug, when: m[2], kind: m[1], pill: m[7], title: clean(m[3]), text: clean(m[4]), link, used: used.has(d.slug + '|' + clean(m[3])) });
  }
}
rows.sort((a, b) => b.score - a.score);
rows.forEach(r => console.log(`[${r.score}] ${r.disease} · ${r.when} · ${r.kind}/${r.pill}${r.used ? ' (already blogged)' : ''}\n  ${r.title}\n  ${r.text}\n  ${r.link}\n`));
if (!rows.length) console.log('No dated studies in the last ' + days + ' days.');
