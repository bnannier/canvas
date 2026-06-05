import { useSyncExternalStore } from "react";

// Mirror the docs' light/dark toggle (a `dark` class on <html>) into a value the
// Canvas ThemeProvider can consume, so RN components follow the docs toggle
// rather than the OS appearance.

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getSnapshot(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useDocsScheme(): "light" | "dark" {
  return useSyncExternalStore(subscribe, getSnapshot, () => "light");
}
