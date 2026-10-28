import { useState } from "react";
import type { TemplateDoc, TemplateScreenProps } from "../types";

// The hand-off's Onboarding (`Canvas v4.0.0 Templates.dc.html`, `t.onboarding`): four
// pressable steps (about you, workspace, code verification, done) over one card holding
// the current step, with Back and the step's call to action at its foot. It opens on the
// workspace step, as the hand-off does. Every part is a kit component from the frame's
// scope.

const STEPS = ["About you", "Workspace", "Verify", "Done"];

function OnboardingScreen({ K, go }: TemplateScreenProps) {
  const { Row, Column, Container, Card, Typography, Button, Input, Select, InputOTP, Steps, Grid, Divider, Emblem, Icon, useToast } = K;
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const next = () => {
    if (step < 3) setStep(step + 1);
    else {
      toast({ message: "Welcome to Riskora" });
      go("dashboard");
    }
  };

  return (
    <Row center>
      <Container xl>
        <Column spacious>
          <Steps steps={STEPS.map((label) => ({ label }))} current={step} onStepPress={setStep} />
          <Card>
            <Column relaxed>
              {step === 0 ? (
                <Column roomy>
                  <Typography h4 level={2}>Tell us about you</Typography>
                  <Grid minTileWidth={200} cozy>
                    <Input label="Name" placeholder="Ada Lovelace" />
                    <Select label="Role" defaultValue="Design engineer" options={["Design engineer", "Product designer", "Engineer", "Product manager"]} />
                  </Grid>
                </Column>
              ) : step === 1 ? (
                <Column roomy>
                  <Typography h4 level={2}>Name your workspace</Typography>
                  <Input label="Workspace" placeholder="Riskora" />
                  <Input prefix="riskora.app/" defaultValue="team" accessibilityLabel="Workspace address" />
                  <Select accessibilityLabel="Time zone" defaultValue="Europe/Berlin · UTC+1" options={["Europe/Berlin · UTC+1", "Europe/London · UTC", "America/New_York · UTC−5", "Asia/Tokyo · UTC+9"]} />
                </Column>
              ) : step === 2 ? (
                <Column roomy>
                  <Typography h4 level={2}>Enter the code we sent</Typography>
                  <Typography small subtle>Six digits, sent to ada@company.com.</Typography>
                  <InputOTP length={6} defaultValue="481" />
                </Column>
              ) : (
                <Column cozy alignCenter>
                  <Emblem success large><Icon circleCheck decorative /></Emblem>
                  <Typography h4 level={2} center>You're all set</Typography>
                  <Typography small subtle center>Riskora is ready. Invite your team whenever you like.</Typography>
                </Column>
              )}
              <Divider />
              <Row between alignCenter>
                <Button ghost disabled={step === 0} onPress={() => setStep(Math.max(0, step - 1))}>Back</Button>
                <Button primary raised iconRight={<Icon arrowRight decorative />} onPress={next}>
                  {step < 2 ? "Continue" : step === 2 ? "Verify" : "Open Riskora"}
                </Button>
              </Row>
            </Column>
          </Card>
        </Column>
      </Container>
    </Row>
  );
}

export const ONBOARDING_TEMPLATE: TemplateDoc = {
  slug: "onboarding",
  name: "Onboarding",
  group: "Auth",
  icon: "rocket",
  description: "Four steps: about you, workspace, code verification and done. Steps are pressable.",
  path: "onboarding",
  app: false,
  Screen: OnboardingScreen,
};
