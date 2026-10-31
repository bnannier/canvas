import { EmptyState } from "@nannier/canvas";
import { useRouter } from "expo-router";
import { Page } from "./page";

/** Shared by unmatched URLs and dynamic section names outside the published rooms. */
export function NotFoundPage() {
  const router = useRouter();
  // Pop back to home when it is already in the native stack; replace otherwise.
  return <Page><EmptyState title="Page not found" description="This page does not exist." actionLabel="Go home" onAction={() => router.dismissTo("/")} /></Page>;
}
