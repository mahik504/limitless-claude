# Baseline audit

Date: 2026-11-13. Machine: this PC. Repo: `C:\projects\limitless-claude`. Gateway database: `%USERPROFILE%\.omniroute\storage.sqlite` (read-only). No combo, credential, or client file was modified.

Labels: **VERIFIED** means a command or file read in this session. **CORROBORATED** means two sources agree. **REPORTED** means a doc or badge said it. **INFERRED** means a conclusion past the evidence. **UNKNOWN** means not checked. **NOT_RUN** means a planned test did not run.

## Verdict

Limitless Claude 8.3.0 is a Node policy companion. The process that answers model requests is OmniRoute **3.8.51**, listening on `127.0.0.1:20128`. The useful work is to tighten combo policy, stop unsafe setup side effects, and document only the clients that actually accept this gateway. Building another router inside Limitless would duplicate a gateway that already has combo strategies, quota tables, session affinity, and routing logs.

## Repository

| Fact | Label |
| --- | --- |
| HEAD `7ee3f17`, tag `v8.3.0`, branch `master` matches `origin/master`, worktree clean at audit start | VERIFIED |
| `package.json` version `8.3.0`, Node `>=22`, binary `limitless` | VERIFIED |
| Local Node `v24.19.0` | VERIFIED |
| Claude Code CLI `2.1.310` | VERIFIED (`claude --version`) |
| `node --test test/*.test.js`: 96 pass, 0 fail, 0 skipped | VERIFIED |
| GitHub Actions workflow `Test` on push/PR, Node 22, ubuntu/windows/macos, `npm test` | VERIFIED (workflow file) |
| Latest Test runs for `v8.3.0` completed success on 2026-11-07 | VERIFIED (`gh run list`) |
| Tags exist from `v3.1.0` through `v8.3.0` | VERIFIED |
| `config/tier-configuration.json` is gitignored | VERIFIED (`.gitignore`) |
| `backups/` and `*.sqlite` are gitignored. `git log -- '*sqlite*'` returned no commits | VERIFIED |
| README badge "96/96" matches this machine's test run. It does not prove CLI, IDE, or Desktop behavior | VERIFIED tests, NOT_RUN client flows |

## What actually runs

| Fact | Label |
| --- | --- |
| `GET http://127.0.0.1:20128/` returned HTTP 200 | VERIFIED |
| Listener pid 20952 is `node.exe` running `omniroute\3.8.51\...\dist\server-ws.mjs` from the pnpm store | VERIFIED |
| Limitless source has no production HTTP server. `createServer` appears in tests only | VERIFIED |
| Clients that honor `ANTHROPIC_BASE_URL` send traffic to OmniRoute. Limitless `CircuitBreaker` in `src/core/routing-policy.js` runs only inside the Limitless process | VERIFIED (code). INFERRED that it does not see live Claude Code requests |
| Installed OmniRoute 3.8.51 advertises routing strategies including `priority`, `round-robin`, `least-used`, `cost-optimized`, `reset-aware`, `quota-weighted`, `context-optimized` | VERIFIED (package chunk `ROUTING_STRATEGY_VALUES`) |
| `model_capabilities` in the live database has 0 rows. The schema exists and is unused | VERIFIED |

## Live combos

Read from `combos` and `model_combo_mappings` on 2026-11-13. Rows last updated `2026-11-08 11:36:42`. Strategy names come from `json_extract(data,'$.strategy')`.

| Combo | Id | Strategy | Models |
| --- | --- | --- | --- |
| Limitless Haiku 5.5 Tier | `combo/limitless-haiku` | round-robin | 6 |
| Limitless Sonnet 5.5 Tier | `combo/limitless-sonnet` | round-robin | 7 |
| Limitless Fable 5.1 Tier | `combo/limitless-fable` | priority | 7 |
| Limitless Opus 5.5 Tier | `combo/limitless-opus` | round-robin | 24 |
| Claude Desktop Chat | `combo/desktop-chat` | priority | 7 |
| Claude Desktop Cowork | `combo/desktop-cowork` | priority | 7 |

Alias resolution in OmniRoute source (`globToRegex`, full-string, case-insensitive, highest `priority` wins):

