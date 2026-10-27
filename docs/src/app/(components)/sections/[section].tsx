import { Redirect, useLocalSearchParams } from "expo-router";
import { Page, PageHeader } from "../../../ui/page";
import { CatGrid, type CatTile } from "../../../catalog/tile";
import { ATOMS_TILES } from "../../../catalog/atoms";
import { MOLECULES_TILES } from "../../../catalog/molecules";
import { ORGANISMS_TILES } from "../../../catalog/organisms";
import { CHARTS_TILES } from "../../../catalog/charts";
import { SECTION_ROOMS, getSectionRoom, type Room } from "../../../data/rooms";

// A section page (decision S7): the v4 hand-off's section title and lead over the catalog
// tiles of the section's components (the ones the components index shows, regrouped by
// the hand-off's rooms), so the pill's links land somewhere real before the full section
// pages (Phase 5) replace this body. A component without a catalog tile is left out.
export async function generateStaticParams() {
  return SECTION_ROOMS.map((room) => ({ section: room.id }));
}

const TILE_OF = new Map<string, CatTile>(
  [...ATOMS_TILES, ...MOLECULES_TILES, ...ORGANISMS_TILES, ...CHARTS_TILES].map((tile) => [tile.href, tile] as const),
);

function roomTiles(room: Room): CatTile[] {
  return room.items.flatMap((item) => {
    const tile = TILE_OF.get(item.href);
    return tile ? [tile] : [];
  });
}

export default function SectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const room = section ? getSectionRoom(section) : undefined;
  if (!room) return <Redirect href="/" />;
  return (
    <Page>
      <PageHeader title={room.title} description={room.lead} />
      <CatGrid tiles={roomTiles(room)} />
    </Page>
  );
}
