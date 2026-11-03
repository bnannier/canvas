import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, OverlayProvider, Tooltip } from "@nannier/canvas";

export const Hosting = () => (
  <OverlayProvider viewport>
    <Card>
      <CardHeader>
        <CardTitle>Invite teammates</CardTitle>
        <CardDescription>Overlays inside this provider are positioned within it.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tooltip content="Sends an email invitation">
          <Button primary>Invite</Button>
        </Tooltip>
      </CardContent>
    </Card>
  </OverlayProvider>
);
