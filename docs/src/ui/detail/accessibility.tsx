import type { Ref } from "react";
import { PLATFORM_COPY } from "../../data/platform-copy";
import { View, Grid, Card, Column, Row, Typography, Badge, Kbd, DescriptionList, Icon } from "@nannier/canvas";
import { KEYBOARD_PATTERNS, type KeyboardPatternKey } from "../../core/data/detail-specs";
import type { DocProse, DocSemantics } from "../../core/scope";
import { Prose } from "../prose";
import { DetailSection } from "./frame";

// The detail page's Accessibility and keyboard (Component.dc.html `#cv-a11y`): the keys
// the component's pattern answers, what its shell tells assistive tech (the roles, states
// and ARIA scanned from source), the touch-target note for a control, and the .md's own
// Accessibility section under them.

/** The patterns a pressable control follows, whose touch area grows to the platform minimum. */
const TOUCH_PATTERNS: ReadonlySet<KeyboardPatternKey> = new Set(["button", "toggle", "radio", "slider", "spin", "tabs", "menu", "link", "listbox", "combobox", "carousel"]);

/** "ArrowDown · ArrowRight" as one keycap per alternative. */
function Keys({ keys }: { keys: string }) {
  return (
    <Row wrap tight alignCenter>
      {keys.split(" · ").map((key) => <Kbd key={key}>{key}</Kbd>)}
    </Row>
  );
}

function Values({ values }: { values: readonly string[] }) {
  return (
    <Row wrap compact>
      {values.map((v) => <Badge key={v} mono small>{v}</Badge>)}
    </Row>
  );
}

export function AccessibilitySection({ keyboard, semantics, notes, sectionRef }: {
  keyboard: KeyboardPatternKey;
  semantics: DocSemantics;
  /** The .md's own Accessibility section, shown as "From the docs". */
  notes?: DocProse[];
  sectionRef?: Ref<View>;
}) {
  const keys = KEYBOARD_PATTERNS[keyboard];
  const sem = ([["Roles", semantics.roles], ["States", semantics.states], ["ARIA on web", semantics.aria]] as const).filter(([, v]) => v.length > 0);
  return (
    <DetailSection id="a11y" title="Accessibility and keyboard" sectionRef={sectionRef}>
      <Grid minTileWidth={320} columns={2} roomy>
        {/* The hand-off's accessibility cards (lines 256 and 262): `padding:18px;border:1px
            solid var(--ln);border-radius:18px;background:var(--sf);...;gap:12px`, no shadow; their
            label is the page label in the subtle ink, not the Card's accent eyebrow. */}
        <Card panel largeCorners outlined>
          <Typography pageLabel mono>Keyboard</Typography>
          {keys.length ? (
            <DescriptionList twoColumn divided items={keys.map(([k, effect]) => ({ term: <Keys keys={k} />, value: effect }))} />
          ) : (
            <Typography small subtle>Not focusable. It has no interaction of its own and takes the semantics of what it wraps.</Typography>
          )}
        </Card>
        <Card panel largeCorners outlined>
          <Typography pageLabel mono>Semantics</Typography>
          <Column cozy>
            {sem.length ? (
              <DescriptionList twoColumn divided items={sem.map(([label, values]) => ({ term: label, value: <Values values={values} /> }))} />
            ) : (
              <Typography small subtle>No role of its own in source; it reads as the content it renders.</Typography>
            )}
            {TOUCH_PATTERNS.has(keyboard) ? (
              <Row snug alignStart>
                <Icon smartphone primary size={15} decorative />
                <Column fill>
                  <Typography small subtle>{PLATFORM_COPY.touchNote}</Typography>
                </Column>
              </Row>
            ) : null}
          </Column>
        </Card>
      </Grid>
      {notes?.length ? (
        // The hand-off's "From the docs" card (line 269): `padding:18px 20px;border:1px solid
        // var(--ln);border-radius:18px;background:var(--sf2);...;gap:10px`, no shadow: `flat`
        // is the sf2 fill under the hairline with no shadow; its prose is the page note role.
        <Card guide largeCorners flat>
          <Typography pageLabel mono>From the docs</Typography>
          <Prose blocks={notes} pageNote />
        </Card>
      ) : null}
    </DetailSection>
  );
}
