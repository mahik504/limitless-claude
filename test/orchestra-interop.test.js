const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const { OrchestraAdapter } = require("../src/integrations/orchestra/adapter");

test.describe("Limitless Claude 8.2 - Orchestra 4.5.0 Interoperability Suite", () => {

  test.it("Standalone Fallback - should fall back cleanly when Orchestra is absent", () => {
    const adapter = new OrchestraAdapter({ enabled: false });

    assert.equal(adapter.isAvailable(), false);
    const result = adapter.consumeContract({ task: "award-style site" });

    assert.equal(result.mode, "STANDALONE_FALLBACK");
    assert.equal(result.active, false);
    assert.equal(result.capability, "balanced");
    assert.equal(result.tier, "limitless-sonnet-5.5");
  });

  test.it("Orchestra 4.5.0 Contract Mapping - maps tasks to capabilities and frontier tiers", () => {
    const adapter = new OrchestraAdapter({ enabled: true });
    assert.equal(adapter.isAvailable(), true);

    // 1. 3D task
    const res3D = adapter.consumeContract({ task: "One 3D scene with ow-3d-engineering" });
    assert.equal(res3D.capability, "3d");
    assert.equal(res3D.recommendedTier, "limitless-opus-4.6");

    // 2. Frontend task
    const resFront = adapter.consumeContract({ task: "Award-style site with taste-design" });
    assert.equal(resFront.capability, "frontend");
    assert.equal(resFront.recommendedTier, "limitless-opus-4.6");

    // 3. Backend task
    const resBack = adapter.consumeContract({ task: "SaaS backend with ow-backend-architecture" });
    assert.equal(resBack.capability, "backend");
    assert.equal(resBack.recommendedTier, "limitless-opus-4.6");

    // 4. Architecture / reasoning
    const resArch = adapter.consumeContract({ task: "ow-diagrams architecture" });
    assert.equal(resArch.capability, "reasoning");
    assert.equal(resArch.recommendedTier, "limitless-sonnet-5.5");

    // 5. Fast patch
    const resFast = adapter.consumeContract({ task: "Fast syntax patch" });
    assert.equal(resFast.capability, "fast");
    assert.equal(resFast.recommendedTier, "limitless-haiku-4.5");

    // 6. Documentation / paper
    const resDoc = adapter.consumeContract({ task: "Paper with ow-research-paper and humanizer" });
    assert.equal(resDoc.capability, "documentation");
    assert.equal(resDoc.recommendedTier, "limitless-sonnet-5.5");
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
