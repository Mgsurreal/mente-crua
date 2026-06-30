const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const blocksEl = $('#blocks');
const outputHtml = $('#outputHtml');
const outputJson = $('#outputJson');
const instructions = $('#instructions');
const folderHint = $('#folderHint');
const preview = $('#preview');
const publishStatus = $('#publishStatus');
const mediaLibraryEl = $('#mediaLibrary');

const CMS_VERSION = 'Mente Crua CMS v0.3';
const importedImages = [];
let purchaseLinks = [];

const moduleLabels = {
  'artigos': 'Artigo',
  'pensadores': 'Pensador',
  'conceitos': 'Conceito',
  'personagens': 'Personagem',
  'livros': 'Livro',
  'arte-explica': 'A Arte Explica',
  'antes-da-disney': 'A História Antes da Disney',
  'mitologias': 'Mitologia',
  'escolas-filosoficas': 'Escola Filosófica'
};

const entityBase = {
  'pensadores': '../../pensadores/',
  'conceitos': '../../conceitos/',
  'personagens': '../../personagens/',
  'livros': '../../livros/',
  'arte-explica': '../../arte-explica/',
  'antes-da-disney': '../../antes-da-disney/',
  'mitologias': '../../mitologias/',
  'escolas-filosoficas': '../../escolas-filosoficas/'
};

// Cadastro inicial. Depois será lido dos data.json dos módulos.
const internalMap = {
  'Nietzsche': '../../pensadores/nietzsche/',
  'Jung': '../../pensadores/jung/',
  'Carl Jung': '../../pensadores/carl-jung/',
  'Spinoza': '../../pensadores/spinoza/',
  'Sócrates': '../../pensadores/socrates/',
  'Freud': '../../pensadores/freud/',
  'Narciso': '../../personagens/narciso/',
  'Sísifo': '../../personagens/sisifo/',
  'Ícaro': '../../personagens/icaro/'
};

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function preserveBreaks(value = '') {
  return escapeHtml(value).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>');
}

