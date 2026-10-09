import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen, fireEvent, act } from "@testing-library/react";
import type { ComponentType, ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Breadcrumb as BreadcrumbWeb, BreadcrumbItem as BreadcrumbItemWeb } from "../src/atoms/breadcrumb/breadcrumb.tsx";
import { Breadcrumb as BreadcrumbIOS, BreadcrumbItem as BreadcrumbItemIOS } from "../src/atoms/breadcrumb/breadcrumb.ios.tsx";
import { Breadcrumb as BreadcrumbAndroid, BreadcrumbItem as BreadcrumbItemAndroid } from "../src/atoms/breadcrumb/breadcrumb.android.tsx";
import type { BreadcrumbProps, BreadcrumbItemProps } from "../src/atoms/breadcrumb/breadcrumb.shared.tsx";

// Breadcrumb's documented behaviour, on every entry (the shell is shared, each platform
// passes its own skin): a navigation landmark named "Breadcrumb", ancestors as links
// that report their label and their index in the full trail, the current page as plain
// text marked aria-current, decorative separators on one axis, and the `maxItems`
// collapse (the first crumb and the last `maxItems - 1`, the middle an ellipsis).
//
// The home crumb's reported index is an open owner decision, so these tests pin its
// name and label only.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const TRAIL = ["Home", "Team", "Projects", "Canvas", "Settings"];

const SKINS: [string, ComponentType<BreadcrumbProps>, ComponentType<BreadcrumbItemProps>][] = [
  ["web", BreadcrumbWeb, BreadcrumbItemWeb],
  ["ios", BreadcrumbIOS, BreadcrumbItemIOS],
  ["android", BreadcrumbAndroid, BreadcrumbItemAndroid],
];

/** The visible separator glyphs, in order. */
const separators = (c: HTMLElement) => [...c.querySelectorAll('[aria-hidden="true"]')].map((n) => n.textContent);

for (const [platform, Breadcrumb, BreadcrumbItem] of SKINS) {
  describe(`Breadcrumb on ${platform}`, () => {
    it("is a navigation landmark named Breadcrumb", () => {
      ui(<Breadcrumb items={["Home", "Library"]} />);
      expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeTruthy();
    });

    it("marks the last crumb as the current page: plain text, not a link, not focusable", () => {
      ui(<Breadcrumb items={["Home", "Library", "Data"]} />);
      const current = screen.getByText("Data");
      expect(current.getAttribute("aria-current")).toBe("page");
      expect(current.closest('[role="link"]')).toBeNull();
      expect(current.closest("[tabindex]")).toBeNull();
      expect(screen.getAllByRole("link").map((l) => l.textContent)).toEqual(["Home", "Library"]);
    });

    it("reports a pressed ancestor's label and index", () => {
      const pressed: [string, number][] = [];
      ui(<Breadcrumb items={["Home", "Library", "Data"]} onItemPress={(item, index) => pressed.push([item, index])} />);
      const library = screen.getByRole("link", { name: "Library" });
      expect(library.getAttribute("tabindex")).toBe("0");
      fireEvent.click(library);
      fireEvent.click(screen.getByRole("link", { name: "Home" }));
      fireEvent.click(screen.getByText("Data"));
      expect(pressed).toEqual([["Library", 1], ["Home", 0]]);
    });

    it("activates a focused link on Enter, never on Space (the APG link pattern), with the same label and index", () => {
      const pressed: [string, number][] = [];
      ui(<Breadcrumb maxItems={3} items={TRAIL} onItemPress={(item, index) => pressed.push([item, index])} />);
      const canvas = screen.getByRole("link", { name: "Canvas" });
      act(() => canvas.focus());
      expect(document.activeElement).toBe(canvas);
      fireEvent.keyDown(canvas, { key: " " });
      fireEvent.keyUp(canvas, { key: " " });
      expect(pressed).toEqual([]);
      fireEvent.keyDown(canvas, { key: "Enter" });
      fireEvent.keyUp(canvas, { key: "Enter" });
      expect(pressed).toEqual([["Canvas", 3]]);
      const home = screen.getByRole("link", { name: "Home" });
      act(() => home.focus());
      fireEvent.keyDown(home, { key: "Enter" });
      fireEvent.keyUp(home, { key: "Enter" });
      expect(pressed).toEqual([["Canvas", 3], ["Home", 0]]);
    });

    it("collapses past maxItems to the first crumb and the last maxItems - 1, reporting original indices", () => {
      const pressed: [string, number][] = [];
      const { container } = ui(<Breadcrumb maxItems={3} items={TRAIL} onItemPress={(item, index) => pressed.push([item, index])} />);
      expect(screen.getAllByRole("link").map((l) => l.textContent)).toEqual(["Home", "Canvas"]);
      expect(screen.getByText("Settings").getAttribute("aria-current")).toBe("page");
      // The middle is one ellipsis crumb, named for what it hides and not a stop.
      const more = screen.getByLabelText("More levels");
      expect(more.textContent).toBe("…");
      expect(more.closest("[tabindex]")).toBeNull();
      expect(container.textContent).not.toContain("Team");
      expect(container.textContent).not.toContain("Projects");
      fireEvent.click(screen.getByRole("link", { name: "Canvas" }));
      expect(pressed).toEqual([["Canvas", 3]]);
    });

    it("leaves a trail no longer than maxItems whole", () => {
      ui(<Breadcrumb maxItems={5} items={TRAIL} />);
      expect(screen.queryByLabelText("More levels")).toBeNull();
      expect(screen.getAllByRole("link")).toHaveLength(4);
    });

    it("hides its separators and resolves the separator axis chevron > slash > dot", () => {
      const glyphs = (props: Partial<BreadcrumbProps>) => {
        const { container } = ui(<Breadcrumb items={["A", "B", "C"]} {...props} />);
        const out = separators(container);
        cleanup();
        return out;
      };
      const chevron = glyphs({});
      expect(chevron).toHaveLength(2);
      expect(new Set(chevron).size).toBe(1);
      expect(glyphs({ chevron: true })).toEqual(chevron);
      expect(glyphs({ slash: true })).toEqual(["/", "/"]);
      expect(glyphs({ dot: true })).toEqual(["·", "·"]);
      expect(glyphs({ chevron: true, slash: true, dot: true })).toEqual(chevron);
      expect(glyphs({ slash: true, dot: true })).toEqual(["/", "/"]);
    });

    it("leads with a home link named Home under homeIcon, reporting the label Home", () => {
      const pressed: string[] = [];
      const { container } = ui(<Breadcrumb homeIcon items={["Library", "Data"]} onItemPress={(item) => pressed.push(item)} />);
      fireEvent.click(screen.getByRole("link", { name: "Home" }));
      expect(pressed).toEqual(["Home"]);
      // The home link is followed by its own separator.
      expect(separators(container)).toHaveLength(2);
    });

    it("renders a standalone BreadcrumbItem as a link, or as the current page", () => {
      let presses = 0;
      ui(
        <>
          <BreadcrumbItem onPress={() => presses++}>Library</BreadcrumbItem>
          <BreadcrumbItem current>Data</BreadcrumbItem>
        </>,
      );
      fireEvent.click(screen.getByRole("link", { name: "Library" }));
      expect(presses).toBe(1);
      expect(screen.getByText("Data").getAttribute("aria-current")).toBe("page");
    });
  });
}
