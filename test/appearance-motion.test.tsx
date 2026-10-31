import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AccessibilityInfo } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { ButtonGroup } from "../src/atoms/button-group/button-group.tsx";
import { Switch } from "../src/atoms/switch/switch.tsx";

afterEach(cleanup);

describe("appearance control motion", () => {
  it("moves the same capsule thumb in both selection directions", () => {
    render(<ThemeProvider solid><ButtonGroup rounded small testID="scheme" accessibilityLabel="Scheme" items={["Dark", "Light"]} /></ThemeProvider>);
    const thumb = screen.getByTestId("scheme-selection");
    expect(thumb.style.transform).toBe("translateX(0%)");
    expect(thumb.style.transitionDuration).toBe("450ms");
    fireEvent.click(screen.getByRole("tab", { name: "Light" }));
    expect(screen.getByTestId("scheme-selection")).toBe(thumb);
    expect(thumb.style.transform).toBe("translateX(100%)");
    expect(screen.getByRole("tab", { name: "Light" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "Dark" }));
    expect(thumb.style.transform).toBe("translateX(0%)");
    expect(screen.getByRole("tab", { name: "Dark" }).getAttribute("aria-selected")).toBe("true");
  });

  it("moves the same Switch knob in both directions", () => {
    render(<ThemeProvider solid><Switch accessibilityLabel="Glass" /></ThemeProvider>);
    const control = screen.getByRole("switch", { name: "Glass" });
    const thumb = Array.from(control.querySelectorAll<HTMLElement>("*")).find((node) => node.style.transitionProperty === "transform")!;
    expect(thumb).toBeDefined();
    expect(thumb.style.transform).toBe("translateX(0px)");
    expect(thumb.style.transitionDuration).toBe("350ms");
    fireEvent.click(control);
    expect(control.contains(thumb)).toBe(true);
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(thumb.style.transform).toBe("translateX(18px)");
    fireEvent.click(control);
    expect(thumb.style.transform).toBe("translateX(0px)");
  });

  it("draws the toolbar Switch chip with a trailing label and the reference geometry", () => {
    render(<ThemeProvider solid><Switch chip testID="glass">Glass</Switch></ThemeProvider>);
    const chip = screen.getByTestId("glass");
    expect(chip.style.height).toBe("32px");
    const track = chip.firstElementChild as HTMLElement;
    const knob = track.firstElementChild as HTMLElement;
    expect(track.style.width).toBe("26px");
    expect(track.style.height).toBe("16px");
    expect(knob.style.width).toBe("10px");
    expect(knob.style.height).toBe("10px");
    expect(chip.lastElementChild?.textContent).toBe("Glass");
    fireEvent.click(chip);
    expect(knob.style.transform).toBe("translateX(10px)");
    expect(chip.getAttribute("aria-checked")).toBe("true");
  });

  it("removes both transitions under Reduce Motion without disabling selection", async () => {
    const reduced = spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(true);
    try {
      render(<ThemeProvider solid><ButtonGroup rounded small testID="scheme" items={["Dark", "Light"]} /><Switch accessibilityLabel="Glass" /></ThemeProvider>);
      const thumb = screen.getByTestId("scheme-selection");
      const control = screen.getByRole("switch", { name: "Glass" });
      const knob = Array.from(control.querySelectorAll<HTMLElement>("*")).find((node) => node.style.transitionProperty === "transform")!;
      await waitFor(() => {
        expect(thumb.style.transitionDuration).toBe("0ms");
        expect(knob.style.transitionDuration).toBe("0ms");
      });
      fireEvent.click(screen.getByRole("tab", { name: "Light" }));
      fireEvent.click(control);
      expect(thumb.style.transform).toBe("translateX(100%)");
      expect(control.getAttribute("aria-checked")).toBe("true");
    } finally {
      cleanup();
      reduced.mockRestore();
    }
  });
});
