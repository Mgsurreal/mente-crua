(function () {
    const page = document.querySelector('.article-template');
    const controls = document.querySelectorAll('[data-article-theme]');
    if (!page || !controls.length) return;

    const themes = ['light', 'dark', 'dense'];
    controls.forEach((button) => {
        button.addEventListener('click', () => {
            themes.forEach((theme) => page.classList.remove(`article-theme--${theme}`));
            page.classList.add(`article-theme--${button.dataset.articleTheme}`);
            controls.forEach((control) => control.setAttribute('aria-pressed', String(control === button)));
        });
    });
}());

