// Narrow-container fixes from the responsiveness rollout: the calendar month's
// fluid cell math (pure) and the DescriptionList twoColumn term narrowing
// (viewport-driven, exercised through test/viewport.ts).
import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { monthCellSize } from "../src/organisms/calendar/calendar.shared.tsx";
import { DescriptionList } from "../src/molecules/description-lists/description-lists.tsx";
import { resizeViewport } from "./viewport.ts";

afterEach(cleanup);

describe("monthCellSize (calendar month fluid cells)", () => {
  it("keeps the skin's preferred cell while unmeasured or when the container fits", () => {
    expect(monthCellSize(36, 0, 26)).toBe(36);
    expect(monthCellSize(36, 300, 26)).toBe(36); // (300-26)/7 = 39 > 36
  });

  it("shrinks the cell so seven fit the measured container", () => {
    // A 264px container (320pt phone minus page padding) with 26px chrome:
    // floor(238/7) = 34.
    expect(monthCellSize(40, 264, 26)).toBe(34);
  });

  it("never shrinks below the 32px floor", () => {
    expect(monthCellSize(40, 180, 26)).toBe(32);
  });

  it("converges: the grid relayout at 7*cell never widens past the measurement", () => {
    for (const measured of [180, 226, 264, 280, 306]) {
      const cell = monthCellSize(40, measured, 26);
      if (cell > 32) expect(cell * 7 + 26).toBeLessThanOrEqual(measured);
    }
  });
});

describe("DescriptionList twoColumn term narrowing", () => {
  const ui = () =>
    render(
      <ThemeProvider>
        <DescriptionList twoColumn items={[{ term: "Full name", value: "Margot Foster" }]} />
      </ThemeProvider>,
    );

  it("keeps the 160px label column at desktop widths", () => {
    ui();
    expect((screen.getByText("Full name") as HTMLElement).style.width).toBe("160px");
  });

  it("narrows the label column to 120px at phone widths", () => {
    ui();
    resizeViewport(375);
    expect((screen.getByText("Full name") as HTMLElement).style.width).toBe("120px");
  });
});
