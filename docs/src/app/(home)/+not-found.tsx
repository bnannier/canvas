import { EmptyState } from "@nannier/canvas";
import { useRouter } from "expo-router";
import { Page } from "../../ui/page";

export default function NotFound() {
  const router = useRouter();
  return <Page><EmptyState title="Page not found" description="This page does not exist." actionLabel="Go home" onAction={() => router.replace("/")} /></Page>;
}
