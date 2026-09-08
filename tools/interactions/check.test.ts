import { expect, test } from "bun:test";
import { checkRegistry, declaredCases } from "./check";
import type { InteractionEvidence } from "./registry";

const item: InteractionEvidence = { id: "pick", components: ["listbox"], layer: "browser-touch", file: "e2e/pick.ts", test: "@interaction:pick" };
const source = 'test("pick once", { tag: "@interaction:pick" }, async () => { await row.tap(); expect(changes).toBe(1); });';

test("registry rejects added/removed components and stale executable evidence", () => {
  expect(checkRegistry(["listbox"], ["listbox"], [item], () => source).errors).toEqual([]);
  expect(checkRegistry(["listbox", "new-control"], ["listbox"], [item], () => source).errors).toContain("Unregistered component: new-control");
  expect(checkRegistry([], ["listbox"], [item], () => source).errors).toContain("Removed component still registered: listbox");
  for (const stale of [`// ${source}`, source.replace("test(", "test.skip("), `describe.skip("old suite", () => { ${source} });`]) {
    expect(checkRegistry(["listbox"], ["listbox"], [item], () => stale).errors[0]).toContain("Missing active test");
  }
  expect(checkRegistry(["listbox"], ["listbox"], [item, item], () => source).errors).toContain("Duplicate interaction ID: pick");
  expect(checkRegistry(["listbox"], ["listbox"], [{ ...item, file: "e2e/../../outside.ts" }], () => source).errors[0]).toContain("Unsafe evidence path");
});

test("DOM and browser declarations never manufacture native or screen reader results", () => {
  const result = checkRegistry(["listbox"], ["listbox"], [item], () => source);
  expect(result.rows[0].nativeRuntime).toBe("not-recorded");
  expect(result.rows[0].voiceOver).toBe("not-recorded");
  expect(result.rows[0].talkBack).toBe("not-recorded");
  expect(declaredCases('it("unit selection", () => {});')).toEqual(new Set(["unit selection"]));
});
