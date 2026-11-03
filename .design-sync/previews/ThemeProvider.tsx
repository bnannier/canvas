import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Column, Row, ThemeProvider, Typography } from "@nannier/canvas";

const Deploy = () => (
  <Card>
    <CardHeader>
      <CardTitle>Production deploy</CardTitle>
      <CardDescription>Release 4.1.0 is ready to roll out to all regions.</CardDescription>
    </CardHeader>
    <CardContent>
      <Column cozy>
        <Badge>Ready</Badge>
        <Row cozy>
          <Button primary>Roll out</Button>
          <Button outline>Review diff</Button>
        </Row>
      </Column>
    </CardContent>
  </Card>
);

export const Light = () => (
  <ThemeProvider light>
    <Deploy />
  </ThemeProvider>
);

export const Dark = () => (
  <ThemeProvider dark>
    <Deploy />
  </ThemeProvider>
);

export const DarkRose = () => (
  <ThemeProvider dark rose>
    <Deploy />
  </ThemeProvider>
);

export const LightMint = () => (
  <ThemeProvider light mint>
    <Deploy />
  </ThemeProvider>
);

export const LightAmber = () => (
  <ThemeProvider light amber>
    <Column cozy>
      <Typography caption medium>Amber palette</Typography>
      <Deploy />
    </Column>
  </ThemeProvider>
);
