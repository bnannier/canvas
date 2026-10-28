import { Page } from "../../ui/page";
import { SectionHero } from "../../ui/showcase";
import { Cards, Vignette } from "../../sections/skins";
import { SKINS_PAGE } from "../../data/rooms";

// The hand-off's Skins page (`Canvas v4.0.0 Skins.dc.html`): the hero (its title, lead and
// paragraph beside the still vignette) over the three device columns, each rendering the
// same tree through one platform's kit skins (docs/src/sections/skins.tsx).
export default function SkinsScreen() {
  return (
    <Page>
      <SectionHero room={SKINS_PAGE} vignette={<Vignette />} />
      <Cards />
    </Page>
  );
}
