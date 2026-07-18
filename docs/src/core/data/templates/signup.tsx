import { useState } from "react";
import { Row, Column, Card, Typography, Button, Input, Checkbox, Progress, Divider, Emblem, EmptyState, Icon } from "@nannier/canvas";
import type { TemplateDoc } from "../types";

// Live sign-up flow built from real Canvas components: a registration card with
// a password-strength meter that responds as you type, and the post-submit
// "check your inbox" confirmation state.

function passwordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(1, score / 4 || 0.15);
}

function SignupLive() {
  const [password, setPassword] = useState("");
  const strength = passwordStrength(password);
  return (
    <Row center>
      <Column cozy style={{ width: "100%", maxWidth: 400 }}>
        <Card>
          <Column cozy>
            <Column tight alignCenter>
              <Emblem primary label="C" />
              <Typography h3>Create your account</Typography>
              <Typography small>Start your 14-day free trial. No card required.</Typography>
            </Column>
            <Input label="Full name" placeholder="Rachel Chen" block />
            <Input label="Work email" placeholder="you@company.com" block />
            <Input label="Password" placeholder="8+ characters" secureTextEntry value={password} onChangeText={setPassword} block />
            <Column tight>
              <Progress block value={strength} accessibilityLabel="Password strength" />
              <Typography tiny>Use 8 or more characters with a number and a symbol.</Typography>
            </Column>
            <Row snug alignStart>
              <Checkbox />
              <Column tight fill>
                <Typography small>I agree to the Terms of Service and the Privacy Policy.</Typography>
              </Column>
            </Row>
            <Button block primary>Create account</Button>
            <Divider>or continue with</Divider>
            <Row snug>
              <Column fill>
                <Button block outline>Google</Button>
              </Column>
              <Column fill>
                <Button block outline>GitHub</Button>
              </Column>
            </Row>
            <Row center tight alignCenter>
              <Typography small>Already have an account?</Typography>
              <Button link small>Sign in</Button>
            </Row>
          </Column>
        </Card>
      </Column>
    </Row>
  );
}

export const SIGNUP_TEMPLATE: TemplateDoc = {
  slug: "signup",
  name: "Sign-up",
  description: "Registration card with a live password-strength meter, terms consent, OAuth alternatives, and the check-your-inbox confirmation state. Built from live Canvas components.",
  sections: [
    {
      title: "Registration card",
      anatomy: "Logo Emblem + name/email/password Inputs + strength Progress (fills as you type) + terms Checkbox + primary CTA + OAuth Divider row. Max width 400, centered.",
      render: () => <SignupLive />,
    },
    {
      title: "Confirm email",
      anatomy: "Post-submit state: an EmptyState with a mail icon, what happened, and a resend action.",
      render: () => (
        <EmptyState
          bordered
          icon={<Icon mail />}
          title="Check your inbox"
          description="We sent a confirmation link to you@company.com. The link expires in 24 hours."
          actionLabel="Resend email"
        />
      ),
    },
  ],
};
