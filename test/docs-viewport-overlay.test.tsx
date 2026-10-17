import { afterEach, expect, it, mock } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { OverlayProvider } from "../src/style/portal.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { View } from "../src/style/index.ts";
import { Wizard } from "../src/organisms/wizard/wizard.tsx";
import * as React from "react";
// Metro deduplicates the docs app's separate React installation at runtime.
mock.module(import.meta.resolve("../docs/node_modules/react/index.js"), () => React);
const { ViewportOverlay, ViewportOverlayProvider } = await import("../docs/src/ui/viewport-overlay.tsx");

afterEach(cleanup);

it("workspace docs modals escape the scrolling example host and docs chrome", () => {
  const view = render(<ThemeProvider><OverlayProvider><ViewportOverlayProvider>
    <View testID="docs-chrome"><OverlayProvider><View testID="scrolling-example">
      <ViewportOverlay><Wizard open title="Set up a project" steps={[{ label: "Details" }]} current={0} onOpenChange={() => {}} /></ViewportOverlay>
    </View></OverlayProvider></View>
  </ViewportOverlayProvider></OverlayProvider></ThemeProvider>);
  const dialog = view.getByRole("dialog");
  expect(view.getByTestId("docs-chrome").contains(dialog)).toBe(false);
  expect(view.getByTestId("scrolling-example").contains(dialog)).toBe(false);
  expect(view.container.contains(dialog)).toBe(true);
});
