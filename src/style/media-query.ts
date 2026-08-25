// The shared web media-query subscription used by the preference/capability
// hooks (a11y-preferences.ts, pointer.ts). Deliberately NOT in the style
// barrel: it is plumbing, not API.

// Subscribe to a CSS media query on the web (react-native-web / DOM), returning its
// current match and invoking `onChange` when it flips. A no-op reporting false off
// the web (no window.matchMedia). Called INSIDE an effect, never cached at module
// scope, so tests can stub window.matchMedia per render and nothing leaks between
// test files. Unknown media features (older browsers) parse as non-matching, so an
// unsupported query degrades to false rather than throwing.
export function subscribeMedia(query: string, onChange: (matches: boolean) => void): { matches: boolean; remove: () => void } {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return { matches: false, remove: () => {} };
  }
  const mql = window.matchMedia(query);
  const listener = (event: MediaQueryListEvent) => onChange(event.matches);
  // Safari < 14 exposes only the deprecated addListener/removeListener pair.
  if (typeof mql.addEventListener === "function") mql.addEventListener("change", listener);
  else mql.addListener?.(listener);
  return {
    matches: mql.matches,
    remove: () => {
      if (typeof mql.removeEventListener === "function") mql.removeEventListener("change", listener);
      else mql.removeListener?.(listener);
    },
  };
}
