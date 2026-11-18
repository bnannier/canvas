import { createContext, useContext, type ReactNode } from "react";

// Internal material role for independently floating navigation controls. Scope it
// to a single pane, not its surrounding toolbar or descendants' popup surfaces.
// Native hosts keep their platform material; the browser host reads this role to
// give mobile navigation controls their own optical treatment.
const NavigationGlassContext = createContext(false);

export function NavigationGlassProvider({ children }: { children: ReactNode }) {
  return <NavigationGlassContext.Provider value>{children}</NavigationGlassContext.Provider>;
}

export function useNavigationGlass(): boolean {
  return useContext(NavigationGlassContext);
}
