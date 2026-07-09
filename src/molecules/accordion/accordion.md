# Accordion

A vertically stacked group of disclosure rows: each `items` entry is a header (its `title` plus a chevron that rotates 0 to 90deg when open) over a collapsible content panel. Single-open by default (opening one row closes the others); pass `multiple` to let any number stay open. Open state is controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`).

## Usage

```tsx
<Accordion
  items={[
    { key: "what", title: "What is Canvas?", content: "A universal React Native UI kit that renders natively on iOS and Android and on the web through React Native Web." },
    { key: "access", title: "Is it accessible?", content: "Yes. Each header is a button that exposes its expanded and disabled state to assistive technology." },
    { key: "theme", title: "Is it themed?", content: "Yes. All colors come from the active theme tokens, so light, dark, and glass surfaces keep working." }
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
a header press. Here the Previous / Next buttons are the trigger. (`Stateful` is a
docs-only helper standing in for your own state; in an app you would hold `step` with
`useState` and pass `value={step}` plus `onValueChange` if you also want header presses
to update it.)

```tsx
<Stateful initial="step-1">
  {(step, setStep) => (
    <Column relaxed>
      <Row snug alignCenter>
        <Button small outline disabled={step === "step-1"} onPress={() => setStep(step === "step-3" ? "step-2" : "step-1")}>Previous</Button>
        <Button small primary disabled={step === "step-3"} onPress={() => setStep(step === "step-1" ? "step-2" : "step-3")}>Next step</Button>
      </Row>
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

## Do & Don't

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
