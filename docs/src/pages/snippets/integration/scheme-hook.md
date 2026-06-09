```tsx
import { useSyncExternalStore } from "react";

// setTheme() toggles <html class="dark">. Mirror that class into the value the
// ThemeProvider consumes, so the React Native components re-theme with the page.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const getSnapshot = () =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

export function useHtmlScheme(): "light" | "dark" {
  return useSyncExternalStore(subscribe, getSnapshot, () => "light");
}
```
