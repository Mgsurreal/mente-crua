async function initAtlasSearch(){
  const script=document.currentScript || document.querySelector('script[src$="assets/js/search.js"]');
  const src=script?.getAttribute('src') || 'assets/js/search.js';
  const rootPrefix=src.includes('assets/js/search.js') ? src.split('assets/js/search.js')[0] : '';
  const boxes=[];

  document.querySelectorAll('.site-search').forEach((wrap)=>{
    const input=wrap.querySelector('.siteSearchInput');
    const results=wrap.querySelector('.siteSearchResults');
    if(input&&results) boxes.push({input,results});
  });

  const homeInput=document.getElementById('homeSearchInput');
  const homeResults=document.getElementById('homeSearchResults');
  if(homeInput&&homeResults) boxes.push({input:homeInput,results:homeResults});

  if(!boxes.length)return;

  let items=[];
  try{
    const response=await fetch(rootPrefix+'search/search-index.json');
    items=await response.json();
  }catch(error){
    boxes.forEach(({results})=>results.innerHTML='<p class="search-empty">Índice de busca ainda não encontrado.</p>');
    return;
  }

  function itemUrl(item){
    const url=item.url||'#';
    if(/^https?:\/\//.test(url)||url.startsWith('#')) return url;
    return rootPrefix+url.replace(/^\//,'');
  }

  function render(query, results){
    const q=query.trim().toLowerCase();
    if(q.length<2){results.innerHTML='';return;}
    const found=items.filter(item=>[
      item.title,item.subtitle,item.type,item.category,(item.tags||[]).join(' '),(item.entities||[]).join(' ')
    ].join(' ').toLowerCase().includes(q)).slice(0,8);
    if(!found.length){results.innerHTML='<p class="search-empty">Nada encontrado.</p>';return;}
    results.innerHTML=found.map(item=>`<a class="search-result-card" href="${itemUrl(item)}"><strong>${item.title}</strong><span>${item.type}${item.category?' • '+item.category:''}</span><p>${item.subtitle||''}</p></a>`).join('');
  }

  boxes.forEach(({input,results})=>{
    input.addEventListener('input',()=>render(input.value,results));
    input.addEventListener('focus',()=>render(input.value,results));
  });

  document.addEventListener('click',(event)=>{
    boxes.forEach(({input,results})=>{
      if(!input.closest('.site-search')?.contains(event.target) && event.target!==input && !results.contains(event.target)){
        if(input.classList.contains('siteSearchInput')) results.innerHTML='';
      }
    });
  });
}
initAtlasSearch();

(function initAtlasShareLinks(){
  const encodedUrl = encodeURIComponent(window.location.href);
  document.querySelectorAll('a[href*="%25URL%25"], a[href*="%URL%"]')?.forEach((link) => {
    link.href = link.href.replace('%25URL%25', encodedUrl).replace('%URL%', encodedUrl);
  });
})();
