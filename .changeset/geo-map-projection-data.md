---
"@nannier/canvas": patch
---

Groundwork for the GeoMap chart: the renderer-free Natural Earth I forward
projection (`projectNaturalEarth`, `NATURAL_EARTH_ASPECT`, `naturalEarthHeight`)
plus the pre-projected world land silhouette it generates, with unit tests.

Patch, not minor: nothing is exported from the charts barrel yet, so the
package's public API is unchanged. The component that consumes this lands next.

The land data is computed at BUILD time by `bun run geomap:gen`, which reads the
Natural Earth 1:110m land topology (public domain data, ISC packaging via the
`world-atlas` devDependency) and projects it through the very same projection
module the chart will place its bubbles with, so the coastlines and the data
points cannot drift out of register. The kit therefore ships map geometry with
no runtime dependency, no network fetch, and no parsing at import: one 5.7KB
gzip string constant.
