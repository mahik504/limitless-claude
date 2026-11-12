# Client primary sources

Opened 13 November 2026 by the client-docs pass. Local checks the same day are marked separately. No credentials are recorded here.

## Claude Code CLI

Newest release on the GitHub index and on npm `latest`: `2.1.322`, published 2026-11-10. This PC's `claude --version` is `2.1.310`. The CLI was not upgraded.

- https://github.com/anthropics/claude-code/releases/tag/v2.1.322
- https://code.claude.com/docs/en/env-vars
- https://code.claude.com/docs/en/llm-gateway-connect
- https://code.claude.com/docs/en/settings
- https://code.claude.com/docs/en/model-config
- https://code.claude.com/docs/en/llm-gateway-protocol

`ANTHROPIC_BASE_URL` in the `env` block of `%USERPROFILE%\.claude\settings.json` is the supported way to send the CLI to a gateway. For most sessions that file wins over a shell variable with the same name. A managed settings file wins over the user file.

Model choice, highest first: `/model`, then `claude --model`, then `ANTHROPIC_MODEL`, then the `model` key, then `ANTHROPIC_DEFAULT_MODEL` on v2.1.236 and later. Aliases `haiku`, `sonnet`, `opus`, and `fable` resolve to provider defaults. Pin them with `ANTHROPIC_DEFAULT_HAIKU_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_OPUS_MODEL`, and `ANTHROPIC_DEFAULT_FABLE_MODEL`.

This PC's user file has `model` set to `fable` and `ANTHROPIC_BASE_URL` set to `http://localhost:20128`. The four pin variables are unset. `primaryModel` is `claude-opus-5-5` and is not in that precedence list.

A gateway that is not `api.anthropic.com` receives Claude Code's attribution block, the same beta headers, and `thinking: {"type":"adaptive"}` for an unrecognized model name. `cache_control` has to pass through unchanged. Remote Control is off when the host is not `api.anthropic.com` (since v2.1.196).

## VS Code

The extension does not use the CLI settings file for its login check. The documented setting is `claudeCode.environmentVariables`.

This PC, read from `%APPDATA%\Code\User\settings.json`:

- Extension directory `anthropic.claude-code-2.1.322-win32-x64`
- `ANTHROPIC_BASE_URL` = `http://127.0.0.1:20128`
- An auth token is present in that setting. It was not copied here
- `CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY` = `0`

The extension was not launched for this note.

## Cursor

https://cursor.com/docs/settings/api-keys documents an Anthropic API key that Cursor's backend uses. It does not document `ANTHROPIC_BASE_URL`.

This PC's `%APPDATA%\Cursor\User\settings.json` has no `claudeCode` settings and no `ANTHROPIC_BASE_URL`. The Claude Code extension directory `anthropic.claude-code-2.1.322-win32-x64` is installed under Cursor's extensions folder. Official docs say `~/.claude/settings.json` reaches the spawned process and does not satisfy the extension login check. Launch was not tested.

## Claude Desktop and Cowork

https://code.claude.com/docs/en/desktop

`claude_desktop_config.json` is the MCP file. On this PC it contains only `mcpServers`: orchestra-brain, context7, playwright, stitch, shadcn, magic-ui. `%APPDATA%\Claude` has that file and a `.bak-4.6.0` copy. No model host is in it.

Desktop sets `ANTHROPIC_BASE_URL` itself for local Code sessions. A value in `~/.claude/settings.json` is ignored there. The documented gateway path for those sessions is Developer → Configure Third-Party Inference, after Help → Troubleshooting → Enable Developer Mode. With that form on, Anthropic-hosted cloud environments and Remote Control are unavailable. The pages do not say whether the form replaces ordinary Desktop chat. That remains unspecified.

https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork

Cowork is an official Anthropic product. Sessions run in the cloud on Anthropic's servers. A local combo named Cowork does not move those sessions onto OmniRoute.

## Agent SDK and Antigravity

https://code.claude.com/docs/en/agent-sdk/overview — the Agent SDK runs the Claude Code binary. It can pass `ANTHROPIC_BASE_URL`. The documented other providers are Bedrock, Claude on AWS, Google Cloud's Agent Platform, and Microsoft Foundry.

https://github.com/anthropics/claude-agent-sdk-python/issues/410 — an issue comment (closed 24 Mar 2026) says the SDK is for Anthropic's Claude models and that pointing the base URL at LiteLLM is not officially supported. That comment is not the docs site.

https://antigravity.google/changelog.md — `agy plugin import claude` imports plugins, MCP servers, skills, and commands.

https://antigravity.google/docs/enterprise/ — Claude Opus 5.5 and Sonnet 5.5 can be selected as partner models inside Antigravity. No custom Anthropic base URL is documented there. No page in this pass says Antigravity embeds the Claude Code CLI.
