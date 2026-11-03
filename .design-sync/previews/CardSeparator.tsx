import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardMedia, CardSeparator, CardTitle, Icon } from "@nannier/canvas";

export const Composition = () => (
  <Card flush>
    <CardMedia compact>
      <Icon sparkles size={32} />
    </CardMedia>
    <CardSeparator />
    <CardContent>
      <CardTitle>Release 4.1</CardTitle>
      <CardDescription>New Feed trace rows and a reorderable StackedList.</CardDescription>
    </CardContent>
    <CardSeparator />
    <CardFooter>
      <Badge soft>Stable</Badge>
      <Button small outline>Read notes</Button>
    </CardFooter>
  </Card>
);
