
import type { Palette } from "./style/tokens.js";

export type Theme = "light" | "dark";
export type Surface = "solid" | "glass";
export type Density = "compact" | "regular" | "comfy";

const STORAGE_KEY_THEME = "canvas-theme";
const STORAGE_KEY_PALETTE = "canvas-palette";
const STORAGE_KEY_SURFACE = "canvas-surface";
const STORAGE_KEY_DENSITY = "canvas-density";

// The theme / palette / surface / density switches live on the web document's root
// element. Guarded so calling any of these helpers never touches DOM globals on native
// or during SSR: off the web the getters return the default and the setters no-op.
function hasDocument(): boolean {
  return typeof document !== "undefined";
}

function store(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch {}
}

function load(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

/**
 * The web light or dark choice: the persisted one, else the document root's `.dark` class.
 * Returns `"light"` off the web.
 */
export function getTheme(): Theme {
  const saved = load(STORAGE_KEY_THEME);
  if (saved === "light" || saved === "dark") return saved;
  if (!hasDocument()) return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/**
 * Persists the web light or dark choice and toggles the `.dark` class on the document root
 * for the CSS hand-off. Pass the same choice to ThemeProvider so React Native components
 * follow it.
 */
export function setTheme(theme: Theme): void {
  if (hasDocument()) document.documentElement.classList.toggle("dark", theme === "dark");
  store(STORAGE_KEY_THEME, theme);
}

/** Flips the web light or dark choice through setTheme and returns the new one. */
export function toggleTheme(): Theme {
  const next = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

// The palette axis: `data-palette="mint"` on the root selects the mint block of
// styles/tokens/colors.css, and blush (the default) is the attribute's absence. `.dark`
// still wins in the stylesheet, as `dark` wins over `mint` on the ThemeProvider.
/**
 * The web palette, `"blush"` or `"mint"`: the persisted one, else the document root's
 * `data-palette`. Returns `"blush"` off the web.
 */
export function getPalette(): Palette {
  const saved = load(STORAGE_KEY_PALETTE);
  if (saved === "blush" || saved === "mint") return saved;
  if (!hasDocument()) return "blush";
  return document.documentElement.dataset.palette === "mint" ? "mint" : "blush";
}

/**
 * Persists the web palette and sets `data-palette` on the document root (blush, the
 * default, removes it). Pass the same choice to ThemeProvider's `mint` so React Native
 * components follow it.
 */
export function setPalette(palette: Palette): void {
  if (hasDocument()) {
    if (palette === "blush") {
      delete document.documentElement.dataset.palette;
    } else {
      document.documentElement.dataset.palette = palette;
    }
  }
  store(STORAGE_KEY_PALETTE, palette);
}

/**
 * The web surface, `"solid"` or `"glass"`: the persisted one, else the document root's
 * `data-surface`. Returns `"solid"` off the web.
 */
export function getSurface(): Surface {
  const saved = load(STORAGE_KEY_SURFACE);
  if (saved === "solid" || saved === "glass") return saved;
  if (!hasDocument()) return "solid";
  return (document.documentElement.dataset.surface as Surface) ?? "solid";
}

/**
 * Persists the web surface and sets `data-surface` on the document root, which gates the
 * CSS hand-off's material mode (solid removes it). Pass the same choice to ThemeProvider
 * so React Native components follow it.
 */
export function setSurface(surface: Surface): void {
  if (hasDocument()) {
    if (surface === "solid") {
      delete document.documentElement.dataset.surface;
    } else {
      document.documentElement.dataset.surface = surface;
    }
  }
  store(STORAGE_KEY_SURFACE, surface);
}

/**
 * The web density, `"compact"`, `"regular"` or `"comfy"`: the persisted one, else the
 * document root's `data-density`. Returns `"regular"` off the web.
 */
export function getDensity(): Density {
  const saved = load(STORAGE_KEY_DENSITY);
  if (saved === "compact" || saved === "regular" || saved === "comfy") return saved;
  if (!hasDocument()) return "regular";
  return (document.documentElement.dataset.density as Density) ?? "regular";
}

/**
 * Persists the web density and sets `data-density` on the document root for the CSS
 * hand-off's card and table spacing (regular removes it). Components take density from
 * their own `compact` and `comfortable` props.
 */
export function setDensity(density: Density): void {
  if (hasDocument()) {
    if (density === "regular") {
      delete document.documentElement.dataset.density;
    } else {
      document.documentElement.dataset.density = density;
    }
  }
  store(STORAGE_KEY_DENSITY, density);
}
