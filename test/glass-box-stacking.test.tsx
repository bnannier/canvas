import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import type { ForwardedRef, ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { GlassSurface } from "../src/style/glass-surface/glass-surface.tsx";

// A GlassSurface's box keeps its native view whenever it paints a material. The material
// sits at zIndex -1 inside the box; Fabric hoists a flattened view's children into the
// nearest view it keeps, where that negative zIndex sorted the material beneath every
// earlier sibling: on iOS the docs' frame lost its frost behind the page backdrop. Only a
// stacking context of the box's own (collapsable false) keeps it inside. React Native Web
// drops the prop before the DOM, so it is read at React Native's View render boundary, as
// test/listbox-a11y.test.tsx reads the Listbox container's.

afterEach(cleanup);

const component = View as unknown as { render: (props: ViewProps, ref: ForwardedRef<unknown>) => ReactNode };

function boxProps(node: ReactNode, testID: string): ViewProps | undefined {
  const original = component.render;
  const seen: ViewProps[] = [];
  const observer = spyOn(component, "render").mockImplementation((props, ref) => {
    if (props.testID === testID) seen.push(props);
    return original(props, ref);
  });
  try {
    render(node);
    return seen.at(-1);
  } finally {
    observer.mockRestore();
  }
}

describe("GlassSurface box", () => {
  it("keeps its native view when it paints a material, so the material cannot be hoisted beneath its siblings", () => {
    const props = boxProps(<ThemeProvider light glass><GlassSurface testID="frame" layer="content" style={{ borderRadius: 22 }} /></ThemeProvider>, "frame");
    expect(props).toBeDefined();
    expect(props!.collapsable).toBe(false);
  });

  it("leaves a solid box flattenable: it paints no material to hold", () => {
    const props = boxProps(<ThemeProvider light solid><GlassSurface testID="frame" layer="content" style={{ borderRadius: 22, backgroundColor: "#ffffff" }} /></ThemeProvider>, "frame");
    expect(props).toBeDefined();
    expect(props!.collapsable).toBeUndefined();
  });
});
