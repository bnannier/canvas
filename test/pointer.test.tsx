// The pointer-capability hooks (src/style/pointer.ts). Under the test alias the
// kit runs as react-native-web, so the hooks take the WEB path: matchMedia is
// stubbed per render (the a11y-preferences precedent) and live flips are fired
// through the captured listeners.
import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { render, cleanup, screen, act } from "@testing-library/react";
import { Text } from "react-native";
import { usePointerCoarse, useHoverCapable } from "../src/style/pointer.ts";

afterEach(cleanup);

function Probe() {
  const coarse = usePointerCoarse();
  const hover = useHoverCapable();
  return <Text>{`${coarse ? "coarse" : "fine"}:${hover ? "hover" : "no-hover"}`}</Text>;
}

// A stub matchMedia whose result depends on the queried media string, capturing
// the change listeners so a test can fire a live update.
function mockMatchMedia(matching: (query: string) => boolean) {
  const listeners = new Set<(event: { matches: boolean }) => void>();
  const spy = spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: matching(query),
        media: query,
        addEventListener: (_e: string, cb: (e: { matches: boolean }) => void) => listeners.add(cb),
        removeEventListener: (_e: string, cb: (e: { matches: boolean }) => void) => listeners.delete(cb),
        onchange: null,
        dispatchEvent: () => true,
      }) as unknown as MediaQueryList,
  );
  const fire = (matches: boolean) => act(() => listeners.forEach((cb) => cb({ matches })));
  return { spy, fire };
}

describe("pointer capability hooks (web path)", () => {
  it("reads a desktop pointer: fine and hover-capable", () => {
    const { spy } = mockMatchMedia((q) => q === "(hover: hover)");
    render(<Probe />);
    expect(screen.getByText("fine:hover")).toBeTruthy();
    spy.mockRestore();
  });

  it("reads a touch device: coarse and hover-incapable", () => {
    const { spy } = mockMatchMedia((q) => q === "(pointer: coarse)");
    render(<Probe />);
    expect(screen.getByText("coarse:no-hover")).toBeTruthy();
    spy.mockRestore();
  });

  it("tracks live changes (a mouse plugged into a tablet)", () => {
    const { spy, fire } = mockMatchMedia((q) => q === "(pointer: coarse)");
    render(<Probe />);
    expect(screen.getByText("coarse:no-hover")).toBeTruthy();
    // Both captured listeners flip: the pointer goes fine, hover becomes real.
    fire(false);
    expect(screen.getByText("fine:no-hover")).toBeTruthy();
    spy.mockRestore();
  });
});
