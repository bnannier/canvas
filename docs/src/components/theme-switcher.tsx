import { useState, useCallback } from "react";
import {
  getTheme,
  setTheme,
  getSurface,
  setSurface,
  getDensity,
  setDensity,
  type Theme,
  type Surface,
  type Density,
} from "../../../src/theme";

export function ThemeSwitcher() {
  const [theme, setThemeState] = useState<Theme>(getTheme);
  const [surface, setSurfaceState] = useState<Surface>(getSurface);
  const [density, setDensityState] = useState<Density>(getDensity);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }, [theme]);

  const toggleSurface = useCallback(() => {
    const next: Surface = surface === "glass" ? "default" : "glass";
    setSurface(next);
    setSurfaceState(next);
  }, [surface]);

  const cycleDensity = useCallback(() => {
    const order: Density[] = ["regular", "compact", "comfy"];
    const idx = order.indexOf(density);
    const next = order[(idx + 1) % order.length];
    setDensity(next);
    setDensityState(next);
  }, [density]);

  return (
    <div style={{ display: "flex", gap: "0.25rem" }}>
      <button
        className={`btn btn-ghost btn-sm${theme === "dark" ? " btn-default" : ""}`}
        onClick={toggleTheme}
        title="Toggle dark mode"
      >
        {theme === "dark" ? "Dark" : "Light"}
      </button>
      <button
        className={`btn btn-ghost btn-sm${surface === "glass" ? " btn-default" : ""}`}
        onClick={toggleSurface}
        title="Toggle glass surface"
      >
        Glass
      </button>
      <button
        className="btn btn-ghost btn-sm"
        onClick={cycleDensity}
        title="Cycle density"
      >
        {density.charAt(0).toUpperCase() + density.slice(1)}
      </button>
    </div>
  );
}
