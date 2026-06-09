```javascript
import { getTheme, setTheme, toggleTheme } from "@olympusoss/canvas";

getTheme();        // "light" | "dark"
setTheme("dark");  // applies .dark to <html>, persists to localStorage
toggleTheme();     // switches and returns the new theme
```
