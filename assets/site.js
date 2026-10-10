// Marvex Marine — header, language menu, scroll reveal, loop pausing and services scroll-spy.
(function () {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  function init() {
    // Sticky navbar gets a shadow once the top bar has scrolled away.
    const navbar = document.querySelector('[data-navbar]');
    if (navbar) {
      let ticking = false;
      const update = () => { navbar.classList.toggle('is-stuck', navbar.getBoundingClientRect().top <= 0 && window.scrollY > 8); ticking = false; };
      window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      update();
    }

    // Mobile menu
    const burger = document.querySelector('.burger');
    const nav = document.getElementById('site-nav');
    if (burger && nav) {
      const setOpen = (open) => {
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', burger.dataset[open ? 'labelClose' : 'labelOpen']);
        nav.classList.toggle('is-open', open);
      };
      burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
      nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); burger.focus(); } });
      document.addEventListener('click', (e) => { if (nav.classList.contains('is-open') && !e.target.closest('.navbar')) setOpen(false); });
    }

    // Language menu: close on outside click / Escape
    const lang = document.querySelector('[data-lang]');
    if (lang) {
      document.addEventListener('click', (e) => { if (lang.open && !lang.contains(e.target)) lang.open = false; });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lang.open) { lang.open = false; lang.querySelector('summary').focus(); } });
    }

    if (!hasIO) return;

    // Reveal: only elements that start below the fold are hidden, so nothing visible ever blinks.
    if (!reduce) {
      // Clip-path reveals hide the element from IntersectionObserver too, so watch a sentinel wrapper:
      // each element is observed through itself, or through its parent when it is clipped.
      const owners = new Map();
      const io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        (owners.get(en.target) || []).forEach((el) => el.setAttribute('data-rv', 'in'));
        io.unobserve(en.target);
      }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      const vh = window.innerHeight;
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        if (el.getBoundingClientRect().top < vh * 0.95) return;
        el.setAttribute('data-rv', 'pending');
        const watch = getComputedStyle(el).clipPath !== 'none' ? el.parentElement : el;
        if (!owners.has(watch)) owners.set(watch, []);
        owners.get(watch).push(el);
        io.observe(watch);
      });
      // Safety net: never leave content hidden if the observer stalls.
      setTimeout(() => document.querySelectorAll('[data-rv=pending]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.setAttribute('data-rv', 'in');
      }), 2500);
    }

    // Pause looping animations (Ken Burns, marquee, compass) while off-screen.
    const loopIO = new IntersectionObserver((entries) => entries.forEach((en) => en.target.classList.toggle('is-paused', !en.isIntersecting)));
    document.querySelectorAll('[data-loop]').forEach((el) => loopIO.observe(el));
    document.addEventListener('visibilitychange', () => document.querySelectorAll('[data-loop]').forEach((el) => {
      if (document.hidden) el.classList.add('is-paused');
    }));

    // Services page: highlight the chip of the section in view and keep it visible in the bar.
    const bar = document.querySelector('[data-spy-bar]');
    if (bar) {
      const chips = new Map([...bar.querySelectorAll('[data-spy]')].map((a) => [a.dataset.spy, a]));
      let current = null;
      const setCurrent = (id) => {
        if (id === current) return;
        current = id;
        chips.forEach((a, key) => a.setAttribute('aria-current', String(key === id)));
        const chip = chips.get(id);
        if (chip) {
          // Works in LTR and RTL: scroll by the chip's offset from the bar's centre.
          const c = chip.getBoundingClientRect(), b = bar.getBoundingClientRect();
          bar.scrollBy({ left: (c.left + c.width / 2) - (b.left + b.width / 2), behavior: reduce ? 'auto' : 'smooth' });
        }
      };
      const spy = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) setCurrent(en.target.id); }), { rootMargin: '-40% 0px -55% 0px' });
      chips.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
