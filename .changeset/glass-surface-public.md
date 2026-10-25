---
"@nannier/canvas": minor
---

GlassSurface is public again, with its `GlassSurfaceProps` and `GlassLayer` types: the glass host every kit surface renders through, for an app's own frame. 3.11.0 removed it on the word that nothing consumed it, but Argus frames its whole app shell with `<GlassSurface frosted>`, and its `frosted` material exists for exactly that frame, so every signed-in Argus screen failed to render ("Element type is invalid ... Check the render method of `AppShell`"). Design-language item 7 keeps shells out of the kit and Canvas never hand-paints glass, so an app frame has no other way to take the material. The integration page documents it under App frames, and the docs' own frame imports it from the package.

Minor justification: a public component returns to the entry (`GlassSurface`, with `GlassSurfaceProps` and `GlassLayer`), restoring the frosted app frame for consumers on 3.11.x. Existing components are unchanged.
