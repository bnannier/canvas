# Platform reference catalog

The canonical design reference for every Canvas component on **iOS**, **Android (Material 3 /
Jetpack Compose)**, and **Web**. This is the source each platform skin is matched against.

**iOS source of truth: the [Apple iOS 27 UI Kit](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols)**
(Apple's official design resource, published as a Sketch library). Each iOS link below opens that
kit's symbol group, with pixel-accurate Light and Dark renders of the real control. Apple HIG text
pages are kept only where the kit has no symbol for the control. Note for tooling: the kit renders
in a browser session (its images are signed and cannot be hotlinked or WebFetched), so agents that
need the iOS spec must screenshot the group in a browser, or read the extracted spec notes.

**Android source of truth: the [Material 3 components catalog](https://m3.material.io/components)**
(m3.material.io). Each Android link below opens that catalog's component overview page, including
the M3 Expressive updates: connected button groups replace segmented buttons, the loading
indicator replaces the indeterminate circular progress indicator, and docked toolbars replace the
bottom app bar. The Jetpack Compose API docs (developer.android.com) remain the implementation
reference, not the design reference. Note for tooling: m3.material.io is a JS app whose pages
cannot be WebFetched; read them in a browser session, and verify URLs against
https://m3.material.io/sitemap.xml.

Canvas is **platform-forward**: the brand survives (the indigo `primary` and the type stay the
same on every platform); only the native shape, sizing, structure, and interaction feedback change
per OS. React Native does not provide these looks for free (its primitives are unstyled and its
core `<Button>` is unusable), so each control's per-OS appearance is hand-written, EXCEPT the few
real native widgets RN ships (`Switch`, `ActivityIndicator`), which can be used natively and
branded via props.

**Treatment** column:

- **Full** — distinct iOS / Android / Web skins, matched to the references below.
- **Light** — one structure, small per-platform touches (radius, density, type, shadow).
- **Shared** — platform-neutral; no native variant to match, one look everywhere.
- **Missing** — in the iOS 27 kit but not yet a Canvas component (build backlog).
- **System** — OS chrome or assets in the kit (status bars, wallpapers, FaceID...); not a UI-kit
  component, listed for completeness only.

A cell marked `(none)` means that platform has no native equivalent for the control (an
informative signal: e.g. iOS has no checkbox/radio/wizard-stepper, Material 3 has no stepper or
pagination). The kit's "Stepper" is the iOS +/- increment control, NOT the multi-step wizard
(Canvas `stepper`); they are separate rows.

| Component | Treatment | iOS (iOS 27 UI Kit / HIG) | Android (Material 3) | Web |
|---|---|---|---|---|
| button | Full | [button (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Buttons) | [button (Android)](https://m3.material.io/components/buttons/overview) | [button (Web)](https://catalyst.tailwindui.com/docs/button) |
| button-group | Full | [button-group (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Segmented%2520Controls) | [button-group (Android)](https://m3.material.io/components/button-groups/overview) (connected button groups replace segmented buttons) | [button-group (Web)](https://ui.shadcn.com/docs/components/toggle-group) |
| checkbox | Full | [checkbox (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Toggles) (no iOS checkbox; toggle is the idiom) | [checkbox (Android)](https://m3.material.io/components/checkbox/overview) | [checkbox (Web)](https://catalyst.tailwindui.com/docs/checkbox) |
| radio | Full | [radio (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Lists) (no iOS radio; list checkmark idiom) | [radio (Android)](https://m3.material.io/components/radio-button/overview) | [radio (Web)](https://catalyst.tailwindui.com/docs/radio) |
| switch | Full | [switch (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Toggles) | [switch (Android)](https://m3.material.io/components/switch/overview) | [switch (Web)](https://catalyst.tailwindui.com/docs/switch) |
| input | Full | [input (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Text%2520Fields) | [input (Android)](https://m3.material.io/components/text-fields/overview) | [input (Web)](https://catalyst.tailwindui.com/docs/input) |
| textarea | Full | [textarea (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Text%2520Fields) | [textarea (Android)](https://m3.material.io/components/text-fields/overview) | [textarea (Web)](https://catalyst.tailwindui.com/docs/textarea) |
| select | Full | [select (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Menus) | [select (Android)](https://m3.material.io/components/menus/overview) | [select (Web)](https://catalyst.tailwindui.com/docs/select) |
| combobox | Full | [combobox (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Menus) (text field + menu; kit has no combo) | [combobox (Android)](https://m3.material.io/components/menus/overview) | [combobox (Web)](https://catalyst.tailwindui.com/docs/combobox) |
| tabs | Full | [tabs (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Segmented%2520Controls) (in-page tabs = segmented) | [tabs (Android)](https://m3.material.io/components/tabs/overview) | [tabs (Web)](https://headlessui.com/react/tabs) |
| dialog | Full | [dialog (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Alerts) | [dialog (Android)](https://m3.material.io/components/dialogs/overview) | [dialog (Web)](https://catalyst.tailwindui.com/docs/dialog) |
| alert-dialog | Full | [alert-dialog (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Alerts) | [alert-dialog (Android)](https://m3.material.io/components/dialogs/overview) | [alert-dialog (Web)](https://ui.shadcn.com/docs/components/alert-dialog) |
| dropdown | Full | [dropdown (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Menus) | [dropdown (Android)](https://m3.material.io/components/menus/overview) | [dropdown (Web)](https://catalyst.tailwindui.com/docs/dropdown) |
| row-menu | Full | [row-menu (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Menus) | [row-menu (Android)](https://m3.material.io/components/menus/overview) | [row-menu (Web)](https://www.radix-ui.com/primitives/docs/components/context-menu) |
| popover | Full | [popover (iOS 27)](<https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Popovers%2520(iPad%2520Only)>) | [popover (Android)](https://m3.material.io/components/tooltips/overview) (closest: rich tooltip; no M3 popover) | [popover (Web)](https://ui.shadcn.com/docs/components/popover) |
| tooltip | Full | (none) | [tooltip (Android)](https://m3.material.io/components/tooltips/overview) | [tooltip (Web)](https://www.radix-ui.com/primitives/docs/components/tooltip) |
| overlays | Full | [overlays (iOS 27)](<https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sheets%2520(iPhone)>) | [overlays (Android)](https://m3.material.io/components/bottom-sheets/overview) (side sheets for edge drawers) | [overlays (Web)](https://ui.shadcn.com/docs/components/sheet) |
| spinner | Full | [spinner (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Progress%2520Indicators) | [spinner (Android)](https://m3.material.io/components/loading-indicator/overview) (replaces the indeterminate circular progress indicator) | [spinner (Web)](https://www.radix-ui.com/primitives/docs/components/progress) |
| pagination | Full | [pagination (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Page%2520Control) | (none) | [pagination (Web)](https://catalyst.tailwindui.com/docs/pagination) |
| stepper | Full | (none — the kit "Stepper" is the +/- control, see stepper-control) | (none — Material 3 removed steppers) | [stepper (Web)](https://tailwindui.com/components/application-ui/navigation/steps) |
| navbars | Full | [navbars (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Toolbars) (iOS 26+ nav bars are toolbars) | [navbars (Android)](https://m3.material.io/components/app-bars/overview) | [navbars (Web)](https://catalyst.tailwindui.com/docs/navbar) |
| sidebar | Full | [sidebar (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sidebar) | [sidebar (Android)](https://m3.material.io/components/navigation-drawer/overview) | [sidebar (Web)](https://catalyst.tailwindui.com/docs/sidebar) |
| calendar | Full | [calendar (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Date%2520and%2520Time%2520Pickers) | [calendar (Android)](https://m3.material.io/components/date-pickers/overview) | [calendar (Web)](https://ui.shadcn.com/docs/components/calendar) |
| card | Light | (none) | [card (Android)](https://m3.material.io/components/cards/overview) | [card (Web)](https://ui.shadcn.com/docs/components/card) |
| badge | Light | [badge (iOS)](https://developer.apple.com/design/human-interface-guidelines/notifications) (no kit symbol) | [badge (Android)](https://m3.material.io/components/badges/overview) | [badge (Web)](https://catalyst.tailwindui.com/docs/badge) |
| avatar | Light | (none) | (none) | [avatar (Web)](https://catalyst.tailwindui.com/docs/avatar) |
| breadcrumb | Light | [breadcrumb (iOS)](https://developer.apple.com/design/human-interface-guidelines/path-controls) (no kit symbol) | (none) | [breadcrumb (Web)](https://ui.shadcn.com/docs/components/breadcrumb) |
| alert | Light | [alert (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Alerts) | [alert (Android)](https://m3.material.io/components/snackbar/overview) (closest: snackbar; no M3 inline banner) | [alert (Web)](https://catalyst.tailwindui.com/docs/alert) |
| data-table | Light | [data-table (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Lists) | [data-table (Android)](https://m3.material.io/components/lists/overview) (closest: lists; no M3 data table) | [data-table (Web)](https://ui.shadcn.com/docs/components/data-table) |
| command | Light | [command (iOS)](https://developer.apple.com/design/human-interface-guidelines/search-fields) (no kit symbol) | [command (Android)](https://m3.material.io/components/search/overview) | [command (Web)](https://ui.shadcn.com/docs/components/command) |
| filter-panel | Light | [filter-panel (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sidebar) | [filter-panel (Android)](https://m3.material.io/components/side-sheets/overview) | [filter-panel (Web)](https://catalyst.tailwindui.com/docs/sidebar) |
| description-lists | Light | [description-lists (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Lists) | [description-lists (Android)](https://m3.material.io/components/lists/overview) | [description-lists (Web)](https://catalyst.tailwindui.com/docs/description-list) |
| stacked-lists | Light | [stacked-lists (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Lists) | [stacked-lists (Android)](https://m3.material.io/components/lists/overview) | [stacked-lists (Web)](https://tailwindui.com/components/application-ui/lists/stacked-lists) |
| grid-lists | Light | [grid-lists (iOS)](https://developer.apple.com/design/human-interface-guidelines/collections) (no kit symbol) | [grid-lists (Android)](https://m3.material.io/components/lists/overview) (closest: lists; no M3 grid list) | [grid-lists (Web)](https://tailwindui.com/components/application-ui/lists/grid-lists) |
| feeds | Light | [feeds (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Lists) | [feeds (Android)](https://m3.material.io/components/lists/overview) | [feeds (Web)](https://tailwindui.com/components/application-ui/lists/feeds) |
| media-objects | Light | [media-objects (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Lists) | [media-objects (Android)](https://m3.material.io/components/lists/overview) | [media-objects (Web)](https://tailwindui.com/components/application-ui/lists/media-objects) |
| field | Light | [field (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Text%2520Fields) | [field (Android)](https://m3.material.io/components/text-fields/overview) | [field (Web)](https://catalyst.tailwindui.com/docs/fieldset) |
| fieldset | Light | (none) | (none) | [fieldset (Web)](https://catalyst.tailwindui.com/docs/fieldset) |
| form | Light | (none) | (none) | [form (Web)](https://ui.shadcn.com/docs/components/form) |
| empty-state | Light | (none) | (none) | [empty-state (Web)](https://tailwindui.com/components/application-ui/feedback/empty-states) |
| action-panels | Light | (none) | (none) | [action-panels (Web)](https://tailwindui.com/components/application-ui/forms/action-panels) |
| stats | Light | (none) | (none) | [stats (Web)](https://tailwindui.com/components/application-ui/data-display/stats) |
| divider | Shared | (none) | [divider (Android)](https://m3.material.io/components/divider/overview) | [divider (Web)](https://catalyst.tailwindui.com/docs/divider) |
| icon | Shared | [icon (iOS)](https://developer.apple.com/design/human-interface-guidelines/sf-symbols) (SF Symbols) | [icon (Android)](https://m3.material.io/styles/icons/overview) | [icon (Web)](https://www.radix-ui.com/icons) |
| typography | Shared | [typography (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/text-styles) (kit text styles) | [typography (Android)](https://m3.material.io/styles/typography/overview) | [typography (Web)](https://catalyst.tailwindui.com/docs/heading) |
| listbox | Shared | [listbox (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Lists) | [listbox (Android)](https://m3.material.io/components/lists/overview) | [listbox (Web)](https://catalyst.tailwindui.com/docs/listbox) |
| skeleton | Shared | (none) | (none) | [skeleton (Web)](https://ui.shadcn.com/docs/components/skeleton) |
| kbd | Shared | (none) | (none) | [kbd (Web)](https://ui.shadcn.com/docs/components/kbd) |
| charts | Shared | (none) | (none) | [charts (Web)](https://ui.shadcn.com/docs/components/chart) |
| code-block | Shared | (none) | (none) | (none) |
| slider | Missing | [slider (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sliders) | [slider (Android)](https://m3.material.io/components/sliders/overview) | [slider (Web)](https://ui.shadcn.com/docs/components/slider) |
| action-sheet | Missing | [action-sheet (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Action%2520Sheets) | [action-sheet (Android)](https://m3.material.io/components/bottom-sheets/overview) (closest: modal bottom sheet) | [action-sheet (Web)](https://ui.shadcn.com/docs/components/drawer) |
| stepper-control (+/-) | Missing | [stepper-control (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Stepper) | (none — no Material 3 stepper; quantity pickers are custom) | [stepper-control (Web)](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number) |
| tab-bar (bottom app nav) | Missing | [tab-bar (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Tab%2520Bars) | [tab-bar (Android)](https://m3.material.io/components/navigation-bar/overview) | (none — app-level pattern) |
| activity-view (share sheet) | Missing | [activity-view (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Activity%2520View) | [activity-view (Android)](https://developer.android.com/training/sharing/send) (sharesheet) | [activity-view (Web)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) |
| color-picker | Missing | [color-picker (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Color%2520Pickers) | (none — no Material 3 color picker) | [color-picker (Web)](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color) |
| edit-menu | Missing | [edit-menu (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Edit%2520Menu) | [edit-menu (Android)](https://developer.android.com/develop/ui/compose/text/user-interactions) (text-selection toolbar) | (none — custom; closest [context-menu](https://www.radix-ui.com/primitives/docs/components/context-menu)) |
| menu-bar | Missing | [menu-bar (iOS 27)](<https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Menu%2520Bar%2520(iPad)>) (iPad) | (none) | [menu-bar (Web)](https://www.radix-ui.com/primitives/docs/components/menubar) |
| app-icons | System | [app-icons (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=App%2520Icons) | [app-icons (Android)](https://developer.android.com/distribute/google-play/resources/icon-design-specifications) | [app-icons (Web)](https://developer.mozilla.org/en-US/docs/Glossary/Favicon) (favicon) |
| face-id | System | [face-id (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=FaceID) | [face-id (Android)](https://developer.android.com/identity/sign-in/biometric-auth) (biometric prompt) | [face-id (Web)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API) (WebAuthn) |
| home-indicators | System | [home-indicators (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Home%2520Indicators) | (none — gesture navigation) | (none) |
| keyboard | System | [keyboard (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Keyboard) | (none — IME) | (none) |
| status-bars | System | [status-bars (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Status%2520Bars) | (none) | (none) |
| scroll-edge-effect | System | [scroll-edge-effect (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Scroll%2520Edge%2520Effect) | (none — overscroll effect) | (none) |
| sheets (iPad/macOS) | System | [sheets (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sheets) (large-screen variant of overlays) | (none) | (none) |
| windows | System | [windows (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Windows) | (none) | (none) |
| wallpapers | System | [wallpapers (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Wallpapers) | (none) | (none) |
| system-elements | System | [system (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=System) | (none) | (none) |
| examples | System | [examples (iOS 27)](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Examples) (full-screen example layouts) | (none) | (none) |
