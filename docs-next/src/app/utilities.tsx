import { Redirect } from "expo-router";

// Legacy /utilities path now lives under /tokens/layout.
export default function UtilitiesRedirect() {
  return <Redirect href="/tokens/layout" />;
}