| Pattern | Priority | Combo |
| --- | --- | --- |
| `*desktop-chat*` | 15 | desktop-chat |
| `*desktop-cowork*` | 15 | desktop-cowork |
| `*opus[1m]*` | 11 | opus |
| `*opusplan*` | 11 | sonnet |
| `*sonnet[1m]*` | 11 | sonnet |
| `claude*fable*` | 10 | fable |
| `claude*haiku*` | 10 | haiku |
| `claude*opus*` | 10 | opus |
| `claude*sonnet*` | 10 | sonnet |
| `*best*` | 9 | fable |
| `*default*` | 8 | opus |

`*default*` matches the substring `default`. It is not a catch-all. Source: `C:\projects\omniroute\src\shared\utils\globPattern.ts` and `sqliteModelComboMappingRepository.ts`. The running daemon is the 3.8.51 package, so this matcher is **CORROBORATED** for the live process and **VERIFIED** in the source tree.

### Opus list (live)

1. mistral / codestral-latest
2. kiro / claude-sonnet-4.5
3. xkiro / mistralai/codestral-2508
4. xkiro / mistralai/mistral-large-2512
5. kiro / qwen3-coder-next
6. kiro / glm-5
7. kiro / deepseek-3.2
8. github / gpt-4o-2024-11-20
9. cloudflare-ai / @cf/qwen/qwen2.5-coder-32b-instruct
10. cloudflare-ai / @cf/deepseek-ai/deepseek-r1-distill-qwen-32b
11. cloudflare-ai / @cf/meta/llama-3.3-70b-instruct-fp8-fast
12. openrouter / nvidia/nemotron-3-ultra-550b-a55b:free
13. openrouter / google/gemma-4-26b-a4b-it:free
14. anyapi / nvidia/nemotron-3-ultra-550b-a55b:free
15. anyapi / nvidia/nemotron-3.5-lightning:free
16. anyapi / dots-studio/dots-3-note-preview:free
17. ollama-cloud / gemma4:31b
18. ollama-cloud / gpt-oss:20b
19. mistral / ministral-8b-latest
20. kiro / minimax-m2.5
21. github / gpt-4o-mini
22. antigravity / gemini-3.8-flash-tiered
23. groq / openai/gpt-oss-20b
24. kiro / claude-haiku-4.5

Source `comboResolver.ts` implements `round-robin` as an in-memory counter: each resolution advances one step, wrapping through every model. `priority` always starts at index 0, then fallbacks follow. That file is the source tree. The installed 3.8.51 bundle names the same strategies. Equal rotation on the live daemon is **CORROBORATED**, not packet-traced.

Haiku, Sonnet, and Opus are round-robin. Fable and both Desktop combos are priority, and each starts at `kiro / claude-sonnet-4.5`.

`config/tier-configuration.json` (local, gitignored, `metadata.last_scanned` 2026-11-07, `metadata.version` 8.1.0) does not match this database. Its Opus section includes `auto/claude-opus`, `custom/Limitless Opus 5.5 Tier`, `kr/deepseek-3.2`, `no-think/antigravity/...`, and `gh/claude-opus-5`. Those rows are absent from the live combo. Applying that file would be a regression. It was not applied.

The README's "23-model Opus pool" does not match the live 24-row combo. **REPORTED** vs **VERIFIED**.

## Providers on this PC

Active connections, grouped, with no names, emails, or secrets:

| Provider | Active rows | test_status |
| --- | --- | --- |
| agy | 1 | active |
| antigravity | 2 | active |
| anyapi | 1 | active |
| cloudflare-ai | 1 | active |
| github | 1 | active |
| groq | 1 | active |
| kilo-gateway | 1 | active |
| kiro | 1 | active |
| mistral | 1 | active |
| nvidia | 1 | active |
| ollama-cloud | 1 | active |
| openrouter | 1 | active |
| xkiro | 1 | active |
| github-models | 1 inactive | active |
| qwen-web | 1 inactive | unavailable, last error set |

`usage_history` since `2026-10-30T00:00:00.000Z` (`success = 1` counted as ok). Timestamp column is ISO text. Span of the whole table is 2026-08-20 to 2026-11-12, 5269 rows.

