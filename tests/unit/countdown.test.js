'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const countdown = require(path.resolve(__dirname, '../../assets/tm-countdown.js'));

test('pad: dos dígitos siempre', () => {
  assert.equal(countdown.pad(0), '00');
  assert.equal(countdown.pad(7), '07');
  assert.equal(countdown.pad(59), '59');
  assert.equal(countdown.pad(123), '123');
});

test('breakdown: descompone milisegundos en D/H/M/S con padding', () => {
  // 1 día, 1 hora, 1 minuto, 1 segundo
  const ms = 86400000 + 3600000 + 60000 + 1000;
  assert.deepEqual(countdown.breakdown(ms), {
    days: '01', hours: '01', minutes: '01', seconds: '01', done: false,
  });
});

test('breakdown: valores grandes y fronteras', () => {
  assert.deepEqual(countdown.breakdown(90 * 86400000), {
    days: '90', hours: '00', minutes: '00', seconds: '00', done: false,
  });
  assert.deepEqual(countdown.breakdown(999), {
    days: '00', hours: '00', minutes: '00', seconds: '00', done: false,
  });
});

test('breakdown: clampa a 00 cuando el objetivo ha pasado (spec antigua)', () => {
  for (const ms of [0, -1, -999999]) {
    const b = countdown.breakdown(ms);
    assert.deepEqual(
      { days: b.days, hours: b.hours, minutes: b.minutes, seconds: b.seconds },
      { days: '00', hours: '00', minutes: '00', seconds: '00' },
    );
    assert.equal(b.done, true, 'marca done al vencer');
  }
});

test('remaining: usa la fecha objetivo ISO con zona horaria', () => {
  const target = '2026-06-05T18:00:00+02:00';
  const oneHourBefore = new Date('2026-06-05T17:00:00+02:00').getTime();
  assert.equal(countdown.remaining(target, oneHourBefore), 3600000);
  const after = new Date('2026-06-05T19:00:00+02:00').getTime();
  assert.ok(countdown.remaining(target, after) < 0);
});
