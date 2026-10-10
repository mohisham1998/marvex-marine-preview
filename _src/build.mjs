// Static site generator for marvex-marine.com.
// Usage: node _src/build.mjs   (run from anywhere; writes into the repo root)
// Edit copy in _src/i18n/*.mjs, markup here, styles in assets/site.css, behaviour in assets/site.js.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import en from './i18n/en.mjs';
import ar from './i18n/ar.mjs';
import ru from './i18n/ru.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOMAIN = 'https://marvex-marine.com';
const LANGS = [en, ar, ru];
const PHONE = { href: 'tel:+20663204265', text: '+20 66 320 4265', intl: '+20-66-320-4265' };
const WHATSAPP = { href: 'https://wa.me/201159008081', text: '+20 115 9008081' };
const EMAIL = 'info@marvex-marine.com';
const MAPS = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Al Salam Complex, El Sharq District, Port Said, Egypt');
const IMG = JSON.parse(fs.readFileSync(path.join(ROOT, '_src/imgmeta.json'), 'utf8'));
const TODAY = new Date().toISOString().slice(0, 10);

// Page keys in nav order -> English path (other languages are prefixed).
const PAGES = { home: '/', services: '/services', area: '/service-area', about: '/about', contact: '/contact' };
const NAV_ICONS = { home: 'home', services: 'directions_boat', area: 'map', about: 'info', contact: 'call' };
const FILES = { home: 'index.html', services: 'services.html', area: 'service-area.html', about: 'about.html', contact: 'contact.html' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const icons = new Set();
const ms = (name, cls = '') => { icons.add(name); return `<span class="ms${cls ? ' ' + cls : ''}" aria-hidden="true">${name}</span>`; };
const arrow = () => ms('arrow_forward', 'ms--flip');
const ltr = (s) => `<bdi dir="ltr">${esc(s)}</bdi>`;
const href = (t, key) => key === 'home' ? (t.prefix ? t.prefix + '/' : '/') : t.prefix + PAGES[key];
const abs = (t, key) => DOMAIN + href(t, key);
const hash = (f) => crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, f))).digest('hex').slice(0, 10);

function pic(name, alt, { sizes = '100vw', eager = false, pos, cls = '' } = {}) {
  const m = IMG[name];
  if (!m) throw new Error('missing image meta: ' + name);
  const srcset = m.widths.map((w) => `/assets/photos/${name}${w === m.w ? '' : '-' + w}.webp ${w}w`).join(', ');
  const style = pos ? ` style="object-position:${pos}"` : '';
  return `<picture><source type="image/webp" srcset="${srcset}" sizes="${sizes}"><img src="/assets/photos/${name}.jpg" alt="${esc(alt)}" width="${m.w}" height="${m.h}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${cls ? ` class="${cls}"` : ''}${style}></picture>`;
}

// ---------- shared chrome ----------
function header(t, active) {
  const links = Object.keys(PAGES).map((k) => `<a href="${href(t, k)}"${k === active ? ' aria-current="page"' : ''}>${ms(NAV_ICONS[k])}<span>${esc(t.nav[k])}</span></a>`).join('');
  const langItems = LANGS.map((l) => `<li><a href="${href(l, active === '404' ? 'home' : active)}" hreflang="${l.lang}" lang="${l.lang}"${l === t ? ' aria-current="true"' : ''}><img src="/assets/flags/${l.flag}.svg" alt="" width="24" height="18"><span>${esc(l.name)}</span>${l === t ? ms('check', 'lang__tick') : ''}</a></li>`).join('');
  return `<a class="skip" href="#main">${esc(t.ui.skip)}</a>
<div class="topbar"><div class="wrap topbar__in">
  <span class="topbar__loc">${ms('location_on')}${esc(t.topLoc)}</span>
  <div class="topbar__contact">
    <a href="${PHONE.href}">${ms('call')}${ltr(PHONE.text)}</a>
    <!--email_off--><a href="mailto:${EMAIL}">${ms('mail')}<bdi dir="ltr">${EMAIL}</bdi></a><!--/email_off-->
  </div>
</div></div>
<header class="navbar" data-navbar><div class="wrap navbar__in">
  <a class="brand" href="${href(t, 'home')}" aria-label="${esc(t.brand)} — ${esc(t.nav.home)}"><img src="/assets/marvex-logo-header.webp" alt="${esc(t.brand)}" width="480" height="292"></a>
  <nav class="nav" id="site-nav" aria-label="${esc(t.ui.mainNav)}">${links}</nav>
  <div class="navbar__tools">
    <details class="lang" data-lang>
      <summary aria-label="${esc(t.ui.language)}: ${esc(t.name)}"><img src="/assets/flags/${t.flag}.svg" alt="" width="24" height="18"><span>${t.short}</span>${ms('expand_more', 'lang__caret')}</summary>
      <ul class="lang__menu">${langItems}</ul>
    </details>
    <button class="burger" type="button" aria-expanded="false" aria-controls="site-nav" data-label-open="${esc(t.ui.menu)}" data-label-close="${esc(t.ui.closeMenu)}" aria-label="${esc(t.ui.menu)}">${ms('menu', 'burger__open')}${ms('close', 'burger__close')}</button>
  </div>
</div></header>`;
}

