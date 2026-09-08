import { ControlRefsBody } from "../../../../../examples/starter/smoke/fixtures/control-refs";
import { Page, PageHeader } from "../../../ui/page";

export default function ControlRefsFixture() {
  return (
    <Page>
      <PageHeader title="Control refs" description="Request focus on each control's interactive host without activating it." />
      <ControlRefsBody />
    </Page>
  );
}
