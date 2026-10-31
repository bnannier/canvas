import { afterEach, describe, expect, it } from "bun:test";
import { act, cleanup, render } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { LineChart } from "../src/charts/line-chart/line-chart.tsx";
import { RangeAreaChart } from "../src/charts/range-area-chart/range-area-chart.tsx";
import { BoxPlot } from "../src/charts/box-plot/box-plot.tsx";
import { ChartPresentationProvider } from "../src/charts/shared/chart-presentation.tsx";

afterEach(cleanup);
const ui = (children: ReactNode) =>
  render(<ThemeProvider>{children}</ThemeProvider>);

function measure(container: HTMLElement) {
  for (const element of container.querySelectorAll("*")) {
    const handler = (
      element as unknown as { __reactLayoutHandler?: (event: unknown) => void }
    ).__reactLayoutHandler;
    if (handler)
      act(() =>
        handler({
          nativeEvent: {
            layout: { x: 0, y: 0, width: 330, height: 200, left: 0, top: 0 },
          },
          timeStamp: 1,
        })
      );
  }
}

describe("the authored Charts room presentation", () => {
  it("keeps the public chart's normal axes outside the room provider", () => {
    const props = {
      labels: ["Jan", "Feb"],
      series: [{ label: "Sessions", values: [50, 100] }],
    };
    const normal = ui(<LineChart {...props} />);
    measure(normal.container);
    expect(normal.container.textContent).toContain("100");
    cleanup();
    const room = ui(
      <ChartPresentationProvider kind="line">
        <LineChart {...props} />
      </ChartPresentationProvider>
    );
    measure(room.container);
    expect(room.container.textContent).not.toContain("100");
    expect(
      room.container.querySelector('[role="img"]')?.getAttribute("aria-label")
    ).toContain("Feb 100");
  });

  it("keeps an authored annotation separate from actual accessible values", () => {
    const labels = ["Jan", "Feb"];
    const data = [
      { low: 10, mid: 20, high: 30 },
      { low: 11, mid: 21, high: 31 },
    ];
    const chart = (selected: number) => (
      <ThemeProvider>
        <ChartPresentationProvider
          kind="range"
          annotation={{ index: 0, lines: ["Authored initial readout"] }}
        >
          <RangeAreaChart labels={labels} data={data} selected={selected} />
        </ChartPresentationProvider>
      </ThemeProvider>
    );
    const view = render(chart(0));
    measure(view.container);
    expect(view.container.textContent).toContain("Authored initial readout");
    expect(
      view.container.querySelector('[role="img"]')?.getAttribute("aria-label")
    ).toContain("Jan 10 to 30 around 20");
    view.rerender(chart(1));
    expect(view.container.textContent).not.toContain(
      "Authored initial readout"
    );
    expect(view.container.textContent).toContain("High 31");
    expect(view.container.textContent).toContain("Mid 21");
    expect(view.container.textContent).toContain("Low 11");
  });

  it("announces explicitly authored box summaries and keeps raw-sample estimation as the default", () => {
    const data = [{ label: "Inbox", values: [1, 2, 3, 4, 5] }];
    const summaries = [
      { min: 10, q1: 20, median: 30, q3: 40, max: 50, outliers: [70] },
    ];
    const room = ui(
      <ChartPresentationProvider kind="box" boxSummaries={summaries}>
        <BoxPlot data={data} />
      </ChartPresentationProvider>
    );
    const name = room.container
      .querySelector('[role="img"]')
      ?.getAttribute("aria-label");
    expect(name).toContain(
      "median 30, quartiles 20 to 40, range 10 to 50, 1 outlier"
    );
    cleanup();
    const normal = ui(<BoxPlot data={data} />);
    expect(
      normal.container.querySelector('[role="img"]')?.getAttribute("aria-label")
    ).toContain("median 3, quartiles 2 to 4, range 1 to 5");
  });
});
