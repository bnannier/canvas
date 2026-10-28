import { EmptyState } from "@nannier/canvas";
import { useRouter } from "expo-router";
import { Page } from "../../ui/page";

export default function NotFound() {
  const router = useRouter();
  // Back to the library home: popped to when it is already below this screen in the native
  // stack (where a replace to it does nothing), put in this screen's place otherwise.
  return <Page><EmptyState title="Page not found" description="This page does not exist." actionLabel="Go home" onAction={() => router.dismissTo("/")} /></Page>;
}
