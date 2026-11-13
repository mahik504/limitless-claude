# Limitless Claude — Orchestra Workflow Integration Specification
**Integration Architecture**: Mode A (Standalone) vs. Mode B (Orchestra Connected)  
**Connected Repository**: `C:\projects\orchestra-workflow` (v5.0.0, 115 skills) [VERIFIED]  
**Document Revision**: November 2026  

---

## 1. Architectural Philosophy: Independence & Decoupled Interoperability

**Limitless Claude is an independent project that does not depend on Orchestra Workflow.** Any developer can install and use Limitless Claude standalone with 100% of its model routing, file undo, task pinning, prompt engine, and client integration capabilities.

However, in development environments where the separate **Orchestra Workflow** repository (`https://github.com/mahik504/orchestra-workflow`) is also present, Limitless Claude activates **Mode B Interoperability**:
- **Limitless Claude** owns: Model routing, multi-provider credentials, combos, prompt layers, file checkpoints, and Claude client integration.
- **Orchestra Workflow** owns: Specialist agent roles, development skills, project passports, and workflow automation.

---

## 2. Mode A (Standalone) vs. Mode B (Orchestra Connected)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                        LIMITLESS CLAUDE OPERATIONAL MODES                               │
├───────────────────────────────┬─────────────────────────────────────────────────────────┤
│ Mode A: Standalone Mode       │ • Orchestra is not detected on disk.                    │
│         (Default for Users)   │ • Uses built-in 20-workload prompt profiles.            │
│                               │ • Governs model tiers and combos independently.         │
│                               │ • Zero external dependencies beyond OmniRoute gateway.  │
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ Mode B: Orchestra Connected   │ • Discovers local `C:\projects\orchestra-workflow`.     │
│         (Local Power Mode)    │ • Synchronizes contract CLAUDE.md adapter via ow-sync.  │
│                               │ • Maps Orchestra task categories to Limitless tiers.    │
│                               │ • Bridges local MCP servers (`orchestra-brain`).        │
│                               │ • Zero circular imports: core runtime never imports OW. │
└───────────────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 3. Candidate Path Discovery & Health Telemetry

Limitless Claude inspects standard candidate paths in priority order:
1. `C:\projects\orchestra-workflow` [ACTIVE & VERIFIED]
2. `~/projects/orchestra-workflow`
3. `~/orchestra-workflow`
4. Custom path via `process.env.ORCHESTRA_ROOT`

### Status Verification Command
```bash
limitless orchestra status
```
*Live Output from Audited Workstation*:
```
================================================================================
            LIMITLESS CLAUDE 8.4 — ORCHESTRA 5.5.0 WORKFLOW STATUS
================================================================================
  [ACTIVE] Orchestra Control Plane Connected (Mode B Active)
  • Workspace Root       : C:\projects\orchestra-workflow
  • Orchestra Version    : 5.5.0
  • Discovered Skills    : 115 skills registered in control plane
--------------------------------------------------------------------------------
  HOST INTEGRATION AUDIT:
  [PASS] Claude Code CLAUDE.md     : Orchestra 5.0.0 synced
  [PASS] Claude Code Gateway Route : Routed to OmniRoute (:20128)
  [PASS] Orchestra MCP Servers     : orchestra-brain, stitch, playwright, context7 wired
  [PASS] Claude Code Skill Cache   : 119 skills installed in ~/.claude/skills
================================================================================
```

---

## 4. Reversible Skill Synchronization (`limitless orchestra sync`)

When updating Orchestra skills or advancing versions:
```bash
limitless orchestra sync
```
This command delegates safely to Orchestra's native synchronization engine:
`node C:/projects/orchestra-workflow/runtime/tools/ow-sync.mjs --apply`
- Updates `~/.claude/CLAUDE.md` between marked boundaries (`<!-- orchestra:start -->` and `<!-- orchestra:end -->`).
- Installs or updates specialist agent definitions in `~/.claude/agents/` and commands in `~/.claude/commands/`.
- Preserves existing custom user instructions and model settings outside marked regions.

---

## 5. Architectural Isolation & Safe Fallback Guarantee

The core Limitless Claude runtime (`src/core/`) **never imports Orchestra modules directly**. Decoupling is enforced by contract tests in `test/orchestra-interop.test.js`:
- If Orchestra is uninstalled, moved, or deleted, Limitless Claude seamlessly reverts to Mode A with zero crashes and zero missing dependency errors.
- Limitless Claude never modifies Orchestra git branches or internal files.
