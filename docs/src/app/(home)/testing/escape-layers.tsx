import { useLocalSearchParams } from "expo-router";
import { EscapeLayersBody } from "../../../../../smoke/src/testing/escape-layers";
import { Page, PageHeader } from "../../../ui/page";

export default function EscapeLayersFixture() {
  const { scenario } = useLocalSearchParams<{ scenario?: string }>();
  return (
    <Page>
      <PageHeader title="Overlay keyboard checks" description="Escape closes one layer at a time." />
      <EscapeLayersBody key={scenario ?? "default"} scenario={scenario} />
    </Page>
  );
}
