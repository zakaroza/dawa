import ammpsBarcodesData from '../data/ammps_barcodes.json';
import ammpsMedicinesData from '../data/ammps_medicines.json';
import nhsBarcodesData from '../data/nhs_barcodes.json';
import nhsMedicinesData from '../data/nhs_medicines.json';

// Barcode Maps (O(1) lookup)
const ammpsBarcodeMap = new Map();
for (const entry of ammpsBarcodesData) {
  if (entry.ean13 && entry.ean13 !== '-') {
    ammpsBarcodeMap.set(entry.ean13, { ...entry, _db: 'MA' });
  }
}

const nhsBarcodeMap = new Map();
for (const entry of nhsBarcodesData) {
  if (entry.ean13) {
    nhsBarcodeMap.set(entry.ean13, { ...entry, _db: 'UK' });
  }
}

// Upper-case, strip accents and punctuation, collapse spaces: "Comprimé sécable" -> "COMPRIME SECABLE".
function normalizeForMatch(value) {
  return String(value ?? '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

// Barcode Lookup
export function lookupBarcode(ean13) {
  const barcodeEntry = ammpsBarcodeMap.get(ean13) ?? nhsBarcodeMap.get(ean13) ?? null;

  if (!barcodeEntry) {
    return { barcodeEntry: null, medicines: [], found: false, db: null };
  }

  const db = barcodeEntry._db;
  const medicinesData = db === 'UK' ? nhsMedicinesData : ammpsMedicinesData;
  const barcodeIngredient = (barcodeEntry.active_ingredient ?? '').trim().toUpperCase();
  const barcodeName = (barcodeEntry.name ?? '').trim().toUpperCase();

  // A barcode identifies one exact pack, but the medicines list has one entry per
  // strength/form/pack under the same brand name (e.g. 15 "DOLIPRANE" entries).
  // So after the brand-level score, prefer the entry whose strength, form, pack size
  // and manufacturer also match the barcode entry. An exact full-product match wins outright.
  const barcodeProduct = normalizeForMatch(barcodeEntry.name);
  const barcodeManufacturer = normalizeForMatch(barcodeEntry.manufacturer);
  const containsPhrase = (haystack, phrase) => !!phrase && ` ${haystack} `.includes(` ${phrase} `);

  const brandScoreOf = (med) => {
    const medName = (med.name ?? '').trim().toUpperCase();
    const medIngredient = (med.active_ingredient ?? '').trim().toUpperCase();
    if (!medName && !medIngredient) return 99;
    if (medName && barcodeName && medName === barcodeName) return 0;
    if (medIngredient && barcodeIngredient && medIngredient === barcodeIngredient) return 1;
    if (medName && barcodeName && barcodeName.includes(medName)) return 2;
    if (medIngredient && barcodeIngredient && barcodeIngredient.includes(medIngredient)) return 3;
    if (medName && barcodeName && medName.includes(barcodeName)) return 4;
    return 99;
  };

  const scoreOf = (med) => {
    const fullProduct = normalizeForMatch([med.name, med.dosage, med.form, med.presentation].filter(Boolean).join(' '));
    const sameManufacturer = !!barcodeManufacturer && normalizeForMatch(med.manufacturer) === barcodeManufacturer;
    if (fullProduct && fullProduct === barcodeProduct) return sameManufacturer ? -2 : -1;
    let score = brandScoreOf(med);
    if (score === 99) return 99;
    if (containsPhrase(barcodeProduct, normalizeForMatch(med.dosage))) score -= 0.4;
    if (containsPhrase(barcodeProduct, normalizeForMatch(med.form))) score -= 0.3;
    if (containsPhrase(barcodeProduct, normalizeForMatch(med.presentation))) score -= 0.2;
    if (sameManufacturer) score -= 0.5;
    return score;
  };

  const medicines = medicinesData
    .filter((med) => {
      const medName = (med.name ?? '').trim().toUpperCase();
      const medIngredient = (med.active_ingredient ?? '').trim().toUpperCase();
      if (!medName && !medIngredient) return false;
      const nameMatch = medName && barcodeName && (
        barcodeName.includes(medName) || medName.includes(barcodeName)
      );
      const ingredientMatch = medIngredient && barcodeIngredient && (
        barcodeIngredient.includes(medIngredient) || medIngredient.includes(barcodeIngredient)
      );
      return nameMatch || ingredientMatch;
    })
    .sort((a, b) => scoreOf(a) - scoreOf(b));

  return { barcodeEntry, medicines, found: true, db };
}

// Name Search (both databases, interleaved)
export function searchByName(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toUpperCase();

  const scoreOf = (med) => {
    const name = (med.name ?? '').toUpperCase();
    const ingredient = (med.active_ingredient ?? '').toUpperCase();
    if (name.startsWith(q)) return 0;
    if (name.includes(q)) return 1;
    if (ingredient.startsWith(q)) return 2;
    if (ingredient.includes(q)) return 3;
    return 99;
  };

  const ammpsResults = ammpsMedicinesData
    .filter((med) => {
      const name = (med.name ?? '').toUpperCase();
      const ingredient = (med.active_ingredient ?? '').toUpperCase();
      return name.includes(q) || ingredient.includes(q);
    })
    .map((med) => ({ ...med, _db: 'MA' }));

  const nhsResults = nhsMedicinesData
    .filter((med) => {
      const name = (med.name ?? '').toUpperCase();
      const ingredient = (med.active_ingredient ?? '').toUpperCase();
      return name.includes(q) || ingredient.includes(q);
    })
    .map((med) => ({ ...med, _db: 'UK' }));

  // Merge and sort by relevance score
  const combined = [...ammpsResults, ...nhsResults];
  combined.sort((a, b) => scoreOf(a) - scoreOf(b));

  return combined.slice(0, 20);
}
