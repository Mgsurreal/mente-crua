(() => {
  const registry = window.MenteCruaLocales;
  const catalog = window.MenteCruaHomeContentI18n;
  const copies = window.MenteCruaHomeI18n;
  if (!registry || !catalog) return;
  const saved = localStorage.getItem(registry.storageKey);
  const code = registry.byCode[saved] ? saved : registry.defaultCode;
  const locale = registry.byCode[code];
  const copy = copies?.[code] || (code === 'ar-eg' ? copies?.ar : null);
  const content = catalog?.[code] || (code === 'ar-eg' ? catalog?.ar : null);
  const one = (query, root = document) => root?.querySelector(query);
  const all = (query, root = document) => [...(root?.querySelectorAll(query) || [])];
  const text = (element, value) => { if (element && value != null) element.textContent = value; };
  document.documentElement.lang = locale?.htmlLang || 'pt-BR';
  document.documentElement.dir = locale?.dir || 'ltr';
  if (!copy) return;
  all('.menu a').forEach((link, index) => text(link, copy.nav[index]));
  const search = one('.siteSearchInput');
  if (search) search.placeholder = copy.search;
  text(one('.articles-hero h1'), copy.nav[1]);
  text(one('.articles-intro h2'), copy.recent[1]);
  text(one('.articles-intro p'), copy.recent[2]);
  document.title = `${copy.nav[1]} | Mente Crua`;
  if (code !== 'pt-br' && content?.articles) {
    const items = [
      ['a-pequena-sereia-o-conto-em-que-o-amor-nao-salva-ninguem', 'a-pequena-sereia-o-conto-em-que-o-amor-nao-salva-ninguem/img/o-naufragio.webp'],
      ['durma-ou-alguma-coisa-vira-buscar-voce', 'durma-ou-alguma-coisa-vira-buscar-voce/img/thumb.webp']
    ];
    one('.articles-grid').replaceChildren(...items.map(([slug, image]) => {
      const item = content.articles[slug];
      const node = document.createElement('article');
      node.className = 'article-card';
      node.innerHTML = '<a class="article-card-thumb"><img></a><div class="article-card-body"><h2><a></a></h2><p></p><span class="article-card-meta"></span><div class="article-card-footer"><span></span><a></a></div></div>';
      all('a', node).forEach(link => link.href = `${slug}/index-${code}.html`);
      const img = one('img', node); img.src = image; img.alt = item.title;
      text(one('h2 a', node), item.title);
      text(one('.article-card-body > p', node), item.description);
      text(one('.article-card-meta', node), item.category.split(' · ')[0]);
      text(one('.article-card-footer a', node), copy.recent[3]);
      return node;
    }));
    one('.articles-filters')?.setAttribute('hidden', '');
    one('.articles-pagination')?.setAttribute('hidden', '');
  }
  const newsletter = one('.mc-footer-newsletter');
  text(one('h2', newsletter), copy.newsletter[0]);
  text(one('p', newsletter), copy.newsletter[1]);
  const email = one('input', newsletter); if (email) email.placeholder = copy.newsletter[2];
  text(one('button', newsletter), copy.newsletter[3]);
  const tools = one('.header-tools') || document.createElement('div');
  if (!tools.classList.contains('header-tools')) {
    tools.className = 'header-tools';
    const siteSearch = one('.site-search');
    siteSearch?.parentNode?.insertBefore(tools, siteSearch);
    if (siteSearch) tools.appendChild(siteSearch);
  }
  const label = document.createElement('label');
  label.className = 'language-selector';
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Idioma');
  registry.locales.forEach(({ code: optionCode, nativeLabel }) => {
    const option = document.createElement('option');
    option.value = optionCode;
    option.textContent = `${optionCode.split('-')[0].toUpperCase()} · ${nativeLabel}`;
    select.appendChild(option);
  });
  select.value = code;
  select.addEventListener('change', () => {
    localStorage.setItem(registry.storageKey, select.value);
    location.reload();
  });
  label.appendChild(select);
  tools.insertBefore(label, tools.firstChild);
})();
