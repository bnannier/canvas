import { useLocalSearchParams, useRouter } from "expo-router";
import { Card, Column, Grid, Typography } from "@nannier/canvas";
import { Screen } from "../../app-frame/screen";
import { CATALOG } from "../../catalog/components";

// Every documented component of one tier (or all of them), each opening its examples.
export default function ComponentsIndex() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const groups = CATALOG.filter((group) => !category || group.category === category);
  return (
    <Screen>
      <Typography h1>{category ?? "Components"}</Typography>
      {groups.map((group) => (
        <Column key={group.category} relaxed>
          {category ? null : <Typography h2>{group.category}</Typography>}
          <Grid minTileWidth={200} relaxed>
            {group.components.map((component) => (
              <Card key={component.slug} title={component.name} onPress={() => router.navigate(`/components/${component.slug}`)} />
            ))}
          </Grid>
        </Column>
      ))}
    </Screen>
  );
}
