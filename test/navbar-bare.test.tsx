import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Navbar } from "../src/organisms/navbars/navbars.tsx";
import { Navbar as IosNavbar } from "../src/organisms/navbars/navbars.ios.tsx";
import { Navbar as AndroidNavbar } from "../src/organisms/navbars/navbars.android.tsx";
import { surfaceOf } from "../src/organisms/navbars/navbars.shared.tsx";

// The Navbar's `bare` surface: the scroll-edge appearance, where the bar paints no surface
// and no hairline and sits clear on what is behind it (the docs' top bar on Dark Factory's
// frame while nothing has scrolled under it). Its own material returns without it.

afterEach(cleanup);

const bar = (testID: string) => screen.getByTestId(testID);
const materials = (root: HTMLElement) => root.querySelectorAll('[data-testid="glass-material"]').length;

describe("Navbar bare", () => {
  for (const [platform, Bar] of [["web", Navbar], ["ios", IosNavbar], ["android", AndroidNavbar]] as const) {
    it(`paints no material, fill or hairline under glass or solid (${platform}), and takes them back without it`, async () => {
      for (const surface of ["glass", "solid"] as const) {
        const view = render(
          <ThemeProvider light surface={surface}>
            <Bar bare testID="bare" brand="Canvas" />
            <Bar testID="framed" brand="Canvas" />
          </ThemeProvider>,
        );
        const bare = bar("bare");
        expect(materials(bare)).toBe(0);
        expect(bare.style.backgroundColor === "" || bare.style.backgroundColor === "transparent").toBe(true);
        expect(bare.style.borderBottomWidth === "" || bare.style.borderBottomWidth === "0px").toBe(true);
        if (surface === "glass") await waitFor(() => expect(materials(bar("framed"))).toBeGreaterThan(0));
        else expect(bar("framed").style.backgroundColor).not.toBe("");
        expect(screen.getAllByText("Canvas")).toHaveLength(2);
        view.unmount();
      }
    });
  }

  it("keeps a framed bar's frame over a bare request (first match wins)", () => {
    expect(surfaceOf({ bare: true })).toBe("bare");
    expect(surfaceOf({ bare: true, bordered: true })).toBe("bordered");
    expect(surfaceOf({ bare: true, floating: true })).toBe("floating");
    expect(surfaceOf({})).toBe("default");
  });
});