function linkInternalTerms(text) {
  let result = text;
  Object.entries(internalMap).forEach(([name, url]) => {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^|[^\\wÀ-ÿ])(${escapedName})(?=$|[^\\wÀ-ÿ])`, 'g');
    result = result.replace(pattern, `$1<a href="${url}">$2</a>`);
  });
  return result;
}

function currentFolder() {
  const moduleType = $('#moduleType').value;
  const slug = $('#slug').value || 'seu-slug';
  return `modules/${moduleType}/${slug}/`;
}

function updateFolderHint() {
  const folder = currentFolder();
  folderHint.textContent = `Destino: ${folder}`;
  instructions.textContent = `${folder}\n├── index.html\n├── data.json\n└── img/\n    ├── thumb.webp\n    └── imagens-importadas`;
}

function updateModuleFields() {
  const moduleType = $('#moduleType').value;
  $('#articleFields').classList.toggle('hidden', moduleType !== 'artigos');
  $('#thinkerFields').classList.toggle('hidden', moduleType !== 'pensadores');
  $('#bookFields').classList.toggle('hidden', moduleType !== 'livros');
  $('#extraFields').classList.toggle('hidden', !['arte-explica', 'antes-da-disney', 'mitologias', 'personagens', 'conceitos', 'escolas-filosoficas'].includes(moduleType));
  updateFolderHint();
  generate();
}

$('#title').addEventListener('input', (event) => {
  const slugInput = $('#slug');
  if (!slugInput.dataset.manual) slugInput.value = slugify(event.target.value);
  updateFolderHint();
  generate();
});

['subtitle','category','thumb','author','seo','relations','thinkers','concepts','period','birth','death','portrait','mainIdeas','works','context','connection','bookAuthor','bookYear','bookSummary'].forEach((id) => {
  const el = $('#' + id);
  if (el) el.addEventListener('input', generate);
});

$('#slug').addEventListener('input', () => {
  $('#slug').dataset.manual = 'true';
  $('#slug').value = slugify($('#slug').value);
  updateFolderHint();
  generate();
});

$('#moduleType').addEventListener('change', updateModuleFields);
$$('[data-add]').forEach((button) => button.addEventListener('click', () => { addBlock(button.dataset.add); generate(); }));
$('#clearBlocks').addEventListener('click', () => { blocksEl.innerHTML = ''; generate(); });
$('#imageImporter').addEventListener('change', importImages);
$('#addPurchaseLink')?.addEventListener('click', () => addPurchaseLink());


function addPurchaseLink(value = {}) {
  purchaseLinks.push({ store: value.store || 'Amazon', url: value.url || '' });
  renderPurchaseLinks();
  generate();
}

function renderPurchaseLinks() {
  const wrap = $('#purchaseLinks');
  if (!wrap) return;
  if (!purchaseLinks.length) {
    wrap.innerHTML = '<p class="hint">Nenhuma loja adicionada ainda.</p>';
    return;
  }
  wrap.innerHTML = '';
  purchaseLinks.forEach((link, index) => {
    const row = document.createElement('div');
    row.className = 'purchase-link-row';
    row.innerHTML = `
      <label>Loja
        <select data-purchase-store="${index}">
          ${['Amazon','Shopee','Mercado Livre','Estante Virtual','Kindle','Kobo','Google Play Livros','Outro'].map((name) => `<option value="${name}" ${link.store === name ? 'selected' : ''}>${name}</option>`).join('')}
        </select>
      </label>
      <label>Link
        <input data-purchase-url="${index}" placeholder="https://..." value="${escapeHtml(link.url)}">
      </label>
      <button type="button" class="remove" data-remove-purchase="${index}">remover</button>
    `;
    wrap.appendChild(row);
  });
  $$('[data-purchase-store]').forEach((field) => field.onchange = () => {
    purchaseLinks[field.dataset.purchaseStore].store = field.value;
    generate();
  });
  $$('[data-purchase-url]').forEach((field) => field.oninput = () => {
    purchaseLinks[field.dataset.purchaseUrl].url = field.value.trim();
    generate();
  });
  $$('[data-remove-purchase]').forEach((button) => button.onclick = () => {
    purchaseLinks.splice(Number(button.dataset.removePurchase), 1);
    renderPurchaseLinks();
    generate();
  });
}

function renderPurchaseLinksHtml(links = []) {
  const valid = links.filter((link) => link.store && link.url);
  if (!valid.length) return '';
  return `<section class="buy-links"><h2>Onde comprar</h2><div class="buy-links-grid">${valid.map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="nofollow sponsored noopener">${escapeHtml(link.store)}</a>`).join('')}</div></section>`;
}

function addBlock(type, value = {}) {
  const div = document.createElement('div');
  div.className = 'block';
  div.dataset.type = type;

  const bodies = {
    paragraph: `<textarea rows="7" placeholder="Texto do parágrafo">${escapeHtml(value.content || '')}</textarea>`,
    heading: `<input placeholder="Título interno" value="${escapeHtml(value.content || '')}">`,
    image: `
      <input class="src" placeholder="img/imagem-01.webp" value="${escapeHtml(value.src || '')}">
      <input class="alt" placeholder="ALT da imagem" value="${escapeHtml(value.alt || '')}">
      <input class="caption" placeholder="Legenda opcional" value="${escapeHtml(value.caption || '')}">
    `,
    quote: `
      <textarea rows="4" placeholder="Citação">${escapeHtml(value.content || '')}</textarea>
      <input class="author" placeholder="Autor" value="${escapeHtml(value.author || '')}">
    `,
    entity: `
      <select class="entity-module">
        <option value="pensadores">Pensador</option>
        <option value="conceitos">Conceito</option>
        <option value="personagens">Personagem</option>
        <option value="livros">Livro</option>
        <option value="arte-explica">Arte</option>
        <option value="antes-da-disney">Antes da Disney</option>
      </select>
      <input class="entity-name" placeholder="Ex: Jung, Narciso, Niilismo" value="${escapeHtml(value.name || '')}">
      <input class="entity-url" placeholder="Link automático ou manual" value="${escapeHtml(value.url || '')}">
    `,
    note: `<textarea rows="4" placeholder="Texto da caixa de destaque">${escapeHtml(value.content || '')}</textarea>`,
    list: `<textarea rows="5" placeholder="Um item por linha">${escapeHtml((value.items || []).join('\n'))}</textarea>`,
    separator: `<p class="hint">Separador visual. Não precisa preencher nada.</p>`
  };

  div.innerHTML = `
    <div class="block-head">
      <strong>${type}</strong>
      <div class="block-tools">
        <button class="move up" type="button">↑</button>
        <button class="move down" type="button">↓</button>
        <button class="clone" type="button">duplicar</button>
        <button class="remove" type="button">remover</button>
      </div>
    </div>
    ${bodies[type] || bodies.paragraph}
  `;

  if (type === 'entity' && value.module) div.querySelector('.entity-module').value = value.module;
  div.querySelector('.remove').onclick = () => { div.remove(); generate(); };
  div.querySelector('.clone').onclick = () => { addBlock(type, readBlock(div)); generate(); };
  div.querySelector('.up').onclick = () => { if (div.previousElementSibling) blocksEl.insertBefore(div, div.previousElementSibling); generate(); };
  div.querySelector('.down').onclick = () => { if (div.nextElementSibling) blocksEl.insertBefore(div.nextElementSibling, div); generate(); };
  div.querySelectorAll('input, textarea, select').forEach((field) => {
    field.addEventListener('input', () => {
      if (type === 'entity') updateEntityUrl(div);
      generate();
    });
    field.addEventListener('change', () => {
      if (type === 'entity') updateEntityUrl(div);
      generate();
    });
  });
  blocksEl.appendChild(div);
}

function updateEntityUrl(block) {
  const moduleType = block.querySelector('.entity-module').value;
  const name = block.querySelector('.entity-name').value.trim();
  const urlInput = block.querySelector('.entity-url');
  if (!urlInput.dataset.manual && name) urlInput.value = `${entityBase[moduleType] || '../../'}${slugify(name)}/`;
}

function readBlock(block) {
  const type = block.dataset.type;
  if (type === 'paragraph') return { type, content: block.querySelector('textarea').value.trim() };
  if (type === 'heading') return { type, content: block.querySelector('input').value.trim() };
  if (type === 'image') return { type, src: block.querySelector('.src').value.trim(), alt: block.querySelector('.alt').value.trim(), caption: block.querySelector('.caption').value.trim() };
  if (type === 'quote') return { type, content: block.querySelector('textarea').value.trim(), author: block.querySelector('.author').value.trim() };
  if (type === 'entity') return { type, module: block.querySelector('.entity-module').value, name: block.querySelector('.entity-name').value.trim(), url: block.querySelector('.entity-url').value.trim() };
  if (type === 'note') return { type, content: block.querySelector('textarea').value.trim() };
  if (type === 'list') return { type, items: block.querySelector('textarea').value.split('\n').map((item) => item.trim()).filter(Boolean) };
  if (type === 'separator') return { type };
  return { type };
}

function readLines(selector) {
  return ($(selector)?.value || '').split('\n').map((item) => item.trim()).filter(Boolean);
}

function splitComma(selector) {
  return ($(selector)?.value || '').split(',').map((item) => item.trim()).filter(Boolean);
}

function collectData() {
  const moduleType = $('#moduleType').value;
  const title = $('#title').value.trim();
  const slug = $('#slug').value.trim() || slugify(title) || 'seu-slug';

  const data = {
    module: moduleType,
    moduleLabel: moduleLabels[moduleType],
    title,
    subtitle: $('#subtitle').value.trim(),
    slug,
    category: $('#category').value.trim(),
    thumb: $('#thumb').value.trim() || 'img/thumb.webp',
    author: $('#author').value.trim() || 'Mente Crua',
    seoDescription: $('#seo').value.trim(),
    relations: splitComma('#relations'),
    folder: `modules/${moduleType}/${slug}/`,
    createdBy: CMS_VERSION,
    media: importedImages.map((image) => ({ fileName: image.targetName, path: image.path, type: image.file.type || image.kind })),
    blocks: []
  };

  if (moduleType === 'artigos') {
    data.thinkers = splitComma('#thinkers');
    data.concepts = splitComma('#concepts');
  }

  if (moduleType === 'pensadores') {
    data.period = $('#period').value.trim();
    data.birth = $('#birth').value.trim();
    data.death = $('#death').value.trim();
    data.portrait = $('#portrait').value.trim() || 'img/retrato.webp';
    data.mainIdeas = readLines('#mainIdeas');
    data.works = readLines('#works');
  }

  if (moduleType === 'livros') {
    data.bookAuthor = $('#bookAuthor').value.trim();
    data.bookYear = $('#bookYear').value.trim();
    data.bookSummary = $('#bookSummary').value.trim();
    data.purchaseLinks = purchaseLinks.filter((link) => link.store && link.url);
  }

  if (['arte-explica', 'antes-da-disney', 'mitologias', 'personagens', 'conceitos', 'escolas-filosoficas'].includes(moduleType)) {
    data.context = $('#context').value.trim();
    data.connection = $('#connection').value.trim();
  }

  $$('.block').forEach((block) => data.blocks.push(readBlock(block)));
  return data;
}

function renderBlocks(blocks) {
  return blocks.map((block) => {
    if (block.type === 'paragraph' && block.content) return `<p>${linkInternalTerms(preserveBreaks(block.content))}</p>`;
    if (block.type === 'heading' && block.content) return `<h2>${escapeHtml(block.content)}</h2>`;
    if (block.type === 'image' && block.src) return `<figure class="article-image"><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}">${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}</figure>`;
    if (block.type === 'quote' && block.content) return `<blockquote><p>${escapeHtml(block.content)}</p>${block.author ? `<cite>${escapeHtml(block.author)}</cite>` : ''}</blockquote>`;
    if (block.type === 'entity' && block.name) return `<p class="entity-link"><a href="${escapeHtml(block.url || '#')}">${escapeHtml(block.name)}</a></p>`;
    if (block.type === 'note' && block.content) return `<aside class="note-box">${preserveBreaks(block.content)}</aside>`;
    if (block.type === 'list' && block.items?.length) return `<ul>\n${block.items.map((item) => `  <li>${linkInternalTerms(escapeHtml(item))}</li>`).join('\n')}\n</ul>`;
    if (block.type === 'separator') return '<hr>';
    return '';
  }).filter(Boolean).join('\n\n');
}

function renderPreview(data) {
  const meta = [data.moduleLabel, data.category].filter(Boolean).join(' • ');
  preview.innerHTML = `
    <p class="meta">${escapeHtml(meta)}</p>
    <h1>${escapeHtml(data.title || 'Título do conteúdo')}</h1>
    ${data.subtitle ? `<p>${escapeHtml(data.subtitle)}</p>` : ''}
    ${data.thumb ? `<figure><img src="../${escapeHtml(data.thumb)}" alt="thumb"><figcaption>Preview da thumb: ${escapeHtml(data.thumb)}</figcaption></figure>` : ''}
    ${renderBlocks(data.blocks) || '<p class="meta">Adicione blocos para ver o conteúdo aqui.</p>'}
  `;
}

function renderRelated(data) {
  const parts = [];
  if (data.thinkers?.length) parts.push(`<p class="article-meta"><strong>Pensadores citados:</strong> ${data.thinkers.map(escapeHtml).join(', ')}</p>`);
  if (data.concepts?.length) parts.push(`<p class="article-meta"><strong>Conceitos:</strong> ${data.concepts.map(escapeHtml).join(', ')}</p>`);
  if (data.relations?.length) parts.push(`<p class="article-meta"><strong>Relacionamentos:</strong> ${data.relations.map(escapeHtml).join(', ')}</p>`);
  if (data.period || data.birth || data.death) parts.push(`<p class="article-meta"><strong>Período:</strong> ${escapeHtml([data.period, data.birth && data.death ? `${data.birth}–${data.death}` : data.birth || data.death].filter(Boolean).join(' • '))}</p>`);
  if (data.bookAuthor || data.bookYear) parts.push(`<p class="article-meta"><strong>Livro:</strong> ${escapeHtml([data.bookAuthor, data.bookYear].filter(Boolean).join(' • '))}</p>`);
  if (data.purchaseLinks?.length) parts.push(`<p class="article-meta"><strong>Compra:</strong> ${data.purchaseLinks.map((link) => escapeHtml(link.store)).join(', ')}</p>`);
  return parts.join('\n    ');
}

function renderSchema(data) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': data.module === 'artigos' ? 'Article' : 'WebPage',
    headline: data.title,
    description: data.seoDescription,
    image: data.thumb,
    author: { '@type': 'Organization', name: data.author || 'Mente Crua' }
  };
  return JSON.stringify(schema, null, 2).replaceAll('</script>', '<\\/script>');
}

