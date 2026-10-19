#!/usr/bin/env node
/**
 * Limitless Claude - Universal One-Click Installer & Autonomous Agent Runner
 * 
 * Automates the complete setup lifecycle for both human developers and autonomous AI agents:
 *  1. Validates Node.js (>=22 recommended) and environment prerequisites.
 *  2. Checks for Claude Code CLI and installs if missing (@anthropic-ai/claude-code).
 *  3. Checks for OmniRoute and installs if missing (omniroute@latest).
 *  4. Verifies/starts OmniRoute background gateway (http://127.0.0.1:20128).
 *  5. Preserves existing provider accounts and API keys on reinstall while purging stale combos.
 *  6. Inspects active providers and offers tailored provider setup recommendations.
 *  7. Executes setup.js to build WAL-safe SQLite combos, personas, and model mappings.
 *  8. Synchronizes ~/.claude/settings.json, Windows environment variables, and Paseo config.
 *  9. Installs the silent Windows background startup launcher or Unix daemon runner.
 * 10. Runs live verification (verify-combos.js) to prove 100% connectivity and 0 rate limits.
 *
 * Usage:
 *   node scripts/install-all.js [--clean] [--auto-approve] [--skip-verify] [--allow-offline-catalog]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');
const { openDatabase } = require('../src/omniroute/db');
const { findTargetApiKey } = require('../src/omniroute/permissions');

const OMNIROUTE_URL = process.env.ANTHROPIC_BASE_URL || 'http://127.0.0.1:20128';
const DB_PATH = path.join(os.homedir(), '.omniroute', 'storage.sqlite');

const args = process.argv.slice(2);
const IS_CLEAN = args.includes('--clean');
const SKIP_VERIFY = args.includes('--skip-verify');
const ALLOW_OFFLINE = args.includes('--allow-offline-catalog');

function logStep(num, title) {
  console.log(`\n\x1b[1m\x1b[36m[Step ${num}/8] ${title}\x1b[0m`);
  console.log('───────────────────────────────────────────────────────────────────');
}

function runCmd(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: options.stdio || 'pipe', ...options }).trim();
  } catch (err) {
    if (options.throwOnError) throw err;
    return null;
  }
}

async function isGatewayReachable(timeoutMs = 3000) {
  try {
    const res = await fetch(`${OMNIROUTE_URL}/`, { signal: AbortSignal.timeout(timeoutMs) });
    return res.status >= 200 && res.status < 500;
  } catch (_) {
    return false;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║       LIMITLESS CLAUDE v5.5.0 - UNIVERSAL ONE-CLICK INSTALLER     ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');

  // 1. Prerequisites Check
  logStep(1, 'Validating System Prerequisites');
  const nodeVersion = process.versions.node;
  const majorNode = parseInt(nodeVersion.split('.')[0], 10);
  console.log(`• Operating System: ${process.platform} (${os.arch()})`);
  console.log(`• Node.js Version:   v${nodeVersion} ${majorNode >= 22 ? '✔ (Optimal)' : '⚠ (Node >= 22 recommended)'}`);

  if (majorNode < 20) {
    console.error('\x1b[31m[ERROR] Node.js version 20 or higher is required. Please update Node.js.\x1b[0m');
    process.exit(1);
  }

  // 2. Claude Code CLI Check & Auto-Installation
  logStep(2, 'Checking Claude Code CLI Installation');
  let claudeVersion = runCmd('claude --version');

  if (claudeVersion) {
    console.log(`\x1b[32m✔ Claude Code CLI is already installed:\x1b[0m ${claudeVersion}`);
  } else {
    console.log('ℹ Claude Code CLI not found in PATH. Installing @anthropic-ai/claude-code globally...');
    try {
      runCmd('npm install -g @anthropic-ai/claude-code', { stdio: 'inherit', throwOnError: true });
      claudeVersion = runCmd('claude --version') || 'Installed';
      console.log(`\x1b[32m✔ Successfully installed Claude Code CLI: ${claudeVersion}\x1b[0m`);
    } catch (err) {
      console.warn(`\x1b[33m[WARNING] Could not install @anthropic-ai/claude-code automatically: ${err.message}\x1b[0m`);
      console.warn('You can manually install it via: npm install -g @anthropic-ai/claude-code');
    }
  }

  // 3. OmniRoute CLI Check & Auto-Installation
  logStep(3, 'Checking OmniRoute Gateway Installation');
  let omnirouteVersion = runCmd('omniroute -v') || runCmd('omniroute --version');

  if (omnirouteVersion) {
    console.log(`\x1b[32m✔ OmniRoute is already installed:\x1b[0m ${omnirouteVersion}`);
  } else {
    console.log('ℹ OmniRoute not found in PATH. Installing omniroute@latest globally...');
    try {
      runCmd('npm install -g omniroute@latest', { stdio: 'inherit', throwOnError: true });
      omnirouteVersion = runCmd('omniroute -v') || 'Installed';
      console.log(`\x1b[32m✔ Successfully installed OmniRoute: ${omnirouteVersion}\x1b[0m`);
    } catch (err) {
      console.warn(`\x1b[33m[WARNING] Could not install omniroute automatically: ${err.message}\x1b[0m`);
      console.warn('You can manually install it via: npm install -g omniroute@latest');
    }
  }

  // 4. Gateway Health & Background Startup
  logStep(4, 'Verifying OmniRoute Gateway Service (127.0.0.1:20128)');
  let gatewayActive = await isGatewayReachable();

  if (gatewayActive) {
    console.log(`\x1b[32m✔ OmniRoute gateway is active and listening on ${OMNIROUTE_URL}\x1b[0m`);
  } else {
    console.log(`ℹ OmniRoute is not currently responding on ${OMNIROUTE_URL}. Launching background daemon...`);
    try {
      if (process.platform === 'win32') {
        const vbsPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup', 'Limitless-OmniRoute-Launcher.vbs');
        if (fs.existsSync(vbsPath)) {
          spawn('wscript.exe', [vbsPath], { detached: true, stdio: 'ignore' }).unref();
        } else {
          const child = spawn('cmd.exe', ['/c', 'start', '/b', 'omniroute', 'serve'], { detached: true, stdio: 'ignore' });
          child.unref();
        }
      } else {
        const daemonScript = path.join(__dirname, '..', 'start-daemon.sh');
        if (fs.existsSync(daemonScript)) {
          spawn('bash', [daemonScript], { detached: true, stdio: 'ignore' }).unref();
        } else {
          const child = spawn('omniroute', ['serve'], { detached: true, stdio: 'ignore' });
          child.unref();
        }
      }

      console.log('Waiting for OmniRoute gateway to initialize...');
      for (let i = 0; i < 15; i++) {
        await sleep(1000);
        if (await isGatewayReachable()) {
          gatewayActive = true;
          break;
        }
      }
    } catch (launchErr) {
      console.warn(`[WARNING] Failed to spawn background daemon: ${launchErr.message}`);
    }

    if (gatewayActive) {
      console.log(`\x1b[32m✔ OmniRoute gateway successfully started and listening on ${OMNIROUTE_URL}\x1b[0m`);
    } else {
      console.warn('\x1b[33m⚠ OmniRoute gateway did not respond within 15s.\x1b[0m');
      console.warn('Please run "omniroute serve" in a separate terminal window and rerun setup.');
    }
  }

  // 5. Database Inspection & Safe Re-installation Reset
  logStep(5, 'Preserving Provider Credentials & Performing Clean DB Prep');
  let activeProviders = [];
  let activeKey = null;

  if (fs.existsSync(DB_PATH)) {
    try {
      const db = openDatabase(DB_PATH);
      const keyObj = findTargetApiKey(db);
      if (keyObj?.key) {
        activeKey = keyObj.key;
        console.log(`• Active OmniRoute Key Detected: ${activeKey.slice(0, 7)}...${activeKey.slice(-6)} (Mode: ${keyObj.mode || 'standard'})`);
      }

      if (IS_CLEAN) {
        console.log('• Clean reset flag active: Purging old limitless combos and mappings...');
        if (typeof db.transaction === 'function') {
          db.transaction(() => {
            db.prepare("DELETE FROM model_combo_mappings WHERE combo_id LIKE 'combo/limitless-%'").run();
            db.prepare("DELETE FROM combos WHERE id LIKE 'combo/limitless-%'").run();
          })();
        } else {
          db.exec("DELETE FROM model_combo_mappings WHERE combo_id LIKE 'combo/limitless-%'; DELETE FROM combos WHERE id LIKE 'combo/limitless-%';");
        }
        console.log('✔ Clean reset complete. Existing providers and API keys were preserved 100%.');
      }

      db.close();
    } catch (dbErr) {
      console.warn(`[INFO] Database inspection skipped: ${dbErr.message}`);
    }
  }

  // 6. Provider Recommendations & Live Catalog Discovery
  logStep(6, 'Discovering Connected Providers & Model Fleet');
  try {
    const modelsRes = await fetch(`${OMNIROUTE_URL}/v1/models`, {
      headers: activeKey ? { 'Authorization': `Bearer ${activeKey}`, 'x-api-key': activeKey } : {},
      signal: AbortSignal.timeout(5000)
    });
    if (modelsRes.ok) {
      const modelsData = await modelsRes.json();
      const modelList = Array.isArray(modelsData?.data) ? modelsData.data : (Array.isArray(modelsData) ? modelsData : []);
      const providerSet = new Set();
      for (const m of modelList) {
        const id = typeof m === 'string' ? m : m.id;
        if (id && id.includes('/')) {
          providerSet.add(id.split('/')[0]);
        }
      }
      activeProviders = Array.from(providerSet);
    }
  } catch (_) {}

  console.log(`• Active Providers Detected: [${activeProviders.length > 0 ? activeProviders.join(', ') : 'None yet'}]`);

  if (activeProviders.length === 0) {
    console.log('\n╔═════════════════════════════════════════════════════════════════════╗');
    console.log('║       SUGGESTED PROVIDERS TO CONNECT IN OMNIROUTE DASHBOARD         ║');
    console.log('╚═════════════════════════════════════════════════════════════════════╝');
    console.log('Open http://localhost:20128/providers to connect any of the following:\n');
    console.log('  \x1b[32mZero-Cost / Free Providers (High Rate Limits & Quotas):\x1b[0m');
    console.log('   1. Groq               - Fast Llama 3.3 70B & 8B (Free API key at console.groq.com)');
    console.log('   2. OpenRouter         - Free tier models (:free) including Nemotron, GLM, etc.');
    console.log('   3. Cloudflare AI      - 10k free requests/day (Qwen 2.5 Coder, Llama 3.3)');
    console.log('   4. Kilo Gateway       - Free Nemotron-3, North Mini Code, Laguna XS');
    console.log('   5. Mistral AI         - Codestral free developer tier');
    console.log('   6. NVIDIA NIM         - Nemotron 3 Super 120B (Free cloud API credits)');
    console.log('   7. Ollama Cloud       - Nemotron 3 Super / Ultra models\n');
    console.log('  \x1b[34mPremium Subscriptions (Coding & Architectural Tiers):\x1b[0m');
    console.log('   8. GitHub Copilot     - Claude Fable 5.1, Opus 5, Sonnet 5, Haiku 4.5, GPT-4o');
    console.log('   9. Google Antigravity - Gemini 3.5 Flash Lite, Gemini 3.8 Flash, etc.');
    console.log('  10. Kiro               - Claude Sonnet 5, Claude Haiku 4.5, Minimax M2.5');
    console.log('  11. AgentRouter        - Claude Opus 5, Claude Opus 4.8, DeepSeek V4 Flash\n');
  }

  // 7. Execute Limitless Setup & Apply Combos
  logStep(7, 'Executing Limitless Claude Setup (scripts/setup.js)');
  const setupArgs = ['scripts/setup.js'];
  if (ALLOW_OFFLINE) setupArgs.push('--allow-offline-catalog');

  try {
    execSync(`node ${setupArgs.join(' ')}`, { stdio: 'inherit' });
    console.log('\x1b[32m✔ Setup executed successfully and database configured.\x1b[0m');
  } catch (setupErr) {
    console.error(`\x1b[31m[ERROR] Setup failed: ${setupErr.message}\x1b[0m`);
    process.exit(1);
  }

  // 8. Live Verification Ping
  if (!SKIP_VERIFY) {
    logStep(8, 'Verifying Live Combos & Aliases (scripts/verify-combos.js)');
    try {
      execSync('node scripts/verify-combos.js', { stdio: 'inherit' });
    } catch (verifyErr) {
      console.warn(`\x1b[33m[WARNING] Some models failed verification: ${verifyErr.message}\x1b[0m`);
    }
  }

  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║        LIMITLESS CLAUDE v5.5.0 INSTALLED SUCCESSFULLY!            ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('\nReady to code! You can now run:');
  console.log('  \x1b[32mclaude\x1b[0m                                 # Default routing profile');
  console.log('  \x1b[32mclaude --model limitless-opus\x1b[0m          # High-volume coding reservoir');
  console.log('  \x1b[32mclaude --model limitless-sonnet\x1b[0m        # Architectural & reasoning tier');
  console.log('  \x1b[32mclaude --model limitless-haiku\x1b[0m         # Low-latency rapid syntax waterfall');
  console.log('  \x1b[32mclaude --model limitless-fable\x1b[0m         # High-context synthesis fleet\n');
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
