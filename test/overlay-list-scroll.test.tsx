import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { createAutocomplete } from "../src/atoms/autocomplete/autocomplete.shared.tsx";
import { createSelect } from "../src/atoms/select/select.shared.tsx";
import {
  webSkin as autocompleteWeb,
  iosSkin as autocompleteIos,
  androidSkin as autocompleteAndroid,
} from "../src/atoms/autocomplete/autocomplete.styles.ts";
import {
  webSkin as selectWeb,
  iosSkin as selectIos,
  androidSkin as selectAndroid,
} from "../src/atoms/select/select.styles.ts";

// A CAPPED OPTION LIST MUST CLIP AND SCROLL.
//
// Autocomplete and Select cap their popover card with `maxHeight`. That cap bounds
// the CARD only: React Native Views are `overflow: visible` and `flexShrink: 0` by
// default, so a list taller than the cap used to paint its extra rows straight past
// the card, on the bare page, with no fill, border or shadow behind them. The iOS
// and Android skins hit it on the docs' own seven-option example (326pt and 344dp of
// rows under 260/280 caps) while the web skin fit by eight pixels, which is exactly
// why nothing caught it: the shared overlay recipe behind both the Playwright
// baselines and the lookout sweep opens `combobox.last()`, the web skin.
//
// The fix is two halves and BOTH are load-bearing, so both are pinned here:
//  - the card clips (`overflow: "hidden"`), so nothing paints outside its corners;
//  - the rows sit in a scrollport that may shrink to the capped card
//    (`flexShrink: 1`), so the rows past the cap scroll into reach instead of being
//    clipped away unreachable.
// Clipping without the scrollport would trade a cosmetic bug for a functional one.

afterEach(cleanup);

const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// Enough rows to overflow the tightest cap (the web skin's 240) on every skin.
const OPTIONS = [
  "Ada Lovelace",
  "Grace Hopper",
  "Kira Tanaka",
  "Liang Bao",
  "Marcus Allen",
  "Noor Park",
  "Rachel Chen",
  "Sofia Ruiz",
  "Tomas Nowak",
  "Yuki Mori",
];

/** The painted card: the nearest ancestor of the option list carrying the skin's cap. */
function cappedCard(listbox: HTMLElement): HTMLElement {
  for (let node = listbox.parentElement; node; node = node.parentElement) {
    if ((node.getAttribute("style") ?? "").includes("max-height")) return node;
  }
  throw new Error("no capped card above the option list");
}

/** The scrollport: a node between the list and the card that may shrink to the cap. */
function hasScrollport(listbox: HTMLElement, card: HTMLElement): boolean {
  for (let node = listbox.parentElement; node && node !== card; node = node.parentElement) {
    if ((node.getAttribute("style") ?? "").includes("flex-shrink: 1")) return true;
  }
  return false;
}

const AutocompleteWeb = createAutocomplete(autocompleteWeb);
const AutocompleteIos = createAutocomplete(autocompleteIos);
const AutocompleteAndroid = createAutocomplete(autocompleteAndroid);
const SelectWeb = createSelect(selectWeb);
const SelectIos = createSelect(selectIos);
const SelectAndroid = createSelect(selectAndroid);

const CASES: Array<[string, ReactNode]> = [
  ["Autocomplete web", <AutocompleteWeb key="aw" open options={OPTIONS} />],
  ["Autocomplete iOS", <AutocompleteIos key="ai" open options={OPTIONS} />],
  ["Autocomplete Android", <AutocompleteAndroid key="aa" open options={OPTIONS} />],
  ["Select web", <SelectWeb key="sw" open options={OPTIONS} />],
  ["Select iOS", <SelectIos key="si" open options={OPTIONS} />],
  ["Select Android", <SelectAndroid key="sa" open options={OPTIONS} />],
];

describe("a capped option list clips and scrolls", () => {
  for (const [name, node] of CASES) {
    it(`${name}: the capped card clips its rows`, () => {
      const { container } = ui(node);
      const listbox = container.querySelector('[role="listbox"]') as HTMLElement | null;
      expect(listbox).toBeTruthy();
      // react-native-web expands the shorthand onto both axes.
      const style = cappedCard(listbox!).getAttribute("style") ?? "";
      expect(style).toContain("overflow-x: hidden");
      expect(style).toContain("overflow-y: hidden");
    });

    it(`${name}: the rows sit in a scrollport that shrinks to the cap`, () => {
      const { container } = ui(node);
      const listbox = container.querySelector('[role="listbox"]') as HTMLElement | null;
      expect(listbox).toBeTruthy();
      expect(hasScrollport(listbox!, cappedCard(listbox!))).toBe(true);
    });
  }
});
