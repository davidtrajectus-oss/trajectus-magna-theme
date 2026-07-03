'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read, bundle, DROP_DATE } = require('../helpers');

test('tm-global.css: visibilidad pre/post drop', () => {
  const css = read('assets/tm-global.css');
  assert.match(css, /html\.post-drop\s+\.tm-section-drop\s*{\s*display:\s*none/, 'post-drop debe ocultar .tm-section-drop');
  assert.match(css, /html\.pre-drop\s+\.tm-home-postdrop\s*{\s*display:\s*none/, 'pre-drop debe ocultar .tm-home-postdrop');
  assert.match(css, /html\.post-drop\s+#header-group\s*{\s*display:\s*none/, 'post-drop debe ocultar #header-group');
  assert.match(css, /html\.post-drop\s+#footer-group\s*{\s*display:\s*none/, 'post-drop debe ocultar #footer-group');
});

test('tm-global.css: header y footer TM solo visibles en post-drop', () => {
  const css = read('assets/tm-global.css');
  assert.match(css, /html\.post-drop\s+\.tm-header\s*{\s*display:\s*flex/, 'header TM visible en post-drop');
  assert.match(css, /html\.post-drop\s+\.tm-footer\s*{\s*display:\s*block/, 'footer TM visible en post-drop');
});

test('theme.liquid: aplica la clase de modo drop en <html>', () => {
  const b = bundle('layout/theme.liquid');
  assert.match(b, /post-drop/, 'debe existir el mecanismo post-drop');
  assert.match(b, /documentElement\.classList\.add/, 'la clase se aplica por JS en documentElement');
});

test('theme.liquid: carga tm-global.css, header/footer TM y fuentes de marca', () => {
  const t = read('layout/theme.liquid');
  assert.match(t, /tm-global\.css/, 'falta link a tm-global.css');
  assert.match(t, /render\s+['"]tm-header['"]/, 'falta render tm-header');
  assert.match(t, /render\s+['"]tm-footer['"]/, 'falta render tm-footer');
  assert.match(t, /Cormorant\+Garamond/, 'falta Google Font Cormorant Garamond');
  assert.match(t, /DM\+Sans/, 'falta Google Font DM Sans');
});

test('theme.liquid: en la home no se renderizan header-group ni footer-group', () => {
  const t = read('layout/theme.liquid');
  const unlessBlocks = t.match(/{%\s*unless template == ['"]index['"]\s*%}/g) || [];
  assert.ok(unlessBlocks.length >= 2, 'header-group y footer-group deben ir dentro de unless template == index');
});

test('la fecha del drop es consistente en todas las superficies', () => {
  for (const f of [
    'sections/countdown-hero.liquid',
    'layout/password.liquid',
    'templates/page.acceso-codigo.liquid',
  ]) {
    assert.ok(bundle(f).includes(DROP_DATE), `${f}: no contiene la fecha del drop ${DROP_DATE}`);
  }
});
