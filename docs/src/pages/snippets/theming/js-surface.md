```javascript
import { getSurface, setSurface } from "@olympusoss/canvas";

getSurface();            // "solid" | "glass"
setSurface("glass");     // sets data-surface="glass"
setSurface("solid");     // removes the attribute
```
