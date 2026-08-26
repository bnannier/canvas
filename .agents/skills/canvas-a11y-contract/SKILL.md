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
RN 0.71+ accepts the `aria-*` props; RNW forwards them; native ignores them (it
already has the RN prop). Real pairs in the kit:

| state | RN prop | aria alias | call site |
|---|---|---|---|
| checked / on | `accessibilityState={{ checked }}` | `aria-checked={checked}` | `src/atoms/switch/switch.shared.tsx:93-94` |
| tri-state check | `accessibilityState={{ checked: indeterminate ? "mixed" : checked }}` | `aria-checked={indeterminate ? "mixed" : checked}` | `src/atoms/checkbox/checkbox.shared.tsx:105-106` |
| expanded | (role + open state) | `aria-expanded={open}` | `src/atoms/dropdown/dropdown.shared.tsx:124`, `select.shared.tsx:110`, `combobox.shared.tsx:193` |
| selected (option/tab) | `accessibilityState={{ selected }}` | `aria-selected={selected}` | `src/atoms/select/select.shared.tsx:138`, `src/organisms/tabs/tabs.shared.tsx:179`, `tab-bar.shared.tsx:79` |
| pressed (toggle chip) | (active tone) | `aria-pressed={primaryTone}` | `src/atoms/chip/chip.shared.tsx:145` |
| value (slider/progress) | `accessibilityValue={{ min, max, now }}` | `aria-valuemin/valuemax/valuenow` | `src/atoms/slider/slider.shared.tsx:234,238-240`; `progress.shared.tsx:134` |
| disabled | `accessibilityState={{ disabled }}` | `aria-disabled={disabled}` | `src/atoms/slider/slider.shared.tsx:241,245` |
| label | `accessibilityLabel` | `aria-label` | `src/atoms/switch/switch.shared.tsx:91-92` |

Multi- vs single-select listbox rows switch the alias key by mode (checked for
multi, selected for single): `src/atoms/listbox/listbox.shared.tsx:162`. Options
must expose `role="option"` inside a `role="listbox"` and stay clickable (the
test fires a real click on an option and asserts the payload):
`test/a11y-state.test.tsx:74-110`. Applies to: any toggle, radio, switch, chip,
tab, disclosure trigger, listbox/select/combobox/command option, slider, progress.

## (b) Keyboard operability on the web

A focusable web control needs `onKeyDown`. `View` has no native `onKeyDown`, so
route the handler in through a cast and the tab stop through `focusable`; both
are no-ops on native. Slider is the reference (`src/atoms/slider/slider.shared.tsx`):

- Tab stop: `focusable={!disabled}` (RNW maps it to `tabIndex` 0/-1; disabled
  drops it OUT of the tab order), line 229.
- Keys (lines 190-206): `ArrowRight`/`ArrowUp` = +step, `ArrowLeft`/`ArrowDown`
  = -step, `PageUp`/`PageDown` = ±`step*10`, `Home` = min, `End` = max. Every
  result runs through `snap(...)` which clamps to `[min, max]` (line 78).
- `event.preventDefault()` on every handled key so Arrow/Page/Home/End don't
  also scroll the page (lines 204-205).
- Pass the handler as `const webKeyboardProps = { onKeyDown } as unknown as
  ViewProps` (line 208), spread onto the View (line 223).
- Mirror it for VoiceOver/switch-control: `accessibilityActions` +
  `onAccessibilityAction` increment/decrement (lines 246-247, 174-180).

Overlays close on Escape via `useEscapeKey(active, onEscape)`
(`src/style/use-escape-key.ts`, re-exported from `src/style/index.ts:19`): a
document-level keydown listener while `active`, no-op when `document` is
undefined (native/SSR). Wired in dropdown (`:96`), select (`:89`), combobox
(`:144`), popover (`:87`), row-menu (`:58`), dialog (`:135`), alert-dialog
(`:157`). Applies to: sliders, and every anchored/portal overlay.

## (c) Dialog focus management

Modal dialogs use `useDialogFocus(open)` (`src/style/use-dialog-focus.ts`,
barrel `src/style/index.ts:20`). It returns a `panelRef` you attach to the
panel container (a focusable `tabIndex={-1}` View). While `open` it:

- moves focus INTO the panel on open (`panel.focus()`),
- traps Tab / Shift+Tab inside the panel (wraps last->first and first->last over
  `FOCUSABLE_SELECTOR`, filtering out `disabled` and `tabindex="-1"` nodes),
- RESTORES focus to the previously focused element (the trigger) on close.

Every DOM access is guarded by `if (!open || typeof document === "undefined")
return;`, so native and SSR never touch a DOM global (native scopes the modal
via `accessibilityViewIsModal`). Used in `src/organisms/dialog/dialog.shared.tsx:134`
and `src/molecules/alert-dialog/alert-dialog.shared.tsx:156`. Input dialogs wrap
their content in `KeyboardAvoidingView behavior={Platform.OS === "ios" ?
"padding" : undefined}` so the iOS keyboard never covers the field
(`alert-dialog.shared.tsx:246`; also drawer `:127`, action-sheet `:183`).
Applies to: Dialog, AlertDialog, and any new full-screen Modal-based overlay.

## (d) Accessible names that carry the data

A node with `role="img"` makes its whole subtree presentational, so the DATA
must live in the accessible NAME. Charts fold their series into the label:

- Bar chart names itself with its title: `chartName = title ? \`${title} chart\`
  : "Bar chart"`, on a `role="group"` container so AT reads the summary then
  walks the per-bar items (`src/organisms/charts/charts.shared.tsx:121,125-127`).
- StackedBar folds every segment into the name:
  `${label}: ${segments.map((s) => \`${s.label} ${Math.round(pct(s.value))}%\`).join(", ")}`
  then applies `{ accessibilityRole: "image", accessibilityLabel: name,
  "aria-label": name }` (`src/organisms/charts/charts-viz.tsx:56,61`).
- Heatmap names the grid with its scope: `${label}, ${values.length} cells`
  (`charts-viz.tsx:188`); Gauge = `${label}: ${v}%` (`charts-viz.tsx:135`).

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
