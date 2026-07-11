import { Redirect } from "expo-router";

// Legacy slug: the Sidebar component used to document under /components/navigation.
export default function NavigationRedirect() {
  return <Redirect href="/components/sidebar" />;
}
