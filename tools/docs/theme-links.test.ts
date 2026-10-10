import { describe, expect, it } from "bun:test";
import {
  EXPORTED_LOOK,
  firstLook,
  launchRequest,
  subscribeThemeLinks,
  themeFromParams,
  themeFromURL,
  withOverrides,
  type DocsLook,
  type ThemeLinkOverrides,
  type ThemeLinkSource,
} from "../../docs/src/theme/theme-links";

function nativeLinks(initialURL: string | null) {
  let currentURL = initialURL;
  const listeners = new Set<(event: { url: string }) => void>();
  const source: ThemeLinkSource = {
    getLinkingURL: () => currentURL,
    addEventListener: (_type, listener) => {
      listeners.add(listener);
      return { remove: () => { listeners.delete(listener); } };
    },
  };
  return {
    source,
    navigate(url: string) { currentURL = url; },
    open(url: string) {
      currentURL = url;
      for (const listener of listeners) listener({ url });
    },
  };
}

describe("docs external appearance links", () => {
  it("reads native cold-launch axes before router search params are available", () => {
    expect(themeFromURL("canvas:///testing/materials?surface=solid&scheme=light")).toEqual({ surface: "solid", scheme: "light" });
    expect(themeFromURL("canvas:///components/button?surface=glass&scheme=dark")).toEqual({ surface: "glass", scheme: "dark" });
  });

  it("uses the first value consistently for repeated router and URL parameters", () => {
    expect(themeFromParams({ scheme: ["light", "dark"], surface: ["solid", "glass"] })).toEqual({ scheme: "light", surface: "solid" });
    expect(themeFromURL("canvas:///theming?scheme=light&scheme=dark&surface=solid&surface=glass")).toEqual({ scheme: "light", surface: "solid" });
  });

  it("ignores absent, malformed and unsupported axes without resetting anything", () => {
    for (const url of [null, "", "not a url", "canvas:///components/button", "canvas:///theming?scheme=system&surface=flat&palette=teal"]) {
      expect(themeFromURL(url)).toEqual({});
    }
    expect(themeFromParams({ scheme: [], surface: ["invalid", "solid"], palette: ["invalid", "mint"] })).toEqual({});
    expect(themeFromURL("https://canvas.nannier.com/theming?scheme=light&surface=invalid")).toEqual({ scheme: "light" });
  });

  it("reads the palette axis beside the other two and accepts only the kit's light palettes", () => {
    expect(themeFromURL("canvas:///theming?palette=mint")).toEqual({ palette: "mint" });
    expect(themeFromURL("canvas:///theming?palette=blush")).toEqual({ palette: "blush" });
    expect(themeFromURL("canvas:///theming?palette=Mint")).toEqual({});
    expect(themeFromParams({ palette: ["mint", "blush"] })).toEqual({ palette: "mint" });
    expect(themeFromURL("https://canvas.nannier.com/components/button?scheme=light&surface=solid&palette=mint")).toEqual({ scheme: "light", surface: "solid", palette: "mint" });
  });

  it("carries dark and mint together: the kit, not the link, resolves dark over mint", () => {
    expect(themeFromURL("canvas:///components/button?scheme=dark&palette=mint")).toEqual({ scheme: "dark", palette: "mint" });
    expect(themeFromParams({ scheme: "dark", palette: "mint" })).toEqual({ scheme: "dark", palette: "mint" });
  });

  it("applies a warm palette-only request, including the same link reopened after a manual change", () => {
    const url = "canvas:///theming?palette=mint";
    const links = nativeLinks(url);
    let theme: ThemeLinkOverrides = { scheme: "dark", surface: "glass", palette: "blush" };
    const unsubscribe = subscribeThemeLinks(links.source, url, (next) => { theme = { ...theme, ...next }; });
    expect(theme).toEqual({ scheme: "dark", surface: "glass", palette: "blush" });
    links.open(url);
    expect(theme).toEqual({ scheme: "dark", surface: "glass", palette: "mint" });
    theme = { ...theme, palette: "blush" };
    links.open(url);
    expect(theme).toEqual({ scheme: "dark", surface: "glass", palette: "mint" });
    unsubscribe();
  });

  it("preserves the palette a link omits, and the other axes when a link names only the palette", () => {
    const links = nativeLinks(null);
    let theme: ThemeLinkOverrides = { scheme: "light", surface: "solid", palette: "mint" };
    const unsubscribe = subscribeThemeLinks(links.source, null, (next) => { theme = { ...theme, ...next }; });
    links.open("canvas:///theming?scheme=dark");
    expect(theme).toEqual({ scheme: "dark", surface: "solid", palette: "mint" });
    links.open("canvas:///theming?palette=blush");
    expect(theme).toEqual({ scheme: "dark", surface: "solid", palette: "blush" });
    links.open("canvas:///theming?palette=teal");
    expect(theme).toEqual({ scheme: "dark", surface: "solid", palette: "blush" });
    unsubscribe();
  });

  it("applies a warm external request including the same link reopened after a manual toggle", () => {
    const url = "canvas:///testing/materials?surface=solid&scheme=light";
    const links = nativeLinks(url);
    let theme: ThemeLinkOverrides = { scheme: "dark", surface: "glass" };
    const unsubscribe = subscribeThemeLinks(links.source, url, (next) => { theme = { ...theme, ...next }; });
    // The unchanged initial URL has already seeded React state and is not replayed.
    expect(theme).toEqual({ scheme: "dark", surface: "glass" });
    links.open(url);
    expect(theme).toEqual({ scheme: "light", surface: "solid" });
    theme = { scheme: "dark", surface: "glass" };
    links.open(url);
    expect(theme).toEqual({ scheme: "light", surface: "solid" });
    unsubscribe();
  });

  it("preserves each omitted axis and manual state during ordinary navigation", () => {
    const links = nativeLinks(null);
    let theme: ThemeLinkOverrides = { scheme: "dark", surface: "solid" };
    const unsubscribe = subscribeThemeLinks(links.source, null, (next) => { theme = { ...theme, ...next }; });
    links.navigate("canvas:///components/card?scheme=light&surface=glass");
    expect(theme).toEqual({ scheme: "dark", surface: "solid" });
    links.open("canvas:///theming?scheme=light");
    expect(theme).toEqual({ scheme: "light", surface: "solid" });
    links.open("canvas:///theming?surface=glass");
    expect(theme).toEqual({ scheme: "light", surface: "glass" });
    links.open("canvas:///theming?surface=flat&scheme=system");
    expect(theme).toEqual({ scheme: "light", surface: "glass" });
    unsubscribe();
  });

  it("recovers an incoming native URL between the initial render and subscription", () => {
    const links = nativeLinks("canvas:///components/button?scheme=light&surface=solid");
    const received: ThemeLinkOverrides[] = [];
    const unsubscribe = subscribeThemeLinks(links.source, null, (next) => { received.push(next); });
    expect(received).toEqual([{ scheme: "light", surface: "solid" }]);
    unsubscribe();
  });

  it("removes its listener on provider unmount", () => {
    const links = nativeLinks(null);
    const received: ThemeLinkOverrides[] = [];
    const unsubscribe = subscribeThemeLinks(links.source, null, (next) => { received.push(next); });
    unsubscribe();
    links.open("canvas:///components/button?scheme=light&surface=solid");
    expect(received).toEqual([]);
  });
});

