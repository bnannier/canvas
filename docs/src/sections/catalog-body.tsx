import { Column, Typography } from "@nannier/canvas";
import { CatGrid, type CatTile } from "../catalog/tile";
import { ATOMS_TILES } from "../catalog/atoms";
import { MOLECULES_TILES } from "../catalog/molecules";
import { ORGANISMS_TILES } from "../catalog/organisms";
import { CHARTS_TILES } from "../catalog/charts";
import { getSectionRoom, type SectionId } from "../data/rooms";

// The body a section page showed before its showcase cards landed (decision S7): the catalog
// tiles of the section's components, regrouped by the hand-off's rooms. A section whose
// cards have not landed yet renders this under its hero; a component without a catalog tile
// is left out. The tiles sit under their own h2, so a tile whose preview holds a heading
// (the Card tile's h3 figure) follows the page's outline.

const TILE_OF = new Map<string, CatTile>(
  [...ATOMS_TILES, ...MOLECULES_TILES, ...ORGANISMS_TILES, ...CHARTS_TILES].map((tile) => [tile.href, tile] as const),
);

export function CatalogBody({ section }: { section: SectionId }) {
  const room = getSectionRoom(section);
  const tiles = (room?.items ?? []).flatMap((item) => {
    const tile = TILE_OF.get(item.href);
    return tile ? [tile] : [];
  });
  return (
    <Column relaxed>
      <Typography h3 level={2}>Components</Typography>
      <CatGrid tiles={tiles} />
    </Column>
  );
}
