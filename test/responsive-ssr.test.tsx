import { describe, it, expect, afterEach } from "bun:test";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { useBreakpoint, useFormFactor, useResponsive } from "../src/style/responsive.tsx";
import type { BreakpointKey } from "../src/style/tokens.ts";

afterEach(cleanup);

// The viewport tier's server half (src/style/responsive.tsx). A server has no window,
// so useBreakpoint's server snapshot is the desktop `base` unless ThemeProvider's
// `ssrBreakpoint` names the bucket the server should assume (the `ssrScheme` contract
// applied to the viewport axis). The hydration render repeats that assumption, so the
// markup matches what the server shipped, and the real window's bucket re-renders every
// consumer right after.

// Prints the tier as one text run, so the server markup and the client DOM are asserted
// against the same marker.
function TierProbe() {
  const bucket = useBreakpoint();
  const value = useResponsive({ base: "desktop", md: "mid", sm: "phone" });
  const factor = useFormFactor();
  return <Text>{`tier:${bucket}:${value}:${factor}`}</Text>;
}

const app = (ssrBreakpoint?: BreakpointKey | "base") => (
  <ThemeProvider ssrBreakpoint={ssrBreakpoint}>
    <TierProbe />
  </ThemeProvider>
);

describe("ThemeProvider ssrBreakpoint on the server", () => {
  it("renders the bucket the server is told to assume", () => {
    const html = renderToString(app("sm"));
    expect(html).toContain("tier:sm:phone:phone");
  });

  it("renders base, the desktop variant, when the prop is omitted", () => {
    const html = renderToString(app());
    expect(html).toContain("tier:base:desktop:desktop");
  });

  it("reaches through a nested ThemeProvider that omits it", () => {
    const html = renderToString(
      <ThemeProvider ssrBreakpoint="md">
        <ThemeProvider dark>
          <TierProbe />
        </ThemeProvider>
      </ThemeProvider>,
    );
    expect(html).toContain("tier:md:mid:tablet");
  });
});

describe("ThemeProvider ssrBreakpoint at hydration", () => {
  it("hydrates the server's phone markup without a mismatch, then takes the real 1280 window's bucket", async () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(app("sm"));
    document.body.appendChild(container);
    const serverText = Array.from(container.querySelectorAll("div")).find((node) => node.textContent === "tier:sm:phone:phone");
    expect(serverText).toBeDefined();
    const recovered: string[] = [];
    let root!: Root;
    try {
      act(() => {
        root = hydrateRoot(container, app("sm"), { onRecoverableError: (error) => { recovered.push(String(error)); } });
      });
      // The hydration render reproduced the server's assumption byte for byte: nothing
      // to recover from, and the node the server shipped is the one React kept.
      expect(recovered).toEqual([]);
      // Right after, the store's client snapshot (the 1280 harness window: xl) applies.
      await waitFor(() => expect(container.textContent).toBe("tier:xl:desktop:desktop"));
      expect(serverText!.isConnected).toBe(true);
    } finally {
      act(() => root.unmount());
      container.remove();
    }
  });
});

describe("ThemeProvider ssrBreakpoint toggled at runtime", () => {
  it("keeps the app mounted when the prop is set, cleared and set again", () => {
    let mounts = 0;
    function Child() {
      useEffect(() => {
        mounts += 1;
      }, []);
      return <Text>child</Text>;
    }
    const { rerender } = render(
      <ThemeProvider ssrBreakpoint="sm">
        <Child />
      </ThemeProvider>,
    );
    rerender(
      <ThemeProvider>
        <Child />
      </ThemeProvider>,
    );
    rerender(
      <ThemeProvider ssrBreakpoint="md">
        <Child />
      </ThemeProvider>,
    );
    expect(screen.getByText("child")).toBeTruthy();
    // One mount: the provider above the app never changed type, so the subtree under
    // it was never thrown away (before, each toggle remounted it: 3).
    expect(mounts).toBe(1);
  });
});
