import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
import { NotFound } from "./pages/not-found";

const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { index: true, element: <Home /> },
      { path: "tokens", element: <TokensPage /> },
      { path: "tokens/spacing", element: <SpacingPage /> },
      { path: "tokens/typography", element: <TypographyPage /> },
      { path: "utilities", element: <UtilitiesPage /> },
      { path: "theming", element: <ThemingPage /> },
      { path: "integration", element: <IntegrationPage /> },
      { path: "browser-support", element: <BrowserSupportPage /> },
      { path: "rn-primitives", element: <RnPrimitivesPage /> },
      { path: "components", element: <ComponentsIndex /> },
      { path: "components/:slug", element: <ComponentPage /> },
      { path: "templates/:slug", element: <TemplatePage /> },
      { path: "patterns/:slug", element: <PatternPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
