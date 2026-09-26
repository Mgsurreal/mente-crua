

/* Header — menu mobile e estado de rolagem */
(function () {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const toggle = header.querySelector('.menu-toggle');
    const menu = header.querySelector('.menu');

    function updateScrollState() {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
    }

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });

    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
        const isOpen = header.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });

    menu.addEventListener('click', function (event) {
        if (event.target.closest('a')) {
            header.classList.remove('nav-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Abrir menu');
        }
    });

    window.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            header.classList.remove('nav-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Abrir menu');
        }
    });
}());

/* Descrições editoriais expansíveis das seções */
(function () {
    const descriptionsPt = {
        '/modules/pensadores/': ['Galeria dos Pensadores', 'Ideias atravessam séculos quando ainda têm algo a nos perguntar.', 'Filósofos, cientistas, escritores e intelectuais aparecem aqui não como estátuas intocáveis, mas como vozes em diálogo. Explore suas obras, contradições e as perguntas que continuam transformando nossa maneira de compreender o mundo.', 'Encontre uma mente. Siga uma ideia.'],
        '/modules/livros/': ['Biblioteca Antiga', 'Alguns livros terminam. Outros continuam dentro de nós.', 'Esta sala reúne obras que informam, provocam e transformam. Cada leitura abre caminhos entre épocas, autores e ideias para quem aceita atravessar as páginas sem exigir respostas fáceis.', 'Abra um livro. Atravesse outro tempo.'],
        '/modules/conceitos/': ['Gabinete das Ideias', 'Dar nome a uma ideia é o primeiro passo para enxergá-la.', 'Conceitos filosóficos, psicológicos, científicos e sociais ajudam a organizar o pensamento humano. Aqui, cada termo é desmontado com contexto para revelar o que significa, de onde veio e como influencia aquilo que pensamos.', 'Defina. Relacione. Compreenda.'],
        '/modules/mitologia/': ['Templo do Conhecimento', 'Antes das teorias, contamos histórias para explicar o mundo.', 'Deuses, símbolos e narrativas de diferentes civilizações revelam como os seres humanos tentaram compreender a natureza, o destino, a morte e a si mesmos. Os mitos mudam de forma, mas suas perguntas permanecem.', 'Entre no mito. Reconheça o humano.'],
        '/modules/historia/': ['Arquivo da Humanidade', 'O passado nunca está completamente atrás de nós.', 'Civilizações, acontecimentos, personagens e documentos formam as camadas do presente. Esta seção investiga o que aconteceu, como foi interpretado e por que certas histórias continuam disputando espaço na memória.', 'Observe o passado. Releia o presente.'],
        '/modules/mitos-e-lendas/': ['Salão das Lendas', 'Entre o fato e a imaginação, uma cultura revela seus medos.', 'Criaturas, heróis, assombrações e relatos transmitidos por gerações habitam esta sala. Mais do que separar verdade e invenção, buscamos entender o que essas narrativas preservam sobre os povos que as contaram.', 'Escute a história. Procure o símbolo.'],
        '/modules/psicologia/': ['Sala da Mente', 'Nem tudo o que nos move passa primeiro pela consciência.', 'Comportamento, identidade, emoções, consciência e inconsciente se encontram nesta seção. As ideias da psicologia são apresentadas como ferramentas para investigar a mente — não como diagnósticos ou respostas universais.', 'Observe. Questione. Conheça-se.'],
        '/modules/ciencia/': ['Laboratório do Conhecimento', 'A ciência avança quando uma certeza aceita ser testada.', 'Descobertas, teorias, experiências e dúvidas mostram como construímos conhecimento sobre a realidade. Aqui, resultados importam, mas os métodos, os limites e as perguntas que os produziram importam também.', 'Teste a ideia. Siga a evidência.'],
        '/modules/arte-explica/': ['A Arte Explica', 'Ver uma obra é diferente de realmente enxergá-la.', 'Símbolos, contexto, técnica, composição e significado transformam a maneira como olhamos a arte. Esta seção convida você a atravessar a superfície das imagens e perceber as ideias, conflitos e escolhas escondidas em cada obra.', 'Olhe de novo. Há mais ali.'],
        '/modules/antes-da-disney/': ['Era uma Vez', 'Antes dos finais felizes, os contos carregavam sombras.', 'As versões antigas dos contos eram mais estranhas, violentas e ambíguas do que suas adaptações modernas. Aqui, recuperamos essas narrativas e investigamos os medos, avisos e símbolos que sobreviveram através das gerações.', 'Volte à origem. Desconfie do final.'],
        '/modules/personagens/': ['Galeria de Personagens', 'Algumas figuras são inventadas. O que revelam sobre nós, não.', 'Heróis, vilões, arquétipos e figuras históricas atravessam cultura e imaginação porque condensam conflitos profundamente humanos. Esta seção investiga quem são, o que representam e por que continuam retornando.', 'Conheça a figura. Descubra o arquétipo.'],
        '/sobre.html': ['Sobre o Projeto', 'Uma biblioteca para quem ainda desconfia das certezas.', 'O Mente Crua nasceu da curiosidade e da vontade de observar com mais calma aquilo que aceitamos depressa demais. Reunimos ideias, histórias e perguntas para oferecer contexto — nunca para decidir o que você deve pensar.', 'Sem gurus. Sem atalhos. Com contexto.'],
        '/contato.html': ['Abra uma Conversa', 'Boas perguntas também começam quando alguém escreve.', 'Sugestões, correções e críticas construtivas ajudam esta biblioteca a crescer com responsabilidade. Use este espaço para apontar um caminho, questionar um conteúdo ou conversar sobre o projeto.', 'Escreva. Toda conversa começa de algum lugar.']
    };

    const descriptionsEn = {
        '/modules/pensadores/': ['Gallery of Thinkers', 'Ideas cross centuries when they still have something to ask us.', 'Philosophers, scientists, writers and intellectuals appear here not as untouchable statues, but as voices in dialogue. Explore their works, contradictions and the questions that continue to transform how we understand the world.', 'Find a mind. Follow an idea.'],
        '/modules/livros/': ['Ancient Library', 'Some books end. Others continue within us.', 'This room brings together works that inform, provoke and transform. Each reading opens paths between eras, authors and ideas for those willing to cross the pages without demanding easy answers.', 'Open a book. Cross into another time.'],
        '/modules/conceitos/': ['Cabinet of Ideas', 'Naming an idea is the first step towards seeing it.', 'Philosophical, psychological, scientific and social concepts help organise human thought. Here, each term is unpacked with context to reveal what it means, where it came from and how it shapes what we think.', 'Define. Connect. Understand.'],
        '/modules/mitologia/': ['Temple of Knowledge', 'Before theories, we told stories to explain the world.', 'Gods, symbols and narratives from different civilisations reveal how humans tried to understand nature, destiny, death and themselves. Myths change their form, but their questions remain.', 'Enter the myth. Recognise the human.'],
        '/modules/historia/': ['Archive of Humanity', 'The past is never completely behind us.', 'Civilisations, events, figures and documents form the layers of the present. This section investigates what happened, how it was interpreted and why certain stories still compete for a place in memory.', 'Observe the past. Reread the present.'],
        '/modules/mitos-e-lendas/': ['Hall of Legends', 'Between fact and imagination, a culture reveals its fears.', 'Creatures, heroes, hauntings and tales passed down through generations inhabit this room. More than separating truth from invention, we seek what these narratives preserve about the peoples who told them.', 'Hear the story. Seek the symbol.'],
        '/modules/psicologia/': ['Room of the Mind', 'Not everything that moves us passes through consciousness first.', 'Behaviour, identity, emotion, consciousness and the unconscious meet in this section. Psychological ideas are presented as tools for investigating the mind — not as diagnoses or universal answers.', 'Observe. Question. Know yourself.'],
        '/modules/ciencia/': ['Laboratory of Knowledge', 'Science advances when a certainty agrees to be tested.', 'Discoveries, theories, experiments and doubts show how we build knowledge about reality. Results matter here, but so do the methods, limits and questions that produced them.', 'Test the idea. Follow the evidence.'],
        '/modules/arte-explica/': ['Art Explains', 'Seeing a work is different from truly looking at it.', 'Symbols, context, technique, composition and meaning transform the way we look at art. This section invites you beyond the surface to notice the ideas, conflicts and choices hidden within each work.', 'Look again. There is more.'],
        '/modules/antes-da-disney/': ['Once Upon a Time', 'Before happy endings, fairy tales carried shadows.', 'Older versions of fairy tales were stranger, more violent and more ambiguous than their modern adaptations. Here, we recover those narratives and investigate the fears, warnings and symbols that survived generations.', 'Return to the source. Question the ending.'],
        '/modules/personagens/': ['Gallery of Characters', 'Some figures are invented. What they reveal about us is not.', 'Heroes, villains, archetypes and historical figures cross culture and imagination because they condense deeply human conflicts. This section investigates who they are, what they represent and why they keep returning.', 'Meet the figure. Discover the archetype.'],
        '/sobre.html': ['About the Project', 'A library for those who still distrust certainties.', 'Mente Crua was born from curiosity and the desire to look more carefully at what we accept too quickly. We bring together ideas, stories and questions to offer context — never to decide what you should think.', 'No gurus. No shortcuts. With context.'],
        '/contato.html': ['Start a Conversation', 'Good questions also begin when someone writes.', 'Suggestions, corrections and constructive criticism help this library grow responsibly. Use this space to point out a path, question a piece of content or talk about the project.', 'Write. Every conversation starts somewhere.']
    };

    const descriptionsEs = {
        '/modules/pensadores/': ['Galería de Pensadores', 'Las ideas atraviesan siglos cuando todavía tienen algo que preguntarnos.', 'Filósofos, científicos, escritores e intelectuales aparecen aquí no como estatuas intocables, sino como voces en diálogo. Explora sus obras, contradicciones y las preguntas que siguen transformando nuestra manera de comprender el mundo.', 'Encuentra una mente. Sigue una idea.'],
        '/modules/livros/': ['Biblioteca Antigua', 'Algunos libros terminan. Otros continúan dentro de nosotros.', 'Esta sala reúne obras que informan, provocan y transforman. Cada lectura abre caminos entre épocas, autores e ideas para quien acepta atravesar sus páginas sin exigir respuestas fáciles.', 'Abre un libro. Atraviesa otro tiempo.'],
        '/modules/conceitos/': ['Gabinete de las Ideas', 'Nombrar una idea es el primer paso para verla.', 'Los conceptos filosóficos, psicológicos, científicos y sociales ayudan a organizar el pensamiento humano. Aquí, cada término se desarma con contexto para revelar qué significa, de dónde viene y cómo influye en lo que pensamos.', 'Define. Relaciona. Comprende.'],
        '/modules/mitologia/': ['Templo del Conocimiento', 'Antes de las teorías, contamos historias para explicar el mundo.', 'Dioses, símbolos y relatos de distintas civilizaciones revelan cómo los seres humanos intentaron comprender la naturaleza, el destino, la muerte y a sí mismos. Los mitos cambian de forma, pero sus preguntas permanecen.', 'Entra en el mito. Reconoce lo humano.'],
        '/modules/historia/': ['Archivo de la Humanidad', 'El pasado nunca queda completamente atrás.', 'Civilizaciones, acontecimientos, personajes y documentos forman las capas del presente. Esta sección investiga qué ocurrió, cómo fue interpretado y por qué ciertas historias siguen disputando un lugar en la memoria.', 'Observa el pasado. Relee el presente.'],
        '/modules/mitos-e-lendas/': ['Salón de las Leyendas', 'Entre el hecho y la imaginación, una cultura revela sus miedos.', 'Criaturas, héroes, apariciones y relatos transmitidos por generaciones habitan esta sala. Más que separar verdad e invención, buscamos entender qué conservan estas narraciones sobre los pueblos que las contaron.', 'Escucha la historia. Busca el símbolo.'],
        '/modules/psicologia/': ['Sala de la Mente', 'No todo lo que nos mueve pasa primero por la conciencia.', 'Comportamiento, identidad, emociones, conciencia e inconsciente se encuentran en esta sección. Las ideas de la psicología se presentan como herramientas para investigar la mente, no como diagnósticos ni respuestas universales.', 'Observa. Cuestiona. Conócete.'],
        '/modules/ciencia/': ['Laboratorio del Conocimiento', 'La ciencia avanza cuando una certeza acepta ser puesta a prueba.', 'Descubrimientos, teorías, experiencias y dudas muestran cómo construimos conocimiento sobre la realidad. Aquí importan los resultados, pero también los métodos, los límites y las preguntas que los produjeron.', 'Pon a prueba la idea. Sigue la evidencia.'],
        '/modules/arte-explica/': ['El Arte Explica', 'Ver una obra es distinto de contemplarla de verdad.', 'Símbolos, contexto, técnica, composición y significado transforman nuestra manera de mirar el arte. Esta sección te invita a atravesar la superficie y descubrir las ideas, conflictos y decisiones ocultas en cada obra.', 'Mira de nuevo. Hay algo más.'],
        '/modules/antes-da-disney/': ['Érase una Vez', 'Antes de los finales felices, los cuentos guardaban sombras.', 'Las versiones antiguas de los cuentos eran más extrañas, violentas y ambiguas que sus adaptaciones modernas. Aquí recuperamos esas narraciones e investigamos los miedos, advertencias y símbolos que sobrevivieron durante generaciones.', 'Vuelve al origen. Desconfía del final.'],
        '/modules/personagens/': ['Galería de Personajes', 'Algunas figuras son inventadas. Lo que revelan de nosotros, no.', 'Héroes, villanos, arquetipos y figuras históricas atraviesan la cultura y la imaginación porque condensan conflictos profundamente humanos. Esta sección investiga quiénes son, qué representan y por qué siguen regresando.', 'Conoce la figura. Descubre el arquetipo.'],
        '/sobre.html': ['Sobre el Proyecto', 'Una biblioteca para quienes aún desconfían de las certezas.', 'Mente Crua nació de la curiosidad y del deseo de mirar con más calma aquello que aceptamos demasiado rápido. Reunimos ideas, historias y preguntas para ofrecer contexto, nunca para decidir qué debes pensar.', 'Sin gurús. Sin atajos. Con contexto.'],
        '/contato.html': ['Abre una Conversación', 'Las buenas preguntas también empiezan cuando alguien escribe.', 'Las sugerencias, correcciones y críticas constructivas ayudan a que esta biblioteca crezca con responsabilidad. Usa este espacio para señalar un camino, cuestionar un contenido o conversar sobre el proyecto.', 'Escribe. Toda conversación empieza en algún lugar.']
    };

    const path = window.location.pathname.replace(/\/index\.html$/, '/');
    const language = localStorage.getItem('mente-crua-language') || 'pt-br';
    const descriptions = language === 'en-gb' ? descriptionsEn : (language === 'es-es' ? descriptionsEs : descriptionsPt);
    const copy = descriptions[path];
    const header = document.querySelector('.site-header');
    if (!copy || !header || header.querySelector('.section-description-trigger')) return;

    const trigger = document.createElement('button');
    const drawer = document.createElement('aside');
    trigger.className = 'section-description-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'section-description-drawer');
    const labels = language === 'en-gb' ? ['Discover the section', 'Close description'] : (language === 'es-es' ? ['Conoce la sección', 'Cerrar descripción'] : ['Conheça a seção', 'Fechar descrição']);
    trigger.setAttribute('aria-label', `${labels[0]} ${copy[0]}`);
    trigger.innerHTML = '<span aria-hidden="true"></span>';
    drawer.className = 'section-description-drawer';
    drawer.id = 'section-description-drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = `<div class="section-description-page" role="dialog" aria-modal="false" aria-labelledby="section-description-title"><button class="section-description-close" type="button" aria-label="${labels[1]}">×</button><span class="section-description-eyebrow"></span><h2 id="section-description-title"></h2><p></p><span class="section-description-signature"></span></div>`;
    drawer.querySelector('.section-description-eyebrow').textContent = copy[0];
    drawer.querySelector('h2').textContent = copy[1];
    drawer.querySelector('p').textContent = copy[2];
    drawer.querySelector('.section-description-signature').textContent = copy[3];
    header.append(trigger, drawer);

    const close = drawer.querySelector('.section-description-close');
    function setOpen(open, returnFocus) {
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
        if (event.key === 'Escape' && drawer.classList.contains('is-open')) setOpen(false, true);
    });
    document.addEventListener('click', event => {
        if (drawer.classList.contains('is-open') && !drawer.contains(event.target) && !trigger.contains(event.target)) setOpen(false, false);
    });
}());

