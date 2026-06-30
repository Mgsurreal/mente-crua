async function initHomeSearch(){
  const input=document.getElementById('homeSearchInput');
  const results=document.getElementById('homeSearchResults');
  if(!input||!results)return;
  let items=[];
  try{
    const response=await fetch('search/search-index.json');
    items=await response.json();
  }catch(error){
    results.innerHTML='<p class="search-empty">Índice de busca ainda não encontrado.</p>';
    return;
  }
  function render(query){
    const q=query.trim().toLowerCase();
    if(q.length<2){results.innerHTML='';return;}
    const found=items.filter(item=>[
      item.title,item.subtitle,item.type,item.category,(item.tags||[]).join(' '),(item.entities||[]).join(' ')
    ].join(' ').toLowerCase().includes(q)).slice(0,8);
    if(!found.length){results.innerHTML='<p class="search-empty">Nada encontrado.</p>';return;}
    results.innerHTML=found.map(item=>`<a class="search-result-card" href="${item.url}"><strong>${item.title}</strong><span>${item.type}${item.category?' • '+item.category:''}</span><p>${item.subtitle||''}</p></a>`).join('');
  }
  input.addEventListener('input',()=>render(input.value));
}
initHomeSearch();
