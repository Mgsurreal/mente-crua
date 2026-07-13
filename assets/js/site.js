

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


