export { token, hsl } from "./tokens.js";
export {
  getTheme,
  setTheme,
  toggleTheme,
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
// switch).
export * from "./style/index.js";

// Components, grouped by atomic-design level (atoms / molecules / organisms).
export * from "./atoms/index.js";
export * from "./molecules/index.js";
export * from "./organisms/index.js";
export * from "./charts/index.js";
