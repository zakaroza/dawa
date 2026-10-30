#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const QUESTIONS_PATH = path.join(__dirname, 'rq1_questions.txt');
const ENV_PATH = path.join(ROOT, 'app', '.env');
const CHATBOT_PATH = path.join(ROOT, 'app', 'src', 'screens', 'ChatbotScreen.js');
const STRINGS_PATH = path.join(ROOT, 'app', 'src', 'i18n', 'strings.js');
const RESULTS_DIR = path.join(__dirname, 'results');
const JSON_PATH = path.join(RESULTS_DIR, 'rq1_answers.json');
const MARKDOWN_PATH = path.join(RESULTS_DIR, 'rq1_answers.md');
const QUOTA_STATUS_PATH = path.join(RESULTS_DIR, 'rq1_quota_status.json');
const TOAST_SCRIPT_PATH = path.join(__dirname, 'rq1_quota_toast.ps1');
const TASK_NAME = 'Dawa RQ1 quota reset';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const REQUEST_DELAY_MS = 300;
const MAX_429_RETRIES = 5;
const REQUEST_TIMEOUT_MS = 15_000;

function fail(message) {
  throw new Error(message);
}

function readText(filePath, label) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    fail(`Could not read ${label}: ${error.message}`);
  }
}

function parseQuestions() {
  const lines = readText(QUESTIONS_PATH, 'evaluation/rq1_questions.txt').split(/\r?\n/);
  const questions = [];
  const missingQuestionNumbers = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const lastSeparator = line.lastIndexOf('|');
    const leadingFields = lastSeparator === -1 ? line : line.slice(0, lastSeparator);
    const question = lastSeparator === -1 ? '' : line.slice(lastSeparator + 1).trim();
    const fields = leadingFields.split('|').map((value) => value.trim());
    const number = fields[0] || `line ${lineIndex + 1}`;

    if (!question) {
      missingQuestionNumbers.push(number);
      continue;
    }
    if (fields.length !== 3 || fields.some((value) => !value)) {
      fail(`Malformed question metadata for ${number} on line ${lineIndex + 1}; expected "number | topic | script | question".`);
    }

    questions.push({
      number: fields[0],
      topic: fields[1],
      script: fields[2],
      question,
    });
  }

  if (missingQuestionNumbers.length > 0) {
    fail(`Empty question text for number(s): ${missingQuestionNumbers.join(', ')}.`);
  }
  if (questions.length === 0) fail('No questions were found in evaluation/rq1_questions.txt.');

  const seen = new Set();
  for (const question of questions) {
    if (seen.has(question.number)) fail(`Duplicate question number: ${question.number}.`);
    seen.add(question.number);
  }
  return questions;
}

function parseEnvFile() {
  const source = readText(ENV_PATH, 'app/.env');
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

  const apiKey = values.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) fail('EXPO_PUBLIC_GROQ_API_KEY is missing or empty in app/.env.');
  return apiKey;
}

function findInitializer(source, name, sourceLabel) {
  const declaration = new RegExp(`\\b(?:export\\s+)?const\\s+${name}\\s*=`).exec(source);
  if (!declaration) fail(`Could not extract ${name} from ${sourceLabel}.`);

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
    } else if (char === "'" || char === '"' || char === '`') {
      quote = char;
    } else if (char === '[') squareDepth += 1;
    else if (char === ']') squareDepth -= 1;
    else if (char === '{') braceDepth += 1;
    else if (char === '}') braceDepth -= 1;
    else if (char === '(') parenDepth += 1;
    else if (char === ')') parenDepth -= 1;
    else if (char === ';' && squareDepth === 0 && braceDepth === 0 && parenDepth === 0) {
      return source.slice(start, index).trim();
    }
  }

  fail(`Could not find the end of ${name} in ${sourceLabel}.`);
}

function evaluateExpression(expression, name) {
  try {
    return vm.runInNewContext(`(${expression})`, Object.create(null), {
      timeout: 1000,
      filename: `extracted-${name}.js`,
    });
  } catch (error) {
    fail(`Could not evaluate extracted ${name}: ${error.message}`);
  }
}

