import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { type ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Stats } from "../src/molecules/stats/stats.tsx";
import { shareStrip, sparkStrip } from "../src/molecules/stats/stats.styles.ts";
import { webSkin as sparklineSkin } from "../src/charts/sparkline/sparkline.styles.ts";
import { StackedBar } from "../src/charts/stacked-bar/stacked-bar.tsx";
import { StackedList } from "../src/molecules/stacked-lists/stacked-lists.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// A dashboard needs its tiles tellable apart, and a health list needs healthy /
// degraded / down to differ in colour rather than render three identical grey
// badges. Both capabilities were missing, which is why consuming apps hand-rolled
// a StatCard and a ServiceHealthList instead of using the kit.

describe("Stats per-metric slots", () => {
  it("renders the icon and the header control", () => {
    const { getByTestId } = ui(
      <Stats
        items={[{ label: "Active identities", value: "12,348", icon: <Text testID="glyph">i</Text>, actions: <Text testID="period">30d</Text> }]}
      />,
    );
    expect(getByTestId("glyph")).toBeTruthy();
    expect(getByTestId("period")).toBeTruthy();
  });

  it("keeps a metric with neither slot unchanged", () => {
    const { getByText } = ui(<Stats items={[{ label: "Sessions", value: "489" }]} />);
    expect(getByText("Sessions")).toBeTruthy();
    expect(getByText("489")).toBeTruthy();
  });

  it("accents the value from the chart ramp", () => {
    const { getByText } = ui(<Stats items={[{ label: "Clients", value: "12", chart4: true }]} />);
    // The accent paints a colour; an untoned metric leaves the value's own style.
    expect(getByText("12").style.color).toBeTruthy();
  });

  it("resolves the accent axis by first match", () => {
    // Rendered one at a time: both trees would otherwise share the document body
    // and the text queries would match twice.
    const both = ui(<Stats items={[{ label: "A", value: "1", chart1: true, chart8: true }]} />).getByText("1").style.color;
    cleanup();
    const first = ui(<Stats items={[{ label: "A", value: "1", chart1: true }]} />).getByText("1").style.color;
    expect(both).toBe(first);
  });

  it("renders a steady delta muted rather than as a rise", () => {
    const steady = ui(<Stats items={[{ label: "A", value: "1", delta: "last 30 days", steady: true }]} />).getByText("last 30 days").style.color;
    cleanup();
    const rise = ui(<Stats items={[{ label: "A", value: "1", delta: "last 30 days" }]} />).getByText("last 30 days").style.color;
    expect(steady).not.toBe(rise);
  });

  it("steady takes precedence over down", () => {
    const steady = ui(<Stats items={[{ label: "A", value: "1", delta: "x", steady: true, down: true }]} />).getByText("x").style.color;
    cleanup();
    const onlySteady = ui(<Stats items={[{ label: "A", value: "1", delta: "x", steady: true }]} />).getByText("x").style.color;
    expect(steady).toBe(onlySteady);
  });

  it("leaves the delta's rise/decline tone alone when accented", () => {
    const accented = ui(<Stats items={[{ label: "A", value: "1", delta: "-5%", down: true, chart2: true }]} />).getByText("-5%").style.color;
    cleanup();
    const plain = ui(<Stats items={[{ label: "A", value: "1", delta: "-5%", down: true }]} />).getByText("-5%").style.color;
    expect(accented).toBe(plain);
  });
});