/* Central ADM — link disponível somente no ambiente local */
(function () {
    const isLocal =
        window.location.protocol === 'file:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

    if (!isLocal || document.querySelector('[data-local-admin-link]')) return;

    const script = document.currentScript;
    const base = script && script.dataset ? (script.dataset.base || '') : '';
    const target =
        document.querySelector('.mc-footer-bottom small') ||
        document.querySelector('.institutional-footer nav');

    if (!target) return;

    const link = document.createElement('a');
    link.href = base + 'admin.surreal/';
    link.textContent = 'ADM';
    link.setAttribute('data-local-admin-link', '');
    link.setAttribute('rel', 'nofollow');
    target.appendChild(link);
}());

/* Mente Crua — interações gerais */
(function () {
    const quoteText = document.querySelector('[data-daily-quote-text]');
    const quoteAuthor = document.querySelector('[data-daily-quote-author]');

    if (!quoteText || !quoteAuthor) return;

    const script = document.currentScript;
    const base = script && script.dataset && script.dataset.base ? script.dataset.base : '';

    fetch(base + 'assets/data/frases.json')
        .then(response => response.json())
        .then(frases => {
            if (!Array.isArray(frases) || frases.length === 0) return;

            const hoje = new Date();
            const inicioDoAno = new Date(hoje.getFullYear(), 0, 0);
            const diaDoAno = Math.floor((hoje - inicioDoAno) / 86400000);
            const frase = frases[diaDoAno % frases.length];
            window.MenteCruaDailyQuote = frase;
            const selected = localStorage.getItem('mente-crua-language') || 'pt-br';
            if (selected === 'pt-br') {
                quoteText.textContent = `“${frase.texto}”`;
                quoteAuthor.textContent = `— ${frase.autor}`;
            }
            document.dispatchEvent(new CustomEvent('mente-crua-daily-quote'));
        })
        .catch(() => {
            const selected = localStorage.getItem('mente-crua-language') || 'pt-br';
            if (selected === 'pt-br') {
                quoteText.textContent = '“Quem nunca muda de ideia talvez nunca tenha pensado.”';
                quoteAuthor.textContent = '— Mente Crua';
            }
        });
}());

