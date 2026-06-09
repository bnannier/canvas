```tsx
import { cn } from "@olympusoss/canvas";

// Compose classNames for Canvas primitives; the engine resolves them to RN styles.
// Falsy values are dropped, so conditionals stay inline.
cn("flex-row items-center gap-2", isActive && "bg-accent", className);
```
