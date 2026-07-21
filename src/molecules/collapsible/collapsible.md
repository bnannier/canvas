# Collapsible

A single disclosure: one header (its `title`, or a custom `trigger`, plus a chevron that rotates when open) over one collapsible content panel. Closed by default; pass `defaultOpen` to start open. Open state is controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`). For a set of related, peer sections, reach for an Accordion (a group of these); Collapsible is the standalone primitive.

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

### Custom trigger

```tsx
<Collapsible
  trigger={<Typography medium>Order #1024, 3 items</Typography>}
  defaultOpen
>
  Wireless mouse, USB-C cable, laptop stand. Estimated total $84.00.
</Collapsible>
```

## Do & Don't

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
