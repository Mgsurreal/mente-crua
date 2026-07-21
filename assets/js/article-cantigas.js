(function () {
  const figures = document.querySelectorAll('.article-copy figure');
  const lightbox = document.getElementById('article-lightbox');
  if (!lightbox || !figures.length) return;

  const lightboxImage = lightbox.querySelector('.article-lightbox__image');
  const lightboxCaption = lightbox.querySelector('.article-lightbox__caption');
  const closeButton = lightbox.querySelector('.article-lightbox__close');
  let lastTrigger = null;

  figures.forEach((figure) => {
    const image = figure.querySelector('img');
    if (!image) return;

    figure.classList.add('is-zoomable');
    image.setAttribute('tabindex', '0');
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', (image.alt || 'Imagem do artigo') + '. Clique para ampliar.');

    const open = () => {
      lastTrigger = image;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || '';
      const figcaption = figure.querySelector('figcaption');
      lightboxCaption.textContent = figcaption ? figcaption.textContent.trim() : (image.alt || '');
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeButton.focus();
    };

    image.addEventListener('click', open);
    image.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });

  const close = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  };

  closeButton.addEventListener('click', close);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
      close();
    }
  });
})();

(function () {
  const synth = window.speechSynthesis;
  const article = document.querySelector('.article-paper');
  const articleCopy = document.querySelector('.article-copy');
  const playButton = document.querySelector('[data-reader-play]');
  const pauseButton = document.querySelector('[data-reader-pause]');
  const stopButton = document.querySelector('[data-reader-stop]');
  const rateSelect = document.querySelector('[data-reader-rate]');
  const status = document.querySelector('.article-reader-status');

  if (!synth || !article || !articleCopy || !playButton) {
    const reader = document.querySelector('.article-audio-reader');
    if (reader) reader.hidden = true;
    return;
  }

  let queue = [];
  let currentIndex = 0;
  let currentUtterance = null;
  let isStopped = true;

  const articleLang = article.dataset.articleLang || document.documentElement.lang || 'pt-BR';

  function getPreferredVoice() {
    const voices = synth.getVoices();
    return (
      voices.find((voice) => voice.lang === articleLang) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith(articleLang.slice(0, 2).toLowerCase())) ||
      null
    );
  }

  function cleanText(value) {
    return value.replace(/\s+/g, ' ').trim();
  }

  function buildReadingQueue() {
    const clone = articleCopy.cloneNode(true);

    clone.querySelectorAll(
      '.article-ad, .article-tags, figcaption, script, style, ' +
      '.article-source-note, .article-lightbox, [aria-hidden="true"]'
    ).forEach((node) => node.remove());

    const readableNodes = clone.querySelectorAll(
      'h2, h3, p, blockquote p, .lullaby-card__label'
    );

    return Array.from(readableNodes)
      .map((node) => cleanText(node.textContent || ''))
      .filter((text) => text.length > 0);
  }

  function updateControls(state) {
    if (state === 'playing') {
      playButton.innerHTML = '<span aria-hidden="true">▶</span> Lendo';
      playButton.disabled = true;
      pauseButton.disabled = false;
      stopButton.disabled = false;
      status.textContent = 'Lendo o artigo';
    } else if (state === 'paused') {
      playButton.disabled = true;
      pauseButton.innerHTML = '<span aria-hidden="true">▶</span> Continuar';
      pauseButton.disabled = false;
      stopButton.disabled = false;
      status.textContent = 'Leitura pausada';
    } else {
      playButton.innerHTML = '<span aria-hidden="true">▶</span> Ouvir artigo';
      playButton.disabled = false;
      pauseButton.innerHTML = '<span aria-hidden="true">⏸</span> Pausar';
      pauseButton.disabled = true;
      stopButton.disabled = true;
      status.textContent = 'Leitor disponível';
    }
  }

  function speakNext() {
    if (isStopped || currentIndex >= queue.length) {
      stopReading();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(queue[currentIndex]);
    currentUtterance = utterance;
    utterance.lang = articleLang;
    utterance.rate = Number(rateSelect?.value || 0.95);
    utterance.pitch = 1;

    const voice = getPreferredVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = function () {
      if (isStopped) return;
      currentIndex += 1;
      speakNext();
    };

    utterance.onerror = function (event) {
      if (event.error === 'canceled' || event.error === 'interrupted') return;
      status.textContent = 'Não foi possível continuar a leitura';
      stopReading();
    };

    synth.speak(utterance);
  }

  function startReading() {
    synth.cancel();
    queue = buildReadingQueue();
    currentIndex = 0;
    isStopped = false;

    if (!queue.length) {
      status.textContent = 'Nenhum texto disponível para leitura';
      return;
    }

    updateControls('playing');
    speakNext();
  }

  function stopReading() {
    isStopped = true;
    synth.cancel();
    queue = [];
    currentIndex = 0;
    currentUtterance = null;
    updateControls('stopped');
  }

  playButton.addEventListener('click', startReading);

  pauseButton.addEventListener('click', function () {
    if (synth.paused) {
      synth.resume();
      pauseButton.innerHTML = '<span aria-hidden="true">⏸</span> Pausar';
      status.textContent = 'Leitura retomada';
      updateControls('playing');
    } else if (synth.speaking) {
      synth.pause();
      updateControls('paused');
    }
  });

  stopButton.addEventListener('click', stopReading);

  rateSelect?.addEventListener('change', function () {
    if (synth.speaking && !synth.paused) {
      const resumeAt = currentIndex;
      synth.cancel();
      currentIndex = resumeAt;
      speakNext();
      status.textContent = 'Velocidade alterada';
    }
  });

  window.addEventListener('beforeunload', function () {
    synth.cancel();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && synth.speaking && !synth.paused) {
      synth.pause();
      updateControls('paused');
    }
  });

  if ('onvoiceschanged' in speechSynthesis) {
    speechSynthesis.onvoiceschanged = getPreferredVoice;
  }

  updateControls('stopped');
})();

