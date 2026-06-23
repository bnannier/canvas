import { TabShell } from "../../shell/tab-shell";

// Thin Expo Router glue: the Search tab delegates to the shared TabShell (a native Stack
// whose nav bar hosts the search field), like the other tabs.
export default function SearchTabLayout() {
  return <TabShell section="search" />;
}
