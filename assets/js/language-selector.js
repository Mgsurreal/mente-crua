(() => {
    const selector = document.querySelector("#site-language");
    const hero = document.querySelector(".home-hero");
    if (!selector || !hero) return;

    const available = new Set([
        "pt-br", "pt-pt", "en-gb", "es-es", "es-latam", "fr-fr",
        "de-de", "it-it", "ru-ru", "ar", "ar-eg", "hi-in", "ja-jp",
        "ko-kr", "zh-cn"
    ]);

    const htmlLanguages = {
        "pt-br": "pt-BR", "pt-pt": "pt-PT", "en-gb": "en-GB",
        "es-es": "es-ES", "es-latam": "es-419", "fr-fr": "fr-FR",
        "de-de": "de-DE", "it-it": "it-IT", "ru-ru": "ru-RU",
        ar: "ar", "ar-eg": "ar-EG", "hi-in": "hi-IN", "ja-jp": "ja-JP",
        "ko-kr": "ko-KR", "zh-cn": "zh-CN"
    };

    const all = (query, root = document) => [...root.querySelectorAll(query)];
    const one = (query, root = document) => root.querySelector(query);
    const text = (element, value) => { if (element && value != null) element.textContent = value; };

    function readHome() {
        const recent = one(".recent-posts");
        const library = one(".library-gates");
        const thinker = one(".thinker-feature-card");
        const quote = one(".daily-quote-card");
        const newsletter = one(".mc-footer-newsletter");
        const footer = one(".mc-footer");
        const footerColumns = all(".mc-footer-column", footer);
        const support = one(".mc-footer-support", footer);
        const bottom = one(".mc-footer-bottom", footer);

        return {
            nav: all(".menu a").map(item => item.textContent.trim()),
            search: one(".siteSearchInput")?.placeholder || "",
            recent: [
                one(".section-kicker", recent)?.textContent.trim(),
                one(".section-head h2", recent)?.textContent.trim(),
                one(".section-head > p", recent)?.textContent.trim(),
                "Ler artigo →"
            ],
            library: [
                one(".section-kicker", library)?.textContent.trim(),
                one(".section-head h2", library)?.textContent.trim()
            ],
            gates: all(".gate-card", library).map(card => [
                one("h3", card)?.textContent.trim(), one("p", card)?.textContent.trim()
            ]),
            special: [
                "Categoria especial",
                ...all(".special-category-plaque", library).map(card => [
                    one("strong", card)?.textContent.trim(),
                    one(".special-category-copy > span:last-child", card)?.textContent.trim()
                ])
            ],
            thinker: [
                one(".section-kicker", thinker)?.textContent.trim(),
                one(".thinker-copy p", thinker)?.textContent.trim(),
                one(".editorial-link", thinker)?.textContent.trim(),
                one(".section-kicker", quote)?.textContent.trim()
            ],
            newsletter: [
                one("h2", newsletter)?.textContent.trim(), one("p", newsletter)?.textContent.trim(),
                one("input", newsletter)?.placeholder || "", one("button", newsletter)?.textContent.trim()
            ],
            footer: [
                one(".mc-footer-brand p", footer)?.textContent.trim(),
                one("h3", footerColumns[0])?.textContent.trim(), one("h3", footerColumns[1])?.textContent.trim(),
                one("h3", support)?.textContent.trim(), one("p", support)?.textContent.trim(),
                one(".mc-footer-button", support)?.textContent.trim(), one("small", support)?.textContent.trim(),
                one("p", bottom)?.textContent.trim(),
                all("a", bottom)[0]?.textContent.trim(), all("a", bottom)[1]?.textContent.trim(),
                one("[data-cookie-settings]", bottom)?.textContent.trim(), all("a", bottom)[2]?.textContent.trim(),
                "© 2026 Mente Crua. Todos os direitos reservados."
            ]
        };
    }

    const original = readHome();

    function applyHome(copy) {
        all(".menu a").forEach((item, index) => text(item, copy.nav[index]));
        const search = one(".siteSearchInput");
        if (search) {
            search.placeholder = copy.search;
            search.setAttribute("aria-label", copy.search);
        }

        const recent = one(".recent-posts");
        text(one(".section-kicker", recent), copy.recent[0]);
        text(one(".section-head h2", recent), copy.recent[1]);
        text(one(".section-head > p", recent), copy.recent[2]);
        all("a", recent).filter(item => /Ler artigo|Read article|Lire l.article|Artikel lesen|Leggi l.articolo|Читать статью|قراءة المقال|लेख पढ़ें|記事を読む|글 읽기|阅读文章|Leer artículo/i.test(item.textContent.trim()))
            .forEach(item => text(item, copy.recent[3]));

        const library = one(".library-gates");
        text(one(".section-kicker", library), copy.library[0]);
        text(one(".section-head h2", library), copy.library[1]);
        all(".gate-card", library).forEach((card, index) => {
            text(one("h3", card), copy.gates[index]?.[0]);
            text(one("p", card), copy.gates[index]?.[1]);
        });
        all(".special-category-plaque", library).forEach((card, index) => {
            text(one(".special-category-label", card), copy.special[0]);
            text(one("strong", card), copy.special[index + 1]?.[0]);
            text(one(".special-category-copy > span:last-child", card), copy.special[index + 1]?.[1]);
        });

        const thinker = one(".thinker-feature-card");
        const quote = one(".daily-quote-card");
        text(one(".section-kicker", thinker), copy.thinker[0]);
        text(one(".thinker-copy p", thinker), copy.thinker[1]);
        text(one(".editorial-link", thinker), copy.thinker[2]);
        text(one(".section-kicker", quote), copy.thinker[3]);

        const newsletter = one(".mc-footer-newsletter");
        text(one("h2", newsletter), copy.newsletter[0]);
        text(one("p", newsletter), copy.newsletter[1]);
        const email = one("input", newsletter);
        if (email) email.placeholder = copy.newsletter[2];
        text(one("label", newsletter), copy.newsletter[2]);
        text(one("button", newsletter), copy.newsletter[3]);

        const footer = one(".mc-footer");
        const columns = all(".mc-footer-column", footer);
        const support = one(".mc-footer-support", footer);
        const bottom = one(".mc-footer-bottom", footer);
        text(one(".mc-footer-brand p", footer), copy.footer[0]);
        text(one("h3", columns[0]), copy.footer[1]);
        text(one("h3", columns[1]), copy.footer[2]);
        const firstLinks = all("a", columns[0]);
        [copy.nav[1], copy.library[0], copy.nav[2], copy.nav[3], copy.nav[5]].forEach((value, index) => text(firstLinks[index], value));
        const secondLinks = all("a", columns[1]);
        [copy.gates[2]?.[0], copy.gates[3]?.[0], copy.gates[4]?.[0], copy.gates[6]?.[0], copy.gates[7]?.[0]].forEach((value, index) => text(secondLinks[index], value));
        text(one("h3", support), copy.footer[3]);
        text(one("p", support), copy.footer[4]);
        text(one(".mc-footer-button", support), copy.footer[5]);
        text(one("small", support), copy.footer[6]);
        text(one("p", bottom), copy.footer[7]);
        const legal = all("a", bottom);
        text(legal[0], copy.footer[8]); text(legal[1], copy.footer[9]);
        text(one("[data-cookie-settings]", bottom), copy.footer[10]); text(legal[2], copy.footer[11]);
        const copyright = one("small", bottom)?.firstChild;
        if (copyright?.nodeType === Node.TEXT_NODE) copyright.nodeValue = `\n                ${copy.footer[12]}\n                `;
    }

    function applyLanguage(language) {
        const selected = available.has(language) ? language : "pt-br";
        selector.value = selected;
        hero.style.backgroundImage = `url("assets/img/banner/home/home-${selected}.webp")`;
        document.documentElement.lang = htmlLanguages[selected] || "pt-BR";
        const isArabic = selected === "ar" || selected === "ar-eg";
        document.documentElement.dir = isArabic ? "rtl" : "ltr";
        document.body.classList.toggle("is-rtl", isArabic);
        const translated = window.MenteCruaHomeI18n?.[selected]
            || (selected === "ar-eg" ? window.MenteCruaHomeI18n?.ar : null);
        applyHome(translated || original);
        localStorage.setItem("mente-crua-language", selected);
    }

    selector.addEventListener("change", () => applyLanguage(selector.value));
    applyLanguage(localStorage.getItem("mente-crua-language") || "pt-br");
})();
