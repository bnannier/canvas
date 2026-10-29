import { Redirect, useLocalSearchParams } from "expo-router";
import { SECTION_ROOMS } from "../../../data/rooms";

// The section pages used to live at /sections/<id>; they are now /<id>
// (docs/src/app/(components)/[section].tsx). This route keeps old links working: with
// generateStaticParams the static export emits a page for each old address, and it
// redirects to the new one.
export async function generateStaticParams() {
  return SECTION_ROOMS.map((room) => ({ section: room.id }));
}

export default function LegacySectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  return <Redirect href={section ? (`/${section}` as never) : "/"} />;
}
