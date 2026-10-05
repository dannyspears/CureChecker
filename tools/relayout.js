// Re-orders one Cure Checker report page. Usage: node transform.js <in.html> [<out.html>]
// Idempotent: a page that already has <section id="care"> is left unchanged.
const fs=require('fs');
const [,, src, out]=process.argv;
const raw=fs.readFileSync(src,'utf8');
const crlf=raw.includes('\r\n');
let h=raw.replace(/\r\n/g,'\n');
if(h.includes('<section id="care"')){console.log('SKIP (already new layout) '+src);process.exit(0)}
const idx=(s,f=0)=>h.indexOf(s,f);
function must(v,msg){if(v<0)throw new Error(msg);return v}
function section(id){
  let a=must(idx('<section id="'+id+'"'),'no section '+id);
  const b=must(idx('</section>',a),'unclosed '+id)+10;
  // keep the HTML comment block(s) sitting directly above the section (daily-refresh markers)
  for(;;){const before=h.slice(0,a).replace(/\s+$/,'');if(before.endsWith('-->')){const c=before.lastIndexOf('<!--');if(c<0)break;a=c}else break}
  return h.slice(a,b);
}
function balanced(str,start){let depth=0,re=/<div\b|<\/div>/g;re.lastIndex=start;let m;while((m=re.exec(str))){if(m[0]==='</div>'){depth--;if(depth===0)return m.index+6}else depth++}throw new Error('unbalanced div')}
const leadA=must(idx('<div class="lead">'),'no lead');
const tocA=must(idx('<nav class="toc"'),'no toc');
const pre=h.slice(0,leadA);
let lead=h.slice(leadA,tocA).replace(/\n\s*<p>Cure Checker tracks[\s\S]*?<\/p>/,'');
const sourcesA=must(idx('<section id="sources"'),'no sources');
const tail=h.slice(must(idx('</section>',sourcesA),'sources unclosed')+10);
const ids=['verdict','cause','treatments','studies','world','registries','natural','support-groups','sources'];
const S={};ids.forEach(i=>S[i]=section(i));
// centers block out of treatments
let t=S.treatments;
const cs=must(t.indexOf('<div class="subhead">Where people find expert care</div>'),'no centers heading');
const noteA=must(t.indexOf('centers-note'),'no centers note');
const ce=must(t.indexOf('</p>',noteA),'centers note unclosed')+4;
const centers=t.slice(cs,ce);
S.treatments=t.slice(0,cs).replace(/\s+$/,'')+'\n'+t.slice(ce);
// live trial block out of world
let w=S.world;
const liveMark=must(w.indexOf('recruiting right now</div>'),'no live heading');
const liveSubA=w.lastIndexOf('<div class="subhead">',liveMark);
const gridA=must(w.indexOf('<div class="live-grid">',liveSubA),'no live-grid');
const gridEnd=balanced(w,gridA);
const liveBlock=w.slice(liveSubA,gridEnd);
S.world=w.slice(0,liveSubA).replace(/\s+$/,'')+'\n'+w.slice(gridEnd);
// registries: rename and add live block
let r=S.registries;
r=r.replace(/<h2>Every registry, checked<\/h2>/,'<h2>Find a clinical trial</h2>');
const rs=must(r.indexOf('<div class="reg-stats"'),'no reg-stats');
S.registries=r.slice(0,rs)+liveBlock+'\n  '+r.slice(rs);
const care='<section id="care">\n  <div class="sec-head">\n    <h2>Where to get care and support</h2>\n    <p>Centers recognized for expertise in this condition, and communities of people living with it.</p>\n  </div>\n  '+centers+'\n</section>';
const toc='<nav class="toc" aria-label="Sections">\n  <a href="#verdict">Is there a cure?</a>\n  <a href="#studies">What\'s new</a>\n  <a href="#treatments">Treatments</a>\n  <a href="#care">Care &amp; support</a>\n  <a href="#world">Other countries</a>\n  <a href="#cause">What causes it</a>\n  <a href="#registries">Find a trial</a>\n  <a href="#sources">Sources</a>\n</nav>\n\n';
let o=pre+lead+toc+[S.verdict,S.studies,S.treatments,S.natural,care,S['support-groups'],S.world,S.cause,S.registries,S.sources].join('\n\n')+tail;
// add layout.js after newsletter.js (or curechecker.js)
if(!o.includes('assets/layout.js')){
  if(o.includes('<script src="assets/newsletter.js"></script>'))o=o.replace('<script src="assets/newsletter.js"></script>','<script src="assets/newsletter.js"></script>\n<script src="assets/layout.js"></script>');
  else if(o.includes('<script src="assets/donate.js"></script>'))o=o.replace('<script src="assets/donate.js"></script>','<script src="assets/donate.js"></script>\n<script src="assets/layout.js"></script>');
  else throw new Error('no script anchor');
}
// sanity: every id exactly once, same section count
for(const i of [...ids,'care']){const n=(o.match(new RegExp('<section id="'+i+'"','g'))||[]).length;if(n!==1)throw new Error('id '+i+' count '+n)}
if(o.replace(/\s/g,'').length<h.replace(/\s/g,'').length-300)throw new Error('content lost');
if(crlf)o=o.replace(/\n/g,'\r\n');
fs.writeFileSync(out||src,o);
console.log('OK '+src);
