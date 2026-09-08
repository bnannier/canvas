import { useLocalSearchParams } from "expo-router";
import { Typography } from "@nannier-com/canvas";
import { Screen } from "../../app-frame/screen";
import { ListboxBody } from "../../testing/listbox";

export default function ListboxRoute() {
  const { controlled } = useLocalSearchParams<{ controlled?: string }>();
  return <Screen><Typography h2>Listbox input checks</Typography><ListboxBody controlled={controlled === "true"} /></Screen>;
}
