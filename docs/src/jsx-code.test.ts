import { expect, test } from "bun:test";
import { propsToJsx, serializeTree } from "./jsx-code";

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

test("serializeTree: a single element with a text child is one line", () => {
  expect(serializeTree({ type: "Badge", props: { secondary: true }, children: "employee" })).toBe(
    "<Badge secondary>employee</Badge>",
  );
});

test("serializeTree: a self-closing element has no children", () => {
  expect(serializeTree({ type: "Avatar", props: { name: "Rachel Chen" } })).toBe('<Avatar name="Rachel Chen" />');
});

test("serializeTree: a composite row nests and indents children", () => {
  const code = serializeTree({
    type: "Box",
    props: { className: "flex-row items-center gap-2" },
    children: [
      { type: "Text", props: { className: "font-semibold" }, children: "Rachel Chen" },
      { type: "Badge", props: { status: true, success: true }, children: "active" },
      { type: "Badge", props: { secondary: true }, children: "employee" },
    ],
  });
  expect(code).toBe(
    [
      '<Box className="flex-row items-center gap-2">',
      '  <Text className="font-semibold">Rachel Chen</Text>',
      "  <Badge status success>active</Badge>",
      "  <Badge secondary>employee</Badge>",
      "</Box>",
    ].join("\n"),
  );
});
