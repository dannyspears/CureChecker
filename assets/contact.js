// Contact form for the About page ("Contact us"). It fills <div id="contact"> on about.html.
// ─── EDIT THIS ONE LINE ──────────────────────────────────────────────────
// Make a free form at formspree.io (or a similar service), then paste its address here.
// Leave it empty ("") and the form shows "Opening soon" instead of sending.
window.CURECHECKER_CONTACT = {
  endpoint: "https://formspree.io/f/xeaoywqg"   // e.g. "https://formspree.io/f/abcdwxyz"
};
// ─────────────────────────────────────────────────────────────────────────
(function(){
  var box=document.getElementById('contact');
  if(!box)return;
  var ep=String((window.CURECHECKER_CONTACT||{}).endpoint||'').trim();
  var on=ep.indexOf('https://')===0&&ep.indexOf(' ')<0;
  function esc(s){return String(s).replace(/[&<>"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]})}
  var diseases=(window.CURECHECKER_DISEASES||[]).map(function(d){return '<option>'+esc(d.name)+'</option>'}).join('');
  box.className='contact';
  box.innerHTML=
    '<form class="contact-form" novalidate>'+
    '<label for="ct-topic">What is this about?</label>'+
    '<select id="ct-topic" name="topic"><option>Report an error or out-of-date information</option><option>Suggest a condition/disease to add</option><option>Share a study or source</option><option>Something else</option></select>'+
    '<label for="ct-disease">Which condition/disease? (optional)</label>'+
    '<select id="ct-disease" name="disease"><option value="">Not about one condition/disease</option>'+diseases+'</select>'+
    '<label for="ct-msg">Your message</label>'+
    '<textarea id="ct-msg" name="message" rows="5" required placeholder="Tell us what to fix or add. A link to your source helps."></textarea>'+
    '<label for="ct-email">Your email (optional, only if you want a reply)</label>'+
    '<input id="ct-email" type="email" name="email" autocomplete="email">'+
    '<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" style="display:none" aria-hidden="true">'+
    '<input type="hidden" name="_subject" value="Cure Checker contact form">'+
    '<button type="submit"'+(on?'':' disabled')+'>'+(on?'Send message':'Opening soon')+'</button>'+
    '<p class="ct-status" role="status" aria-live="polite"></p>'+
    '<small>We use your message and email only to look into your note and reply. Please do not send medical details or personal health information. Cure Checker cannot give medical advice.</small>'+
    '</form>';
  var f=box.querySelector('form'), st=box.querySelector('.ct-status');
  if(!on){Array.prototype.forEach.call(f.elements,function(el){el.disabled=true});return}
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(!f.message.value.trim()){st.textContent='Please write a message first.';return}
    var btn=f.querySelector('button');btn.disabled=true;st.textContent='Sending...';
    fetch(ep,{method:'POST',headers:{'Accept':'application/json'},body:new FormData(f)}).then(function(r){
      if(r.ok){f.reset();st.textContent='Thank you. Your message was sent.'}
      else{st.textContent='Sorry, that did not send. Please try again later.'}
      btn.disabled=false;
    }).catch(function(){st.textContent='Sorry, that did not send. Check your connection and try again.';btn.disabled=false});
  });
})();
