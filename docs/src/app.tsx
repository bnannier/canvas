import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Shell } from "./layout/shell";
import { Home } from "./pages/home";
import { ComponentPage } from "./pages/component-page";
import { TemplatePage } from "./pages/template-page";
import { PatternPage } from "./pages/pattern-page";
import { TokensPage } from "./pages/tokens";
import { SpacingPage } from "./pages/tokens-spacing";
import { TypographyPage } from "./pages/tokens-typography";
import { UtilitiesPage } from "./pages/utilities";
import { ThemingPage } from "./pages/theming";
import { IntegrationPage } from "./pages/integration";
import { BrowserSupportPage } from "./pages/browser-support";
import { RnPrimitivesPage } from "./pages/rn-primitives";
import { ComponentsIndex } from "./pages/components-index";
import { ComparePage } from "./pages/compare";
import { NotFound } from "./pages/not-found";

const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { index: true, element: <Home /> },
      // Token pages live under /tokens/* so every URL names its content
      // (colors / spacing / typography / layout). The bare /tokens and the
      // legacy /utilities redirect to their new homes so old links never break.
      { path: "tokens", element: <Navigate to="/tokens/colors" replace /> },
      { path: "tokens/colors", element: <TokensPage /> },
      { path: "tokens/spacing", element: <SpacingPage /> },
      { path: "tokens/typography", element: <TypographyPage /> },
      { path: "tokens/layout", element: <UtilitiesPage /> },
      { path: "utilities", element: <Navigate to="/tokens/layout" replace /> },
      { path: "theming", element: <ThemingPage /> },
      { path: "integration", element: <IntegrationPage /> },
      { path: "browser-support", element: <BrowserSupportPage /> },
      { path: "rn-primitives", element: <RnPrimitivesPage /> },
      { path: "components", element: <ComponentsIndex /> },
      { path: "compare", element: <ComparePage /> },
      // Component slugs match the display name; redirect the old slugs.
      { path: "components/sidebar", element: <Navigate to="/components/navigation" replace /> },
      { path: "components/switch", element: <Navigate to="/components/toggle" replace /> },
      { path: "components/:slug", element: <ComponentPage /> },
      { path: "templates/:slug", element: <TemplatePage /> },
      { path: "patterns/:slug", element: <PatternPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
], {
  // On GitHub Pages the app is served under /canvas/; vite sets BASE_URL to the
  // configured base, so the router resolves routes under the same prefix. Strip
  // the trailing slash (react-router wants the basename without it); "/" -> "".
  basename: import.meta.env.BASE_URL.replace(/\/$/, ""),
});

export function App() {
  return <RouterProvider router={router} />;
}
