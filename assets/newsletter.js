// Newsletter sign-up box, added above the footer of every page.
// The disease drop-down is built from assets/diseases.js, so new diseases appear automatically.
// ─── EDIT THIS ONE LINE ──────────────────────────────────────────────────
// Create a free account at buttondown.com, then put your Buttondown username here.
// Leave it empty ("") and the box shows "Opening soon" instead of a working form.
window.CURECHECKER_NEWSLETTER = {
  buttondown: "CureChecker"   // your Buttondown username   e.g. "curechecker"
};
// ─────────────────────────────────────────────────────────────────────────

// How it works: the form posts to Buttondown's standard embed address. The chosen disease
// is sent as a Buttondown "tag" (the disease's slug, or "all"), so each email can be sent
// to just the people who picked that disease.
(function(){
  var cfg=window.CURECHECKER_NEWSLETTER||{};
  var user=String(cfg.buttondown||'').trim().replace(/[^A-Za-z0-9_-]/g,'');
  var list=window.CURECHECKER_DISEASES||[];
  var footer=document.querySelector('footer');
  if(!footer||document.getElementById('newsletter'))return;
  function esc(s){return String(s).replace(/[&<>"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]})}
  var current=document.body.getAttribute('data-disease')||'';
  var opts='<option value="all">All conditions/diseases</option>'+list.slice().sort(function(x,y){return x.name.localeCompare(y.name,'en',{sensitivity:'base'})}).map(function(d){
    return '<option value="'+esc(d.slug)+'"'+(d.slug===current?' selected':'')+'>'+esc(d.name)+'</option>';
  }).join('');
  var on=!!user;
  var sec=document.createElement('section');
  sec.id='newsletter';
  sec.className='newsletter';
  sec.setAttribute('aria-label','Email updates');
  sec.innerHTML=
    '<div><h2>Get updates by email</h2>'+
    '<p>Pick a condition/disease and we\'ll email you when its report has important news. Free, and you can unsubscribe at any time.</p></div>'+
    '<form class="nl-form" method="post" target="popupwindow"'+
      (on?' action="https://buttondown.com/api/emails/embed-subscribe/'+user+'"':'')+'>'+
      '<label for="nl-disease">Condition/disease</label>'+
      '<select id="nl-disease" name="tag" '+(on?'':'disabled')+'>'+opts+'</select>'+
      '<label for="nl-email">Email</label>'+
      '<input id="nl-email" type="email" name="email" placeholder="you@example.com" autocomplete="email" required '+(on?'':'disabled')+'>'+
      '<button type="submit" '+(on?'':'disabled')+'>'+(on?'Subscribe':'Opening soon')+'</button>'+
      '<input type="hidden" value="1" name="embed">'+
      '<small>We only use your email to send the updates you pick, and never sell it. Not medical advice.</small>'+
    '</form>';
  footer.parentNode.insertBefore(sec,footer);
  if(on){
    sec.querySelector('form').addEventListener('submit',function(){
      window.open('https://buttondown.com/'+user,'popupwindow','scrollbars=yes,width=800,height=600');
    });
  }
})();
