const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const moduleLabels = {
  artigos: 'Artigo',
  pensadores: 'Pensador',
  livros: 'Livro',
  conceitos: 'Conceito',
  personagens: 'Personagem',
  'obras-de-arte': 'Obra de Arte',
  mitologias: 'Mitologia',
  'escolas-filosoficas': 'Escola Filosófica'
};

let currentStep = 0;
let projectRootHandle = null;
let contentDirHandle = null;
let imgDirHandle = null;
let currentItem = null;
let images = [];

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
function escapeHtml(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
function splitList(value = '') { return String(value).split(',').map(v => v.trim()).filter(Boolean); }
function setLog(msg) { $('#log').textContent = msg; }
function addLog(msg) { $('#log').textContent += `\n${msg}`; }
function setStep(selector, ok) {
  const el = $(selector);
  if (!el) return;
  el.classList.toggle('ok', !!ok);
  el.textContent = el.textContent.replace(/^⚪|^🟢/, ok ? '🟢' : '⚪');
}
function syncUI() {
  const projectEl = $('#projectStatus');
  const contentEl = $('#contentStatus');
  if (projectRootHandle) { projectEl.textContent = projectRootHandle.name; projectEl.classList.add('active-status'); }
  else { projectEl.textContent = 'Nenhum projeto selecionado'; projectEl.classList.remove('active-status'); }
  if (currentItem) { contentEl.textContent = `${moduleLabels[currentItem.type] || currentItem.type}: ${currentItem.title}`; contentEl.classList.add('active-status'); }
  else { contentEl.textContent = 'Nenhum conteúdo aberto'; contentEl.classList.remove('active-status'); }

  setStep('#stepProject', !!projectRootHandle);
  setStep('#stepStructure', !!currentItem && !!contentDirHandle);
  setStep('#stepHome', !!$('#homeTitle').value.trim() && !!$('#homeDescription').value.trim());
  setStep('#stepImages', images.length > 0);
  setStep('#stepHtml', !!$('#contentHtml').value.trim());
}
function goToStep(index) {
  currentStep = Math.max(0, Math.min(4, index));
  $$('.wizard-page').forEach(p => p.classList.toggle('active', Number(p.dataset.page) === currentStep));
  $$('.steps .step').forEach(b => b.classList.toggle('active', Number(b.dataset.step) === currentStep));
  syncUI();
}
async function ensureDir(parent, name) { return await parent.getDirectoryHandle(name, { create: true }); }
async function writeFile(dir, name, content, type = 'text/plain') {
  const fh = await dir.getFileHandle(name, { create: true });
  const w = await fh.createWritable();
  await w.write(new Blob([content], { type }));
  await w.close();
}
async function readJsonIfExists(dir, name) {
  try { const fh = await dir.getFileHandle(name); const f = await fh.getFile(); return JSON.parse(await f.text()); }
  catch (_) { return null; }
}
async function readTextIfExists(dir, name) {
  try { const fh = await dir.getFileHandle(name); const f = await fh.getFile(); return await f.text(); }
  catch (_) { return null; }
}
function updateDerivedFields() {
  const title = $('#title').value.trim();
  const slug = $('#slug').dataset.manual ? slugify($('#slug').value) : slugify(title);
  $('#slug').value = slug;
  if (!$('#homeTitle').value.trim()) $('#homeTitle').value = title;
  $('#homeLink').value = slug ? `modules/${$('#moduleType').value}/${slug}/` : '';
  $('#destination').textContent = $('#homeLink').value || `modules/${$('#moduleType').value}/slug/`;
  syncUI();
}
async function selectProjectRoot() {
  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    // raiz correta deve conter index.html ou ser capaz de criar modules.
    projectRootHandle = handle;
    setLog(`✔ Projeto selecionado: ${handle.name}`);
    syncUI();
    return true;
  } catch (_) {
    setLog('Projeto não selecionado.');
    return false;
  }
}
async function requireProject() {
  if (projectRootHandle) return true;
  setLog('Selecione a raiz do projeto Mente-Crua.');
  return await selectProjectRoot();
}
function collectData(status = 'draft') {
  const type = $('#moduleType').value;
  const title = $('#title').value.trim();
  const slug = $('#slug').value.trim() || slugify(title);
  const folder = `modules/${type}/${slug}/`;
  const homeTitle = $('#homeTitle').value.trim() || title;
  const homeDescription = $('#homeDescription').value.trim() || $('#seoDescription').value.trim() || $('#subtitle').value.trim();
  const homeThumb = $('#homeThumb').value.trim() || 'img/thumb.webp';
  return {
    type,
    typeLabel: moduleLabels[type] || type,
    title,
    subtitle: $('#subtitle').value.trim(),
    slug,
    folder,
    category: $('#category').value.trim(),
    tags: splitList($('#tags').value),
    thumb: homeThumb,
    home: { title: homeTitle, description: homeDescription, thumb: homeThumb, link: folder },
    seo: { title: $('#seoTitle').value.trim() || title, description: $('#seoDescription').value.trim() || homeDescription },
    relationships: splitList($('#relationships').value),
    contentHtml: $('#contentHtml').value.trim(),
    status,
    updatedAt: new Date().toISOString()
  };
}
function fillForm(data) {
  $('#moduleType').value = data.type || 'artigos';
  $('#title').value = data.title || '';
  $('#slug').value = data.slug || slugify(data.title || '');
  $('#slug').dataset.manual = 'true';
  $('#homeTitle').value = data.home?.title || data.title || '';
  $('#homeDescription').value = data.home?.description || data.seo?.description || data.subtitle || '';
  $('#homeThumb').value = data.home?.thumb || data.thumb || '';
  $('#subtitle').value = data.subtitle || '';
  $('#category').value = data.category || '';
  $('#tags').value = Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || '');
  $('#seoTitle').value = data.seo?.title || '';
  $('#seoDescription').value = data.seo?.description || '';
  $('#relationships').value = Array.isArray(data.relationships) ? data.relationships.join(', ') : (data.relationships || '');
  $('#contentHtml').value = data.contentHtml || '';
  updateDerivedFields();
}
async function setCurrentContent({ dirHandle, imgHandle, data }) {
  contentDirHandle = dirHandle;
  imgDirHandle = imgHandle || await ensureDir(dirHandle, 'img');
  currentItem = { type: data.type || $('#moduleType').value, title: data.title, slug: data.slug, folder: data.folder };
  fillForm(data);
  await refreshMediaLibrary();
  syncUI();
}
async function createContent() {
  try {
    if (!await requireProject()) return;
    const title = $('#title').value.trim();
    if (!title) return alert('Digite o nome do conteúdo.');
    const type = $('#moduleType').value;
    const slug = $('#slug').value.trim() || slugify(title);
    const modulesDir = await ensureDir(projectRootHandle, 'modules');
    const moduleDir = await ensureDir(modulesDir, type);
    const dirHandle = await ensureDir(moduleDir, slug);
    const imgHandle = await ensureDir(dirHandle, 'img');
    const existing = await readJsonIfExists(dirHandle, 'data.json');
    const data = existing || { ...collectData('draft'), createdAt: new Date().toISOString() };
    await writeFile(dirHandle, 'data.json', JSON.stringify(data, null, 2), 'application/json');
    if (!await readTextIfExists(dirHandle, 'index.html')) await writeFile(dirHandle, 'index.html', '<!-- Será gerado pelo Atlas ao publicar. -->', 'text/html');
    await setCurrentContent({ dirHandle, imgHandle, data });
    setLog(`✔ Conteúdo criado e aberto:\n${data.folder}\n├── data.json\n├── index.html\n└── img/`);
    goToStep(2);
  } catch (err) { setLog(`❌ Criar Conteúdo: ${err.message}`); }
}
async function openContent() {
  try {
    if (!await requireProject()) return;
    const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    const data = await readJsonIfExists(dirHandle, 'data.json');
    if (!data) throw new Error('A pasta escolhida não possui data.json. Escolha a pasta do conteúdo.');
    const imgHandle = await ensureDir(dirHandle, 'img');
    await setCurrentContent({ dirHandle, imgHandle, data });
    setLog(`✔ Conteúdo aberto: ${data.title}`);
    goToStep(2);
  } catch (err) { setLog(`❌ Abrir Conteúdo: ${err.message || 'cancelado'}`); }
}
function safeFileName(name) {
  const ext = (name.match(/\.[^.]+$/)?.[0] || '').toLowerCase();
  const base = slugify(name.replace(/\.[^.]+$/, '')) || 'imagem';
  return `${base}${ext}`;
}
async function uniqueFileName(dir, fileName) {
  const ext = (fileName.match(/\.[^.]+$/)?.[0] || '');
  const base = fileName.replace(/\.[^.]+$/, '');
  let candidate = fileName;
  let i = 2;
  while (true) {
    try { await dir.getFileHandle(candidate); candidate = `${base}-${i}${ext}`; i++; }
    catch (_) { return candidate; }
  }
}
async function importImages() {
  if (!currentItem || !imgDirHandle) return alert('Crie ou abra um conteúdo antes de adicionar imagens.');
  let fileHandles = [];
  try {
    fileHandles = await window.showOpenFilePicker({
      multiple: true,
      types: [{
        description: 'Imagens',
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'] }
      }]
    });
  } catch (_) {
    setLog('Seleção de imagens cancelada.');
    return;
  }
  if (!fileHandles.length) return;

  setLog(`➕ Adicionando ${fileHandles.length} imagem(ns)...`);
  let ok = 0;
  for (const handle of fileHandles) {
    try {
      const file = await handle.getFile();
      const name = await uniqueFileName(imgDirHandle, safeFileName(file.name));
      const fh = await imgDirHandle.getFileHandle(name, { create: true });
      const w = await fh.createWritable();
      await w.write(file);
      await w.close();
      ok++;
      addLog(`✔ ${name}`);
    } catch (err) {
      addLog(`❌ ${handle.name || 'imagem'}: ${err.message}`);
    }
  }
  await refreshMediaLibrary();
  syncUI();
  goToStep(2);
  addLog(`✅ Biblioteca atualizada: ${ok}/${fileHandles.length} imagem(ns).`);
}
async function refreshMediaLibrary() {
  const box = $('#mediaLibrary');
  if (!imgDirHandle) { box.innerHTML = '<p class="hint">Crie ou abra um conteúdo para usar a biblioteca.</p>'; images = []; return; }
  images = [];
  for await (const [name, handle] of imgDirHandle.entries()) if (handle.kind === 'file') images.push({ name, handle, path: `img/${name}` });
  images.sort((a,b)=>a.name.localeCompare(b.name));
  renderMediaLibrary();
}
async function renderMediaLibrary() {
  const box = $('#mediaLibrary');
  if (!images.length) { box.innerHTML = '<p class="hint">Nenhuma imagem adicionada ainda.</p>'; return; }
  box.innerHTML = '';
  const thumb = $('#homeThumb').value.trim();
  for (const item of images) {
    const file = await item.handle.getFile();
    const url = URL.createObjectURL(file);
    const card = document.createElement('div');
    card.className = `media-card ${thumb === item.path ? 'is-thumb' : ''}`;
    card.innerHTML = `<img src="${url}" alt=""><div class="media-body"><div class="media-name">${escapeHtml(item.name)}</div><div class="media-actions"><button type="button" data-thumb="${escapeHtml(item.path)}">${thumb === item.path ? '✅ Thumb atual' : 'Usar thumb'}</button><button type="button" data-copy="${escapeHtml(item.path)}">Copiar caminho</button><button type="button" data-delete="${escapeHtml(item.name)}">Excluir</button></div></div>`;
    box.appendChild(card);
  }
}
$('#mediaLibrary').addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.dataset.thumb) { $('#homeThumb').value = btn.dataset.thumb; await renderMediaLibrary(); syncUI(); setLog(`✔ Thumb da Home definida: ${btn.dataset.thumb}`); }
  if (btn.dataset.copy) { await navigator.clipboard?.writeText(btn.dataset.copy); setLog(`✔ Caminho copiado: ${btn.dataset.copy}`); }
  if (btn.dataset.delete) { if (!confirm(`Excluir ${btn.dataset.delete}?`)) return; await imgDirHandle.removeEntry(btn.dataset.delete); await refreshMediaLibrary(); syncUI(); setLog(`✔ Imagem excluída: ${btn.dataset.delete}`); }
});
function cleanArticleHtml(html = '') {
  let value = String(html || '').trim();
  if (!value) return '<article><p>Conteúdo não informado.</p></article>';
  if (/<!doctype|<html|<body/i.test(value)) {
    const doc = new DOMParser().parseFromString(value, 'text/html');
    const article = doc.querySelector('article');
    value = article ? article.outerHTML : (doc.body?.innerHTML || value);
  }
  if (!/^<article[\s>]/i.test(value)) value = `<article>\n${value}\n</article>`;
  return value;
}
function articlePage(data) {
  const root = '../../../';
  const title = escapeHtml(data.seo?.title || data.title);
  const desc = escapeHtml(data.seo?.description || data.home?.description || data.subtitle || '');
  const article = cleanArticleHtml(data.contentHtml);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}assets/css/main.css">