// The Preview links' optional look query (`&scheme=&surface=&palette=`) reaches the
// docs as the deep link `canvas:///<route>?<query>` (docs/scripts/preview-links.mjs).
// DocsThemeProvider builds its launch request with launchRequest, paints firstLook on
// the first render, and applies each later external link over the current look, axis
// by axis, the way withOverrides does.
describe("the look a Preview deep link lands in", () => {
  const MINT = "canvas:///components/button?scheme=light&palette=mint";
  const FULL = "canvas:///components/button?scheme=light&surface=solid&palette=mint";

  it("starts every platform's export from dark glass in blush", () => {
    expect(EXPORTED_LOOK).toEqual({ scheme: "dark", surface: "glass", palette: "blush" });
  });

  for (const os of ["ios", "android"]) {
    it(`paints a cold ${os} launch in the link's look on its first render`, () => {
      expect(firstLook(os, launchRequest({}, MINT))).toEqual({ scheme: "light", surface: "glass", palette: "mint" });
      expect(firstLook(os, launchRequest({}, FULL))).toEqual({ scheme: "light", surface: "solid", palette: "mint" });
      expect(firstLook(os, launchRequest({}, "canvas:///components/button?palette=mint"))).toEqual({ ...EXPORTED_LOOK, palette: "mint" });
    });

    it(`starts a cold ${os} launch with no link, or none it can read, in the exported look`, () => {
      for (const url of [null, "canvas:///components/button", "canvas:///components/button?scheme=system&palette=teal"]) {
        expect(firstLook(os, launchRequest({}, url))).toEqual(EXPORTED_LOOK);
      }
    });
  }

  it("lets the native launch URL win an axis the router params also name, and keeps the params' other axes", () => {
    expect(launchRequest({ scheme: "dark", surface: "solid", palette: "blush" }, MINT)).toEqual({ scheme: "light", surface: "solid", palette: "mint" });
    expect(launchRequest({ palette: ["mint", "blush"] }, null)).toEqual({ palette: "mint" });
    expect(launchRequest({ surface: "invalid" }, "canvas:///components/button?surface=solid")).toEqual({ surface: "solid" });
  });

  it("hydrates the web in the exported look, then lands in the link's look", () => {
    const request = launchRequest({ scheme: "light", surface: "solid", palette: "mint" }, null);
    expect(firstLook("web", request)).toEqual(EXPORTED_LOOK);
    expect(withOverrides(firstLook("web", request), request)).toEqual({ scheme: "light", surface: "solid", palette: "mint" });
  });

  it("keeps mint through dark, so the kit paints dark now and mint once the scheme turns light", () => {
    const dark = firstLook("ios", launchRequest({}, "canvas:///components/button?scheme=dark&palette=mint"));
    expect(dark).toEqual({ scheme: "dark", surface: "glass", palette: "mint" });
    expect(withOverrides(dark, { scheme: "light" })).toEqual({ scheme: "light", surface: "glass", palette: "mint" });
  });

  for (const os of ["ios", "android"]) {
    it(`moves a running ${os} app by warm links, axis by axis, and never by ordinary navigation`, () => {
      const links = nativeLinks(MINT);
      let look: DocsLook = firstLook(os, launchRequest({}, MINT));
      const unsubscribe = subscribeThemeLinks(links.source, MINT, (next) => { look = withOverrides(look, next); });
      expect(look).toEqual({ scheme: "light", surface: "glass", palette: "mint" });

      links.open("canvas:///components/card?palette=blush");
      expect(look).toEqual({ scheme: "light", surface: "glass", palette: "blush" });
      links.open("canvas:///components/card?scheme=dark&surface=solid");
      expect(look).toEqual({ scheme: "dark", surface: "solid", palette: "blush" });
      links.navigate("canvas:///components/badge?scheme=light&palette=mint");
      expect(look).toEqual({ scheme: "dark", surface: "solid", palette: "blush" });
      links.open(MINT);
      expect(look).toEqual({ scheme: "light", surface: "solid", palette: "mint" });
      unsubscribe();
    });
  }

  it("applies an override without changing the look it was given", () => {
    const look: DocsLook = { ...EXPORTED_LOOK };
    expect(withOverrides(look, { palette: "mint" })).toEqual({ ...EXPORTED_LOOK, palette: "mint" });
    expect(look).toEqual(EXPORTED_LOOK);
    expect(withOverrides(look, {})).toEqual(look);
  });
});