function footer(t, active) {
  const svc = t.services.map((s) => `<li><a href="${href(t, 'services')}#${s.id}">${esc(s.short)}</a></li>`).join('');
  const company = ['home', 'about', 'area', 'contact'].map((k) => `<li><a href="${href(t, k)}">${esc(t.nav[k])}</a></li>`).join('');
  const langs = LANGS.map((l) => `<a href="${href(l, active === '404' ? 'home' : active)}" hreflang="${l.lang}" lang="${l.lang}"${l === t ? ' aria-current="true"' : ''}><img src="/assets/flags/${l.flag}.svg" alt="" width="20" height="15">${esc(l.name)}</a>`).join('');
  return `<footer class="footer">
  <div class="wrap footer__grid">
    <div class="footer__brand">
      <a class="footer__logo" href="${href(t, 'home')}"><img src="/assets/marvex-logo-header.webp" alt="${esc(t.brand)}" width="480" height="292" loading="lazy"></a>
      <p>${esc(t.footer.tagline)}</p>
    </div>
    <nav aria-label="${esc(t.footer.company)}"><h2 class="footer__h">${esc(t.footer.company)}</h2><ul>${company}</ul></nav>
    <nav aria-label="${esc(t.footer.services)}"><h2 class="footer__h">${esc(t.footer.services)}</h2><ul>${svc}</ul></nav>
    <div><h2 class="footer__h">${esc(t.footer.contact)}</h2>
      <ul class="footer__contact">
        <li><a href="${PHONE.href}">${ms('call')}${ltr(PHONE.text)}</a></li>
        <li><a href="${WHATSAPP.href}" target="_blank" rel="noopener">${waIcon('wa-ico')}${ltr(WHATSAPP.text)}</a></li>
        <li><!--email_off--><a href="mailto:${EMAIL}">${ms('mail')}<bdi dir="ltr">${EMAIL}</bdi></a><!--/email_off--></li>
        <li><a href="${MAPS}" target="_blank" rel="noopener" class="footer__addr">${ms('location_on')}<address>${t.footer.address.map(esc).join('<br>')}</address></a></li>
      </ul>
    </div>
  </div>
  <div class="footer__bar"><div class="wrap footer__bar-in">
    <span>${esc(t.footer.rights)}</span>
    <div class="footer__langs" aria-label="${esc(t.footer.languages)}">${langs}</div>
    <span class="footer__motto">${esc(t.footer.motto)}</span>
  </div></div>
</footer>
<a class="fab" href="${WHATSAPP.href}" target="_blank" rel="noopener" aria-label="${esc(t.ui.whatsappFab)}">${waIcon()}</a>`;
}

function waIcon(cls = '') {
  return `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41z"/></svg>`;
}

function crumbs(t, key) {
  return `<nav class="crumbs" aria-label="${esc(t.ui.breadcrumb)}"><ol><li><a href="${href(t, 'home')}">${esc(t.nav.home)}</a></li><li>${ms('chevron_right', 'ms--flip')}<span aria-current="page">${esc(t.nav[key])}</span></li></ol></nav>`;
}

