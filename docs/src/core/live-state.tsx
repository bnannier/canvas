import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "../../../src/style/index.js";

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

// Docs-only live-example ticker (not a Canvas export): steps a value through `values` on
// an interval so a fence can show a component driving ITSELF, e.g. a determinate Progress
// bar filling. Like Stateful it owns the hook state in its own fiber (a fence is a plain
// function and cannot call hooks). Honors Reduce Motion — it stops auto-advancing and holds
// one representative frame (`restIndex`, default the midpoint) so the page carries no
// perpetual motion for users who opted out. Keep its type in sync with the `TickerHelper`
// alias in ./scope.ts.
export function Ticker<T>({
  values,
  interval = 1400,
  restIndex = Math.floor((values.length - 1) / 2),
  children,
}: {
  values: T[];
  interval?: number;
  restIndex?: number;
  children: (value: T) => ReactNode;
}): ReactNode {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduced) return; // honor Reduce Motion: hold a single frame, no auto-advance
    const id = setInterval(() => setIndex((n) => (n + 1) % values.length), interval);
    return () => clearInterval(id);
  }, [interval, values.length, reduced]);
  const value = reduced ? values[Math.min(restIndex, values.length - 1)] : values[index];
  return <>{children(value)}</>;
}

// Docs-only reducer for the DragDrop examples (not a Canvas export): apply a DropEvent to a
// flat list of `{ id, zone, … }` cards, returning a new list where the dropped card's `zone`
// becomes the target and it sits at `index` within that zone. Cards render by filtering on
// `zone`, so only per-zone order matters; this preserves every zone's order and moves the one
// card. Keeps a fence's onDrop a single clean expression. Keep in sync with the
// `ApplyDropHelper` alias in ./scope.ts.
export function applyDrop<T extends { id: string; zone: string }>(
  cards: T[],
  e: { id: string; to: string; index: number },
): T[] {
  const moved = cards.find((c) => c.id === e.id);
  if (!moved) return cards;
  const without = cards.filter((c) => c.id !== e.id);
  const updated = { ...moved, zone: e.to };
  const target = without.filter((c) => c.zone === e.to);
  const others = without.filter((c) => c.zone !== e.to);
  target.splice(Math.max(0, Math.min(e.index, target.length)), 0, updated);
  return [...others, ...target];
}