| Provider value | Requests | ok |
| --- | --- | --- |
| kiro | 240 | 232 |
| cloudflare-ai | 189 | 130 |
| opencode-zen | 153 | 0 |
| github | 141 | 67 |
| openrouter | 113 | 80 |
| nvidia | 78 | 0 |
| kilo-gateway | 75 | 59 |
| mistral | 70 | 50 |
| xkiro | 57 | 18 |
| antigravity | 52 | 50 |
| groq | 44 | 36 |
| ollama-cloud | 41 | 7 |
| anyapi | 9 | 4 |

`opencode-zen`, `cerebras`, `opencode-go`, `agentrouter`, and `bluesminds` appear in that window and are absent from current `provider_connections`. NVIDIA is still connected and recorded 0 successes in the window. Those are historical outcomes, not a license to delete the NVIDIA connection.

All-time `call_logs` combo names: `(none)` 1161 rows / 542 with status >= 400 or 0; Opus 165/10; Haiku 87/6; Sonnet 66/0; Fable 65/5; Desktop Cowork 2/0; Desktop Chat 1/0. Status semantics beyond the numeric filter are **UNKNOWN**.

## This machine's Claude Code settings

`%USERPROFILE%\.claude\settings.json` exists. Non-secret fields:

- `env.ANTHROPIC_BASE_URL` = `http://localhost:20128`
- Auth material is present in `env` and at the top level. Values were not printed.
- `model` = `fable`
- `primaryModel` = `claude-opus-5-5`
- `effortLevel` = `high`
- `modelSettings` keys include `claude-opus-5`, `claude-sonnet-5`, `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-fable-5-1`, `claude-desktop-chat`, `claude-desktop-cowork`, `claude-haiku-5-5`, `claude-fable-5-2`
- MCP server names: playwright, context7, orchestra-brain, stitch, shadcn, magic-ui
- Hook groups: PreToolUse, UserPromptSubmit

Windows user environment: `ANTHROPIC_BASE_URL` and `OMNIROUTE_BASE_URL` are `http://localhost:20128`. `ANTHROPIC_AUTH_TOKEN` and `OMNIROUTE_API_KEY` are set (length 45). `ANTHROPIC_API_KEY` is unset. Values were not printed.

`scripts/setup.js` still assigns `primaryModel` to `claude-opus-5-5` and, on Windows, runs `setx` for `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, and `OMNIROUTE_API_KEY`. Docs that say global `setx` was removed are **REPORTED** and contradicted by the current source (**VERIFIED**). Setup was not run.

`model` is the documented Claude Code selector. On this PC it is the alias `fable`. Official aliases are `haiku`, `sonnet`, `opus`, and `fable`. They resolve to provider defaults unless `ANTHROPIC_DEFAULT_FABLE_MODEL` (and the matching Haiku, Sonnet, and Opus variables) pin them. Those pin variables are absent from this settings file. `primaryModel=claude-opus-5-5` is not in the documented precedence list (`/model`, then `--model`, then `ANTHROPIC_MODEL`, then `model`, then `ANTHROPIC_DEFAULT_MODEL` on v2.1.236+). The OmniRoute pattern `claude*fable*` does not match the literal alias `fable`. The model id that actually arrives at port 20128 is **UNKNOWN** until a traced request. Source: [Model configuration](https://code.claude.com/docs/en/model-config), opened 13 Nov 2026 by [Research Claude client APIs](1583b948-baf6-42db-b894-0448c3dc9e66).

## Clients, after the 13 Nov 2026 docs pass

Pages were opened by [Research Claude client APIs](1583b948-baf6-42db-b894-0448c3dc9e66). Citations live in `docs/CLIENT-PRIMARY-SOURCES.md`. Local files were read afterward, with secrets left out.

| Target | State |
| --- | --- |
| Claude Code CLI | VERIFIED docs: `ANTHROPIC_BASE_URL` in `~/.claude/settings.json` `env` is the supported gateway switch. This PC has that URL set to `http://localhost:20128`. Installed CLI is `2.1.310`. Newest release seen is `2.1.322` (10 Nov 2026). No upgrade was run. A live prompt was NOT_RUN |
| VS Code extension | VERIFIED on this PC: extension `anthropic.claude-code-2.1.322-win32-x64` is installed. User settings set `claudeCode.environmentVariables` `ANTHROPIC_BASE_URL` to `http://127.0.0.1:20128`, with an auth token present and `CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=0`. Official docs say this setting is what the extension's login check reads. A launch was NOT_RUN |
| Cursor's own agent | VERIFIED docs: Bring-your-own-key sends the Anthropic key to Cursor's backend. No Anthropic base URL is documented. This PC's Cursor user settings contain no `claudeCode` block and no `ANTHROPIC_BASE_URL` |
| Claude Code extension inside Cursor | VERIFIED installed: `anthropic.claude-code-2.1.322-win32-x64`. The login-check setting is absent from Cursor user settings. `~/.claude/settings.json` reaches a spawned CLI and does not satisfy that check. Launch NOT_RUN. Label: PARTIALLY configured |
| Antigravity IDE | UNKNOWN as an embedded Claude Code host. Antigravity documents `agy plugin import claude` for plugins, MCP, skills, and commands, and its own picker can select Claude Opus 5.5 or Sonnet 5.5 as partner models. No custom Anthropic base URL was found. Two `antigravity` rows in OmniRoute are provider accounts, not the IDE |
| Claude Desktop chat model | `claude_desktop_config.json` on this PC has only `mcpServers` (orchestra-brain, context7, playwright, stitch, shadcn, magic-ui). Official docs: that file is MCP. Desktop sets `ANTHROPIC_BASE_URL` itself for local Code sessions and ignores the settings-file value. The supported Code-session gateway is Developer → Configure Third-Party Inference. Whether that form also replaces ordinary chat is unspecified. No third-party inference file was in `%APPDATA%\Claude` |
| Official Cowork | VERIFIED: Anthropic product. Sessions run on Anthropic's servers. `combo/desktop-cowork` cannot be official Cowork. The combo stays; the name must not be documented as Cowork |
| Claude Agent SDK | VERIFIED docs: it runs the Claude Code binary and can pass `ANTHROPIC_BASE_URL`. Non-Anthropic models are not a documented supported path |
| "Claude X-Stop" | UNKNOWN. No match in this repo |
| Orchestra | Optional. `src/integrations/orchestra/adapter.js` detects `C:\projects\orchestra-workflow` and falls open to standalone. Core modules do not import it |

