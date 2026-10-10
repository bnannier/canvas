// Axes: how a component resolves its semantic boolean props. Every style choice is
// a flat boolean named for its meaning (CLAUDE.md, "Semantic prop styling"), the
// booleans are grouped into axes, and props on one axis are mutually exclusive: when
// a call site passes two (`<Button small large>`) the component resolves the single
// highest-precedence one and never stacks them.
//
// An axis is that precedence written down as data: an ordered list of boolean
// members, highest precedence first, with the value each member resolves to and the
// value the axis takes when none is set. `pick` walks the list and returns the value
// of the first member the props set, which is exactly what a hand-rolled first-match
// chain (`if (p.small) return "small"; if (p.large) return "large"; return "base";`)
// computes, so a component's resolver becomes `pick(SIZE, props)` and the order lives
// in one place a docs page can read.
//
// The precedence IS the declaration order. That is the measure axis's rule, and the
// measure axis is the first table here: `widths` in tokens.ts is declared narrowest
// first and `MEASURE` takes its members from it, so a step added to the scale joins
// the axis with no second list (`stepOf` in sizing.ts resolves through it).
//
// An axis is declared in one of two forms:
//
//   axis(["small", "large"], "base")         the members resolve to themselves
//   axis({ small: 96, large: 200 }, 140)     each member resolves to its value
//
// The record form is the `widths` form: its key order is the precedence. Two members
// that resolve to the same value are aliases (`destructive` and `error` both resolve
// the error tone). The fallback is what the axis resolves to when no member is set,
// often a name that is not a member at all (Button's size is "base").
//
// This file is pure data and functions with no React or React Native import, so the
// docs generator can read a component's axis tables without loading the kit. A table
// imports `axis` from this file directly (never through the style hub, which pulls in
// React Native) and takes its props type with a type-only import of the shell.

import { widths, type WidthKey } from "./tokens.js";

/**
 * One axis of a component's semantic props: the members in precedence order (each
 * beats every member after it), what each resolves to, and the fallback when none is
 * set.
 */
export interface Axis<M extends string, V = M, D = null> {
  /** The members, highest precedence first. */
  readonly members: readonly M[];
  /** What each member resolves to. */
  readonly values: Readonly<Record<M, V>>;
  /** What the axis resolves to when the props set no member. */
  readonly fallback: D;
}

/** The members of an axis. */
export type MemberOf<A> = A extends Axis<infer M, unknown, unknown> ? M : never;

/** Everything an axis can resolve to: a member's value or the fallback. */
export type ResolvedOf<A> = A extends Axis<string, infer V, infer D> ? V | D : never;

/** The keys of `P` whose values are booleans: the only props an axis may name. */
export type BooleanProps<P> = {
  [K in keyof P]-?: [NonNullable<P[K]>] extends [never] ? never : [NonNullable<P[K]>] extends [boolean] ? K : never;
}[keyof P] &
  string;

/** An axis whose members resolve to themselves, with no fallback (`null`). */
export function axis<const M extends string>(members: readonly M[]): Axis<M, M, null>;
/** An axis whose members resolve to themselves, and `fallback` when none is set. */
export function axis<const M extends string, const D>(members: readonly M[], fallback: D): Axis<M, M, D>;
/** An axis whose members resolve to their values in `values`, declared in precedence order, with no fallback (`null`). */
export function axis<const R extends Record<string, unknown>>(values: R): Axis<keyof R & string, R[keyof R], null>;
/** An axis whose members resolve to their values in `values`, declared in precedence order, and `fallback` when none is set. */
export function axis<const R extends Record<string, unknown>, const D>(values: R, fallback: D): Axis<keyof R & string, R[keyof R], D>;
export function axis(spec: readonly string[] | Record<string, unknown>, fallback: unknown = null): Axis<string, unknown, unknown> {
  const members: string[] = isMemberList(spec) ? [...spec] : Object.keys(spec);
  const values: Record<string, unknown> = isMemberList(spec) ? Object.fromEntries(spec.map((m) => [m, m])) : { ...spec };
  return Object.freeze({ members: Object.freeze(members), values: Object.freeze(values), fallback });
}

function isMemberList(spec: readonly string[] | Record<string, unknown>): spec is readonly string[] {
  return Array.isArray(spec);
}

/**
 * Resolve an axis against a component's props: the value of the highest-precedence
 * member the props set (a member counts as set when its prop is truthy, as an `if`
 * reads it), or the axis's fallback when they set none. Every member must be a
 * boolean prop of the props type, so a table that names a prop the component does
 * not declare fails to compile where the component resolves it.
 */
export function pick<P extends object, M extends BooleanProps<P>, V, D>(a: Axis<M, V, D>, p: P): V | D {
  const props = p as Partial<Record<M, unknown>>;
  for (const member of a.members) if (props[member]) return a.values[member];
  return a.fallback;
}

/**
 * The measure axis (`MeasureProps` in sizing.ts): the steps of the width scale,
 * narrowest first, so the narrowest step passed wins and a stray wider step never
 * widens a deliberate narrow one. The members come from `widths` itself, in its
 * declaration order; no step is listed twice.
 */
export const MEASURE: Axis<WidthKey, WidthKey, null> = axis(Object.keys(widths) as WidthKey[]);