function pageHero(t, key, p, img) {
  return `<section class="phero">
  <div class="phero__media" data-loop>${pic(img, p.heroAlt, { eager: true })}</div>
  <div class="phero__shade"></div>
  <div class="wrap phero__body">
    ${crumbs(t, key)}
    <h1 class="phero__title">${esc(p.h1)}</h1>
    <p class="phero__lead">${esc(p.lead)}</p>
  </div>
</section>`;
}

function contactCta(t, p) {
  return `<section class="cta">
  <div class="wrap cta__in">
    <div class="cta__copy"><h2 class="h2">${esc(p.ctaH2)}</h2><p>${esc(p.ctaP)}</p></div>
    <div class="cta__actions">
      <a class="btn btn--gold" href="${WHATSAPP.href}" target="_blank" rel="noopener">${waIcon('wa-ico')}<span>${esc(t.contactLabels.whatsapp)}</span></a>
      <a class="btn btn--ghost" href="${PHONE.href}">${ms('call')}${ltr(PHONE.text)}</a>
      <!--email_off--><a class="btn btn--ghost" href="mailto:${EMAIL}">${ms('mail')}<bdi dir="ltr">${EMAIL}</bdi></a><!--/email_off-->
    </div>
  </div>
</section>`;
}

// ---------- pages ----------
const body = {
  home(t) {
    const p = t.pages.home;
    const ports = t.ports.map((x) => `<li>${esc(x.name)}</li>`).join('');
    const marquee = t.services.map((s) => `<span>${esc(s.marquee)}</span><span class="marquee__dot" aria-hidden="true"></span>`).join('');
    const cards = t.services.map((s, i) => `<li data-reveal style="--i:${i % 3}"><a class="scard" href="${href(t, 'services')}#${s.id}">
        <div class="scard__media">${pic(s.img, s.alt, { sizes: '(min-width: 1100px) 400px, (min-width: 700px) 50vw, 100vw', pos: s.pos })}</div>
        <div class="scard__body">
          <span class="scard__icon">${ms(s.icon)}</span>
          <span class="scard__num">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="scard__title">${esc(s.title)}</h3>
          <p>${esc(s.card)}</p>
          <span class="scard__more">${esc(t.ui.learnMore)}${arrow()}</span>
        </div></a></li>`).join('\n      ');
    const reasons = p.reasons.map(([ic, h, x], i) => `<li class="tile" data-reveal style="--i:${i}">${ms(ic, 'tile__icon')}<h3>${esc(h)}</h3><p>${esc(x)}</p></li>`).join('');
    return `<section class="hero">
  <div class="hero__media" data-loop>${pic('hero-canal-hd', p.heroAlt, { eager: true })}</div>
  <div class="hero__shade"></div>
  <div class="hero__compass" aria-hidden="true" data-loop><span></span></div>
  <div class="wrap hero__body">
    <span class="hero__rule" aria-hidden="true"></span>
    <h1 class="hero__title">${esc(p.h1)}</h1>
    <p class="hero__lead">${esc(p.lead)}</p>
    <div class="hero__actions">
      <a class="btn btn--gold" href="${href(t, 'services')}">${esc(p.ctaServices)}${arrow()}</a>
      <a class="btn btn--light" href="${href(t, 'contact')}">${esc(p.ctaContact)}</a>
    </div>
    <div class="hero__ports"><span>${esc(p.portsLabel)}</span><ul>${ports}</ul></div>
  </div>
</section>
<div class="marquee" aria-hidden="true" data-loop><div class="marquee__track"><div class="marquee__set">${marquee}</div><div class="marquee__set">${marquee}</div></div></div>
<section class="section section--sand">
  <div class="wrap split">
    <div class="collage" data-reveal>
      <div class="collage__a">${pic('container-terminal', p.introImgA, { sizes: '(min-width: 1100px) 480px, 80vw' })}</div>
      <div class="collage__b">${pic('sokhna-terminal', p.introImgB, { sizes: '(min-width: 1100px) 320px, 50vw' })}</div>
      <div class="collage__badge">${ms('sailing')}<span>${esc(p.introBadge)}</span></div>
    </div>
    <div class="stack">
      <h2 class="h2">${esc(p.introH2)}</h2>
      ${p.introP.map((x) => `<p class="body-l">${esc(x)}</p>`).join('\n      ')}
      <a class="link-arrow" href="${href(t, 'about')}">${esc(p.introLink)}${arrow()}</a>
    </div>
  </div>
</section>
<section class="section section--white">
  <div class="wrap">
    <div class="section__head">
      <h2 class="h2">${esc(p.svcH2)}</h2>
      <a class="link-arrow" href="${href(t, 'services')}">${esc(p.svcLink)}${arrow()}</a>
    </div>
    <ul class="scards">
      ${cards}
    </ul>
  </div>
</section>
<section class="section section--navy">
  <div class="wrap">
    <h2 class="h2 section__solo">${esc(p.whyH2)}</h2>
    <ul class="tiles">${reasons}</ul>
  </div>
</section>
<section class="section section--sand">
  <div class="wrap split">
    <div class="stack">
      <h2 class="h2">${esc(p.areaH2)}</h2>
      <p class="body-l">${esc(p.areaP)}</p>
      <ul class="chips">${t.ports.map((x) => `<li>${ms('location_on')}${esc(x.name)}</li>`).join('')}</ul>
      <a class="link-arrow" href="${href(t, 'area')}">${esc(p.areaLink)}${arrow()}</a>
    </div>
    <div class="frame frame--tall" data-reveal><div class="frame__img" data-loop>${pic('husbandry', p.areaAlt, { sizes: '(min-width: 1100px) 600px, 100vw' })}</div></div>
  </div>
</section>
${contactCta(t, p)}`;
  },

  about(t) {
    const p = t.pages.about;
    return `${pageHero(t, 'about', p, 'port-terminal')}
<section class="section section--sand">
  <div class="wrap split">
    <div class="stack">
      <h2 class="h2">${esc(p.whoH2)}</h2>
      ${p.whoP.map((x) => `<p class="body-l">${esc(x)}</p>`).join('\n      ')}
    </div>
    <figure class="quoteframe" data-reveal>
      <div class="quoteframe__img">${pic('customs', p.whoAlt, { sizes: '(min-width: 1100px) 600px, 100vw' })}</div>
      <blockquote class="quoteframe__quote">${ms('format_quote')}<p>${esc(p.quote)}</p></blockquote>
    </figure>
  </div>
</section>
<section class="section section--white">
  <div class="wrap"><ul class="pillars">${p.pillars.map(([ic, h, x], i) => `<li data-reveal style="--i:${i}"><span class="pillars__icon">${ms(ic)}</span><h2 class="h3">${esc(h)}</h2><p>${esc(x)}</p></li>`).join('')}</ul></div>
</section>
<section class="section section--navy">
  <div class="wrap split split--top">
    <div class="stack">
      <h2 class="h2">${esc(p.clientsH2)}</h2>
      <p class="body-l body-l--on-dark">${esc(p.clientsP)}</p>
    </div>
    <ul class="clients">${p.clients.map(([ic, x], i) => `<li data-reveal style="--i:${i}">${ms(ic)}<span>${esc(x)}</span></li>`).join('')}</ul>
  </div>
</section>`;
  },

  services(t) {
    const p = t.pages.services;
    const chips = t.services.map((s) => `<a href="#${s.id}" data-spy="${s.id}">${ms(s.icon)}<span>${esc(s.short)}</span></a>`).join('');
    const arts = t.services.map((s, i) => `<article class="svc" id="${s.id}">
      <div class="svc__media" data-reveal>
        <div class="svc__img">${pic(s.img, s.alt, { sizes: '(min-width: 1100px) 600px, 100vw', pos: s.pos })}</div>
        <span class="svc__icon">${ms(s.icon)}</span>
      </div>
      <div class="svc__body">
        <span class="svc__num">${String(i + 1).padStart(2, '0')}</span>
        <h2 class="h2">${esc(s.title)}</h2>
        <p class="body-l">${esc(s.intro)}</p>
        <ul class="checks">${s.items.map((it) => `<li>${ms('check_circle')}<span>${esc(it)}</span></li>`).join('')}</ul>
        ${s.note ? `<p class="svc__note">${ms('info')}<span>${esc(s.note)}</span></p>` : ''}
      </div>
    </article>`).join('\n    ');
    return `${pageHero(t, 'services', p, 'service-area')}
<nav class="spy" aria-label="${esc(t.ui.servicesNav)}"><div class="wrap spy__in" data-spy-bar>${chips}</div></nav>
<section class="section section--sand section--svc">
  <div class="wrap svcs">
    ${arts}
    <p class="notice">${ms('gavel')}<span><strong>${esc(p.noteLabel)}</strong> ${esc(p.note)}</span></p>
  </div>
</section>
<section class="section section--navy">
  <div class="wrap">
    <h2 class="h2 section__solo">${esc(p.stepsH2)}</h2>
    <ol class="steps">${p.steps.map(([ic, h, x], i) => `<li data-reveal style="--i:${i}"><div class="steps__top"><span class="steps__icon">${ms(ic)}</span><span class="steps__num">${String(i + 1).padStart(2, '0')}</span></div><h3>${esc(h)}</h3><p>${esc(x)}</p></li>`).join('')}</ol>
  </div>
</section>`;
  },

  area(t) {
    const p = t.pages.area;
    return `${pageHero(t, 'area', p, 'service-area')}
<section class="section section--sand">
  <div class="wrap split">
    <div class="frame frame--xtall" data-reveal>
      <div class="frame__img">${pic('husbandry', p.covAlt, { sizes: '(min-width: 1100px) 600px, 100vw' })}</div>
      <span class="frame__badge">${ms('explore')}${esc(p.covBadge)}</span>
    </div>
    <div class="stack">
      <h2 class="h2">${esc(p.covH2)}</h2>
      ${p.covP.map((x) => `<p class="body-l">${esc(x)}</p>`).join('\n      ')}
      <ul class="tags">${p.covTags.map((x, i) => `<li>${ms(i ? 'anchor' : 'swap_vert')}<span>${esc(x)}</span></li>`).join('')}</ul>
    </div>
  </div>
</section>
<section class="section section--navy">
  <div class="wrap">
    <h2 class="h2 section__solo">${esc(p.portsH2)}</h2>
    <ul class="ports">${t.ports.map((x, i) => `<li data-reveal style="--i:${i}">${ms('location_on', 'ports__pin')}<h3>${esc(x.name)}</h3><p>${esc(x.text)}</p></li>`).join('')}</ul>
    <p class="body-l body-l--on-dark ports__foot">${esc(p.portsP)}</p>
  </div>
</section>
<section class="section section--white section--tight">
  <div class="wrap gallery">
    ${[['port-terminal', 0], ['hero-canal-hd', 1], ['customs', 2]].map(([img, i]) => `<div class="frame" data-reveal style="--i:${i}"><div class="frame__img">${pic(img, p.gallery[i], { sizes: '(min-width: 1100px) 400px, 100vw' })}</div></div>`).join('\n    ')}
  </div>
</section>`;
  },

  contact(t) {
    const p = t.pages.contact;
    const L = t.contactLabels;
    return `${pageHero(t, 'contact', p, 'crew')}
<section class="section section--sand">
  <div class="wrap">
    <div class="contact-intro">
      <h2 class="contact-intro__h">${esc(p.introH2)}</h2>
      <p class="body-l">${esc(p.introP)}</p>
    </div>
    <ul class="ccards">
      <li data-reveal style="--i:0"><a class="ccard ccard--navy" href="${PHONE.href}"><span class="ccard__ico">${ms('call')}</span><span class="ccard__label">${esc(L.phone)}</span><span class="ccard__value">${ltr(PHONE.text)}</span></a></li>
      <li data-reveal style="--i:1"><a class="ccard" href="${WHATSAPP.href}" target="_blank" rel="noopener"><span class="ccard__ico ccard__ico--wa">${waIcon()}</span><span class="ccard__label">${esc(L.whatsapp)}</span><span class="ccard__value">${ltr(WHATSAPP.text)}</span></a></li>
      <li data-reveal style="--i:2"><!--email_off--><a class="ccard" href="mailto:${EMAIL}"><span class="ccard__ico">${ms('mail')}</span><span class="ccard__label">${esc(L.email)}</span><span class="ccard__value ccard__value--wrap"><bdi dir="ltr">${EMAIL}</bdi></span></a><!--/email_off--></li>
      <li data-reveal style="--i:3"><a class="ccard" href="${MAPS}" target="_blank" rel="noopener"><span class="ccard__ico">${ms('location_on')}</span><span class="ccard__label">${esc(L.location)}</span><span class="ccard__value">${esc(L.city)}</span><span class="ccard__hint">${esc(L.directions)}${arrow()}</span></a></li>
    </ul>
  </div>
</section>
<section class="section section--sand section--flush-top">
  <div class="wrap split">
    <div class="stack">
      <h2 class="h2">${esc(p.detailsH2)}</h2>
      <ul class="details">${p.details.map(([ic, x], i) => `<li data-reveal style="--i:${i}"><span class="details__icon">${ms(ic)}</span><span>${esc(x)}</span></li>`).join('')}</ul>
    </div>
    <div class="frame frame--tall" data-reveal><div class="frame__img">${pic('sludge-disposal', p.detailsAlt, { sizes: '(min-width: 1100px) 600px, 100vw' })}</div></div>
  </div>
</section>`;
  },

  '404'(t) {
    const p = t.pages.notFound;
    return `<section class="nf">
  <div class="nf__media">${pic('hero-canal-hd', '', { eager: true })}</div>
  <div class="nf__shade"></div>
  <div class="wrap nf__body">
    <p class="nf__code" aria-hidden="true">404</p>
    <h1 class="phero__title">${esc(p.h1)}</h1>
    <p class="phero__lead">${esc(p.lead)}</p>
    <a class="btn btn--gold" href="${href(t, 'home')}">${esc(p.back)}${arrow()}</a>
  </div>
</section>`;
  }
};