Gateway behavior that Limitless must not "fix" by rewriting bodies, from the Claude Code gateway protocol page: an attribution block is prepended and is stripped only by `api.anthropic.com`; `cache_control` has to be forwarded unchanged; an unrecognized model name is sent `thinking: {"type":"adaptive"}`; `anthropic-beta` is part of the request. Those are OmniRoute's job. They were not packet-checked against 3.8.51. Label: **REPORTED** from Anthropic, **NOT_RUN** against this gateway.

## Security already visible

- `scripts/doctor.js` prints a slice of the gateway key (first 7 and last 6 characters). Doctor was not run, so this session did not emit that slice. The code path is **VERIFIED**.
- `scripts/setup.js` writes the gateway token into the Windows user environment with `setx`. The variables are set now. Removing them is a behavior change and was not done.
- Current prompt files describe an original five-layer constitution. `docs/PROMPT-ENGINEERING.md` says leaked instructions are not used. CHANGELOG and an older commit message (`v6.1.0`) still say a leaked prompt engine was embedded. Current `prompts/` were not fully reread for leftover vendor text. Label: **REPORTED** history, **UNKNOWN** whether any current file still contains it.
- No sqlite database is in git history from the path filter used this session.

## Code map, 13 Nov 2026

[Map Limitless Claude code](5cc7c0b4-22dc-47ea-a063-86959c79b186) read the tree at `7ee3f17` and did not modify it. The checks below were re-read in this session where noted.

`scripts/setup.js` is a writer. Inside one transaction it deletes the four Limitless combo ids and nine mapping ids, then inserts them again (`scripts/setup.js` around 520–591). Every inserted combo, including Fable, is `strategy: "round-robin"`. The live Fable row is `priority`. Running setup against this database would replace that strategy, replace the model lists, and replace the system messages. It would not delete `combo/desktop-chat` or `combo/desktop-cowork`, because those ids are not in the delete list. Setup was not run.

The same script classifies every other live catalog id with a regex (`scripts/setup.js` 347–379). The provider is the text before the first slash. That is how rows such as `auto/claude-opus`, `custom/Limitless Opus 5.5 Tier`, and `no-think/...` entered the gitignored tier file. The file is an output of setup, not an input.

