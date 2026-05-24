import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Shell } from "./layout/shell";
import { Home } from "./pages/home";
import { ComponentPage } from "./pages/component-page";
import { TokensPage } from "./pages/tokens";
import { ThemingPage } from "./pages/theming";
import { MigrationPage } from "./pages/migration";
import { IntegrationPage } from "./pages/integration";
import { BrowserSupportPage } from "./pages/browser-support";
import { NotFound } from "./pages/not-found";

const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { index: true, element: <Home /> },
      { path: "tokens", element: <TokensPage /> },
      { path: "theming", element: <ThemingPage /> },
      { path: "migration", element: <MigrationPage /> },
      { path: "integration", element: <IntegrationPage /> },
      { path: "browser-support", element: <BrowserSupportPage /> },
      { path: "components/:slug", element: <ComponentPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
