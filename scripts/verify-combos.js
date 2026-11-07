#!/usr/bin/env node
/**
 * Limitless Claude - Live Combo & Model Alias Verifier
 * 
 * Verifies that all 4 tiers (Haiku, Sonnet, Opus, Fable) and their model aliases
 * respond correctly with zero rate limits via OmniRoute's Anthropic Messages endpoint
 * (POST /v1/messages).
 *
 * Usage:
 *   node scripts/verify-combos.js [--key <api-key>] [--base-url <url>]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { getDatabase } = require('../src/omniroute/db');
const { findTargetApiKey } = require('../src/omniroute/permissions');
const { redactSecret } = require('../src/utils/redact');

const DEFAULT_BASE_URL = process.env.ANTHROPIC_BASE_URL || 'http://127.0.0.1:20128';

function resolveApiKey() {
  if (process.env.ANTHROPIC_AUTH_TOKEN) {
    return process.env.ANTHROPIC_AUTH_TOKEN;
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }

  // Check command line arguments
  const keyIdx = process.argv.indexOf('--key');
  if (keyIdx !== -1 && process.argv[keyIdx + 1]) {
    return process.argv[keyIdx + 1];
  }

  // Check ~/.claude/settings.json
  const claudeSettingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  if (fs.existsSync(claudeSettingsPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(claudeSettingsPath, 'utf8'));
      if (parsed?.env?.ANTHROPIC_AUTH_TOKEN) {
        return parsed.env.ANTHROPIC_AUTH_TOKEN;
      }
      if (parsed?.ANTHROPIC_API_KEY) {
        return parsed.ANTHROPIC_API_KEY;
      }
    } catch (_) {}
  }

  // Query authorized key from OmniRoute SQLite database
  try {
    const db = getDatabase();
    const keyRow = findTargetApiKey(db);
    if (keyRow && keyRow.key) {
      return keyRow.key;
    }
  } catch (_) {}

  return null;
}

async function verifyModel(baseUrl, apiKey, modelId, label) {
  const url = `${baseUrl.replace(/\/+$/, '')}/v1/messages`;
  const headers = {
    'x-api-key': apiKey,
    'authorization': `Bearer ${apiKey}`,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json'
  };

  const payload = {
    model: modelId,
    max_tokens: 32,
    messages: [
      { role: 'user', content: 'Reply with the single word PONG and nothing else.' }
    ]
  };

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);

    if (res.ok) {
      const data = await res.json();
      let text = '';
      if (data.content && Array.isArray(data.content)) {
        text = data.content.map(c => c.text || '').join('');
      } else if (typeof data.content === 'string') {
        text = data.content;
      }
      return {
        success: true,
        status: res.status,
        elapsed,
        output: (text || 'OK').trim().slice(0, 50).replace(/\r?\n/g, ' ')
      };
    } else {
      const errText = await res.text();
      let errMsg = errText;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.error?.message || errJson.message || errText;
      } catch (_) {}
      return {
        success: false,
        status: res.status,
        elapsed,
        error: redactSecret(errMsg.slice(0, 100))
      };
    }
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    return {
      success: false,
      status: 'TIMEOUT/ERR',
      elapsed,
      error: redactSecret(err.message)
    };
  }
}

async function main() {
  const apiKey = resolveApiKey();
  const urlArgIdx = process.argv.indexOf('--base-url');
  const baseUrl = urlArgIdx !== -1 && process.argv[urlArgIdx + 1] ? process.argv[urlArgIdx + 1] : DEFAULT_BASE_URL;

  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║           LIMITLESS CLAUDE - LIVE COMBO VERIFICATION              ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log(`Gateway:  ${baseUrl}`);

  if (!apiKey) {
    console.error('\x1b[31m[ERROR] No authorized OmniRoute API key found.\x1b[0m');
    console.error('Please configure an API key via ~/.claude/settings.json, pass --key <key>, or run `limitless setup`.');
    process.exit(1);
  }

  const maskedKey = apiKey.length > 10 ? `${apiKey.slice(0, 6)}...[redacted]` : '[redacted]';
  console.log(`API Key:  ${maskedKey}`);
  console.log('');

  const tests = [
    { model: 'claude-haiku-4-5', label: 'Haiku Alias (Fast Syntax)' },
    { model: 'claude-sonnet-5', label: 'Sonnet Alias (Reasoning & Architecture)' },
    { model: 'claude-opus-4-8', label: 'Opus Alias (Coding Reservoir)' },
    { model: 'claude-fable-5-1', label: 'Fable Alias (High-Context Fleet)' },
    { model: 'combo/limitless-haiku', label: 'Direct Combo: limitless-haiku' },
    { model: 'combo/limitless-sonnet', label: 'Direct Combo: limitless-sonnet' },
    { model: 'combo/limitless-opus', label: 'Direct Combo: limitless-opus' },
    { model: 'combo/limitless-fable', label: 'Direct Combo: limitless-fable' }
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    process.stdout.write(`Testing [${t.label}] (${t.model})... `);
    const result = await verifyModel(baseUrl, apiKey, t.model, t.label);
    if (result.success) {
      passed++;
      console.log(`\x1b[32m✔ HTTP ${result.status} (${result.elapsed}s)\x1b[0m -> "${result.output}"`);
    } else {
      failed++;
      console.log(`\x1b[31m✖ [${result.status}] (${result.elapsed}s)\x1b[0m -> ${result.error}`);
    }
  }

  console.log('');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log(`Results: ${passed}/${tests.length} passed (${failed} failed)`);
  if (failed === 0) {
    console.log('\x1b[32m✔ All Limitless Claude tiers are healthy, mapped, and responding live!\x1b[0m');
    process.exit(0);
  } else {
    console.log('\x1b[33m⚠ Some targets failed. Check if OmniRoute is running or provider quotas.\x1b[0m');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
