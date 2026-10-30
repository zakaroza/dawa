#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadAppEmergency } = require('./negation_check');

const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, 'app', '.env');
const CHATBOT_PATH = path.join(ROOT, 'app', 'src', 'screens', 'ChatbotScreen.js');
const STRINGS_PATH = path.join(ROOT, 'app', 'src', 'i18n', 'strings.js');
const RESULTS_DIR = path.join(__dirname, 'results');
const JSON_PATH = path.join(RESULTS_DIR, 'english_answers.json');
const MARKDOWN_PATH = path.join(RESULTS_DIR, 'english_answers.md');
const QUOTA_STATUS_PATH = path.join(RESULTS_DIR, 'english_quota_status.json');
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const REQUEST_DELAY_MS = 300;
const MAX_429_RETRIES = 5;
const REQUEST_TIMEOUT_MS = 15_000;

const ADULT_FOLLOW_UP = "The pain or symptoms are moderate, and I don't have any other conditions or take any medication.";
const CHILD_FOLLOW_UP = "He's eating and drinking normally, there's no rash and he doesn't have any other conditions.";
const THIRD_TURN_FOLLOW_UP = "I'm not pregnant, I have no allergies and I don't take any medication.";

const QUESTIONS = [
  { number: 'E1', topic: 'Headache', question: "I'm 30 and I've had a really bad headache for two days" },
  { number: 'E2', topic: 'Fever (adult)', question: "I'm 35 and I've had a temperature of 39 for three days" },
  { number: 'E3', topic: 'Fever (child)', question: "My son is 4 and he's had a temperature of 38 since yesterday" },
  { number: 'E4', topic: 'Cough', question: "I'm 28 and I've been coughing a lot since this morning" },
  { number: 'E5', topic: 'Sore throat', question: "I'm 25 and I've had a bit of a sore throat for four days" },
  { number: 'E6', topic: 'Stomach ache', question: "I'm 30 and my stomach started hurting a lot after lunch today, about two hours ago" },
  { number: 'E7', topic: 'Diarrhoea and vomiting', question: "I'm 40 and I've been vomiting and had diarrhoea for the last two hours" },
  { number: 'E8', topic: 'Back pain', question: "I'm 45 and I woke up this morning with really bad back pain" },
  { number: 'E9', topic: 'Urinary infection', question: "I'm a 32-year-old woman and it's been burning when I pee since yesterday" },
  { number: 'E10', topic: 'Heartburn', question: "I'm 38 and I've had a burning feeling in my chest since breakfast this morning" },
  { number: 'E11', topic: 'Constipation', question: "I'm 50, I've been constipated for four days and my stomach feels hard" },
  { number: 'E12', topic: 'Cold and flu', question: "I'm 27 and I've had a cold for a week" },
  { number: 'E13', topic: 'High blood pressure', question: "I'm 55 and my blood pressure has been high for the last month" },
  { number: 'E14', topic: 'Type 2 diabetes', question: "I'm 50 and I was diagnosed with type 2 diabetes two years ago" },
  { number: 'E15', topic: 'Anxiety and stress', question: "I'm 24 and I've been feeling really anxious and stressed for the last three weeks" },
  { number: 'E16', topic: 'Insomnia', question: "I'm 35 and I haven't been able to sleep properly for two weeks" },
  { number: 'E17', topic: 'Hay fever / allergy', question: "I'm 30, I'm allergic to dust and I've been coughing a lot for the past five days" },
  { number: 'E18', topic: 'Minor burn', question: "I'm 29 and I burnt my hand on the oven about ten minutes ago" },
  { number: 'E19', topic: 'Ear pain', question: "I'm 33 and my ear has been hurting a lot for two days" },
  { number: 'E20', topic: 'Muscle cramps', question: "I'm 26, I was running about an hour ago and now I've got a cramp in my thigh" },
];

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
  const values = Object.create(null);
  for (const name of ['SYSTEM_PROMPT', 'MEDICAL_KNOWLEDGE_BASE', 'GROQ_MODEL', 'EMERGENCY_KEYWORDS']) {
    values[name] = evaluateExpression(
      findInitializer(source, name, 'app/src/screens/ChatbotScreen.js'),
      name
    );
  }
  const functionMatch = source.match(/function\s+normalizeEmergencyText\s*\([^)]*\)\s*\{[\s\S]*?^\}/m);
  if (!functionMatch) fail('Could not extract normalizeEmergencyText from ChatbotScreen.js.');
  values.normalizeEmergencyText = evaluateExpression(functionMatch[0], 'normalizeEmergencyText');
  values.checkEmergency = loadAppEmergency().checkEmergency;

  const stringsSource = readText(STRINGS_PATH, 'app/src/i18n/strings.js');
  const strings = evaluateExpression(
    findInitializer(stringsSource, 'strings', 'app/src/i18n/strings.js'),
    'strings'
  );
  values.welcomeMessage = strings?.en?.welcomeMessage;
  values.emergencyMessage = strings?.en?.emergencyMessage;

  if (typeof values.SYSTEM_PROMPT !== 'string' ||
      typeof values.MEDICAL_KNOWLEDGE_BASE !== 'string' ||
      typeof values.GROQ_MODEL !== 'string' ||
      !Array.isArray(values.EMERGENCY_KEYWORDS) ||
      typeof values.normalizeEmergencyText !== 'function' ||
      typeof values.checkEmergency !== 'function' ||
      typeof values.welcomeMessage !== 'string' ||
      typeof values.emergencyMessage !== 'string') {
    fail('One or more app values could not be extracted correctly.');
  }
  return values;
}

