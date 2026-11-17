import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme";
import { View, Text, Pressable } from "../src/style/primitives";
import { Column } from "../src/atoms/layout/layout";
import { Typography } from "../src/atoms/typography/typography";
import { colorsFor } from "../src/style/tokens";
import { alpha } from "../src/style/color";
import type { ExampleScope } from "../docs/src/core/scope";

mock.module(import.meta.resolve("../docs/node_modules/react/index.js"), () => React);
const { default: PressableExample } = await import("../docs/src/core/examples/atoms/pressable/example-0");

function Stateful<T>({ initial, children }: { initial: T; children: (value: T, set: (value: T) => void) => React.ReactNode }) {
  const [value, set] = React.useState(initial);
  return children(value, set);
}

afterEach(cleanup);

describe("the generated playground's complete executable source", () => {
  it("uses the shown Pressable callback to update the surrounding live counter", () => {
    const scope = { Stateful, View, Text, Pressable, Typography, Column, alpha, tokens: colorsFor("violet", "dark") } as ExampleScope;
    const playground = PressableExample.playground.Pressable;
    const children = React.createElement(Text, null, 'Run "example"');
    const input = { props: { children: { value: children, code: `<Text>{${JSON.stringify('Run "example"')}}</Text>` } }, omit: ["children", "disabled"] };
    const code = playground.code(input);
    expect(code).toContain("<Stateful initial={0}>");
    expect(code).toContain("onPress={() => setPresses(presses + 1)}");
    expect(code).toContain("Pressed ${presses}");
    expect(code).toContain(input.props.children.code);
    expect(code).not.toContain("Press me");
    render(<ThemeProvider dark solid>{playground.render(scope, input)}</ThemeProvider>);
    expect(screen.getByText("Pressed 0 times")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: 'Run "example"' }));
    expect(screen.getByText("Pressed 1 time")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: 'Run "example"' }));
    expect(screen.getByText("Pressed 2 times")).toBeTruthy();
  });
});
