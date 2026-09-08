import { useLocalSearchParams } from "expo-router";
import { Typography } from "@nannier-com/canvas";
import { Screen } from "../../app-frame/screen";
import { EscapeLayersBody } from "../../testing/escape-layers";

export default function EscapeLayersRoute() {
  const { scenario } = useLocalSearchParams<{ scenario?: string }>();
  return <Screen><Typography h2>Overlay keyboard checks</Typography><EscapeLayersBody scenario={scenario} /></Screen>;
}
