# Accordion

Package: @nannier/canvas
Version: 4.3.1
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 7e6c5223234f7d08b8647454c5cf0c8ef1d2da6425c2d4d231d846016c668d78

Source: `src/molecules/accordion/accordion.md`
Human reference: https://canvas.nannier.com/components/accordion

## Public imports

```tsx
import { Accordion } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A vertically stacked group of disclosure rows: each `items` entry is a header (its `title` plus a chevron that rotates when the row opens) over a collapsible content panel.

Single-open by default (opening one row closes the others); pass `multiple` to let any number stay open. Open state is controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`). An item's `description` adds a muted secondary line under its title;
`card` wraps the whole group in an outlined card surface on web and Android (on iOS the default look already is the inset-grouped card, so `card` is a no-op there).

## Usage

```tsx
<Accordion
  items={[
    { key: "what", title: "What is Canvas?", content: "A universal React Native UI kit for iOS, Android, and the web." },
    { key: "access", title: "Is it accessible?", content: "Yes. Each header is a button that exposes its expanded state." },
    { key: "theme", title: "Is it themed?", content: "Yes. Every color comes from the active theme tokens." }
  ]}
  defaultValue="what"
/>
```

## Variants

### Multiple open

```tsx
<Accordion
  multiple
  items={[
    { key: "billing", title: "Billing", content: "Manage your plan, payment method, and invoices." },
    { key: "team", title: "Team", content: "Invite teammates and set their roles." },
    { key: "security", title: "Security", content: "Two-factor authentication and active sessions." }
  ]}
  defaultValue={["billing", "security"]}
/>
```

### Card surface

`card` gives the group an outlined card container with inset headers and content on
web and Android. On iOS the default Accordion already renders as the inset-grouped
card, so `card` changes nothing there (a documented no-op).

```tsx
<Accordion
  card
  items={[
    { key: "ship", title: "Shipping", content: "Free 2-day shipping on orders over $50." },
    { key: "return", title: "Returns", content: "30-day returns, no questions asked." },
    { key: "warranty", title: "Warranty", content: "Two years, parts and labor." }
  ]}
  defaultValue="ship"
/>
```

### With descriptions

```tsx
<Accordion
  items={[
    { key: "billing", title: "Billing", description: "Plan, payment method, invoices.", content: "Manage your plan, payment method, and invoices." },
    { key: "team", title: "Team", description: "Members and roles.", content: "Invite teammates and set their roles." },
    { key: "security", title: "Security", description: "2FA and sessions.", content: "Two-factor authentication and active sessions." }
  ]}
  defaultValue="billing"
/>
```

### Disabled row

```tsx
<Accordion
  items={[
    { key: "general", title: "General", content: "Workspace name, language, and time zone." },
    { key: "advanced", title: "Advanced (coming soon)", content: "Not available yet.", disabled: true },
    { key: "danger", title: "Danger zone", content: "Delete this workspace permanently." }
  ]}
  defaultValue="general"
/>
```

### Controlled

Drive the open step from outside the accordion: a parent owns the active step and
passes it as `value`, so the group reflects that external state rather than toggling on
a header press. Here the Next step button is the trigger. (`Stateful` is a
docs-only helper standing in for your own state; in an app you would hold `step` with
`useState` and pass `value={step}` plus `onValueChange` if you also want header presses
to update it.)

```tsx
<Stateful initial="step-1">
  {(step, setStep) => (
    <Column relaxed>
      <Button small outline onPress={() => setStep(step === "step-1" ? "step-2" : step === "step-2" ? "step-3" : "step-1")}>Next step</Button>
      <Accordion
        value={step}
        items={[
          { key: "step-1", title: "Step 1: Connect", content: "Link your data source." },
          { key: "step-2", title: "Step 2: Map", content: "Map the incoming fields." },
          { key: "step-3", title: "Step 3: Review", content: "Confirm and import." }
        ]}
      />
    </Column>
  )}
</Stateful>
```

### Activity disclosure

`activity` retains the original Argus run surface, instant trace reveal, dense
header and 180-degree chevron transition. `compact` keeps the original phone
insets. `renderHeader` arranges domain content inside the component-owned trigger;
the supplied indicator carries the controlled disclosure state. Put nested actions
in that header as Canvas controls so they retain independent targets.

```tsx
<Accordion activity items={[{ key: "run", title: "Scout run", content: "Trace complete" }]} defaultValue="run" />
```


## Do & Don't

### Peer sections

**Do** — Keep one disclosure group for a set of related, peer sections, and let the chevron carry the open/closed affordance.

```tsx
<Accordion
  items={[
    { key: "ship", title: "Shipping", content: "Free 2-day shipping on orders over $50." },
    { key: "return", title: "Returns", content: "30-day returns, no questions asked." }
  ]}
  defaultValue="ship"
/>
```

**Don't** — Don't leave every panel open by default in single-open mode; the closed-by-default disclosure is the point of an accordion.

```tsx
<Accordion
  items={[
    { key: "a", title: "Section A", content: "..." },
    { key: "b", title: "Section B", content: "..." }
  ]}
  multiple
  defaultValue={["a", "b"]}
/>
```

## Supported props

### AccordionProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activity | boolean \| undefined | no | false | Original Argus run disclosure surface, header and trace insets. |
| compact | boolean \| undefined | no | false | Compact activity header and trace indentation. |
| renderHeader | ((item: AccordionItem, expanded: boolean, indicator: ReactNode) => ReactNode) \| undefined | no |  | Activity header content; the Accordion owns its trigger and indicator. |
| items | AccordionItem[] \| undefined | no |  | The disclosure rows, top to bottom. |
| value | string \| string[] \| undefined | no |  | Controlled open state. A single key in single-open mode, an array of keys in `multiple` mode. Pair with `onValueChange`. Omit for uncontrolled. |
| defaultValue | string \| string[] \| undefined | no |  | Initial open state for the uncontrolled case (read once). |
| onValueChange | ((value: string \| string[]) => void) \| undefined | no |  | Called with the next open value whenever a header toggles. |
| multiple | boolean \| undefined | no | false | Allow more than one panel open at once (default: single-open). |
| card | boolean \| undefined | no | false | Card surface: wraps the group in an outlined card container with inset headers and content (web/Android). On iOS the default Accordion already renders as the inset-grouped card, so `card` is a no-op there. |
| disabled | boolean \| undefined | no | false | Disable the whole group (every row stops toggling and dims). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.3.1/installation.md) for required peers and feature fallbacks.
