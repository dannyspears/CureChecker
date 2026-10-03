// Donation buttons on the landing page.
// ─── EDIT THESE THREE LINES ──────────────────────────────────────────────
// Leave a value empty ("") and its button shows "Coming soon" instead of a link.
window.CURECHECKER_DONATE = {
  venmo: "CureChecker",    // your Venmo username, without the @     e.g. "Cure-Checker"
  cashapp: "",  // your Cash App $Cashtag, without the $  e.g. "CureChecker"
  paypal: ""    // your PayPal.Me name                     e.g. "CureChecker"  (from paypal.me/CureChecker)
};
// ─────────────────────────────────────────────────────────────────────────

// These are each service's official web links. On a phone with the app installed,
// iOS and Android open them in the app; otherwise they open the website.
// Used in two places: the big buttons on the landing page (#donate-buttons)
// and the slim bar at the top of every disease page (.donate-bar).
(function(){
  var box=document.getElementById('donate-buttons');
  var bars=document.querySelectorAll('.donate-bar');
  if(!box&&!bars.length)return;
  var c=window.CURECHECKER_DONATE||{};
  function clean(v,strip){return String(v||'').trim().replace(strip,'')}
  var venmo=clean(c.venmo,/^@/), cash=clean(c.cashapp,/^\$/), paypal=clean(c.paypal,/^(https?:\/\/)?(www\.)?paypal\.me\//i);
  var services=[
    {key:'venmo',  name:'Venmo',    handle:venmo?'@'+venmo:'', url:venmo?'https://venmo.com/u/'+encodeURIComponent(venmo):''},
    {key:'cashapp',name:'Cash App', handle:cash?'$'+cash:'',   url:cash?'https://cash.app/$'+encodeURIComponent(cash):''},
    {key:'paypal', name:'PayPal',   handle:paypal?'paypal.me/'+paypal:'', url:paypal?'https://www.paypal.me/'+encodeURIComponent(paypal):''}
  ];
  function esc(s){return String(s).replace(/[&<>"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]})}
  if(box){
    box.innerHTML=services.map(function(s){
      if(!s.url){
        return '<span class="donate-btn donate-'+s.key+' is-off" aria-disabled="true"><b>'+s.name+'</b><small>Coming soon</small></span>';
      }
      return '<a class="donate-btn donate-'+s.key+'" href="'+esc(s.url)+'" target="_blank" rel="noopener"><b>'+s.name+'</b><small>'+esc(s.handle)+'</small></a>';
    }).join('');
  }
  // Slim bar: unset services show greyed out with a "Coming soon" tooltip
  var barLinks=services.map(function(s){
    if(!s.url)return '<span class="db-link is-off" title="Coming soon">'+s.name+'</span>';
    return '<a class="db-link db-'+s.key+'" href="'+esc(s.url)+'" target="_blank" rel="noopener" aria-label="Donate with '+s.name+' ('+esc(s.handle)+')">'+s.name+'</a>';
  }).join('<span class="db-sep" aria-hidden="true">·</span>');
  bars.forEach(function(bar){
    bar.innerHTML='<span class="db-text">Cure Checker is free. Help keep it running:</span><span class="db-links">'+barLinks+'</span>';
  });
})();
