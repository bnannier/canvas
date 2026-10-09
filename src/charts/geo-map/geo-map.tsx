import { createGeoMap } from "./geo-map.shared.js";
import { webSkin } from "../shared/charts.styles.js";

// GeoMap is a "Shared" platform treatment: the implementation is platform-
// neutral, so every platform entry builds from the same skin. The per-OS
// files exist only so the architecture is uniform across the kit.
/** A world map with a bubble per place, sized by its count, optionally zoomable. */
export const GeoMap = createGeoMap(webSkin);
export type { GeoMapProps, GeoMapPoint } from "./geo-map.shared.js";