function extractAppValues() {
  const source = readText(CHATBOT_PATH, 'app/src/screens/ChatbotScreen.js');
  const names = [
    'SYSTEM_PROMPT',
    'MEDICAL_KNOWLEDGE_BASE',
    'GROQ_MODEL',
    'TRANSLATION_MODEL',
    'TRANSLATION_SYSTEM_PROMPT',
    'EMERGENCY_KEYWORDS',
  ];
  const values = Object.create(null);

  for (const name of names) {
    const expression = findInitializer(source, name, 'app/src/screens/ChatbotScreen.js');
    values[name] = evaluateExpression(expression, name);
  }

  const functionMatch = source.match(
    /function\s+normalizeEmergencyText\s*\([^)]*\)\s*\{[\s\S]*?^\}/m
  );
  if (!functionMatch) {
    fail('Could not extract normalizeEmergencyText from app/src/screens/ChatbotScreen.js.');
  }
  values.normalizeEmergencyText = evaluateExpression(functionMatch[0], 'normalizeEmergencyText');

  for (const name of [
    'SYSTEM_PROMPT',
    'MEDICAL_KNOWLEDGE_BASE',
    'GROQ_MODEL',
    'TRANSLATION_MODEL',
    'TRANSLATION_SYSTEM_PROMPT',
  ]) {
    if (typeof values[name] !== 'string' || !values[name]) {
      fail(`Extracted ${name} is not a non-empty string.`);
    }
  }
  if (!Array.isArray(values.EMERGENCY_KEYWORDS) || values.EMERGENCY_KEYWORDS.length === 0) {
    fail('Extracted EMERGENCY_KEYWORDS is not a non-empty array.');
  }
  if (typeof values.normalizeEmergencyText !== 'function') {
    fail('Extracted normalizeEmergencyText is not a function.');
  }

  // runTwoStagePipeline appends this exact localized value only if translation fails.
  const stringsSource = readText(STRINGS_PATH, 'app/src/i18n/strings.js');
  const stringsExpression = findInitializer(stringsSource, 'strings', 'app/src/i18n/strings.js');
  const strings = evaluateExpression(stringsExpression, 'strings');
  values.translationUnavailable = strings?.ar?.translationUnavailable;
  values.welcomeMessage = strings?.ar?.welcomeMessage;
  values.emergencyMessage = strings?.ar?.emergencyMessage;
  if (typeof values.translationUnavailable !== 'string' ||
      typeof values.welcomeMessage !== 'string' ||
      typeof values.emergencyMessage !== 'string') {
    fail('Could not extract the Arabic UI strings used by the chatbot pipeline.');
  }

  return values;
}

function atomicWrite(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  fs.writeFileSync(temporaryPath, content, 'utf8');
  fs.renameSync(temporaryPath, filePath);
}

function saveJson(results) {
  atomicWrite(JSON_PATH, `${JSON.stringify(results, null, 2)}\n`);
}

function localDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function html(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function markdownAnswer(value) {
  return html(value).replace(/\r?\n/g, '<br>');
}

function buildMarkdown(results, values) {
  const lines = [
    '# RQ1 Darija Chatbot Answers',
    '',
    `- Date: ${localDate()}`,
    `- Medical model: \`${values.GROQ_MODEL}\``,
    `- Translation model: \`${values.TRANSLATION_MODEL}\``,
    '- These answers come from a single run at the app\'s temperatures (0.7 for the medical model and 0.2 for translation), so they can vary between runs.',
    '- Times include API request time only; rate-limit waiting time is excluded and retries are reported separately.',
    '',
  ];

  for (const result of results) {
    lines.push(
      `## ${html(result.number)}. ${html(result.topic)} (${html(result.script)})`,
      '',
      `**Question:** ${markdownAnswer(result.question)}`,
      '',
      '### Turn 1',
      '',
      `**Darija answer:** ${markdownAnswer(result.turn1.finalDarijaAnswer)}`,
      '',
      `Time: ${result.turn1.totalSeconds.toFixed(1)} s (stage 1: ${result.turn1.stage1Seconds.toFixed(1)} s, stage 2: ${result.turn1.stage2Seconds.toFixed(1)} s)`,
      '',
      `Retries: ${result.turn1.stage1Retries + result.turn1.stage2Retries} (stage 1: ${result.turn1.stage1Retries}, stage 2: ${result.turn1.stage2Retries})`,
      '',
      ...(result.turn1.note ? [`**Note:** ${html(result.turn1.note)}`, ''] : []),
      '<details>',
      '<summary>English medical answer (stage 1)</summary>',
      '',
      result.turn1.stage1EnglishAnswer === null
        ? 'Not run because the keyword emergency layer fired.'
        : markdownAnswer(result.turn1.stage1EnglishAnswer),
      '',
      '</details>',
      '',
      `**Follow-up reply:** ${markdownAnswer(result.followUpReply)}`,
      '',
      '### Turn 2 answer (rate this answer)',
      '',
      `**Darija answer:** ${markdownAnswer(result.turn2.finalDarijaAnswer)}`,
      '',
      `Time: ${result.turn2.totalSeconds.toFixed(1)} s (stage 1: ${result.turn2.stage1Seconds.toFixed(1)} s, stage 2: ${result.turn2.stage2Seconds.toFixed(1)} s)`,
      '',
      `Retries: ${result.turn2.stage1Retries + result.turn2.stage2Retries} (stage 1: ${result.turn2.stage1Retries}, stage 2: ${result.turn2.stage2Retries})`,
      '',
      '<details>',
      '<summary>English medical answer (stage 1)</summary>',
      '',
      result.turn2.stage1EnglishAnswer === null
        ? 'Not run because the keyword emergency layer fired.'
        : markdownAnswer(result.turn2.stage1EnglishAnswer),
      '',
      '</details>',
      ''
    );
  }
  return lines.join('\n');
}

function saveProgress(results, values) {
  saveJson(results);
  atomicWrite(MARKDOWN_PATH, buildMarkdown(results, values));
}

function loadExistingResults(questions, values) {
  if (!fs.existsSync(JSON_PATH)) return [];

  let results;
  try {
    results = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  } catch (error) {
    fail(`Could not parse existing evaluation/results/rq1_answers.json: ${error.message}`);
  }
  if (!Array.isArray(results) || results.length > questions.length) {
    fail('Existing RQ1 results have an invalid length. Move or remove them to start over.');
  }

  if (results.length > 0 && results.every((result) => !result?.turn1 && !result?.turn2)) {
    console.log('Existing single-turn RQ1 results are legacy data; starting the required fresh two-turn run.');
    return [];
  }

  results.forEach((result, index) => {
    const question = questions[index];
    if (!result || result.number !== question.number || result.topic !== question.topic ||
        result.script !== question.script || result.question !== question.question) {
      fail(`Existing RQ1 result ${index + 1} does not match the current question file. Move or remove the results to start over.`);
    }
    if (result.medicalModel !== values.GROQ_MODEL || result.translationModel !== values.TRANSLATION_MODEL) {
      fail(`Existing RQ1 result ${result.number} uses different model names. Move or remove the results to start over.`);
    }
    if (typeof result.followUpReply !== 'string' ||
        typeof result.turn1?.finalDarijaAnswer !== 'string' ||
        typeof result.turn2?.finalDarijaAnswer !== 'string' ||
        typeof result.turn1?.emergency !== 'boolean' ||
        typeof result.turn2?.emergency !== 'boolean') {
      fail(`Existing RQ1 result ${result.number} is incomplete. Move or remove the results to start over.`);
    }
  });
  return results;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function headerWaitMilliseconds(headerValue) {
  if (!headerValue) return null;
  const seconds = Number(headerValue);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds * 1000);
  const date = Date.parse(headerValue);
  if (Number.isFinite(date)) return Math.max(0, date - Date.now());
  let total = 0;
  let matched = false;
  for (const match of String(headerValue).matchAll(/([0-9]*\.?[0-9]+)\s*(ms|[dhms])/gi)) {
    matched = true;
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    total += value * ({ ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit]);
  }
  return matched ? Math.ceil(total) : null;
}

function quotaWaitMilliseconds(headers) {
  const retryAfter = headerWaitMilliseconds(headers.get('retry-after'));
  if (Number.isFinite(retryAfter)) return retryAfter;

  const waits = [];
  const remainingRequestsHeader = headers.get('x-ratelimit-remaining-requests');
  const remainingTokensHeader = headers.get('x-ratelimit-remaining-tokens');
  const remainingRequests = remainingRequestsHeader === null ? NaN : Number(remainingRequestsHeader);
  const remainingTokens = remainingTokensHeader === null ? NaN : Number(remainingTokensHeader);
  if (Number.isFinite(remainingRequests) && remainingRequests <= 0) {
    waits.push(headerWaitMilliseconds(headers.get('x-ratelimit-reset-requests')));
  }
  if (Number.isFinite(remainingTokens) && remainingTokens <= 0) {
    waits.push(headerWaitMilliseconds(headers.get('x-ratelimit-reset-tokens')));
  }
  const realWaits = waits.filter(Number.isFinite);
  return realWaits.length ? Math.max(...realWaits) : 10_000;
}

let tokenRateState = null;

function updateTokenRateState(headers) {
  const remainingHeader = headers.get('x-ratelimit-remaining-tokens');
  const remaining = remainingHeader === null ? NaN : Number(remainingHeader);
  const resetMs = headerWaitMilliseconds(headers.get('x-ratelimit-reset-tokens'));
  if (!Number.isFinite(remaining) || !Number.isFinite(resetMs)) return;
  tokenRateState = { remaining, resetAt: Date.now() + resetMs };
}

function estimatedRequestTokens(body) {
  const prompt = (body.messages || [])
    .map((message) => typeof message.content === 'string' ? message.content : JSON.stringify(message.content ?? ''))
    .join('\n');
  // A conservative dependency-free estimate that also leaves room for Arabic/Darija tokenisation.
  const estimatedPromptTokens = Math.ceil(Buffer.byteLength(prompt, 'utf8') / 2);
  return estimatedPromptTokens + (Number(body.max_tokens) || 0);
}

async function paceForTokenWindow(body, stageLabel) {
  if (!tokenRateState) return;
  const waitMs = tokenRateState.resetAt - Date.now();
  if (waitMs <= 0) {
    tokenRateState = null;
    return;
  }
  const needed = estimatedRequestTokens(body);
  if (tokenRateState.remaining >= needed) return;
  console.log(`Token allowance is low before ${stageLabel}; waiting ${Math.ceil(waitMs / 1000)}s for the token window to reset.`);
  await sleep(waitMs + 100);
  tokenRateState = null;
}

async function requestCompletion(apiKey, body, stageLabel) {
  let apiMilliseconds = 0;
  for (let retryCount = 0; retryCount <= MAX_429_RETRIES; retryCount += 1) {
    await paceForTokenWindow(body, stageLabel);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const requestStartedAt = Date.now();
    let response;
    try {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      updateTokenRateState(response.headers);
    } catch (error) {
      apiMilliseconds += Date.now() - requestStartedAt;
      if (error.name === 'AbortError') {
        const timeoutError = new Error(`${stageLabel} timed out after 15 seconds.`);
        timeoutError.name = 'AbortError';
        timeoutError.apiMilliseconds = apiMilliseconds;
        timeoutError.retries = retryCount;
        throw timeoutError;
      }
      const networkError = new Error(`${stageLabel} network request failed: ${error.message}`);
      networkError.apiMilliseconds = apiMilliseconds;
      networkError.retries = retryCount;
      throw networkError;
    } finally {
      clearTimeout(timeoutId);
    }
    if (response.status === 429) {
      const waitMs = quotaWaitMilliseconds(response.headers);
      // retry-after is authoritative for this 429; do not add a second pacing wait.
      tokenRateState = null;
      const rateLimitBody = await response.text();
      let rateLimitMessage = '';
      try {
        rateLimitMessage = JSON.parse(rateLimitBody)?.error?.message || '';
      } catch {
        rateLimitMessage = '';
      }
      if (rateLimitMessage) console.log(`Groq 429 during ${stageLabel}: ${rateLimitMessage}`);
      apiMilliseconds += Date.now() - requestStartedAt;
      if (waitMs > 60_000) {
        const quotaError = new Error(`Groq quota reset requires a ${Math.ceil(waitMs / 1000)} second wait.`);
        quotaError.name = 'QuotaExhaustedError';
        quotaError.waitMs = waitMs;
        quotaError.apiMilliseconds = apiMilliseconds;
        quotaError.retries = retryCount;
        throw quotaError;
      }
      if (retryCount === MAX_429_RETRIES) {
        const rateLimitError = new Error(`${stageLabel} received HTTP 429 after ${MAX_429_RETRIES} retries.`);
        rateLimitError.apiMilliseconds = apiMilliseconds;
        rateLimitError.retries = retryCount;
        throw rateLimitError;
      }
      console.log(`Rate limited during ${stageLabel}; waiting ${Math.ceil(waitMs / 1000)}s before retry ${retryCount + 1}/${MAX_429_RETRIES}.`);
      await sleep(waitMs);
      continue;
    }

    let json;
    try {
      json = await response.json();
    } catch {
      apiMilliseconds += Date.now() - requestStartedAt;
      const responseError = new Error(`${stageLabel} returned HTTP ${response.status} with a non-JSON response.`);
      responseError.apiMilliseconds = apiMilliseconds;
      responseError.retries = retryCount;
      throw responseError;
    }
    apiMilliseconds += Date.now() - requestStartedAt;
    if (!response.ok || json.error) {
      const detail = json?.error?.message || response.statusText || 'Unknown API error';
      const responseError = new Error(`${stageLabel} returned HTTP ${response.status}: ${detail}`);
      responseError.apiMilliseconds = apiMilliseconds;
      responseError.retries = retryCount;
      throw responseError;
    }

    const text = json?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text) {
      const responseError = new Error(`${stageLabel} returned an unexpected response without assistant text.`);
      responseError.apiMilliseconds = apiMilliseconds;
      responseError.retries = retryCount;
      throw responseError;
    }
    return { text, apiMilliseconds, retries: retryCount };
  }

  throw new Error(`${stageLabel} failed unexpectedly.`);
}

