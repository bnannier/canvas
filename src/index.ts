"use client";

// Canvas is a react-native-web kit: every export ultimately touches React
// context, state, or browser APIs, so the whole package is a client boundary.
// Declaring it here means a React Server Components consumer (Next.js App
// Router) can import the kit from a server component without each app having
// to remember its own "use client" wrapper. tsc preserves this prologue into
// dist/index.js, the package's only public JS entry.

export { token, hsl } from "./tokens.js";
export {
  getTheme,
  setTheme,
  toggleTheme,
  getPalette,
  setPalette,
  getSurface,
  setSurface,
  getDensity,
  setDensity,
} from "./theme.js";

export type { Theme, Density } from "./theme.js";

// The style foundation: design tokens, the theme runtime (ThemeProvider/useTheme),
// desktop-first responsive helpers, the shadow/alpha helpers, and the raw React
// Native primitives (View/Text/Pressable/TextInput/ScrollView; Image graduated to
// a Canvas atom). This also exports the Surface type (the glass/default theming
// switch). The explicit list, not the internal style hub (./style/index.ts), so a
// helper the kit adds for its own skins never becomes public by accident.
export * from "./style/public.js";

// Components, grouped by atomic-design level (atoms / molecules / organisms).
export * from "./atoms/index.js";
export * from "./molecules/index.js";
export * from "./organisms/index.js";
export * from "./charts/index.js";
