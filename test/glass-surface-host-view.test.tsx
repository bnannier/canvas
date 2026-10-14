import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { type ForwardedRef, type ReactNode } from "react";
import { cleanup, render } from "@testing-library/react";
import { View, type ViewProps } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { GlassSurface } from "../src/style/glass-surface/glass-surface.tsx";
import { GlassSurface as IosGlassSurface } from "../src/style/glass-surface/glass-surface.ios.tsx";
import * as iosRuntime from "../src/style/glass-surface/material-runtime.ios.ts";
import * as runtime from "../src/style/glass-surface/material-runtime.ts";
import type { MaterialCapabilities } from "../src/style/glass-surface/material-resolution.ts";

// Wherever a glass surface renders its material, its host is a native view of its own
// (`collapsable` false). Under glass the host's fill and border colours are cleared, so iOS's
// and Android's renderers removed it as a box that draws nothing and handed its children to the
// nearest ancestor view, where the material's `zIndex: -1` ordered it beneath every earlier
// sibling: on the iPhone simulator a dense glass card placed over text drew its material under
// the text, and 11 of the Select page's 39 materials sat in the page's content view instead of
// their cards. In solid mode nothing changes, so the solid tree stays byte-identical.

afterEach(cleanup);

/** The props each View with this testID was last rendered with, as a native build receives them. */
function hostProps(testID: string, run: () => void): ViewProps {
  const component = View as unknown as { render: (props: ViewProps, ref: ForwardedRef<unknown>) => ReactNode };
  const original = component.render;
  let last: ViewProps | undefined;
  const spy = spyOn(component, "render").mockImplementation((props, ref) => {
    if (props.testID === testID) last = props;
    return original(props, ref);
  });
  try {
    run();
  } finally {
    spy.mockRestore();
  }
  if (!last) throw new Error(`No View rendered with testID ${testID}`);
  return last;
}

const SHAPE = { borderRadius: 16, borderWidth: 1, borderColor: "#dddddd", backgroundColor: "#ffffff" };

describe("the glass host's native view", () => {
  for (const layer of ["functional", "content", "control", "dense"] as const) {
    it(`keeps the ${layer} host a view of its own on the web host under glass`, () => {
      const props = hostProps("host", () => { render(<ThemeProvider light glass><GlassSurface testID="host" layer={layer} style={SHAPE} /></ThemeProvider>); });
      expect(props.collapsable).toBe(false);
    });
  }

  it("leaves a solid host as it was, collapsable unless it takes the accessibility escape", () => {
    const plain = hostProps("host", () => { render(<ThemeProvider light solid><GlassSurface testID="host" style={SHAPE} /></ThemeProvider>); });
    expect(plain.collapsable).toBeUndefined();
    cleanup();
    const escape = hostProps("host", () => { render(<ThemeProvider light solid><GlassSurface testID="host" style={SHAPE} onAccessibilityEscape={() => {}} /></ThemeProvider>); });
    expect(escape.collapsable).toBe(false);
  });

  for (const [name, capabilities] of [
    ["Liquid Glass", { platform: "ios", frost: true, liquid: true, requiresTarget: false }],
    ["the frost", { platform: "ios", frost: true, liquid: false, requiresTarget: false }],
  ] as const) {
    it(`keeps the iOS host a view of its own under ${name}`, () => {
      const stub = () => <View />;
      const spies = [
        spyOn(runtime, "useMaterialCapabilities").mockReturnValue(capabilities as MaterialCapabilities),
        spyOn(iosRuntime as unknown as { LiquidView: typeof stub }, "LiquidView").mockImplementation(stub),
        spyOn(iosRuntime as unknown as { FrostView: typeof stub }, "FrostView").mockImplementation(stub),
      ];
      try {
        const props = hostProps("host", () => { render(<ThemeProvider light glass><IosGlassSurface testID="host" layer="dense" style={SHAPE} /></ThemeProvider>); });
        expect(props.collapsable).toBe(false);
      } finally {
        spies.forEach((spy) => spy.mockRestore());
      }
    });
  }
});
