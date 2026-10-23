import { useLocalSearchParams } from "expo-router";
import { Screen } from "../../app-frame/screen";
import { TabsBody } from "../../testing/tabs";

export default function TabsRoute() {
  const { disabled } = useLocalSearchParams<{ disabled?: string }>();
  return <Screen journey="/testing/tabs"><TabsBody key={String(disabled === "true")} disabled={disabled === "true"} /></Screen>;
}
