import { useLocalSearchParams } from "expo-router";
import { Screen } from "../../app-frame/screen";
import { FormAutocompleteBody } from "../../testing/form-autocomplete";

export default function FormAutocompleteRoute() {
  const { scenario } = useLocalSearchParams<{ scenario?: string }>();
  return <Screen journey="/testing/form-autocomplete"><FormAutocompleteBody key={scenario ?? "default"} scenario={scenario} /></Screen>;
}
