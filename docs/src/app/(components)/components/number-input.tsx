import { Redirect } from "expo-router";

// Legacy slug: the ± numeric control used to document under /components/number-input
// before it was renamed NumberInput → Stepper.
export default function NumberInputRedirect() {
  return <Redirect href="/components/stepper" />;
}
