```tsx
import { setTheme, toggleTheme, setSurface, setDensity } from "@olympusoss/canvas";

setTheme("dark");       // toggles <html class="dark"> and persists to localStorage
toggleTheme();          // flips light <-> dark, returns the next theme
setSurface("glass");    // <html data-surface="glass">  (solid is the default)
setDensity("compact");  // <html data-density="compact"> (regular is the default)
```
