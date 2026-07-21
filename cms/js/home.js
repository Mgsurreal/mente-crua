function buildHomeCard(data) {
  const home = data.home || {};
  const title = home.title || data.title;
  const description = home.description || data.seo?.description || data.subtitle || '';
  const category = home.category || data.category || '';
  const link = home.link || data.folder;
  const rawThumb = home.thumb || data.thumb || '';
  const thumb = rawThumb ? `${data.folder}${rawThumb}` : 'assets/img/logo-site.png';
  return `
            <article class="post-card" data-atlas-slug="${escapeHtml(data.slug)}">

                <a href="${escapeHtml(link)}" class="post-thumb">
                    <img src="${escapeHtml(thumb)}" alt="${escapeHtml(title)}">
                </a>

                ${category ? `<span class="post-category">${escapeHtml(category)}</span>` : ''}

                <h3>${escapeHtml(title)}</h3>

                ${description ? `<p>${escapeHtml(description)}</p>` : ''}

                <a href="${escapeHtml(link)}">Ler artigo →</a>

            </article>`;
}

function appendOrUpdateCard(existingHtml, newCard, slug) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = existingHtml;
  const old = wrapper.querySelector(`[data-atlas-slug="${CSS.escape(slug)}"]`);
  if (old) {
    old.outerHTML = newCard;
  } else {
    wrapper.insertAdjacentHTML('afterbegin', newCard);
  }
  Array.from(wrapper.querySelectorAll('.post-card')).slice(4).forEach((card) => card.remove());
  return wrapper.innerHTML.trim();
}

async function publishHomeCard(options = {}) {
  if (!await requireProject()) return;

  const publishedData = options.data || null;
  const type = publishedData?.type || $('#contentType').value || 'artigos';
  const title = publishedData
    ? (publishedData.home?.title || publishedData.title || '').trim()
    : ($('#homeTitle').value.trim() || $('#contentName').value.trim());
  if (!title) return alert('Informe o título do card da Home.');

  const slug = publishedData?.slug || $('#contentSlug').value || slugify($('#contentName').value || title);
  const folder = publishedData?.folder || `modules/${type}/${slug}/`;
  const data = publishedData ? {
    ...publishedData,
    type,
    slug,
    title: publishedData.title || title,
    folder,
    home: {
      ...(publishedData.home || {}),
      title,
      link: publishedData.home?.link || folder
    }
  } : {
    type,
    slug,
    title,
    folder,
    category: $('#category').value.trim(),
    subtitle: $('#subtitle').value.trim(),
    thumb: $('#thumb').value.trim(),
    seo: { description: $('#seoDescription').value.trim() },
    home: {
      title,
      description: $('#homeDescription').value.trim(),
      category: $('#homeCategory').value.trim(),
      thumb: $('#homeThumb').value.trim(),
      link: folder
    }
  };

  try {
    const homeHandle = await Atlas.projectRootHandle.getFileHandle('index.html');
    const file = await homeHandle.getFile();
    let html = await file.text();
    const start = '<!-- ATLAS:RECENT_POSTS_START -->';
    const end = '<!-- ATLAS:RECENT_POSTS_END -->';
    const startIndex = html.indexOf(start);
    const endIndex = html.indexOf(end);
    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      throw new Error('Marcadores ATLAS:RECENT_POSTS não encontrados na Home.');
    }
    const before = html.slice(0, startIndex + start.length);
    const currentCards = html.slice(startIndex + start.length, endIndex);
    const after = html.slice(endIndex);
    const newCard = buildHomeCard(data);
    const updatedCards = appendOrUpdateCard(currentCards, newCard, slug);
    html = `${before}\n${updatedCards}\n${after}`;
    const writable = await homeHandle.createWritable();
    await writable.write(new Blob([html], { type: 'text/html' }));
    await writable.close();
    if (!options.silent) setLog(`🏠 HOME\n✔ Card publicado/atualizado\n✔ Slug: ${slug}\n✔ Outros cards preservados`);
  } catch (err) {
    if (!options.silent) setLog(`🏠 HOME\n❌ ${err.message}`);
    throw err;
  }
}