// ---------- SEO ----------
const ORG_ID = DOMAIN + '/#organization';
function jsonLd(t, key, meta) {
  const graph = [{
    '@type': 'LocalBusiness', '@id': ORG_ID, name: 'Marvex Marine', alternateName: t.brand !== 'Marvex Marine' ? t.brand : undefined,
    url: DOMAIN + '/', logo: DOMAIN + '/assets/icons/icon-512.png', image: DOMAIN + '/assets/photos/og-marvex.jpg',
    description: t.pages.home.desc, telephone: PHONE.intl, email: EMAIL,
    address: { '@type': 'PostalAddress', streetAddress: 'Al Salam Complex, Entrance No. 2, 2nd Floor, Tarh El Bahr St. & El Geish St., El Sharq District', addressLocality: 'Port Said', addressRegion: 'Port Said Governorate', addressCountry: 'EG' },
    areaServed: [{ '@type': 'Place', name: 'Suez Canal' }, ...en.ports.map((x) => ({ '@type': 'City', name: x.name, containedInPlace: { '@type': 'Country', name: 'Egypt' } }))],
    contactPoint: [{ '@type': 'ContactPoint', telephone: PHONE.intl, email: EMAIL, contactType: 'customer service', areaServed: 'EG' }],
    sameAs: [WHATSAPP.href],
    hasOfferCatalog: { '@type': 'OfferCatalog', name: t.nav.services, itemListElement: t.services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title, url: abs(t, 'services') + '#' + s.id } })) }
  }, {
    '@type': 'WebSite', '@id': DOMAIN + '/#website', url: DOMAIN + '/', name: 'Marvex Marine', inLanguage: LANGS.map((l) => l.lang), publisher: { '@id': ORG_ID }
  }, {
    '@type': 'WebPage', '@id': meta.url + '#webpage', url: meta.url, name: meta.title, description: meta.desc, inLanguage: t.lang,
    isPartOf: { '@id': DOMAIN + '/#website' }, about: { '@id': ORG_ID }, primaryImageOfPage: DOMAIN + '/assets/photos/og-marvex.jpg',
    breadcrumb: key !== 'home' ? { '@id': meta.url + '#breadcrumb' } : undefined
  }];
  if (key !== 'home') graph.push({ '@type': 'BreadcrumbList', '@id': meta.url + '#breadcrumb', itemListElement: [
    { '@type': 'ListItem', position: 1, name: t.nav.home, item: abs(t, 'home') },
    { '@type': 'ListItem', position: 2, name: t.nav[key], item: meta.url }] });
  if (key === 'services') graph.push({ '@type': 'ItemList', name: t.pages.services.h1, itemListElement: t.services.map((s, i) => ({
    '@type': 'ListItem', position: i + 1, item: { '@type': 'Service', '@id': meta.url + '#' + s.id, name: s.title, description: s.intro, serviceType: s.short, provider: { '@id': ORG_ID }, areaServed: { '@type': 'Country', name: 'Egypt' }, url: meta.url + '#' + s.id } })) });
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

