/* ═══════════════════════════════════════════════════════════
   TRAJECTUS MAGNA — CONTROL DE ACCESO (v2)
   Clasificación pura de códigos + cookies + montaje declarativo.
   Agnóstico a fechas y códigos: la configuración llega en un
   <script type="application/json" data-tm-access-config> con
   { vipCodes, publicCode, dropDate, redirect, cookieDays, messages }.
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /** Clasifica un código: 'vip' | 'public' | 'early' | 'invalid'. */
  function classify(rawCode, cfg) {
    var code = String(rawCode == null ? '' : rawCode).trim().toUpperCase();
    if (!code) return { status: 'invalid', code: code };
    if ((cfg.vipCodes || []).indexOf(code) !== -1) return { status: 'vip', code: code };
    if (code === String(cfg.publicCode || '').toUpperCase()) {
      var now = cfg.now ? new Date(cfg.now).getTime() : Date.now();
      var drop = new Date(cfg.dropDate).getTime();
      return { status: now >= drop ? 'public' : 'early', code: code };
    }
    return { status: 'invalid', code: code };
  }

  /** Cookie de sesión de acceso: 30 días por defecto, path=/, SameSite=Lax. */
  function cookieString(name, value, days, nowMs) {
    var now = typeof nowMs === 'number' ? nowMs : Date.now();
    var expires = new Date(now + days * 864e5).toUTCString();
    return name + '=' + value + ';expires=' + expires + ';path=/;SameSite=Lax';
  }

  /** Qué cookies otorga cada resultado. */
  function grantedCookies(status) {
    if (status === 'vip') return ['tm_vip', 'tm_access'];
    if (status === 'public') return ['tm_access'];
    return [];
  }

  function grant(status, days, doc) {
    grantedCookies(status).forEach(function (name) {
      (doc || document).cookie = cookieString(name, 'granted', days);
    });
  }

  function mount(doc) {
    doc = doc || document;
    var cfgEl = doc.querySelector('[data-tm-access-config]');
    var input = doc.querySelector('[data-tm-access-input]');
    var btn = doc.querySelector('[data-tm-access-btn]');
    var status = doc.querySelector('[data-tm-access-status]');
    var wrap = doc.querySelector('[data-tm-access-wrap]');
    if (!cfgEl || !input || !btn || !status) return;

    var cfg = JSON.parse(cfgEl.textContent);
    var msg = cfg.messages || {};
    var days = cfg.cookieDays || 30;

    function shake() {
      input.classList.remove('tm-sa-shake');
      void input.offsetWidth;
      input.classList.add('tm-sa-shake');
    }

    function verify() {
      var result = classify(input.value, cfg);

      if (result.status === 'vip' || result.status === 'public') {
        grant(result.status, days, doc);
        if (wrap) wrap.classList.add('tm-sa-fading');
        status.className = 'tm-sa-status tm-sa-status--' + result.status;
        status.textContent = result.status === 'vip' ? msg.vip : msg.public;
        if (result.status === 'vip' && msg.welcome) {
          setTimeout(function () {
            var w = doc.createElement('span');
            w.className = 'tm-sa-welcome';
            w.textContent = msg.welcome;
            status.parentNode.insertBefore(w, status.nextSibling);
            void w.offsetWidth;
            w.classList.add('tm-sa-welcome--visible');
          }, 800);
        }
        setTimeout(function () { global.location.href = cfg.redirect; }, 1500);
        return;
      }

      if (result.status === 'early') {
        status.className = 'tm-sa-status tm-sa-status--early';
        status.textContent = msg.early;
        return;
      }

      status.className = 'tm-sa-status tm-sa-status--err';
      status.textContent = msg.invalid;
      shake();
      setTimeout(function () {
        input.value = '';
        status.textContent = '';
        input.classList.remove('tm-sa-shake');
      }, 2000);
    }

    btn.addEventListener('click', verify);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') verify();
    });
  }

  var api = {
    classify: classify,
    cookieString: cookieString,
    grantedCookies: grantedCookies,
    grant: grant,
    mount: mount,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    var TM = (global.TM = global.TM || {});
    TM.access = api;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { mount(); });
    } else {
      mount();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
