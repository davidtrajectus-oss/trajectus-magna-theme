'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { bundle } = require('../helpers');

/* ── tm-header ─────────────────────────────────────────────── */

test('tm-header: navegación completa', () => {
  const b = bundle('snippets/tm-header.liquid');
  assert.match(b, /\/pages\/la-firma/, 'enlace La Firma');
  assert.match(b, /\/collections\/club/, 'enlace Club');
  assert.match(b, /\/pages\/acceso-codigo/, 'enlace Acceso');
  assert.match(b, /routes\.cart_url/, 'enlace al carrito via routes');
  assert.match(b, /cart\.item_count/, 'contador de artículos del carrito');
});

test('tm-header: menú móvil accesible', () => {
  const b = bundle('snippets/tm-header.liquid');
  assert.match(b, /aria-expanded/, 'botón con aria-expanded');
  assert.match(b, /aria-controls/, 'botón con aria-controls');
  assert.match(b, /aria-hidden/, 'menú con aria-hidden');
  assert.match(b, /Escape/, 'Escape cierra el menú');
  assert.match(b, /overflow/, 'bloquea el scroll del body al abrir');
});

/* ── tm-footer ─────────────────────────────────────────────── */

test('tm-footer: contenido y enlaces', () => {
  const b = bundle('snippets/tm-footer.liquid');
  assert.match(b, /role="contentinfo"/);
  assert.match(b, /\/pages\/la-firma/);
  assert.match(b, /\/collections\/club/);
  assert.match(b, /\/pages\/acceso-anticipado/);
  assert.match(b, /mailto:info@trajectus\.es/, 'email de contacto');
  assert.match(b, /© MMXXVI Trajectus Magna/, 'copyright romano');
  for (const legal of ['Aviso Legal', 'Privacidad', 'Devoluciones']) {
    assert.ok(b.includes(legal), `falta "${legal}"`);
  }
});

/* ── password page ─────────────────────────────────────────── */

test('password: countdown + form storefront_password revelable', () => {
  const b = bundle('layout/password.liquid');
  assert.match(b, /05 · VI · MMXXVI|05 &middot; VI &middot; MMXXVI/, 'sello de fecha');
  assert.match(b, /{%-?\s*form ['"]storefront_password['"]/, 'form de contraseña de tienda');
  assert.match(b, /ACCESO ANTICIPADO/, 'toggle de acceso');
  assert.match(b, /aria-expanded/, 'toggle accesible');
  assert.match(b, /noindex/, 'página no indexable');
  // countdown: ids antiguos o data-attributes nuevos
  assert.match(b, /pw-days|data-tm-unit/, 'unidades del countdown presentes');
});
