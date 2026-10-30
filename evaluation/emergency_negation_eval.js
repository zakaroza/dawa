#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { loadAppEmergency } = require('./negation_check');

const ROOT = path.resolve(__dirname, '..');
const SAVED_RESULTS_PATH = path.join(__dirname, 'results', 'emergency_eval_results.json');
const JSON_PATH = path.join(__dirname, 'results', 'emergency_eval_negation.json');
const MARKDOWN_PATH = path.join(__dirname, 'results', 'emergency_eval_negation.md');
const LANGUAGES = ['ar', 'franco', 'fr', 'en'];
const EXPECTED_COUNT = 291;

function fail(message) {
  throw new Error(message);
}

function atomicWrite(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  fs.writeFileSync(temporaryPath, content, 'utf8');
  fs.renameSync(temporaryPath, filePath);
}

function counts(entries, field) {
  const result = { tp: 0, fn: 0, fp: 0, tn: 0 };
  for (const entry of entries) {
    const actual = entry.label === 'emergency';
    const predicted = entry[field];
    if (actual && predicted) result.tp += 1;
    else if (actual) result.fn += 1;
    else if (predicted) result.fp += 1;
    else result.tn += 1;
  }
  result.recall = result.tp + result.fn === 0 ? null : result.tp / (result.tp + result.fn);
  result.precision = result.tp + result.fp === 0 ? null : result.tp / (result.tp + result.fp);
  return result;
}

function scopeMetrics(entries) {
  return {
    before: {
      layer1: counts(entries, 'layer1Before'),
      combined: counts(entries, 'combinedBefore'),
    },
    after: {
      layer1: counts(entries, 'layer1After'),
      combined: counts(entries, 'combinedAfter'),
    },
  };
}

function metric(value) {
  return value === null ? 'N/A' : `${(value * 100).toFixed(1)}%`;
}

function tableRows(metrics) {
  const rows = [];
  for (const stage of ['before', 'after']) {
    for (const layer of ['layer1', 'combined']) {
      const item = metrics[stage][layer];
      rows.push(`| ${stage} | ${layer === 'layer1' ? 'Layer 1' : 'Combined'} | ${item.tp} | ${item.fn} | ${item.fp} | ${item.tn} | ${metric(item.recall)} | ${metric(item.precision)} |`);
    }
  }
  return rows.join('\n');
}

function exampleList(title, examples) {
  const lines = [`## ${title}`, ''];
  if (examples.length === 0) return [...lines, 'None.', ''].join('\n');
  for (const item of examples) {
    lines.push(`- #${item.index} (${item.lang}): ${item.text.replace(/\r?\n/g, ' ')}`);
  }
  lines.push('');
  return lines.join('\n');
}

function buildMarkdown(report) {
  const lines = [
    '# Emergency Evaluation After Layer 1 Negation Handling',
    '',
    `- Date: ${report.date}`,
    `- Messages: ${report.messageCount}`,
    '- Layer 2 source: saved results only. No API calls were made.',
    '- Recall and precision are shown as percentages.',
    '',
    '## Overall',
    '',
    '| Version | Detector | TP | FN | FP | TN | Recall | Precision |',
    '|---|---|---:|---:|---:|---:|---:|---:|',
    tableRows(report.metrics.overall),
  ];
  for (const language of LANGUAGES) {
    lines.push(
      '',
      `## Language: ${language}`,
      '',
      '| Version | Detector | TP | FN | FP | TN | Recall | Precision |',
      '|---|---|---:|---:|---:|---:|---:|---:|',
      tableRows(report.metrics.languages[language])
    );
  }
  lines.push(
    '',
    exampleList('Previously caught Layer 1 emergencies lost after the change', report.lostLayer1Emergencies),
    exampleList('Additional Layer 1 emergencies caught after the change', report.gainedLayer1Emergencies),
    exampleList('Layer 1 false alarms resolved by negation handling', report.resolvedLayer1FalsePositives),
    exampleList('Layer 1 false alarms remaining after the change', report.remainingLayer1FalsePositives)
  );
  return lines.join('\n');
}

function main() {
  const saved = JSON.parse(fs.readFileSync(SAVED_RESULTS_PATH, 'utf8'));
  if (!Array.isArray(saved) || saved.length !== EXPECTED_COUNT) {
    fail(`Expected ${EXPECTED_COUNT} saved results, found ${Array.isArray(saved) ? saved.length : 'invalid data'}.`);
  }
  if (saved.some((entry) => typeof entry.layer1 !== 'boolean' || typeof entry.layer2 !== 'boolean')) {
    fail('Every saved result must contain Boolean Layer 1 and Layer 2 decisions.');
  }

  const { checkEmergency } = loadAppEmergency();
  const results = saved.map((entry, index) => {
    const layer1After = checkEmergency(entry.text, entry.lang).isEmergency;
    return {
      index: index + 1,
      text: entry.text,
      label: entry.label,
      lang: entry.lang,
      layer1Before: entry.layer1,
      layer1After,
      layer2: entry.layer2,
      combinedBefore: entry.layer1 || entry.layer2,
      combinedAfter: layer1After || entry.layer2,
    };
  });

  const lostLayer1Emergencies = results.filter((entry) =>
    entry.label === 'emergency' && entry.layer1Before && !entry.layer1After
  );
  const gainedLayer1Emergencies = results.filter((entry) =>
    entry.label === 'emergency' && !entry.layer1Before && entry.layer1After
  );
  const resolvedLayer1FalsePositives = results.filter((entry) =>
    entry.label === 'safe' && entry.layer1Before && !entry.layer1After
  );
  const remainingLayer1FalsePositives = results.filter((entry) =>
    entry.label === 'safe' && entry.layer1After
  );

  const metrics = {
    overall: scopeMetrics(results),
    languages: Object.fromEntries(LANGUAGES.map((language) => [
      language,
      scopeMetrics(results.filter((entry) => entry.lang === language)),
    ])),
  };
  const report = {
    date: new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date()),
    messageCount: results.length,
    metrics,
    lostLayer1Emergencies,
    gainedLayer1Emergencies,
    resolvedLayer1FalsePositives,
    remainingLayer1FalsePositives,
    results,
  };
  atomicWrite(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
  atomicWrite(MARKDOWN_PATH, buildMarkdown(report));

  const beforeRecall = metrics.overall.before.layer1.recall;
  const afterRecall = metrics.overall.after.layer1.recall;
  console.log(`Saved ${results.length} local comparisons. Lost previously caught emergencies: ${lostLayer1Emergencies.length}.`);
  console.log(`Layer 1 recall: ${metric(beforeRecall)} before, ${metric(afterRecall)} after.`);
  console.log(`Layer 1 false positives: ${metrics.overall.before.layer1.fp} before, ${metrics.overall.after.layer1.fp} after.`);
  console.log(`JSON: ${path.relative(ROOT, JSON_PATH)}`);
  console.log(`Markdown: ${path.relative(ROOT, MARKDOWN_PATH)}`);
  if (lostLayer1Emergencies.length > 0 || afterRecall < beforeRecall) {
    process.exitCode = 2;
  }
}

try {
  main();
} catch (error) {
  console.error(`Negation evaluation failed: ${error.message}`);
  process.exitCode = 1;
}
