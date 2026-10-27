import { expect, test } from "bun:test";
import * as path from "node:path";
import { program } from "./extract-props.ts";
import { exportedTags, RELATED_CAP, relatedSlugs, scanSemantics, scanTokens } from "./scan-detail.ts";

const root = path.resolve(import.meta.dir, "../..");

test("semantics read every role a shell can set, its accessibilityState keys, its aria props and its touch-target helpers", () => {
  const shell = `
    import { useSeededMinTargetSlop } from "../../style/touch-target-seed.js";
    export { minTargetSlop } from "../../style/touch-target.js";
    export function Widget(props) {
      const target = useSeededMinTargetSlop(44, { height: 20 });
      const a11y = { accessibilityRole: "image" as const, "aria-hidden": true };
      return (
        <Pressable
          accessibilityRole={props.href ? "link" : props.plain ? "none" : "button"}
          role="img"
          accessibilityState={{ disabled: props.disabled, busy }}
          aria-expanded={props.expanded}
          hitSlop={target.hitSlop}
        />
      );
    }`;
  expect(scanSemantics([{ file: "widget.shared.tsx", text: shell }])).toEqual({
    roles: ["button", "image", "img", "link"],
    states: ["busy", "disabled"],
    aria: ["aria-expanded", "aria-hidden"],
    // A re-export is not a use: the shell meets the minimum through the seeded hook.
    touchTarget: ["hitSlop", "useSeededMinTargetSlop"],
  });
  expect(scanSemantics([{ file: "plain.tsx", text: "export const Plain = () => <View />;" }])).toEqual({ roles: [], states: [], aria: [], touchTarget: [] });
});

test("tokens are the ColorTokens roles a skin reads, whatever it calls its tokens", () => {
  const tokens = scanTokens(program(), [path.join(root, "src/atoms/button/button.styles.ts")]);
  for (const role of ["primary", "ring", "secondary", "destructive-foreground", "muted-foreground"]) expect(tokens).toContain(role);
  expect(tokens).toEqual([...tokens].sort());
  // A string that is not a token read (an intent name, a size) is never one.
  expect(tokens).not.toContain("ghost");
  expect(tokens).not.toContain("small");
});

test("a fence tag maps to the dir that exports it", () => {
  const tags = exportedTags(program(), [
    { dir: "layout", entry: path.join(root, "src/atoms/layout/layout.tsx") },
    { dir: "card", entry: path.join(root, "src/molecules/card/card.tsx") },
  ]);
  expect(tags.get("Row")).toBe("layout");
  expect(tags.get("Column")).toBe("layout");
  expect(tags.get("CardMedia")).toBe("card");
  // Types and factories are not tags.
  expect(tags.has("FlexProps")).toBe(false);
});

test("related components are the fences' components in first-use order, then the section's, without the page's own, capped", () => {
  const tags = new Map([["Row", "row-column"], ["Column", "row-column"], ["Button", "button"], ["Icon", "icon"], ["Avatar", "avatar"]]);
  const fences = ["<Row><Button iconLeft={<Icon plus />}>A</Button></Row>", "<Column><Avatar /><Unknown /></Column>"];
  expect(relatedSlugs("button", fences, tags, ["button", "switch", "icon"])).toEqual(["row-column", "icon", "avatar", "switch"]);
  const many = Array.from({ length: 20 }, (_, i) => `s${i}`);
  expect(relatedSlugs("button", [], tags, many)).toHaveLength(RELATED_CAP);
});
