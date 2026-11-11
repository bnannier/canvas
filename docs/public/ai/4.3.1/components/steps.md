# Steps

Package: @nannier/canvas
Version: 4.3.1
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 675fbe581e8b4ad6486d40d1b26a76d0ab3c2910cab444fa77edd63dd809f77b

Source: `src/organisms/steps/steps.md`
Human reference: https://canvas.nannier.com/components/steps

## Public imports

```tsx
import { Steps } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Multi-step progress indicators: horizontal, vertical, with progress.

## Usage

```tsx
<Steps
  steps={[{ label: "Account" }, { label: "Profile" }, { label: "Review" }]}
  defaultCurrent={1}
/>
```

## Variants

### Compact sidebar

`compact` with `vertical` renders short 22px markers without connector lines, as a
workflow sidebar. The current row is announced as the current step. Pressable steps
retain their normal controlled and uncontrolled behavior.

```tsx
<Steps vertical compact defaultCurrent={1}
  steps={[{ label: "Name" }, { label: "Members" }, { label: "Theme" }, { label: "Review" }]} />
```

### Sidebar rows

`rows` with `vertical` draws each step as a 32 point row like a desktop app's sidebar
list: the current step's row is filled, done steps carry a check, and the row reads
", done" or ", current" to assistive technology. With `onStepPress` each row is a button.

```tsx
<Steps vertical rows defaultCurrent={1}
  steps={[{ label: "Plan project" }, { label: "Review project plan" }, { label: "Plan workforce" }, { label: "Review team" }]} />
```

### Vertical

```tsx
<Steps
  vertical
  steps={[
    { label: "Account", description: "Email verified and password set." },
    { label: "Profile", description: "Add your name and avatar." },
    { label: "Review", description: "Invite collaborators." }
  ]}
  defaultCurrent={1}
/>
```

### Step progress

A vertical step's title sits on an 18.2 px line over its 12 px description in the third
ink; the current step's description takes the accent's text ink. A step with `progress`
(0 to 100) draws its own 6 px bar 8 px under its text, the fill running from the accent
into the cyan series hue with the accent's glow; the other layouts ignore it.

```tsx
<Steps
  vertical
  steps={[
    { label: "Create workspace", description: "Northwind · EU Frankfurt" },
    { label: "Import components", description: "Restyling 72 of 107", progress: 67 },
    { label: "Invite your team", description: "Optional" }
  ]}
  defaultCurrent={1}
/>
```

### Segmented

`segmented` lays the steps out as equal segments 8 px apart: each a 4 px bar (the
accent once reached, glowing on the current step, the raised surface ahead) over its
500 13 px label and, from its `description`, a status line inked by the step's state:
the success ink once done, the accent's text ink on the current step, the third ink
ahead. The layout precedence is `progress` > `segmented` > `vertical`.

```tsx
<Steps
  segmented
  steps={[
    { label: "Account", description: "Done" },
    { label: "Workspace", description: "Current" },
    { label: "Invite team", description: "Next" }
  ]}
  defaultCurrent={1}
/>
```

### Progress bar

```tsx
<Steps progress steps={[]} value={68} />
```

### Stacks at narrow widths

`stacks` renders the horizontal layout as the vertical one when the component's
own container is at or below `stackBreakpoint` (default `sm` = 640):
container-measured, like Row `stacks`, so a wizard header inside a narrow
column stacks too.

```tsx
<Steps
  stacks
  steps={[{ label: "Account" }, { label: "Profile" }, { label: "Review" }]}
  defaultCurrent={1}
/>
```

## Do & Don't

### Horizontal

**Do** — Mark exactly one step active; show completed steps filled and the rest pending.

```tsx
<Steps defaultCurrent={1} steps={[
    { label: "Account" },
    { label: "Profile" },
    { label: "Review" }
  ]} />
