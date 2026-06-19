import { Redirect } from "expo-router";

// Search has no dedicated screen anymore: the web shell uses the cmd-K modal and native
// uses the nav bar's integrated search field (see NativeHeader). A stray /search deep link
// just redirects home on every platform, mirroring compare.tsx.
export default function SearchScreen() {
  return <Redirect href="/" />;
}
