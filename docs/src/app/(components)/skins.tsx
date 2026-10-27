import { Typography } from "@nannier/canvas";
import { Page, PageHeader } from "../../ui/page";
import { SKINS_PAGE } from "../../data/rooms";

// The hand-off's Skins page, a stub until Phase 7 (decision S7): its title and lead, so
// the pill's link lands on a real page.
export default function SkinsScreen() {
  return (
    <Page>
      <PageHeader title={SKINS_PAGE.title} description={SKINS_PAGE.lead} />
      <Typography subtle>
        Every component page shows its web, iOS and Android skins side by side; this page gathers them in Phase 7.
      </Typography>
    </Page>
  );
}
