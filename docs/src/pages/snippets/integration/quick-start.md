```tsx
import { ThemeProvider, Button } from "@olympusoss/canvas";

// Wrap the app once in ThemeProvider; it follows the OS appearance by default
// (pass scheme="light" | "dark" to force one). Components are React Native, so
// style them with Canvas's semantic boolean props.
export function App() {
  return (
    <ThemeProvider>
      <Button primary large>Save</Button>
    </ThemeProvider>
  );
}
```
