'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

/**
 * Feature bundle: the file itself plus every local JS/CSS asset it references
 * via `'name.ext' | asset_url`. Makes contract tests agnostic to whether the
 * behaviour lives inline (old version) or in extracted assets (new version).
 */
function bundle(rel) {
  const seen = new Set();
  let out = '';
  (function add(r) {
    if (seen.has(r) || !exists(r)) return;
    seen.add(r);
    const txt = read(r);
    out += `\n/* ═══ ${r} ═══ */\n${txt}`;
    for (const m of txt.matchAll(/["']([\w.-]+\.(?:js|css))["']\s*\|\s*asset_url/g)) {
      add(`assets/${m[1]}`);
    }
  })(rel);
  return out;
}

function schema(rel) {
  const m = read(rel).match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
  if (!m) throw new Error(`no {% schema %} in ${rel}`);
  return JSON.parse(m[1]);
}

function settingIds(sch) {
  return (sch.settings || []).map((s) => s.id).filter(Boolean);
}

function settingDefault(sch, id) {
  const s = (sch.settings || []).find((x) => x.id === id);
  return s ? s.default : undefined;
}

/** All image assets referenced via asset_url across the custom layer. */
function referencedImageAssets(files) {
  const refs = new Set();
  for (const f of files) {
    if (!exists(f)) continue;
    for (const m of read(f).matchAll(/["']([\w.-]+\.(?:png|jpe?g|webp|svg|gif))["']\s*\|\s*asset_url/g)) {
      refs.add(m[1]);
    }
  }
  return [...refs];
}

const CUSTOM_FILES = [
  'sections/countdown-hero.liquid',
  'sections/tm-home-postdrop.liquid',
  'sections/tm-collection-header.liquid',
  'sections/tm-collection-strip.liquid',
  'sections/tm-product-editorial.liquid',
  'snippets/tm-header.liquid',
  'snippets/tm-footer.liquid',
  'templates/page.acceso.liquid',
  'templates/page.acceso-codigo.liquid',
  'templates/page.la-firma.liquid',
  'templates/page.unboxing.liquid',
  'layout/theme.liquid',
  'layout/password.liquid',
  'assets/tm-global.css',
];

const DROP_DATE = '2026-06-05T18:00:00+02:00';

const VIP_CODES = [
  'DV-001', 'MR-002', 'JL-003', 'AB-004', 'SK-005', 'RG-006', 'TN-007',
  'PL-008', 'CM-009', 'FH-010', 'YB-011', 'ZQ-012', 'WX-013', 'NE-014',
  'KT-015', 'UV-016', 'IA-017', 'BJ-018', 'OC-019', 'SP-020',
];

module.exports = {
  ROOT, read, exists, bundle, schema, settingIds, settingDefault,
  referencedImageAssets, CUSTOM_FILES, DROP_DATE, VIP_CODES,
};
