import { useLocalSearchParams } from "expo-router";
import { ListboxBody } from "../../../../../examples/starter/smoke/fixtures/listbox";
import { Page, PageHeader } from "../../../ui/page";

export default function ListboxFixture() {
  const { controlled, disabled } = useLocalSearchParams<{ controlled?: string; disabled?: string }>();
  return (
    <Page>
      <PageHeader title="Listbox input checks" description={`${controlled === "true" ? "Controlled" : "Uncontrolled"} selection with named options and checkbox rows.`} />
      <ListboxBody key={`${controlled === "true"}:${disabled === "true"}`} controlled={controlled === "true"} disabled={disabled === "true"} />
    </Page>
  );
}
