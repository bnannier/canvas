import type { ViewStyle } from "react-native";
import { alpha } from "./color.js";
import type { ColorTokens } from "./tokens.js";

// A selected card in the solid recipe (a selected Card, a checked Radio card): the primary
// border over the primary colour at a soft tint. One number for every card that shows a
// selection, and the glass selection wash's ceiling (GLASS_WASH in
// glass-surface/glass-wash.ts), so a selected card under glass paints the tint it paints in
// solid, in every palette (the owner's GP-2b decision, audit/DECISIONS.md). Changing it
// changes the glass wash too, so the tuning harness gates this file
// (.tuning-harness.json) and the `solid-state-washes` reference is recorded again.

/** The alpha of the primary colour a selected card's surface takes. */
export const SELECTED_CARD_TINT = 0.05;

/**
 * The solid recipe's selected card: the border recoloured to `primary` (its width unchanged,
 * so selecting never shifts content) over the primary colour at `SELECTED_CARD_TINT`.
 */
export function selectedCard(tokens: Pick<ColorTokens, "primary">): ViewStyle {
  return { borderColor: tokens.primary, backgroundColor: alpha(tokens.primary, SELECTED_CARD_TINT) };
}
