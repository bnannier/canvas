// The characterization of an axis resolver: what it returns for no member, for each
// member alone and for each pair, recorded as data (test/fixtures/axes.json) so a later
// change to the resolver is held to it pair by pair.
//
// A pair is recorded by the member it resolves to, which is what a reader of a
// precedence asks (`<Button small large>` resolves to small); the member's own value is in
// `single`. When both members resolve to the same value the pair names both
// ("destructive|error"); when the pair resolves to neither member's value the record
// holds the value itself. Every pair is called in both prop orders, and a resolver
// whose answer depends on that order is recorded as such, since an `if` chain never is.
//
// `order` is the precedence the pairs show: the members sorted so each beats every member
// after it, with members that resolve alike and lose and win alike grouped as aliases
// (`destructive|error`). It is null when the pairs fit no such order. A catalog axis
// (Icon's generated glyph list) records only its rule and every pair that breaks it.

import type { AnySubject } from "./registry.ts";

/** The record file, relative to the repository root. */
export const FIXTURE = "test/fixtures/axes.json";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** A pair's result: the member (or `a|b` aliases) it resolves to, or a value of its own. */
export type PairResult = string | { value: Json } | { byOrder: [Json, Json] };

/** The characterization of one resolver. */
export interface AxisRecord {
  kind: "axis" | "toggle" | "rule";
  components: string[];
  pages: string[];
  resolver: string;
  /** The precedence the pairs show, highest first; aliases joined with `|`. */
  order: string[] | null;
  /** The result with no member set. */
  none: Json;
  /** The result for each member alone, in `order`. */
  single: Record<string, Json>;
  /** The result for each pair, keyed `a + b` with the two members in alphabetical order. */
  pairs: Record<string, PairResult>;
}

/** The characterization of a catalog axis. */
export interface CatalogRecord {
  kind: "catalog";
  components: string[];
  pages: string[];
  resolver: string;
  /** The catalog's rule. */
  order: "first in catalog order";
  none: Json;
  /** The members and pairs the rule does not hold for, the first fifty of them (empty when it holds). */
  violations: string[];
}

export type Characterization = Record<string, AxisRecord | CatalogRecord>;

// JSON with object keys sorted, so equal values compare equal whatever order a resolver
// built them in.
function canonical(value: unknown): string {
  return JSON.stringify(value === undefined ? null : value, (_key, inner: unknown) =>
    inner && typeof inner === "object" && !Array.isArray(inner)
      ? Object.fromEntries(Object.entries(inner as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : inner === undefined
        ? null
        : inner,
  );
}

const asJson = (encoded: string): Json => JSON.parse(encoded) as Json;

/** The key a pair is recorded under. */
export const pairKey = (a: string, b: string): string => [a, b].sort().join(" + ");

const call = (s: AnySubject, members: string[]): string => canonical(s.resolve(Object.fromEntries(members.map((m) => [m, true]))));

/** Characterize every subject, keyed by id. */
export function characterizeAll(subjects: readonly AnySubject[]): Characterization {
  const out: Characterization = {};
  for (const s of subjects) {
    if (s.id in out) throw new Error(`Two subjects share the id ${s.id}`);
    out[s.id] = s.catalog ? characterizeCatalog(s) : characterize(s);
  }
  return out;
}

/** Characterize one resolver. */
export function characterize(s: AnySubject): AxisRecord {
  const members = [...s.members] as string[];
  if (new Set(members).size !== members.length) throw new Error(`${s.id}: a member is listed twice`);
  const single = new Map(members.map((m) => [m, call(s, [m])]));
  // a's relation to b: "win", "lose", "tie" (both resolve alike), or "neither".
  const relation = new Map<string, "win" | "lose" | "tie" | "neither">();
  const pairs: Record<string, PairResult> = {};
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i]!;
      const b = members[j]!;
      const forward = call(s, [a, b]);
      const reverse = call(s, [b, a]);
      const key = pairKey(a, b);
      if (forward !== reverse) {
        pairs[key] = { byOrder: [asJson(forward), asJson(reverse)] };
        relation.set(`${a}|${b}`, "neither");
        relation.set(`${b}|${a}`, "neither");
        continue;
      }
      const toA = forward === single.get(a);
      const toB = forward === single.get(b);
      const [first, second] = [a, b].sort();
      pairs[key] = toA && toB ? `${first}|${second}` : toA ? a : toB ? b : { value: asJson(forward) };
      relation.set(`${a}|${b}`, toA && toB ? "tie" : toA ? "win" : toB ? "lose" : "neither");
      relation.set(`${b}|${a}`, toA && toB ? "tie" : toB ? "win" : toA ? "lose" : "neither");
    }
  }
  const order = precedence(members, single, relation);
  const ranked = order ? order.flatMap((group) => group.split("|")) : members;
  return {
    kind: s.rule ? "rule" : members.length === 1 ? "toggle" : "axis",
    components: [...s.components],
    pages: [...s.pages],
    resolver: s.resolver,
    order,
    none: asJson(call(s, [])),
    single: Object.fromEntries(ranked.map((m) => [m, asJson(single.get(m)!)])),
    pairs: Object.fromEntries(Object.entries(pairs).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))),
  };
}

// The precedence the relations show, or null when they fit none. Aliases (members that
// resolve alike, tie with each other and relate alike to every other member) group into
// one rank; the ranks then sort topologically by "beats", ties broken by declaration
// order, and the result must hold for every pair across ranks.
function precedence(members: string[], single: Map<string, string>, relation: Map<string, string>): string[] | null {
  const rel = (a: string, b: string) => relation.get(`${a}|${b}`);
  const groups: string[][] = [];
  for (const m of members) {
    const alias = groups.find(
      (group) =>
        single.get(group[0]!) === single.get(m) &&
        rel(group[0]!, m) === "tie" &&
        members.every((other) => other === m || group.includes(other) || rel(group[0]!, other) === rel(m, other)),
    );
    if (alias) alias.push(m);
    else groups.push([m]);
  }
  const beats = (x: string[], y: string[]) => x.some((a) => y.some((b) => rel(a, b) === "win"));
  const placed: string[][] = [];
  const rest = [...groups];
  while (rest.length > 0) {
    const next = rest.findIndex((g) => rest.every((other) => other === g || !beats(other, g)));
    if (next < 0) return null;
    placed.push(rest.splice(next, 1)[0]!);
  }
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      for (const a of placed[i]!) for (const b of placed[j]!) if (rel(a, b) !== "win" && rel(a, b) !== "tie") return null;
    }
  }
  return placed.map((group) => group.join("|"));
}

/** Characterize a catalog axis: each member resolves to itself, and each pair to the member listed first. */
export function characterizeCatalog(s: AnySubject): CatalogRecord {
  const members = [...s.members] as string[];
  const violations: string[] = [];
  for (const m of members) if (call(s, [m]) !== canonical(m)) violations.push(`${m} alone resolves to ${call(s, [m])}`);
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i]!;
      const b = members[j]!;
      const expected = canonical(a);
      if (call(s, [a, b]) !== expected || call(s, [b, a]) !== expected) violations.push(`${pairKey(a, b)} does not resolve to ${a}`);
    }
  }
  const shown = violations.slice(0, 50);
  if (violations.length > shown.length) shown.push(`and ${violations.length - shown.length} more`);
  return {
    kind: "catalog",
    components: [...s.components],
    pages: [...s.pages],
    resolver: s.resolver,
    order: "first in catalog order",
    none: asJson(call(s, [])),
    violations: shown,
  };
}