(function () {
  const title = document.title;
  const url = window.location.href;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const links = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
  };

  document.querySelectorAll('[data-share]').forEach((link) => {
    const network = link.dataset.share;
    if (links[network]) link.href = links[network];
  });

  const nativeButton = document.querySelector('[data-share-native]');
  if (nativeButton && navigator.share) {
    nativeButton.hidden = false;
    nativeButton.addEventListener('click', async () => {
      try {
        await navigator.share({ title, url });
      } catch (error) {
        if (error.name !== 'AbortError') {
          const status = document.querySelector('.article-share__status');
          if (status) status.textContent = 'Não foi possível abrir o compartilhamento.';
        }
      }
    });
  }

  const copyButton = document.querySelector('[data-share-copy]');
  const status = document.querySelector('.article-share__status');

  copyButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(url);
      if (status) status.textContent = 'Link copiado.';
    } catch (error) {
      const temporary = document.createElement('textarea');
      temporary.value = url;
      temporary.setAttribute('readonly', '');
      temporary.style.position = 'fixed';
      temporary.style.opacity = '0';
      document.body.appendChild(temporary);
      temporary.select();
      document.execCommand('copy');
      temporary.remove();
      if (status) status.textContent = 'Link copiado.';
    }
  });
})();

(function () {
  const modal = document.getElementById('cuca-card-modal');
  if (!modal) return;

  const dialog = modal.querySelector('.entity-modal__dialog');
  const closeTriggers = modal.querySelectorAll('[data-cuca-close]');
  const cucaLinks = document.querySelectorAll('[data-future-article="cuca"]');
  let lastTrigger = null;

  function openCucaCard(trigger) {
    lastTrigger = trigger;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('entity-modal-open');

    window.setTimeout(function () {
      dialog.focus();
    }, 20);
  }

  function closeCucaCard() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('entity-modal-open');

    if (lastTrigger) {
      lastTrigger.focus();
    }
  }

  cucaLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      openCucaCard(link);
    });
  });

  closeTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', closeCucaCard);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeCucaCard();
    }
  });
})();
