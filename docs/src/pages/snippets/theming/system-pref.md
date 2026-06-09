```javascript
import { setTheme } from "@olympusoss/canvas";

// Web only. On native, ThemeProvider already follows the OS appearance.
const mq = window.matchMedia("(prefers-color-scheme: dark)");
setTheme(mq.matches ? "dark" : "light");
mq.addEventListener("change", (e) => setTheme(e.matches ? "dark" : "light"));
```
