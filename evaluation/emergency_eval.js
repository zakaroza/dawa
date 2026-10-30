#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, 'app', '.env');
const APP_SOURCE_PATH = path.join(ROOT, 'app', 'src', 'screens', 'ChatbotScreen.js');
const TEST_SET_PATH = path.join(ROOT, 'scraper', 'emergency_test_set.json');
const RESULTS_DIR = path.join(__dirname, 'results');
const RESULTS_PATH = path.join(RESULTS_DIR, 'emergency_eval_results.json');
const SUMMARY_PATH = path.join(RESULTS_DIR, 'emergency_eval_summary.md');
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const EXPECTED_EXAMPLE_COUNT = 291;
const REQUEST_DELAY_MS = 300;
const MAX_429_RETRIES = 5;
const SUPPORTED_LANGUAGES = ['ar', 'franco', 'fr', 'en'];

function fail(message) {
  throw new Error(message);
}

function parseEnvFile(filePath) {
  let source;
  try {
    source = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    fail(`Could not read ${path.relative(ROOT, filePath)}: ${error.message}`);
  }

  const values = Object.create(null);
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '').trim();
    }
    values[match[1]] = value;
  }
  return values;
}

function findInitializer(source, name) {
  const declaration = new RegExp(`\\bconst\\s+${name}\\s*=`).exec(source);
  if (!declaration) fail(`Could not extract ${name} from app/src/screens/ChatbotScreen.js.`);

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
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '/' && next === '/') {
      lineComment = true;
      index += 1;
    } else if (char === '/' && next === '*') {
      blockComment = true;
      index += 1;
    } else if (char === "'" || char === '"' || char === '`') {
      quote = char;
    } else if (char === '[') {
      squareDepth += 1;
    } else if (char === ']') {
      squareDepth -= 1;
    } else if (char === '{') {
      braceDepth += 1;
    } else if (char === '}') {
      braceDepth -= 1;
    } else if (char === '(') {
      parenDepth += 1;
    } else if (char === ')') {
      parenDepth -= 1;
    } else if (char === ';' && squareDepth === 0 && braceDepth === 0 && parenDepth === 0) {
      return source.slice(start, index).trim();
    }
  }

  fail(`Could not find the end of ${name} in app/src/screens/ChatbotScreen.js.`);
}

function extractAppValues(source) {
  const expressions = {};
  for (const name of ['SYSTEM_PROMPT', 'MEDICAL_KNOWLEDGE_BASE', 'GROQ_MODEL', 'EMERGENCY_KEYWORDS']) {
    expressions[name] = findInitializer(source, name);
  }

  const functionMatch = source.match(
    /function\s+normalizeEmergencyText\s*\([^)]*\)\s*\{[\s\S]*?^\}/m
  );
  if (!functionMatch) {
    fail('Could not extract normalizeEmergencyText from app/src/screens/ChatbotScreen.js.');
  }

  const extracted = {};
  try {
    for (const [name, expression] of Object.entries(expressions)) {
      extracted[name] = vm.runInNewContext(`(${expression})`, Object.create(null), {
        timeout: 1000,
        filename: `extracted-${name}.js`,
      });
    }
    extracted.normalizeEmergencyText = vm.runInNewContext(
      `(${functionMatch[0]})`,
      Object.create(null),
      { timeout: 1000, filename: 'extracted-normalizeEmergencyText.js' }
    );
  } catch (error) {
    fail(`Extracted app values could not be evaluated: ${error.message}`);
  }

  if (typeof extracted.SYSTEM_PROMPT !== 'string' || !extracted.SYSTEM_PROMPT) {
    fail('Extracted SYSTEM_PROMPT is not a non-empty string.');
  }
  if (typeof extracted.MEDICAL_KNOWLEDGE_BASE !== 'string' || !extracted.MEDICAL_KNOWLEDGE_BASE) {
    fail('Extracted MEDICAL_KNOWLEDGE_BASE is not a non-empty string.');
  }
  if (typeof extracted.GROQ_MODEL !== 'string' || !extracted.GROQ_MODEL) {
    fail('Extracted GROQ_MODEL is not a non-empty string.');
  }
  if (!Array.isArray(extracted.EMERGENCY_KEYWORDS) || extracted.EMERGENCY_KEYWORDS.length === 0) {
    fail('Extracted EMERGENCY_KEYWORDS is not a non-empty array.');
  }
  if (typeof extracted.normalizeEmergencyText !== 'function') {
    fail('Extracted normalizeEmergencyText is not a function.');
  }

  return extracted;
}