/* ==========================================
   PARALLAX LATERAL — MENTE CRUA
========================================== */

const mcParallaxLeft = document.querySelector(".mc-parallax-left");
const mcParallaxRight = document.querySelector(".mc-parallax-right");

if (mcParallaxLeft && mcParallaxRight) {
    window.addEventListener("scroll", () => {
const y = -(window.scrollY * 0.10);

        mcParallaxLeft.style.transform = `translateY(${y}px)`;
        mcParallaxRight.style.transform = `translateY(${y}px)`;
    });
}

/* ==========================================
   CONSENTIMENTO DE COOKIES — MENTE CRUA
========================================== */
(function () {
    const STORAGE_KEY = 'mc_cookie_consent_v1';
    const GA_ID = 'G-4HTMGLEHCF';
    const script = document.currentScript;
    const base = script && script.dataset ? (script.dataset.base || '') : '';
    let analyticsLoaded = false;

    function readConsent() {
        try {
            const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return value && value.version === 1 ? value : null;
        } catch (_) {
            return null;
        }
    }

    function loadAnalytics() {
        if (analyticsLoaded) return;
        analyticsLoaded = true;
        if (typeof window.gtag === 'function') return;
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', GA_ID, { anonymize_ip: true });

        const tag = document.createElement('script');
        tag.async = true;
        tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
        document.head.appendChild(tag);
    }

    function applyConsent(consent) {
        if (consent && consent.analytics) loadAnalytics();
        window.dispatchEvent(new CustomEvent('mc:consent-changed', { detail: consent }));
    }

    function saveConsent(preferences, analytics, marketing) {
        const consent = {
            version: 1,
            necessary: true,
            preferences: Boolean(preferences),
            analytics: Boolean(analytics),
            marketing: Boolean(marketing),
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        applyConsent(consent);
        closePanel();
    }

    function panelMarkup() {
        return `
            <div class="mc-cookie-layer" data-cookie-layer hidden>
                <section class="mc-cookie-panel" role="dialog" aria-modal="true" aria-labelledby="mc-cookie-title">
                    <p class="mc-cookie-eyebrow">Sua escolha importa</p>
                    <h2 id="mc-cookie-title">Cookies, sem respostas escondidas.</h2>
                    <p>Usamos cookies necessários para o site funcionar. Com sua permissão, também usamos dados de audiência para entender o que merece continuar crescendo. <a href="${base}cookies.html">Leia a Política de Cookies</a>.</p>

                    <div class="mc-cookie-preferences" data-cookie-preferences hidden>
                        <label class="mc-cookie-option">
                            <span><strong>Necessários</strong><small>Guardam sua escolha e mantêm recursos básicos. Sempre ativos.</small></span>
                            <input type="checkbox" checked disabled aria-label="Cookies necessários sempre ativos">
                        </label>
                        <label class="mc-cookie-option">
                            <span><strong>Preferências</strong><small>Permitem lembrar escolhas de navegação e personalizar recursos do site.</small></span>
                            <input type="checkbox" data-consent-preferences>
                        </label>
                        <label class="mc-cookie-option">
                            <span><strong>Medição de audiência</strong><small>Permite carregar o Google Analytics para gerar estatísticas de uso.</small></span>
                            <input type="checkbox" data-consent-analytics>
                        </label>
                        <label class="mc-cookie-option">
                            <span><strong>Publicidade</strong><small>Reserva sua escolha para futuros recursos publicitários, como o Google AdSense.</small></span>
                            <input type="checkbox" data-consent-marketing>
                        </label>
                    </div>

                    <div class="mc-cookie-actions">
                        <button class="mc-cookie-button mc-cookie-button--primary" type="button" data-cookie-accept>Aceitar opcionais</button>
                        <button class="mc-cookie-button" type="button" data-cookie-reject>Somente necessários</button>
                        <button class="mc-cookie-button" type="button" data-cookie-customize>Personalizar</button>
                        <button class="mc-cookie-button mc-cookie-button--primary" type="button" data-cookie-save hidden>Salvar escolhas</button>
                    </div>
                </section>
            </div>`;
    }

    function getLayer() { return document.querySelector('[data-cookie-layer]'); }

    function openPanel(customize) {
        const layer = getLayer();
        if (!layer) return;
        const consent = readConsent();
        layer.hidden = false;
        const preferences = layer.querySelector('[data-cookie-preferences]');
        const save = layer.querySelector('[data-cookie-save]');
        const customizeButton = layer.querySelector('[data-cookie-customize]');
        layer.querySelector('[data-consent-preferences]').checked = Boolean(consent && consent.preferences);
        layer.querySelector('[data-consent-analytics]').checked = Boolean(consent && consent.analytics);
        layer.querySelector('[data-consent-marketing]').checked = Boolean(consent && consent.marketing);
        preferences.hidden = !customize;
        save.hidden = !customize;
        customizeButton.hidden = Boolean(customize);
        layer.querySelector('[data-cookie-accept]').hidden = Boolean(customize);
        layer.querySelector('[data-cookie-reject]').hidden = Boolean(customize);
    }

    function closePanel() {
        const layer = getLayer();
        if (layer) layer.hidden = true;
    }

    function init() {
        document.body.insertAdjacentHTML('beforeend', panelMarkup());
        const layer = getLayer();
        layer.addEventListener('click', function (event) {
            if (event.target.closest('[data-cookie-accept]')) saveConsent(true, true, true);
            if (event.target.closest('[data-cookie-reject]')) saveConsent(false, false, false);
            if (event.target.closest('[data-cookie-customize]')) openPanel(true);
            if (event.target.closest('[data-cookie-save]')) {
                saveConsent(
                    layer.querySelector('[data-consent-preferences]').checked,
                    layer.querySelector('[data-consent-analytics]').checked,
                    layer.querySelector('[data-consent-marketing]').checked
                );
            }
        });

        document.addEventListener('click', function (event) {
            if (event.target.closest('[data-cookie-settings]')) {
                event.preventDefault();
                openPanel(true);
            }
        });

        const consent = readConsent();
        if (consent) applyConsent(consent);
        else openPanel(false);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}());
