'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { bundle, VIP_CODES } = require('../helpers');

/* ── page.acceso-codigo ────────────────────────────────────── */

test('acceso-codigo: los 20 códigos VIP y el código público', () => {
  const b = bundle('templates/page.acceso-codigo.liquid');
  for (const code of VIP_CODES) {
    assert.ok(b.includes(code), `falta el código VIP ${code}`);
  }
  assert.match(b, /TM2026/, 'código público TM2026');
});

test('acceso-codigo: cookies de acceso y redirección', () => {
  const b = bundle('templates/page.acceso-codigo.liquid');
  assert.match(b, /tm_vip/, 'cookie tm_vip');
  assert.match(b, /tm_access/, 'cookie tm_access');
  assert.match(b, /SameSite=Lax/, 'cookies SameSite=Lax');
  assert.match(b, /\/collections\/club/, 'redirección a la colección');
  assert.match(b, /30/, 'caducidad 30 días');
});

test('acceso-codigo: mensajes de estado', () => {
  const b = bundle('templates/page.acceso-codigo.liquid');
  assert.match(b, /Acceso VIP confirmado\./);
  assert.match(b, /Acceso confirmado\./);
  assert.match(b, /Disponible el 05\.06\.2026 a las 18:00h\./, 'mensaje pre-drop');
  assert.match(b, /C(ó|o)digo no reconocido\./, 'mensaje de error');
  assert.match(b, /BIENVENIDO/, 'bienvenida VIP');
  assert.match(b, /ACCESO RESTRINGIDO/);
  assert.match(b, /role="status"|aria-live/, 'estado anunciado de forma accesible');
  assert.match(b, /\/pages\/acceso-anticipado/, 'enlace a solicitar acceso');
});

/* ── page.acceso ───────────────────────────────────────────── */

test('acceso: formulario de solicitud', () => {
  const b = bundle('templates/page.acceso.liquid');
  assert.match(b, /{%-?\s*form ['"]contact['"]/, 'form contact');
  assert.match(b, /SOLICITAR ACCESO/);
  assert.match(b, /Solicitud de acceso anticipado/, 'body oculto identificable');
  assert.match(b, /Solicitud recibida\./, 'mensaje de éxito');
  assert.match(b, /Acceso sujeto a disponibilidad\./, 'disclaimer');
  assert.match(b, /name="contact\[email\]"/, 'campo email');
});

/* ── page.la-firma ─────────────────────────────────────────── */

test('la-firma: manifiesto y 5 pilares', () => {
  const b = bundle('templates/page.la-firma.liquid');
  assert.match(b, /LA FIRMA/);
  assert.match(b, /Por qué existimos\./);
  assert.match(b, /El que entienda, entiende\./);
  const pilares = [
    'CALIDAD SIN CONCESIONES',
    'ESCASEZ CONTROLADA',
    'DISCIPLINA DE PRECIO',
    'SILENCIO ESTRATÉGICO',
    'COHERENCIA ABSOLUTA',
  ];
  pilares.forEach((titulo, i) => {
    assert.ok(b.includes(titulo), `falta el pilar "${titulo}"`);
    assert.ok(b.includes(`0${i + 1}`), `falta la numeración 0${i + 1}`);
  });
});

/* ── page.unboxing ─────────────────────────────────────────── */

test('unboxing: dos fases, código regalo y copiado', () => {
  const b = bundle('templates/page.unboxing.liquid');
  assert.match(b, /Gracias\./, 'fase 1: agradecimiento');
  assert.match(b, /Tu pieza está en camino\./);
  assert.match(b, /CONTINUAR/, 'transición a fase 2');
  assert.match(b, /MAGNA02/, 'código del próximo drop');
  assert.match(b, /COPIAR CÓDIGO/, 'botón de copiar');
  assert.match(b, /navigator\.clipboard/, 'clipboard API');
  assert.match(b, /execCommand\(['"]copy['"]\)/, 'fallback de copiado');
  assert.match(b, /Lavado a 30 grados/, 'instrucciones de cuidado');
  assert.match(b, /noindex, nofollow/, 'no indexable');
});