function secondsFromMilliseconds(milliseconds) {
  return Math.round((milliseconds / 1000) * 10) / 10;
}

async function evaluateTurn(userText, apiMessages, questionNumber, apiKey, values) {
  const normalized = values.normalizeEmergencyText(userText);
  const keywordEmergency = values.EMERGENCY_KEYWORDS.some((keyword) =>
    normalized.includes(values.normalizeEmergencyText(keyword))
  );

  if (keywordEmergency) {
    return {
      stage1EnglishAnswer: null,
      finalDarijaAnswer: 'EMERGENCY (keyword layer)',
      emergency: true,
      stage1Seconds: 0,
      stage2Seconds: 0,
      totalSeconds: 0,
      stage1Retries: 0,
      stage2Retries: 0,
      historyContent: values.emergencyMessage,
      historyLlmContent: null,
    };
  }

  const stage1Result = await requestCompletion(apiKey, {
    model: values.GROQ_MODEL,
    max_tokens: 1024,
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content: `${values.SYSTEM_PROMPT}\n\n${values.MEDICAL_KNOWLEDGE_BASE}`,
      },
      ...apiMessages,
    ],
  }, `stage 1 for question ${questionNumber}`);
  const stage1EnglishAnswer = stage1Result.text;
  const stage1Seconds = secondsFromMilliseconds(stage1Result.apiMilliseconds);

  if (/^EMERGENCY[.!]?\s*$/i.test(stage1EnglishAnswer.trim())) {
    return {
      stage1EnglishAnswer,
      finalDarijaAnswer: 'EMERGENCY (LLM layer)',
      emergency: true,
      stage1Seconds,
      stage2Seconds: 0,
      totalSeconds: stage1Seconds,
      stage1Retries: stage1Result.retries,
      stage2Retries: 0,
      historyContent: values.emergencyMessage,
      historyLlmContent: null,
    };
  }

  let finalDarijaAnswer;
  let stage2Milliseconds = 0;
  let stage2Retries = 0;
  try {
    const stage2Result = await requestCompletion(apiKey, {
      model: values.TRANSLATION_MODEL,
      max_tokens: 2048,
      temperature: 0.2,
      messages: [
        { role: 'system', content: values.TRANSLATION_SYSTEM_PROMPT },
        { role: 'user', content: stage1EnglishAnswer },
      ],
    }, `stage 2 for question ${questionNumber}`);
    finalDarijaAnswer = stage2Result.text;
    stage2Milliseconds = stage2Result.apiMilliseconds;
    stage2Retries = stage2Result.retries;
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'QuotaExhaustedError') throw error;
    // This is the same non-timeout fallback used by runTwoStagePipeline.
    finalDarijaAnswer = `${stage1EnglishAnswer} ${values.translationUnavailable}`;
    stage2Milliseconds = error.apiMilliseconds || 0;
    stage2Retries = error.retries || 0;
  }
  const stage2Seconds = secondsFromMilliseconds(stage2Milliseconds);
  const totalSeconds = secondsFromMilliseconds(stage1Result.apiMilliseconds + stage2Milliseconds);

  return {
    stage1EnglishAnswer,
    finalDarijaAnswer,
    emergency: false,
    stage1Seconds,
    stage2Seconds,
    totalSeconds,
    stage1Retries: stage1Result.retries,
    stage2Retries,
    historyContent: finalDarijaAnswer,
    historyLlmContent: stage1EnglishAnswer,
  };
}

