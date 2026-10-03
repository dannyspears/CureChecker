// Cure Checker shared page script. Used by every disease report and the landing page.
(function(){
  var DISEASES=window.CURECHECKER_DISEASES||[];
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  // Disease pickers: any <select data-disease-picker> lists every disease and jumps to it
  document.querySelectorAll('select[data-disease-picker]').forEach(function(sel){
    var current=document.body.getAttribute('data-disease')||'';
    sel.innerHTML='<option value="">'+esc(sel.getAttribute('data-placeholder')||'Choose a disease…')+'</option>'+
      DISEASES.slice().sort(function(a,b){return a.name.localeCompare(b.name)}).map(function(d){
        return '<option value="'+esc(d.page)+'"'+(d.slug===current?' selected':'')+'>'+esc(d.name)+'</option>';
      }).join('');
    sel.addEventListener('change',function(){if(sel.value)location.href=sel.value});
  });

  // Landing page tiles
  // Shows the 6 most-visited reports (GoatCounter visit counts, see assets/analytics.js),
  // with a "Show all" button for the rest. Without analytics it shows the list order.
  var tiles=document.getElementById('disease-tiles');
  if(tiles){
    var TOP=6, showAll=false, ranked=DISEASES.slice(), haveCounts=false;
    var note=document.getElementById('tiles-note'), more=document.getElementById('tiles-more'), count=document.getElementById('disease-count');
    function tile(d){
      return '<a class="tile" href="'+esc(d.page)+'"'+(d.palette?' data-palette="'+esc(d.palette)+'"':'')+'>'+
        '<span class="eyebrow">'+esc(d.category)+'</span>'+
        '<h3>'+esc(d.name)+'</h3>'+
        '<p>'+esc(d.summary)+'</p>'+
        '<span class="tile-foot"><span>'+(haveCounts&&d.visits!=null?d.visits.toLocaleString('en-US')+' visits · ':'')+'Updated '+esc(d.updated)+'</span><span aria-hidden="true">→</span></span>'+
      '</a>';
    }
    function renderTiles(){
      tiles.innerHTML=(showAll?ranked:ranked.slice(0,TOP)).map(tile).join('');
      if(more){more.hidden=ranked.length<=TOP;more.textContent=showAll?'Show top '+TOP+' only':'Show all '+ranked.length+' reports';}
      if(note)note.textContent=haveCounts?'Ranked by visits to each report.':(ranked.length>TOP?'Showing '+TOP+' of '+ranked.length+'.':'');
    }
    if(count)count.textContent=DISEASES.length+(DISEASES.length===1?' disease':' diseases');
    if(more)more.addEventListener('click',function(){showAll=!showAll;renderTiles()});
    renderTiles();
    // Visit counts from GoatCounter's public counter (needs "Allow adding visitor counts" enabled in GoatCounter settings)
    var gc=((window.CURECHECKER_ANALYTICS||{}).goatcounter||'').trim();
    if(gc){
      var base=location.pathname.replace(/[^\/]*$/,'');
      Promise.all(DISEASES.map(function(d){
        return fetch('https://'+encodeURIComponent(gc)+'.goatcounter.com/counter/'+encodeURIComponent(base+d.page)+'.json')
          .then(function(r){return r.ok?r.json():{count:'0'}})
          .then(function(j){d.visits=parseInt(String(j.count||'0').replace(/\D/g,''),10)||0})
          .catch(function(){d.visits=null});
      })).then(function(){
        if(!DISEASES.some(function(d){return d.visits!=null}))return;
        haveCounts=true;
        ranked=DISEASES.slice().sort(function(a,b){return (b.visits||0)-(a.visits||0)});
        renderTiles();
      });
    }
  }

  // Study filters
  var btns=document.querySelectorAll('.filters button');
  var rows=document.querySelectorAll('#studies-list .study');
  btns.forEach(function(b){
    b.addEventListener('click',function(){
      var f=b.getAttribute('data-f');
      btns.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
      rows.forEach(function(r){r.hidden=!(f==='all'||r.getAttribute('data-k')===f)});
    });
  });

  // Live: recruiting trials by country, from ClinicalTrials.gov.
  // The condition searched comes from data-condition on the #world section.
  var world=document.getElementById('world');
  var status=document.getElementById('ct-status');
  if(!world||!status)return;
  var cond=world.getAttribute('data-condition');
  var bars=document.getElementById('ct-bars');
  var list=document.getElementById('ct-abroad');
  var more=document.getElementById('ct-more');
  var url='https://clinicaltrials.gov/api/v2/studies?query.cond='+encodeURIComponent(cond)+'&filter.overallStatus=RECRUITING&pageSize=1000&fields=NCTId,BriefTitle,LocationCountry,Phase,InterventionType,StudyType';
  var DRUGS=['DRUG','BIOLOGICAL','GENETIC'];
  function phase(p){
    if(!p||!p.length||p[0]==='NA')return '';
    return p.map(function(x){return x.replace('EARLY_PHASE','Early Phase ').replace('PHASE','Phase ')}).join('/');
  }
  // Follow nextPageToken so diseases with more than 1,000 recruiting studies are fully counted
  function fetchAll(token,acc){
    return fetch(url+(token?'&pageToken='+encodeURIComponent(token):'')).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(j){
      acc=acc.concat(j.studies||[]);
      return j.nextPageToken&&acc.length<20000?fetchAll(j.nextPageToken,acc):{studies:acc};
    });
  }
  fetchAll(null,[]).then(function(j){
    var counts={},abroad=[];
    j.studies.forEach(function(s){
      var p=s.protocolSection,locs=(p.contactsLocationsModule||{}).locations||[];
      var cs=[];locs.forEach(function(l){if(l.country&&cs.indexOf(l.country)<0)cs.push(l.country)});
      cs.forEach(function(c){counts[c]=(counts[c]||0)+1});
      var types=((p.armsInterventionsModule||{}).interventions||[]).map(function(i){return i.type});
      var isDrug=types.some(function(t){return DRUGS.indexOf(t)>=0});
      if(cs.length&&cs.indexOf('United States')<0&&isDrug){
        var ph=(p.designModule||{}).phases||[];
        abroad.push({id:p.identificationModule.nctId,title:p.identificationModule.briefTitle,where:cs.join(', '),phase:phase(ph),rank:ph.join()});
      }
    });
    var top=Object.keys(counts).map(function(k){return [k,counts[k]]}).sort(function(a,b){return b[1]-a[1]}).slice(0,12);
    var max=top.length?top[0][1]:1;
    status.textContent=j.studies.length+' studies are recruiting in '+Object.keys(counts).length+' countries. Top '+top.length+' by number of studies:';
    bars.innerHTML=top.map(function(t){
      return '<div class="cbar'+(t[0]==='United States'?' us':'')+'"><span>'+esc(t[0])+'</span><i style="width:'+(t[1]/max*100)+'%"></i><b>'+t[1]+'</b></div>';
    }).join('');
    abroad.sort(function(a,b){return b.rank.localeCompare(a.rank)});
    function render(n){
      list.innerHTML=abroad.slice(0,n).map(function(t){
        return '<div class="trial"><a href="https://clinicaltrials.gov/study/'+esc(t.id)+'" target="_blank" rel="noopener">'+esc(t.title)+'</a><div class="who">'+esc(t.where)+(t.phase?' · '+esc(t.phase):'')+' · '+esc(t.id)+'</div></div>';
      }).join('')||'<p class="status-note">None found today.</p>';
      more.hidden=n>=abroad.length;
      more.textContent='Show all '+abroad.length;
    }
    render(8);
    more.addEventListener('click',function(){render(abroad.length)});
  }).catch(function(){
    status.innerHTML='Live trial data could not load right now. Search directly on <a href="https://clinicaltrials.gov/search?cond='+encodeURIComponent(cond)+'&aggFilters=status:rec" target="_blank" rel="noopener">ClinicalTrials.gov</a>.';
  });
})();