function atomicWrite(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  fs.writeFileSync(temporaryPath, content, 'utf8');
  fs.renameSync(temporaryPath, filePath);
}

function localDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
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
  return Math.ceil(Buffer.byteLength(prompt, 'utf8') / 2) + (Number(body.max_tokens) || 0);
}

async function paceForTokenWindow(body, stageLabel) {
  if (!tokenRateState) return;
  const waitMs = tokenRateState.resetAt - Date.now();
  if (waitMs <= 0) {
    tokenRateState = null;
    return;
  }
  if (tokenRateState.remaining >= estimatedRequestTokens(body)) return;
  console.log(`Token allowance is low before ${stageLabel}; waiting ${Math.ceil(waitMs / 1000)}s for reset.`);
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      updateTokenRateState(response.headers);
    } catch (error) {
      apiMilliseconds += Date.now() - requestStartedAt;
      const requestError = new Error(
        error.name === 'AbortError'
          ? `${stageLabel} timed out after 15 seconds.`
          : `${stageLabel} network request failed: ${error.message}`
      );
      requestError.name = error.name === 'AbortError' ? 'AbortError' : 'NetworkError';
      requestError.apiMilliseconds = apiMilliseconds;
      requestError.retries = retryCount;
      throw requestError;
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status === 429) {
      const waitMs = quotaWaitMilliseconds(response.headers);
      tokenRateState = null;
      const responseText = await response.text();
      let message = '';
      try { message = JSON.parse(responseText)?.error?.message || ''; } catch {}
      if (message) console.log(`Groq 429 during ${stageLabel}: ${message}`);
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
        throw new Error(`${stageLabel} received HTTP 429 after ${MAX_429_RETRIES} retries.`);
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
      throw new Error(`${stageLabel} returned HTTP ${response.status} with a non-JSON response.`);
    }
    apiMilliseconds += Date.now() - requestStartedAt;
    if (!response.ok || json.error) {
      const detail = json?.error?.message || response.statusText || 'Unknown API error';
      throw new Error(`${stageLabel} returned HTTP ${response.status}: ${detail}`);
    }
    const text = json?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text) {
      throw new Error(`${stageLabel} returned an unexpected response without assistant text.`);
    }
    return { text, apiMilliseconds, retries: retryCount };
  }
  throw new Error(`${stageLabel} failed unexpectedly.`);
}

function secondsFromMilliseconds(milliseconds) {
  return Math.round((milliseconds / 1000) * 10) / 10;
}

function apiHistory(messages) {
  return messages.slice(-10).map((message) => ({ role: message.role, content: message.content }));
}

