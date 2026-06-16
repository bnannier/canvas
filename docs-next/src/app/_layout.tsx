import { Stack } from "expo-router";
import { ThemeProvider } from "@olympusoss/canvas";

// The whole app renders inside Canvas's own ThemeProvider, so every component
// (and every documented example) resolves the active scheme / surface / density
// from the kit itself — the docs are themed by the thing they document.
export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
