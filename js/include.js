// js/include.js  (NO <script> tags!!)
(async function(){
  async function loadIncludes(){
    const nodes = document.querySelectorAll('[data-include]');
    for (const n of nodes){
      const url = n.getAttribute('data-include');
      if(!url) continue;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        console.error('[include] load fail:', url, res.status);
        continue;
      }
      const html = await res.text();
      // placeholder 자체를 파셜 내용으로 교체
      n.insertAdjacentHTML('afterend', html);
      n.remove();
    }
    document.dispatchEvent(new CustomEvent('partials:loaded'));
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', loadIncludes);
  } else {
    loadIncludes();
  }
})();