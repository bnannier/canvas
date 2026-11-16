import { type ReactNode } from "react";
import { Button, Card, Column, Divider, Grid, GridItem, Icon, Row, Typography } from "@nannier/canvas";
import { useRouter } from "expo-router";

export type CatTile = { title: string; href: string; span?: boolean; Preview: () => ReactNode };

// The preview remains interactive; only its reference link navigates. Keeping
// that link outside the preview avoids nesting buttons, fields or links.
export function Tile({ tile }: { tile: CatTile }) {
  const router = useRouter();
  const Preview = tile.Preview;
  return (
    <Card grow>
      <Button link href={tile.href} onPress={(event) => { event.preventDefault(); router.push(tile.href as never); }} iconRight={<Icon arrowRight size={16} />}>
        {tile.title}
      </Button>
      <Divider />
      <Preview />
    </Card>
  );
}

export function CatGrid({ tiles }: { tiles: CatTile[] }) {
  return (
    <Grid minTileWidth={320} columns={3} relaxed>
      {tiles.map((tile) => tile.span ? (
        <GridItem wide key={tile.href}><Tile tile={tile} /></GridItem>
      ) : <Tile key={tile.href} tile={tile} />)}
    </Grid>
  );
}

// A category is a section of the catalog page, so its name is the h2 under the page's
// h1: an h3 here skips a level for every heading reader and outline.
export function CatGroup({ label, href, summary, tiles }: { label: string; href?: string; summary: string; tiles: CatTile[] }) {
  const router = useRouter();
  return (
    <Column relaxed>
      <Row between baseline wrap>
        <Typography h2>{label}</Typography>
        {href ? <Button link small href={href} accessibilityLabel={`Browse ${label}: ${summary}`} onPress={(event) => { event.preventDefault(); router.push(href as never); }} iconRight={<Icon arrowRight size={16} />}>
          {summary}
        </Button> : <Typography small muted>{summary}</Typography>}
      </Row>
      <CatGrid tiles={tiles} />
    </Column>
  );
}

export function CatSubBar({ categories, total }: { categories: { label: string; href?: string; count: number; noun: string }[]; total: number }) {
  const router = useRouter();
  return (
    <Column cozy>
      <Row between alignCenter stacks stackBreakpoint="sm">
        <Column fill><Row wrap snug>{categories.flatMap(({ label, href, count, noun }) => href ? [<Button outline small key={href} href={href} accessibilityLabel={`Browse ${label}, ${count} ${noun}`} onPress={(event) => { event.preventDefault(); router.push(href as never); }}>{label} {count}</Button>] : [])}</Row></Column>
        <Typography small muted>{total} components</Typography>
      </Row>
      <Divider />
    </Column>
  );
}
