'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const access = require(path.resolve(__dirname, '../../assets/tm-access.js'));
const { VIP_CODES, DROP_DATE } = require('../helpers');

const CFG = {
  vipCodes: VIP_CODES,
  publicCode: 'TM2026',
  dropDate: DROP_DATE,
};

const BEFORE_DROP = '2026-06-01T12:00:00+02:00';
const AFTER_DROP = '2026-06-05T18:00:01+02:00';

test('clasifica códigos VIP en cualquier momento', () => {
  for (const code of VIP_CODES) {
    assert.equal(access.classify(code, { ...CFG, now: BEFORE_DROP }).status, 'vip');
    assert.equal(access.classify(code, { ...CFG, now: AFTER_DROP }).status, 'vip');
  }
});

test('código público: early antes del drop, public después', () => {
  assert.equal(access.classify('TM2026', { ...CFG, now: BEFORE_DROP }).status, 'early');
  assert.equal(access.classify('TM2026', { ...CFG, now: AFTER_DROP }).status, 'public');
  // exactamente en la hora del drop ya es válido (spec antigua: >=)
  assert.equal(access.classify('TM2026', { ...CFG, now: DROP_DATE }).status, 'public');
});

test('normaliza entrada: mayúsculas y espacios (spec antigua: trim + toUpperCase)', () => {
  assert.equal(access.classify('  dv-001 ', { ...CFG, now: BEFORE_DROP }).status, 'vip');
  assert.equal(access.classify('tm2026', { ...CFG, now: AFTER_DROP }).status, 'public');
});

test('códigos desconocidos o vacíos → invalid', () => {
  for (const bad of ['XX-999', 'TM2025', '', '   ', null, undefined]) {
    assert.equal(access.classify(bad, { ...CFG, now: AFTER_DROP }).status, 'invalid');
  }
});

test('cookieString: nombre, caducidad 30 días, path y SameSite (spec antigua)', () => {
  const now = new Date('2026-06-05T18:00:00Z').getTime();
  const c = access.cookieString('tm_vip', 'granted', 30, now);
  assert.match(c, /^tm_vip=granted;/);
  assert.match(c, /path=\//);
  assert.match(c, /SameSite=Lax/);
  const expires = new Date(c.match(/expires=([^;]+)/)[1]).getTime();
  assert.equal(expires, now + 30 * 864e5, 'caduca exactamente en 30 días');
});

test('grantedCookies: vip otorga tm_vip + tm_access, public solo tm_access', () => {
  assert.deepEqual(access.grantedCookies('vip'), ['tm_vip', 'tm_access']);
  assert.deepEqual(access.grantedCookies('public'), ['tm_access']);
  assert.deepEqual(access.grantedCookies('early'), []);
  assert.deepEqual(access.grantedCookies('invalid'), []);
});
