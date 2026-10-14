---
"@nannier/canvas": patch
---

On iOS and Android a control's glass now stays behind its own content and in front of what lies before it. Under glass a control that paints its surface through a GlassPane clears its own fill and border, and where nothing else made it a native view (a Badge, a Kbd, a chart frame, the wrapper beside a text field), the native renderer removed it and handed its pane to the nearest ancestor view, where the pane's order behind its host's content sorted it beneath everything earlier there: a frost could draw under the text or the surface it sat on. Every pane host is now a stacking context of its own under glass (`isolation: "isolate"`, which paints nothing and keeps the host a native view, as a glass surface's own host already was), through `paneStyle` and, for a wrapper that holds a pane without it, the kit's internal `paneHost`. Solid mode is unchanged. An app that composes the deprecated `paneStyle` gets the same isolation under glass.