function renderHtml(data) {
  const body = renderBlocks(data.blocks);
  const relation = renderRelated(data);
  const seoTitle = `${data.title || 'Novo conteúdo'} | Mente Crua`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(seoTitle)}</title>
<meta name="description" content="${escapeHtml(data.seoDescription)}">
<meta name="author" content="${escapeHtml(data.author)}">
<meta property="og:title" content="${escapeHtml(data.title)}">
<meta property="og:description" content="${escapeHtml(data.seoDescription)}">
<meta property="og:image" content="${escapeHtml(data.thumb)}">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="../../../assets/css/main.css">
<link rel="icon" type="image/png" href="../../../assets/img/favicon-v1.png">
<script type="application/ld+json">
${renderSchema(data)}
</script>
</head>
<body>
<header class="site-header">
  <div class="container header-inner">
    <a class="logo" href="../../../index.html">Mente Crua</a>
    <nav class="main-nav">
      <a href="../../../index.html">Home</a>
      <a href="../../artigos/">Artigos</a>
      <a href="../../pensadores/">Pensadores</a>
    </nav>
  </div>
</header>
<main>
<section class="article-hero">
  <div class="container article-container">
    <p class="tag">${escapeHtml(data.moduleLabel)}${data.category ? ' • ' + escapeHtml(data.category) : ''}</p>
    <h1>${escapeHtml(data.title)}</h1>
    ${data.subtitle ? `<p>${escapeHtml(data.subtitle)}</p>` : ''}
    ${relation}
  </div>
