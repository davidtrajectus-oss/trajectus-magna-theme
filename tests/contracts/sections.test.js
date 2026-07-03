'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { bundle, schema, settingDefault } = require('../helpers');

/* ── countdown-hero (pre-drop) ─────────────────────────────── */

test('countdown-hero: identidad y contenido del hero', () => {
  const b = bundle('sections/countdown-hero.liquid');
  assert.match(b, /05 · VI · MMXXVI/, 'eyebrow con fecha romana');
  assert.match(b, /CLUB POLO/, 'título CLUB POLO');
  assert.match(b, /ACCESO ANTICIPADO/, 'CTA de acceso anticipado');
  assert.match(b, /TRAJECTUS MAGNA/, 'fallback de logo textual');
});

test('countdown-hero: countdown accesible con 4 unidades', () => {
  const b = bundle('sections/countdown-hero.liquid');
  assert.match(b, /role="timer"/, 'countdown con role timer');
  for (const label of ['días', 'horas', 'minutos', 'segundos']) {
    assert.ok(b.includes(label), `falta la unidad "${label}"`);
  }
});

test('countdown-hero: formulario de notificación (contact)', () => {
  const b = bundle('sections/countdown-hero.liquid');
  assert.match(b, /{%-?\s*form ['"]contact['"]/, 'usa el form contact de Shopify');
  assert.match(b, /name="contact\[email\]"[^>]*/, 'input de email');
  assert.match(b, /Notificación de lanzamiento/, 'body oculto identifica el drop');
  assert.match(b, /posted_successfully\?/, 'estado de éxito');
  assert.match(b, /Anotado — te avisamos el día del drop\./, 'mensaje de éxito');
});

test('countdown-hero: schema conserva los setting ids publicados', () => {
  const sch = schema('sections/countdown-hero.liquid');
  const ids = (sch.settings || []).map((s) => s.id);
  for (const id of ['logo', 'product_image', 'cta_link']) {
    assert.ok(ids.includes(id), `setting "${id}" desaparecido del schema`);
  }
  assert.equal(settingDefault(sch, 'cta_link'), '/', 'default de cta_link');
});

/* ── tm-home-postdrop ──────────────────────────────────────── */

test('tm-home-postdrop: colección club, 2 productos y hover de segunda imagen', () => {
  const b = bundle('sections/tm-home-postdrop.liquid');
  const sch = schema('sections/tm-home-postdrop.liquid');
  assert.equal(settingDefault(sch, 'collection_handle'), 'club', 'handle por defecto');
  assert.match(b, /limit:\s*2/, 'muestra 2 productos');
  assert.match(b, /--secondary/, 'imagen secundaria para hover');
  assert.match(b, /club-polo-navy\.jpg/, 'fallback card navy');
  assert.match(b, /polo_gris_corregido\.png/, 'fallback card off-white');
});

test('tm-home-postdrop: strip de especificaciones', () => {
  const b = bundle('sections/tm-home-postdrop.liquid');
  for (const spec of ['GRAMAJE', '280g/m²', 'COMPOSICIÓN', '100% Algodón Piqué', 'BORDADO', 'Escudo Heráldico']) {
    assert.ok(b.includes(spec), `falta la spec "${spec}"`);
  }
});

test('tm-home-postdrop: manifiesto y navegación', () => {
  const b = bundle('sections/tm-home-postdrop.liquid');
  assert.match(b, /No todo está disponible para todos\./, 'cita del manifiesto');
  assert.match(b, /\/pages\/la-firma/, 'CTA a La Firma');
  assert.match(b, /\/collections\/club/, 'enlace a la colección');
  assert.match(b, /Edición limitada\. No se repone\./, 'nota de escasez');
  assert.match(b, /IntersectionObserver/, 'reveal por IntersectionObserver');
});

/* ── secciones de colección y producto ─────────────────────── */

test('tm-collection-header y tm-collection-strip conservan su copy', () => {
  assert.match(bundle('sections/tm-collection-header.liquid'), /I — CLUB/);
  const strip = bundle('sections/tm-collection-strip.liquid');
  assert.match(strip, /no se reponen/i, 'mensaje de no reposición');
  assert.match(strip, /esta edición cierra/i);
});

test('tm-product-editorial: imagen editorial con fallback', () => {
  const b = bundle('sections/tm-product-editorial.liquid');
  const sch = schema('sections/tm-product-editorial.liquid');
  assert.ok((sch.settings || []).some((s) => s.id === 'image'), 'setting image');
  assert.match(b, /modelo_sentado_inteiror\.png/, 'asset de fallback');
});

/* ── reduced motion en todas las superficies animadas ──────── */

test('toda superficie animada respeta prefers-reduced-motion', () => {
  // Superficies renderizadas dentro del layout del tema: tm-global.css (cargado
  // por theme.liquid) cuenta como parte de su CSS disponible.
  const globalCss = bundle('assets/tm-global.css');
  for (const f of [
    'sections/countdown-hero.liquid',
    'sections/tm-home-postdrop.liquid',
    'templates/page.la-firma.liquid',
  ]) {
    assert.match(bundle(f) + globalCss, /prefers-reduced-motion/, `${f}: falta prefers-reduced-motion`);
  }
  // Páginas standalone (layout none / password): deben traerlo ellas mismas.
  for (const f of [
    'templates/page.acceso-codigo.liquid',
    'templates/page.unboxing.liquid',
    'layout/password.liquid',
    'assets/tm-global.css',
  ]) {
    assert.match(bundle(f), /prefers-reduced-motion/, `${f}: falta prefers-reduced-motion`);
  }
});
