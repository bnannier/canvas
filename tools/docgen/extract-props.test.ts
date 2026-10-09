import { beforeAll, expect, test } from "bun:test";
import * as path from "node:path";
import * as ts from "typescript";
import { extractProps } from "./extract-props.ts";

const root = path.resolve(import.meta.dir, "../..");
const read = (dir: string) => extractProps([{ dir, file: path.join(root, `src/atoms/${dir}/${dir}.shared.tsx`) }])[dir];

// Loading the kit's full TypeScript project is fixture setup, not a five-second
// performance assertion on the first control. Keep a bounded cold-start budget.
beforeAll(() => { read("button"); }, 30_000);

test("public control refs are resolved from the factory return type and document their actual hosts", () => {
  for (const dir of ["button", "select", "checkbox", "switch", "radio", "slider"]) {
    const group = read(dir)[0];
    const rows = group.props.filter((prop) => prop.name === "ref");
    expect(rows.length).toBe(1);
    expect(rows[0].type).toBe("React.Ref<View>");
    expect(rows[0].required).toBe(false);
    expect(rows[0].description).toContain("interactive");
    expect(rows[0].description).toContain("Native host behavior depends");
    expect(rows[0].description).toContain("React Native Web");
    expect(rows[0].description).toContain("DOM");
    expect(rows[0].description).toContain("accessibility focus");
    expect(group.props.some((prop) => prop.name === "disabled")).toBe(true);
    expect(group.props.some((prop) => prop.name === "key")).toBe(false);
  }
});

test("existing text input refs retain their resolved text host type", () => {
  const ref = read("input")[0].props.find((prop) => prop.name === "ref");
  expect(ref?.type).toMatch(/^React.Ref<(RNTextInput|TextInput)>$/);
  expect(ref?.type).not.toContain("<T>");
});

test("ordinary factories do not acquire an invented ref prop", () => {
  expect(read("badge")[0].props.some((prop) => prop.name === "ref")).toBe(false);
});

test("a matching factory name cannot attach another structurally identical props type's ref", () => {
  const file = path.join(import.meta.dir, "fixtures/ref-factories.tsx");
  const prog = ts.createProgram([file], {
    strict: true, skipLibCheck: true, jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
  });
  expect(ts.getPreEmitDiagnostics(prog).map((diagnostic) => diagnostic.messageText)).toEqual([]);
  const groups = extractProps([{ dir: "fixtures", file }], prog).fixtures;
  expect(groups.find((group) => group.name === "CorrectProps")?.props.find((prop) => prop.name === "ref")?.description)
    .toBe("Ref owned by Correct.");
  expect(groups.find((group) => group.name === "MistakenProps")?.props.some((prop) => prop.name === "ref")).toBe(false);
  expect(groups.find((group) => group.name === "OtherProps")?.props.some((prop) => prop.name === "ref")).toBe(false);
});

test("a `//` comment that wraps is read whole, and a blank line, a block comment or a previous member's trailing comment bounds it", () => {
  const file = path.join(import.meta.dir, "fixtures/line-comments.tsx");
  const prog = ts.createProgram([file], { strict: true, skipLibCheck: true, jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext });
  const rows = Object.fromEntries(extractProps([{ dir: "fixtures", file }], prog).fixtures[0].props.map((prop) => [prop.name, prop.description]));
  expect(rows).toEqual({
    label: "A JSDoc description wins over any line comment.",
    destructive: "Tone (pick one; default neutral): a red title and a destructive Button. The run wraps over two lines.",
    small: "Size (pick one). A one-line header carries to the axis's later booleans.",
    large: "Size (pick one). A one-line header carries to the axis's later booleans.",
    disabled: "State.",
    success: "Two families: Semantic status: success / warning.",
    warning: "Two families: Semantic status: success / warning.",
    compact: "Only this line is read.",
    dense: "Only this line is read.",
    loose: "Loose comes after it.",
  });
});

test("ActionPanel's axis rows read their whole wrapped comments", () => {
  const file = path.join(root, "src/molecules/action-panels/action-panels.shared.tsx");
  const rows = Object.fromEntries(extractProps([{ dir: "action-panels", file }])["action-panels"][0].props.map((prop) => [prop.name, prop.description]));
  expect(rows.destructive).toBe("Tone (omit for the neutral, primary-action default): a red title and a destructive Button. A toggle's Switch label carries no tone.");
  expect(rows.inline).toBe("Layout (pick one; default stacks the action below the copy). Inline stacks too when the row is narrower than the `md` measure.");
  expect(rows.toggle).toBe("Affordance: render the action as an on/off Switch instead of a Button. The panel is the Switch's own setting row in this mode: the title is its label and the description its muted line, and the whole row toggles.");
});
