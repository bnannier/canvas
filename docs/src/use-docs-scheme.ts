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

// Mirror the docs' Solid/Glass toggle (data-surface="glass" on <html>, set by
// setSurface) into the value the Canvas ThemeProvider consumes, so the RN
// components go translucent with the toggle, not just the docs chrome.
function subscribeSurface(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-surface"] });
  return () => observer.disconnect();
}

function getSurfaceSnapshot(): "default" | "glass" {
  return document.documentElement.dataset.surface === "glass" ? "glass" : "default";
}

export function useDocsSurface(): "default" | "glass" {
  return useSyncExternalStore(subscribeSurface, getSurfaceSnapshot, () => "default");
}
