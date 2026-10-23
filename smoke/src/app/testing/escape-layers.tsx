import { useLocalSearchParams } from "expo-router";
import { Screen } from "../../app-frame/screen";
import { EscapeLayersBody } from "../../testing/escape-layers";

export default function EscapeLayersRoute() {
  const { scenario } = useLocalSearchParams<{ scenario?: string }>();
  return <Screen journey="/testing/escape-layers"><EscapeLayersBody key={scenario ?? "default"} scenario={scenario} /></Screen>;
}
