/**
 * The skins that draw each role of the shape table, per platform.
 *
 * `shape` in src/style/tokens.ts is the one source for a corner that plays a role (a
 * control, a field, a card, a dialog, a menu, a sheet, a checkbox box, a pill, a tile):
 * a skin whose corner plays one reads its platform's row instead of spelling a number.
 * Nothing kept the native rows honest while they only recorded what the skins spelled,
 * and it showed: the iOS checkbox became the edit-mode selection circle while the table
 * still said 5, a value no surface ever drew.
 *
 * This table is what test/design-rules-shape.test.ts compares. A member names a hand-off
 * token of tools/tokens/skin-families.ts, whose reader invokes the skin the way the
 * hand-off test does, and the platforms on which that skin draws the role; a platform it
 * leaves out draws a corner of its own for that component, and `why` says which. Every
 * role has a member on every platform, so a row nothing draws cannot sit in the table.
 *
 * HANDOFF_SHAPE_TOKENS holds the hand-off custom properties that are named for a role
 * rather than read from one skin.
 */

import type { PlatformKey } from "./css-tokens.ts";
import type { ShapeTokens } from "../../src/style/tokens.ts";

export type ShapeRole = keyof ShapeTokens;

export interface ShapeMember {
  /** A hand-off token of SKIN_FAMILIES; every family that checks it is read. */
  token: string;
  /** The platforms whose skin draws this role's corner. */
  on: PlatformKey[];
  /** What the platforms left out of `on` draw instead. */
  why?: string;
}

const ALL: PlatformKey[] = ["web", "ios", "android"];

export const SHAPE_ROLES: Record<ShapeRole, ShapeMember[]> = {
  control: [
    { token: "p-nav-link-radius", on: ALL },
    { token: "p-side-row-radius", on: ALL },
    { token: "p-cal-chevron-radius", on: ALL },
    { token: "p-btn-radius", on: ["ios", "android"], why: "the web Button is Dark Factory's pill, a `pill` member" },
    { token: "p-menu-row-radius", on: ["web"], why: "iOS and Android menu rows run full bleed inside the menu card" },
    { token: "p-side-toggle-radius", on: ["web", "android"], why: "the iOS collapse toggle paints no fill" },
    { token: "p-tab-v-radius", on: ["web", "android"], why: "iOS draws its grouped-rail row at 8, not a capsule" },
  ],
  field: [
    { token: "p-field-radius", on: ALL },
    { token: "p-select-radius", on: ALL },
    { token: "p-ac-radius", on: ALL },
    { token: "p-otp-radius", on: ["web", "ios"], why: "Android draws separated M3 outlined cells at 12" },
  ],
  card: [
    { token: "p-card-radius", on: ALL },
    { token: "p-stat-radius", on: ALL },
    { token: "p-empty-radius", on: ALL },
    { token: "p-feed-radius", on: ALL },
    { token: "p-cal-radius", on: ALL },
    { token: "p-acc-card-radius", on: ALL },
    { token: "p-list-radius", on: ["web", "android"], why: "iOS draws the 26 inset grouped list" },
    { token: "p-dl-radius", on: ["web", "android"], why: "iOS draws the 26 inset grouped list" },
    { token: "p-media-radius", on: ["web", "android"], why: "iOS draws the 10 inset group" },
    { token: "p-carousel-slide-radius", on: ["web", "ios"], why: "Android draws the M3 carousel item at 28" },
  ],
  dialog: [
    { token: "p-dialog-radius", on: ALL },
    { token: "p-ad-radius", on: ALL },
    { token: "p-sheet-card-radius-top", on: ["web"], why: "iOS draws its 34 action sheet and Android the M3 bottom sheet, a `sheet` member" },
  ],
  menu: [
    { token: "p-menu-radius", on: ALL },
    { token: "p-select-panel-radius", on: ALL },
    { token: "p-ac-menu-radius", on: ALL },
    { token: "p-popover-radius", on: ["web", "ios"], why: "Android draws Dark Factory's 12 panel (M3 has no popover)" },
  ],
  sheet: [
    { token: "p-drawer-sheet-radius", on: ALL },
    { token: "p-drawer-side-radius", on: ["web", "ios"], why: "Android draws the M3 navigation drawer at 16" },
    { token: "p-sheet-card-radius-top", on: ["android"], why: "the web card is a `dialog` member and iOS draws its 34 action sheet" },
  ],
  checkbox: [{ token: "p-check-radius", on: ALL }],
  pill: [
    { token: "p-badge-radius", on: ALL },
    { token: "p-page-radius", on: ALL },
    { token: "p-seg-track-radius", on: ALL },
    { token: "p-tab-pill-track-radius", on: ALL },
    { token: "p-tab-pill-radius", on: ALL },
    { token: "p-btn-radius", on: ["web"], why: "iOS and Android Buttons are capsules by the `control` row" },
    { token: "p-chip-radius", on: ["web", "ios"], why: "Android draws the M3 chip at 8" },
    { token: "p-toast-radius", on: ["web", "ios"], why: "Android draws the M3 snackbar at 4" },
  ],
  tile: [
    { token: "p-alert-radius", on: ALL },
    { token: "p-emblem-radius-default", on: ALL },
    { token: "p-swatch-radius-default", on: ALL },
  ],
};

/** Hand-off custom properties named for a shape role rather than read from one skin. */
export const HANDOFF_SHAPE_TOKENS: Record<string, ShapeRole> = {
  "p-overlay-radius": "dialog",
  "p-sheet-radius": "sheet",
};
