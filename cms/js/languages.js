const TRANSLATION_STATUSES = new Set(['original', 'untranslated', 'editing', 'translated', 'reviewed', 'published', 'error']);

function blankLocaleEntry(locale) {
  return {
    status: locale.code === 'pt-br' ? 'original' : 'untranslated',
    path: locale.code === 'pt-br' ? 'index.html' : `${locale.code}/index.html`,
    source: locale.code === 'pt-br' ? 'data.json' : `translations/${locale.code}.json`,
    audio: { mode: locale.code === 'pt-br' ? 'browser' : 'absent' }
  };
}

async function ensureTranslationManifest() {
  const registry = window.MenteCruaLocales;
  let manifest = await readJsonIfExists(Atlas.contentDirHandle, 'translations.json');
  if (!manifest) {
    manifest = {
      schemaVersion: 1,
      articleSlug: Atlas.current.slug,
      originalLocale: 'pt-br',
      originalPath: 'index.html',
      updatedAt: new Date().toISOString(),
      locales: {}
    };
  }
  manifest.locales ||= {};
  manifest.bannerPolicy ||= {
    mode: 'shared-html-text',
    sharedBanner: Atlas.originalData?.presentation?.heroImage || Atlas.originalData?.thumb || ''
  };
  registry.locales.forEach((locale) => {
    manifest.locales[locale.code] = { ...blankLocaleEntry(locale), ...(manifest.locales[locale.code] || {}) };
    if (!TRANSLATION_STATUSES.has(manifest.locales[locale.code].status)) manifest.locales[locale.code].status = 'error';
  });
  manifest.updatedAt = new Date().toISOString();
  await writeFile(Atlas.contentDirHandle, 'translations.json', JSON.stringify(manifest, null, 2), 'application/json');
  Atlas.translationManifest = manifest;
  return manifest;
}

async function translationDirectory() {
  return await ensureDir(Atlas.contentDirHandle, 'translations');
}

async function readTranslationData(locale) {
  try {
    const dir = await translationDirectory();
    return await readJsonIfExists(dir, `${locale}.json`);
  } catch (_) { return null; }
}

async function writeTranslationData(locale, data) {
  const dir = await translationDirectory();
  await writeFile(dir, `${locale}.json`, JSON.stringify(data, null, 2), 'application/json');
}

async function updateTranslationStatus(locale, status) {
  const manifest = Atlas.translationManifest || await ensureTranslationManifest();
  manifest.locales[locale].status = status;
  manifest.locales[locale].updatedAt = new Date().toISOString();
  manifest.updatedAt = new Date().toISOString();
  await writeFile(Atlas.contentDirHandle, 'translations.json', JSON.stringify(manifest, null, 2), 'application/json');
  renderLanguagePanel();
}

function renderLanguagePanel() {
  const grid = $('#languageGrid');
  const registry = window.MenteCruaLocales;
  const manifest = Atlas.translationManifest;
  if (!grid || !registry || !manifest) return;
  const statusLabels = Object.fromEntries(registry.statuses.map(({ code, label }) => [code, label]));
  const prepared = registry.locales.filter(({ code }) => manifest.locales[code]?.status !== 'untranslated').length;
  $('#languageProgressValue').textContent = `${prepared}/${registry.locales.length}`;
  $('#languageProgressBar').style.width = `${(prepared / registry.locales.length) * 100}%`;
  const notice = $('#translationModeNotice');
  const active = Atlas.translationLocale && registry.byCode[Atlas.translationLocale];
  notice.hidden = !active;
  if (active) notice.textContent = `Editando ${active.nativeLabel}. Salvar rascunho não altera o original em português.`;
  $('#btnReturnOriginal').hidden = !active;
  $('#btnSaveEditor').textContent = active ? '💾 Salvar tradução' : '🚀 Publicar Artigo';

  grid.innerHTML = registry.locales.map((locale) => {
    const entry = manifest.locales[locale.code];
    const isOriginal = locale.code === manifest.originalLocale;
    const hasDraft = entry.status !== 'untranslated';
    const activeClass = Atlas.translationLocale === locale.code ? ' is-active' : '';
    const canPublish = ['reviewed', 'published'].includes(entry.status);
    const actions = isOriginal
      ? '<button type="button" data-language-action="original">Abrir original</button>'
      : `${hasDraft ? `<button type="button" data-language-action="edit" data-locale="${locale.code}">Editar</button>` : `<button type="button" data-language-action="duplicate" data-locale="${locale.code}">Criar tradução</button>`}
         ${hasDraft && !canPublish ? `<button type="button" data-language-action="review" data-locale="${locale.code}">Marcar revisado</button>` : ''}
         ${canPublish ? `<button type="button" data-language-action="publish" data-locale="${locale.code}">Publicar</button>` : ''}
         ${entry.status === 'published' ? `<button type="button" data-language-action="open" data-locale="${locale.code}">Abrir página</button>` : ''}`;
    return `<article class="language-card${activeClass}"><div class="language-card-head"><div><h3>${escapeHtml(locale.nativeLabel)}</h3><span class="language-code">${locale.code} · ${locale.dir.toUpperCase()}</span></div><span class="language-status" data-status="${entry.status}">${statusLabels[entry.status] || entry.status}</span></div><div class="language-actions">${actions}</div></article>`;
  }).join('');
}

