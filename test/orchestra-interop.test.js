const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const { OrchestraAdapter } = require("../src/integrations/orchestra/adapter");

test.describe("Limitless Claude 8.0 - Optional Orchestra Interoperability Suite", () => {

  test.it("Standalone Fallback - should fall back cleanly when Orchestra is absent", () => {
    // Explicitly disabled/absent adapter
    const adapter = new OrchestraAdapter({ enabled: false });

    assert.equal(adapter.isAvailable(), false);
    const result = adapter.consumeContract({ task: "award-style site" });

    assert.equal(result.mode, "STANDALONE_FALLBACK");
    assert.equal(result.active, false);
    assert.equal(result.capability, "balanced");
    assert.equal(result.tier, "limitless-sonnet-5.5");
  });

  test.it("Contract Mapping - should accurately map Orchestra tasks to Limitless capabilities when enabled", () => {
    const adapter = new OrchestraAdapter({ enabled: true });
    assert.equal(adapter.isAvailable(), true);

    // 1. 3D task
    const res3D = adapter.consumeContract({ task: "One 3D scene with R3F shaders" });
    assert.equal(res3D.capability, "3d");
    assert.equal(res3D.recommendedTier, "limitless-opus-4.6");

    // 2. Frontend task
    const resFront = adapter.consumeContract({ task: "Award-style site with React 19" });
    assert.equal(resFront.capability, "frontend");
    assert.equal(resFront.recommendedTier, "limitless-opus-4.6");

    // 3. Backend task
    const resBack = adapter.consumeContract({ task: "SaaS backend with PostgreSQL RLS" });
    assert.equal(resBack.capability, "backend");
    assert.equal(resBack.recommendedTier, "limitless-opus-4.6");

    // 4. Architecture / reasoning
    const resArch = adapter.consumeContract({ task: "Architecture diagram and reasoning review" });
    assert.equal(resArch.capability, "reasoning");
    assert.equal(resArch.recommendedTier, "limitless-sonnet-5.5");

    // 5. Fast patch
    const resFast = adapter.consumeContract({ task: "Fast syntax patch" });
    assert.equal(resFast.capability, "fast");
    assert.equal(resFast.recommendedTier, "limitless-haiku-4.5");
  });

  test.it("Architectural Isolation - core runtime must NEVER import Orchestra modules", () => {
    const coreDir = path.resolve(__dirname, "../src/core");
    const coreFiles = fs.readdirSync(coreDir).filter(f => f.endsWith(".js"));

    for (const file of coreFiles) {
      const content = fs.readFileSync(path.join(coreDir, file), "utf8");
      assert.ok(
        !content.includes("orchestra") && !content.includes("OrchestraAdapter"),
        `Violation of Standalone Principle: ${file} imports or references Orchestra!`
      );
    }
  });

});