describe("Stats strip slot", () => {
  it("draws a metric's composition when it has no trend to plot", () => {
    const { container } = ui(
      <Stats items={[{ label: "Verified identities", value: "81.3%", share: [{ label: "Verified", value: 1502 }, { label: "Unverified", value: 345 }] }]} />,
    );
    const name = container.querySelector('[role="img"]')?.getAttribute("aria-label") ?? "";
    // The name carries the composition itself, so the strip is not a mute
    // decoration to a screen reader.
    expect(name).toContain("Verified identities");
    expect(name).toContain("Verified 81%");
    expect(name).toContain("Unverified 19%");
  });

  it("still draws the strip when the composition sums to zero", () => {
    // A metric at zero is a real state, and the rail is how the tile says so
    // instead of going blank and leaving the card half empty.
    const { container } = ui(<Stats items={[{ label: "Courier queue", value: "0", share: [{ label: "Sent", value: 0 }, { label: "Queued", value: 0 }] }]} />);
    expect(container.querySelector('[role="img"]')).toBeTruthy();
  });

  it("reserves the trend strip's height for the composition strip", () => {
    // What keeps a row that mixes the two at ONE card height: the cards stretch
    // to the tallest sibling, so the two strips have to occupy the same band.
    expect(shareStrip.height).toBe(sparklineSkin.height.default);
    expect(shareStrip.marginTop).toBe(sparkStrip.marginTop);
  });

  it("prefers the trend over the composition when a metric carries both", () => {
    const { container } = ui(
      <Stats items={[{ label: "Requests", value: "24.5k", spark: [1, 2, 3], share: [{ label: "Hit", value: 9 }] }]} />,
    );
    const imgs = container.querySelectorAll('[role="img"]');
    expect(imgs.length).toBe(1);
    expect(imgs[0]?.getAttribute("aria-label")).toBe("Requests trend");
  });

  it("names the trend strip for what it plots when that is not the value's own history", () => {
    const { container } = ui(
      <Stats
        items={[{ label: "Active sessions", value: "0", spark: [0, 0, 1], sparkLabel: "Sign-ins per hour, last 24 hours" }]}
      />,
    );
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Sign-ins per hour, last 24 hours");
  });

  it("leaves a metric with neither strip untouched", () => {
    const { container } = ui(<Stats items={[{ label: "Orders", value: "842" }]} />);
    expect(container.querySelector('[role="img"]')).toBeNull();
  });
});

describe("StackedBar track", () => {
  // With `hideLegend` the image role sits on the root, and the rail is the bar
  // row inside it.
  const barRow = (container: HTMLElement) => container.querySelector('[role="img"]')?.firstElementChild as HTMLElement;

  it("paints a rail behind the segments only when asked", () => {
    const bareFill = barRow(ui(<StackedBar hideLegend segments={[{ label: "a", value: 0 }]} />).container).style.backgroundColor;
    cleanup();
    const railed = barRow(ui(<StackedBar track hideLegend segments={[{ label: "a", value: 0 }]} />).container);
    expect(railed.style.backgroundColor).toBeTruthy();
    expect(railed.style.backgroundColor).not.toBe(bareFill);
  });

  it("keeps the rail behind a full bar, where the segments cover it", () => {
    const railed = barRow(ui(<StackedBar track hideLegend segments={[{ label: "a", value: 3 }, { label: "b", value: 1 }]} />).container);
    expect(railed.style.backgroundColor).toBeTruthy();
    expect(railed.children.length).toBe(2);
  });
});

describe("StackedList badge tone", () => {
  it("tones a row's trailing badge", () => {
    const { getByText } = ui(
      <StackedList
        items={[
          { name: "Kratos", detail: "identity", badge: "Healthy", success: true },
          { name: "Hydra", detail: "oauth2", badge: "Degraded", warning: true },
        ]}
      />,
    );
    expect(getByText("Healthy")).toBeTruthy();
    expect(getByText("Degraded")).toBeTruthy();
  });

  it("gives differently toned badges different colours", () => {
    const ok = ui(<StackedList items={[{ name: "a", detail: "d", badge: "S", success: true }]} />).getByText("S").style.color;
    cleanup();
    const bad = ui(<StackedList items={[{ name: "a", detail: "d", badge: "S", error: true }]} />).getByText("S").style.color;
    expect(ok).not.toBe(bad);
  });

  it("leaves an untoned badge on the original secondary look", () => {
    const { getByText } = ui(<StackedList items={[{ name: "a", detail: "d", badge: "Plain" }]} />);
    expect(getByText("Plain")).toBeTruthy();
  });

  it("still prefers a badge over meta text", () => {
    const { getByText, queryByText } = ui(<StackedList items={[{ name: "a", detail: "d", badge: "B", meta: "2h ago", success: true }]} />);
    expect(getByText("B")).toBeTruthy();
    expect(queryByText("2h ago")).toBeNull();
  });
});
