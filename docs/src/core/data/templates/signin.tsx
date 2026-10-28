import { useState } from "react";
import type { TemplateDoc, TemplateScreenProps } from "../types";

// The hand-off's Sign in (`Canvas v4.0.0 Templates.dc.html`, `t.signin`): on the web a
// split screen, the customer quote over the brand panel beside the form; on a phone the
// form alone. The form switches between a password and a magic link, then offers passkey
// and SSO. Every part is a kit component from the frame's scope. The company is the
// fictional Riskora, never Canvas itself, so the screen never reads as this app's own
// sign-in wall.

const MODES = ["Password", "Magic link"];

function SigninScreen({ K, phone, go }: TemplateScreenProps) {
  const { Row, Column, Container, Card, Typography, Button, ButtonGroup, Input, Divider, Grid, Avatar, Icon, useToast } = K;
  const { toast } = useToast();
  const [mode, setMode] = useState(0);
  const password = mode === 0;

  const form = (
    <Row center alignCenter grow>
      <Container sm>
        <Column relaxed>
          <Row>
            <Avatar logo initials="Rk" accessibilityLabel="Riskora" />
          </Row>
          <Column tight>
            <Typography h3 level={2}>Welcome back</Typography>
            <Typography small subtle>Sign in to Riskora with your work email.</Typography>
          </Column>
          <ButtonGroup block accessibilityLabel="Sign-in method" active={mode} onSelect={setMode} items={MODES} />
          <Input label="Work email" placeholder="you@company.com" keyboardType="email-address" autoCapitalize="none" />
          {password ? (
            <Column tight>
              <Input label="Password" placeholder="••••••••" secureTextEntry />
              <Row end>
                <Button link small onPress={() => toast({ message: "Reset link sent to your inbox" })}>Forgot?</Button>
              </Row>
            </Column>
          ) : null}
          <Button primary raised block onPress={() => toast({ message: password ? "Signed in. Redirecting…" : "Magic link sent" })}>
            {password ? "Sign in" : "Email me a link"}
          </Button>
          <Divider>or</Divider>
          <Grid minTileWidth={150} snug>
            <Button outline block iconLeft={<Icon keyRound decorative />} onPress={() => toast({ message: "Passkey prompt opened" })}>Passkey</Button>
            <Button outline block iconLeft={<Icon shieldCheck decorative />} onPress={() => toast({ message: "Redirecting to your identity provider" })}>SSO</Button>
          </Grid>
          <Row center alignCenter wrap tight>
            <Typography small subtle>New to Riskora?</Typography>
            <Button link small onPress={() => go("signup")}>Create an account</Button>
          </Row>
        </Column>
      </Container>
    </Row>
  );

  if (phone) return form;
  return (
    <Row stacks loose grow>
      <Column span={6}>
        <Card featured artwork grow>
          <Column end grow>
            <Card>
              <Column cozy>
                <Typography lead medium>“We shipped three native apps and a web app from one tree. Nobody can tell which one we built first.”</Typography>
                <Row snug alignCenter>
                  <Avatar small src="/grace-hopper.jpg" name="Grace Hopper" />
                  <Column>
                    <Typography small medium>Grace Hopper</Typography>
                    <Typography caption subtle>Head of Platform, Riskora</Typography>
                  </Column>
                </Row>
              </Column>
            </Card>
          </Column>
        </Card>
      </Column>
      <Column span={6}>{form}</Column>
    </Row>
  );
}

export const SIGNIN_TEMPLATE: TemplateDoc = {
  slug: "signin",
  name: "Sign in",
  group: "Auth",
  icon: "logIn",
  description: "Split screen on web, a single card on phones. Password or magic link, then passkey and SSO.",
  path: "signin",
  app: false,
  Screen: SigninScreen,
};
