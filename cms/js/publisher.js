function normalizeArticleHtml(html = '') {
  let value = String(html || '').trim();
  if (!value) return '<article><p>Conteúdo não informado.</p></article>';
  if (/<!doctype|<html|<body/i.test(value)) {
    try {
      const doc = new DOMParser().parseFromString(value, 'text/html');
      const article = doc.querySelector('article');
      if (article) value = article.outerHTML;
      else value = doc.body?.innerHTML.trim() || value;
    } catch (_) {}
  }
  if (!/^<article[\s>]/i.test(value)) value = `<article>\n${value}\n</article>`;
  return value;
}

function parseSidebarItem(value = '') {
  const [label, url] = String(value).split('|').map((part) => part.trim());
  return { label: label || 'Conteúdo relacionado', url: url || '#' };
}

function sidebarItemsHtml(items = []) {
  return items.map((value) => {
    const item = parseSidebarItem(value);
    const future = item.url === '#' ? ` class="future-link" data-future-article="${escapeHtml(slugify(item.label))}"` : '';
    return `<li><a href="${escapeHtml(item.url)}"${future}>${escapeHtml(item.label)}</a></li>`;
  }).join('');
}

function articlePageHtml(data) {
  const normalizedArticle = normalizeArticleHtml(data.contentHtml);
  let article = normalizedArticle;
  let toc = [];
  try {
    const parsed = new DOMParser().parseFromString(normalizedArticle, 'text/html');
    const articleNode = parsed.querySelector('article');
    if (articleNode) {
      articleNode.querySelectorAll('h2, h3').forEach((heading, index) => {
        const id = heading.id || `${slugify(heading.textContent) || 'secao'}-${index + 1}`;
        heading.id = id;
        toc.push({ id, label: heading.textContent.trim() });
      });
      if (data.advertising?.middle !== false) {
        const headings = articleNode.querySelectorAll('h2');
        const anchor = headings[Math.max(0, Math.floor(headings.length * .45) - 1)];
        const ad = '<div class="article-ad" data-ad-slot="article-middle">Publicidade contextual<span>Exibida somente após consentimento.</span></div>';
        if (anchor) anchor.insertAdjacentHTML('beforebegin', ad);
        else articleNode.insertAdjacentHTML('beforeend', ad);
      }
      article = articleNode.innerHTML;
    }
  } catch (_) {}
  const title = data.seo?.title || data.title;
  const desc = data.seo?.description || data.subtitle || data.home?.description || '';
  const ogImage = data.seo?.ogImage || data.thumb || '';
  const heroImage = data.presentation?.heroImage || data.thumb || '../../../assets/img/pensadores/hero/hero-pensadores.webp';
  const theme = ['light', 'dark', 'dense'].includes(data.presentation?.theme) ? data.presentation.theme : 'light';
  const accent = /^#[0-9a-f]{6}$/i.test(data.presentation?.accentColor || '') ? data.presentation.accentColor : '#8f2424';
  const heroPosition = ['top', 'center', 'bottom'].includes(data.presentation?.heroPosition) ? data.presentation.heroPosition : 'center';
  const language = data.language || 'pt-BR';
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const publishedAt = data.publishedAt ? new Date(`${data.publishedAt}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const connections = (data.relationships || []).slice(0, 6);
  const footerSlug = slugify(data.category || 'artigos');
  const knownFooters = ['artigos','pensadores','livros','conceitos','mitologia','historia','mitos-e-lendas','psicologia','ciencia','arte-explica','antes-da-disney'];
  const footerClass = knownFooters.includes(footerSlug) ? footerSlug : 'artigos';
  const categoryLabels = {pensadores:'Pensadores',livros:'Livros',conceitos:'Conceitos',mitologia:'Mitologia',historia:'História','mitos-e-lendas':'Mitos e Lendas',psicologia:'Psicologia',ciencia:'Ciência','arte-explica':'A Arte Explica','antes-da-disney':'Era uma Vez',artigos:'Artigos'};
  const categoryLabel = categoryLabels[footerClass] || data.category || 'Artigos';
  const tocHtml = data.sidebar?.autoToc !== false && toc.length ? `<section class="article-side-card"><h2>Neste artigo</h2><ul>${toc.map(item => `<li><a href="#${escapeHtml(item.id)}">${escapeHtml(item.label)}</a></li>`).join('')}</ul></section>` : '';
  const libraryHtml = data.sidebar?.library?.length ? `<section class="article-side-card"><h2>Biblioteca complementar</h2><ul>${sidebarItemsHtml(data.sidebar.library)}</ul></section>` : '';
  const exploreHtml = data.sidebar?.explore?.length ? `<section class="article-side-card"><h2>Continue explorando</h2><ul>${sidebarItemsHtml(data.sidebar.explore)}</ul></section>` : '';
  const connectionsHtml = connections.length ? connections.map(item => `<li><a href="#" class="future-link" data-future-article="${escapeHtml(slugify(item))}">${escapeHtml(item)}</a></li>`).join('') : '<li><a href="../../../index.html#biblioteca">Explorar a biblioteca</a></li>';
  return `<!DOCTYPE html>
<html lang="${escapeHtml(language)}" dir="${direction}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(desc)}">
${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}">` : ''}
<link rel="stylesheet" href="../../../assets/css/main.css">
<link rel="stylesheet" href="../../../assets/css/components/category-drawer.css">
<link rel="stylesheet" href="../../../assets/css/pages/article-template.css">
<link rel="stylesheet" href="../../../assets/css/pages/article-experience.css">
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-4HTMGLEHCF"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-4HTMGLEHCF');
</script>
<link rel="icon" type="image/png" href="../../../assets/img/favicon-v1.png">
</head>
<body class="article-template article-theme--${theme}" style="--article-accent:${accent};--article-hero-position:${heroPosition}">
<header class="site-header">
  <div class="container header-content">
    <div class="logo"><a href="../../../index.html" class="editor-note">"Comece por aqui..."</a></div>
    <button class="menu-toggle" type="button" aria-label="Abrir menu" aria-controls="site-menu" aria-expanded="false"><span></span><span></span><span></span></button><nav class="menu" id="site-menu">
      <a href="../../../index.html">Início</a>
      <a href="../../artigos/" class="active">Artigos</a>
      <a href="../../pensadores/">Pensadores</a>
      <a href="../../livros/">Livros</a>
      <a href="../../conceitos/">Conceitos</a>
      <a href="../../../sobre.html">Sobre</a>
      <a href="../../../contato.html">Contato</a>
    </nav>
    <div class="site-search" role="search"><input class="siteSearchInput" type="search" placeholder="Buscar..." aria-label="Buscar no Mente Crua"><div class="siteSearchResults home-search-results"></div></div>
  </div>
</header>
<main class="article-shell">
  <div class="article-grid">
    <section class="article-hero" aria-labelledby="article-title" style="--article-hero-image:url('${escapeHtml(heroImage)}')">
      <div class="article-hero-content">
        <p class="article-kicker">${escapeHtml(categoryLabel)}</p>
        <h1 id="article-title">${escapeHtml(data.title)}</h1>
        ${data.subtitle ? `<p class="article-deck">${escapeHtml(data.subtitle)}</p>` : ''}
      </div>
    </section>
    <div class="article-main">
      <article class="article-paper" data-article-lang="${escapeHtml(language)}">
        <div class="article-byline"><strong>Por ${escapeHtml(data.author || 'Equipe Mente Crua')}</strong>${publishedAt ? `<span>${escapeHtml(publishedAt)}</span>` : ''}<span>${Number(data.readingTime) || 8} min de leitura</span></div>
        <div class="article-audio-reader" aria-label="Leitor em voz alta do artigo">
          <button class="article-reader-button article-reader-button--primary" type="button" data-reader-play>▶ Ouvir artigo</button>
          <button class="article-reader-button" type="button" data-reader-pause disabled>⏸ Pausar</button>
          <button class="article-reader-button" type="button" data-reader-stop disabled>■ Parar</button>
          <label class="article-reader-speed"><span>Velocidade</span><select data-reader-rate aria-label="Velocidade da leitura"><option value="0.85">0,85×</option><option value="0.95" selected>0,95×</option><option value="1">1×</option><option value="1.15">1,15×</option><option value="1.3">1,3×</option></select></label>
          <span class="article-reader-status" aria-live="polite">Leitor disponível</span>
        </div>
        <div class="article-share" aria-label="Compartilhar este artigo">
          <span class="article-share__label">Compartilhe:</span>
          <button class="article-share__button" type="button" data-share-native hidden>Compartilhar</button>
          <a class="article-share__button" href="#" data-share="whatsapp" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a class="article-share__button" href="#" data-share="facebook" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a class="article-share__button" href="#" data-share="x" target="_blank" rel="noopener noreferrer">X</a>
          <button class="article-share__button" type="button" data-share-copy>Copiar link</button>
          <span class="article-share__status" aria-live="polite"></span>
        </div>
        <div class="article-copy">${article}</div>
      </article>
    </div>
    <aside class="article-sidebar" aria-label="Recursos complementares">
      ${tocHtml}
      <section class="article-side-card"><h2>Conexões</h2><ul>${connectionsHtml}</ul></section>
      ${data.advertising?.sidebar !== false ? '<div class="article-ad" data-ad-slot="article-sidebar">Publicidade<span>Bloco lateral discreto</span></div>' : ''}
      ${libraryHtml}
      ${exploreHtml || `<section class="article-side-card"><h2>Continue explorando</h2><ul><li><a href="../../${footerClass}/">Mais conteúdos desta categoria</a></li><li><a href="../../artigos/">Artigos recentes</a></li><li><a href="../../../index.html#biblioteca">Outras categorias</a></li></ul></section>`}
    </aside>
    ${data.advertising?.end === true ? '<div class="article-ad article-ad--end" data-ad-slot="article-end">Publicidade<span>Bloco final opcional para artigos longos.</span></div>' : ''}
    <section class="article-related"><h2>Conexões que vão além</h2><div class="article-related-grid">${connections.slice(0,3).map(item => `<a href="#">${escapeHtml(item)}</a>`).join('') || '<a href="../../artigos/">Continuar pela biblioteca</a>'}</div></section>
    <nav class="article-navigation" aria-label="Navegação entre artigos"><a href="../../artigos/"><small>Voltar</small>Todos os artigos</a><a href="../../../index.html"><small>Continuar</small>Página inicial</a></nav>
  </div>
</main>
<footer class="mc-footer footer-${footerClass}" id="footer">
  <div class="mc-footer-bg"></div><div class="mc-footer-overlay">
    <section class="mc-footer-newsletter"><div class="container mc-footer-newsletter-inner"><div class="editorial-section-title"><span class="editorial-line"></span><span class="editorial-symbol">◆</span><span class="editorial-line"></span></div><div class="mc-footer-newsletter-copy"><h2>Não pare por aqui.</h2><p>Receba novos artigos, reflexões e perguntas sempre que uma nova ideia chegar à biblioteca.</p></div><form class="mc-footer-form"><label class="sr-only" for="article-footer-email">Seu e-mail</label><input id="article-footer-email" type="email" placeholder="Seu melhor e-mail"><button type="submit">Assinar</button></form></div></section>
    <div class="container mc-footer-main">
      <div class="mc-footer-brand"><h2>Mente Crua</h2><p>Uma biblioteca digital para quem desconfia das certezas, questiona o óbvio e acredita que boas perguntas valem mais do que respostas fáceis.</p><div class="mc-footer-social" aria-label="Redes sociais"><a href="https://www.facebook.com/MenteCrua" aria-label="Facebook"><img src="../../../assets/img/social/facebook-bronze.svg" alt=""></a><a href="https://www.instagram.com/msmentecrua/" aria-label="Instagram"><img src="../../../assets/img/social/instagram-bronze.svg" alt=""></a><a href="https://x.com/MarcosSurreal" aria-label="X"><img src="../../../assets/img/social/x-bronze.svg" alt=""></a></div></div>
      <nav class="mc-footer-column"><h3>Explorar</h3><a href="../../artigos/">Artigos</a><a href="../../../index.html#biblioteca">Categorias</a><a href="../../pensadores/">Pensadores</a><a href="../../livros/">Livros</a><a href="../../../sobre.html">Sobre</a></nav>
      <nav class="mc-footer-column"><h3>Biblioteca</h3><a href="../../conceitos/">Conceitos</a><a href="../../mitologia/">Mitologia</a><a href="../../historia/">História</a><a href="../../psicologia/">Psicologia</a><a href="../../ciencia/">Ciência</a></nav>
      <div class="mc-footer-support"><h3>Apoie o Mente Crua</h3><p>Se este projeto faz sentido para você, considere apoiar sua continuidade.</p><a class="mc-footer-button" href="../../../contato.html">Apoiar o projeto</a></div>
    </div>
    <div class="container mc-footer-bottom"><p>A biblioteca nunca fecha.</p><small>&copy; 2026 Mente Crua. Todos os direitos reservados.<a href="../../../privacidade.html">Política de Privacidade</a><a href="../../../cookies.html">Política de Cookies</a><button class="mc-cookie-settings-link" type="button" data-cookie-settings>Preferências de cookies</button><a href="../../../termos.html">Termos de Uso</a></small></div>
  </div>
</footer>
<script src="../../../assets/js/search.js"></script>
<script src="../../../assets/js/site.js" data-base="../../../"></script>
<script src="../../../assets/js/category-drawer.js"></script>
<script src="../../../assets/js/article-experience.js"></script>
</body>
</html>`;
}

function buildCategoryCard(data) {
  const description = data.home?.description || data.seo?.description || data.subtitle || '';
  const thumb = data.thumb ? `../artigos/${data.slug}/${data.thumb}` : '../../assets/img/logo-site.png';
  const link = `../artigos/${data.slug}/`;
  const categoryLabels = {pensadores:'Pensadores',livros:'Livros',conceitos:'Conceitos',mitologia:'Mitologia',historia:'História','mitos-e-lendas':'Mitos e Lendas',psicologia:'Psicologia',ciencia:'Ciência','arte-explica':'A Arte Explica','antes-da-disney':'Era uma Vez'};
  return `<article class="category-article-card" data-atlas-slug="${escapeHtml(data.slug)}"><a href="${link}"><img src="${escapeHtml(thumb)}" alt="${escapeHtml(data.title)}"></a><div class="category-article-card-body"><span class="category-article-card-category">${escapeHtml(categoryLabels[data.category] || data.category)}</span><h2><a href="${link}">${escapeHtml(data.title)}</a></h2>${description ? `<p>${escapeHtml(description)}</p>` : ''}<div class="category-article-card-footer"><span>${Number(data.readingTime) || 8} min de leitura</span><a href="${link}">Ler artigo →</a></div></div></article>`;
}

async function publishCategoryCard(data) {
  const official = ['pensadores','livros','conceitos','mitologia','historia','mitos-e-lendas','psicologia','ciencia','arte-explica','antes-da-disney'];
  if (!official.includes(data.category)) throw new Error('Categoria oficial inválida.');
  const modulesDir = await ensureDir(Atlas.projectRootHandle, 'modules');
  const categoryDir = await modulesDir.getDirectoryHandle(data.category);
  const indexHandle = await categoryDir.getFileHandle('index.html');
  const file = await indexHandle.getFile();
  let html = await file.text();
  const start = '<!-- ATLAS:CATEGORY_ARTICLES_START -->';
  const end = '<!-- ATLAS:CATEGORY_ARTICLES_END -->';
  if (!html.includes(start) || !html.includes(end)) {
    html = html.replace(/<!--\s*FUTURO[\s\S]*?ATLAS\s*-->/i, `${start}\n<div class="category-articles-grid"></div>\n${end}`);
  }
  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end);
  if (startIndex === -1 || endIndex <= startIndex) throw new Error('Área de artigos da categoria não encontrada.');
  const before = html.slice(0, startIndex + start.length);
  const current = html.slice(startIndex + start.length, endIndex);
  const after = html.slice(endIndex);
  const wrapper = document.createElement('div');
  wrapper.innerHTML = current;
  let grid = wrapper.querySelector('.category-articles-grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.className = 'category-articles-grid';
    wrapper.appendChild(grid);
  }
  const old = grid.querySelector(`[data-atlas-slug="${CSS.escape(data.slug)}"]`);
  if (old) old.outerHTML = buildCategoryCard(data);
  else grid.insertAdjacentHTML('afterbegin', buildCategoryCard(data));
  html = `${before}\n${wrapper.innerHTML.trim()}\n${after}`;
  const writable = await indexHandle.createWritable();
  await writable.write(new Blob([html], { type: 'text/html' }));
  await writable.close();
}

async function rebuildSearchIndex() {
  const items = [];
  const modulesDir = await ensureDir(Atlas.projectRootHandle, 'modules');
  for await (const [moduleName, moduleHandle] of modulesDir.entries()) {
    if (moduleHandle.kind !== 'directory') continue;
    for await (const [slug, contentHandle] of moduleHandle.entries()) {
      if (contentHandle.kind !== 'directory') continue;
      const data = await readJsonIfExists(contentHandle, 'data.json');
      if (!data || data.status !== 'published') continue;
      items.push({
        title: data.title,
        subtitle: data.subtitle || data.seo?.description || '',
        type: data.type || moduleName,
        category: data.category || '',
        tags: data.tags || [],
        url: data.folder || `modules/${moduleName}/${slug}/`,
        thumb: data.thumb ? `${data.folder || `modules/${moduleName}/${slug}/`}${data.thumb}` : '',
        text: [data.title, data.subtitle, data.category, (data.tags || []).join(' '), (data.relationships || []).join(' ')].join(' ')
      });
    }
  }
  const searchDir = await ensureDir(Atlas.projectRootHandle, 'search');
  await writeFile(searchDir, 'search-index.json', JSON.stringify(items, null, 2), 'application/json');
}

async function rebuildSitemap() {
  const urls = ['index.html','sobre.html','contato.html'];
  const modulesDir = await ensureDir(Atlas.projectRootHandle, 'modules');
  for await (const [moduleName, moduleHandle] of modulesDir.entries()) {
    if (moduleHandle.kind !== 'directory') continue;
    for await (const [slug, contentHandle] of moduleHandle.entries()) {
      if (contentHandle.kind !== 'directory') continue;
      const data = await readJsonIfExists(contentHandle, 'data.json');
      if (data?.status === 'published') urls.push(data.folder || `modules/${moduleName}/${slug}/`);
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${escapeHtml(u)}</loc></url>`).join('\n')}\n</urlset>`;
  await writeFile(Atlas.projectRootHandle, 'sitemap.xml', xml, 'application/xml');
}

async function publishArticle() {
  if (!await requireContent()) return;

  setLog('🚀 PUBLICADOR\nIniciando...');

  try {
    const existing = await readJsonIfExists(Atlas.contentDirHandle, 'data.json') || {};
    const data = {
      ...existing,
      ...collectEditorData(),
      createdAt: existing.createdAt || new Date().toISOString(),
      status: 'published',
      updatedAt: new Date().toISOString()
    };

    if (!data.title) throw new Error('Título vazio.');
    if (!data.slug) throw new Error('Slug vazio.');
    if (!data.contentHtml || data.contentHtml.trim().length < 20) throw new Error('HTML do conteúdo está vazio ou muito curto.');

    Atlas.current = { type: data.type, slug: data.slug, title: data.title, folder: data.folder };

    await writeFile(Atlas.contentDirHandle, 'data.json', JSON.stringify(data, null, 2), 'application/json');
    addLog('✔ data.json salvo');

    const finalHtml = articlePageHtml(data);
    await writeFile(Atlas.contentDirHandle, 'index.html', finalHtml, 'text/html');
    addLog('✔ index.html gerado');

    try {
      await publishHomeCard({ silent: true, data });
      addLog('✔ Home atualizada');
    } catch (homeErr) {
      addLog(`⚠ Home não atualizada: ${homeErr.message}`);
    }

    await publishCategoryCard(data);
    addLog('✔ Categoria atualizada');

    await rebuildSearchIndex();
    addLog('✔ Busca atualizada');

    await rebuildSitemap();
    addLog('✔ Sitemap atualizado');

    refreshStatus();
    saveLocalDraft();
    addLog('🎉 Publicação concluída');
    gotoStep('editor');
  } catch (err) {
    addLog(`❌ ${err.message}`);
  }
}
