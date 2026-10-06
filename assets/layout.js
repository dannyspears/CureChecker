// Page layout helpers for the disease reports. It shortens long sections so pages are easier to scroll:
//  - Latest studies: the newest 5 stay visible, older ones sit behind "Show N older studies"
//  - Find a clinical trial: the recruiting-trials box stays visible, the registry panels fold away
//  - Sources: folded away behind "Show all N sources"
//  - The email signup moves up to sit right after Latest studies
//  - Pages with data-order on <body> get a custom section order and collapsible sections, all collapsed (see the block below)
// Daily updates keep editing the plain lists in the HTML; this file only rearranges them in the browser.
(function(){
  function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e}

  var list=document.getElementById('studies-list');
  if(list){
    var items=[].slice.call(list.children).filter(function(c){return c.classList.contains('study')});
    if(items.length>5){
      var more=el('details','more-studies');
      more.appendChild(el('summary','','Show '+(items.length-5)+(items.length-5===1?' older study':' older studies')));
      items.slice(5).forEach(function(i){more.appendChild(i)});
      list.appendChild(more);
      [].forEach.call(document.querySelectorAll('#studies .filters button'),function(b){
        b.addEventListener('click',function(){if(b.getAttribute('data-f')!=='all')more.open=true});
      });
    }
  }

  var reg=document.getElementById('registries'),stats=document.getElementById('reg-stats');
  if(reg&&stats){
    var rd=el('details','reg-details');
    rd.appendChild(el('summary','','Show registry numbers, newest papers and FDA records'));
    var rest=[],n=stats;
    while(n){rest.push(n);n=n.nextElementSibling}
    rest.forEach(function(x){rd.appendChild(x)});
    reg.appendChild(rd);
  }

  var src=document.querySelector('#sources .sources');
  if(src){
    var sd=el('details','src-details');
    sd.appendChild(el('summary','','Show all '+src.querySelectorAll('li').length+' sources'));
    src.parentNode.insertBefore(sd,src);
    sd.appendChild(src);
  }

  var nl=document.getElementById('newsletter'),st=document.getElementById('studies');
  var order=(document.body.getAttribute('data-order')||'').split(',').map(function(s){return s.trim()}).filter(Boolean);
  if(nl&&st&&!order.length)st.insertAdjacentElement('afterend',nl);

  // Custom page order and collapsible sections: <body data-order="verdict,cause,...">
  // Lists the section ids (and "newsletter") in the order they should appear.
  // Each section then becomes a drop-down under its title; all start collapsed.
  function titleCase(s){return s.replace(/(^|[\s(])([a-z])/g,function(m,a,b){return a+b.toUpperCase()})}
  if(order.length){
    var nodes=order.map(function(id){return document.getElementById(id)}).filter(Boolean);
    if(nodes.length){
      var firstPos=nodes.slice().sort(function(a,b){return a.compareDocumentPosition(b)&4?-1:1})[0];
      var mark=document.createComment('order');
      firstPos.parentNode.insertBefore(mark,firstPos);
      var at=mark;
      nodes.forEach(function(n){at.parentNode.insertBefore(n,at.nextSibling);at=n});
      mark.remove();
    }
    nodes.forEach(function(sec){
      if(sec.tagName!=='SECTION')return;
      var h=sec.querySelector('h2');if(!h)return;
      var title=titleCase(h.textContent.trim());
      var det=el('details','fold');
      var sum=el('summary','fold-sum');
      var nh=el('h2','fold-h',title);sum.appendChild(nh);
      h.hidden=true;
      det.appendChild(sum);
      while(sec.firstChild)det.appendChild(sec.firstChild);
      sec.appendChild(det);
    });
    // Section menu follows the same order, with title-case labels.
    var toc=document.querySelector('nav.toc');
    if(toc){
      var links={};[].forEach.call(toc.querySelectorAll('a'),function(a){links[a.getAttribute('href').slice(1)]=a});
      var short={natural:'Natural remedies','support-groups':'Support groups'};
      toc.textContent='';
      order.forEach(function(id){
        if(id==='newsletter'||!document.getElementById(id))return;
        var a=links[id];
        if(!a){a=document.createElement('a');a.href='#'+id;a.textContent=short[id]||id}
        a.textContent=titleCase(a.textContent);
        toc.appendChild(a);
      });
    }
  }

  // If a link points inside a folded section, open it.
  function openFor(hash){
    if(!hash)return;var t=document.getElementById(hash.slice(1));
    var f=t&&t.querySelector(':scope>details.fold');if(f)f.open=true;
    while(t){if(t.tagName==='DETAILS')t.open=true;t=t.parentElement}
  }
  openFor(location.hash);
  window.addEventListener('hashchange',function(){openFor(location.hash)});
})();
