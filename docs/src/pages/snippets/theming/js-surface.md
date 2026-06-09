```javascript
import { getSurface, setSurface } from "@olympusoss/canvas";

getSurface();            // "default" | "glass"
setSurface("glass");     // sets data-surface="glass"
setSurface("default");   // removes the attribute
```