function loadTestSet() {
  let examples;
  try {
    examples = JSON.parse(fs.readFileSync(TEST_SET_PATH, 'utf8'));
  } catch (error) {
    fail(`Could not load scraper/emergency_test_set.json: ${error.message}`);
  }

  if (!Array.isArray(examples)) fail('Emergency test set must be a JSON array.');
  if (examples.length !== EXPECTED_EXAMPLE_COUNT) {
    fail(`Expected ${EXPECTED_EXAMPLE_COUNT} examples, found ${examples.length}.`);
  }

  examples.forEach((example, index) => {
    if (!example || typeof example.text !== 'string' ||
        !['emergency', 'safe'].includes(example.label) ||
        !SUPPORTED_LANGUAGES.includes(example.lang)) {
      fail(`Invalid test example at index ${index}; expected text, label, and lang.`);
    }
  });
  return examples;
}

function atomicWrite(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  fs.writeFileSync(temporaryPath, content, 'utf8');
  fs.renameSync(temporaryPath, filePath);
}

function saveResults(results) {
  atomicWrite(RESULTS_PATH, `${JSON.stringify(results, null, 2)}\n`);
}

function initialResult(example, layer1) {
  return {
    text: example.text,
    label: example.label,
    lang: example.lang,
    layer1,
    layer2: null,
    combined: layer1 ? true : null,
    latencyMs: null,
    rawResponse: null,
  };
}

function loadOrInitializeResults(examples, checkEmergency) {
  let existing = null;
  if (fs.existsSync(RESULTS_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
    } catch (error) {
      fail(`Could not parse existing evaluation results: ${error.message}`);
    }
    if (!Array.isArray(existing) || existing.length !== examples.length) {
      fail('Existing results do not match the test-set length. Move or remove the results file to start over.');
    }
  }

  const results = examples.map((example, index) => {
    const layer1 = checkEmergency(example.text);
    const previous = existing?.[index];
    if (!previous) return initialResult(example, layer1);

    if (previous.text !== example.text || previous.label !== example.label || previous.lang !== example.lang) {
      fail(`Existing result at index ${index} does not match the current test set. Move or remove the results file to start over.`);
    }
    if (previous.layer1 !== layer1) {
      fail(`Layer 1 app logic has changed at index ${index}. Move or remove the results file to start a fresh evaluation.`);
    }

    const layer2 = typeof previous.layer2 === 'boolean' ? previous.layer2 : null;
    return {
      text: example.text,
      label: example.label,
      lang: example.lang,
      layer1,
      layer2,
      combined: layer2 === null ? (layer1 ? true : null) : layer1 || layer2,
      latencyMs: layer2 === null || !Number.isFinite(previous.latencyMs) ? null : previous.latencyMs,
      rawResponse: layer2 === null || typeof previous.rawResponse !== 'string' ? null : previous.rawResponse,
    };
  });

  saveResults(results);
  return results;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function retryAfterMilliseconds(headerValue) {
  if (!headerValue) return 10_000;
  const seconds = Number(headerValue);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds * 1000);
  const date = Date.parse(headerValue);
  if (Number.isFinite(date)) return Math.max(0, date - Date.now());
  return 10_000;
}

