import { useLocalSearchParams } from "expo-router";
import { Typography } from "@nannier-com/canvas";
import { Screen } from "../../app-frame/screen";
import { TabsBody } from "../../testing/tabs";

export default function TabsRoute() {
  const { disabled } = useLocalSearchParams<{ disabled?: string }>();
  return <Screen><Typography h2>Tabs input checks</Typography><TabsBody key={String(disabled === "true")} disabled={disabled === "true"} /></Screen>;
}