```

**Don't** — Styling several steps as active at once hides which step the user is actually on.

```tsx
<View style={{ flexDirection: "row", alignItems: "flex-start" }}>
  <View style={{ flexDirection: "row", alignItems: "flex-start", flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <View style={{ alignItems: "center", gap: 6 }}>
      <View style={{ height: 32, width: 32, flexShrink: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 9999, borderWidth: 2, borderColor: tokens.primary, backgroundColor: "transparent" }}>
        <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.primary }}>1</Text>
      </View>
      <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground }}>Account</Text>
    </View>
    <View style={{ marginHorizontal: 8, marginTop: 16, height: 1, flexGrow: 1, flexShrink: 1, flexBasis: "0%", backgroundColor: tokens.border }} />
  </View>
  <View style={{ flexDirection: "row", alignItems: "flex-start", flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <View style={{ alignItems: "center", gap: 6 }}>
      <View style={{ height: 32, width: 32, flexShrink: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 9999, borderWidth: 2, borderColor: tokens.primary, backgroundColor: "transparent" }}>
        <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.primary }}>2</Text>
      </View>
      <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground }}>Profile</Text>
    </View>
    <View style={{ marginHorizontal: 8, marginTop: 16, height: 1, flexGrow: 1, flexShrink: 1, flexBasis: "0%", backgroundColor: tokens.border }} />
  </View>
  <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
    <View style={{ alignItems: "center", gap: 6 }}>
      <View style={{ height: 32, width: 32, flexShrink: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 9999, borderWidth: 2, borderColor: tokens.primary, backgroundColor: "transparent" }}>
        <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.primary }}>3</Text>
      </View>
      <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground }}>Review</Text>
    </View>
  </View>
</View>
```

### Vertical

**Do** — Pair each vertical step with a one-line description so the extra width earns its place.

```tsx
<Steps vertical defaultCurrent={1} steps={[
  { label: "Account created", description: "Email verified and password set." },
  { label: "Profile setup", description: "Add your name and avatar." },
  { label: "Team invite", description: "Invite collaborators to your workspace." },
  { label: "Done", description: "You're all set." }
]} />
```

**Don't** — A vertical step with only a title wastes the space the layout is built to use.

```tsx
<Steps vertical defaultCurrent={1} steps={[
  { label: "Account created" },
  { label: "Profile setup" },
  { label: "Team invite" },
  { label: "Done" }
]} />
```

### Progress bar

**Do** — Label the bar and show the exact percentage so progress is legible at a glance.

```tsx
<Steps progress current={0} steps={[]} label="Setup progress" value={68} />
```

**Don't** — A bare progress bar with no percentage leaves users guessing how far along they are.

```tsx
<View style={{ height: 6, overflow: "hidden", borderRadius: 9999, backgroundColor: tokens.muted }}>
  <View style={{ height: "100%", borderRadius: 9999, backgroundColor: tokens.primary, width: "68%" }} />
</View>
```

## Supported props

### StepsProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| steps | Step[] | yes |  | Ordered steps to render. Each is a label with an optional one-line note. |
| current | number \| undefined | no |  | Index of the active step (CONTROLLED). Earlier steps read completed, later ones muted. Omit for uncontrolled use. |
| defaultCurrent | number \| undefined | no |  | Initial active step for uncontrolled use (pressing a step, with `onStepPress`, moves it). |
| vertical | boolean \| undefined | no | false | Layout (pick one; default is horizontal). Precedence: progress, segmented, vertical. |
| compact | boolean \| undefined | no | false | A short vertical list with 22px markers and no connector lines, for a workflow sidebar. |
| rows | boolean \| undefined | no | false | Vertical only: each step a 32 px row like a desktop app's sidebar list (the Claude desktop window's), the current step's row filled, done steps marked with a check. |
| segmented | boolean \| undefined | no | false | Equal segments in a row: each step a 4 px bar (the accent once reached, glowing on the current step) over its label and, from its `description`, a status line inked by the step's state (the success ink once done, the accent's text ink on the current step). |
| progress | boolean \| undefined | no | false | Render a labeled percentage progress bar instead of discrete steps. |
| stacks | boolean \| undefined | no | false | Responsive (horizontal layout only): render the EXISTING vertical layout when the component's own CONTAINER is at or below `stackBreakpoint` (default `sm` = 640). Container-measured with a viewport seed, mirroring Row `stacks`. `vertical` and `progress` are unaffected (a progress bar is already fluid). |
| stackBreakpoint | BreakpointKey \| undefined | no |  | The breakpoint at and below which `stacks` goes vertical (default `"sm"`). Only meaningful with `stacks`. |
| value | number \| undefined | no |  | Progress mode only: filled fraction, 0-100 (clamped). Defaults to 0. |
| label | string \| undefined | no |  | Progress mode only: caption shown left of the percentage. |
| onStepPress | ((index: number) => void) \| undefined | no |  | When set, each step circle is pressable, reporting the step index. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.3.1/installation.md) for required peers and feature fallbacks.
