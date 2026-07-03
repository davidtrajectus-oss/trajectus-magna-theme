'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read, exists } = require('../helpers');

test('fundaciones v2: assets compartidos existen', () => {
  for (const f of [
    'assets/tm-tokens.css',
    'assets/tm-global.css',
    'assets/tm-motion.js',
    'assets/tm-countdown.js',
    'assets/tm-access.js',
    'assets/tm-menu.js',
  ]) {
    assert.ok(exists(f), `falta ${f}`);
  }
});

test('tokens unificados: un único sistema de diseño', () => {
  const tokens = read('assets/tm-tokens.css');
  for (const v of ['--tm-black', '--tm-crudo', '--tm-font-serif', '--tm-font-sans', '--section-padding']) {
    assert.ok(tokens.includes(v), `falta el token ${v}`);
  }
  // el token duplicado/conflictivo del sistema viejo no debe reaparecer
  assert.ok(!tokens.includes('#0a0a0f'), 'paleta unificada: sin el negro alternativo #0a0a0f');
});

test('las secciones ya no duplican la lógica de reveal inline', () => {
  for (const f of ['sections/tm-home-postdrop.liquid', 'templates/page.la-firma.liquid']) {
    const txt = read(f);
    assert.ok(
      !txt.includes('new IntersectionObserver'),
      `${f}: el IntersectionObserver debe vivir en tm-motion.js, no inline`,
    );
    assert.match(txt, /tm-motion\.js/, `${f}: debe cargar tm-motion.js`);
  }
});

test('la fecha del drop ya no está hardcodeada en la lógica JS', () => {
  const countdown = read('assets/tm-countdown.js');
  const access = read('assets/tm-access.js');
  assert.ok(!countdown.includes('2026'), 'tm-countdown.js es agnóstico a la fecha');
  assert.ok(!access.includes('2026'), 'tm-access.js es agnóstico a la fecha y códigos');
});

test('el modo drop se calcula por fecha con override de desarrollo', () => {
  const t = read('layout/theme.liquid');
  const { DROP_DATE } = require('../helpers');
  assert.ok(t.includes(DROP_DATE), 'theme.liquid usa la fecha canónica del drop');
  assert.match(t, /tm_mode/, 'override ?tm_mode=pre|post disponible');
  assert.match(t, /pre-drop|'pre'/, 'puede resolver a pre-drop');
  assert.ok(
    !/DEV PREVIEW — post-drop forzado/.test(t),
    'el post-drop ya no está forzado incondicionalmente',
  );
});

test('imágenes responsive en las secciones reconstruidas', () => {
  for (const f of ['sections/tm-home-postdrop.liquid', 'sections/tm-product-editorial.liquid', 'sections/countdown-hero.liquid']) {
    assert.match(read(f), /srcset/, `${f}: faltan srcset en imágenes`);
  }
});

test('menú móvil con focus trap', () => {
  const menu = read('assets/tm-menu.js');
  assert.match(menu, /focus/, 'gestiona el foco');
  assert.match(menu, /Tab/, 'atrapa Tab dentro del menú');
  assert.match(menu, /Escape/, 'Escape cierra');
});
