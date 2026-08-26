---
"@nannier/canvas": minor
---

New GeoMap chart: a token-themed world map with area-encoded coordinate bubbles,
press to inspect, and a build-time precomputed land silhouette (no runtime fetch,
no runtime dependencies).

Minor justification: this adds a new public component to `@nannier/canvas`
(`GeoMap`, with the `GeoMapPoint` and `GeoMapProps` types), which is a new
user-visible capability rather than a fix to an existing one. Nothing that
already shipped changes shape.

The land is one muted path in the Natural Earth I projection, baked at build time
by `bun run geomap:gen` and drawn in the generated viewBox's own units, so the
coastlines, the bubble centers, and the bubble radii share one coordinate space
and every size follows the rendered width. Each point's AREA carries its count
(radius proportional to the square root of the share, with a floor that keeps a
tiny count visible), circles take the primary token over a surface-colored ring so
overlapping bubbles stay readable, and every colour comes from `useTheme()`, so
light and dark work with no per-scheme code. Pure react-native-svg: no DOM and no
`Platform.OS` branch.

Single-identity encoding, so there is no tone axis and no legend; density
(`compact`) is the only style axis. The map holds the projection's aspect ratio
from its own measured width, never the window. Pressing a bubble sets the
controlled selection, flags the label and formatted count through the shared chart
value flag, and announces it; the plot's accessible name folds in the title, the
place count, the biggest places with their values, and a "+N more" tail, because a
screen reader user cannot see bubbles.
