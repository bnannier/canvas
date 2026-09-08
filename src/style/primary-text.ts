import type { ColorTokens } from "./tokens.js";

// A foreground on neutral or softly tinted surfaces, separate from the primary
// fill and its primary-foreground label. Legacy complete token maps can omit it.
export function primaryText(tokens: ColorTokens): string {
  return tokens["primary-text"] ?? tokens.primary;
}
