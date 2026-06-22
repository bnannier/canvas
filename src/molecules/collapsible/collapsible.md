# Collapsible

A single disclosure: one header (its `title`, or a custom `trigger`, plus a chevron that rotates 0 to 90deg when open) over one collapsible content panel. Closed by default; pass `defaultOpen` to start open. Open state is controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`). For a set of related, peer sections, reach for an Accordion (a group of these); Collapsible is the standalone primitive.

## Usage

```tsx
<Collapsible title="Shipping details">
  <Text>Free 2-day shipping on orders over $50. Delivery in 3 to 5 business days otherwise.</Text>
</Collapsible>
```

## Variants

### Open by default

```tsx
<Collapsible title="What is Canvas?" defaultOpen>
  <Text>A universal React Native UI kit that renders natively on iOS and Android and on the web through React Native Web.</Text>
</Collapsible>
```

### Disabled

```tsx
<Collapsible title="Advanced settings (coming soon)" disabled>
  <Text>Not available yet.</Text>
</Collapsible>
```

### Custom trigger

```tsx
<Collapsible
  trigger={<Text>Order #1024 — 3 items</Text>}
  defaultOpen
>
  <Text>Wireless mouse, USB-C cable, laptop stand. Estimated total $84.00.</Text>
</Collapsible>
```

## Do & Don't

**Do** — Use one Collapsible to hide a single block of secondary detail behind a clear label, and let the chevron carry the open/closed affordance.

```tsx
<Collapsible title="Returns policy">
  <Text>30-day returns, no questions asked. Refunds post within 5 business days.</Text>
</Collapsible>
```

**Don't** — Don't reach for a Collapsible when you have several related, peer sections; that is an Accordion's job, and a stack of standalone disclosures loses the single-open coordination.

```tsx
<View>
  <Collapsible title="Billing"><Text>Manage your plan.</Text></Collapsible>
  <Collapsible title="Team"><Text>Invite teammates.</Text></Collapsible>
  <Collapsible title="Security"><Text>Two-factor authentication.</Text></Collapsible>
</View>
```
