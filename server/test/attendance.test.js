// `npm test` di folder server. Tanpa database: validasi model dan batas hari WIB saja.
import test from 'node:test';
import assert from 'node:assert/strict';
import Attendance from '../models/Attendance.js';
import { startOfDayWIB } from '../controllers/attendanceController.js';

const valid = { nama: 'Yohanes', npm: '12345678', kelas: '3ia01', kakakKomsel: 'Maria', whatsapp: '081234567890', asalGereja: 'GBI', sumberInfo: 'teman' };
const invalidFields = (extra) => new Attendance({ ...valid, ...extra }).validate().then(() => [], (err) => Object.keys(err.errors));

test('data lengkap lolos dan dinormalisasi', async () => {
  const doc = new Attendance({ ...valid, instagram: '@Yohanes.S' });
  await doc.validate();
  assert.equal(doc.whatsapp, '6281234567890');
  assert.equal(doc.kelas, '3IA01');
  assert.equal(doc.instagram, 'yohanes.s');
  assert.match(doc.hari, /^\d{4}-\d{2}-\d{2}$/);
});

test('input salah ditolak', async () => {
  assert.deepEqual(await invalidFields({ npm: '1234567' }), ['npm']);
  assert.deepEqual(await invalidFields({ whatsapp: '81234567890' }), ['whatsapp']);
  assert.deepEqual(await invalidFields({ instagram: 'yo hanes' }), ['instagram']);
  assert.deepEqual(await invalidFields({ ulangTahun: '04-31' }), ['ulangTahun']);
  assert.deepEqual(await invalidFields({ ulangTahun: '02-29' }), []);
});

test('hari WIB dimulai pukul 17.00 UTC hari sebelumnya', () => {
  assert.equal(startOfDayWIB('2026-10-23').toISOString(), '2026-10-22T17:00:00.000Z');
});
