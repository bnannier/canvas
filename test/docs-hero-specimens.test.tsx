import { plugin } from "bun";
import { afterEach, expect, it, jest, mock, spyOn } from "bun:test";
import { act, cleanup, render, within } from "@testing-library/react";
import * as React from "react";
import { Text, ThemeProvider, View } from "../src/style/index.ts";

// Match Metro's single React instance and asset handling in the docs app.
mock.module(import.meta.resolve("../docs/node_modules/react/index.js"), () => React);
plugin({
  name: "hero-sample-media",
  setup(build) {
    build.onLoad({ filter: /\/docs\/public\/[^/]+\.(jpe?g|mp4)$/ }, args => ({ exports: { uri: args.path }, loader: "object" }));
  },
});
const { useHeroShowcasePanels } = await import("../docs/src/brand/hero-showcase-panels.tsx");
const { ShowcaseActivity, ShowcaseStep, useDemonstrationStep } = await import("../docs/src/brand/hero-showcase-activity.ts");
afterEach(cleanup);

it("only advances active specimens and resumes their own frame after unmount", () => {
  function Frame() {
    return <Text testID="frame">{useDemonstrationStep(100)}</Text>;
  }
  function specimen(memory: { current: number }, active: boolean) {
    return <ThemeProvider><ShowcaseStep.Provider value={memory}>
      <ShowcaseActivity.Provider value={active}><Frame /></ShowcaseActivity.Provider>
    </ShowcaseStep.Provider></ThemeProvider>;
  }
  const first = { current: 0 };
  const second = { current: 0 };
  jest.useFakeTimers();
  try {
    const view = render(specimen(first, false));
    const advance = (ms: number) => act(() => { jest.advanceTimersByTime(ms); });
    advance(500);
    expect(view.getByTestId("frame").textContent).toBe("0");
    view.rerender(specimen(first, true));
    advance(300);
    expect(view.getByTestId("frame").textContent).toBe("3");
    view.rerender(specimen(first, false));
    advance(500);
    expect(view.getByTestId("frame").textContent).toBe("3");
    view.rerender(<></>);
    view.rerender(specimen(second, true));
    advance(200);
    expect(view.getByTestId("frame").textContent).toBe("2");
    view.rerender(<></>);
    view.rerender(specimen(first, true));
    expect(view.getByTestId("frame").textContent).toBe("3");
    advance(100);
    expect(view.getByTestId("frame").textContent).toBe("4");
    expect(second.current).toBe(2);
  } finally {
    cleanup();
    jest.useRealTimers();
  }
});

it("keeps the tooltip and skeleton in the center and the tall Sparkline in the toast position", async () => {
  function Specimens() {
    const pool = useHeroShowcasePanels();
    expect(Object.fromEntries(Object.entries(pool).map(([id, variants]) => [id, variants.length]))).toEqual({
      revenue: 59, online: 8, segmented: 8, glass: 9, toast: 10, ship: 8,
    });
    const includes = (node: React.ReactNode, keys: string[]) => React.isValidElement(node) && keys.includes(String(node.key));
    return <>
      <View testID="center">{pool.revenue.filter(node => includes(node, ["tooltip", "skeleton", "sparkline"]))}</View>
      <View testID="toast">{pool.toast.filter(node => includes(node, ["sparkline"]))}</View>
    </>;
  }
  // The hosted tooltip waits until its anchor has a real layout rectangle.
  const bounds = spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 160, 32));
  try {
    const view = render(<ThemeProvider solid><Specimens /></ThemeProvider>);
    const center = within(view.getByTestId("center"));
    expect(await center.findByText("Copy the workspace link")).toBeDefined();
    expect(center.getByTestId("hero-control-skeleton")).toBeDefined();
    expect(center.queryByTestId("hero-chart-sparkline")).toBeNull();
    const sparkline = within(view.getByTestId("toast")).getByRole("img", { name: "Visits trending upward" });
    expect(getComputedStyle(sparkline).height).toBe("34px");
  } finally {
    bounds.mockRestore();
  }
});