async function loadLanguageWorkspace() {
  if (!Atlas.contentDirHandle) return;
  Atlas.originalData = await readJsonIfExists(Atlas.contentDirHandle, 'data.json');
  await ensureTranslationManifest();
  renderLanguagePanel();
}

async function editTranslation(locale) {
  let data = await readTranslationData(locale);
  if (!data) {
    const original = Atlas.originalData || await readJsonIfExists(Atlas.contentDirHandle, 'data.json');
    data = JSON.parse(JSON.stringify(original));
    data.language = locale;
    data.translationOf = Atlas.current.slug;
    data.status = 'draft';
    data.createdAt = new Date().toISOString();
    data.updatedAt = data.createdAt;
    await writeTranslationData(locale, data);
    await updateTranslationStatus(locale, 'editing');
  }
  Atlas.translationLocale = locale;
  fillForms(data);
  renderLanguagePanel();
  gotoStep('editor');
  setLog(`🌐 IDIOMAS\n✔ Tradução aberta: ${window.MenteCruaLocales.byCode[locale].nativeLabel}\n✔ Edite os textos e clique em Salvar tradução`);
}

async function returnToOriginal() {
  const data = Atlas.originalData || await readJsonIfExists(Atlas.contentDirHandle, 'data.json');
  Atlas.translationLocale = null;
  fillForms(data);
  renderLanguagePanel();
  gotoStep('idiomas');
  setLog('🌐 IDIOMAS\n✔ Original em português restaurado no editor');
}

function relativePath(fromDirectory, targetPath) {
  const from = fromDirectory.split('/').filter(Boolean);
  const target = targetPath.split('/').filter(Boolean);
  while (from.length && target.length && from[0] === target[0]) { from.shift(); target.shift(); }
  return `${'../'.repeat(from.length)}${target.join('/')}` || './';
}

function textNodes(root) {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
  return nodes;
}

function translateCopyInPlace(copy, sourceHtml, translatedHtml) {
  const parse = (value) => new DOMParser().parseFromString(value, 'text/html').body;
  const source = textNodes(parse(sourceHtml));
  const translated = textNodes(parse(translatedHtml));
  if (source.length !== translated.length) throw new Error(`Sequência textual incompatível: ${source.length} != ${translated.length}`);
  const normalize = (value) => value.replace(/\s+/g, ' ').trim();
  const values = new Map();
  source.forEach((node, index) => {
    const key = normalize(node.nodeValue);
    if (!values.has(key)) values.set(key, []);
    values.get(key).push(normalize(translated[index].nodeValue));
  });
  const used = new Map();
  textNodes(copy).forEach((node) => {
    const key = normalize(node.nodeValue);
    const choices = values.get(key);
    if (!choices) return;
    const index = Math.min(used.get(key) || 0, choices.length - 1);
    const leading = node.nodeValue.match(/^\s*/)?.[0] || '';
    const trailing = node.nodeValue.match(/\s*$/)?.[0] || '';
    node.nodeValue = `${leading}${choices[index]}${trailing}`;
    used.set(key, index + 1);
  });
  const translatedDoc = parse(translatedHtml);
  const altBySrc = new Map([...translatedDoc.querySelectorAll('img[src]')].map((image) => [image.getAttribute('src'), image.alt]));
  copy.querySelectorAll('img[src]').forEach((image) => {
    if (altBySrc.has(image.getAttribute('src'))) image.alt = altBySrc.get(image.getAttribute('src'));
    image.removeAttribute('width');
    image.removeAttribute('height');
  });
}