async function callLayer2(apiKey, appValues, text) {
  for (let retryCount = 0; retryCount <= MAX_429_RETRIES; retryCount += 1) {
    const startedAt = Date.now();
    let response;
    try {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: appValues.GROQ_MODEL,
          max_tokens: 1024,
          temperature: 0.7,
          messages: [
            {
              role: 'system',
              content: `${appValues.SYSTEM_PROMPT}\n\n${appValues.MEDICAL_KNOWLEDGE_BASE}`,
            },
            { role: 'user', content: text },
          ],
        }),
      });
    } catch (error) {
      fail(`Network request failed: ${error.message}`);
    }
    const latencyMs = Date.now() - startedAt;

    if (response.status === 429) {
      if (retryCount === MAX_429_RETRIES) {
        fail(`Groq returned HTTP 429 after ${MAX_429_RETRIES} retries.`);
      }
      const waitMs = retryAfterMilliseconds(response.headers.get('retry-after'));
      console.log(`Rate limited; waiting ${Math.ceil(waitMs / 1000)}s before retry ${retryCount + 1}/${MAX_429_RETRIES}.`);
      await sleep(waitMs);
      continue;
    }

    let json;
    try {
      json = await response.json();
    } catch {
      fail(`Groq returned HTTP ${response.status} with a non-JSON response.`);
    }
    if (!response.ok || json.error) {
      const detail = json?.error?.message || response.statusText || 'Unknown API error';
      fail(`Groq returned HTTP ${response.status}: ${detail}`);
    }

    const rawResponse = json?.choices?.[0]?.message?.content;
    if (typeof rawResponse !== 'string' || !rawResponse) {
      fail('Groq returned an unexpected response without assistant text.');
    }
    return {
      layer2: /^EMERGENCY[.!]?\s*$/i.test(rawResponse.trim()),
      latencyMs,
      rawResponse: rawResponse.slice(0, 200),
    };
  }

  fail('Layer 2 request failed unexpectedly.');
}

function classificationCounts(entries, field) {
  const counts = { tp: 0, fn: 0, fp: 0, tn: 0, tested: 0 };
  for (const entry of entries) {
    if (typeof entry[field] !== 'boolean') continue;
    counts.tested += 1;
    const actual = entry.label === 'emergency';
    const predicted = entry[field];
    if (actual && predicted) counts.tp += 1;
    else if (actual) counts.fn += 1;
    else if (predicted) counts.fp += 1;
    else counts.tn += 1;
  }
  return counts;
}

function ratio(numerator, denominator) {
  return denominator === 0 ? 'N/A' : (numerator / denominator).toFixed(3);
}

function metricRow(label, counts) {
  const recall = ratio(counts.tp, counts.tp + counts.fn);
  const precision = ratio(counts.tp, counts.tp + counts.fp);
  const falsePositiveRate = ratio(counts.fp, counts.fp + counts.tn);
  const accuracy = ratio(counts.tp + counts.tn, counts.tested);
  return `| ${label} | ${counts.tested} | ${counts.tp} | ${counts.fn} | ${counts.fp} | ${counts.tn} | ${recall} | ${precision} | ${falsePositiveRate} | ${accuracy} |`;
}

function metricsTable(results, language = null) {
  const entries = language ? results.filter((entry) => entry.lang === language) : results;
  const lines = [
    '| Layer | Tested | TP | FN | FP | TN | Recall | Precision | False positive rate | Accuracy |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
  ];
  for (const [label, field] of [['Layer 1', 'layer1'], ['Layer 2', 'layer2'], ['Combined', 'combined']]) {
    lines.push(metricRow(label, classificationCounts(entries, field)));
  }
  return lines.join('\n');
}

function markdownText(value) {
  return String(value).replace(/\r?\n/g, ' ').replace(/`/g, '\\`');
}

function wrongExamples(results, label, field) {
  const wrong = results
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => typeof entry[field] === 'boolean' &&
      entry[field] !== (entry.label === 'emergency'));

  const lines = [`### ${label}`, ''];
  if (wrong.length === 0) {
    lines.push('None.');
  } else {
    for (const { entry, index } of wrong) {
      const predicted = entry[field] ? 'emergency' : 'safe';
      lines.push(`- #${index + 1} (${entry.lang}) actual=${entry.label}, predicted=${predicted}: \`${markdownText(entry.text)}\``);
    }
  }
  return lines.join('\n');
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values) {
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 1
    ? ordered[middle]
    : (ordered[middle - 1] + ordered[middle]) / 2;
}

