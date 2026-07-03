/* ═══════════════════════════════════════════════════════════
   TRAJECTUS MAGNA — COUNTDOWN (v2)
   Matemática pura + montaje declarativo. Agnóstico a la fecha:
   el objetivo llega por data-tm-deadline (ISO 8601 con zona).

   Uso:
     <div data-tm-countdown data-tm-deadline="…" data-tm-flip>
       <span data-tm-unit="days">00</span> …
     </div>
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var DAY = 86400000;
  var HOUR = 3600000;
  var MINUTE = 60000;
  var SECOND = 1000;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /** Descompone un diff en ms; clampa a 00 al vencer (done: true). */
  function breakdown(diffMs) {
    if (diffMs <= 0) {
      return { days: '00', hours: '00', minutes: '00', seconds: '00', done: true };
    }
    return {
      days: pad(Math.floor(diffMs / DAY)),
      hours: pad(Math.floor((diffMs % DAY) / HOUR)),
      minutes: pad(Math.floor((diffMs % HOUR) / MINUTE)),
      seconds: pad(Math.floor((diffMs % MINUTE) / SECOND)),
      done: false,
    };
  }

  /** Milisegundos restantes hasta una fecha ISO, respecto a nowMs. */
  function remaining(targetIso, nowMs) {
    var now = typeof nowMs === 'number' ? nowMs : Date.now();
    return new Date(targetIso).getTime() - now;
  }

  function flip(el) {
    el.classList.remove('tm-flipping');
    void el.offsetWidth; /* fuerza reflow para reiniciar la animación */
    el.classList.add('tm-flipping');
  }

  function mount(root) {
    var deadline = root.getAttribute('data-tm-deadline');
    if (!deadline) return;

    var useFlip = root.hasAttribute('data-tm-flip');
    var units = {};
    root.querySelectorAll('[data-tm-unit]').forEach(function (el) {
      units[el.getAttribute('data-tm-unit')] = el;
    });

    function tick() {
      var state = breakdown(remaining(deadline));
      ['days', 'hours', 'minutes', 'seconds'].forEach(function (key) {
        var el = units[key];
        if (!el || el.textContent === state[key]) return;
        if (useFlip) flip(el);
        el.textContent = state[key];
      });
      if (state.done) clearInterval(timer);
    }

    var timer = setInterval(tick, 1000);
    tick();
  }

  function init(doc) {
    (doc || document).querySelectorAll('[data-tm-countdown]').forEach(mount);
  }

  var api = { pad: pad, breakdown: breakdown, remaining: remaining, mount: mount, init: init };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    var TM = (global.TM = global.TM || {});
    TM.countdown = api;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { init(); });
    } else {
      init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