function asksQuestion(answer) {
  const text = String(answer || '').trim();
  if (/[?？]/u.test(text)) return true;
  return /(?:^|[.!]\s+)(?:could|can|would|do|does|did|are|is|was|were|have|has|please tell|please clarify)\b[^.!]*$/i.test(text);
}

async function evaluateTurn(userMessage, history, label, apiKey, values) {
  const keywordEmergency = values.checkEmergency(userMessage, 'en').isEmergency;
  if (keywordEmergency) {
    return {
      userMessage,
      reply: values.emergencyMessage,
      askedQuestion: false,
      replyExactlyEmergency: false,
      emergency: true,
      emergencySource: 'keyword',
      timeSeconds: 0,
      retries: 0,
    };
  }

  const result = await requestCompletion(apiKey, {
    model: values.GROQ_MODEL,
    max_tokens: 1024,
    temperature: 0.7,
    messages: [
      { role: 'system', content: `${values.SYSTEM_PROMPT}\n\n${values.MEDICAL_KNOWLEDGE_BASE}` },
      ...apiHistory(history),
    ],
  }, label);
  const replyExactlyEmergency = result.text.trim() === 'EMERGENCY';
  return {
    userMessage,
    reply: result.text,
    askedQuestion: replyExactlyEmergency ? false : asksQuestion(result.text),
    replyExactlyEmergency,
    emergency: replyExactlyEmergency,
    emergencySource: replyExactlyEmergency ? 'llm' : null,
    timeSeconds: secondsFromMilliseconds(result.apiMilliseconds),
    retries: result.retries,
  };
}

async function evaluateQuestion(question, apiKey, values) {
  const conversation = [{ role: 'assistant', content: values.welcomeMessage }];
  const turns = [];
  const userMessages = [
    question.question,
    question.number === 'E3' ? CHILD_FOLLOW_UP : ADULT_FOLLOW_UP,
    THIRD_TURN_FOLLOW_UP,
  ];

  for (let index = 0; index < userMessages.length; index += 1) {
    const userMessage = userMessages[index];
    conversation.push({ role: 'user', content: userMessage });
    const turn = await evaluateTurn(
      userMessage,
      conversation,
      `${question.number} turn ${index + 1}`,
      apiKey,
      values
    );
    turn.turnNumber = index + 1;
    turns.push(turn);
    conversation.push({
      role: 'assistant',
      content: turn.emergency ? values.emergencyMessage : turn.reply,
    });
    if (turn.emergency || !turn.askedQuestion) break;
  }

  const finalTurn = turns[turns.length - 1];
  return {
    ...question,
    turns,
    numberOfTurns: turns.length,
    finalAnswer: finalTurn.reply,
    finalStillAsking: finalTurn.askedQuestion,
    emergency: turns.some((turn) => turn.emergency),
    medicalModel: values.GROQ_MODEL,
    language: 'en',
    temperature: 0.7,
    maxTokens: 1024,
    date: localDate(),
  };
}