function localizeDocument(originalHtml, data, localeCode) {
  const registry = window.MenteCruaLocales;
  const locale = registry.byCode[localeCode];
  const manifest = Atlas.translationManifest;
  const doc = new DOMParser().parseFromString(originalHtml, 'text/html');
  doc.documentElement.lang = locale.htmlLang;
  doc.documentElement.dir = locale.dir;
  doc.title = data.seo?.title || data.title;
  const meta = (selector, value) => { const node = doc.querySelector(selector); if (node && value) node.content = value; };
  meta('meta[name="description"]', data.seo?.description || data.subtitle);
  meta('meta[property="og:title"]', data.seo?.title || data.title);
  meta('meta[property="og:description"]', data.seo?.description || data.subtitle);
  meta('meta[name="twitter:title"]', data.seo?.title || data.title);
  meta('meta[name="twitter:description"]', data.seo?.description || data.subtitle);
  const heroTitle = doc.querySelector('.article-hero h1');
  const heroDeck = doc.querySelector('.article-deck');
  const heroKicker = doc.querySelector('.article-kicker');
  if (heroTitle) heroTitle.textContent = data.title;
  if (heroDeck) heroDeck.textContent = data.subtitle || '';
  if (heroKicker) heroKicker.textContent = data.home?.category || data.category || '';
  const paper = doc.querySelector('.article-paper');
  if (paper) paper.dataset.articleLang = locale.htmlLang;
  const copy = doc.querySelector('.article-copy');
  if (copy) {
    translateCopyInPlace(copy, Atlas.originalData.contentHtml, data.contentHtml);
  }

  const cards = [...doc.querySelectorAll('.article-side-card')];
  const translatedHeadings = [...doc.querySelectorAll('.article-copy h2')];
  const tocLinks = cards[0] ? [...cards[0].querySelectorAll('a')] : [];
  translatedHeadings.forEach((heading, index) => {
    if (!tocLinks[index]) return;
    tocLinks[index].textContent = heading.textContent.trim();
    if (heading.id) tocLinks[index].href = `#${heading.id}`;
  });
  const replaceCardLinks = (card, values = []) => {
    [...(card?.querySelectorAll('a') || [])].forEach((link, index) => {
      if (!values[index]) return;
      const [label, href] = values[index].split(/\s+\|\s+/, 2);
      link.textContent = label;
      if (href) link.href = href.toLowerCase() === 'future' ? 'futuro' : href;
    });
  };
  replaceCardLinks(cards[1], (data.relationships || []).map((label) => `${label} | #`));
  replaceCardLinks(cards[2], data.sidebar?.library);
  replaceCardLinks(cards[3], data.sidebar?.explore);

  doc.querySelectorAll('#article-language-switcher').forEach((node) => node.remove());
  const available = registry.locales.filter(({ code }) => {
    const status = manifest.locales[code]?.status;
    return code === 'pt-br' || code === localeCode || status === 'published';
  });
  const switcher = doc.createElement('label');
  switcher.id = 'article-language-switcher';
  switcher.className = 'article-language-switcher';
  switcher.innerHTML = `<span>Idioma</span><select aria-label="Idioma do artigo">${available.map((item) => {
    const href = item.code === 'pt-br' ? 'index.html' : `index-${item.code}.html`;
    return `<option value="${href}" data-locale="${item.code}"${item.code === localeCode ? ' selected' : ''}>${escapeHtml(item.nativeLabel)}</option>`;
  }).join('')}</select>`;
  doc.querySelector('.header-content')?.appendChild(switcher);
  const selectorScript = doc.createElement('script');
  selectorScript.src = '../../../assets/js/article-language-selector.js';
  doc.body.appendChild(selectorScript);

  const originalDirectory = `modules/artigos/${Atlas.current.slug}`;
  const localizedDirectory = originalDirectory;
  doc.querySelectorAll('[src],[href]').forEach((node) => {
    for (const attr of ['src', 'href']) {
      const value = node.getAttribute(attr);
      if (!value || /^(?:[a-z]+:|#|\/\/)/i.test(value)) continue;
      const url = new URL(value, `https://atlas.local/${originalDirectory}/`);
      const target = url.pathname.replace(/^\//, '');
      node.setAttribute(attr, `${relativePath(localizedDirectory, target)}${url.search}${url.hash}`);
    }
  });

  const existingCanonical = doc.querySelector('link[rel="canonical"]');
  const productionRoot = existingCanonical?.href?.includes('/modules/')
    ? existingCanonical.href.split('/modules/')[0]
    : 'https://mente-crua.surreal-marcosrg.workers.dev';
  const articleUrl = `${productionRoot}/${originalDirectory}/index-${localeCode}.html`;
  const canonical = existingCanonical || doc.head.appendChild(doc.createElement('link'));
  canonical.rel = 'canonical'; canonical.href = articleUrl;
  doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());
  available.forEach((item) => {
    const alternate = doc.createElement('link');
    alternate.rel = 'alternate'; alternate.hreflang = item.hreflang;
    alternate.href = item.code === 'pt-br'
      ? `${productionRoot}/${originalDirectory}/`
      : `${productionRoot}/${originalDirectory}/index-${item.code}.html`;
    doc.head.appendChild(alternate);
  });
  const fallback = doc.createElement('link');
  fallback.rel = 'alternate'; fallback.hreflang = 'x-default';
  fallback.href = `${productionRoot}/${originalDirectory}/`;
  doc.head.appendChild(fallback);
  return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
}

async function publishTranslation(locale) {
  const entry = Atlas.translationManifest.locales[locale];
  if (!['reviewed', 'published'].includes(entry.status)) throw new Error('Marque a tradução como revisada antes de publicar.');
  const data = await readTranslationData(locale);
  if (!data) throw new Error(`Arquivo translations/${locale}.json não encontrado.`);
  const originalHtml = await readFileText(Atlas.contentDirHandle, 'index.html');
  const output = localizeDocument(originalHtml, data, locale);
  await writeFile(Atlas.contentDirHandle, `index-${locale}.html`, output, 'text/html');
  await updateTranslationStatus(locale, 'published');
  setLog(`🌐 PUBLICAÇÃO\n✔ ${window.MenteCruaLocales.byCode[locale].nativeLabel} publicado\n✔ ${Atlas.current.folder}index-${locale}.html\n✔ Original preservado`);
}

function openPublishedTranslation(locale) {
  window.open(`../${Atlas.current.folder}index-${locale}.html`, '_blank', 'noopener');
}

async function handleLanguageAction(event) {
  const button = event.target.closest('[data-language-action]');
  if (!button || !Atlas.contentDirHandle) return;
  const action = button.dataset.languageAction;
  const locale = button.dataset.locale;
  try {
    if (action === 'original') return await returnToOriginal();
    if (action === 'duplicate' || action === 'edit') return await editTranslation(locale);
    if (action === 'review') {
      await updateTranslationStatus(locale, 'reviewed');
      setLog(`🌐 IDIOMAS\n✔ ${window.MenteCruaLocales.byCode[locale].nativeLabel} marcado como revisado`);
    }
    if (action === 'publish') await publishTranslation(locale);
    if (action === 'open') openPublishedTranslation(locale);
  } catch (error) { setLog(`🌐 IDIOMAS\n❌ ${error.message}`); }
}
