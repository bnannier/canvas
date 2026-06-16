import { Redirect } from "expo-router";

// The Sidebar component documents under the "navigation" slug.
export default function SidebarRedirect() {
  return <Redirect href="/components/navigation" />;
}
