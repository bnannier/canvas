import { type ReactNode } from "react";
import { Badge, BadgeGroup, Button, Card, Column, Divider, Grid, GridItem, Icon, Row, Typography } from "@nannier/canvas";
import { useRouter } from "expo-router";

export type CatTile = { title: string; href: string; span?: boolean; Preview: () => ReactNode };

// The preview remains interactive; only its reference link navigates. Keeping
// that link outside the preview avoids nesting buttons, fields or links.
export function Tile({ tile }: { tile: CatTile }) {
  const router = useRouter();
  const Preview = tile.Preview;
  return (
    <Card grow>
      <Button link href={tile.href} onPress={() => router.push(tile.href as never)} iconRight={<Icon arrowRight size={16} />}>
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

export function CatGroup({ label, count, tiles }: { label: string; count: number; tiles: CatTile[] }) {
  return (
    <Column relaxed>
      <Row between baseline wrap>
        <Typography h3>{label}</Typography>
        <Typography small muted>{count} components</Typography>
      </Row>
      <CatGrid tiles={tiles} />
    </Column>
  );
}

export function CatSubBar({ categories, total }: { categories: string[]; total: number }) {
  return (
    <Column cozy>
      <Row between alignCenter wrap>
        <BadgeGroup>{categories.map((category) => <Badge outline key={category}>{category}</Badge>)}</BadgeGroup>
        <Typography small muted>{total} components</Typography>
      </Row>
      <Divider />
    </Column>
  );
}
