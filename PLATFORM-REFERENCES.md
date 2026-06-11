# Platform reference catalog

The canonical design reference for every Canvas component on **iOS (Apple Human Interface
Guidelines)**, **Android (Material 3 / Jetpack Compose)**, and **Web**. This is the source
each platform skin is matched against.

Canvas is **platform-forward**: the brand survives (the indigo `primary` and the type stay
the same on every platform); only the native shape, sizing, structure, and interaction
feedback change per OS. React Native does not provide these looks for free (its primitives
are unstyled and its core `<Button>` is unusable), so each control's per-OS appearance is
hand-written, EXCEPT the few real native widgets RN ships (`Switch`, `ActivityIndicator`),
which are used natively and branded via props.

**Treatment** column:

- **Full** — distinct iOS / Android / Web skins, matched to the references below.
- **Light** — one structure, small per-platform touches (radius, density, type, shadow).
- **Shared** — platform-neutral; no native variant to match, one look everywhere.

A cell marked `(none)` means that platform has no native equivalent for the control (an
informative signal: e.g. iOS has no checkbox/radio/stepper, Material 3 has no stepper or
pagination). The Full-row links are verified; some structural/neutral links are best-effort
(Tailwind UI pattern pages may require sign-in).

| Component | Treatment | iOS (HIG) | Android (Material 3) | Web |
|---|---|---|---|---|
| button | Full | [button (iOS)](https://developer.apple.com/design/human-interface-guidelines/buttons) | [button (Android)](https://developer.android.com/develop/ui/compose/components/button) | [button (Web)](https://catalyst.tailwindui.com/docs/button) |
| button-group | Full | [button-group (iOS)](https://developer.apple.com/design/human-interface-guidelines/segmented-controls) | [button-group (Android)](https://developer.android.com/develop/ui/compose/components/segmented-button) | [button-group (Web)](https://ui.shadcn.com/docs/components/toggle-group) |
| checkbox | Full | [checkbox (iOS)](https://developer.apple.com/design/human-interface-guidelines/toggles) | [checkbox (Android)](https://developer.android.com/develop/ui/compose/components/checkbox) | [checkbox (Web)](https://catalyst.tailwindui.com/docs/checkbox) |
| radio | Full | [radio (iOS)](https://developer.apple.com/design/human-interface-guidelines/pickers) | [radio (Android)](https://developer.android.com/develop/ui/compose/components/radio-button) | [radio (Web)](https://catalyst.tailwindui.com/docs/radio) |
| switch | Full | [switch (iOS)](https://developer.apple.com/design/human-interface-guidelines/toggles) | [switch (Android)](https://developer.android.com/develop/ui/compose/components/switch) | [switch (Web)](https://catalyst.tailwindui.com/docs/switch) |
| input | Full | [input (iOS)](https://developer.apple.com/design/human-interface-guidelines/text-fields) | [input (Android)](https://developer.android.com/develop/ui/compose/text/user-input) | [input (Web)](https://catalyst.tailwindui.com/docs/input) |
| textarea | Full | [textarea (iOS)](https://developer.apple.com/design/human-interface-guidelines/text-views) | [textarea (Android)](https://developer.android.com/develop/ui/compose/text/user-input) | [textarea (Web)](https://catalyst.tailwindui.com/docs/textarea) |
| select | Full | [select (iOS)](https://developer.apple.com/design/human-interface-guidelines/pickers) | [select (Android)](https://developer.android.com/develop/ui/compose/components/menu) | [select (Web)](https://catalyst.tailwindui.com/docs/select) |
| combobox | Full | [combobox (iOS)](https://developer.apple.com/design/human-interface-guidelines/combo-boxes) | [combobox (Android)](https://developer.android.com/develop/ui/compose/components/menu) | [combobox (Web)](https://catalyst.tailwindui.com/docs/combobox) |
| tabs | Full | [tabs (iOS)](https://developer.apple.com/design/human-interface-guidelines/tab-bars) | [tabs (Android)](https://developer.android.com/develop/ui/compose/components/tabs) | [tabs (Web)](https://headlessui.com/react/tabs) |
| dialog | Full | [dialog (iOS)](https://developer.apple.com/design/human-interface-guidelines/sheets) | [dialog (Android)](https://developer.android.com/develop/ui/compose/components/dialog) | [dialog (Web)](https://catalyst.tailwindui.com/docs/dialog) |
| alert-dialog | Full | [alert-dialog (iOS)](https://developer.apple.com/design/human-interface-guidelines/alerts) | [alert-dialog (Android)](https://developer.android.com/develop/ui/compose/components/dialog) | [alert-dialog (Web)](https://ui.shadcn.com/docs/components/alert-dialog) |
| dropdown | Full | [dropdown (iOS)](https://developer.apple.com/design/human-interface-guidelines/menus) | [dropdown (Android)](https://developer.android.com/develop/ui/compose/components/menu) | [dropdown (Web)](https://catalyst.tailwindui.com/docs/dropdown) |
| row-menu | Full | [row-menu (iOS)](https://developer.apple.com/design/human-interface-guidelines/context-menus) | [row-menu (Android)](https://developer.android.com/develop/ui/compose/components/menu) | [row-menu (Web)](https://www.radix-ui.com/primitives/docs/components/context-menu) |
| popover | Full | [popover (iOS)](https://developer.apple.com/design/human-interface-guidelines/popovers) | (none) | [popover (Web)](https://ui.shadcn.com/docs/components/popover) |
| tooltip | Full | (none) | [tooltip (Android)](https://developer.android.com/develop/ui/compose/components/tooltip) | [tooltip (Web)](https://www.radix-ui.com/primitives/docs/components/tooltip) |
| overlays | Full | [overlays (iOS)](https://developer.apple.com/design/human-interface-guidelines/sheets) | [overlays (Android)](https://developer.android.com/develop/ui/compose/components/bottom-sheets) | [overlays (Web)](https://ui.shadcn.com/docs/components/sheet) |
| spinner | Full | [spinner (iOS)](https://developer.apple.com/design/human-interface-guidelines/progress-indicators) | [spinner (Android)](https://developer.android.com/develop/ui/compose/components/progress) | [spinner (Web)](https://www.radix-ui.com/primitives/docs/components/progress) |
| pagination | Full | [pagination (iOS)](https://developer.apple.com/design/human-interface-guidelines/page-controls) | (none) | [pagination (Web)](https://catalyst.tailwindui.com/docs/pagination) |
| stepper | Full | (none) | (none) | [stepper (Web)](https://tailwindui.com/components/application-ui/navigation/steps) |
| navbars | Full | [navbars (iOS)](https://developer.apple.com/design/human-interface-guidelines/navigation-bars) | [navbars (Android)](https://developer.android.com/develop/ui/compose/components/app-bars) | [navbars (Web)](https://catalyst.tailwindui.com/docs/navbar) |
| sidebar | Full | [sidebar (iOS)](https://developer.apple.com/design/human-interface-guidelines/sidebars) | [sidebar (Android)](https://developer.android.com/develop/ui/compose/components/drawer) | [sidebar (Web)](https://catalyst.tailwindui.com/docs/sidebar) |
| calendar | Full | [calendar (iOS)](https://developer.apple.com/design/human-interface-guidelines/pickers) | [calendar (Android)](https://developer.android.com/develop/ui/compose/components/datepickers) | [calendar (Web)](https://ui.shadcn.com/docs/components/calendar) |
| card | Light | (none) | [card (Android)](https://developer.android.com/develop/ui/compose/components/card) | [card (Web)](https://ui.shadcn.com/docs/components/card) |
| badge | Light | [badge (iOS)](https://developer.apple.com/design/human-interface-guidelines/notifications) | [badge (Android)](https://developer.android.com/develop/ui/compose/components/badges) | [badge (Web)](https://catalyst.tailwindui.com/docs/badge) |
| avatar | Light | (none) | (none) | [avatar (Web)](https://catalyst.tailwindui.com/docs/avatar) |
| breadcrumb | Light | [breadcrumb (iOS)](https://developer.apple.com/design/human-interface-guidelines/path-controls) | (none) | [breadcrumb (Web)](https://ui.shadcn.com/docs/components/breadcrumb) |
| alert | Light | [alert (iOS)](https://developer.apple.com/design/human-interface-guidelines/alerts) | [alert (Android)](https://developer.android.com/develop/ui/compose/components/dialog) | [alert (Web)](https://catalyst.tailwindui.com/docs/alert) |
| data-table | Light | [data-table (iOS)](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) | [data-table (Android)](https://m3.material.io/components/data-tables/overview) | [data-table (Web)](https://ui.shadcn.com/docs/components/data-table) |
| command | Light | [command (iOS)](https://developer.apple.com/design/human-interface-guidelines/search-fields) | [command (Android)](https://developer.android.com/develop/ui/compose/components/search-bar) | [command (Web)](https://ui.shadcn.com/docs/components/command) |
| filter-panel | Light | [filter-panel (iOS)](https://developer.apple.com/design/human-interface-guidelines/sidebars) | [filter-panel (Android)](https://developer.android.com/develop/ui/compose/components/drawer) | [filter-panel (Web)](https://catalyst.tailwindui.com/docs/sidebar) |
| description-lists | Light | [description-lists (iOS)](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) | [description-lists (Android)](https://developer.android.com/develop/ui/compose/lists) | [description-lists (Web)](https://catalyst.tailwindui.com/docs/description-list) |
| stacked-lists | Light | [stacked-lists (iOS)](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) | [stacked-lists (Android)](https://developer.android.com/develop/ui/compose/lists) | [stacked-lists (Web)](https://tailwindui.com/components/application-ui/lists/stacked-lists) |
| grid-lists | Light | [grid-lists (iOS)](https://developer.apple.com/design/human-interface-guidelines/collections) | [grid-lists (Android)](https://developer.android.com/develop/ui/compose/lists) | [grid-lists (Web)](https://tailwindui.com/components/application-ui/lists/grid-lists) |
| feeds | Light | [feeds (iOS)](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) | [feeds (Android)](https://developer.android.com/develop/ui/compose/lists) | [feeds (Web)](https://tailwindui.com/components/application-ui/lists/feeds) |
| media-objects | Light | (none) | [media-objects (Android)](https://developer.android.com/develop/ui/compose/lists) | [media-objects (Web)](https://tailwindui.com/components/application-ui/lists/media-objects) |
| field | Light | [field (iOS)](https://developer.apple.com/design/human-interface-guidelines/text-fields) | [field (Android)](https://developer.android.com/develop/ui/compose/text/user-input) | [field (Web)](https://catalyst.tailwindui.com/docs/fieldset) |
| fieldset | Light | (none) | (none) | [fieldset (Web)](https://catalyst.tailwindui.com/docs/fieldset) |
| form | Light | (none) | (none) | [form (Web)](https://ui.shadcn.com/docs/components/form) |
| empty-state | Light | (none) | (none) | [empty-state (Web)](https://tailwindui.com/components/application-ui/feedback/empty-states) |
| action-panels | Light | (none) | (none) | [action-panels (Web)](https://tailwindui.com/components/application-ui/forms/action-panels) |
| stats | Light | (none) | (none) | [stats (Web)](https://tailwindui.com/components/application-ui/data-display/stats) |
| divider | Shared | (none) | [divider (Android)](https://developer.android.com/develop/ui/compose/components/divider) | [divider (Web)](https://catalyst.tailwindui.com/docs/divider) |
| icon | Shared | [icon (iOS)](https://developer.apple.com/design/human-interface-guidelines/sf-symbols) | [icon (Android)](https://developer.android.com/develop/ui/compose/graphics/images/material) | [icon (Web)](https://www.radix-ui.com/icons) |
| typography | Shared | [typography (iOS)](https://developer.apple.com/design/human-interface-guidelines/typography) | [typography (Android)](https://m3.material.io/styles/typography/overview) | [typography (Web)](https://catalyst.tailwindui.com/docs/heading) |
| listbox | Shared | [listbox (iOS)](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) | [listbox (Android)](https://developer.android.com/develop/ui/compose/lists) | [listbox (Web)](https://catalyst.tailwindui.com/docs/listbox) |
| skeleton | Shared | (none) | (none) | [skeleton (Web)](https://ui.shadcn.com/docs/components/skeleton) |
| kbd | Shared | (none) | (none) | [kbd (Web)](https://ui.shadcn.com/docs/components/kbd) |
| charts | Shared | (none) | (none) | [charts (Web)](https://ui.shadcn.com/docs/components/chart) |
| code-block | Shared | (none) | (none) | (none) |
