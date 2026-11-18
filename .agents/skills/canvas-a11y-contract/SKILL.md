---
name: canvas-a11y-contract
description: The accessibility, keyboard, and focus contract every interactive Canvas component must satisfy on web AND native: dual accessibilityState/aria-* aliases, web keyboard operability, dialog focus trapping, and data-carrying accessible names. Use when building or reviewing any toggle, expandable, slider, listbox, overlay, dialog, or chart, or when a11y-state.test.tsx fails.
---

# Canvas accessibility contract

react-native-web forwards NEITHER `accessibilityState` NOR `accessibilityValue`
to the DOM (verified empirically, see the header of `test/a11y-state.test.tsx`).
So on native the RN a11y props work, but on web a screen reader hears nothing
about checked/selected/expanded/value UNLESS the component ALSO carries the
matching `aria-*` alias. Every interactive component ships BOTH. This skill is
the checklist; the lock is `test/a11y-state.test.tsx` (`bun test` it).

## (a) Dual a11y: carry the RN prop AND the aria alias

Set the semantic RN prop and its `aria-*` twin side by side on the SAME node.
RN accepts the `aria-*` aliases, and RNW forwards them to the DOM. Retain the
matching React Native accessibility props for the native contract. Real pairs in the kit:

| state | RN prop | aria alias | call site |
|---|---|---|---|
| checked / on | `accessibilityState={{ checked }}` | `aria-checked={checked}` | `src/atoms/switch/switch.shared.tsx` |
| tri-state check | `accessibilityState={{ checked: indeterminate ? "mixed" : checked }}` | `aria-checked={indeterminate ? "mixed" : checked}` | `src/atoms/checkbox/checkbox.shared.tsx` |
| expanded | (role + open state) | `aria-expanded={open}` | `src/atoms/dropdown/dropdown.shared.tsx`, `select.shared.tsx`, `src/atoms/autocomplete/autocomplete.shared.tsx` |
| selected (option/tab) | `accessibilityState={{ selected }}` | `aria-selected={selected}` | `src/atoms/select/select.shared.tsx`, `src/organisms/tabs/tabs.shared.tsx`, `tab-bar.shared.tsx` |
| pressed (toggle chip) | selected state | `aria-pressed={isSelected}` | `src/atoms/chip/chip.shared.tsx` |
| value (slider/progress) | `accessibilityValue={{ min, max, now }}` | `aria-valuemin/valuemax/valuenow` | `src/atoms/slider/slider.shared.tsx`; `progress.shared.tsx` |
| disabled | `accessibilityState={{ disabled }}` | `aria-disabled={disabled}` | `src/atoms/slider/slider.shared.tsx` |
| label | `accessibilityLabel` | `aria-label` | `src/atoms/switch/switch.shared.tsx` |

Multi- vs single-select listbox rows switch the alias key by mode (checked for
multi, selected for single): `src/atoms/listbox/listbox.shared.tsx`. Options
must expose `role="option"` inside a `role="listbox"` and stay clickable (the
test fires a real click on an option and asserts the payload):
`test/a11y-state.test.tsx`. Applies to: any toggle, radio, switch, chip,
tab, disclosure trigger, listbox/select/autocomplete/command option, slider, progress.

## (b) Keyboard operability on the web

A focusable web control needs `onKeyDown`. `View` has no native `onKeyDown`, so
route that handler through a cast. `focusable` and `tabIndex` DO affect native
controls: RN 0.74 and 0.86 map `tabIndex={-1}` to `focusable={false}`, which
removes an Android Pressable's native click handler. Its accessible label can
remain in the tree while TalkBack hover passes through to a control behind it.

Choose tab-stop metadata by runtime, independently of the preview skin.
`useRovingFocus` keeps one browser tab stop but returns
`{ focusable: true, tabIndex: 0 }` for every native row. Autocomplete suggestions
use `Platform.select({ web: -1, default: undefined })` so native Pressable keeps
its default activation without moving editing focus on open. Owners still set
`disabled` for disabled controls. Do not apply this to intentionally inaccessible
backdrops or assume a ScrollView has the same native prop behavior.

Slider is the keyboard reference (`src/atoms/slider/slider.shared.tsx`):

- Tab stop: `focusable={!disabled}` (RNW maps it to `tabIndex` 0/-1; disabled
  drops it OUT of the tab order).
- Keys: `ArrowRight`/`ArrowUp` = +step, `ArrowLeft`/`ArrowDown`
  = -step, `PageUp`/`PageDown` = ±`step*10`, `Home` = min, `End` = max. Every
  result runs through `snap(...)` which clamps to `[min, max]`.
- `event.preventDefault()` on every handled key so Arrow/Page/Home/End don't
  also scroll the page.
- Pass the handler as `const webKeyboardProps = { onKeyDown } as unknown as
  ViewProps`, spread onto the View.
