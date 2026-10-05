// Page layout helpers for the disease reports. It shortens long sections so pages are easier to scroll:
//  - Latest studies: the newest 5 stay visible, older ones sit behind "Show N older studies"
//  - Find a clinical trial: the recruiting-trials box stays visible, the registry panels fold away
//  - Sources: folded away behind "Show all N sources"
//  - The email signup moves up to sit right after Latest studies
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
  if(nl&&st)st.insertAdjacentElement('afterend',nl);

  // If a link points inside a folded section, open it.
  function openFor(hash){
    if(!hash)return;var t=document.getElementById(hash.slice(1));
    while(t){if(t.tagName==='DETAILS')t.open=true;t=t.parentElement}
  }
  openFor(location.hash);
  window.addEventListener('hashchange',function(){openFor(location.hash)});
})();
