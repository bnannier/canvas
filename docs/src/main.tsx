import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@olympusoss/canvas";
import { App } from "./app";
import { useDocsScheme, useDocsSurface } from "./use-docs-scheme";
import "./fonts.css";
import "../../styles/canvas.css";
import "./docs-chrome.css";
import "./docs.css";

function Root() {
  const scheme = useDocsScheme();
  const surface = useDocsSurface();
  return (
    <ThemeProvider scheme={scheme} surface={surface}>
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
