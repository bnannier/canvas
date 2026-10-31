import type { ColorTokens } from "./tokens.js";
import { alpha, channelsOf, mixOklab } from "./color.js";

// The colours the field skins share for the states the semantic set has no single
// token for: the RESTING border (web and iOS: Input, Textarea, Select, Autocomplete,
// InputOTP, Stepper, PhoneInput, the Command trigger) and the ERROR fill (iOS), both
// from the "iOS Mobile Input Fields" Figma kit (N8TScrzAPwpmwxFS1032my), the iOS
// reference the fields are drawn to; and the web FOCUS HALO (Input, Select,
// Autocomplete), the v4 hand-off's `--ion-ring`.

/**
 * The resting border of a field: the hand-off's strong hairline (--ln2), falling
 * back to `input` for a legacy token map. D14 gives both roles the reference's
 * 16% line; they remain separate so a consumer can override the field alone.
 */
export function fieldBorder(tokens: ColorTokens): string {
  return tokens["field-border"] ?? tokens.input;
}

/**
 * The accent halo around a keyboard-focused web field: the hand-off's `--ion-ring`, the
 * accent at 35% (28% light), now carried directly by `ring` under D14. Legacy
 * token maps with an opaque ring derive the halo from `glow` at 0.7 of its alpha,
 * or use the opaque ring at 35% when no glow exists.
 */
export function focusHaloColor(tokens: ColorTokens): string {
  const ring = channelsOf(tokens.ring);
  if (ring && ring[3] < 1) return tokens.ring;
  const g = tokens.glow ? channelsOf(tokens.glow) : null;
  if (!g) return alpha(tokens.ring, 0.35);
  return `rgba(${g[0]}, ${g[1]}, ${g[2]}, ${Math.round(g[3] * 0.7 * 1000) / 1000})`;
}

/**
 * The error fill of an iOS field: the reference's Background/Error (red-50 on a
 * white box, a dark red-brown on the dark box), derived here as the destructive hue
 * mixed into the field's `card` fill so it follows a rebrand. The mix is scheme-
 * aware without a scheme flag: a light box (the card's relative luminance above
 * one half) takes 6% of the hue, the dark box 12%, which lands within a few channel
 * steps of the source's FEF2F2 / 2C1B1B (the dark card carries a blue cast).
 */
export function fieldErrorFill(tokens: ColorTokens): string {
  return mixOklab(tokens.card, tokens.destructive, isLight(tokens.card) ? 0.06 : 0.12);
}

/** Whether a #rrggbb fill reads as light (relative luminance above 0.5). */
function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length !== 6) return true;
  const channel = (i: number) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4) > 0.5;
}
