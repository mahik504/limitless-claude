#!/usr/bin/env node
"use strict";

const fs = require("fs");
const {
  COMBO_DEFS,
  MIN_NODE_MAJOR,
  GATEWAY_ORIGIN,
  resolveDbPath,
  claudeSettingsPath,
  findOmnirouteCli,
  openDatabase,
  assertSchema,
  nodeMajor,
  activeProviders,
} = require("./setup");

const results = [];

function record(status, name, detail) {
  results.push({ status, name, detail });
  const suffix = detail ? ` — ${detail}` : "";
  console.log(`${status.padEnd(4)} ${name}${suffix}`);
}

function checkNode() {
  const major = nodeMajor();
  if (major >= MIN_NODE_MAJOR) record("PASS", "Node.js", `v${process.versions.node}`);
  else record("FAIL", "Node.js", `v${process.versions.node} (need ${MIN_NODE_MAJOR}+)`);
}

function checkPackages() {
  try {
    require("node:sqlite");
    record("PASS", "node:sqlite", "built-in driver available");
  } catch (err) {
    record("FAIL", "node:sqlite", err.message);
  }
}

function checkOmnirouteCli() {
  const cli = findOmnirouteCli();
  if (cli) record("PASS", "OmniRoute CLI", cli);
  else record("WARN", "OmniRoute CLI", "not found on PATH");
}

async function checkEndpoint() {
  try {
    const response = await fetch(GATEWAY_ORIGIN, { redirect: "manual", signal: AbortSignal.timeout(4000) });
    if (response.status >= 200 && response.status < 500) {
      record("PASS", "OmniRoute endpoint", `${GATEWAY_ORIGIN} HTTP ${response.status}`);
    } else {
      record("FAIL", "OmniRoute endpoint", `${GATEWAY_ORIGIN} HTTP ${response.status}`);
    }
  } catch (err) {
    record("FAIL", "OmniRoute endpoint", `${GATEWAY_ORIGIN} unreachable (${err.message})`);
  }
}

function checkDatabase() {
  const dbPath = resolveDbPath();
  if (!fs.existsSync(dbPath)) {
    record("FAIL", "Database", `missing: ${dbPath}`);
    return null;
  }
  record("PASS", "Database", dbPath);
  let db;
  try {
    db = openDatabase(dbPath, { readOnly: true });
  } catch (err) {
    record("FAIL", "Database open", err.message);
    return null;
  }
  try {
    assertSchema(db);
    record("PASS", "Schema", "combos, model_combo_mappings, provider_connections");
  } catch (err) {
    record("FAIL", "Schema", err.message);
    try {
      db.close();
    } catch {
      /* ignore */
    }
    return null;
  }
  return db;
}

function checkCombosAndMappings(db) {
  const providers = activeProviders(db);
  if (providers.size) record("PASS", "Providers", [...providers].sort().join(", "));
  else record("WARN", "Providers", "none active");

  for (const def of COMBO_DEFS) {
    const row = db.prepare("SELECT id, name, data FROM combos WHERE id = ?").get(def.id);
    if (!row) {
      record("FAIL", `Combo ${def.id}`, "missing — run node setup.js");
      continue;
    }
    let data;
    try {
      data = JSON.parse(row.data);
    } catch {
      record("FAIL", `Combo ${def.id}`, "data is not JSON");
      continue;
    }
    const models = Array.isArray(data.models) ? data.models : [];
    if (!models.length) {
      record("FAIL", `Combo ${def.id}`, "no models");
      continue;
    }
    const required = def.targets.filter((t) => !t.optional && providers.has(t.provider));
    const missingRequired = required.filter(
      (t) => !models.some((m) => m.provider === t.provider && m.model === t.model)
    );
    if (missingRequired.length) {
      record(
        "FAIL",
        `Combo ${def.id}`,
        `missing required models: ${missingRequired.map((t) => t.model).join(", ")}`
      );
    } else {
      record("PASS", `Combo ${def.id}`, `${models.length} model(s), strategy ${data.strategy || "unset"}`);
    }
    for (const [index, model] of models.entries()) {
      if (!model.provider || !model.model) {
        record("FAIL", `Model ${def.id}#${index + 1}`, "missing provider or model id");
      }
    }
  }

  for (const def of COMBO_DEFS) {
    const row = db
      .prepare("SELECT pattern, combo_id, enabled FROM model_combo_mappings WHERE id = ?")
      .get(def.mappingId);
    if (!row) {
      record("FAIL", `Mapping ${def.mappingId}`, "missing — run node setup.js");
      continue;
    }
    if (row.pattern !== def.pattern || row.combo_id !== def.id || Number(row.enabled) !== 1) {
      record(
        "FAIL",
        `Mapping ${def.mappingId}`,
        `expected ${def.pattern} -> ${def.id} enabled, got ${row.pattern} -> ${row.combo_id}`
      );
    } else {
      record("PASS", `Mapping ${def.mappingId}`, `${row.pattern} -> ${row.combo_id}`);
    }
  }

  const dupes = db
    .prepare(
      `SELECT pattern, COUNT(*) AS n FROM model_combo_mappings
       WHERE pattern IN (?, ?, ?) GROUP BY pattern HAVING n > 1`
    )
    .all("*opus*", "*sonnet*", "*haiku*");
  if (dupes.length) {
    record("FAIL", "Duplicate mappings", dupes.map((d) => `${d.pattern} x${d.n}`).join(", "));
  } else {
    record("PASS", "Duplicate mappings", "no duplicate Limitless patterns");
  }
}

