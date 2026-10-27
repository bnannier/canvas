import { Page, PageHeader } from "../../../ui/page";
import { CatGrid } from "../../../catalog/tile";
import { TEMPLATES_TILES } from "../../../catalog/templates";
import { TEMPLATES_PAGE } from "../../../data/rooms";

// The Templates index, the pill's tenth link: every template's catalog tile, until the
// hand-off's Templates page (Phase 7) replaces this body.
export default function TemplatesScreen() {
  return (
    <Page>
      <PageHeader title={TEMPLATES_PAGE.title} description={TEMPLATES_PAGE.lead} />
      <CatGrid tiles={[...TEMPLATES_TILES]} />
    </Page>
  );
}
