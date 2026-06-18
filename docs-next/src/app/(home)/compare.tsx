import { Redirect } from "expo-router";

// /compare is a web-only QA harness (live renders beside captured platform reference
// imagery). Native has no reference imagery, so this route redirects home.
export default function CompareNative() {
  return <Redirect href="/" />;
}