const FONTS = {
  en: 'family=Marcellus&family=Hanken+Grotesk:wght@400;500;600;700',
  ar: 'family=Cairo:wght@400;500;600;700&family=Marcellus',
  ru: 'family=Forum&family=Manrope:wght@400;500;600;700'
};
const HERO_IMG = { home: 'hero-canal-hd', about: 'port-terminal', services: 'service-area', area: 'service-area', contact: 'crew', '404': 'hero-canal-hd' };

function page(t, key) {
  const p = key === '404' ? t.pages.notFound : t.pages[key];
  const url = key === '404' ? null : abs(t, key);
  const meta = { title: p.title, desc: p.desc, url };
  const alternates = key === '404' ? '' : LANGS.map((l) => `<link rel="alternate" hreflang="${l.lang}" href="${abs(l, key)}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${abs(en, key)}">`;
  const hero = IMG[HERO_IMG[key]];
  const heroSet = hero.widths.map((w) => `/assets/photos/${HERO_IMG[key]}${w === hero.w ? '' : '-' + w}.webp ${w}w`).join(', ');
  const main = body[key](t);
  const og = DOMAIN + '/assets/photos/og-marvex.jpg';
  return `<!doctype html>
<html lang="${t.lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
${key === '404' ? '<meta name="robots" content="noindex">' : `<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
${alternates}`}
<meta name="theme-color" content="#0B1F45">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Marvex Marine">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
${url ? `<meta property="og:url" content="${url}">\n` : ''}<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(t.pages.home.heroAlt)}">
<meta property="og:locale" content="${t.ogLocale}">
${LANGS.filter((l) => l !== t).map((l) => `<meta property="og:locale:alternate" content="${l.ogLocale}">`).join('\n')}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(p.desc)}">
<meta name="twitter:image" content="${og}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="image" type="image/webp" imagesrcset="${heroSet}" imagesizes="100vw" fetchpriority="high">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${FONTS[t.lang]}&display=swap">
<link rel="stylesheet" href="__ICON_FONT__">
<link rel="stylesheet" href="/assets/site.css?v=${hash('assets/site.css')}">
<script src="/assets/site.js?v=${hash('assets/site.js')}" defer></script>
${key === '404' ? '' : `<script type="application/ld+json">${jsonLd(t, key, meta)}</script>\n`}</head>
<body class="page-${key}">
${header(t, key)}
<main id="main">
${main}
</main>
${footer(t, key)}
</body>
</html>
`;
}

// ---------- write ----------
const out = [];
for (const t of LANGS) {
  for (const key of Object.keys(PAGES)) out.push([path.join(t.prefix.slice(1), FILES[key]), page(t, key)]);
}
out.push(['404.html', page(en, '404')]);
const iconUrl = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300,0,0&icon_names=' + [...icons].sort().join(',') + '&display=block';
for (const [file, html] of out) {
  const dest = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html.replace('__ICON_FONT__', iconUrl.replace(/&/g, '&amp;')));
}

// sitemap with hreflang alternates for every language version
const urls = LANGS.flatMap((t) => Object.keys(PAGES).map((key) => `  <url>
    <loc>${abs(t, key)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${key === 'home' ? '1.0' : key === 'services' ? '0.9' : '0.7'}</priority>
${LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.lang}" href="${abs(l, key)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(en, key)}"/>
  </url>`)).join('\n');
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /_src/\n\nSitemap: ${DOMAIN}/sitemap.xml\n`);
console.log(`built ${out.length} pages, ${icons.size} icons`);
