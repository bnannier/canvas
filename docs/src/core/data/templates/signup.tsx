import { useState } from "react";
import type { TemplateDoc, TemplateScreenProps } from "../template-types";

// The hand-off's Sign up (`Canvas v4.0.0 Templates.dc.html`, `t.signup`): one registration
// card with a live password strength meter and the terms consent, which swaps to the
// check-your-inbox state once the account is created. Every part is a kit component from
// the frame's scope.

/** The hand-off's strength score: length 6 and 10, mixed case, a digit or symbol. */
function strength(pw: string): number {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[\d\W]/.test(pw)) score++;
  return score;
}

const LABELS = ["Use 10+ characters with a number", "Weak", "Fair", "Good", "Strong"];

function SignupScreen({ K, go }: TemplateScreenProps) {
  const { Row, Column, Container, Card, Typography, Button, Input, Checkbox, Progress, Emblem, Avatar, Icon, useToast } = K;
  const { toast } = useToast();
  const [pw, setPw] = useState("");
  const [terms, setTerms] = useState(false);
  const [done, setDone] = useState(false);
  const score = strength(pw);

  return (
    <Row center alignCenter grow>
      <Container sm>
        <Card>
          {done ? (
            <Column cozy alignCenter>
              <Emblem primary large><Icon mailOpen decorative /></Emblem>
              <Typography h4 level={2} center>Check your inbox</Typography>
              <Typography small subtle center>We sent a confirmation link to ada@company.com. It expires in 24 hours.</Typography>
              <Button outline onPress={() => toast({ message: "Confirmation email resent" })}>Resend email</Button>
              <Button link small onPress={() => setDone(false)}>Use a different email</Button>
            </Column>
          ) : (
            <Column relaxed>
              <Row>
                <Avatar logo initials="Rk" accessibilityLabel="Riskora" />
              </Row>
              <Column tight>
                <Typography h4 level={2}>Create your account</Typography>
                <Typography small subtle>Free for three workspaces. No card needed.</Typography>
              </Column>
              <Input label="Full name" placeholder="Ada Lovelace" />
              <Input label="Work email" placeholder="ada@company.com" keyboardType="email-address" autoCapitalize="none" />
              <Column snug>
                <Input label="Password" placeholder="At least 10 characters" secureTextEntry value={pw} onChangeText={setPw} />
                <Progress small segments={4} value={score / 4} danger={score === 1} warning={score === 2} accessibilityLabel="Password strength" />
                <Typography caption medium destructive={score === 1} warning={score === 2} success={score >= 3} subtle={score === 0}>{LABELS[score]}</Typography>
              </Column>
              <Checkbox checked={terms} onChange={setTerms}>I agree to the Terms and the Data Processing Addendum.</Checkbox>
              <Button primary raised block onPress={() => (terms ? setDone(true) : toast({ message: "Accept the terms to continue" }))}>Create account</Button>
              <Row center alignCenter wrap tight>
                <Typography small subtle>Already have one?</Typography>
                <Button link small onPress={() => go("signin")}>Sign in</Button>
              </Row>
            </Column>
          )}
        </Card>
      </Container>
    </Row>
  );
}

export const SIGNUP_TEMPLATE: TemplateDoc = {
  slug: "signup",
  name: "Sign up",
  group: "Auth",
  icon: "userPlus",
  description: "Registration card with a live strength meter, terms consent and the check-your-inbox state.",
  path: "signup",
  app: false,
  Screen: SignupScreen,
};
