import { useState, type ReactNode } from "react";

// Docs-only live-example infrastructure (not a Canvas component, not shipped): a
// render-prop state holder so a stateless example fence can still demonstrate
// CONTROLLED usage. An example fence is a single JSX expression invoked as a plain
// function, so it cannot call hooks itself; `Stateful` owns one piece of state in its
// own component fiber (where hooks are valid) and hands it to its children with a
// setter. That lets an example wire an external control (a Button, a Stepper) to a
// component's controlled `value` prop, e.g.:
//
//   <Stateful initial="step-1">
//     {(step, setStep) => (
//       <><Button onPress={() => setStep("step-2")}>Next</Button>
//         <Accordion value={step} items={STEPS} /></>
//     )}
//   </Stateful>
//
// The name is deliberately distinctive (not "State"): the docgen adds any scope name
// it sees as a whole word in a fence to that example's destructure, so a common word
// would pollute unrelated examples (e.g. a Select whose label is "State"). It renders
// no UI of its own; keep its type in sync with the `StatefulHelper` alias in
// ./scope.ts, which types it for the example scope.
export function Stateful<T>({
  initial,
  children,
}: {
  initial: T;
  children: (value: T, set: (next: T) => void) => ReactNode;
}): ReactNode {
  const [value, setValue] = useState<T>(initial);
  return <>{children(value, setValue)}</>;
}
