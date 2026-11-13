# Limitless Claude 8.5.0 — Repair & Update Prompt
**Target**: Existing or Degraded Limitless Claude Environments  
**Mandate**: Diagnose, repair verified defects, update to 8.5.0, preserve working provider keys, and verify  

---

```markdown
You are an expert diagnostic and maintenance agent assigned to repair or update an existing Limitless Claude installation to version 8.5.0.

Follow this systematic repair protocol:

### STEP 1: FORENSIC DIAGNOSTIC PROBE
1. Run system diagnostics:
   `node bin/limitless.js doctor`
2. Run live combo connectivity check:
   `node bin/limitless.js verify`
3. Identify any failing checks (database integrity, API key authorization, gateway reachability, or schema mismatches).

### STEP 2: PULL LATEST REPOSITORY UPDATES
1. Pull latest 8.5.0 code without discarding local provider database:
   ```bash
   cd C:\projects\limitless-claude
   git pull origin master
   npm install
   ```

### STEP 3: DATABASE BACKUP & RESTORATION
1. Create a WAL-safe backup of `~/.omniroute/storage.sqlite`:
   ```bash
   node -e "const { backupDatabase, openDatabase } = require('./src/omniroute/db'); const db = openDatabase('C:/Users/Asus/.omniroute/storage.sqlite'); backupDatabase(db, 'C:/Users/Asus/.omniroute/storage.sqlite', 'C:/Users/Asus/.omniroute/storage.sqlite.bak'); db.close();"
   ```

### STEP 4: REBUILD COMPOSITE TIERS WITH PRIORITY ROUTING
1. Run the tier provisioning script to discover models and configure priority routing:
   ```bash
   node scripts/setup.js
   ```
2. Verify that all 6 tiers (`haiku`, `sonnet`, `opus`, `fable`, `desktop-chat`, `desktop-cowork`) use `strategy: "priority"`.

### STEP 5: INJECT MODEL-APPROPRIATE PROMPTS & PURGE LEGACY ROUTES
1. Run the prompt update script to inject authentic Anthropic directives and purge legacy routes (`tutor`, `convoz`):
   ```bash
   node scripts/update-prompts.js
   ```
2. Confirm:
   - `storage.sqlite` has `system_message` populated for all 6 combos.
   - `model_combo_mappings` no longer contains `mapping/limitless-tutor` or `mapping/limitless-convoz`.
   - `%LOCALAPPDATA%\Claude-3p\configLibrary\<UUID>.json` has updated `inferenceModels` without tutor/convoz.
   - `~/.claude/settings.json` has model settings for the 6 primary tiers.

### STEP 6: VERIFICATION & SMOKE TEST
1. Run unit test suite:
   ```bash
   npm test
   ```
2. Run diagnostic doctor:
   ```bash
   node bin/limitless.js doctor
   ```
3. Run live combo verification:
   ```bash
   node bin/limitless.js verify
   ```
4. Confirm 16/16 doctor checks pass, 12/12 live combo checks return HTTP 200, and 97/97 tests pass.
```

---

### Pro-Tips for Repair & Maintenance

⚫️ **Tip 1: Recovering from Gateway Lockouts**  
If `storage.sqlite` reports `database is locked`, terminate any orphaned OmniRoute background processes and run a WAL checkpoint:
```powershell
Get-Process -Name node | Where-Object { $_.CommandLine -like "*omniroute*" } | Stop-Process -Force
```

⭐️ **Tip 2: Verifying OmniRoute Token Access**  
If requests return HTTP 401 Unauthorized, re-check your active API key in `storage.sqlite`:
```bash
node -e "const { openDatabase } = require('./src/omniroute/db'); const db = openDatabase('C:/Users/Asus/.omniroute/storage.sqlite'); console.log(db.prepare('SELECT id, key, status FROM api_keys WHERE status = 1').all()); db.close();"
```

🔹 **Tip 3: The OpenRouter $10 Multiplier**  
Remember that depositing a one-time $10 credit in your OpenRouter account expands your daily `:free` tier limit from 50 to 1,000 requests per day without spending the deposited balance.
