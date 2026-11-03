import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Typography } from "@nannier/canvas";

export const Composition = () => (
  <Card>
    <CardHeader>
      <CardTitle>Team invitations</CardTitle>
      <CardDescription>Invite teammates to collaborate on Northwind.</CardDescription>
    </CardHeader>
    <CardContent>
      <Typography small>Three invitations are pending. Links expire after seven days.</Typography>
    </CardContent>
    <CardFooter>
      <Button primary small>Send reminder</Button>
      <Button ghost small>Revoke all</Button>
    </CardFooter>
  </Card>
);