</section>
<section class="article-section">
  <div class="container article-container">
    <article class="article-content">
${body}
      ${data.module === 'livros' ? renderPurchaseLinksHtml(data.purchaseLinks) : ''}
    </article>
  </div>
</section>
</main>
<footer class="site-footer">
  <div class="container">
    <p>Mente Crua — ideias sem filtro para quem ainda gosta de pensar.</p>
  </div>
</footer>
</body>
</html>`;
}

function generate() {
  const data = collectData();
  const html = renderHtml(data);
  outputHtml.value = html;
  outputJson.value = JSON.stringify(data, null, 2);
  updateFolderHint();
  renderPreview(data);
  return { data, html };
}

function downloadFile(filename, content, type) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function cleanFileName(name) {
  const dot = name.lastIndexOf('.');
  const base = dot > -1 ? name.slice(0, dot) : name;
  const ext = dot > -1 ? name.slice(dot + 1).toLowerCase() : '';
  return `${slugify(base) || 'imagem'}${ext ? '.' + ext : ''}`;
}

function importImages(event) {
  const files = Array.from(event.target.files || []);
  files.forEach((file) => {
    const targetName = cleanFileName(file.name);
    importedImages.push({ file, targetName, path: `img/${targetName}`, kind: file.type || targetName.split('.').pop() });
  });
  event.target.value = '';
  renderMediaLibrary();
  generate();
}

function renderMediaLibrary() {
  if (!importedImages.length) {
    mediaLibraryEl.innerHTML = '<p class="hint">Nenhuma imagem importada ainda.</p>';
    return;
  }
  mediaLibraryEl.innerHTML = '';
  importedImages.forEach((image, index) => {
    const card = document.createElement('div');
    card.className = 'media-card';
    const url = URL.createObjectURL(image.file);
    card.innerHTML = `
      <img src="${url}" alt="${escapeHtml(image.targetName)}">
      <code>${escapeHtml(image.path)}</code>
      <div class="media-actions">
        <button type="button" data-use-thumb="${index}">usar thumb</button>
        <button type="button" data-add-image="${index}">inserir bloco</button>
        <button type="button" data-copy-path="${index}">copiar caminho</button>
      </div>
    `;
    mediaLibraryEl.appendChild(card);
  });
  $$('[data-use-thumb]').forEach((button) => button.onclick = () => { $('#thumb').value = importedImages[button.dataset.useThumb].path; generate(); });
  $$('[data-add-image]').forEach((button) => button.onclick = () => { const img = importedImages[button.dataset.addImage]; addBlock('image', { src: img.path, alt: $('#title').value || img.targetName }); generate(); });
  $$('[data-copy-path]').forEach((button) => button.onclick = async () => { await navigator.clipboard?.writeText(importedImages[button.dataset.copyPath].path); });
}

async function ensureDir(handle, parts) {
  let current = handle;
  for (const part of parts) current = await current.getDirectoryHandle(part, { create: true });
  return current;
}

async function writeFile(dirHandle, fileName, content, type = 'text/plain') {
  const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(new Blob([content], { type }));
  await writable.close();
}

async function copyImportedImages(itemDir) {
  const imgDir = await itemDir.getDirectoryHandle('img', { create: true });
  for (const image of importedImages) {
    const fileHandle = await imgDir.getFileHandle(image.targetName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(image.file);
    await writable.close();
  }
}

async function publishLocal() {
  const { data, html } = generate();
  if (!('showDirectoryPicker' in window)) {
    publishStatus.textContent = 'Seu navegador não liberou escrita em pastas. Use Chrome/Edge atual ou baixe index.html + data.json manualmente.';
    return;
  }
  try {
    publishStatus.textContent = 'Escolha a pasta RAIZ do projeto, aquela que contém index.html, assets/ e modules/. Depois confirme a permissão.';
    const rootHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    const itemDir = await ensureDir(rootHandle, ['modules', data.module, data.slug]);
    await writeFile(itemDir, 'index.html', html, 'text/html');
    await writeFile(itemDir, 'data.json', JSON.stringify(data, null, 2), 'application/json');
    await copyImportedImages(itemDir);
    publishStatus.innerHTML = `Publicado localmente com sucesso.\n\nDestino:\n${data.folder}\n\nArquivos criados/atualizados:\n- index.html\n- data.json\n- ${importedImages.length} imagem(ns) em img/\n\nAgora teste no navegador e faça o commit manual.`;
  } catch (error) {
    publishStatus.textContent = `Publicação local cancelada ou falhou.\n\n${error.message}`;
  }
}

$('#generate').onclick = generate;
$('#publishLocal').onclick = publishLocal;
updateModuleFields();
addBlock('paragraph', { content: '' });
renderPurchaseLinks();
generate();
