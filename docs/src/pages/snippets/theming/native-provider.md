```tsx
import { ThemeProvider } from "@olympusoss/canvas";

// Wrap the app once. ThemeProvider follows the OS appearance by default;
// pass scheme to force one, and surface="glass" for the frosted surfaces.
export function App() {
  return (
    <ThemeProvider scheme="dark" surface="glass">
      <Screens />
    </ThemeProvider>
  );
}
```
