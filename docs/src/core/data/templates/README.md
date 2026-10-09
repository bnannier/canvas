# Template authoring contract

Every template in this directory is a LIVE demo built from real Canvas
components (the render path in `TemplateSection`). No HTML-string mockups, no
hand-rolled look-alikes, and no dead controls.

## File shape

One file per template, exporting a single `TemplateDoc`:

```tsx
import { useState } from "react";
import { Row, Column, Card, Typography, Button /* ... */ } from "@nannier/canvas";
import type { TemplateDoc } from "../types";

function SectionLive() {
  const [state, setState] = useState(/* demo state */);
  return /* kit components only */;
}

export const EXAMPLE_TEMPLATE: TemplateDoc = {
  slug: "example",
  name: "Example",
  description: "One sentence. End with: Built from live Canvas components.",
  sections: [
    { title: "…", anatomy: "…", render: () => <SectionLive /> },
  ],
};
```

Hooks live in named function components (`render: () => <SectionLive />`),
never directly inside `render`. Register the export in `../templates.tsx`.

## Interactivity is required

A template is a working product surface, not a picture of one:

- Every control is operable. Inputs type (uncontrolled or controlled), selects
  select, switches flip, tabs switch, accordions open, checkboxes check.
- Every Button has an `onPress` that visibly does something. Prefer a real
  state change (append the invited teammate, remove the revoked key, send the
  chat message, open the pressed thread). Where the real action would leave
  the page (Export, Contact sales, Update card), fire a toast instead:

  ```tsx
  import { useToast } from "@nannier/canvas";
  const { toast } = useToast(); // inside a component; ToastProvider is mounted in the docs root
  toast({ success: true, message: "Invite sent", description: "ada@acme.com will get an email." });
  ```

- Demo state is component-local (`useState`) and resets on remount. That is
  correct for docs; do not persist.
- Lists that claim to filter, select, or paginate must actually do it on the
  demo data.

## Hard rules

- Kit components and primitives ONLY (`View`, `Text`, `Pressable`, `Image`,
  `TextInput`, `ScrollView` are the allowed primitives). Never re-implement a
  control that exists in `src/atoms|molecules|organisms|charts`.
- Semantic boolean props, never `variant="..."`/`size="..."` strings.
- No call-site `style` overrides. Appearance and spacing come from semantic
  props; width comes from a `Container` step, a Row child's `span`, or a Grid
  cell. Fields may use the shared measure axis (`sm`, `start`, and so on).
- No `Platform.OS` branches, DOM, raw CSS, or viewport-driven component
  layouts. Prefer intrinsic sizing, then the container-measured `Grid` and
  `Row stacks`. Reserve viewport hooks for window-level navigation chrome.
- Keep the element tree stable across responsive changes. Changing a Row
  into a Column remounts its controls and discards drafts and focus; `Row
  stacks` changes the layout without changing the parent component type.
- Do not edit kit source (`src/`) from a template task. If a component is
  missing a capability, note the gap in your report instead.
- Check exact props in the component's own doc:
  `src/<atoms|molecules|organisms|charts>/<name>/<name>.md`. Icon glyph
  booleans are camelCase; verify a glyph exists in
  `src/atoms/icon/icon.glyphs.ts` before using it.
- Desktop-first and responsive: verify at a wide stage and about 300px.
  Equal tiles use `Grid minTileWidth={240}` with an optional `columns` cap.
  Content-sized toolbars use `Row stacks`; pane splits use a `Row stacks`
  of span children (`span={6}` for halves, 8 and 4 for main and sidebar).
  Use `stackBreakpoint="md"` when a pane split cannot fit a tablet stage.
  Let the kit's table or board own any internal scrolling behavior.
- Examples require an existing kit component that fits the job. Omit an
  unsupported illustration instead of adding a kit component to satisfy it.

## Definition of done

Both `bunx tsc --noEmit -p docs/src/core/tsconfig.json` and
`cd docs && bunx tsc --noEmit` pass, and every visible control on the page
does something when pressed.