function followUpFor(question) {
  const isArabicScript = question.script.toLocaleLowerCase().includes('arabic script');
  const isChildFever = /^3[ab]$/i.test(question.number);

  if (isChildFever && isArabicScript) {
    return 'ولدي عندو 4 سنين، ما عندوش التفاح و كياكل و كيشرب مزيان، ما عندو حتى مرض آخر';
  }
  if (isChildFever) {
    return 'wldi 3ndo 4 snin, ma3ndouch tfa7 w kayakol w kaycherb mzyan, ma3ndou 7ta mard akhor';
  }
  if (isArabicScript) {
    return 'أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا';
  }
  return 'ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa';
}

function apiHistory(messages) {
  return messages.slice(-10).map((message) => ({
    role: message.role,
    content: message.llmContent ?? message.content,
  }));
}

function gaveAdviceDirectly(englishAnswer) {
  const sentences = String(englishAnswer || '').split(/(?<=[.!?])\s+|\r?\n+/u);
  const advicePattern = /\b(?:rest|drink|take|avoid|continue|monitor|check your|see a doctor|contact a doctor|seek medical|keep taking|reduce|exercise|eat|do not stop|don't stop)\b/i;
  const containsDeclarativeAdvice = sentences.some(
    (sentence) => !/[?؟]/u.test(sentence) && advicePattern.test(sentence)
  );
  return !/[?؟]/u.test(englishAnswer || '') || containsDeclarativeAdvice;
}

async function evaluateQuestion(question, apiKey, values) {
  const initialMessages = [{ role: 'assistant', content: values.welcomeMessage }];
  const turn1UserMessage = { role: 'user', content: question.question };
  const turn1Messages = [...initialMessages, turn1UserMessage];
  const turn1 = await evaluateTurn(
    question.question,
    apiHistory(turn1Messages),
    `${question.number} turn 1`,
    apiKey,
    values
  );

  const turn1GaveAdviceDirectly = !turn1.emergency && gaveAdviceDirectly(turn1.stage1EnglishAnswer);
  turn1.note = turn1GaveAdviceDirectly ? 'turn 1 gave advice directly' : null;

  const turn1AssistantMessage = {
    role: 'assistant',
    content: turn1.historyContent,
    ...(turn1.historyLlmContent === null ? {} : { llmContent: turn1.historyLlmContent }),
  };
  const followUpReply = followUpFor(question);
  const turn2UserMessage = { role: 'user', content: followUpReply };
  const turn2Messages = [
    ...turn1Messages,
    turn1AssistantMessage,
    turn2UserMessage,
  ];
  const turn2 = await evaluateTurn(
    followUpReply,
    apiHistory(turn2Messages),
    `${question.number} turn 2`,
    apiKey,
    values
  );

  delete turn1.historyContent;
  delete turn1.historyLlmContent;
  delete turn2.historyContent;
  delete turn2.historyLlmContent;

  return {
    ...question,
    followUpReply,
    turn1,
    turn2,
    medicalModel: values.GROQ_MODEL,
    translationModel: values.TRANSLATION_MODEL,
    date: localDate(),
  };
}

function resetDetails(waitMs) {
  const resetAt = new Date(Date.now() + waitMs);
  const resetLocal = resetAt.toLocaleString('en-GB', {
    timeZone: 'Europe/London', dateStyle: 'short', timeStyle: 'short',
  });
  return { resetAt, resetLocal };
}

function scheduleQuotaReminder(resetAt) {
  // Optional Windows reminder: skipped when the helper script is not present or not on Windows.
  if (process.platform !== 'win32' || !fs.existsSync(TOAST_SCRIPT_PATH)) return null;
  const scheduledAt = new Date(Math.ceil(resetAt.getTime() / 60_000) * 60_000);
  const pad = (value) => String(value).padStart(2, '0');
  // schtasks parses /SD using the current Windows locale (dd/MM/yyyy on this UK system).
  const date = `${pad(scheduledAt.getDate())}/${pad(scheduledAt.getMonth() + 1)}/${scheduledAt.getFullYear()}`;
  const time = `${pad(scheduledAt.getHours())}:${pad(scheduledAt.getMinutes())}`;
  const taskCommand = `powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "${TOAST_SCRIPT_PATH}"`;
  spawnSync('schtasks.exe', ['/Delete', '/TN', TASK_NAME, '/F'], { encoding: 'utf8', windowsHide: true });
  const created = spawnSync('schtasks.exe', [
    '/Create', '/TN', TASK_NAME, '/TR', taskCommand, '/SC', 'ONCE',
    '/SD', date, '/ST', time, '/IT', '/F',
  ], { encoding: 'utf8', windowsHide: true });
  if (created.status !== 0) {
    throw new Error(`Could not schedule the Windows reminder: ${(created.stderr || created.stdout || '').trim()}`);
  }
  return scheduledAt;
}

function saveQuotaStatus(results, questions, waitMs) {
  const { resetAt, resetLocal } = resetDetails(waitMs);
  const scheduledAt = scheduleQuotaReminder(resetAt);
  const status = {
    done: results.length,
    total: questions.length,
    nextQuestion: questions[results.length]?.number ?? null,
    resetTime: resetAt.toISOString(),
    resetTimeLocal: resetLocal,
    reminderScheduled: Boolean(scheduledAt),
    reminderTime: scheduledAt ? scheduledAt.toISOString() : null,
    taskName: TASK_NAME,
  };
  atomicWrite(QUOTA_STATUS_PATH, `${JSON.stringify(status, null, 2)}\n`);
  return status;
}

async function probeQuota(apiKey, values, results, questions) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: values.GROQ_MODEL,
      max_tokens: 1,
      messages: [{ role: 'user', content: 'Hi' }],
    }),
  });
  if (response.status !== 429) {
    await response.text();
    if (!response.ok) throw new Error(`Quota probe returned HTTP ${response.status}.`);
    console.log('Groq quota is available. You can resume straight away; no reminder was scheduled.');
    return;
  }
  const waitMs = quotaWaitMilliseconds(response.headers);
  await response.text();
  const status = saveQuotaStatus(results, questions, waitMs);
  console.log(`Groq quota is still used up. Quota resets at ${status.resetTimeLocal}. Reminder scheduled as "${TASK_NAME}".`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--check-quota') || args.length > 1) {
    fail(`Unknown argument(s): ${args.join(' ')}. Supported flag: --check-quota`);
  }

  const questions = parseQuestions();
  const apiKey = parseEnvFile();
  const values = extractAppValues();
  const results = loadExistingResults(questions, values);

  if (args.includes('--check-quota')) {
    await probeQuota(apiKey, values, results, questions);
    return;
  }

  console.log(`RQ1 questions complete: ${results.length}/${questions.length}; pending: ${questions.length - results.length}.`);
  let processedThisRun = 0;
  for (let index = results.length; index < questions.length; index += 1) {
    if (processedThisRun > 0) await sleep(REQUEST_DELAY_MS);
    let result;
    try {
      result = await evaluateQuestion(questions[index], apiKey, values);
    } catch (error) {
      if (error.name !== 'QuotaExhaustedError') throw error;
      saveProgress(results, values);
      const status = saveQuotaStatus(results, questions, error.waitMs);
      console.log(`Groq quota used up. ${status.done}/${status.total} done. Quota resets at ${status.resetTimeLocal}. Resume with: node evaluation/darija_quality_eval.js`);
      return;
    }
    results.push(result);
    processedThisRun += 1;
    saveProgress(results, values);
    console.log(`Completed ${results.length}/${questions.length} (question ${result.number}).`);
  }

  saveProgress(results, values);
  console.log(`JSON: ${path.relative(ROOT, JSON_PATH)}`);
  console.log(`Markdown: ${path.relative(ROOT, MARKDOWN_PATH)}`);
}

main().catch((error) => {
  console.error(`Darija quality evaluation failed: ${error.message}`);
  process.exitCode = 1;
});
