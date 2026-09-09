// Compile the public token interface with a complete literal written before the
// optional text roles existed. A required addition would break this consumer.
import type { ColorTokens } from "../../src/style/tokens.js";

export const legacy: ColorTokens = {
  background: "#ffffff", foreground: "#09090b",
  card: "#ffffff", "card-foreground": "#09090b",
  popover: "#ffffff", "popover-foreground": "#09090b",
  primary: "#4f39f6", "primary-foreground": "#fafafa",
  secondary: "#f4f4f5", "secondary-foreground": "#18181b",
  muted: "#f4f4f5", "muted-foreground": "#6d6d77",
  accent: "#f4f4f5", "accent-foreground": "#18181b",
  destructive: "#e7000b", "destructive-foreground": "#fafafa",
  success: "#16a34a", "success-foreground": "#042812",
  warning: "#d97708", "warning-foreground": "#451a03",
  border: "#e4e4e7", input: "#88888b", ring: "#615fff",
  "chart-1": "#6366f1", "chart-2": "#0d9488", "chart-3": "#ea580c", "chart-4": "#f43f5e",
  "chart-5": "#8b5cf6", "chart-6": "#0891b2", "chart-7": "#059669", "chart-8": "#ec4899",
};

export const branded: ColorTokens = { ...legacy, "primary-text": "rgba(80, 40, 160, 0.9)" };
// @ts-expect-error The optional role still accepts a color string, not a number.
export const invalid: ColorTokens = { ...legacy, "primary-text": 42 };

export const errors: ColorTokens = { ...legacy, "destructive-text": "rgba(160, 20, 40, 0.9)" };
// @ts-expect-error Error text accepts a color string, not a number.
export const invalidErrors: ColorTokens = { ...legacy, "destructive-text": 42 };
