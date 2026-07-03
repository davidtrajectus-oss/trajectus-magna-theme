/* ═══════════════════════════════════════════════════════════
   TRAJECTUS MAGNA — MOTION (v2)
   Único punto de entrada para el reveal por scroll y las
   entradas escalonadas. Respeta prefers-reduced-motion.

   Uso declarativo:
     .tm-fade-in [data-delay="n"] → reveal por IntersectionObserver
     [data-anim="n"]              → entrada escalonada al cargar
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var REDUCED = global.matchMedia
    && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Reveal por scroll con retardo escalonado via data-delay. */
  function reveal(selector, opts) {
    opts = opts || {};
    var visibleClass = opts.visibleClass || 'tm-visible';
    var step = opts.step || 100;
    var els = document.querySelectorAll(selector);
    if (!els.length) return;

    if (REDUCED || !('IntersectionObserver' in global)) {
      els.forEach(function (el) { el.classList.add(visibleClass); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var delay = parseInt(entry.target.dataset.delay || '0', 10) * step;
        setTimeout(function () { entry.target.classList.add(visibleClass); }, delay);
        io.unobserve(entry.target);
      });
    }, { threshold: opts.threshold || 0.15 });

    els.forEach(function (el) { io.observe(el); });
  }

  /** Entrada escalonada inmediata (hero pre-drop). */
  function stagger(selector, opts) {
    opts = opts || {};
    var visibleClass = opts.visibleClass || 'tm-visible';
    var els = document.querySelectorAll(selector);
    els.forEach(function (el, i) {
      if (REDUCED) {
        el.classList.add(visibleClass);
        return;
      }
      setTimeout(function () { el.classList.add(visibleClass); }, (opts.base || 80) + i * (opts.step || 180));
    });
  }

  /** Desvanecimiento del fondo del hero al hacer scroll. */
  function heroFade(heroSelector, bgSelector, maxFade) {
    var hero = document.querySelector(heroSelector);
    var bg = hero && hero.querySelector(bgSelector);
    if (!bg || REDUCED) return;

    global.addEventListener('scroll', function () {
      var scrolled = global.scrollY;
      var heroH = hero.offsetHeight;
      if (scrolled > heroH) return;
      bg.style.opacity = 1 - (scrolled / heroH) * (maxFade || 0.4);
    }, { passive: true });
  }

  function init() {
    stagger('[data-anim]');
    reveal('.tm-fade-in');
  }

  var TM = (global.TM = global.TM || {});
  TM.motion = { reveal: reveal, stagger: stagger, heroFade: heroFade, init: init };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
