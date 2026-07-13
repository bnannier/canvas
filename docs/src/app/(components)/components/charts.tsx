import { Redirect } from "expo-router";

// The chart family used to share one /components/charts page; each chart type
// now has its own page in the Charts tier. Keep the old slug alive.
export default function ChartsRedirect() {
  return <Redirect href="/components/chart" />;
}
