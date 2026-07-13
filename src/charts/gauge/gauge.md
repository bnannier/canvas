# Gauge

A radial dial: a muted track with a tone-colored fill arc for a 0-100 value, and the number plus an optional label centered inside.

## Usage

```tsx
<Card padded style={{ maxWidth: 200 }}>
  <Column alignCenter>
    <Gauge value={72} label="Uptime" />
  </Column>
</Card>
```

## Do & Don't

### Gauge

**Do** — Put a muted track behind the fill and the numeric value plus label in the center.

```tsx
<Card padded style={{ maxWidth: 200 }}>
  <Column alignCenter>
    <Gauge value={72} label="Uptime" />
  </Column>
</Card>

```

**Don't** — An arc with no track and no number: there is no baseline to read the fill against and no exact value.

```tsx
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 20, maxWidth: 200, alignItems: "center" }}>
  <View style={{ borderRadius: 9999, borderWidth: 8, borderColor: tokens.primary, height: 120, width: 120 }} />
</View>

```
