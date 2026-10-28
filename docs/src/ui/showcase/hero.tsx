import type { ReactNode } from "react";
import { Card, Column, Container, Row, Typography } from "@nannier/canvas";
import type { Room } from "../../data/rooms";
import { DocsHead } from "../docs-head";
import { InlineMarkdown } from "../prose";
import { DotGrid } from "../detail/frame";

// A section page's hero (`Canvas v4.0.0 <Section>.dc.html`, its first grid): the room's
// title, its lead and the paragraph under it on the left, the section's vignette on the
// right, side by side until the hero's own width runs out and then stacked. The vignette is
// a still frame (decision P5-V): the hand-off's `<cv-hero>` loops are motion the owner
// removed, so it shows live kit components in the reference image's state.

export function SectionHero({ room, vignette }: { room: Pick<Room, "title" | "lead" | "body">; vignette: ReactNode }) {
  return (
    // No cross-axis alignment: a stacked Row keeps its alignment, and a centred column would
    // hug the vignette instead of giving it the full width, so side by side the text sits
    // at the top of the row where the hand-off centres it.
    <Row stacks stackBreakpoint="md" panel>
      <Column span={6}>
        <Container xxl start>
          <Column cozy>
            <DocsHead title={room.title} />
            <Typography h1>{room.title}</Typography>
            <Typography lead>{room.lead}</Typography>
            {room.body ? <Typography subtle><InlineMarkdown text={room.body} subtle /></Typography> : null}
          </Column>
        </Container>
      </Column>
      <Column span={6}>{vignette}</Column>
    </Row>
  );
}

/**
 * The vignette's stage (the hand-off's `.st`): a raised card clipped to its corner over the
 * dotted staging ground, its composition centred in it.
 */
export function VignetteStage({ children, testID }: { children: ReactNode; testID?: string }) {
  return (
    <Card raised flush clip testID={testID}>
      <DotGrid />
      <Column padLoose center alignCenter>
        <Container sm>{children}</Container>
      </Column>
    </Card>
  );
}
