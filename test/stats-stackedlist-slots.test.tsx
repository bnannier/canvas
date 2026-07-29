import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { type ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Stats } from "../src/molecules/stats/stats.tsx";
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

  it("leaves the delta's rise/decline tone alone when accented", () => {
    const accented = ui(<Stats items={[{ label: "A", value: "1", delta: "-5%", down: true, chart2: true }]} />).getByText("-5%").style.color;
    cleanup();
    const plain = ui(<Stats items={[{ label: "A", value: "1", delta: "-5%", down: true }]} />).getByText("-5%").style.color;
    expect(accented).toBe(plain);
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
