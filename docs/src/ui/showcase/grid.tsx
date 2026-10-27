import { Children, isValidElement, type ReactNode } from "react";
import { Column, Divider, Grid, GridItem, Row, Typography } from "@nannier/canvas";
import { SHOWCASE, showcaseCard } from "../../data/showcase";
import type { SectionId } from "../../data/rooms";

// A section page's card grid and its Data subsections (`Canvas v4.0.0 <Section>.dc.html`).

/**
 * The hand-off's card grid, `repeat(auto-fit, minmax(<tile>px, 1fr))` 20 apart: the kit Grid,
 * container-measured, its rows stretched to equal height. A child whose `id` names a
 * full-width card in the manifest (`grid-column: 1 / -1`) takes the whole row, so a page
 * passes its ShowcaseCards as they are; anything else that should span the row goes in a
 * `GridItem full` of its own.
 */
export function ShowcaseGrid({ minTileWidth, children }: { minTileWidth: number; children: ReactNode }) {
  return (
    <Grid minTileWidth={minTileWidth} spacious>
      {Children.map(children, (child) => {
        const id = isValidElement<{ id?: unknown }>(child) && typeof child.props.id === "string" ? child.props.id : undefined;
        return id != null && showcaseCard(id)?.full ? <GridItem full>{child}</GridItem> : child;
      })}
    </Grid>
  );
}

/**
 * A Data subsection (the hand-off's `<div id="g-...">`): its display title with the mono list
 * of its components at the end of the line, over a hairline, then its cards. The title and
 * names are the manifest's for `id` unless given. A page sets its subsections a chapter
 * apart (`<Column chapter>`), the hand-off's 56 px above each title.
 */
export function ShowcaseGroup({ id, section = "data", title, names, children }: {
  id?: string;
  section?: SectionId;
  title?: string;
  names?: readonly string[];
  children?: ReactNode;
}) {
  const spec = id == null ? undefined : SHOWCASE[section].groups.find((group) => group.id === id);
  const heading = title ?? spec?.title ?? "";
  const list = names ?? spec?.names ?? [];
  return (
    <Column loose>
      <Column cozy>
        <Row between alignEnd wrap cozy>
          <Typography h3 level={2}>{heading}</Typography>
          {list.length > 0 ? <Typography caption mono subtle>{list.join(" · ")}</Typography> : null}
        </Row>
        <Divider />
      </Column>
      {children}
    </Column>
  );
}
