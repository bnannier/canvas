import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Platform } from "react-native";
import { Heatmap } from "../src/charts/heatmap/heatmap.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { BulletChart } from "../src/charts/bullet-chart/bullet-chart.tsx";
import { MetricBreakdown } from "../src/charts/metric-breakdown/metric-breakdown.tsx";
import { ServiceHealthList } from "../src/charts/service-health-list/service-health-list.tsx";
import { UptimeBar } from "../src/charts/uptime-bar/uptime-bar.tsx";
import { Chip } from "../src/atoms/chip/chip.tsx";
import { Chip as AndroidChip } from "../src/atoms/chip/chip.android.tsx";
import { GeoMap } from "../src/charts/geo-map/geo-map.tsx";

afterEach(cleanup);

describe("detailed chart data and interactions", () => {
  it("preserves bullet targets and formatted data alongside its visual key", () => {
    render(<ThemeProvider><BulletChart detailed plain max={100} data={[{ label: "Retention", value: 91, target: 88, ranges: [60, 85, 100], success: true }]} formatValue={v => `${v}%`} /></ThemeProvider>);
    expect(screen.getByRole("img", { name: "Retention: 91% of target 88%" })).toBeTruthy();
    expect(screen.getByText("target")).toBeTruthy();
    expect(screen.getByText("ranges")).toBeTruthy();
  });

  it("keeps the metric named when its visual caption is omitted", () => {
    render(<ThemeProvider><MetricBreakdown detailed value="48.2k" label="Installs" rate="+12.4%" rateLabel="vs. Sep" rateSuccess spark={[30, 42, 92]} breakdown={[{ label: "Web", value: 54 }, { label: "Phone", value: 46 }]} formatValue={v => `${v}%`} /></ThemeProvider>);
    expect(screen.getByRole("group", { name: "Installs" })).toBeTruthy();
    expect(screen.queryByText("Installs")).toBeNull();
    expect(screen.getByText("+12.4% vs. Sep")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Web: 54%, 54% of total" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Installs trend: 30, 42, 92" })).toBeTruthy();
  });

  it("detailed service rows announce the full history and retain drill-in activation", () => {
    let pressed = -1;
    render(<ThemeProvider><ServiceHealthList detailed plain onPressItem={index => { pressed = index; }} items={[{ label: "Push", degraded: true, detail: "98.21%", periods: Array.from({ length: 30 }, (_, i) => i === 29 ? { degraded: true } : {}) }]} /></ThemeProvider>);
    const row = screen.getByRole("button", { name: "Push: degraded, 98.21%; Push, 30 periods: 29 operational, 1 degraded" });
    fireEvent.click(row);
    expect(pressed).toBe(0);
    expect(screen.getByText("Degraded")).toBeTruthy();
  });

  it("detailed uptime carries every status without adding decorative tab stops", () => {
    const { container } = render(<ThemeProvider><UptimeBar detailed label="API" periods={[{}, { degraded: true }, { down: true }, { unknown: true }]} /></ThemeProvider>);
    expect(screen.getByRole("img", { name: "API, 4 periods: 1 operational, 1 degraded, 1 down, 1 unknown" })).toBeTruthy();
    expect([...container.querySelectorAll<HTMLElement>("[tabindex]")].filter(node => node.tabIndex >= 0)).toHaveLength(0);
  });

  it("detailed maps select individual cities and preserve keyboard zoom", () => {
    let zoom = 0;
    const { container } = render(<ThemeProvider><GeoMap detailed plain zoomable defaultSelected={1} onZoomChange={value => { zoom = value; }} points={[{ label: "London", lat: 51.51, lng: -0.13, count: 2650 }, { label: "Berlin", lat: 52.52, lng: 13.4, count: 1920 }]} formatValue={value => `${value.toLocaleString("en-US")} sessions`} /></ThemeProvider>);
    const map = container.querySelector('[role="img"]')!;
    const layout = (map as unknown as { __reactLayoutHandler: (event: unknown) => void }).__reactLayoutHandler;
    act(() => layout({ nativeEvent: { layout: { x: 0, y: 0, width: 800, height: 416 } }, timeStamp: 1 }));
    expect(screen.getByText("Berlin · 1,920 sessions")).toBeTruthy();
    fireEvent.keyDown(map, { key: "+" });
    expect(zoom).toBe(2);
  });
});

