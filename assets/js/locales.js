(() => {
  const locales = [
    ['pt-br', 'pt-BR', 'pt-BR', 'Português (Brasil)', 'Português (Brasil)', 'ltr', null],
    ['pt-pt', 'pt-PT', 'pt-PT', 'Português (Portugal)', 'Português (Portugal)', 'ltr', 'pt-br'],
    ['en-gb', 'en-GB', 'en-GB', 'Inglês', 'English', 'ltr', 'pt-br'],
    ['es-es', 'es-ES', 'es-ES', 'Espanhol (Espanha)', 'Español (España)', 'ltr', 'pt-br'],
    ['es-latam', 'es-419', 'es-419', 'Espanhol (América Latina)', 'Español (Latinoamérica)', 'ltr', 'es-es'],
    ['fr-fr', 'fr-FR', 'fr-FR', 'Francês', 'Français', 'ltr', 'pt-br'],
    ['de-de', 'de-DE', 'de-DE', 'Alemão', 'Deutsch', 'ltr', 'pt-br'],
    ['it-it', 'it-IT', 'it-IT', 'Italiano', 'Italiano', 'ltr', 'pt-br'],
    ['ru-ru', 'ru-RU', 'ru-RU', 'Russo', 'Русский', 'ltr', 'pt-br'],
    ['ar', 'ar', 'ar', 'Árabe', 'العربية', 'rtl', 'pt-br'],
    ['ar-eg', 'ar-EG', 'ar-EG', 'Árabe (Egito)', 'العربية (مصر)', 'rtl', 'ar'],
    ['hi-in', 'hi-IN', 'hi-IN', 'Hindi', 'हिन्दी', 'ltr', 'pt-br'],
    ['ja-jp', 'ja-JP', 'ja-JP', 'Japonês', '日本語', 'ltr', 'pt-br'],
    ['ko-kr', 'ko-KR', 'ko-KR', 'Coreano', '한국어', 'ltr', 'pt-br'],
    ['zh-cn', 'zh-CN', 'zh-CN', 'Chinês simplificado', '简体中文', 'ltr', 'pt-br']
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
    'pt-BR': 'pt-br', 'pt-PT': 'pt-pt', en: 'en-gb', 'en-GB': 'en-gb',
    es: 'es-es', 'es-ES': 'es-es', 'es-419': 'es-latam', fr: 'fr-fr',
    'fr-FR': 'fr-fr', de: 'de-de', 'de-DE': 'de-de', it: 'it-it',
    'it-IT': 'it-it', ru: 'ru-ru', 'ru-RU': 'ru-ru', 'ar-EG': 'ar-eg',
    hi: 'hi-in', 'hi-IN': 'hi-in', ja: 'ja-jp', 'ja-JP': 'ja-jp',
    ko: 'ko-kr', 'ko-KR': 'ko-kr', zh: 'zh-cn', 'zh-CN': 'zh-cn'
  };
  const normalize = (code) => byCode[code] ? code : (aliases[code] || 'pt-br');

  window.MenteCruaLocales = Object.freeze({
    defaultCode: 'pt-br', storageKey: 'mente-crua-language',
    locales: Object.freeze(locales), statuses: Object.freeze(statuses),
    byCode: Object.freeze(byCode), normalize
  });
})();
