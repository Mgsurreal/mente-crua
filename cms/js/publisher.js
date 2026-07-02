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

function articlePageHtml(data) {
  const article = normalizeArticleHtml(data.contentHtml);
  const title = data.seo?.title || data.title;
  const desc = data.seo?.description || data.subtitle || data.home?.description || '';
  const thumb = data.thumb ? `${data.thumb}` : '';
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<link rel="stylesheet" href="../../../assets/css/main.css">
<link rel="icon" type="image/png" href="../../../assets/img/favicon-v1.png">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-4HTMGLEHCF"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-4HTMGLEHCF');</script>
<style>.share-actions img{width:28px!important;height:28px!important;object-fit:contain}.share-actions{display:flex;gap:12px;flex-wrap:wrap}.share-button{display:inline-flex;align-items:center;gap:8px}</style>
</head>
<body>
<header class="site-header">
  <div class="container header-content">
    <div class="logo"><a href="../../../index.html"><img src="../../../assets/img/logo-site.png" alt="Mente Crua"></a></div>
    <nav class="menu">
      <a href="../../../index.html">Home</a>
      <a href="../../../index.html#artigos">Artigos</a>
      <a href="../../../index.html#temas">Temas</a>
      <a href="../../pensadores/">Pensadores</a>
      <a href="../../../sobre.html">Sobre</a>
      <a href="../../../contato.html">Contato</a>
    </nav>
  </div>
</header>
<main class="article-page">
  <section class="article-hero">
    <div class="container">
      ${data.category ? `<p class="tag">${escapeHtml(data.category)}</p>` : ''}
      <h1>${escapeHtml(data.title)}</h1>
      ${data.subtitle ? `<p class="hero-text">${escapeHtml(data.subtitle)}</p>` : ''}
      ${thumb ? `<img class="article-thumb" src="${escapeHtml(thumb)}" alt="${escapeHtml(data.title)}">` : ''}
    </div>
  </section>
  <section class="article-content-section">
    <div class="container article-container">
${article}
    </div>
  </section>
  <section class="share-section">
    <div class="container article-container">
      <h2>Compartilhe</h2>
      <div class="share-actions">
        <a class="share-button" href="https://api.whatsapp.com/send?text=${encodeURIComponent(data.title)}" target="_blank" rel="noopener"><img src="../../../assets/img/social/whatsapp.png" alt="WhatsApp"><span>WhatsApp</span></a>
        <a class="share-button" href="https://www.facebook.com/sharer/sharer.php" target="_blank" rel="noopener"><img src="../../../assets/img/social/facebook.png" alt="Facebook"><span>Facebook</span></a>
        <button class="share-button" type="button" onclick="navigator.clipboard&&navigator.clipboard.writeText(location.href)"><img src="../../../assets/img/social/link.png" alt="Copiar link"><span>Copiar link</span></button>
      </div>
    </div>
  </section>
</main>
<footer class="site-footer">
  <div class="container footer-content">
    <p>© Mente Crua — Ideias sem filtro para quem ainda gosta de pensar.</p>
    <nav><a href="../../../sobre.html">Sobre</a><a href="../../../contato.html">Contato</a><a href="../../../privacidade.html">Privacidade</a></nav>
  </div>
</footer>
<script src="../../../assets/js/search.js"></script>
</body>
</html>`;
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
      await publishHomeCard({ silent: true });
      addLog('✔ Home atualizada');
    } catch (homeErr) {
      addLog(`⚠ Home não atualizada: ${homeErr.message}`);
    }

    await rebuildSearchIndex();
    addLog('✔ Busca atualizada');

    await rebuildSitemap();
    addLog('✔ Sitemap atualizado');

    refreshStatus();
    addLog('🎉 Publicação concluída');
    gotoStep('editor');
  } catch (err) {
    addLog(`❌ ${err.message}`);
  }
}
