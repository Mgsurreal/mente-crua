const $ = (selector) => document.querySelector(selector);

const Atlas = {
  projectRootHandle: null,
  contentDirHandle: null,
  imgDirHandle: null,
  current: null,
  media: []
};

const ATLAS_DRAFT_KEY = 'mente-crua-atlas-draft-v1';
let atlasDraftTimer = null;
let atlasDraftDirty = false;

function draftFields() {
  return [...document.querySelectorAll('input[id], select[id], textarea[id]')]
    .filter((field) => field.type !== 'file' && field.type !== 'button' && !field.readOnly);
}

function draftSnapshot() {
  const fields = {};
  draftFields().forEach((field) => {
    fields[field.id] = field.type === 'checkbox' ? field.checked : field.value;
  });
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    activeStep: document.querySelector('.step.active')?.dataset.step || 'home',
    fields
  };
}

function setDraftStatus(message, ok = true) {
  const status = $('#draftStatus');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('ok', ok);
}

function saveLocalDraft() {
  try {
    const snapshot = draftSnapshot();
    localStorage.setItem(ATLAS_DRAFT_KEY, JSON.stringify(snapshot));
    atlasDraftDirty = false;
    const time = new Date(snapshot.savedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setDraftStatus(`Salvo automaticamente às ${time}`);
  } catch (error) {
    setDraftStatus('Não foi possível salvar neste navegador', false);
    console.error('Atlas: falha ao salvar rascunho local.', error);
  }
}

function scheduleLocalDraft() {
  atlasDraftDirty = true;
  setDraftStatus('Salvando alterações…');
  clearTimeout(atlasDraftTimer);
  atlasDraftTimer = setTimeout(saveLocalDraft, 450);
}

function restoreLocalDraft() {
  try {
    const raw = localStorage.getItem(ATLAS_DRAFT_KEY);
    if (!raw) return false;
    const draft = JSON.parse(raw);
    if (!draft?.fields || draft.version !== 1) return false;
    Object.entries(draft.fields).forEach(([id, value]) => {
      const field = document.getElementById(id);
      if (!field || field.type === 'file' || field.readOnly) return;
      if (field.type === 'checkbox') field.checked = Boolean(value);
      else field.value = value ?? '';
    });
    updateDestinationFields();
    if (draft.activeStep && document.getElementById(`screen-${draft.activeStep}`)) gotoStep(draft.activeStep);
    const date = new Date(draft.savedAt);
    const label = Number.isNaN(date.getTime()) ? 'Rascunho recuperado' : `Recuperado de ${date.toLocaleString('pt-BR')}`;
    setDraftStatus(label);
    return true;
  } catch (error) {
    setDraftStatus('Rascunho local danificado; formulário preservado', false);
    console.error('Atlas: falha ao recuperar rascunho local.', error);
    return false;
  }
}

function clearLocalDraft() {
  if (!confirm('Limpar apenas o rascunho automático deste navegador? Os arquivos já publicados não serão apagados.')) return;
  localStorage.removeItem(ATLAS_DRAFT_KEY);
  setDraftStatus('Rascunho local limpo');
}

const moduleLabels = {
  artigos: 'Artigo',
  pensadores: 'Pensador',
  livros: 'Livro',
  conceitos: 'Conceito',
  personagens: 'Personagem',
  obras: 'Obra',
  mitologia: 'Mitologia'
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

function splitList(value = '') {
  return String(value).split(',').map((x) => x.trim()).filter(Boolean);
}

function splitLines(value = '') {
  return String(value).split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
}

function setLog(message) { $('#log').textContent = message; }
function addLog(message) { $('#log').textContent += `\n${message}`; }

async function ensureDir(parent, name) {
  return await parent.getDirectoryHandle(name, { create: true });
}

async function writeFile(dir, name, content, type = 'text/plain') {
  const fileHandle = await dir.getFileHandle(name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(new Blob([content], { type }));
  await writable.close();
}

async function readFileText(dir, name) {
  const fileHandle = await dir.getFileHandle(name);
  const file = await fileHandle.getFile();
  return await file.text();
}

async function readJsonIfExists(dir, name) {
  try { return JSON.parse(await readFileText(dir, name)); }
  catch (_) { return null; }
}

async function selectProjectRoot() {
  const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
  try {
    await handle.getDirectoryHandle('modules');
    await handle.getFileHandle('index.html');
  } catch (_) {
    alert('Selecione a raiz do projeto Mente-Crua, não a pasta de um artigo.');
    return false;
  }
  Atlas.projectRootHandle = handle;
  refreshStatus();
  setLog(`✔ Projeto definido: ${handle.name}`);
  return true;
}

async function requireProject() {
  if (Atlas.projectRootHandle) return true;
  setLog('Selecione a raiz do projeto Mente-Crua.');
  return await selectProjectRoot();
}

async function requireContent() {
  if (Atlas.contentDirHandle && Atlas.current) return true;
  alert('Crie ou abra um conteúdo primeiro.');
  return false;
}

function currentFolder() {
  const type = $('#contentType').value || 'artigos';
  const slug = $('#contentSlug').value || slugify($('#contentName').value);
  return `modules/${type}/${slug}/`;
}

function updateDestinationFields() {
  const name = $('#contentName').value;
  if (!$('#contentSlug').dataset.manual) $('#contentSlug').value = slugify(name);
  $('#contentDestination').value = currentFolder();
  $('#homeLink').value = currentFolder();
}

function refreshStatus() {
  const project = $('#projectStatus');
  const content = $('#contentStatus');
  project.textContent = Atlas.projectRootHandle ? Atlas.projectRootHandle.name : 'Nenhum projeto definido';
  project.classList.toggle('ok', Boolean(Atlas.projectRootHandle));
  if (Atlas.current) {
    content.textContent = `${moduleLabels[Atlas.current.type] || Atlas.current.type}: ${Atlas.current.title}`;
    content.classList.add('ok');
  } else {
    content.textContent = 'Nenhum conteúdo aberto';
    content.classList.remove('ok');
  }
}

function gotoStep(name) {
  document.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.step').forEach((el) => el.classList.remove('active'));
  $(`#screen-${name}`).classList.add('active');
  document.querySelector(`.step[data-step="${name}"]`).classList.add('active');
}

function collectEditorData() {
  const type = Atlas.current?.type || $('#contentType').value || 'artigos';
  const slug = Atlas.current?.slug || $('#contentSlug').value || slugify($('#title').value);
  const title = $('#title').value.trim() || $('#contentName').value.trim() || $('#homeTitle').value.trim();
  const folder = `modules/${type}/${slug}/`;
  return {
    type,
    typeLabel: moduleLabels[type] || type,
    title,
    subtitle: $('#subtitle').value.trim(),
    slug,
    folder,
    category: $('#category').value.trim(),
    tags: splitList($('#tags').value),
    thumb: $('#thumb').value.trim() || $('#homeThumb').value.trim(),
    presentation: {
      heroImage: $('#heroImage').value.trim() || $('#thumb').value.trim(),
      theme: $('#articleTheme').value || 'light',
      accentColor: $('#accentColor').value || '#8f2424',
      heroPosition: $('#heroPosition').value || 'center'
    },
    language: $('#articleLanguage').value || 'pt-BR',
    author: $('#author').value.trim() || 'Equipe Mente Crua',
    publishedAt: $('#publishedAt').value || new Date().toISOString().slice(0, 10),
    readingTime: Math.max(1, Number($('#readingTime').value) || 8),
    home: {
      title: $('#homeTitle').value.trim() || title,
      description: $('#homeDescription').value.trim() || $('#seoDescription').value.trim(),
      category: $('#homeCategory').value.trim() || $('#category').value.trim(),
      thumb: $('#homeThumb').value.trim() || $('#thumb').value.trim(),
      link: folder
    },
    seo: {
      title: $('#seoTitle').value.trim() || title,
      description: $('#seoDescription').value.trim(),
      ogImage: $('#ogImage').value.trim()
    },
    relationships: splitList($('#relationships').value),
    sidebar: {
      autoToc: $('#autoToc').checked,
      library: splitLines($('#sidebarLibrary').value),
      explore: splitLines($('#sidebarExplore').value)
    },
    advertising: {
      sidebar: $('#adSidebar').checked,
      middle: $('#adMiddle').checked,
      end: $('#adEnd').checked
    },
    contentHtml: $('#contentHtml').value.trim(),
    status: 'draft',
    updatedAt: new Date().toISOString()
  };
}

function fillForms(data) {
  $('#contentType').value = data.type || 'artigos';
  $('#contentName').value = data.title || '';
  $('#contentSlug').value = data.slug || slugify(data.title || '');
  $('#contentSlug').dataset.manual = 'true';
  $('#title').value = data.title || '';
  $('#subtitle').value = data.subtitle || '';
  $('#category').value = data.category || '';
  $('#tags').value = Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || '');
  $('#thumb').value = data.thumb || '';
  $('#ogImage').value = data.seo?.ogImage || '';
  $('#heroImage').value = data.presentation?.heroImage || data.thumb || '';
  $('#articleTheme').value = data.presentation?.theme || 'light';
  $('#accentColor').value = data.presentation?.accentColor || '#8f2424';
  $('#heroPosition').value = data.presentation?.heroPosition || 'center';
  $('#articleLanguage').value = data.language || 'pt-BR';
  $('#author').value = data.author || 'Equipe Mente Crua';
  $('#publishedAt').value = (data.publishedAt || '').slice(0, 10);
  $('#readingTime').value = data.readingTime || 8;
  $('#seoTitle').value = data.seo?.title || '';
  $('#seoDescription').value = data.seo?.description || '';
  $('#relationships').value = Array.isArray(data.relationships) ? data.relationships.join(', ') : (data.relationships || '');
  $('#autoToc').checked = data.sidebar?.autoToc !== false;
  $('#sidebarLibrary').value = Array.isArray(data.sidebar?.library) ? data.sidebar.library.join('\n') : '';
  $('#sidebarExplore').value = Array.isArray(data.sidebar?.explore) ? data.sidebar.explore.join('\n') : '';
  $('#adSidebar').checked = data.advertising?.sidebar !== false;
  $('#adMiddle').checked = data.advertising?.middle !== false;
  $('#adEnd').checked = data.advertising?.end === true;
  $('#contentHtml').value = data.contentHtml || '';
  $('#homeTitle').value = data.home?.title || data.title || '';
  $('#homeDescription').value = data.home?.description || data.seo?.description || data.subtitle || '';
  $('#homeCategory').value = data.home?.category || data.category || '';
  $('#homeThumb').value = data.home?.thumb || data.thumb || '';
  updateDestinationFields();
}

async function setCurrentContent({ dirHandle, imgHandle, data }) {
  Atlas.contentDirHandle = dirHandle;
  Atlas.imgDirHandle = imgHandle || await ensureDir(dirHandle, 'img');
  Atlas.current = {
    type: data.type,
    slug: data.slug,
    title: data.title,
    folder: data.folder || `modules/${data.type}/${data.slug}/`
  };
  fillForms(data);
  saveLocalDraft();
  await refreshMediaLibrary();
  refreshStatus();
}