`RoutingPolicy`, `FallbackEngine`, and `composePrompt` are not on the request path. In `src/`, `routing-policy.js` is required by `fallback-engine.js`, and `prompt-engine.js` is required by `prompt-lab.js`. No production HTTP server exists. Clients talk to OmniRoute. The README's control-plane diagram describes libraries that do not see the chat request.

Live `system_message` values were classified without copying them. All six combos name Claude in the opening, contain no `antml:` marker, and contain no "Universal Engineering Constitution". Current setup literals name the tier ("Haiku 5.5", "Sonnet 5.5", "Opus 5.5", "Fable 5.1") and tell the model to operate as Claude Code. Those literals are not the five-layer engine. Re-running setup would swap one identity string for the other and would also rewrite the pools. Neither write is approved.

`src/integrations/orchestra/adapter.js` recommends `limitless-haiku-4.5` and `limitless-opus-4.6`. The live combo ids are `combo/limitless-haiku` and `combo/limitless-opus`.

`npm test` on this machine was 96 pass, 0 fail, earlier in this session. The code map did not re-run it. The workflow does not assert the number 96.

## Competitive pass, 13 Nov 2026

[Compare routers and agents](d84b3053-985e-41e7-a862-7d1ab4c35631) opened the agent, gateway, and paper pages. The OpenRouter numbers below were opened again in this session from [Limits](https://openrouter.ai/docs/api/reference/limits) and [FAQ](https://openrouter.ai/docs/faq).

`:free` models share one daily counter, `free_model_daily_requests`:

| Credits purchased, all time | Per minute | Per day |
| --- | --- | --- |
| Under 10 | 20 | 50 |
| At least 10 | 20 | 1,000 |

The higher ceiling starts at 9 credits to absorb rounding and the top-up fee. Purchasing credits costs 5.5% with an $0.80 minimum, so a $10 checkout is not the same thing as 10 credits posted. Extra API keys do not raise the limit. The limits page says additional accounts do not raise it either, because capacity is governed globally. The old "about 1,000 requests per day for $10" line is not the default free tier.

Claude Code's own fallback does not switch models on a rate limit. The combo behind the alias is the failover. A second retry loop in Limitless would spend quota twice.

Codex accepts the Responses API. A Chat Completions alias is not a Codex setup until `/v1/responses` is shown on this gateway. That check is NOT_RUN.

Kiro's FAQ, as opened by that pass, does not allow third-party harnesses that route outside Kiro's own interface. OmniRoute's README marks Kiro `tos: avoid` for automatic routing. The live combos already prefer Kiro, and Kiro is the healthiest provider in the usage window (240 requests, 232 ok). Those rows stay until a measured change. New public defaults do not put Kiro on `auto`. A second Kiro account is not a documented quota multiplier.

RouteLLM, FrugalGPT, Hybrid LLM, and AutoMix were measured on chat or exam tasks. They do not justify a learned router in this companion. SWE-bench does not rank combo members.

The full citation list is `docs/COMPETITOR-RESEARCH.md`.

## Decisions held for the next phase

1. Limitless stays the policy, setup, diagnostic, and prompt layer. OmniRoute stays the data plane. Do not run `setup` or `init` against the live database. The next combo edit is a scoped SQL change after a backup, not a setup rerun.
2. The live six combos are the asset. `config/tier-configuration.json` is not the asset.
3. The first combo change to design, after a database backup, is Opus: stop giving Haiku-class and 20B entries an equal turn with the coding models. Measure before deleting a provider that still works.
4. Desktop setup, when it is written, points Code sessions at Developer → Configure Third-Party Inference. It does not tell anyone to put a model host in `claude_desktop_config.json`. Official Cowork stays on Anthropic's cloud. The two local Desktop combos stay in the database under their current names, with that distinction in the docs.
5. The next code change that is justified without a combo rewrite: stop `setx` from storing tokens, and stop doctor from printing key slices. Prove Claude Code still starts before clearing the existing user-env token. Settings `env` overwrites the shell for most Claude Code sessions, so `setx` is the wrong place for the token even when the CLI works.
6. Client sources, the code map, and the router comparison are filed. CLI upgrade from 2.1.310 to 2.1.322 was not run. The VS Code and Cursor extensions are already on 2.1.322.

## Explicitly not done

- No backup was required, because nothing was written to the database or to Claude settings.
- No model was added or removed.
- No release, tag, or push.
- No claim that any combo "works" beyond the database contents and the historical usage counts above.