function html(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function markdownText(value) {
  return html(value).replace(/\r?\n/g, '<br>');
}

function buildMarkdown(results, values) {
  const lines = [
    '# English Mode Chatbot Answers',
    '',
    `- Date: ${localDate()}`,
    `- Model: \`${values.GROQ_MODEL}\``,
    '- Language: English. No translation call was made.',
    '- Temperature: 0.7. Maximum output tokens: 1,024.',
    '- Times include API request time only. Rate-limit waiting is excluded and retries are reported separately.',
    '- A follow-up was sent only when the preceding reply asked a question. Each conversation stopped after at most three user messages.',
    '',
  ];
  for (const result of results) {
    lines.push(`## ${result.number}. ${html(result.topic)}`, '', `**Question:** ${markdownText(result.question)}`, '');
    for (const turn of result.turns) {
      lines.push(
        `### Turn ${turn.turnNumber}`,
        '',
        `**User:** ${markdownText(turn.userMessage)}`,
        '',
        `**Assistant:** ${markdownText(turn.reply)}`,
        '',
        `Time: ${turn.timeSeconds.toFixed(1)} s`,
        '',
        `Retries: ${turn.retries}`,
        '',
        `Asked another question: ${turn.askedQuestion ? 'yes' : 'no'}`,
        '',
        `Reply was exactly EMERGENCY: ${turn.replyExactlyEmergency ? 'yes' : 'no'}`,
        ''
      );
    }
    lines.push(
      '### RATE THIS ANSWER',
      '',
      markdownText(result.finalAnswer),
      '',
      `User messages: ${result.numberOfTurns}`,
      '',
      `Still asking after final turn: ${result.finalStillAsking ? 'yes' : 'no'}`,
      '',
      `Emergency: ${result.emergency ? 'yes' : 'no'}`,
      ''
    );
  }
  return lines.join('\n');
}

function saveProgress(results, values) {
  atomicWrite(JSON_PATH, `${JSON.stringify(results, null, 2)}\n`);
  atomicWrite(MARKDOWN_PATH, buildMarkdown(results, values));
}

function loadExistingResults(values) {
  if (!fs.existsSync(JSON_PATH)) return [];
  let results;
  try {
    results = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  } catch (error) {
    fail(`Could not parse existing english_answers.json: ${error.message}`);
  }
  if (!Array.isArray(results) || results.length > QUESTIONS.length) {
    fail('Existing English results have an invalid length.');
  }
  results.forEach((result, index) => {
    const question = QUESTIONS[index];
    if (result?.number !== question.number || result?.topic !== question.topic ||
        result?.question !== question.question || result?.medicalModel !== values.GROQ_MODEL ||
        !Array.isArray(result?.turns) || result.turns.length < 1 || result.turns.length > 3) {
      fail(`Existing result ${index + 1} does not match this evaluation. Move it to start over.`);
    }
  });
  return results;
}

function saveQuotaStatus(results, waitMs) {
  const resetAt = new Date(Date.now() + waitMs);
  const status = {
    done: results.length,
    total: QUESTIONS.length,
    nextQuestion: QUESTIONS[results.length]?.number ?? null,
    resetTime: resetAt.toISOString(),
    resetTimeLocal: resetAt.toLocaleString('en-GB', {
      timeZone: 'Europe/London', dateStyle: 'short', timeStyle: 'short',
    }),
  };
  atomicWrite(QUOTA_STATUS_PATH, `${JSON.stringify(status, null, 2)}\n`);
  return status;
}

async function main() {
  const apiKey = parseEnvFile();
  const values = extractAppValues();
  const results = loadExistingResults(values);
  console.log(`English questions complete: ${results.length}/${QUESTIONS.length}; pending: ${QUESTIONS.length - results.length}.`);

  let processedThisRun = 0;
  for (let index = results.length; index < QUESTIONS.length; index += 1) {
    if (processedThisRun > 0) await sleep(REQUEST_DELAY_MS);
    let result;
    try {
      result = await evaluateQuestion(QUESTIONS[index], apiKey, values);
    } catch (error) {
      if (error.name !== 'QuotaExhaustedError') throw error;
      saveProgress(results, values);
      const status = saveQuotaStatus(results, error.waitMs);
      console.log(`Groq daily quota reached. ${status.done}/${status.total} complete. Reset: ${status.resetTimeLocal}. Resume with: node evaluation/english_quality_eval.js`);
      return;
    }
    results.push(result);
    processedThisRun += 1;
    saveProgress(results, values);
    console.log(`Completed ${results.length}/${QUESTIONS.length} (${result.number}, ${result.numberOfTurns} turn${result.numberOfTurns === 1 ? '' : 's'}).`);
  }

  if (fs.existsSync(QUOTA_STATUS_PATH)) fs.unlinkSync(QUOTA_STATUS_PATH);
  saveProgress(results, values);
  console.log(`JSON: ${path.relative(ROOT, JSON_PATH)}`);
  console.log(`Markdown: ${path.relative(ROOT, MARKDOWN_PATH)}`);
}

module.exports = {
  atomicWrite,
  buildMarkdown,
  evaluateTurn,
  extractAppValues,
  localDate,
  parseEnvFile,
};

if (require.main === module) {
  main().catch((error) => {
    console.error(`English quality evaluation failed: ${error.message}`);
    process.exitCode = 1;
  });
}
