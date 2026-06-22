---
"@olympusoss/canvas": minor
---

Add five more core components, closing the remaining catalog gaps:

- **`NumberInput`** — the iOS UIStepper / web number-field idiom: a numeric value with − and + controls plus direct entry. `value`/`onChange`, `min`/`max`/`step`, `small`/`large`, `disabled`. Clamps to bounds and disables the control at each bound; `accessibilityRole="adjustable"` with `aria-valuemin/max/now` for screen readers. iOS segmented pill, Material 3 outlined icon buttons, web bordered group.
- **`InputOTP`** — a segmented one-time-code field driven by one underlying `TextInput`, so SMS autofill (`one-time-code`) and paste work. `length`, `value`/`onChange`, `onComplete`, `masked`, `disabled`, `small`/`large`. iOS rounded separated cells, Material 3 outlined cells, web shadcn-style connected group; the active cell is ring-highlighted.
- **`Collapsible`** — a single disclosure (one header toggling one panel; an Accordion is a group of these). `title`/`trigger`, `open`/`onOpenChange` or `defaultOpen`, `disabled`. The header exposes `aria-expanded` (the cross-platform alias that survives react-native-web); rotating chevron, `LayoutAnimation` reveal natively.
- **`Carousel`** — a horizontally paged slide viewer (`FlatList` snap paging) with dot indicators and optional prev/next arrows. `items`, `index`/`onIndexChange` or `defaultIndex`, `loop`, `showArrows`, `showDots`. Dots and arrows carry full button a11y (`aria-selected`, labelled). Renders the current slide as a fallback so it is never blank before the viewport measures, and fills its container (with a sensible minimum width).
- **`Toast`** — a transient notification capsule rendered directly, plus an imperative runtime: mount `<ToastProvider>` and call `toast(...)` from `useToast()` to enqueue auto-dismissing toasts that stack over the app through the kit Portal. Intents `success`/`destructive`/`info` (+ neutral), optional `description`, `action`, and dismiss. The capsule is a functional-layer overlay routed through `GlassSurface`; iOS banner, Material 3 snackbar, web sonner-style card.

All are documented with live examples and the iOS/Android/Web 3-up comparison, and covered by behavior tests (including the imperative ToastProvider/useToast lifecycle).
