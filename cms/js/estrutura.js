async function createContent() {
  if (!await requireProject()) return;
  const title = $('#contentName').value.trim() || $('#homeTitle').value.trim();
  if (!title) return alert('Informe o nome do conteúdo.');
  const type = $('#contentType').value || 'artigos';
  const slug = $('#contentSlug').value || slugify(title);
  if (!slug) return alert('Slug inválido.');
  try {
    const modulesDir = await ensureDir(Atlas.projectRootHandle, 'modules');
    const moduleDir = await ensureDir(modulesDir, type);
    const contentDir = await ensureDir(moduleDir, slug);
    const imgDir = await ensureDir(contentDir, 'img');
    const existing = await readJsonIfExists(contentDir, 'data.json');
    const data = existing || {
      type,
      typeLabel: moduleLabels[type] || type,
      title,
      slug,
      folder: `modules/${type}/${slug}/`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtitle: '',
      category: $('#homeCategory').value.trim(),
      tags: [],
      thumb: $('#homeThumb').value.trim(),
      home: {
        title: $('#homeTitle').value.trim() || title,
        description: $('#homeDescription').value.trim(),
        category: $('#homeCategory').value.trim(),
        thumb: $('#homeThumb').value.trim(),
        link: `modules/${type}/${slug}/`
      },
      seo: { title: '', description: '', ogImage: '' },
      relationships: [],
      language: 'pt-BR',
      presentation: { heroImage: '', theme: 'light', accentColor: '#8f2424', heroPosition: 'center' },
      sidebar: { autoToc: true, library: [], explore: [] },
      advertising: { sidebar: true, middle: true, end: false },
      contentHtml: ''
    };
    await writeFile(contentDir, 'data.json', JSON.stringify(data, null, 2), 'application/json');
    try { await contentDir.getFileHandle('index.html'); }
    catch (_) { await writeFile(contentDir, 'index.html', '<!-- Será gerado pelo Atlas ao publicar. -->', 'text/html'); }
    await setCurrentContent({ dirHandle: contentDir, imgHandle: imgDir, data });
    setLog(`📁 ESTRUTURA\n✔ Conteúdo criado e aberto\n✔ ${data.folder}\n✔ img/\n✔ data.json\n✔ index.html`);
  } catch (err) {
    setLog(`📁 ESTRUTURA\n❌ ${err.message}`);
  }
}

async function openContent() {
  if (!await requireProject()) return;
  try {
    const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
    const data = await readJsonIfExists(dir, 'data.json');
    if (!data) throw new Error('A pasta escolhida não possui data.json. Escolha a pasta do conteúdo.');
    const imgDir = await ensureDir(dir, 'img');
    await setCurrentContent({ dirHandle: dir, imgHandle: imgDir, data });
    setLog(`📚 CONTEÚDO\n✔ Aberto: ${data.title}`);
  } catch (err) {
    setLog(`📚 CONTEÚDO\n❌ ${err.message || 'operação cancelada'}`);
  }
}
