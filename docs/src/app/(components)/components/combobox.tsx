import { Redirect } from "expo-router";

// Legacy slug: the searchable single-select used to document under
// /components/combobox before it was renamed Combobox → Autocomplete.
export default function ComboboxRedirect() {
  return <Redirect href="/components/autocomplete" />;
}
