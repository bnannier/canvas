import { Card, Column, Pressable, Typography } from "@nannier/canvas";

export const Tappable = () => (
  <Pressable accessibilityRole="button">
    <Card>
      <Column tight>
        <Typography semibold>Open the weekly report</Typography>
        <Typography small muted>Signups are up 12% on last week.</Typography>
      </Column>
    </Card>
  </Pressable>
);

export const Disabled = () => (
  <Pressable accessibilityRole="button" disabled>
    <Card>
      <Column tight>
        <Typography semibold>Export to CSV</Typography>
        <Typography small muted>Unavailable until the report finishes generating.</Typography>
      </Column>
    </Card>
  </Pressable>
);

export const RenderProp = () => (
  <Pressable accessibilityRole="button">
    {({ pressed }) => (
      <Typography small semibold>{pressed ? "Pressed" : "Press and hold"}</Typography>
    )}
  </Pressable>
);
