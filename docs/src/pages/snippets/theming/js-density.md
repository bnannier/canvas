```javascript
import { getDensity, setDensity } from "@olympusoss/canvas";

getDensity();            // "compact" | "regular" | "comfy"
setDensity("compact");   // sets data-density="compact"
setDensity("regular");   // removes the attribute
```
