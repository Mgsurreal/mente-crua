(() => {
  const locales = [
    ['pt-br', 'pt-BR', 'pt-BR', 'Português (Brasil)', 'Português (Brasil)', 'ltr', null],
    ['en-gb', 'en-GB', 'en-GB', 'Inglês', 'English', 'ltr', 'pt-br'],
    ['es-es', 'es-ES', 'es-ES', 'Espanhol', 'Español', 'ltr', 'pt-br']
  ].map(([code, htmlLang, hreflang, label, nativeLabel, dir, fallback]) => ({
    code, htmlLang, hreflang, label, nativeLabel, dir, fallback
  }));

  const statuses = [
    ['original', 'Original'], ['untranslated', 'Não traduzido'],
    ['editing', 'Em edição'], ['translated', 'Traduzido'],
    ['reviewed', 'Revisado'], ['published', 'Publicado'], ['error', 'Erro']
  ].map(([code, label]) => ({ code, label }));
  const byCode = Object.fromEntries(locales.map((locale) => [locale.code, locale]));
  const aliases = {
    pt: 'pt-br', 'pt-BR': 'pt-br', en: 'en-gb', 'en-GB': 'en-gb',
    es: 'es-es', 'es-ES': 'es-es'
  };
  const normalize = (code) => byCode[code] ? code : (aliases[code] || 'pt-br');

  window.MenteCruaLocales = Object.freeze({
    defaultCode: 'pt-br', storageKey: 'mente-crua-language',
    locales: Object.freeze(locales), statuses: Object.freeze(statuses),
    byCode: Object.freeze(byCode), normalize
  });
})();