describe("small metadata chips", () => {
  it("keeps default and native dimensions while the web metadata tag gets smaller", () => {
    const { container } = render(<ThemeProvider><Chip testID="default">Default</Chip><Chip testID="small" small gray>October</Chip><AndroidChip testID="android" small>Android</AndroidChip></ThemeProvider>);
    expect(screen.getByTestId("default").style.height).toBe("28px");
    expect(screen.getByTestId("small").style.height).toBe("24px");
    expect(screen.getByTestId("android").style.height).toBe("32px");
    expect(container.textContent).toContain("October");
  });

  it("preserves small chip activation and selected semantics", () => {
    let pressed = 0;
    render(<ThemeProvider><Chip small selected onPress={() => { pressed++; }}>October</Chip></ThemeProvider>);
    const chip = screen.getByRole("button", { name: "October" });
    expect(chip.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(chip);
    expect(pressed).toBe(1);
  });
});

describe("chart per-row formatting", () => {
  it("uses a row formatter consistently for its visible and announced measure and target", () => {
    render(<ThemeProvider><BulletChart detailed max={100} data={[{ label: "NPS", value: 48, target: 60, formatValue: String }]} formatValue={v => `${v}%`} /></ThemeProvider>);
    expect(screen.getByRole("img", { name: "NPS: 48 of target 60" })).toBeTruthy();
    expect(screen.getByText("48", { exact: true })).toBeTruthy();
    expect(screen.queryByText("48%")).toBeNull();
  });
});

for (const runtime of ["web", "ios", "android"] as const) {
  it(`retains ${runtime} chart-mark activation with runtime-appropriate Tab metadata`, () => {
    const select = spyOn(Platform, "select").mockImplementation(specifics => runtime in specifics ? specifics[runtime] : "native" in specifics ? specifics.native : specifics.default);
    try {
      let selected: number | null = null;
      const { container } = render(<ThemeProvider><GeoMap detailed zoomable points={[{ label: "London", lat: 51.51, lng: -0.13, count: 2650 }, { label: "Berlin", lat: 52.52, lng: 13.4, count: 1920 }]} onSelect={value => { selected = value; }} /></ThemeProvider>);
      const map = container.querySelector('[role="img"]')!;
      const layout = (map as unknown as { __reactLayoutHandler: (event: unknown) => void }).__reactLayoutHandler;
      act(() => layout({ nativeEvent: { layout: { x: 0, y: 0, width: 800, height: 416 } }, timeStamp: 1 }));
      const marks = [...map.querySelectorAll<HTMLElement>("[tabindex]")];
      expect(marks).toHaveLength(3);
      expect(marks.map(node => node.tabIndex)).toEqual(Array(3).fill(runtime === "web" ? -1 : 0));
      fireEvent.click(marks[2]!);
      expect(selected).toBe(1);
      cleanup();
      const heat = render(<ThemeProvider><Heatmap detailed calendar label="Commits" values={[{ value: 0.8, count: 9, date: "2026-09-16" }]} /></ThemeProvider>);
      const cell = [...heat.container.querySelectorAll<HTMLElement>("[tabindex]")].find(node => node.style.width === "12px" && node.style.height === "12px")!;
      expect(cell.tabIndex).toBe(runtime === "web" ? -1 : 0);
      fireEvent.click(cell);
      expect(screen.getByText("9 contributions")).toBeTruthy();
    } finally { cleanup(); select.mockRestore(); }
  });
}
