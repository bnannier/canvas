import { useRouter } from "expo-router";
import { Button, Column, Typography } from "@nannier-com/canvas";
import { Screen } from "../app-frame/screen";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <Screen>
      <Column relaxed>
        <Typography h1>Page not found</Typography>
        <Typography muted>This page is not available. Your workspace is still here.</Typography>
        <Button primary onPress={() => router.replace("/")}>Back to workspace</Button>
      </Column>
    </Screen>
  );
}
