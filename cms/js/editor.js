async function saveEditor(options = {}) {
  if (!await requireContent()) return;
  try {
    const existing = await readJsonIfExists(Atlas.contentDirHandle, 'data.json') || {};
    const data = { ...existing, ...collectEditorData(), createdAt: existing.createdAt || new Date().toISOString() };
    await writeFile(Atlas.contentDirHandle, 'data.json', JSON.stringify(data, null, 2), 'application/json');
    Atlas.current = { type: data.type, slug: data.slug, title: data.title, folder: data.folder };
    refreshStatus();
    if (!options.silent) setLog(`✍️ EDITOR\n✔ data.json salvo\n✔ HTML: ${data.contentHtml.length} caracteres`);
    return data;
  } catch (err) {
    setLog(`✍️ EDITOR\n❌ ${err.message}`);
    return null;
  }
}
