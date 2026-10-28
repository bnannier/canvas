import { useEffect, useState } from "react";
import type { TemplateDoc, TemplateScreenProps } from "../types";

// The hand-off's Errors & empty (`Canvas v4.0.0 Templates.dc.html`, `t.errors`): a switch
// between four states, each pointing at the next step: the 404, the server error with its
// retry, the maintenance notice over the read-only page, and the first-run empty state
// that turns into the new project. Every part is a kit component from the frame's scope.

const STATES = ["Not found", "Server error", "Maintenance", "First run"];

function ErrorsScreen({ K, go }: TemplateScreenProps) {
  const { Row, Column, Container, Card, Typography, Button, ButtonGroup, Alert, Skeleton, Grid, EmptyState, Emblem, Icon, useToast } = K;
  const { toast } = useToast();
  const [tab, setTab] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [project, setProject] = useState(false);

  useEffect(() => {
    if (!retrying) return;
    const timer = setTimeout(() => {
      setRetrying(false);
      toast({ message: "Back online" });
    }, 1400);
    return () => clearTimeout(timer);
  }, [retrying, toast]);

  return (
    <Column spacious grow>
      <Row>
        <ButtonGroup small accessibilityLabel="State" active={tab} onSelect={setTab} items={STATES} />
      </Row>
      <Row center alignCenter grow>
        {tab === 0 ? (
          <Container md>
            <Column roomy alignCenter>
              <Typography caption mono subtle>404</Typography>
              <Emblem muted large><Icon fileSearch decorative /></Emblem>
              <Typography h4 level={2} center>We can't find that page</Typography>
              <Typography small subtle center>The link may be old, or the board was moved. Search for it, or head back to your overview.</Typography>
              <Row center wrap snug>
                <Button primary onPress={() => go("dashboard")}>Go to overview</Button>
                <Button outline onPress={() => toast({ message: "Search opened" })}>Search</Button>
              </Row>
            </Column>
          </Container>
        ) : tab === 1 ? (
          <Container md>
            <Column roomy alignCenter>
              <Typography caption mono subtle>500</Typography>
              <Emblem warning large><Icon alertTriangle decorative /></Emblem>
              <Typography h4 level={2} center>Something went wrong on our side</Typography>
              <Typography small subtle center>Nothing you did. Your work is saved. Try again in a moment.</Typography>
              <Button primary loading={retrying} onPress={() => setRetrying(true)}>{retrying ? "Retrying…" : "Try again"}</Button>
              <Button link small onPress={() => toast({ message: "Support chat opened" })}>Contact support</Button>
            </Column>
          </Container>
        ) : tab === 2 ? (
          <Container xl>
            <Column roomy>
              <Alert warning icon={<Icon wrench warning decorative />} title="Scheduled maintenance until 10:30 UTC" description="Boards are read-only for about 20 minutes. Edits made before then are safe." />
              <Grid minTileWidth={160} comfortable>
                <Skeleton card />
                <Skeleton card />
                <Skeleton card />
              </Grid>
              <Skeleton card />
            </Column>
          </Container>
        ) : (
          <Container md>
            {project ? (
              <Card selected onPress={() => toast({ message: "Untitled project opened" })}>
                <Row roomy alignCenter>
                  <Emblem primary><Icon folderOpen decorative /></Emblem>
                  <Column fill>
                    <Typography body semibold>Untitled project</Typography>
                    <Typography caption mono subtle>created just now · 0 boards</Typography>
                  </Column>
                  <Icon chevronRight muted decorative />
                </Row>
              </Card>
            ) : (
              <EmptyState
                bordered
                icon={<Icon folderPlus primary decorative />}
                title="No projects yet"
                description="Projects hold boards, tokens and docs for one product."
                actionLabel="Create project"
                onAction={() => setProject(true)}
              />
            )}
          </Container>
        )}
      </Row>
    </Column>
  );
}

export const ERRORS_TEMPLATE: TemplateDoc = {
  slug: "errors",
  name: "Errors & empty",
  group: "States",
  icon: "circleAlert",
  description: "404, server error, maintenance and first run. Calm, honest, always pointing at the next step.",
  path: "errors",
  app: false,
  Screen: ErrorsScreen,
};