- Mirror it for VoiceOver/switch-control: `accessibilityActions` +
  `onAccessibilityAction` increment/decrement.

Overlay shells use `useEscapeLayer(active, onEscape)` from
`src/style/escape-layer.ts`. Republish `EscapeLayerProvider` inside portaled
content so logical child ownership survives registry teleportation.

Browser Escape uses the shared document listener and consumes matching keyup
and repeat events. Native dismissal uses committed owner ancestry and the
receiving owner's active descendants, independently of preview skin. Wire
`scope.onAccessibilityEscape` to an existing content-containing native View;
anchored cards pass it through `AnchoredOverlay`, which forwards it through the
existing surface host. Retain a callback-bearing plain host with
`collapsable={false}` when necessary. Do not add a layout wrapper or
`accessible={true}` grouping, and do not attach the callback only to RN Modal,
which does not forward arbitrary View events into its native window.

RNW TextInput stops keydown propagation before calling `onKeyPress`. Semantic
Input and Textarea use the internal `useInputEscapeBridge`: call the consumer's
handler first, preserve IME cancellation and local default prevention, then
dispatch Escape through the same ownership path. Specialized raw TextInput
editors must explicitly preserve their local cancellation policy and delegate
unhandled Escape. Test a focused field's actual keydown and matching keyup;
dispatching only on `document` cannot verify this path.

Route native Modal `onRequestClose` and existing hardware-back callbacks through
the same scope. One request dismisses one foremost active owner. A controlled
child refusing closure retains ownership of later requests; do not optimistically
mark it inactive or fall through to its parent. Late requests from an inactive
or unmounted host do nothing. Browser keyup bookkeeping does not apply to iOS
accessibility escape gestures. The gesture cancels Dialog/AlertDialog even when
confirmation is disabled, without confirming. Static inline Popover and
trigger-less Command content do not become dismissal layers.

Native host-event tests exercise callback wiring and state policy. They do not
prove VoiceOver gestures, spoken announcements or native focus restoration;
those require the identified physical-device protocol in
`tools/native/accessibility.md`.

## (c) Dialog focus management

Modal dialogs use `useDialogFocus(open)` (`src/style/use-dialog-focus.ts`,
barrel `src/style/index.ts`). It returns a `panelRef` you attach to the
panel container (a focusable `tabIndex={-1}` View). While `open` it:

- moves focus INTO the panel on open (`panel.focus()`),
- traps Tab / Shift+Tab inside the panel (wraps last->first and first->last over
  `TABBABLE_SELECTOR`, filtering disabled controls, negative tab indices, and
  hidden or inert subtrees),
- restores orphaned focus to the prior live element on close, without pulling
  focus back after the user has moved it to another live control.

Every DOM access is guarded by `if (!open || typeof document === "undefined")
return;`, so native and SSR never touch a DOM global (native scopes the modal
via `accessibilityViewIsModal`). Used in `src/organisms/dialog/dialog.shared.tsx`
and `src/molecules/alert-dialog/alert-dialog.shared.tsx`. Input dialogs wrap
their content in `KeyboardAvoidingView behavior={Platform.OS === "ios" ?
"padding" : undefined}` so the iOS keyboard never covers the field
(`src/molecules/alert-dialog/alert-dialog.shared.tsx`).
Applies to: Dialog, AlertDialog, and any new full-screen Modal-based overlay.

## (d) Accessible names that carry the data

A node with `role="img"` makes its whole subtree presentational, so the DATA
must live in the accessible NAME. Charts fold their series into the label:

- Chart names its `role="group"` container from the title and gives the plot an
  image name carrying every category's values (`src/charts/chart/chart.shared.tsx`).
- StackedBar includes every segment's label and rounded percentage in the image
  name (`src/charts/stacked-bar/stacked-bar.shared.tsx`).
- Heatmap names its grid with the label and cell count; the calendar form includes
  the day count and total (`src/charts/heatmap/heatmap.shared.tsx`). Gauge announces
  its label and percentage (`src/charts/gauge/gauge.shared.tsx`).

Rule: when you put `role="img"`/`accessibilityRole="image"` on anything, first
fold the values a sighted user reads off it into the `accessibilityLabel` +
`aria-label` pair, or that data is silent. Applies to: charts, sparklines,
gauges, any svg/canvas visual.

## (e) Verification

```bash
bun test test/a11y-state.test.tsx   # the dual-a11y lock (checked/selected/expanded/value, per atom + organism)
```

Then the standard battery (`bun run typecheck`). When you add a new stateful
control, ADD a case to `test/a11y-state.test.tsx` asserting the `aria-*` attr on
the rendered DOM (`container.querySelector('[role="…"]').getAttribute('aria-…')`)
so the alias can't silently regress. Code-reading under-detects a missing alias;
the render test is the guard.
