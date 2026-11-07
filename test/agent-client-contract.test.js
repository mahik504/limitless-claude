const test = require("node:test");
const assert = require("node:assert/strict");

const { CLIENT_TYPES, AgentClientManager } = require("../src/core/agent-client");

test.describe("Limitless Claude 8.0 - Agent Client Protocol Contract Suite", () => {
  const manager = new AgentClientManager();

  test.it("Tool Schema Translation - should translate between Anthropic and OpenAI schemas", () => {
    const anthropicTools = [
      {
        name: "read_file",
        description: "Read contents of a file",
        input_schema: {
          type: "object",
          properties: {
            path: { type: "string" }
          },
          required: ["path"]
        }
      }
    ];

    // Anthropic -> OpenAI
    const openAiTools = manager.translateToolsToOpenAI(anthropicTools);
    assert.equal(openAiTools.length, 1);
    assert.equal(openAiTools[0].type, "function");
    assert.equal(openAiTools[0].function.name, "read_file");
    assert.deepEqual(openAiTools[0].function.parameters, anthropicTools[0].input_schema);

    // OpenAI -> Anthropic roundtrip
    const roundtripAnthropic = manager.translateToolsToAnthropic(openAiTools);
    assert.equal(roundtripAnthropic.length, 1);
    assert.equal(roundtripAnthropic[0].name, "read_file");
    assert.deepEqual(roundtripAnthropic[0].input_schema, anthropicTools[0].input_schema);
  });

  test.it("Message & Tool Call Translation - should translate Anthropic tool_use and tool_result to OpenAI", () => {
    const anthropicPayload = {
      system: "You are a coding assistant",
      messages: [
        { role: "user", content: "Check package.json" },
        {
          role: "assistant",
          content: [
            { type: "text", text: "Let me check." },
            {
              type: "tool_use",
              id: "call_abc123",
              name: "read_file",
              input: { path: "package.json" }
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: "call_abc123",
              content: '{"name":"limitless-claude"}'
            }
          ]
        }
      ]
    };

    // Format for OpenAI client (e.g. OpenCode or Cursor)
    const openAiFormatted = manager.formatPayloadForClient(anthropicPayload, CLIENT_TYPES.OPENCODE);

    assert.equal(openAiFormatted.system, undefined);
    assert.equal(openAiFormatted.messages[0].role, "system");
    assert.equal(openAiFormatted.messages[0].content, "You are a coding assistant");

    // Assistant turn with tool_calls
    const assistantMsg = openAiFormatted.messages[2];
    assert.equal(assistantMsg.role, "assistant");
    assert.equal(assistantMsg.content, "Let me check.");
    assert.equal(assistantMsg.tool_calls.length, 1);
    assert.equal(assistantMsg.tool_calls[0].id, "call_abc123");
    assert.equal(assistantMsg.tool_calls[0].function.name, "read_file");
    assert.deepEqual(JSON.parse(assistantMsg.tool_calls[0].function.arguments), { path: "package.json" });

    // Tool result turn
    const toolResultMsg = openAiFormatted.messages[3];
    assert.equal(toolResultMsg.role, "tool");
    assert.equal(toolResultMsg.tool_call_id, "call_abc123");
    assert.equal(toolResultMsg.content, '{"name":"limitless-claude"}');
  });

  test.it("Message & Tool Call Translation - should translate OpenAI tool_calls and tool messages back to Anthropic", () => {
    const openAiPayload = {
      messages: [
        { role: "system", content: "You are an expert engineer." },
        { role: "user", content: "Run tests" },
        {
          role: "assistant",
          content: "Running test runner...",
          tool_calls: [
            {
              id: "call_test_01",
              type: "function",
              function: {
                name: "bash",
                arguments: '{"command":"npm test"}'
              }
            }
          ]
        },
        {
          role: "tool",
          tool_call_id: "call_test_01",
          content: "PASS: 71 tests passed"
        }
      ]
    };

    // Format for Claude Code CLI
    const anthropicFormatted = manager.formatPayloadForClient(openAiPayload, CLIENT_TYPES.CLAUDE_CODE_CLI);

    assert.equal(anthropicFormatted.system, "You are an expert engineer.");
    assert.equal(anthropicFormatted.messages.length, 3);

    // Assistant turn
    const assistantTurn = anthropicFormatted.messages[1];
    assert.equal(assistantTurn.role, "assistant");
    assert.equal(assistantTurn.content.length, 2);
    assert.equal(assistantTurn.content[0].type, "text");
    assert.equal(assistantTurn.content[0].text, "Running test runner...");
    assert.equal(assistantTurn.content[1].type, "tool_use");
    assert.equal(assistantTurn.content[1].id, "call_test_01");
    assert.equal(assistantTurn.content[1].name, "bash");
    assert.deepEqual(assistantTurn.content[1].input, { command: "npm test" });

    // Tool result turn
    const userResultTurn = anthropicFormatted.messages[2];
    assert.equal(userResultTurn.role, "user");
    assert.equal(userResultTurn.content[0].type, "tool_result");
    assert.equal(userResultTurn.content[0].tool_use_id, "call_test_01");
    assert.equal(userResultTurn.content[0].content, "PASS: 71 tests passed");
  });

  test.it("Streaming SSE Chunk Translation - should normalize chunks across protocols", () => {
    // OpenAI chunk -> Anthropic content_block_delta
    const openAiChunk = { choices: [{ delta: { content: "Streaming token" } }] };
    const anthropicChunk = manager.translateOpenAIToAnthropicChunk(openAiChunk);
    assert.equal(anthropicChunk.type, "content_block_delta");
    assert.equal(anthropicChunk.delta.text, "Streaming token");

    // Anthropic chunk -> OpenAI delta
    const roundtripOpenAi = manager.translateAnthropicToOpenAIChunk(anthropicChunk);
    assert.equal(roundtripOpenAi.choices[0].delta.content, "Streaming token");
  });

  test.it("Client Detection - should recognize user-agent signatures for all 6 target clients", () => {
    assert.equal(manager.detectClient({}, "claude-code/0.2.29 darwin-arm64"), CLIENT_TYPES.CLAUDE_CODE_CLI);
    assert.equal(manager.detectClient({}, "claude-code-extension-vscode/1.0"), CLIENT_TYPES.CLAUDE_CODE_EXT);
    assert.equal(manager.detectClient({}, "opencode-cli/0.1.0"), CLIENT_TYPES.OPENCODE);
    assert.equal(manager.detectClient({}, "Cursor/0.42.0 (code-agent)"), CLIENT_TYPES.CURSOR);
    assert.equal(manager.detectClient({}, "Antigravity/2.0"), CLIENT_TYPES.ANTIGRAVITY);
    assert.equal(manager.detectClient({ "anthropic-version": "2023-06-01" }, ""), CLIENT_TYPES.GENERIC_ANTHROPIC);
    assert.equal(manager.detectClient({}, "python-requests/2.31"), CLIENT_TYPES.GENERIC_OPENAI);
  });

});
