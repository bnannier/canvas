import type { ReactNode } from "react";
import { useRouter } from "expo-router";
import { Card, Chip, Column, Grid, Icon, Row, Typography } from "@nannier/canvas";
import { getComponent } from "../../core/data/components";
import { showcaseCard } from "../../data/showcase";

// A section page's card (the hand-off's `<div id="c-...">` in `Canvas v4.0.0 <Section>.dc.html`):
// the kit Card with a 24 px inset and its parts 20 apart, the 11 px mono header row (title
// left, meta right), a row of link chips to the components the card shows, the live
// composition, and the mono JSX caption pinned to the card's foot. The header and the chips
// come from the hand-off's card manifest (docs/src/data/showcase.ts) by the card's id; a
// prop given here wins. A specimen card (one the hand-off draws with no header row) takes no
// title or meta, so it shows its chips over its body.

/** The route of a component's detail page. */
const componentHref = (slug: string) => `/components/${slug}`;

/** A component chip: a link to the component's page, routed on the client. */
function ComponentChip({ slug }: { slug: string }) {
  const router = useRouter();
  const href = componentHref(slug);
  return (
    <Chip
      outline
      href={href}
      onPress={(event) => {
        // The chip is an anchor on the web: route on the client instead of loading the page.
        event?.preventDefault();
        router.push(href as never);
      }}
      trailing={<Icon arrowUpRight size={12} decorative />}
    >
      {getComponent(slug)?.name ?? slug}
    </Chip>
  );
}

export interface ShowcaseCardProps {
  /** The hand-off's card id (`c-button`); the card's test id is `showcase-<id>`. */
  id: string;
  /** The header's left label; the manifest's by default. */
  title?: string;
  /** The header's right label; the manifest's by default. */
  meta?: string;
  /** The components the chips link to, by URL slug; the manifest's by default. */
  links?: readonly string[];
  /** The mono line at the card's foot, usually the JSX the card demonstrates. */
  caption?: ReactNode;
  /**
   * The hand-off's split card (`c-chart`): no header row, and the chips take the first cell
   * of a grid whose other cells are the children (each carrying its own header), 320 px
   * tiles 32 apart.
   */
  split?: boolean;
  children?: ReactNode;
}

export function ShowcaseCard({ id, title, meta, links, caption, split, children }: ShowcaseCardProps) {
  const spec = showcaseCard(id);
  const head = { title: title ?? spec?.title, meta: meta ?? spec?.meta };
  const chips = links ?? spec?.links ?? [];
  if (split) {
    return (
      <Card flush testID={`showcase-${id}`}>
        <Column padLoose>
          <Grid minTileWidth={320} apart>
            <Row wrap compact>
              {chips.map((slug) => <ComponentChip key={slug} slug={slug} />)}
            </Row>
            {children}
          </Grid>
        </Column>
      </Card>
    );
  }
  return (
    <Card flush testID={`showcase-${id}`}>
      <Column padLoose spacious grow>
        {head.title != null || head.meta != null || chips.length > 0 ? (
          <Column roomy>
            {head.title != null || head.meta != null ? (
              // Both lines shrink and wrap when the row runs out of room, as the hand-off's
              // flex items do; a React Native box would otherwise keep its text's width.
              <Row between cozy alignStart>
                <Column shrink><Typography eyebrow subtle>{head.title ?? ""}</Typography></Column>
                {head.meta != null ? <Column shrink><Typography eyebrow subtle right>{head.meta}</Typography></Column> : null}
              </Row>
            ) : null}
            {chips.length > 0 ? (
              <Row wrap compact>
                {chips.map((slug) => <ComponentChip key={slug} slug={slug} />)}
              </Row>
            ) : null}
          </Column>
        ) : null}
        <Column grow spacious>{children}</Column>
        {caption != null ? <Typography caption mono subtle>{caption}</Typography> : null}
      </Column>
    </Card>
  );
}
