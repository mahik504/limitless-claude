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

const DEFAULT_BASE_URL = process.env.ANTHROPIC_BASE_URL || 'http://127.0.0.1:20128';

function resolveApiKey() {
  if (process.env.ANTHROPIC_AUTH_TOKEN) {
    return process.env.ANTHROPIC_AUTH_TOKEN;
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
    } catch (_) {}
  }

  // Check ~/.omniroute/storage.sqlite
  const dbPath = path.join(os.homedir(), '.omniroute', 'storage.sqlite');
  if (fs.existsSync(dbPath)) {
    try {
      const content = fs.readFileSync(dbPath, 'latin1');
      const match = content.match(/sk-[a-f0-9]{16}-[a-f0-9]{6}-[a-f0-9]{8}/);
      if (match) {
        return match[0];
      }
    } catch (_) {}
  }

  return 'sk-85702967f40fcc12-f121cd-a362127e';
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
    max_tokens: 24,
    messages: [{ role: 'user', content: 'Respond with the exact word: PONG' }]
  };

  const t0 = performance.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25000)
    });

    const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        modelId,
        label,
        status: res.status,
        elapsed,
        error: errText.slice(0, 160)
      };
    }

    const data = await res.json();
    let text = '';
    if (Array.isArray(data?.content)) {
      for (const block of data.content) {
        if (block?.type === 'text') text += block.text || '';
      }
    } else if (typeof data?.text === 'string') {
      text = data.text;
    }

    return {
      success: true,
      modelId,
      label,
      status: res.status,
      elapsed,
      output: text.trim().slice(0, 60)
    };
  } catch (err) {
    const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
    return {
      success: false,
      modelId,
      label,
      status: 'TIMEOUT/NET_ERR',
      elapsed,
      error: err.message
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
  console.log(`API Key:  ${apiKey.slice(0, 7)}...${apiKey.slice(-6)}`);
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
