import { describe, expect, it } from "bun:test";
import { attach, describe as describeViolations, summarize } from "../../e2e/support/axe.ts";

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
