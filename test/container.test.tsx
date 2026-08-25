// The container-measurement primitives (src/style/container.ts). happy-dom
// never fires RNW onLayout, so these tests drive the returned handler directly
// with synthetic layout events: the established seam for measured behavior.
import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen, act } from "@testing-library/react";
import type { LayoutChangeEvent } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { useContainerBreakpoint } from "../src/style/container.ts";
import { resizeViewport } from "./viewport.ts";

afterEach(cleanup);

const layoutEvent = (width: number) => ({ nativeEvent: { layout: { width } } }) as LayoutChangeEvent;

let fire: ((e: LayoutChangeEvent) => void) | null = null;
let renders = 0;

function Probe({ seed }: { seed?: boolean }) {
  renders += 1;
  const { value, width, measured, onLayout } = useContainerBreakpoint(
    { base: "desktop", md: "mid", sm: "phone" },
    { seedViewport: seed },
  );
  fire = onLayout;
  return <div data-testid="probe">{`${value}:${width}:${measured}`}</div>;
}

const ui = (seed?: boolean) =>
  render(
    <ThemeProvider>
      <Probe seed={seed} />
    </ThemeProvider>,
  );

describe("useContainerBreakpoint", () => {
  it("renders base (desktop-first) until measured, then resolves its OWN width", () => {
    ui();
    expect(screen.getByTestId("probe").textContent).toBe("desktop:0:false");
    act(() => fire!(layoutEvent(375.4)));
    expect(screen.getByTestId("probe").textContent).toBe("phone:375:true");
    act(() => fire!(layoutEvent(700)));
    expect(screen.getByTestId("probe").textContent).toBe("mid:700:true");
    act(() => fire!(layoutEvent(900)));
    expect(screen.getByTestId("probe").textContent).toBe("desktop:900:true");
  });

  it("ignores subpixel relayout churn (same rounded width never cascades re-renders)", () => {
    ui();
    act(() => fire!(layoutEvent(375.4)));
    const after = renders;
    // All of these round to 375. React may re-render ONCE before bailing out of
    // a same-value set; the contract is that churn never cascades beyond that.
    act(() => fire!(layoutEvent(375.2)));
    act(() => fire!(layoutEvent(374.8)));
    act(() => fire!(layoutEvent(375.3)));
    act(() => fire!(layoutEvent(374.6)));
    expect(renders).toBeLessThanOrEqual(after + 1);
    expect(screen.getByTestId("probe").textContent).toBe("phone:375:true");
  });

  it("seedViewport resolves against the window width before the first layout", () => {
    resizeViewport(375);
    ui(true);
    // Unmeasured, but seeded from the 375 window: the phone arrangement, not base.
    expect(screen.getByTestId("probe").textContent).toBe("phone:0:false");
    act(() => fire!(layoutEvent(800)));
    // A real measurement wins over the seed.
    expect(screen.getByTestId("probe").textContent).toBe("desktop:800:true");
  });
});
