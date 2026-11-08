import { FlowEditorBody } from "../../../../../smoke/src/testing/flow-editor";
import { Page, PageHeader } from "../../../ui/page";

export default function FlowEditorFixture() {
  return (
    <Page>
      <PageHeader title="FlowEditor checks" description="A stateful graph: drag, connect, add, delete, pan and zoom, with the events read back." />
      <FlowEditorBody />
    </Page>
  );
}
