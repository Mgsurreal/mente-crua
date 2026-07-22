async function saveEditor(options = {}) {
  if (!await requireContent()) return;
  try {
    if (Atlas.translationLocale) {
      const locale = Atlas.translationLocale;
      const existing = await readTranslationData(locale) || {};
      const data = {
        ...existing,
        ...collectEditorData(),
        language: locale,
        translationOf: Atlas.current.slug,
        createdAt: existing.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await writeTranslationData(locale, data);
      await updateTranslationStatus(locale, 'editing');
      if (!options.silent) setLog(`🌐 TRADUÇÃO\n✔ ${window.MenteCruaLocales.byCode[locale].nativeLabel} salva\n✔ Original brasileiro preservado`);
      return data;
    }
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
