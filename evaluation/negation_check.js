#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const APP_PATH = path.join(ROOT, 'app', 'src', 'screens', 'ChatbotScreen.js');
// Copy of ChatbotScreen.js from before negation handling was added, kept for the before/after comparison.
const BACKUP_PATH = path.join(__dirname, 'ChatbotScreen.before-negation.js');

const CASES = [
  { text: "I don't have headaches, dizziness or chest pain", expected: false, required: true },
  { text: "My heart is fine and I don't have chest pain", expected: false, required: true },
  { text: '9lbi bikhir ma kaydrnich sdri', expected: false, required: true },
  { text: 'قلبي بخير وما عنديش وجع فصدري', expected: false, required: true },
  { text: "Je n'ai pas de douleur dans la poitrine", expected: false, required: true },
  { text: 'I have chest pain', expected: true, required: true },
  { text: "I don't have a fever but I have chest pain", expected: true, required: true },
  { text: "I can't breathe", expected: true, required: true },
  { text: 'صدري كيوجعني', expected: true, required: true },
  { text: 'I have no chest pain, pressure on my chest or breathing difficulty', expected: false },
  { text: "Je n'ai jamais eu de douleur poitrine", expected: false },
  { text: 'ma3ndich wja3 dyal sdri', expected: false },
  { text: 'ماعنديش ألم الصدر', expected: false },
  { text: 'I am without chest pain', expected: false },
  { text: "I don't have chest pain, but I have pressure on my chest", expected: true },
  { text: "I don't have chest pain. I have pressure on my chest", expected: true },
  { text: 'ma3ndich wja3 dyal sdri walakin kankhtn9', expected: true },
  { text: 'ما عنديش ألم الصدر ولكن كنختنق', expected: true },
  { text: "I can't speak", expected: true },
  { text: 'ma kanbghach ntnafs', expected: true },
  { text: "Je ne peux pas finir une phrase tellement je manque d'air", expected: true },
  { text: 'يدي اليسرى ما كاتتحركش وهضرتي تخربقات', expected: true },
  { text: 'ma9adrch nt7rk mn lwja3 dyal sdri', expected: true },
];

const KEYWORD_LIST_GAPS = [
  'manqdrch ntnfs',
  "I can't lift my right arm",
  "J'ai une douleur dans la poitrine",
];

function fail(message) {
  throw new Error(message);
}

function findInitializer(source, name) {
  const declaration = new RegExp(`\\bconst\\s+${name}\\s*=`).exec(source);
  if (!declaration) fail(`Could not extract ${name}.`);
  const start = declaration.index + declaration[0].length;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  let squareDepth = 0;
  let braceDepth = 0;
  let parenDepth = 0;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '/') {
      lineComment = true;
      index += 1;
    } else if (char === '/' && next === '*') {
      blockComment = true;
      index += 1;
    } else if (char === "'" || char === '"' || char === '`') quote = char;
    else if (char === '[') squareDepth += 1;
    else if (char === ']') squareDepth -= 1;
    else if (char === '{') braceDepth += 1;
    else if (char === '}') braceDepth -= 1;
    else if (char === '(') parenDepth += 1;
    else if (char === ')') parenDepth -= 1;
    else if (char === ';' && squareDepth === 0 && braceDepth === 0 && parenDepth === 0) {
      return source.slice(start, index).trim();
    }
  }
  fail(`Could not find the end of ${name}.`);
}

function findFunction(source, name) {
  const declaration = new RegExp(`\\bfunction\\s+${name}\\s*\\([^)]*\\)\\s*\\{`).exec(source);
  if (!declaration) fail(`Could not extract ${name}.`);
  const start = declaration.index;
  const closingLine = /^\}/m.exec(source.slice(start));
  if (!closingLine) fail(`Could not find the end of ${name}.`);
  return source.slice(start, start + closingLine.index + 1);
}

function loadAppEmergency(filePath = APP_PATH) {
  const source = fs.readFileSync(filePath, 'utf8');
  const keywords = vm.runInNewContext(`(${findInitializer(source, 'EMERGENCY_KEYWORDS')})`);
  const normalizeEmergencyText = vm.runInNewContext(`(${findFunction(source, 'normalizeEmergencyText')})`);
  const checkEmergency = vm.runInNewContext(`(${findFunction(source, 'checkEmergency')})`, {
    EMERGENCY_KEYWORDS: keywords,
    EMERGENCY_MESSAGES: { en: 'emergency', ar: 'emergency', fr: 'emergency' },
    normalizeEmergencyText,
  });

  if (keywords.length !== 175) fail(`Expected 175 emergency keywords, found ${keywords.length}.`);
  return { checkEmergency, keywords, normalizeEmergencyText };
}

function main() {
  const { checkEmergency } = loadAppEmergency();
  const original = loadAppEmergency(BACKUP_PATH).checkEmergency;
  let failed = 0;
  let requiredFailed = 0;
  for (const testCase of CASES) {
    const actual = checkEmergency(testCase.text, 'en').isEmergency;
    const passed = actual === testCase.expected;
    if (!passed) {
      failed += 1;
      if (testCase.required) requiredFailed += 1;
    }
    console.log(`${passed ? 'PASS' : 'FAIL'} expected=${testCase.expected ? 'emergency' : 'safe'} actual=${actual ? 'emergency' : 'safe'}: ${testCase.text}`);
  }
  const requiredCount = CASES.filter((testCase) => testCase.required).length;
  console.log(`\nRequired: ${requiredCount - requiredFailed}/${requiredCount} passed.`);
  console.log(`All checks: ${CASES.length - failed}/${CASES.length} passed.`);

  console.log('\nNot caught before or after (keyword list gap, not a negation issue):');
  let gapFailed = 0;
  for (const text of KEYWORD_LIST_GAPS) {
    const before = original(text, 'en').isEmergency;
    const after = checkEmergency(text, 'en').isEmergency;
    const passed = !before && !after;
    if (!passed) gapFailed += 1;
    console.log(`${passed ? 'GAP' : 'FAIL'} before=${before ? 'emergency' : 'safe'} after=${after ? 'emergency' : 'safe'}: ${text}`);
  }
  console.log(`Keyword list gaps unchanged: ${KEYWORD_LIST_GAPS.length - gapFailed}/${KEYWORD_LIST_GAPS.length}.`);
  failed += gapFailed;
  if (failed > 0) process.exitCode = 1;
}

module.exports = { loadAppEmergency };

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Negation check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
