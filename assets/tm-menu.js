/* ═══════════════════════════════════════════════════════════
   TRAJECTUS MAGNA — MENÚ MÓVIL (v2)
   Overlay accesible: focus trap, Escape, retorno de foco y
   bloqueo de scroll del body.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var openBtn = document.getElementById('tm-menu-open');
  var closeBtn = document.getElementById('tm-menu-close');
  var menu = document.getElementById('tm-mobile-menu');
  if (!openBtn || !menu) return;

  var FOCUSABLE = 'a[href], button:not([disabled])';
  var isOpen = false;

  function focusables() {
    return Array.prototype.slice.call(menu.querySelectorAll(FOCUSABLE));
  }

  function open() {
    isOpen = true;
    menu.style.display = 'flex';
    openBtn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      menu.classList.add('tm-mobile-menu--open');
      var first = focusables()[0];
      if (first) first.focus();
    });
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    menu.classList.remove('tm-mobile-menu--open');
    openBtn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    openBtn.focus(); /* retorno de foco al disparador */
    setTimeout(function () {
      if (!menu.classList.contains('tm-mobile-menu--open')) {
        menu.style.display = '';
      }
    }, 420);
  }

  openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      close();
      return;
    }
    /* Focus trap: Tab cicla dentro del menú mientras está abierto */
    if (e.key === 'Tab' && isOpen) {
      var els = focusables();
      if (!els.length) return;
      var first = els[0];
      var last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();
