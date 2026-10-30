#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const {
  atomicWrite,
  buildMarkdown,
  evaluateTurn,
  extractAppValues,
  localDate,
  parseEnvFile,
} = require('./english_quality_eval');

const RESULTS_DIR = path.join(__dirname, 'results');
const JSON_PATH = path.join(RESULTS_DIR, 'english_e13_adaptive.json');
const MARKDOWN_PATH = path.join(RESULTS_DIR, 'english_e13_adaptive.md');
const QUOTA_STATUS_PATH = path.join(RESULTS_DIR, 'english_e13_adaptive_quota_status.json');
const MAX_TURNS = 5;

const QUESTION = {
  number: 'E13',
  topic: 'High blood pressure',
  question: "I'm 55 and my blood pressure has been high for the last month",
};

function matchedEmergencyKeyword(text, values) {
  const normalized = values.normalizeEmergencyText(text);
  return values.EMERGENCY_KEYWORDS.find((keyword) =>
    normalized.includes(values.normalizeEmergencyText(keyword))
  ) ?? null;
}

function refreshSummary(result, values) {
  const finalTurn = result.turns[result.turns.length - 1];
  return {
    ...QUESTION,
    turns: result.turns,
    numberOfTurns: result.turns.length,
    finalAnswer: finalTurn?.reply ?? '',
    finalStillAsking: finalTurn?.askedQuestion ?? false,
    reachedAdvice: Boolean(finalTurn && !finalTurn.askedQuestion && !finalTurn.emergency),
    emergency: result.turns.some((turn) => turn.emergency),
    emergencyTrigger: result.turns.find((turn) => turn.emergency)?.emergencyTrigger ?? null,
    medicalModel: values.GROQ_MODEL,
    language: 'en',
    temperature: 0.7,
    maxTokens: 1024,
    date: localDate(),
  };
}

function saveResult(result, values) {
  const complete = refreshSummary(result, values);
  atomicWrite(JSON_PATH, `${JSON.stringify([complete], null, 2)}\n`);
  let markdown = buildMarkdown([complete], values);
  if (complete.emergencyTrigger) {
    markdown += `\n### Emergency trigger\n\nSource: ${complete.emergencyTrigger.source}\n\n`;
    markdown += `Trigger text: ${complete.emergencyTrigger.text}\n\n`;
    if (complete.emergencyTrigger.keyword) {
      markdown += `Matched keyword: ${complete.emergencyTrigger.keyword}\n`;
    }
  }
  atomicWrite(MARKDOWN_PATH, markdown);
  return complete;
}

function loadResult(values) {
  if (!fs.existsSync(JSON_PATH)) return refreshSummary({ turns: [] }, values);
  const parsed = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const result = Array.isArray(parsed) ? parsed[0] : null;
  if (result?.number !== QUESTION.number || result?.question !== QUESTION.question ||
      result?.medicalModel !== values.GROQ_MODEL || !Array.isArray(result?.turns) ||
      result.turns.length > MAX_TURNS) {
    throw new Error('Existing E13 adaptive result does not match this evaluation.');
  }
  return refreshSummary(result, values);
}

function saveQuotaStatus(result, waitMs) {
  const resetAt = new Date(Date.now() + waitMs);
  const status = {
    completedTurns: result.turns.length,
    maximumTurns: MAX_TURNS,
    resetTime: resetAt.toISOString(),
    resetTimeLocal: resetAt.toLocaleString('en-GB', {
      timeZone: 'Europe/London', dateStyle: 'short', timeStyle: 'short',
    }),
  };
  atomicWrite(QUOTA_STATUS_PATH, `${JSON.stringify(status, null, 2)}\n`);
  return status;
}

function rebuildConversation(result, values) {
  const conversation = [{ role: 'assistant', content: values.welcomeMessage }];
  for (const turn of result.turns) {
    conversation.push({ role: 'user', content: turn.userMessage });
    conversation.push({
      role: 'assistant',
      content: turn.emergency ? values.emergencyMessage : turn.reply,
    });
  }
  return conversation;
}

async function main() {
  const apiKey = parseEnvFile();
  const values = extractAppValues();
  let result = loadResult(values);

  if (result.turns.length &&
      (result.emergency || !result.finalStillAsking || result.turns.length >= MAX_TURNS)) {
    console.log(`E13 adaptive conversation is already complete after ${result.numberOfTurns} turns.`);
    return;
  }

  const conversation = rebuildConversation(result, values);
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    while (result.turns.length < MAX_TURNS) {
      const userMessage = result.turns.length === 0
        ? QUESTION.question
        : (await rl.question('Your reply: ')).trim();
      if (!userMessage) throw new Error('A non-empty patient reply is required.');

      conversation.push({ role: 'user', content: userMessage });
      let turn;
      try {
        turn = await evaluateTurn(
          userMessage,
          conversation,
          `E13 adaptive turn ${result.turns.length + 1}`,
          apiKey,
          values
        );
      } catch (error) {
        if (error.name !== 'QuotaExhaustedError') throw error;
        result = saveResult(result, values);
        const status = saveQuotaStatus(result, error.waitMs);
        console.log(`Groq daily quota reached after ${status.completedTurns} turns. Reset: ${status.resetTimeLocal}. Resume with: node evaluation/english_e13_adaptive_eval.js`);
        return;
      }

      turn.turnNumber = result.turns.length + 1;
      if (turn.emergency) {
        const keyword = turn.emergencySource === 'keyword'
          ? matchedEmergencyKeyword(userMessage, values)
          : null;
        turn.emergencyTrigger = {
          source: turn.emergencySource,
          text: turn.emergencySource === 'keyword' ? userMessage : turn.reply,
          keyword,
        };
      }
      result.turns.push(turn);
      conversation.push({
        role: 'assistant',
        content: turn.emergency ? values.emergencyMessage : turn.reply,
      });
      result = saveResult(result, values);

      console.log(`\nAPP REPLY ${turn.turnNumber}:\n${turn.reply}\n`);
      console.log(`Time: ${turn.timeSeconds.toFixed(1)} s; retries: ${turn.retries}`);
      if (turn.emergency) {
        console.log(`Emergency check fired: ${turn.emergencySource}.`);
        if (turn.emergencyTrigger.keyword) {
          console.log(`Matched keyword: ${turn.emergencyTrigger.keyword}`);
        }
        break;
      }
      if (!turn.askedQuestion) break;
    }
  } finally {
    rl.close();
  }

  if (fs.existsSync(QUOTA_STATUS_PATH)) fs.unlinkSync(QUOTA_STATUS_PATH);
  result = saveResult(result, values);
  console.log(`Conversation complete after ${result.numberOfTurns} turn${result.numberOfTurns === 1 ? '' : 's'}; reached advice: ${result.reachedAdvice ? 'yes' : 'no'}.`);
  console.log(`JSON: ${path.relative(path.resolve(__dirname, '..'), JSON_PATH)}`);
  console.log(`Markdown: ${path.relative(path.resolve(__dirname, '..'), MARKDOWN_PATH)}`);
}

main().catch((error) => {
  console.error(`English E13 adaptive evaluation failed: ${error.message}`);
  process.exitCode = 1;
});
