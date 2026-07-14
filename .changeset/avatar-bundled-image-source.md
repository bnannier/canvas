---
"@bnannier/canvas": patch
---

Avatar and MediaObject now accept a bundled image for `src` (a `require(...)` /
`import` module, i.e. a number), not only a remote URI string, so local images display
on iOS and Android as well as the web. Avatar also falls back to its initials when the
image fails to load, instead of showing a blank circle.
