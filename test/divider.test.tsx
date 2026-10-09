import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import type { ComponentType, ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Divider as DividerWeb } from "../src/atoms/divider/divider.tsx";
import { Divider as DividerIOS } from "../src/atoms/divider/divider.ios.tsx";
import { Divider as DividerAndroid } from "../src/atoms/divider/divider.android.tsx";
import type { DividerProps } from "../src/atoms/divider/divider.shared.tsx";

// Divider's semantics, on every entry (the shell is shared, so each skin must keep it):
// a separator announces its orientation when it is not the horizontal default, and a
// labelled separator is named by its label, because ARIA makes a separator's children
// presentational (the "OR" inside it was never read). The action pattern, whose child is
// a control, carries no separator role at all.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);

const SKINS: [string, ComponentType<DividerProps>][] = [
  ["web", DividerWeb],
  ["ios", DividerIOS],
  ["android", DividerAndroid],
];

for (const [platform, Divider] of SKINS) {
  describe(`Divider on ${platform}`, () => {
    it("says a vertical rule is vertical, and leaves the horizontal default unsaid", () => {
      ui(
        <>
          <Divider vertical testID="v" />
          <Divider testID="h" />
        </>,
      );
      expect(screen.getByTestId("v").getAttribute("role")).toBe("separator");
      expect(screen.getByTestId("v").getAttribute("aria-orientation")).toBe("vertical");
      expect(screen.getByTestId("h").getAttribute("role")).toBe("separator");
      expect(screen.getByTestId("h").getAttribute("aria-orientation")).toBeNull();
    });

    it("names a labelled separator after its label, text or number", () => {
      ui(
        <>
          <Divider>OR</Divider>
          <Divider>{3}</Divider>
        </>,
      );
      expect(screen.getByRole("separator", { name: "OR" })).toBeTruthy();
      expect(screen.getByRole("separator", { name: "3" })).toBeTruthy();
    });

    it("points each labelled separator at its own label", () => {
      ui(
        <>
          <Divider testID="a">Section A</Divider>
          <Divider testID="b">Section B</Divider>
        </>,
      );
      const a = screen.getByTestId("a").getAttribute("aria-labelledby");
      const b = screen.getByTestId("b").getAttribute("aria-labelledby");
      expect(a).not.toBe(b);
      expect(document.getElementById(a!)?.textContent).toBe("Section A");
      expect(document.getElementById(b!)?.textContent).toBe("Section B");
    });

    it("gives the action pattern no separator role, so the control is what is announced", () => {
      ui(
        <Divider testID="d">
          <Button small outline>Load more</Button>
        </Divider>,
      );
      expect(screen.getByTestId("d").getAttribute("role")).toBeNull();
      expect(screen.getByTestId("d").getAttribute("aria-labelledby")).toBeNull();
      expect(screen.queryByRole("separator")).toBeNull();
      expect(screen.getByRole("button", { name: "Load more" })).toBeTruthy();
    });
  });
}
