// Barcode matching evaluation for RQ3.
// Runs the app's real lookupBarcode() (app/src/utils/barcodeSearch.js) against every
// barcode in the bundled data and reports how often the top result is the exact product.
// Usage (from the project root):  node evaluation/barcode_match_eval.mjs [path/to/barcodeSearch.js]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const searchFile = process.argv[2] ?? path.join(ROOT, 'app', 'src', 'utils', 'barcodeSearch.js');
const DATA = path.join(ROOT, 'app', 'src', 'data');
const load = (name) => JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8'));

const ammpsBarcodes = load('ammps_barcodes.json');
const ammpsMedicines = load('ammps_medicines.json');
const nhsBarcodes = load('nhs_barcodes.json');
const nhsMedicines = load('nhs_medicines.json');

const source = fs.readFileSync(searchFile, 'utf8')
  .replace(/^import .*$/mg, '')
  .replace(/export function/g, 'function');
const { lookupBarcode } = new Function(
  'ammpsBarcodesData', 'ammpsMedicinesData', 'nhsBarcodesData', 'nhsMedicinesData',
  `${source};return { lookupBarcode };`
)(ammpsBarcodes, ammpsMedicines, nhsBarcodes, nhsMedicines);

const norm = (s) => String(s ?? '').toUpperCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^A-Z0-9]+/g, ' ').trim();
const fullProduct = (m) => norm([m.name, m.dosage, m.form, m.presentation].filter(Boolean).join(' '));

let total = 0, resolvable = 0, exactTop = 0;
for (const b of ammpsBarcodes) {
  if (!b.ean13 || b.ean13 === '-') continue;
  total++;
  const r = lookupBarcode(b.ean13);
  const target = norm(b.name);
  if (r.medicines.some((m) => fullProduct(m) === target)) resolvable++;
  if (r.medicines[0] && fullProduct(r.medicines[0]) === target) exactTop++;
}
console.log(`AMMPS: ${total} barcodes, ${resolvable} with an exact product entry in ammps_medicines.json`);
console.log(`AMMPS: top result is the exact product for ${exactTop}/${resolvable} (${(100 * exactTop / resolvable).toFixed(1)}%)`);

const SAMPLE = 3000; // the full NHS set (31k) is slow because lookupBarcode filters 26k medicines per call
let nTotal = 0, nName = 0, nNameMaker = 0;
for (const b of nhsBarcodes.slice(0, SAMPLE)) {
  nTotal++;
  const m = lookupBarcode(b.ean13).medicines[0];
  if (m && m.name === b.name) nName++;
  if (m && m.name === b.name && m.manufacturer === b.manufacturer) nNameMaker++;
}
console.log(`NHS (first ${nTotal}): right name and strength ${nName}/${nTotal} (${(100 * nName / nTotal).toFixed(1)}%), right manufacturer too ${nNameMaker}/${nTotal} (${(100 * nNameMaker / nTotal).toFixed(1)}%)`);
