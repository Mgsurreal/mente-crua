(() => {
  const switcher = document.querySelector('#article-language-switcher select');
  if (!switcher) return;
  const switcherLabel = switcher.closest('#article-language-switcher');
  const header = switcher.closest('.header-content');
  const search = header?.querySelector('.site-search');
  if (switcherLabel && header && search) {
    let tools = header.querySelector('.header-tools');
    if (!tools) {
      tools = document.createElement('div');
      tools.className = 'header-tools';
      header.insertBefore(tools, search);
    }
    switcherLabel.classList.add('language-selector');
    const labelText = switcherLabel.querySelector('span');
    if (labelText) labelText.hidden = true;
    tools.append(switcherLabel, search);
  }
  const storageKey = window.MenteCruaLocales?.storageKey || 'mente-crua-language';
  const detectLocale = () => {
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const raw of languages) {
      const code = String(raw || '').toLowerCase();
      if (code === 'pt-pt') return 'pt-pt';
      if (code.startsWith('pt')) return 'pt-br';
      if (code.startsWith('en')) return 'en-gb';
      if (/^es-(mx|ar|cl|co|pe|uy|ve|ec|bo|py|cr|gt|hn|ni|pa|do|pr)/.test(code)) return 'es-latam';
      if (code.startsWith('es')) return 'es-es';
      if (code === 'ar-eg') return 'ar-eg';
      if (code.startsWith('ar')) return 'ar';
      const mapped = {fr:'fr-fr',de:'de-de',it:'it-it',ru:'ru-ru',hi:'hi-in',ja:'ja-jp',ko:'ko-kr',zh:'zh-cn'}[code.split('-')[0]];
      if (mapped) return mapped;
    }
    return 'pt-br';
  };
  const selectedOption = switcher.options[switcher.selectedIndex];
  const currentCode = selectedOption?.dataset.locale || 'pt-br';
  const preferred = localStorage.getItem(storageKey) || detectLocale();
  const preferredOption = [...switcher.options].find((option) => option.dataset.locale === preferred);
  if (currentCode === 'pt-br' && preferred !== 'pt-br' && preferredOption) {
    localStorage.setItem(storageKey, preferred);
    window.location.replace(new URL(preferredOption.value, window.location.href).href);
    return;
  }
  localStorage.setItem(storageKey, currentCode);
  switcher.addEventListener('change', () => {
    const option = switcher.options[switcher.selectedIndex];
    const code = option?.dataset.locale;
    if (code) localStorage.setItem(storageKey, code);
    window.location.href = new URL(switcher.value, window.location.href).href;
  });
})();
