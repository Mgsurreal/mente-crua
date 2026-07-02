async function refreshMediaLibrary() {
  const el = $('#mediaLibrary');
  if (!Atlas.imgDirHandle) {
    el.innerHTML = '<p class="hint">Nenhum conteúdo aberto.</p>';
    return;
  }
  Atlas.media = [];
  for await (const [name, handle] of Atlas.imgDirHandle.entries()) {
    if (handle.kind === 'file') Atlas.media.push({ name, handle, path: `img/${name}` });
  }
  Atlas.media.sort((a,b)=>a.name.localeCompare(b.name));
  await renderMediaLibrary();
}

async function renderMediaLibrary() {
  const el = $('#mediaLibrary');
  if (!Atlas.media.length) {
    el.innerHTML = '<p class="hint">Nenhuma imagem adicionada ainda.</p>';
    return;
  }
  el.innerHTML = '';
  const thumb = $('#thumb').value.trim() || $('#homeThumb').value.trim();
  for (const item of Atlas.media) {
    const file = await item.handle.getFile();
    const url = URL.createObjectURL(file);
    const card = document.createElement('div');
    card.className = `media-card ${thumb === item.path ? 'is-thumb' : ''}`;
    card.innerHTML = `
      <img src="${url}" alt="">
      <div class="media-body">
        <div class="media-name">${escapeHtml(item.name)}</div>
        <div class="media-actions">
          <button type="button" data-thumb="${escapeHtml(item.path)}">${thumb === item.path ? '✅ Thumb' : 'Usar thumb'}</button>
          <button type="button" data-copy="${escapeHtml(item.path)}">Copiar caminho</button>
        </div>
      </div>`;
    el.appendChild(card);
  }
}

function snapshotContext() {
  return {
    projectRootHandle: Atlas.projectRootHandle,
    contentDirHandle: Atlas.contentDirHandle,
    imgDirHandle: Atlas.imgDirHandle,
    current: Atlas.current ? { ...Atlas.current } : null,
    step: document.querySelector('.screen.active')?.id || 'screen-imagens'
  };
}

function restoreContext(snapshot) {
  Atlas.projectRootHandle = snapshot.projectRootHandle;
  Atlas.contentDirHandle = snapshot.contentDirHandle;
  Atlas.imgDirHandle = snapshot.imgDirHandle;
  Atlas.current = snapshot.current;
  refreshStatus();
}

async function addImages() {
  if (!await requireContent()) return;
  const input = $('#imageInput');
  if (!input) return alert('Input de imagens não encontrado.');
  input.value = '';
  input.click();
}

async function handleImageInputChange(event) {
  if (!await requireContent()) return;
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const snapshot = snapshotContext();
  restoreContext(snapshot);

  try {
    setLog(`🖼 IMAGENS\nAdicionando ${files.length} imagem(ns)...`);
    let count = 0;
    const copied = [];

    for (const file of files) {
      const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'imagem';
      const ext = (file.name.match(/\.[^.]+$/)?.[0] || '').toLowerCase();
      let name = `${base}${ext}`;
      let tries = 2;
      while (true) {
        try {
          await Atlas.imgDirHandle.getFileHandle(name);
          name = `${base}-${tries}${ext}`;
          tries++;
        } catch (_) { break; }
      }
      const out = await Atlas.imgDirHandle.getFileHandle(name, { create: true });
      const writable = await out.createWritable();
      await writable.write(file);
      await writable.close();
      copied.push(name);
      count++;
    }

    restoreContext(snapshot);
    await refreshMediaLibrary();
    refreshStatus();
    setLog(`🖼 IMAGENS\n✔ ${count} imagem(ns) adicionada(s)\n${copied.map(n => '✔ ' + n).join('\n')}\n✔ Conteúdo preservado\n✔ Biblioteca atualizada`);
  } catch (err) {
    restoreContext(snapshot);
    refreshStatus();
    setLog(`🖼 IMAGENS\n❌ ${err.message || 'operação cancelada'}\n✔ Contexto preservado`);
  } finally {
    event.target.value = '';
  }
}

function handleMediaClick(event) {
  const btn = event.target.closest('button');
  if (!btn) return;
  if (btn.dataset.thumb) {
    $('#thumb').value = btn.dataset.thumb;
    $('#homeThumb').value = btn.dataset.thumb;
    renderMediaLibrary();
    setLog(`🖼 IMAGENS\n✔ Thumb definida: ${btn.dataset.thumb}`);
  }
  if (btn.dataset.copy) {
    navigator.clipboard?.writeText(btn.dataset.copy);
    setLog(`🖼 IMAGENS\n✔ Caminho copiado: ${btn.dataset.copy}`);
  }
}
