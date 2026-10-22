import { useRouter } from "expo-router";
import { Card, Column, Grid, Typography } from "@nannier/canvas";
import { Screen } from "../app-frame/screen";
import { JOURNEYS } from "../catalog/journeys";

export default function SmokeHome() {
  const router = useRouter();
  return (
    <Screen>
      <Column tight>
        <Typography h1>Canvas Smoke Test</Typography>
        <Typography muted>Every screen here runs against the installed Canvas package. Open the menu for the full list.</Typography>
      </Column>
      <Typography h2>Journeys</Typography>
      <Grid minTileWidth={260} relaxed>
        {JOURNEYS.map((journey) => (
          <Card key={journey.route} title={journey.title} description={journey.description} onPress={() => router.navigate(journey.route)} />
        ))}
      </Grid>
    </Screen>
  );
}
