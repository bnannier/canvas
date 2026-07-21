import { useEffect, useState, type ReactNode } from "react";
import { View, Text, Input, Icon, useTheme, type IconProps } from "@nannier/canvas";
import { useReducedMotion } from "../../../src/style/index.js";
// The kit's glyph table, read straight from source like the style helpers above (the
// public Icon renders one glyph at a time and does not expose the catalog). Used only by
// the docs-only IconGallery below.
import { NAMES } from "../../../src/atoms/icon/icon.glyphs.js";

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

// Select a glyph by its (string) name from Icon's one-boolean-per-name API. The name comes
// from the kit's own NAMES table, so it always resolves to a real glyph; the cast just bridges
// a dynamic string to the static prop shape (Icon reads the active name boolean at runtime).
function glyphByName(name: string): IconProps {
  return { [name]: true } as unknown as IconProps;
}

// Docs-only Icon catalog (not a Canvas component, not shipped): the searchable gallery of
// every kit glyph, rendered as the Icon page's "Gallery" example. The kit Icon draws a single
// glyph; browsing the whole set is a docs concern, so the catalog lives here rather than as an
// Icon prop. A kit Input drives a live, case-insensitive filter over the glyph names, and the
// matches flow into a wrapping grid of labeled glyphs. Like Stateful/Ticker it owns its state
// in its own fiber (a fence is a plain function and cannot call hooks). The grid is docs-only
// infrastructure, so it composes raw Views (as the Playground harness does), not kit layout
// props. Keep its type in sync with the `IconGalleryHelper` alias in ./scope.ts.
export function IconGallery(): ReactNode {
  const { tokens } = useTheme();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = q
    ? NAMES.filter(({ key, label }) => key.toLowerCase().includes(q) || label.toLowerCase().includes(q))
    : NAMES;
  return (
    <View style={{ width: "100%", gap: 16 }}>
      <Input
        block
        leadingIcon
        icon="search"
        placeholder="Search icons"
        accessibilityLabel="Search icons"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {matches.length === 0 ? (
        <Text style={{ fontSize: 13, color: tokens["muted-foreground"], paddingVertical: 8 }}>
          No icons match "{query}".
        </Text>
      ) : (
        <View style={{ width: "100%", flexDirection: "row", flexWrap: "wrap" }}>
          {matches.map(({ key, label }) => (
            <View key={key} style={{ width: 80, alignItems: "center", gap: 6, borderRadius: 8, paddingHorizontal: 4, paddingVertical: 10 }}>
              <Icon {...glyphByName(key)} size={20} />
              <Text style={{ fontSize: 10, color: tokens["muted-foreground"] }}>{label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
