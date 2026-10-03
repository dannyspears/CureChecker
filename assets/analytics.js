// Visit counting with GoatCounter (free, no cookies, no personal tracking): https://www.goatcounter.com
// ─── EDIT THIS LINE ──────────────────────────────────────────────────────
// Put your GoatCounter site code here: for https://curechecker.goatcounter.com, use "curechecker".
// Leave it empty ("") and no visits are counted. The landing page then shows reports in list order.
window.CURECHECKER_ANALYTICS = { goatcounter: "" };
// ─────────────────────────────────────────────────────────────────────────

(function(){
  var code=(window.CURECHECKER_ANALYTICS.goatcounter||'').trim();
  if(!code||location.hostname==='localhost'||location.hostname==='127.0.0.1')return;  // never count local previews
  var s=document.createElement('script');
  s.async=true;
  s.src='https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter','https://'+encodeURIComponent(code)+'.goatcounter.com/count');
  document.head.appendChild(s);
})();
