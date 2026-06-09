```tsx
import { useTheme } from "@olympusoss/canvas";

// Read the active theme anywhere under the provider.
const { scheme, surface, tokens, dark } = useTheme();
// scheme:  "light" | "dark"      surface: "default" | "glass"
// tokens:  active color tokens   dark:    scheme === "dark"
```
