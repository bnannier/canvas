import { useState } from "react";
import { Autocomplete, Column, Drawer, Form, Input, Switch, Typography } from "@nannier-com/canvas";

export const FRUIT = [
  "Apple", "Apricot", "Banana", "Cherry", "Dates", "Elderberry", "Fig", "Grapefruit",
  "Guava", "Kiwi", "Lemon", "Mango", "Nectarine", "Orange", "Papaya", "Peach",
  "Pear", "Pineapple", "Plum", "Raspberry", "Strawberry", "Tangerine", "Watermelon",
];

export function FormAutocompleteBody({ scenario }: { scenario?: string }) {
  const [value, setValue] = useState(scenario === "clear" ? "Apple" : "");
  const [disabled, setDisabled] = useState(scenario === "disabled");
  const [submits, setSubmits] = useState(0);
  const [selections, setSelections] = useState(0);
  const [changes, setChanges] = useState(0);
  return (
    scenario === "modal" ? (
        <Drawer trigger="Open fruit drawer" onOpenChange={(next) => { if (!next) setSubmits((count) => count + 1); }}>
          <Autocomplete label="Drawer fruit" testID="drawer-fruit-input" options={FRUIT} />
        </Drawer>
      ) : (
      <Column relaxed>
        <Switch checked={disabled} onChange={setDisabled}>Lock fruit</Switch>
        <Form submitLabel="Save choice" onSubmit={() => setSubmits((count) => count + 1)}>
          <Input label="Name" placeholder="Your name" />
          <Autocomplete label="Fruit" testID="fruit-input" options={FRUIT} value={value} disabled={disabled}
            helperText="Arrow keys highlight a fruit. Enter selects it before saving the form."
            onValueChange={(next) => { setValue(next); setChanges((count) => count + 1); }}
            onSelect={() => setSelections((count) => count + 1)} />
        </Form>
        <Typography testID="fruit-value">{value === "" ? "No fruit selected" : value}</Typography>
        <Typography testID="submit-count">{submits}</Typography>
        <Typography testID="selection-count">{selections}</Typography>
        <Typography testID="value-change-count">{changes}</Typography>
      </Column>
      )
  );
}
