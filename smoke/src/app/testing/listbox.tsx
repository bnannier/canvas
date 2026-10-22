import { useLocalSearchParams } from "expo-router";
import { Typography } from "@nannier-com/canvas";
import { Screen } from "../../app-frame/screen";
import { ListboxBody } from "../../testing/listbox";

export default function ListboxRoute() {
  const { controlled, disabled } = useLocalSearchParams<{ controlled?: string; disabled?: string }>();
  return <Screen><Typography h2>Listbox input checks</Typography><ListboxBody key={`${controlled === "true"}:${disabled === "true"}`} controlled={controlled === "true"} disabled={disabled === "true"} /></Screen>;
}