function checkClaudeConfig() {
  const settingsPath = claudeSettingsPath();
  if (!fs.existsSync(settingsPath)) {
    record("FAIL", "Claude settings", `missing: ${settingsPath}`);
    return;
  }
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  } catch (err) {
    record("FAIL", "Claude settings", `invalid JSON (${err.message})`);
    return;
  }
  const env = settings.env || {};
  const base = String(env.ANTHROPIC_BASE_URL || "");
  if (!base) record("FAIL", "ANTHROPIC_BASE_URL", "not set");
  else if (/\/v1\/?$/i.test(base)) record("FAIL", "ANTHROPIC_BASE_URL", `${base} must not end with /v1`);
  else if (base.replace(/\/$/, "") !== GATEWAY_ORIGIN) {
    record("WARN", "ANTHROPIC_BASE_URL", `${base} (expected ${GATEWAY_ORIGIN})`);
  } else record("PASS", "ANTHROPIC_BASE_URL", base);

  if (env.ANTHROPIC_AUTH_TOKEN || env.ANTHROPIC_API_KEY) {
    record("PASS", "Claude auth", "token present (value not printed)");
  } else {
    record("WARN", "Claude auth", "ANTHROPIC_AUTH_TOKEN is missing");
  }

  const opus = env.ANTHROPIC_DEFAULT_OPUS_MODEL;
  const sonnet = env.ANTHROPIC_DEFAULT_SONNET_MODEL;
  const haiku = env.ANTHROPIC_DEFAULT_HAIKU_MODEL;
  if (opus === "claude-opus" && sonnet === "claude-sonnet" && haiku === "claude-haiku") {
    record("PASS", "Tier defaults", "claude-opus / claude-sonnet / claude-haiku");
  } else {
    record(
      "WARN",
      "Tier defaults",
      `opus=${opus || "unset"} sonnet=${sonnet || "unset"} haiku=${haiku || "unset"}`
    );
  }
}

async function main() {
  checkNode();
  checkPackages();
  checkOmnirouteCli();
  await checkEndpoint();
  const db = checkDatabase();
  if (db) {
    try {
      checkCombosAndMappings(db);
    } finally {
      try {
        db.close();
      } catch {
        /* ignore */
      }
    }
  } else {
    record("FAIL", "Combos", "skipped because the database could not be opened");
    record("FAIL", "Mappings", "skipped because the database could not be opened");
  }
  checkClaudeConfig();

  const fail = results.filter((r) => r.status === "FAIL").length;
  const warn = results.filter((r) => r.status === "WARN").length;
  const pass = results.filter((r) => r.status === "PASS").length;
  console.log("");
  console.log(`${pass} passed, ${fail} failed, ${warn} warning(s)`);
  if (fail) process.exit(1);
}

main().catch((err) => {
  console.error("ERROR:", err.stack || err.message);
  process.exit(1);
});
