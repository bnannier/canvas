import { useLocalSearchParams } from "expo-router";
import { Screen } from "../../app-frame/screen";
import { ListboxBody } from "../../testing/listbox";

export default function ListboxRoute() {
  const { controlled, disabled } = useLocalSearchParams<{ controlled?: string; disabled?: string }>();
  return <Screen journey="/testing/listbox"><ListboxBody key={`${controlled === "true"}:${disabled === "true"}`} controlled={controlled === "true"} disabled={disabled === "true"} /></Screen>;
}
