

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

            quoteText.textContent = `“${frase.texto}”`;
            quoteAuthor.textContent = `— ${frase.autor}`;
        })
        .catch(() => {
            quoteText.textContent = '“Quem nunca muda de ideia talvez nunca tenha pensado.”';
            quoteAuthor.textContent = '— Mente Crua';
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
