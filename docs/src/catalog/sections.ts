import { SECTION_ROOMS } from "../data/rooms";

/** File previews under the same v4 rooms as the section pages and navigation. */
export function catalogSections<T extends { href: string }>(tiles: readonly T[]) {
  const tileOf = new Map(tiles.map((tile) => [tile.href, tile] as const));
  return SECTION_ROOMS.map((room) => {
    const previews = room.items.flatMap((item) => {
      const tile = tileOf.get(item.href);
      return tile ? [tile] : [];
    });
    return {
      id: room.id,
      label: room.title,
      href: room.href!,
      count: room.items.length,
      noun: "components",
      summary: `${room.items.length} components · ${previews.length} previews`,
      tiles: previews,
    };
  });
}
