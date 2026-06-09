```tsx
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@olympusoss/canvas";
// The CSS token layer: custom properties + the .dark / [data-surface] / [data-density]
// hooks. Needed only for the DOM theme helpers and any custom CSS you write with var().
import "@olympusoss/canvas/styles/canvas.css";
import { App } from "./app";
import { useHtmlScheme } from "./use-html-scheme";

function Root() {
  // Keep the RN ThemeProvider in sync with the <html> theme (see the hook below).
  const scheme = useHtmlScheme();
  return (
    <ThemeProvider scheme={scheme}>
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
```
