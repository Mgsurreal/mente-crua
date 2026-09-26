(() => {
    const trigger = document.querySelector('.articles-description-trigger');
    const drawer = document.querySelector('.articles-description-drawer');
    const close = drawer?.querySelector('.articles-description-close');

    if (!trigger || !drawer || !close) return;

    const language = localStorage.getItem('mente-crua-language') || 'pt-br';
    const translations = {
        'pt-br': ['Sala dos Manuscritos', 'Ideias que não entregam respostas prontas.', 'Aqui, filosofia, psicologia, comportamento humano, sociedade, ciência e pensamento crítico se encontram sem pressa. Cada artigo parte de uma inquietação, atravessa diferentes perspectivas e deixa espaço para que você forme as próprias conclusões.', 'Leia. Questione. Continue pensando.', 'Conheça a seção Artigos', 'Fechar descrição de Artigos'],
        'en-gb': ['Hall of Manuscripts', 'Ideas that do not hand you ready-made answers.', 'Here, philosophy, psychology, human behaviour, society, science and critical thought meet without haste. Each article begins with a concern, crosses different perspectives and leaves room for you to form your own conclusions.', 'Read. Question. Keep thinking.', 'Discover the Articles section', 'Close the Articles description'],
        'es-es': ['Sala de los Manuscritos', 'Ideas que no entregan respuestas prefabricadas.', 'Aquí, filosofía, psicología, comportamiento humano, sociedad, ciencia y pensamiento crítico se encuentran sin prisa. Cada artículo parte de una inquietud, atraviesa distintas perspectivas y deja espacio para que formes tus propias conclusiones.', 'Lee. Cuestiona. Sigue pensando.', 'Conoce la sección Artículos', 'Cerrar la descripción de Artículos']
    };
    const copy = translations[language] || translations['pt-br'];
    drawer.querySelector('.articles-description-eyebrow').textContent = copy[0];
    drawer.querySelector('h2').textContent = copy[1];
    drawer.querySelector('p').textContent = copy[2];
    drawer.querySelector('.articles-description-signature').textContent = copy[3];
    trigger.setAttribute('aria-label', copy[4]);
    close.setAttribute('aria-label', copy[5]);

    function setOpen(open, returnFocus = false) {
        drawer.classList.toggle('is-open', open);
        trigger.classList.toggle('is-open', open);
        trigger.setAttribute('aria-expanded', String(open));
        drawer.setAttribute('aria-hidden', String(!open));

        if (open) setTimeout(() => close.focus({ preventScroll: true }), 280);
        if (!open && returnFocus) trigger.focus();
    }

    trigger.addEventListener('click', () => setOpen(!drawer.classList.contains('is-open')));
    close.addEventListener('click', () => setOpen(false, true));

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
            setOpen(false, true);
        }
    });

    document.addEventListener('click', event => {
        if (drawer.classList.contains('is-open') && !drawer.contains(event.target) && !trigger.contains(event.target)) {
            setOpen(false);
        }
    });
})();
