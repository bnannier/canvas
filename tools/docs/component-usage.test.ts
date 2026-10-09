import { describe, expect, it } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { allowedDocsUsage, exceptionFootprintErrors, formatDocsUsage, inspectDocsSource, inspectDocsTree, type DocsUsageException } from "./component-usage.ts";

const inspect = (source: string) => inspectDocsSource("docs/src/example.tsx", source);
const keys = (source: string) => inspect(source).flatMap(finding => finding.keys);

describe("docs component dogfood guard", () => {
  it("accepts real components and unstyled primitives", () => {
    expect(inspect(`import { View, Button, Typography, Column } from "@nannier/canvas";
      const Example = () => <Column snug><View /><Button primary>Save</Button><Typography small>Help</Typography></Column>;`)).toEqual([]);
  });

  it("finds styled look-alikes despite Canvas imports and aliases", () => {
    expect(keys(`import { Pressable as Control, Text as Label } from "@nannier/canvas";
      function Example() { return <Control style = {{ borderRadius: 10, padding: 12 }}><Label style={{fontSize: 12}}>Save</Label></Control>; }`)).toEqual(["borderRadius", "padding", "fontSize"]);
  });

  it("follows stylesheet entries, aliases, arrays, spreads and callbacks", () => {
    expect(keys(`const styles = StyleSheet.create({ button: { backgroundColor: "red", padding: 10 } });
      const shared = styles.button;
      const other = { marginTop: 4 };
      const Example = () => <Pressable style={({pressed}) => [shared, pressed && {...other, opacity: .8}]} />;`
    )).toEqual(["backgroundColor", "marginTop", "opacity", "padding"]);
  });

  it("checks contentContainerStyle and unresolved style values", () => {
    expect(keys(`const Example = () => <ScrollView contentContainerStyle={{gap: 10}} style={externalStyle} />;`)).toEqual(["gap", "<unresolved style>"]);
  });

  it("does not grant a source-comment bypass or ignore string/computed style keys", () => {
    expect(keys(`const Example = () => <View style={{ "padding": 10, ["borderRadius"]: 8, [dynamic]: 1 }} />; // docgen-allow-style: demo`)).toEqual(["<computed style key>", "borderRadius", "padding"]);
  });

  it("finds style and className hidden in nested JSX props spreads", () => {
    expect(keys(`const style = {padding: 12}; const inner = {style}; const props = {...inner, className: "button"};
      const Example = () => <View {...props} />;`)).toEqual(["padding", "className"]);
    expect(keys(`const Example = () => <View {...unknownProps} />;`)).toEqual(["<unresolved props>"]);
  });

  it("checks local style/props mutations and opaque accessors", () => {
    expect(keys(`const shape = {}; shape.padding = 12; const props = {}; props.style = shape;
      const Example = () => <View {...props} />;`)).toEqual(["padding"]);
    expect(keys(`const props = { get style() { return externalStyle; } }; const Example = () => <View {...props} />;`)).toEqual(["<unresolved style>"]);
  });

  it("accepts known non-style spreads, including semantic booleans and metadata helpers", () => {
    expect(inspect(`function marker(value) { return enabled ? {dataSet: {value}} : null; }
      const Example = () => <Typography {...marker("x")} {...{[role]: true}} />;`)).toEqual([]);
  });

  it("detects HTML and native substitute controls through named and namespace aliases", () => {
    expect(inspect(`import { Switch as Toggle } from "react-native"; import * as RN from "react-native";
      const Example = () => <div><Toggle /><RN.Button title="Save" /></div>;`).map(finding => finding.attribute)).toEqual(["html", "native-control", "native-control"]);
  });

  it("rejects unstyled foreign controls while permitting actual framework hosts", () => {
    expect(keys(`import {Button as Action} from "another-kit"; const Example = () => <Action>Save</Action>;`)).toEqual(["another-kit#Button"]);
    expect(keys(`import {createElement as element} from "react"; import {Button as Action} from "another-kit"; const Example = () => element(Action, null);`)).toEqual(["another-kit#Button"]);
    expect(inspect(`import {Stack} from "expo-router"; import {SafeAreaProvider} from "react-native-safe-area-context";
      const App = () => <SafeAreaProvider><Stack /></SafeAreaProvider>;`)).toEqual([]);
  });

  it("checks createElement calls and distinguishes code strings from rendered elements", () => {
    expect(keys(`import {createElement as element} from "react";
      const sample = '<button style={{padding: 10}}>Save</button>';
      function Example() { return element("button", {style: {padding: 10}}); }`)).toEqual(["button", "padding"]);
    expect(keys(`import R from "react"; const Example = () => R.createElement("div", {style: {gap: 10}});`)).toEqual(["div", "gap"]);
  });

  it("scans handwritten .ts render functions with TypeScript generic syntax, excluding declarations", () => {
    const root = mkdtempSync(join(tmpdir(), "canvas-docs-components-"));
    try {
      const source = join(root, "docs/src");
      mkdirSync(source, { recursive: true });
      writeFileSync(join(source, "render.ts"), `import {createElement} from "react";
        import {View} from "@nannier/canvas";
        const identity = <T>(value: T) => value;
        const props = {style: {padding: 12}};
        export const Example = () => createElement(View, props);`);
      writeFileSync(join(source, "declarations.d.ts"), `React.createElement("button", {style: {margin: 12}});`);
      const findings = inspectDocsTree(root);
      expect(findings.map(finding => [finding.file, finding.tag, finding.attribute, finding.keys])).toEqual([
        ["docs/src/render.ts", "View", "style", ["padding"]],
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("only grants the exact named infrastructure allowance and pins its footprint", () => {
    const findings = inspect(`function FitStage() { return <View style={{width: measured}} />; }
      function FakeButton() { return <View style={{width: 100, backgroundColor: "red"}} />; }`);
    const exception: DocsUsageException = {file: "docs/src/example.tsx", owner: "FitStage", tag: "View", attribute: "style", keys: ["width"], occurrences: 1, reason: "Measures the preview stage's available width."};
    expect(findings.map(finding => allowedDocsUsage(finding, [exception]))).toEqual([true, false]);
    expect(exceptionFootprintErrors(findings, [exception])).toEqual([]);
    expect(exceptionFootprintErrors([...findings, findings[0]], [exception])).toHaveLength(1);
    expect(exceptionFootprintErrors([], [exception])).toHaveLength(2);
    expect(allowedDocsUsage({...findings[0], keys: ["backgroundColor"]}, [exception])).toBe(false);
  });
});

it("handwritten docs contain no unreviewed styling escapes or substitute HTML controls", () => {
  const findings = inspectDocsTree(resolve(import.meta.dir, "../.."));
  expect(findings.filter(finding => !allowedDocsUsage(finding)).map(formatDocsUsage)).toEqual([]);
  expect(exceptionFootprintErrors(findings)).toEqual([]);
});
