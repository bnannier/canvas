import { useLocalSearchParams } from "expo-router";
import { ListboxBody } from "../../../../../examples/starter/smoke/fixtures/listbox";
import { Page, PageHeader } from "../../../ui/page";

export default function ListboxFixture() {
  const { controlled } = useLocalSearchParams<{ controlled?: string }>();
  return (
    <Page>
      <PageHeader title="Listbox input checks" description={`${controlled === "true" ? "Controlled" : "Uncontrolled"} selection with named options and checkbox rows.`} />
      <ListboxBody controlled={controlled === "true"} />
    </Page>
  );
}