// Every registry, checked: live data from PubMed, Europe PMC, ISRCTN, ClinicalTrials.gov and
// Drugs@FDA (openFDA), plus the EU CTIS snapshot from assets/registry-snapshot.js.
(function(){
  var box=document.getElementById('registries');
  if(!box)return;
  var slug=document.body.getAttribute('data-disease');
  var d=(window.CURECHECKER_DISEASES||[]).filter(function(x){return x.slug===slug})[0];
  if(!d)return;
  var snap=((window.CURECHECKER_REGISTRY||{}).diseases||{})[slug]||{};
  var snapDate=(window.CURECHECKER_REGISTRY||{}).generated||'';
  var world=document.getElementById('world');
  var ctTerm=(world&&world.getAttribute('data-condition'))||d.search;
  var q=encodeURIComponent;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function $(id){return document.getElementById(id)}
  function getJSON(u){return fetch(u).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})}
  function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
  function fmt(n){return Number(n).toLocaleString('en-US')}
  function fail(id,label,url){$(id).innerHTML='<p class="status-note">Couldn\'t load right now. <a href="'+url+'" target="_blank" rel="noopener">Search '+label+' directly</a>.</p>'}

  // Stat tiles: each fills in as its source answers
  var stats=[
    ['st-ct','Recruiting trials','ClinicalTrials.gov'],
    ['st-ctis','Trials in the EU registry','EU CTIS · '+(snapDate?'snapshot '+snapDate:'snapshot')],
    ['st-isrctn','Registered trials','ISRCTN'],
    ['st-pubmed','Papers in the last 12 months','PubMed'],
    ['st-preprint','Preprints in the last 12 months','Europe PMC'],
    ['st-cochrane','Cochrane systematic reviews','Cochrane via PubMed']
  ];
  $('reg-stats').innerHTML=stats.map(function(s){return '<div class="reg-stat"><b id="'+s[0]+'">…</b><span>'+s[1]+'</span><small>'+esc(s[2])+'</small></div>'}).join('');
  function setStat(id,v){$(id).textContent=v==null?'—':fmt(v)}

  // ClinicalTrials.gov recruiting count
  getJSON('https://clinicaltrials.gov/api/v2/studies?query.cond='+q(ctTerm)+'&filter.overallStatus=RECRUITING&countTotal=true&pageSize=1&fields=NCTId')
    .then(function(j){setStat('st-ct',j.totalCount)}).catch(function(){setStat('st-ct',null)});

  // EU CTIS (snapshot built by tools/update-registries.ps1)
  var ctis=snap.ctis;
  setStat('st-ctis',ctis?ctis.total:null);
  $('reg-ctis-src').textContent='EU Clinical Trials Information System · snapshot '+(snapDate||'n/a');
  $('reg-ctis').innerHTML=ctis&&ctis.newest&&ctis.newest.length?ctis.newest.map(function(t){
    return '<div class="trial"><a href="https://euclinicaltrials.eu/search-for-clinical-trials/?lang=en&EUCT='+q(t.id)+'" target="_blank" rel="noopener">'+esc(t.title)+'</a><div class="who">'+esc(t.countries)+' · '+esc(t.sponsor)+' · authorised '+esc(t.decided)+' · '+esc(t.id)+'</div></div>';
  }).join(''):'<p class="status-note">No EU CTIS snapshot yet.</p>';

  // ISRCTN (XML API)
  fetch('https://www.isrctn.com/api/query/format/default?q='+q(d.search)+'&limit=100').then(function(r){if(!r.ok)throw new Error(r.status);return r.text()}).then(function(x){
    var doc=new DOMParser().parseFromString(x,'application/xml');
    setStat('st-isrctn',doc.documentElement.getAttribute('totalCount'));
    function first(el,n){var e=el.getElementsByTagNameNS('*',n)[0];return e?e.textContent.trim():''}
    var trials=[].slice.call(doc.getElementsByTagNameNS('*','fullTrial')).map(function(t){
      var idEl=t.getElementsByTagNameNS('*','isrctn')[0];
      return {id:idEl?idEl.textContent.trim():'',date:idEl?(idEl.getAttribute('dateAssigned')||''):'',title:first(t,'title')||first(t,'scientificTitle'),country:[].slice.call(t.getElementsByTagNameNS('*','recruitmentCountries')).map(function(c){return c.textContent.trim().replace(/\s+/g,', ')}).join(', ')};
    }).sort(function(a,b){return b.date.localeCompare(a.date)}).slice(0,5);
    $('reg-isrctn').innerHTML=trials.map(function(t){
      return '<div class="trial"><a href="https://www.isrctn.com/ISRCTN'+esc(t.id)+'" target="_blank" rel="noopener">'+esc(t.title)+'</a><div class="who">'+(t.country?esc(t.country)+' · ':'')+'registered '+esc(t.date.slice(0,10))+' · ISRCTN'+esc(t.id)+'</div></div>';
    }).join('')||'<p class="status-note">No ISRCTN trials found.</p>';
  }).catch(function(){setStat('st-isrctn',null);fail('reg-isrctn','ISRCTN','https://www.isrctn.com/search?q='+q(d.search))});

  // Europe PMC preprints (last 12 months)
  var today=new Date(),yearAgo=new Date(today.getTime()-365*864e5);
  function iso(x){return x.toISOString().slice(0,10)}
  getJSON('https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&pageSize=1&query='+q('"'+d.search+'" AND SRC:PPR AND FIRST_PDATE:['+iso(yearAgo)+' TO '+iso(today)+']'))
    .then(function(j){setStat('st-preprint',j.hitCount)}).catch(function(){setStat('st-preprint',null)});

  // PubMed (NCBI allows ~3 requests/second without a key, so calls run one after another)
  var E='https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
  function pubList(ids,el){
    if(!ids.length){$(el).innerHTML='<p class="status-note">None found.</p>';return Promise.resolve()}
    return getJSON(E+'esummary.fcgi?db=pubmed&retmode=json&id='+ids.join(',')).then(function(s){
      $(el).innerHTML=ids.map(function(id){var a=s.result[id]||{};
        return '<div class="trial"><a href="https://pubmed.ncbi.nlm.nih.gov/'+esc(id)+'/" target="_blank" rel="noopener">'+esc(a.title||('PMID '+id))+'</a><div class="who">'+esc(a.source)+' · '+esc(a.pubdate)+' · PMID '+esc(id)+'</div></div>';
      }).join('');
    });
  }
  getJSON(E+'esearch.fcgi?db=pubmed&retmode=json&retmax=0&datetype=pdat&reldate=365&term='+q(d.pubmed))
    .then(function(j){setStat('st-pubmed',j.esearchresult.count)}).catch(function(){setStat('st-pubmed',null)})
    .then(function(){return wait(400)})
    .then(function(){return getJSON(E+'esearch.fcgi?db=pubmed&retmode=json&sort=pub_date&retmax=6&term='+q('('+d.pubmed+') AND (randomized controlled trial[pt] OR clinical trial[pt])'))})
    .then(function(j){return wait(400).then(function(){return pubList(j.esearchresult.idlist,'reg-pubmed')})})
    .catch(function(){fail('reg-pubmed','PubMed','https://pubmed.ncbi.nlm.nih.gov/?term='+q(d.pubmed))})
    .then(function(){return wait(400)})
    .then(function(){return getJSON(E+'esearch.fcgi?db=pubmed&retmode=json&sort=pub_date&retmax=5&term='+q('('+d.pubmed+') AND "Cochrane Database Syst Rev"[ta]'))})
    .then(function(j){setStat('st-cochrane',j.esearchresult.count);return wait(400).then(function(){return pubList(j.esearchresult.idlist,'reg-cochrane')})})
    .catch(function(){setStat('st-cochrane',null);fail('reg-cochrane','Cochrane reviews','https://pubmed.ncbi.nlm.nih.gov/?term='+q('('+d.pubmed+') AND "Cochrane Database Syst Rev"[ta]'))});

  // Drugs@FDA via openFDA: every NDA/BLA on file for each medicine named in the report
  var tbody=$('reg-fda');
  tbody.innerHTML=(d.drugs||[]).map(function(n,i){return '<tr id="fda-'+i+'"><td><b>'+esc(n.charAt(0).toUpperCase()+n.slice(1))+'</b></td><td colspan="3" class="status-note">Checking Drugs@FDA…</td></tr>'}).join('');
  (d.drugs||[]).forEach(function(n,i){
    // Search both the generic name and the active ingredient: older brands (e.g. Rilutek, Larodopa) only match the latter
    var term=q('"'+n+'"');
    getJSON('https://api.fda.gov/drug/drugsfda.json?search=openfda.generic_name:'+term+'+products.active_ingredients.name:'+term+'&limit=100').then(function(j){
      var apps=[];
      (j.results||[]).forEach(function(a){
        if(!/^(NDA|BLA)/.test(a.application_number))return;
        var orig=(a.submissions||[]).filter(function(s){return s.submission_type==='ORIG'&&s.submission_status==='AP'})[0];
        if(!orig)return;
        var brands=[];(a.products||[]).forEach(function(p){if(p.brand_name&&brands.indexOf(p.brand_name)<0)brands.push(p.brand_name)});
        apps.push({app:a.application_number,brand:brands.slice(0,2).join(', '),date:orig.submission_status_date,sponsor:a.sponsor_name});
      });
      apps.sort(function(a,b){return a.date.localeCompare(b.date)});
      if(!apps.length)throw new Error('none');
      var shown=apps.slice(0,3);
      $('fda-'+i).innerHTML='<td><b>'+esc(n.charAt(0).toUpperCase()+n.slice(1))+'</b></td><td>'+shown.map(function(a){return esc(a.brand)}).join('<br>')+'</td><td>'+shown.map(function(a){
        return '<a href="https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo='+esc(a.app.replace(/\D/g,''))+'" target="_blank" rel="noopener">'+esc(a.app)+'</a>';
      }).join('<br>')+'</td><td>'+shown.map(function(a){var x=a.date;return esc(x.slice(0,4)+'-'+x.slice(4,6)+'-'+x.slice(6,8))}).join('<br>')+(apps.length>3?'<br><small>+'+(apps.length-3)+' more</small>':'')+'</td>';
    }).catch(function(){
      $('fda-'+i).innerHTML='<td><b>'+esc(n.charAt(0).toUpperCase()+n.slice(1))+'</b></td><td colspan="3" class="status-note">No Drugs@FDA record found. Not FDA-approved, or not yet in FDA\'s open data.</td>';
    });
  });

  // Search-it-yourself links
  var links=[
    ['ClinicalTrials.gov','https://clinicaltrials.gov/search?cond='+q(ctTerm)],
    ['WHO ICTRP','https://trialsearch.who.int/?SearchAll='+q(d.search)],
    ['EU CTIS','https://euclinicaltrials.eu/search-for-clinical-trials/?lang=en'],
    ['ISRCTN','https://www.isrctn.com/search?q='+q(d.search)],
    ['Cochrane Library (CENTRAL)','https://www.cochranelibrary.com/central'],
    ['PubMed','https://pubmed.ncbi.nlm.nih.gov/?term='+q(d.pubmed)],
    ['Europe PMC','https://europepmc.org/search?query='+q('"'+d.search+'"')],
    ['Drugs@FDA','https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm'],
    ['EMA medicines','https://www.ema.europa.eu/en/medicines'],
    ['OpenMD','https://openmd.com/search?q='+q(d.search)]
  ];
  if(d.cancer){
    links.push(['National Cancer Institute','https://www.cancer.gov/search/results?swKeyword='+q(d.search)]);
    links.push(['NCI clinical trials search','https://www.cancer.gov/research/participate/clinical-trials-search']);
  }
  $('reg-links').innerHTML=links.map(function(l){return '<a href="'+l[1]+'" target="_blank" rel="noopener">'+esc(l[0])+' ↗</a>'}).join('');
})();
