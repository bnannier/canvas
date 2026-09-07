/**
 * Opening every overlay the kit ships, in a real browser.
 *
 * The recipes started as the ones in lookout.config.ts, which drives the visual
 * judge, and four of them turned out to be stale: Select is opened by its "Country"
 * button rather than by the text of its current value, Autocomplete by its combobox
 * rather than by the last textbox on the page, Command by its collapsed trigger
 * rather than by the placeholder of an inline palette, and Toast writes into a live
 * region that already exists rather than adding one. Those are recorded here as the
 * handles that actually work.
 *
 * Each recipe clicks the LAST matching trigger inside the Playground stage: the rows
 * stack iOS, Android, Web, so the last one belongs to the Web row, the row whose
 * behaviour is native to the browser being driven.
 */
import { type Locator, type Page } from "@playwright/test";
import { stage } from "./docs";

export interface OverlayRecipe {
  /** The component page's slug. */
  slug: string;
  /** Open it, and return once the overlay is up. */
  open: (page: Page) => Promise<void>;
  /** Every node of the overlay's own role, on the whole page. */
  panel: (page: Page) => Locator;
  /** How many of those one opening adds. One panel, unless the role IS the rows. */
  adds: number;
  /** The control that opened it, for the focus-return check. */
  trigger: (page: Page) => Locator;
  /**
   * Whether the trigger carries aria-expanded. Dialogs and sheets are opened by
   * ordinary buttons and do not; menus, selects and comboboxes do.
   */
  expands?: boolean;
  /**
   * Whether the kit contracts that focus returns to the trigger on close. Dialog,
   * AlertDialog and Popover trap focus and restore it (use-dialog-focus.ts); Dropdown
   * restores it too. The rest close without moving focus back.
   */
  restoresFocus?: boolean;
}

const lastButton = (page: Page, name: string | RegExp) =>
  stage(page).getByRole("button", { name }).last();

export const OVERLAYS: OverlayRecipe[] = [
  {
    slug: "dialog",
    open: async (page) => void (await lastButton(page, "Open dialog").click()),
    panel: (page) => page.getByRole("dialog"),
    adds: 1,
    trigger: (page) => lastButton(page, "Open dialog"),
    restoresFocus: true,
  },
  {
    slug: "alert-dialog",
    open: async (page) => void (await lastButton(page, /Delete identity/).click()),
    panel: (page) => page.getByRole("alertdialog"),
    adds: 1,
    trigger: (page) => lastButton(page, /Delete identity/),
    restoresFocus: true,
  },
  {
    slug: "popover",
    open: async (page) => void (await lastButton(page, "Open popover").click()),
    panel: (page) => page.getByRole("dialog"),
    adds: 1,
    trigger: (page) => lastButton(page, "Open popover"),
    restoresFocus: true,
  },
  {
    slug: "dropdown",
    open: async (page) => void (await lastButton(page, "Actions").click()),
    panel: (page) => page.getByRole("menu"),
    adds: 1,
    trigger: (page) => lastButton(page, "Actions"),
    expands: true,
    restoresFocus: true,
  },
  {
    slug: "row-menu",
    open: async (page) => void (await stage(page).getByLabel("More options").last().click()),
    // KNOWN GAP: the panel renders its rows as `menuitem` but has no `menu` container
    // around them, which the Dropdown does have. WAI-ARIA requires a menuitem to be
    // owned by a menu, so this is a real defect; it is asserted as it is today rather
    // than aspirationally, and the accessibility suite's aria-required-parent finding
    // is the evidence to fix it on.
    panel: (page) => page.getByRole("menuitem"),
    // The role here IS the rows, and this menu has three of them.
    adds: 3,
    trigger: (page) => stage(page).getByLabel("More options").last(),
    expands: true,
  },
  {
    slug: "select",
    open: async (page) => void (await lastButton(page, "Country").click()),
    panel: (page) => page.getByRole("listbox"),
    adds: 1,
    trigger: (page) => lastButton(page, "Country"),
    expands: true,
  },
  {
    slug: "autocomplete",
    open: async (page) => {
      const field = stage(page).getByRole("combobox").last();
      await field.click();
      await field.pressSequentially("a", { delay: 40 });
    },
    panel: (page) => page.getByRole("listbox"),
    adds: 1,
    trigger: (page) => stage(page).getByRole("combobox").last(),
    expands: true,
  },
  {
    slug: "command",
    open: async (page) => void (await lastButton(page, /Search/).click()),
    panel: (page) => page.getByRole("listbox"),
    adds: 1,
    trigger: (page) => lastButton(page, /Search/),
    expands: true,
  },
  {
    slug: "action-sheet",
    open: async (page) => void (await lastButton(page, "Add photo").click()),
    panel: (page) => page.getByRole("dialog"),
    adds: 1,
    trigger: (page) => lastButton(page, "Add photo"),
  },
  {
    slug: "drawer",
    open: async (page) => void (await lastButton(page, "Open menu").click()),
    panel: (page) => page.getByRole("dialog"),
    adds: 1,
    trigger: (page) => lastButton(page, "Open menu"),
  },
];

/**
 * Toast is not an overlay you open and close: it is an announcement written into a
 * live region that is already on the page, and it removes itself. So it gets its own
 * assertions rather than a row in the table above.
 */
export const TOAST = {
  slug: "toast",
  open: (page: Page) => lastButton(page, "Show toast").click(),
  region: (page: Page) => page.getByRole("status"),
};
