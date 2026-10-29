import { Redirect, useLocalSearchParams } from "expo-router";
import { Page } from "../../ui/page";
import { SectionHero } from "../../ui/showcase";
import { SECTION_PAGES } from "../../sections";
import { SECTION_ROOMS, getSectionRoom, type SectionId } from "../../data/rooms";

// A section page (`Canvas v4.0.0 <Section>.dc.html`): the hero (the room's title, lead and
// paragraph beside the section's still vignette) over the section's cards, each section
// built in its own module (docs/src/sections).
export async function generateStaticParams() {
  return SECTION_ROOMS.map((room) => ({ section: room.id }));
}

export default function SectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const room = section ? getSectionRoom(section) : undefined;
  if (!room) return <Redirect href="/" />;
  const { Vignette, Cards } = SECTION_PAGES[room.id as SectionId];
  return (
    <Page>
      <SectionHero room={room} vignette={<Vignette />} />
      <Cards />
    </Page>
  );
}
