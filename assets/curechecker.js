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
  var tiles=document.getElementById('disease-tiles');
  if(tiles){
    tiles.innerHTML=DISEASES.slice().sort(function(a,b){return a.name.localeCompare(b.name)}).map(function(d){
      return '<a class="tile" href="'+esc(d.page)+'"'+(d.palette?' data-palette="'+esc(d.palette)+'"':'')+'>'+
        '<span class="eyebrow">'+esc(d.category)+'</span>'+
        '<h3>'+esc(d.name)+'</h3>'+
        '<p>'+esc(d.summary)+'</p>'+
        '<span class="tile-foot"><span>Updated '+esc(d.updated)+'</span><span aria-hidden="true">→</span></span>'+
      '</a>';
    }).join('');
    var count=document.getElementById('disease-count');
    if(count)count.textContent=DISEASES.length+(DISEASES.length===1?' disease':' diseases');
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
