import { expect, test } from "bun:test";
import { propsToJsx } from "./jsx-code";

test("boolean true is a bare attribute; false/undefined are omitted", () => {
  expect(propsToJsx("Button", { primary: true, ghost: false, large: undefined })).toBe("<Button primary />");
});

test("strings are quoted, numbers are braced", () => {
  expect(propsToJsx("Input", { placeholder: "Email", rows: 4 })).toBe('<Input placeholder="Email" rows={4} />');
});

test("string children render inside the tag", () => {
  expect(propsToJsx("Button", { primary: true, children: "Save changes" })).toBe(
    "<Button primary>Save changes</Button>",
  );
});

test("functions (event handlers) are skipped", () => {
  expect(propsToJsx("Pagination", { page: 2, total: 12, onChange: () => {} })).toBe(
    "<Pagination page={2} total={12} />",
  );
});

test("a string array renders inline", () => {
  expect(propsToJsx("Breadcrumb", { items: ["Home", "Settings"], chevron: true })).toBe(
    '<Breadcrumb items={["Home", "Settings"]} chevron />',
  );
});

test("an array of objects renders multi-line", () => {
  const code = propsToJsx("Stacked", {
    items: [
      { name: "A", meta: "x" },
      { name: "B", meta: "y" },
    ],
  });
  expect(code).toBe(
    '<Stacked\n  items={[\n    { name: "A", meta: "x" },\n    { name: "B", meta: "y" }\n  ]}\n/>',
  );
});

test("a long single line wraps to multi-line", () => {
  const code = propsToJsx("Navbar", {
    brand: "Canvas",
    links: ["Dashboard", "Users", "Settings"],
    active: 0,
    actionLabel: "New",
    avatar: "RC",
    bordered: true,
  });
  expect(code.startsWith("<Navbar\n")).toBe(true);
  expect(code).toContain('  brand="Canvas"');
  expect(code).toContain("  bordered");
  expect(code.endsWith("\n/>")).toBe(true);
});

test("computed boolean keys serialize (badge status)", () => {
  expect(propsToJsx("Badge", { status: true, success: true, children: "active" })).toBe(
    "<Badge status success>active</Badge>",
  );
});
