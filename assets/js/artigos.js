(() => {
    const trigger = document.querySelector('.articles-description-trigger');
    const drawer = document.querySelector('.articles-description-drawer');
    const close = drawer?.querySelector('.articles-description-close');

    if (!trigger || !drawer || !close) return;

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