function buildSummary(results, model, mode) {
  const latencies = results
    .map((entry) => entry.latencyMs)
    .filter((value) => Number.isFinite(value));
  const layer2Tested = results.filter((entry) => typeof entry.layer2 === 'boolean').length;
  const completed = layer2Tested === results.length;
  const lines = [
    '# Emergency Detection Evaluation Summary',
    '',
    `- Date: ${new Date().toISOString().slice(0, 10)}`,
    `- Model: \`${model}\``,
    `- Examples in test set: ${results.length}`,
    `- Examples tested by Layer 2: ${layer2Tested}`,
    `- Run mode: ${mode === 'errors-only' ? '\`--errors-only\`' : 'full'}`,
    `- Status: ${completed ? 'full Layer 2 evaluation complete' : 'partial Layer 2 evaluation'}`,
    '',
    '## Overall metrics',
    '',
    metricsTable(results),
  ];

  for (const language of SUPPORTED_LANGUAGES) {
    lines.push('', `## Language: ${language}`, '', metricsTable(results, language));
  }

  lines.push('', '## Misclassified examples', '');
  for (const [label, field] of [['Layer 1', 'layer1'], ['Layer 2', 'layer2'], ['Combined', 'combined']]) {
    lines.push(wrongExamples(results, label, field), '');
  }

  lines.push('## Layer 2 latency', '');
  if (latencies.length === 0) {
    lines.push('- Mean: N/A', '- Median: N/A');
  } else {
    lines.push(
      `- Mean: ${mean(latencies).toFixed(1)} ms`,
      `- Median: ${median(latencies).toFixed(1)} ms`
    );
  }
  lines.push(
    '',
    'Layer 2 runs at temperature 0.7, so results can vary slightly between runs.',
    ''
  );
  return lines.join('\n');
}

function saveSummary(results, model, mode) {
  atomicWrite(SUMMARY_PATH, buildSummary(results, model, mode));
}

async function main() {
  const args = process.argv.slice(2);
  const unknownArgs = args.filter((arg) => arg !== '--errors-only');
  if (unknownArgs.length > 0) {
    fail(`Unknown argument(s): ${unknownArgs.join(', ')}. Supported flag: --errors-only`);
  }
  const errorsOnly = args.includes('--errors-only');

  const env = parseEnvFile(ENV_PATH);
  const apiKey = env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) fail('EXPO_PUBLIC_GROQ_API_KEY is missing or empty in app/.env.');

  let appSource;
  try {
    appSource = fs.readFileSync(APP_SOURCE_PATH, 'utf8');
  } catch (error) {
    fail(`Could not read app/src/screens/ChatbotScreen.js: ${error.message}`);
  }
  const appValues = extractAppValues(appSource);
  const checkEmergency = (text) => {
    const normalized = appValues.normalizeEmergencyText(text);
    return appValues.EMERGENCY_KEYWORDS.some((keyword) =>
      normalized.includes(appValues.normalizeEmergencyText(keyword))
    );
  };

  const examples = loadTestSet();
  const results = loadOrInitializeResults(examples, checkEmergency);
  const eligibleIndexes = results
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => !errorsOnly || entry.layer1 !== (entry.label === 'emergency'))
    .map(({ index }) => index);
  const pendingIndexes = eligibleIndexes.filter((index) => results[index].layer2 === null);

  console.log(`Mode: ${errorsOnly ? 'errors-only' : 'full'}; Layer 2 pending: ${pendingIndexes.length}/${eligibleIndexes.length}.`);
  for (let position = 0; position < pendingIndexes.length; position += 1) {
    const index = pendingIndexes[position];
    if (position > 0) await sleep(REQUEST_DELAY_MS);

    const response = await callLayer2(apiKey, appValues, results[index].text);
    results[index].layer2 = response.layer2;
    results[index].combined = results[index].layer1 || response.layer2;
    results[index].latencyMs = response.latencyMs;
    results[index].rawResponse = response.rawResponse;
    saveResults(results);
    saveSummary(results, appValues.GROQ_MODEL, errorsOnly ? 'errors-only' : 'full');
    console.log(`Completed ${position + 1}/${pendingIndexes.length} (example #${index + 1}).`);
  }

  saveSummary(results, appValues.GROQ_MODEL, errorsOnly ? 'errors-only' : 'full');
  console.log(`Results: ${path.relative(ROOT, RESULTS_PATH)}`);
  console.log(`Summary: ${path.relative(ROOT, SUMMARY_PATH)}`);
}

main().catch((error) => {
  console.error(`Emergency evaluation failed: ${error.message}`);
  process.exitCode = 1;
});
