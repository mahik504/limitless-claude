/**
 * Safe OmniRoute API Key Permission Manager
 * Preserves user restrictions without silently broadening access.
 */

function findTargetApiKey(db, explicitKey = null) {
  const apiCols = db.prepare("PRAGMA table_info(api_keys)").all();
  const colNames = apiCols.map(c => c.name);

  if (!colNames.includes("key")) {
    return null;
  }

  // 1. If an explicit key was provided and matches, return it
  if (explicitKey) {
    const row = db.prepare("SELECT * FROM api_keys WHERE key = ?").get(explicitKey);
    if (row) return row;
  }

  // 2. Query active / non-revoked keys ordered by last_used_at or created_at
  const hasIsActive = colNames.includes("is_active");
  const hasRevokedAt = colNames.includes("revoked_at");
  const hasLastUsed = colNames.includes("last_used_at");
  const hasCreatedAt = colNames.includes("created_at");

  let query = "SELECT * FROM api_keys";
  const conditions = [];
  if (hasIsActive) conditions.push("(is_active = 1 OR is_active IS NULL)");
  if (hasRevokedAt) conditions.push("revoked_at IS NULL");

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  const orderClauses = [];
  if (hasLastUsed) orderClauses.push("last_used_at DESC");
  if (hasCreatedAt) orderClauses.push("created_at DESC");

  if (orderClauses.length > 0) {
    query += " ORDER BY " + orderClauses.join(", ");
  }
  query += " LIMIT 1";

  try {
    return db.prepare(query).get();
  } catch (_) {
    return db.prepare("SELECT * FROM api_keys LIMIT 1").get();
  }
}

function safelyConfigureComboPermissions(db, apiKey, requiredCombos = []) {
  if (!apiKey) return { changed: false, reason: "no_key" };

  const apiCols = db.prepare("PRAGMA table_info(api_keys)").all();
  const colNames = apiCols.map(c => c.name);

  const hasModelAccessMode = colNames.includes("model_access_mode");
  const hasAllowedCombos = colNames.includes("allowed_combos");

  const row = db.prepare("SELECT * FROM api_keys WHERE key = ?").get(apiKey);
  if (!row) return { changed: false, reason: "key_not_found" };

  const currentMode = hasModelAccessMode ? (row.model_access_mode || "all") : "all";
  let existingCombos = [];
  if (hasAllowedCombos && row.allowed_combos) {
    try {
      existingCombos = JSON.parse(row.allowed_combos);
      if (!Array.isArray(existingCombos)) existingCombos = [];
    } catch (_) {
      existingCombos = [];
    }
  }

  // If key already has access to combo/* or all required combos, no change needed
  const hasWildcard = existingCombos.includes("combo/*") || existingCombos.includes("*");
  const missingCombos = requiredCombos.filter(cid => !existingCombos.includes(cid));

  if (hasWildcard || (missingCombos.length === 0 && (currentMode === "all" || existingCombos.length > 0))) {
    return {
      changed: false,
      mode: currentMode,
      combos: existingCombos,
      reason: "already_permitted"
    };
  }

  // If in restricted mode, PRESERVE restricted mode and append only the needed combo IDs
  const updates = [];
  const params = [];

  if (hasAllowedCombos) {
    const updatedCombos = Array.from(new Set([...existingCombos, ...requiredCombos]));
    updates.push("allowed_combos = ?");
    params.push(JSON.stringify(updatedCombos));
  }

  // If model_access_mode is unset or missing, leave it as is; never forcibly broaden from restricted to all
  if (updates.length > 0) {
    params.push(apiKey);
    const updateSql = `UPDATE api_keys SET ${updates.join(", ")} WHERE key = ?`;
    db.prepare(updateSql).run(...params);
    return {
      changed: true,
      mode: currentMode,
      addedCombos: missingCombos
    };
  }

  return { changed: false, reason: "no_action_needed" };
}

module.exports = {
  findTargetApiKey,
  safelyConfigureComboPermissions
};
