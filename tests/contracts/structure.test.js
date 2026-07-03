'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  read, exists, schema, settingIds, referencedImageAssets, CUSTOM_FILES,
} = require('../helpers');

test('todos los archivos de la capa TM existen', () => {
  for (const f of CUSTOM_FILES) {
    assert.ok(exists(f), `falta ${f}`);
  }
});

test('toda imagen referenciada via asset_url existe en assets/', () => {
  for (const img of referencedImageAssets(CUSTOM_FILES)) {
    assert.ok(exists(`assets/${img}`), `asset de imagen no encontrado: assets/${img}`);
  }
});

const SECTION_SCHEMAS = [
  'sections/countdown-hero.liquid',
  'sections/tm-home-postdrop.liquid',
  'sections/tm-collection-header.liquid',
  'sections/tm-collection-strip.liquid',
  'sections/tm-product-editorial.liquid',
];

test('cada sección custom tiene schema JSON válido con nombre y preset', () => {
  for (const f of SECTION_SCHEMAS) {
    const sch = schema(f); // lanza si el JSON es inválido
    assert.ok(sch.name, `${f}: schema sin name`);
    assert.ok(Array.isArray(sch.presets) && sch.presets.length > 0, `${f}: schema sin presets`);
  }
});

test('los settings usados en los JSON de plantillas siguen existiendo en los schemas', () => {
  const templates = ['templates/index.json', 'templates/collection.json', 'templates/product.json'];
  for (const t of templates) {
    const json = JSON.parse(read(t));
    for (const [sid, sec] of Object.entries(json.sections || {})) {
      const file = `sections/${sec.type}.liquid`;
      assert.ok(exists(file), `${t}: sección "${sid}" apunta a tipo inexistente ${sec.type}`);
      if (!sec.type.startsWith('tm-') && sec.type !== 'countdown-hero') continue;
      const ids = new Set(settingIds(schema(file)));
      for (const key of Object.keys(sec.settings || {})) {
        assert.ok(ids.has(key), `${t}: setting "${key}" de "${sid}" ya no existe en ${file}`);
      }
    }
  }
});

test('las plantillas standalone usan layout none y noindex', () => {
  for (const f of [
    'templates/page.acceso.liquid',
    'templates/page.acceso-codigo.liquid',
    'templates/page.unboxing.liquid',
  ]) {
    const txt = read(f);
    assert.match(txt, /{%\s*layout none\s*%}/, `${f}: falta layout none`);
    if (f !== 'templates/page.acceso.liquid') {
      assert.match(txt, /noindex/, `${f}: falta meta noindex`);
    }
    assert.match(txt, /content_for_header/, `${f}: falta content_for_header`);
  }
});
