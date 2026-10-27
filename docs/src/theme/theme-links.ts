// The kit's palettes, spelled out: this module is imported by the unit tests and the
// preview opener with no kit build, so it imports nothing (test/audit-protocol-palette.test.ts
// holds the spelling to the kit's PALETTES).
export const LINK_PALETTES = ["violet", "cyan", "mint", "rose", "amber"] as const;
type Palette = (typeof LINK_PALETTES)[number];

/** Explicit appearance choices carried by an external docs link. */
export interface ThemeLinkOverrides {
  scheme?: "light" | "dark";
  surface?: "solid" | "glass";
  /** The accent palette, in either scheme. */
  palette?: Palette;
}

/** A whole docs appearance: one value on every axis a link can name. */
export type DocsLook = Required<ThemeLinkOverrides>;

// The appearance every pre-rendered page ships with (app.json `web.output: "static"`):
// the docs default to dark on every platform, to glass everywhere, not just iOS 26, and
// to violet, the kit's default accent.
export const EXPORTED_LOOK: DocsLook = { scheme: "dark", surface: "glass", palette: "violet" };

type SearchValue = string | string[] | undefined;

export function themeFromParams(params: { scheme?: SearchValue; surface?: SearchValue; palette?: SearchValue }): ThemeLinkOverrides {
  const first = (value: SearchValue) => Array.isArray(value) ? value[0] : value;
  const scheme = first(params.scheme);
  const surface = first(params.surface);
  const palette = first(params.palette);
  return {
    ...(scheme === "light" || scheme === "dark" ? { scheme } : {}),
    ...(surface === "solid" || surface === "glass" ? { surface } : {}),
    ...(isPalette(palette) ? { palette } : {}),
  };
}

function isPalette(value: string | undefined): value is Palette {
  return (LINK_PALETTES as readonly string[]).includes(value ?? "");
}

/** Missing or invalid axes leave the current in-app choice alone. */
export function themeFromURL(url: string | null): ThemeLinkOverrides {
  if (!url) return {};
  try {
    const params = new URL(url).searchParams;
    return themeFromParams({
      scheme: params.get("scheme") ?? undefined,
      surface: params.get("surface") ?? undefined,
      palette: params.get("palette") ?? undefined,
    });
  } catch {
    return {};
  }
}

/**
 * What a launch asks for: the router's search params, then the native launch URL on
 * top. The URL wins an axis both name, since on native the router may not have
 * published its params by the first render; an axis only the params name still counts.
 */
export function launchRequest(
  params: { scheme?: SearchValue; surface?: SearchValue; palette?: SearchValue },
  url: string | null,
): ThemeLinkOverrides {
  return { ...themeFromParams(params), ...themeFromURL(url) };
}

/** `look` with the request's axes applied; an axis the request omits keeps its value. */
export function withOverrides(look: DocsLook, request: ThemeLinkOverrides): DocsLook {
  return {
    scheme: request.scheme ?? look.scheme,
    surface: request.surface ?? look.surface,
    palette: request.palette ?? look.palette,
  };
}

/**
 * The look the first render paints on `os` (React Native's `Platform.OS`). The web
 * hydrates markup exported in EXPORTED_LOOK, so it starts there and applies the
 * request after hydration; iOS and Android have no markup to match and start in the
 * requested look, so a cold deep link never paints the exported look first.
 */
export function firstLook(os: string, request: ThemeLinkOverrides): DocsLook {
  return os === "web" ? EXPORTED_LOOK : withOverrides(EXPORTED_LOOK, request);
}

export interface ThemeLinkSource {
  getLinkingURL(): string | null;
  addEventListener(type: "url", listener: (event: { url: string }) => void): { remove(): void };
}

/**
 * Observe external links, never ordinary router navigation. Subscribe before
 * re-reading the native cache to include an intent arriving during mount.
 * Reopening the same URL is still an explicit request to apply its choices.
 */
export function subscribeThemeLinks(
  source: ThemeLinkSource,
  initialURL: string | null,
  apply: (overrides: ThemeLinkOverrides) => void,
): () => void {
  const receive = (url: string | null) => {
    const overrides = themeFromURL(url);
    if (overrides.scheme || overrides.surface || overrides.palette) apply(overrides);
  };
  const subscription = source.addEventListener("url", ({ url }) => receive(url));
  const currentURL = source.getLinkingURL();
  if (currentURL !== initialURL) receive(currentURL);
  return () => subscription.remove();
}
