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

  const hasIsActive = colNames.includes("is_active");
  const hasRevokedAt = colNames.includes("revoked_at");
  const hasIsBanned = colNames.includes("is_banned");
  const hasExpiresAt = colNames.includes("expires_at");
  const hasLastUsed = colNames.includes("last_used_at");
  const hasCreatedAt = colNames.includes("created_at");

  // 1. If an explicit key was provided, verify it exists and is active/non-revoked
  if (explicitKey) {
    const row = db.prepare("SELECT * FROM api_keys WHERE key = ?").get(explicitKey);
    if (row) {
      if (hasIsActive && row.is_active === 0) return null;
      if (hasRevokedAt && row.revoked_at !== null) return null;
      if (hasIsBanned && row.is_banned === 1) return null;
      if (hasExpiresAt && row.expires_at !== null) {
        const expiryTime = new Date(row.expires_at).getTime();
        if (!isNaN(expiryTime) && expiryTime <= Date.now()) return null;
      }
      return row;
    }
    // If explicit key does not exist in this database, fall through to query active keys from database
  }

  // 2. Query active / non-revoked keys ordered by last_used_at or created_at
  let query = "SELECT * FROM api_keys";
  const conditions = [];
  if (hasIsActive) conditions.push("(is_active = 1 OR is_active IS NULL)");
  if (hasRevokedAt) conditions.push("revoked_at IS NULL");
  if (hasIsBanned) conditions.push("(is_banned = 0 OR is_banned IS NULL)");
  if (hasExpiresAt) conditions.push("(expires_at IS NULL OR expires_at > datetime('now'))");

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

  // Fail-closed diagnostic: if schema lacks allowed_combos column, combo permissions cannot be configured.
  // Report clear unsupported_schema diagnostic instead of misleading success or ambiguous no_action_needed.
  if (!hasAllowedCombos) {
    return {
      changed: false,
      status: "unsupported_schema",
      reason: "missing_allowed_combos_column",
      mode: currentMode,
      message: `Database schema lacks 'allowed_combos' column to grant Limitless profile access (key mode is '${currentMode}').`
    };
  }

  let existingCombos = [];
  let malformedJson = false;
  if (hasAllowedCombos && row.allowed_combos) {
    try {
      existingCombos = JSON.parse(row.allowed_combos);
      if (!Array.isArray(existingCombos)) {
        existingCombos = [];
        malformedJson = true;
      }
    } catch (_) {
      existingCombos = [];
      malformedJson = true;
    }
  }

  // If key already has access to combo/* or all required combos, no change needed
  const hasWildcard = existingCombos.includes("combo/*") || existingCombos.includes("*");
  const missingCombos = requiredCombos.filter(cid => !existingCombos.includes(cid));

  if (!malformedJson && (hasWildcard || (missingCombos.length === 0 && (currentMode === "all" || existingCombos.length > 0)))) {
    return {
      changed: false,
      mode: currentMode,
      combos: existingCombos,
      reason: "already_permitted"
    };
  }

  // If in restricted mode (or if updating allowed_combos), PRESERVE restricted mode and append only the needed combo IDs
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
