import { useRouter } from "expo-router";
import { Button, Column, Typography } from "@nannier/canvas";
import { Screen } from "../app-frame/screen";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <Screen>
      <Column relaxed>
        <Typography h1>Page not found</Typography>
        <Typography muted>This screen is not part of the smoke test.</Typography>
        <Button primary onPress={() => router.replace("/")}>Back to the smoke test</Button>
      </Column>
    </Screen>
  );
}
