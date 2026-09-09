import type { ColorTokens } from "./tokens.js";

// Error/action text on neutral surfaces, separate from the destructive fill and
// its destructive-foreground label. Legacy complete token maps can omit it.
export function destructiveText(tokens: ColorTokens): string {
  return tokens["destructive-text"] ?? tokens.destructive;
}
