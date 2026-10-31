import { describe, expect, it } from "bun:test";
import { attach, describe as describeViolations, partitionAuthoredPaletteTargets, summarize } from "../../e2e/support/axe.ts";

type RawViolation = Parameters<typeof summarize>[0][number];
const raw: RawViolation = {
  id: "color-contrast",
  impact: "serious",
  tags: ["wcag2aa"],
  description: "Text must meet its contrast threshold",
  help: "Elements must meet minimum color contrast ratio thresholds",
  helpUrl: "https://dequeuniversity.com/rules/axe/4.11/color-contrast",
  nodes: [
    {
      html: '<span id="action">Take Photo</span>',
      target: ["#action"],
      impact: "serious",
      failureSummary: "Expected 4.5:1, received 3.87:1",
      any: [{ id: "color-contrast", impact: "serious", message: "Insufficient contrast",
        data: { fgColor: "#615fff", bgColor: "#18181b", contrastRatio: 3.87, expectedContrastRatio: "4.5:1" },
        relatedNodes: [{ html: '<div id="sheet"></div>', target: ["#sheet"] }],
      }],
      all: [],
      none: [],
    },
    {
      html: '<span id="cancel">Cancel</span>',
      target: ["#cancel"],
      impact: "serious",
      failureSummary: "Expected 4.5:1, received 3.87:1",
      any: [], all: [], none: [],
    },
  ],
};

describe("axe report diagnostics", () => {
  it("retains every raw node and check while keeping console text concise", () => {
    const findings = summarize([raw]);
    expect(findings[0].nodes).toBe(2);
    expect(findings[0].target).toBe("#action");
    expect(findings[0].raw).toBe(raw);
    const text = describeViolations(findings);
    expect(text).toContain("2 node(s), first at #action");
    expect(text).not.toContain("<span");
    expect(text).not.toContain("relatedNodes");
  });

  it("attaches a compact summary and complete raw results without losing check data", async () => {
    const attachments: { name: string; body: unknown }[] = [];
    await attach({ attach: async (name, options) => {
      expect(options?.contentType).toBe("application/json");
      attachments.push({ name, body: JSON.parse(String(options?.body)) });
    } }, "action-sheet", summarize([raw]));
    expect(attachments.map(({ name }) => name)).toEqual(["axe-action-sheet.json", "axe-action-sheet-raw.json"]);
    expect(attachments[0].body).toEqual([{ id: raw.id, impact: raw.impact, help: raw.help, nodes: 2, target: "#action" }]);
    expect(attachments[1].body).toEqual([raw]);
  });

  it("does not attach empty reports", async () => {
    let calls = 0;
    await attach({ attach: async () => { calls += 1; } }, "empty", []);
    expect(calls).toBe(0);
  });
});

const paletteTargets = ["Violet", "Cyan", "Mint", "Rose", "Amber"].map((name) => `div[aria-label="${name}"]`);
const paletteViolation = (): RawViolation => ({
  ...raw,
  id: "target-size",
  nodes: paletteTargets.map((target) => ({
    ...raw.nodes[0], target: [target],
    any: [
      { id: "target-size", impact: "serious", message: "16px target", data: { width: 16, height: 16, minSize: 24 }, relatedNodes: [] },
      { id: "target-offset", impact: "serious", message: "20px safe space", data: { closestOffset: 20, minOffset: 24 }, relatedNodes: [] },
    ],
  })),
});

describe("authored navbar palette target-size policy", () => {
  it("reports exactly the five validated palette nodes without modifying the full raw report", async () => {
    const violation = paletteViolation();
    const findings = summarize([violation]);
    const before = JSON.stringify(findings);
    const result = partitionAuthoredPaletteTargets(findings, new Set(paletteTargets));
    expect(result.enforced).toEqual([]);
    expect(result.excepted[0].raw.nodes).toEqual(violation.nodes);
    expect(JSON.stringify(findings)).toBe(before);
    const attachments: unknown[] = [];
    await attach({ attach: async (_name, options) => { attachments.push(JSON.parse(String(options?.body))); } }, "shell", findings);
    expect(attachments[1]).toEqual([violation]);
  });

  it("still fails another target-size node in the same rule and unrelated rules", () => {
    const violation = paletteViolation();
    const unrelated = { ...violation.nodes[0], target: ["#small-save-button"] };
    violation.nodes.push(unrelated);
    const result = partitionAuthoredPaletteTargets(summarize([violation, raw]), new Set(paletteTargets));
    expect(result.excepted[0].nodes).toBe(5);
    expect(result.enforced.find((finding) => finding.id === "target-size")?.raw.nodes).toEqual([unrelated]);
    expect(result.enforced.find((finding) => finding.id === "color-contrast")?.raw).toBe(raw);
  });

  it("does not exempt selectors unless the live shell validated all five", () => {
    const findings = summarize([paletteViolation()]);
    for (const targets of [[], paletteTargets.slice(1), [...paletteTargets, "#another-radio"]]) {
      const result = partitionAuthoredPaletteTargets(findings, new Set(targets));
      expect(result.excepted).toEqual([]);
      expect(result.enforced).toEqual(findings);
    }
  });

  it("fails closed on changed dimensions, spacing, missing nodes, or duplicate nodes", () => {
    const changedSize = paletteViolation();
    changedSize.nodes[0].any[0].data.width = 15;
    const changedSpacing = paletteViolation();
    changedSpacing.nodes[0].any[1].data.closestOffset = 19;
    const missing = paletteViolation();
    missing.nodes.pop();
    const duplicate = paletteViolation();
    duplicate.nodes[4] = duplicate.nodes[0];
    for (const violation of [changedSize, changedSpacing, missing, duplicate]) {
      const findings = summarize([violation]);
      const result = partitionAuthoredPaletteTargets(findings, new Set(paletteTargets));
      expect(result.excepted).toEqual([]);
      expect(result.enforced).toEqual(findings);
    }
  });
});
