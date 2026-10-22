import { useLocalSearchParams } from "expo-router";
import { Typography } from "@nannier-com/canvas";
import { Screen } from "../../app-frame/screen";
import { FormAutocompleteBody } from "../../testing/form-autocomplete";

export default function FormAutocompleteRoute() {
  const { scenario } = useLocalSearchParams<{ scenario?: string }>();
  return <Screen><Typography h2>Form and autocomplete</Typography><FormAutocompleteBody key={scenario ?? "default"} scenario={scenario} /></Screen>;
}
