// Compile-time checks of the axis primitive's types (src/style/axis.ts), run by
// `bun run typecheck` through tools/axes/tsconfig.json; nothing here executes. Each
// `@ts-expect-error` line is a table the compiler must refuse, so a loosened signature
// fails the typecheck instead of letting a misspelled member through.

import { axis, pick, type MemberOf, type ResolvedOf } from "../../src/style/axis.ts";

interface Props {
  small?: boolean;
  large?: boolean;
  label?: string;
  children?: unknown;
}
const props: Props = {};

const SIZE = axis(["small", "large"], "base");
const PX = axis({ small: 96, large: 200 }, 140);

// A member resolves to itself, the fallback to its own literal.
export const size: "small" | "large" | "base" = pick(SIZE, props);
// A valued axis resolves to its values or the fallback.
export const px: 96 | 200 | 140 = pick(PX, props);
// The helper types read the same.
export const member: MemberOf<typeof SIZE> = "large";
export const resolved: ResolvedOf<typeof PX> = 140;

// @ts-expect-error a member the props do not declare
pick(axis(["small", "huge"]), props);
// @ts-expect-error a member that is a string prop, not a boolean
pick(axis(["label"]), props);
// @ts-expect-error a member typed as anything but a boolean
pick(axis(["children"]), props);
