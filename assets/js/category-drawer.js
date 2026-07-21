/**
 * MENTE CRUA — GAVETA LATERAL DE CATEGORIAS
 *
 * Exibe a gaveta nas páginas de categorias configuradas,
 * incluindo a página principal de Artigos.
 *
 * A Home permanece sem a gaveta.
 */

(() => {
    "use strict";

    const path = window.location.pathname
        .replace(/\\/g, "/")
        .toLowerCase();

    if (!path.includes("/modules/")) {
        return;
    }

    if (document.body?.dataset.categoryDrawer === "off") {
        return;
    }

    if (document.querySelector(".mc-category-drawer")) {
        return;
    }

    const allowedPages = [
        "/modules/artigos/",
        "/modules/pensadores/",
        "/modules/livros/",
        "/modules/conceitos/",
        "/modules/antes-da-disney/",
        "/modules/mitologia/",
        "/modules/historia/",
        "/modules/mitos-e-lendas/",
        "/modules/psicologia/",
        "/modules/ciencia/",
        "/modules/arte-explica/"
    ];

    const isAllowedPage = allowedPages.some((page) => {
        return path.includes(page);
    });

    if (!isAllowedPage) {
        return;
    }

    const currentScript = document.currentScript;

    const scriptUrl =
        currentScript?.src ||
        new URL(
            "assets/js/category-drawer.js",
            document.baseURI
        ).href;

    const projectRoot = new URL("../../", scriptUrl);

    const categories = [
        [
            "pensadores",
            "Pensadores",
            "pensadores.png"
        ],
        [
            "livros",
            "Livros",
            "livros.png"
        ],
        [
            "conceitos",
            "Conceitos",
            "conceitos.png"
        ],
        [
            "mitologia",
            "Mitologia",
            "mitologia.png"
        ],
        [
            "historia",
            "História",
            "historia.png"
        ],
        [
            "mitos-e-lendas",
            "Mitos e Lendas",
            "mitos-e-lendas.png"
        ],
        [
            "psicologia",
            "Psicologia",
            "psicologia.png"
        ],
        [
            "ciencia",
            "Ciência",
            "ciencia.png"
        ],
        [
            "arte-explica",
            "A Arte Explica",
            "arte-explica.png"
        ],
        [
            "antes-da-disney",
            "Era uma Vez",
            "antes-da-disney.png"
        ]
    ];

    const currentCategory = categories.find(([slug]) => {
        return path.includes(`/modules/${slug}/`);
    });

    const currentSlug = currentCategory?.[0] || "";

    const cards = categories
        .map(([slug, title, icon]) => {
            const href = new URL(
                `modules/${slug}/`,
                projectRoot
            ).href;

            const iconUrl = new URL(
                `assets/img/categorias/${icon}`,
                projectRoot
            ).href;

            const isCurrent = slug === currentSlug;

            return `
                <li class="mc-category-drawer-item">
                    <a
                        class="mc-category-drawer-card"
                        href="${href}"
                        ${isCurrent ? 'aria-current="page"' : ""}
                    >
                        <img
                            class="mc-category-drawer-icon"
                            src="${iconUrl}"
                            alt=""
                            loading="lazy"
                        >

                        <span class="mc-category-drawer-name">
                            ${title}
                        </span>
                    </a>
                </li>
            `;
        })
        .join("");

    const drawer = document.createElement("div");

    drawer.className = "mc-category-drawer";
    drawer.id = "mc-category-drawer";
    drawer.setAttribute("aria-hidden", "true");

    drawer.innerHTML = `
        <button
            class="mc-category-drawer-backdrop"
            type="button"
            aria-label="Fechar categorias"
            tabindex="-1"
        ></button>

        <aside
            class="mc-category-drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mc-category-drawer-title"
        >
            <header class="mc-category-drawer-header">
                <h2
                    class="mc-category-drawer-title"
                    id="mc-category-drawer-title"
                >
                    Explorar por categoria
                </h2>

                <button
                    class="mc-category-drawer-close"
                    type="button"
                    aria-label="Fechar categorias"
                >
                    ×
                </button>
            </header>

            <ul class="mc-category-drawer-grid">
                ${cards}
            </ul>
        </aside>
    `;

    const tab = document.createElement("button");

    tab.className = "mc-category-drawer-tab";
    tab.type = "button";

    tab.setAttribute(
        "aria-controls",
        drawer.id
    );

    tab.setAttribute(
        "aria-expanded",
        "false"
    );

    tab.setAttribute(
        "aria-label",
        "Abrir categorias"
    );

    tab.innerHTML = `
        <span
            class="mc-category-drawer-tab-ornament"
            aria-hidden="true"
        >
            ◆
        </span>

        <span class="mc-category-drawer-tab-label">
            Categorias
        </span>

        <span
            class="mc-category-drawer-tab-ornament"
            aria-hidden="true"
        >
            ◇
        </span>
    `;

    document.body.append(drawer, tab);

    const panel = drawer.querySelector(
        ".mc-category-drawer-panel"
    );

    const closeButton = drawer.querySelector(
        ".mc-category-drawer-close"
    );

    const backdrop = drawer.querySelector(
        ".mc-category-drawer-backdrop"
    );

    let lastFocused = null;

    function openDrawer() {
        lastFocused = document.activeElement;

        drawer.classList.add("is-open");

        drawer.setAttribute(
            "aria-hidden",
            "false"
        );

        tab.setAttribute(
            "aria-expanded",
            "true"
        );

        tab.setAttribute(
            "aria-label",
            "Fechar categorias"
        );

        document.body.classList.add(
            "mc-category-drawer-open"
        );

        window.setTimeout(() => {
            closeButton?.focus();
        }, 30);
    }

    function closeDrawer() {
        drawer.classList.remove("is-open");

        drawer.setAttribute(
            "aria-hidden",
            "true"
        );

        tab.setAttribute(
            "aria-expanded",
            "false"
        );

        tab.setAttribute(
            "aria-label",
            "Abrir categorias"
        );

        document.body.classList.remove(
            "mc-category-drawer-open"
        );

        if (
            lastFocused instanceof HTMLElement
        ) {
            lastFocused.focus();
        }
    }

    function toggleDrawer() {
        const isOpen =
            drawer.classList.contains("is-open");

        if (isOpen) {
            closeDrawer();
        } else {
            openDrawer();
        }
    }

    function trapFocus(event) {
        if (
            event.key !== "Tab" ||
            !drawer.classList.contains("is-open")
        ) {
            return;
        }

        const focusable = [
            ...panel.querySelectorAll(
                [
                    "a[href]",
                    "button:not([disabled])",
                    '[tabindex]:not([tabindex="-1"])'
                ].join(",")
            )
        ];

        if (!focusable.length) {
            return;
        }

        const first = focusable[0];

        const last =
            focusable[focusable.length - 1];

        if (
            event.shiftKey &&
            document.activeElement === first
        ) {
            event.preventDefault();
            last.focus();
            return;
        }

        if (
            !event.shiftKey &&
            document.activeElement === last
        ) {
            event.preventDefault();
            first.focus();
        }
    }

    tab.addEventListener(
        "click",
        toggleDrawer
    );

    closeButton.addEventListener(
        "click",
        closeDrawer
    );

    backdrop.addEventListener(
        "click",
        closeDrawer
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Escape" &&
                drawer.classList.contains("is-open")
            ) {
                closeDrawer();
            }

            trapFocus(event);
        }
    );
})();
