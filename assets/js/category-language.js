(() => {
  const registry = window.MenteCruaLocales;
  const content = window.MenteCruaHomeContentI18n;
  const copies = window.MenteCruaHomeI18n;
  const card = document.querySelector('.category-article-card[data-atlas-slug]');
  if (!registry || !content) return;

  const one = (selector, root = document) => root?.querySelector(selector);
  const all = (selector, root = document) => [...(root?.querySelectorAll(selector) || [])];
  const put = (element, value) => { if (element && value != null) element.textContent = value; };
  const stored = localStorage.getItem(registry.storageKey);
  const language = registry.byCode[stored] ? stored : registry.defaultCode;
  const locale = registry.byCode[language];
  const copy = copies?.[language] || (language === 'ar-eg' ? copies?.ar : null);
  const article = card ? (content?.[language]?.articles?.[card.dataset.atlasSlug]
    || (language === 'ar-eg' ? content?.ar?.articles?.[card.dataset.atlasSlug] : null)) : null;

  document.documentElement.lang = locale?.htmlLang || 'pt-BR';
  document.documentElement.dir = locale?.dir || 'ltr';
  document.body.classList.toggle('is-rtl', locale?.dir === 'rtl');

  if (copy) {
    all('.menu a').forEach((link, index) => put(link, copy.nav[index]));
    const search = one('.siteSearchInput');
    if (search) {
      search.placeholder = copy.search;
      search.setAttribute('aria-label', copy.search);
    }
    const newsletter = one('.mc-footer-newsletter');
    put(one('h2', newsletter), copy.newsletter[0]);
    put(one('p', newsletter), copy.newsletter[1]);
    const email = one('input', newsletter);
    if (email) email.placeholder = copy.newsletter[2];
    put(one('button', newsletter), copy.newsletter[3]);
    const categoryMap = {
      'pensadores-hero': copy.gates[0], 'livros-hero': copy.gates[1],
      'conceitos-hero': copy.gates[2], 'mitologia-hero': copy.gates[3],
      'historia-hero': copy.gates[4], 'mitos-e-lendas-hero': copy.gates[5],
      'psicologia-hero': copy.gates[6], 'ciencia-hero': copy.gates[7],
      'arte-explica-hero': copy.special[1], 'antes-da-disney-hero': copy.special[2]
    };
    const hero = one('main > section[class$="-hero"]');
    const heroCopy = hero && Object.entries(categoryMap).find(([name]) => hero.classList.contains(name))?.[1];
    if (heroCopy) {
      put(one('#category-title', hero), heroCopy[0]);
      put(one('#category-title + p', hero), heroCopy[1]);
      document.title = `${heroCopy[0]} | Mente Crua`;
    }
  }

  if (card && article && language !== 'pt-br') {
    const category = article.category.split(' · ')[0];
    put(one('.category-article-card-category', card), category);
    put(one('h2 a', card), article.title);
    put(one('.category-article-card-body > p', card), article.description);
    const image = one('img', card);
    if (image) image.alt = article.title;
    const target = `../artigos/${card.dataset.atlasSlug}/index-${language}.html`;
    all('a', card).forEach((link) => link.setAttribute('href', target));
    const action = one('.category-article-card-footer a', card);
    put(action, copy?.recent?.[3] || '→');
    document.title = `${category} | Mente Crua`;
    put(one('#category-title'), category);
  }

  const tools = one('.header-tools') || document.createElement('div');
  if (!tools.classList.contains('header-tools')) {
    tools.className = 'header-tools';
    const search = one('.site-search');
    search?.parentNode?.insertBefore(tools, search);
    if (search) tools.appendChild(search);
  }
  const label = document.createElement('label');
  label.className = 'language-selector';
  const hiddenLabel = document.createElement('span');
  hiddenLabel.className = 'visually-hidden';
  hiddenLabel.textContent = 'Idioma';
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Idioma');
  registry.locales.forEach(({ code, nativeLabel }) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = `${code.split('-')[0].toUpperCase()} · ${nativeLabel}`;
    select.appendChild(option);
  });
  select.value = language;
  select.addEventListener('change', () => {
    localStorage.setItem(registry.storageKey, select.value);
    location.reload();
  });
  label.append(hiddenLabel, select);
  tools.insertBefore(label, tools.firstChild);
})();
