#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  atomicWrite,
  buildMarkdown,
  evaluateTurn,
  extractAppValues,
  localDate,
  parseEnvFile,
} = require('./english_quality_eval');

const RESULTS_DIR = path.join(__dirname, 'results');
const ARGS = process.argv.slice(2);
const UNKNOWN_ARGS = ARGS.filter((arg) => arg !== '--e13-after-fix');
if (UNKNOWN_ARGS.length > 0) {
  throw new Error(`Unknown argument(s): ${UNKNOWN_ARGS.join(', ')}.`);
}
const E13_AFTER_FIX = ARGS.includes('--e13-after-fix');
const JSON_PATH = path.join(RESULTS_DIR, E13_AFTER_FIX ? 'english_followup_after_fix.json' : 'english_followup.json');
const MARKDOWN_PATH = path.join(RESULTS_DIR, E13_AFTER_FIX ? 'english_followup_after_fix.md' : 'english_followup.md');
const QUOTA_STATUS_PATH = path.join(RESULTS_DIR, E13_AFTER_FIX ? 'english_followup_after_fix_quota_status.json' : 'english_followup_quota_status.json');

const CONVERSATIONS = [
  {
    number: 'E13',
    topic: 'High blood pressure',
    question: "I'm 55 and my blood pressure has been high for the last month",
    replies: [
      "My readings at home have been around 150/95. My father has high blood pressure. I don't have headaches, dizziness or chest pain.",
      "I'm not on any medication and I don't have any other conditions.",
    ],
  },
  {
    number: 'E14',
    topic: 'Type 2 diabetes',
    question: "I'm 50 and I was diagnosed with type 2 diabetes two years ago",
    replies: [
      "I don't have any pain or new symptoms. I manage it with diet only, and my blood sugar is usually between 7 and 10 mmol/L. I just want advice on how to manage it better.",
      'I have no other conditions and no allergies.',
    ],
  },
];
const SELECTED_CONVERSATIONS = E13_AFTER_FIX
  ? CONVERSATIONS.filter((item) => item.number === 'E13')
  : CONVERSATIONS;

function saveResults(results, values) {
  atomicWrite(JSON_PATH, `${JSON.stringify(results, null, 2)}\n`);
  atomicWrite(MARKDOWN_PATH, buildMarkdown(results, values));
}

function loadResults(values) {
  if (!fs.existsSync(JSON_PATH)) return [];
  const results = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  if (!Array.isArray(results) || results.length > SELECTED_CONVERSATIONS.length) {
    throw new Error('Existing English follow-up results have an invalid length.');
  }
  results.forEach((result, index) => {
    const expected = SELECTED_CONVERSATIONS[index];
    if (result?.number !== expected.number || result?.topic !== expected.topic ||
        result?.question !== expected.question || result?.medicalModel !== values.GROQ_MODEL ||
        !Array.isArray(result?.turns) || result.turns.length < 1 || result.turns.length > 3) {
      throw new Error(`Existing follow-up result ${index + 1} does not match this evaluation.`);
    }
  });
  return results;
}

function saveQuotaStatus(results, waitMs) {
  const resetAt = new Date(Date.now() + waitMs);
  const status = {
    done: results.length,
    total: SELECTED_CONVERSATIONS.length,
    nextQuestion: SELECTED_CONVERSATIONS[results.length]?.number ?? null,
    resetTime: resetAt.toISOString(),
    resetTimeLocal: resetAt.toLocaleString('en-GB', {
      timeZone: 'Europe/London', dateStyle: 'short', timeStyle: 'short',
    }),
  };
  atomicWrite(QUOTA_STATUS_PATH, `${JSON.stringify(status, null, 2)}\n`);
  return status;
}

async function evaluateConversation(item, apiKey, values) {
  const conversation = [{ role: 'assistant', content: values.welcomeMessage }];
  const turns = [];
  const userMessages = [item.question, ...item.replies];

  for (let index = 0; index < userMessages.length; index += 1) {
    const userMessage = userMessages[index];
    conversation.push({ role: 'user', content: userMessage });
    const turn = await evaluateTurn(
      userMessage,
      conversation,
      `${item.number} follow-up turn ${index + 1}`,
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
    number: item.number,
    topic: item.topic,
    question: item.question,
    turns,
    numberOfTurns: turns.length,
    finalAnswer: finalTurn.reply,
    finalStillAsking: finalTurn.askedQuestion,
    reachedAdvice: !finalTurn.askedQuestion && !finalTurn.emergency,
    emergency: turns.some((turn) => turn.emergency),
    medicalModel: values.GROQ_MODEL,
    language: 'en',
    temperature: 0.7,
    maxTokens: 1024,
    date: localDate(),
  };
}

async function main() {
  const apiKey = parseEnvFile();
  const values = extractAppValues();
  const results = loadResults(values);
  console.log(`English follow-up questions complete: ${results.length}/${SELECTED_CONVERSATIONS.length}.`);

  for (let index = results.length; index < SELECTED_CONVERSATIONS.length; index += 1) {
    let result;
    try {
      result = await evaluateConversation(SELECTED_CONVERSATIONS[index], apiKey, values);
    } catch (error) {
      if (error.name !== 'QuotaExhaustedError') throw error;
      saveResults(results, values);
      const status = saveQuotaStatus(results, error.waitMs);
      console.log(`Groq daily quota reached. ${status.done}/${status.total} complete. Reset: ${status.resetTimeLocal}. Resume with: node evaluation/english_followup_eval.js${E13_AFTER_FIX ? ' --e13-after-fix' : ''}`);
      return;
    }
    results.push(result);
    saveResults(results, values);
    console.log(`Completed ${result.number} in ${result.numberOfTurns} turn${result.numberOfTurns === 1 ? '' : 's'}; reached advice: ${result.reachedAdvice ? 'yes' : 'no'}.`);
  }

  if (fs.existsSync(QUOTA_STATUS_PATH)) fs.unlinkSync(QUOTA_STATUS_PATH);
  saveResults(results, values);
  console.log(`JSON: ${path.relative(path.resolve(__dirname, '..'), JSON_PATH)}`);
  console.log(`Markdown: ${path.relative(path.resolve(__dirname, '..'), MARKDOWN_PATH)}`);
}

main().catch((error) => {
  console.error(`English follow-up evaluation failed: ${error.message}`);
  process.exitCode = 1;
});
