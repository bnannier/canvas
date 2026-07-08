import { Platform } from "react-native";

// The kit's cross-platform monospace face. React Native has no font-family
// utility, so components request a monospaced look through a fontFamily string.
// The bare `"monospace"` alias only resolves on Android; iOS has no font by that
// name and silently falls back to the SF proportional face, so a `mono` Badge,
// `code`/`mono` Typography, monospace Field/DescriptionList value, or CodeBlock
// renders in a variable-width font on iOS. Naming the real system monospace per
// platform fixes that: Menlo on iOS (the system fixed-width face), the working
// "monospace" alias on Android, and "monospace" as the web/other default (RNW
// maps it onto the browser's monospace stack). Every site that wants a monospace
// face reads this instead of hardcoding "monospace".
export const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
}) as string;
