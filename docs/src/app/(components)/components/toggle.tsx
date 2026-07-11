import { Redirect } from "expo-router";

// Legacy slug: the Switch component used to document under /components/toggle.
export default function ToggleRedirect() {
  return <Redirect href="/components/switch" />;
}
