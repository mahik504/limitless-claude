const test = require("node:test");
const assert = require("node:assert/strict");

const { SessionManager } = require("../src/core/session-manager");
const { ContextManager } = require("../src/core/context-manager");

test.describe("Limitless Claude 8.0 - Session & Context Intelligence Suite", () => {

  test.it("SessionManager - should manage session lifecycle, turns, and atomic checkpoints", () => {
    const sm = new SessionManager();
    const session = sm.createSession({ objective: "Implement fullstack authentication" });

    assert.ok(session.sessionId.startsWith("sess_"));
    assert.equal(session.activeObjective, "Implement fullstack authentication");

    // Record turns
    sm.recordTurn(session.sessionId, "user", "Create schema.sql");
    sm.recordTurn(session.sessionId, "assistant", "Created schema.sql");
    assert.equal(session.turns.length, 2);

    // Create checkpoint
    const chk = sm.createCheckpoint(session.sessionId, "after_schema");
    assert.ok(chk.checkpointId.startsWith("chk_"));
    assert.equal(chk.turnCount, 2);

    // Record further turns that will be rolled back
    sm.recordTurn(session.sessionId, "user", "Run broken command");
    sm.recordTurn(session.sessionId, "assistant", "Error: command failed");
    assert.equal(session.turns.length, 4);

    // Rollback to checkpoint
    const rollbackRes = sm.restoreCheckpoint(session.sessionId, chk.checkpointId);
    assert.equal(rollbackRes.turnCount, 2);
    assert.equal(session.turns.length, 2);
    assert.equal(session.turns[1].content, "Created schema.sql");
  });

  test.it("ContextManager - should estimate tokens and trigger threshold warnings", () => {
    const cm = new ContextManager({ defaultMaxTokens: 1000 });
    const messages = [
      { role: "user", content: "Short message" },
      { role: "assistant", content: "Short response" }
    ];

    const tokens = cm.estimateTokens(messages);
    assert.ok(tokens > 0 && tokens < 50);

    const checkSafe = cm.isNearLimit(messages, 1000);
    assert.equal(checkSafe.isWarning, false);
    assert.equal(checkSafe.isCritical, false);

    // Massive messages near 1000 tokens
    const longMessages = [
      { role: "user", content: "A".repeat(3500) } // ~920 tokens
    ];
    const checkWarning = cm.isNearLimit(longMessages, 1000);
    assert.equal(checkWarning.isWarning, true);
  });

  test.it("ContextManager - should compact verbose intermediate tool outputs while preserving recent turns", () => {
    const cm = new ContextManager({ defaultMaxTokens: 500, maxToolOutputChars: 200 });

    const messages = [
      { role: "user", content: "Initial goal: Build backend" },
      { role: "assistant", content: "Executing migration" },
      { role: "tool", content: "DUMP: " + "X".repeat(2000) }, // Verbose tool turn
      { role: "user", content: "Next step" },
      { role: "assistant", content: "Done with next step" },
      { role: "user", content: "Final question" },
      { role: "assistant", content: "Final answer" }
    ];

    const compactRes = cm.compactContext(messages, { maxTokens: 500, preserveRecentTurns: 4 });
    assert.equal(compactRes.compacted, true);
    assert.ok(compactRes.savings > 0);

    // Intermediate tool output should be compressed
    const compressedToolMsg = compactRes.messages[2];
    assert.ok(compressedToolMsg.content.includes("Context Manager"));
    assert.ok(compressedToolMsg.content.length < 500);

    // Initial objective and recent turns must be preserved intact
    assert.equal(compactRes.messages[0].content, "Initial goal: Build backend");
    assert.equal(compactRes.messages[6].content, "Final answer");
  });

});