<link rel="icon" type="image/png" href="${root}assets/img/favicon-v1.png">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-4HTMGLEHCF"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-4HTMGLEHCF');</script>
<style>.article-container{max-width:860px;margin:0 auto;padding:50px 20px}.article-hero h1{font-size:clamp(36px,6vw,64px);line-height:1.05}.article-subtitle{font-size:20px;color:#bbb}.article-thumb{width:100%;border-radius:18px;margin:28px 0}.article-body article{font-size:18px;line-height:1.9}.article-body img{max-width:100%;border-radius:16px;margin:28px 0}.share-actions{display:flex;gap:12px;flex-wrap:wrap}.share-button img{width:22px!important;height:22px!important;object-fit:contain}.share-button{display:inline-flex;align-items:center;gap:8px}</style>
</head>
<body>
<header class="site-header"><div class="container header-content"><div class="logo"><a href="${root}index.html"><img src="${root}assets/img/logo-site.png" alt="Mente Crua"></a></div><nav class="menu"><a href="${root}index.html">Home</a><a href="${root}index.html#artigos">Artigos</a><a href="${root}index.html#temas">Temas</a><a href="${root}modules/pensadores/">Pensadores</a><a href="${root}sobre.html">Sobre</a><a href="${root}contato.html">Contato</a></nav><div class="site-search" role="search"><input class="siteSearchInput" type="search" placeholder="Buscar..." aria-label="Buscar no Mente Crua"><div class="siteSearchResults home-search-results"></div></div></div></header>
<main>
<header class="article-hero article-container"><p class="tag">${escapeHtml(data.category || 'Mente Crua')}</p><h1>${escapeHtml(data.title)}</h1>${data.subtitle ? `<p class="article-subtitle">${escapeHtml(data.subtitle)}</p>` : ''}${data.thumb ? `<img class="article-thumb" src="${escapeHtml(data.thumb)}" alt="${escapeHtml(data.title)}">` : ''}</header>
<section class="article-container article-body">${article}</section>
<section class="article-container share-section"><h2>Compartilhe esta reflexão</h2><div class="share-actions"><a class="share-button" href="https://api.whatsapp.com/send?text=${encodeURIComponent(data.title)}" target="_blank" rel="noopener"><img src="${root}assets/img/social/whatsapp.png" alt="WhatsApp"><span>WhatsApp</span></a><a class="share-button" href="https://www.facebook.com/sharer/sharer.php?u=" target="_blank" rel="noopener"><img src="${root}assets/img/social/facebook.png" alt="Facebook"><span>Facebook</span></a><button class="share-button" onclick="navigator.clipboard&&navigator.clipboard.writeText(location.href)"><img src="${root}assets/img/social/link.png" alt="Copiar link"><span>Copiar link</span></button></div></section>
</main>
<footer class="footer"><div class="container footer-content"><div><h3>Mente Crua</h3><p>Ideias sem filtro para quem ainda gosta de pensar.</p></div><nav><a href="${root}index.html">Home</a><a href="${root}sobre.html">Sobre</a><a href="${root}contato.html">Contato</a></nav></div></footer>
<script src="${root}assets/js/search.js"></script>
</body>
</html>`;
}
function homeCard(data) {
  const home = data.home || {};
  const title = home.title || data.title;
  const desc = home.description || data.seo?.description || data.subtitle || '';
  const thumb = home.thumb || data.thumb || '';
  const url = home.link || data.folder;
  const thumbSrc = thumb.startsWith('modules/') || thumb.startsWith('assets/') ? thumb : `${data.folder}${thumb}`;
  return `<article class="post-card">
  <a href="${escapeHtml(url)}" class="post-thumb"><img src="${escapeHtml(thumbSrc)}" alt="${escapeHtml(title)}"></a>
  ${data.category ? `<span class="post-category">${escapeHtml(data.category)}</span>` : ''}
  <h3>${escapeHtml(title)}</h3>
  <p>${escapeHtml(desc)}</p>
  <a href="${escapeHtml(url)}">Ler artigo →</a>
</article>`;
}
async function collectPublishedArticles() {
  const out = [];
  const modulesDir = await ensureDir(projectRootHandle, 'modules');
  let artigosDir;
  try { artigosDir = await modulesDir.getDirectoryHandle('artigos'); } catch (_) { return out; }
  for await (const [slug, dir] of artigosDir.entries()) {
    if (dir.kind !== 'directory') continue;
    const data = await readJsonIfExists(dir, 'data.json');
    if (data?.status === 'published') out.push(data);
  }
  return out.sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
}
async function updateHomeWithItems(items, onlyThese = false) {
  const start = '<!-- ATLAS:RECENT_POSTS_START -->';
  const end = '<!-- ATLAS:RECENT_POSTS_END -->';
  const homeHandle = await projectRootHandle.getFileHandle('index.html');
  const file = await homeHandle.getFile();
  let html = await file.text();
  if (!html.includes(start) || !html.includes(end)) throw new Error('Marcadores da Home não encontrados.');
  const cards = items.map(homeCard).join('\n\n');
  html = html.replace(new RegExp(`${start}[\\s\\S]*?${end}`), `${start}\n${cards}\n${end}`);
  const w = await homeHandle.createWritable();
  await w.write(new Blob([html], { type: 'text/html' }));
  await w.close();
}

async function updateHome() {
  const published = await collectPublishedArticles();
  const data = collectData('published');
  const exists = published.some(item => item.folder === data.folder);
  const items = exists ? published : [data, ...published];
  await updateHomeWithItems(items);
}
async function publishHomeCardOnly() {
  try {
    if (!await requireProject()) return;
    const title = $('#title').value.trim();
    if (!title) return alert('Informe o nome do conteúdo primeiro.');
    updateDerivedFields();
    const data = collectData(currentItem ? (await readJsonIfExists(contentDirHandle, 'data.json'))?.status || 'draft' : 'draft');
    setLog('🏠 Publicando card na Home...');
    await updateHomeWithItems([data], true);
    setStep('#stepHome', true);
    syncUI();
    addLog('✔ Card da Home publicado. Confira a Home agora.');
  } catch (err) {
    addLog(`❌ Home: ${err.message}`);
  }
}

async function buildSearchIndex() {
  const items = (await collectPublishedArticles()).map(data => ({ title:data.title, subtitle:data.subtitle||data.home?.description||'', type:data.type, category:data.category||'', tags:data.tags||[], url:data.folder, thumb:data.thumb?`${data.folder}${data.thumb}`:'', text:[data.title,data.subtitle,data.category,(data.tags||[]).join(' '),(data.relationships||[]).join(' ')].join(' ') }));
  const searchDir = await ensureDir(projectRootHandle, 'search');
  await writeFile(searchDir, 'search-index.json', JSON.stringify(items, null, 2), 'application/json');
}
async function buildSitemap() {
  const items = await collectPublishedArticles();
  const urls = ['index.html', ...items.map(i => i.folder)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>https://mentecrua.com.br/${escapeHtml(u)}</loc></url>`).join('\n')}\n</urlset>`;
  await writeFile(projectRootHandle, 'sitemap.xml', xml, 'application/xml');
}
async function publish() {
  if (!projectRootHandle || !contentDirHandle || !currentItem) return alert('Crie ou abra um conteúdo antes de publicar.');
  try {
    setLog('🚀 Publicando...');
    const data = collectData('published');
    data.createdAt = (await readJsonIfExists(contentDirHandle, 'data.json'))?.createdAt || new Date().toISOString();
    await writeFile(contentDirHandle, 'data.json', JSON.stringify(data, null, 2), 'application/json');
    addLog('✔ data.json');
    await writeFile(contentDirHandle, 'index.html', articlePage(data), 'text/html');
    addLog('✔ index.html');
    await updateHome();
    addLog('✔ Home');
    await buildSearchIndex();
    addLog('✔ Busca');
    await buildSitemap();
    addLog('✔ Sitemap');
    currentItem = { type:data.type, title:data.title, slug:data.slug, folder:data.folder };
    setStep('#stepPublished', true);
    syncUI();
    addLog('🎉 Publicação concluída.');
  } catch (err) { addLog(`❌ ${err.message}`); }
}

$('#changeProject').addEventListener('click', selectProjectRoot);
$('#createContent').addEventListener('click', createContent);
$('#openContent').addEventListener('click', openContent);
$('#addImagesButton').addEventListener('click', importImages);
$('#publishHomeCard').addEventListener('click', publishHomeCardOnly);
$('#publish').addEventListener('click', publish);
$$('.steps .step').forEach(btn => btn.addEventListener('click', () => goToStep(Number(btn.dataset.step))));
$$('.next').forEach(btn => btn.addEventListener('click', () => goToStep(currentStep + 1)));
['title','moduleType','slug','homeTitle','homeDescription','homeThumb','contentHtml'].forEach(id => $('#'+id).addEventListener('input', () => { if (id === 'slug') $('#slug').dataset.manual = 'true'; updateDerivedFields(); }));
updateDerivedFields();
goToStep(0);
