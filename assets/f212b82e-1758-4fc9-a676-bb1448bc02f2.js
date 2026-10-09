(function () {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.7,.2,1)';
  let io, ioAlive = false;
  const show = (el) => { el.style.opacity = ''; el.style.transform = ''; };
  const showAll = () => document.querySelectorAll('[data-rv-hidden]').forEach((el) => { el.removeAttribute('data-rv-hidden'); show(el); });
  window.addEventListener('beforeprint', showAll);

  function setup() {
    if (!io && 'IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        ioAlive = true;
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          el.removeAttribute('data-rv-hidden');
          show(el);
          io.unobserve(el);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    }
    const vh = window.innerHeight || 800;
    document.querySelectorAll('[data-reveal]:not([data-rv])').forEach((el) => {
      el.setAttribute('data-rv', '1');
      if (reduce || !io) return;
      const d = +(el.getAttribute('data-reveal-delay') || 0);
      const r = el.getBoundingClientRect();
      if (r.top < vh * 1.1) {
        el.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
          { duration: 900, delay: 80 + d, easing: EASE });
      } else {
        el.style.transition = 'opacity .8s ' + EASE + ' ' + d + 'ms, transform .8s ' + EASE + ' ' + d + 'ms';
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.setAttribute('data-rv-hidden', '1');
        io.observe(el);
      }
    });
    setTimeout(() => { if (!ioAlive) showAll(); }, 1500);
    if (reduce) return;
    const loop = (sel, flag, kf, opts) => document.querySelectorAll(sel + ':not([' + flag + '])').forEach((el) => { el.setAttribute(flag, '1'); el.animate(kf, opts); });
    loop('[data-kenburns]', 'data-kb', [{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }], { duration: 22000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    loop('[data-marquee]', 'data-mq', [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 45000, iterations: Infinity, easing: 'linear' });
    loop('[data-compass]', 'data-cp', [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 120000, iterations: Infinity, easing: 'linear' });
  }
  const run = () => requestAnimationFrame(() => requestAnimationFrame(setup));
  window.marvexMotion = function () { setTimeout(run, 150); setTimeout(run, 900); };
})();
