import { useState } from "react";
import { Button, Card, Column, Field, Grid, Input, Kbd, Row, Skeleton, ThemeProvider, Typography, useTheme, useToast } from "@nannier/canvas";
import type { CatTile } from "./tile";

function AccessibilityPreview() {
  const { toast } = useToast();
  return (
    <Column snug>
      <Button primary onPress={() => toast({ message: "Keyboard action activated" })}>Focus and activate</Button>
      <Row snug alignCenter wrap><Kbd>Tab</Kbd><Typography small muted>Move focus to the button</Typography></Row>
    </Column>
  );
}

function DensityPreview() {
  return (
    <Column snug>
      <Card compact><Typography small>Compact</Typography></Card>
      <Card><Typography small>Regular</Typography></Card>
      <Card comfortable><Typography small>Comfortable</Typography></Card>
    </Column>
  );
}

function FormValidationPreview() {
  const [email, setEmail] = useState("not-an-email");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return <Field label="Email" error={valid ? undefined : "Enter a valid email address."} helper="Email looks good."><Input value={email} onChangeText={setEmail} /></Field>;
}

function GlassSurfacePreview() {
  const { dark, tokens } = useTheme();
  return <ThemeProvider glass dark={dark} light={!dark} tokens={tokens}><Card><Typography small muted>Active sessions</Typography><Typography h3>1,204</Typography></Card></ThemeProvider>;
}

function LoadingPreview() {
  return <Column relaxed><Button primary loading>Saving…</Button><Skeleton list animate accessibilityLabel="Loading activity" /></Column>;
}

function ResponsivePreview() {
  return <Grid minTileWidth={120} columns={2} snug><Card compact><Typography small>First item</Typography></Card><Card compact><Typography small>Second item</Typography></Card></Grid>;
}

export const PATTERNS_TILES: CatTile[] = [
  { title: "Accessibility", href: "/patterns/accessibility", Preview: AccessibilityPreview },
  { title: "Density", href: "/patterns/density", Preview: DensityPreview },
  { title: "Form Validation", href: "/patterns/form-validation", Preview: FormValidationPreview },
  { title: "Glass Surface", href: "/patterns/glass", Preview: GlassSurfacePreview },
  { title: "Loading", href: "/patterns/loading", Preview: LoadingPreview },
  { title: "Responsive", href: "/patterns/responsive", Preview: ResponsivePreview },
];
