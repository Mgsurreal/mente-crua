(() => {
  const article = document.querySelector('.article-paper');
  const articleCopy = document.querySelector('.article-copy');
  if (!article || !articleCopy) return;

  const figures = [...articleCopy.querySelectorAll('figure')];
  if (figures.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'article-lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = '<div class="article-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Imagem ampliada"><button class="article-lightbox__close" type="button" aria-label="Fechar imagem ampliada">×</button><img class="article-lightbox__image" alt=""><p class="article-lightbox__caption"></p></div>';
    document.body.appendChild(lightbox);

    const image = lightbox.querySelector('.article-lightbox__image');
    const caption = lightbox.querySelector('.article-lightbox__caption');
    const closeButton = lightbox.querySelector('.article-lightbox__close');
    let returnFocus = null;

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('article-lightbox-open');
      image.removeAttribute('src');
      returnFocus?.focus?.();
    }

    figures.forEach(figure => {
      const source = figure.querySelector('img');
      if (!source) return;
      source.tabIndex = 0;
      source.setAttribute('role', 'button');
      source.setAttribute('aria-label', `${source.alt || 'Imagem'}. Clique para ampliar.`);
      const open = () => {
        returnFocus = source;
        image.src = source.currentSrc || source.src;
        image.alt = source.alt || '';
        caption.textContent = figure.querySelector('figcaption')?.textContent.trim() || source.alt || '';
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('article-lightbox-open');
        closeButton.focus();
      };
      source.addEventListener('click', open);
      source.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
      });
    });

    closeButton.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
    });
  }

  const synth = window.speechSynthesis;
  const play = document.querySelector('[data-reader-play]');
  const pause = document.querySelector('[data-reader-pause]');
  const stop = document.querySelector('[data-reader-stop]');
  const rate = document.querySelector('[data-reader-rate]');
  const readerStatus = document.querySelector('.article-reader-status');
  let queue = [];
  let current = 0;
  let stopped = true;

  function controls(state) {
    if (!play) return;
    play.disabled = state === 'playing' || state === 'paused';
    pause.disabled = state === 'stopped';
    stop.disabled = state === 'stopped';
    pause.textContent = state === 'paused' ? '▶ Continuar' : '⏸ Pausar';
    play.textContent = state === 'playing' ? '▶ Lendo' : '▶ Ouvir artigo';
    if (readerStatus) readerStatus.textContent = state === 'playing' ? 'Lendo o artigo' : state === 'paused' ? 'Leitura pausada' : 'Leitor disponível';
  }

  function finish() {
    stopped = true;
    synth?.cancel();
    queue = [];
    current = 0;
    controls('stopped');
  }

  function speakNext() {
    if (stopped || current >= queue.length) return finish();
    const utterance = new SpeechSynthesisUtterance(queue[current]);
    utterance.lang = article.dataset.articleLang || document.documentElement.lang || 'pt-BR';
    utterance.rate = Number(rate?.value || .95);
    utterance.onend = () => { if (!stopped) { current += 1; speakNext(); } };
    utterance.onerror = event => { if (!['canceled', 'interrupted'].includes(event.error)) finish(); };
    synth.speak(utterance);
  }

  if (!synth || !play) document.querySelector('.article-audio-reader')?.setAttribute('hidden', '');
  else {
    play.addEventListener('click', () => {
      synth.cancel();
      queue = [...articleCopy.querySelectorAll('h2, h3, p, blockquote p')]
        .filter(node => !node.closest('figcaption, .article-ad'))
        .map(node => node.textContent.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      current = 0;
      stopped = false;
      controls('playing');
      speakNext();
    });
    pause?.addEventListener('click', () => {
      if (synth.paused) { synth.resume(); controls('playing'); }
      else if (synth.speaking) { synth.pause(); controls('paused'); }
    });
    stop?.addEventListener('click', finish);
    window.addEventListener('beforeunload', () => synth.cancel());
    controls('stopped');
  }

  const title = document.title;
  const url = window.location.href;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
  };
  document.querySelectorAll('[data-share]').forEach(link => { if (shareLinks[link.dataset.share]) link.href = shareLinks[link.dataset.share]; });
  const native = document.querySelector('[data-share-native]');
  if (native && navigator.share) {
    native.hidden = false;
    native.addEventListener('click', () => navigator.share({ title, url }).catch(() => {}));
  }
  document.querySelector('[data-share-copy]')?.addEventListener('click', async () => {
    const status = document.querySelector('.article-share__status');
    try { await navigator.clipboard.writeText(url); if (status) status.textContent = 'Link copiado.'; }
    catch { if (status) status.textContent = 'Não foi possível copiar.'; }
  });
})();
