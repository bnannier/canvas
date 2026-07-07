---
"@olympusoss/canvas": minor
---

API completeness sweep.

**testID everywhere.** Every component now accepts a `testID` forwarded to its
root element, so Detox/Maestro/Playwright suites can target Canvas components.

**Controlled + uncontrolled everywhere.** Form controls adopt the
`useControllableState` contract: `Checkbox` (`defaultChecked`), `Tabs`
(`defaultActive`), `TabBar` (`defaultIndex`), `Select` (`defaultValue` +
`defaultOpen`), `Slider` (`defaultValue`), `NumberInput` (`defaultValue`).
A bare `<Checkbox />`, `<Tabs />`, `<Select options />`, or `<Slider />` is now
interactive out of the box; controlled usage is unchanged.

**Combobox is typeable.** The trigger is now a real text input: type to filter
options, with `query` controllable (`defaultQuery`) and an `onQueryChange`
callback. Previously the field was a Pressable and users could not type at all.
