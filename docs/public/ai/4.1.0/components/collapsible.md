# Collapsible

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: a6fbeb5731557d7d9a75c1ea15f26483ae43566809fb12c2a9add0ca4d3ff9e3

Source: `src/molecules/collapsible/collapsible.md`
Human reference: https://canvas.nannier.com/components/collapsible

## Public imports

```tsx
import { Collapsible } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A single disclosure: one header (its `title`, or a custom `trigger`, plus a chevron that rotates when open) over one collapsible content panel.

Closed by default; pass `defaultOpen` to start open. Open state is controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`). A `description` adds a muted secondary line under the title;
`card` wraps the disclosure in an outlined card surface on web and Android (on iOS the default look already is the inset-grouped card, so `card` is a no-op there).
For a set of related, peer sections, reach for an Accordion (a group of these); Collapsible is the standalone primitive.

## Usage

```tsx
<Collapsible title="Shipping details">
  Free 2-day shipping on orders over $50. Delivery in 3 to 5 business days otherwise.
</Collapsible>
```

## Variants

### Open by default

```tsx
<Collapsible title="What is Canvas?" defaultOpen>
  A universal React Native UI kit that renders natively on iOS and Android and on the web through React Native Web.
</Collapsible>
```

### Disabled

```tsx
<Collapsible title="Advanced settings (coming soon)" disabled>
  Not available yet.
</Collapsible>
```

### Card surface

`card` gives the disclosure an outlined card container with inset header and content
on web and Android. On iOS the default Collapsible already renders as the
inset-grouped card, so `card` changes nothing there (a documented no-op).

```tsx
<Collapsible card title="Shipping details" defaultOpen>
  Free 2-day shipping on orders over $50. Delivery in 3 to 5 business days otherwise.
</Collapsible>
```

### Reference card

`reference` is the reference-sheet disclosure, a component page's sub-component props: the
card corner on a hairline over the card fill, a 46 px toggle with the title in 600 14 and
the `description` inline after it in the mono meta ink, and the content flush to the card's
edges, so a `reference attached` DataTable's rows meet the card. On iOS the default
Collapsible already renders as the inset-grouped card, so `reference` changes nothing there.

```tsx
<Collapsible reference title="AvatarMenuProps" description="3 props" defaultOpen>
  <DataTable
    reference
    attached
    columns={["Prop", "Type", "Default"]}
    rows={[
      ["open", "boolean", "false"],
      ["onOpenChange", "(open: boolean) => void", "–"],
      ["items", "AvatarMenuItem[]", "–"]
    ]}
  />
</Collapsible>
```

### With descriptions

```tsx
<Collapsible title="Notifications" description="Email, push, and digest frequency.">
  Choose which events reach your inbox and which stay in the app.
</Collapsible>
```

### Custom trigger

```tsx
<Collapsible trigger={<Typography medium>Order #1024, 3 items</Typography>}>
  Wireless mouse, USB-C cable, laptop stand. Estimated total $84.00.
</Collapsible>
```

## Do & Don't

### One block of detail

**Do** — Use one Collapsible to hide a single block of secondary detail behind a clear label, and let the chevron carry the open/closed affordance.

```tsx
<Collapsible title="Returns policy">
  30-day returns, no questions asked. Refunds post within 5 business days.
</Collapsible>
```

**Don't** — Don't reach for a Collapsible when you have several related, peer sections; that is an Accordion's job, and a stack of standalone disclosures loses the single-open coordination.

```tsx
<View>
  <Collapsible title="Billing">Manage your plan.</Collapsible>
  <Collapsible title="Team">Invite teammates.</Collapsible>
  <Collapsible title="Security">Two-factor authentication.</Collapsible>
</View>
```

## Supported props

### CollapsibleProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | string \| undefined | no |  | The default trigger label text. |
| description | string \| undefined | no |  | The muted secondary line under the title in the default trigger anatomy (ignored when a custom `trigger` is given, which owns its own anatomy). |
| trigger | ReactNode | no |  | A custom trigger node; if provided, it renders as the pressable's content instead of the `title` text (the chevron still renders alongside). |
| card | boolean \| undefined | no | false | Card surface: wraps the disclosure in an outlined card container with inset header and content (web/Android). On iOS the default Collapsible already renders as the inset-grouped card, so `card` is a no-op there. |
| reference | boolean \| undefined | no | false | The reference-sheet card (a component page's sub-component props): the card corner on a hairline over the card fill, a 46 px toggle with the title in 600 14 and the `description` inline after it in the mono meta ink, and the content flush to the card's edges, for a `reference attached` DataTable (web/Android). On iOS the default Collapsible already renders as the inset-grouped card, so `reference` changes nothing there. |
| children | ReactNode | yes |  | The collapsible content. A string renders in the skin's content type; a ReactNode renders as-is. |
| open | boolean \| undefined | no | false | Controlled open state. Pair with `onOpenChange`. Omit for uncontrolled. |
| onOpenChange | ((open: boolean) => void) \| undefined | no |  | Called with the next open state whenever the header toggles. |
| defaultOpen | boolean \| undefined | no | false | Initial open state for the uncontrolled case (read once, default false). |
| disabled | boolean \| undefined | no | false | A disabled header does not toggle and reads dimmed. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
