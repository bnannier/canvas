import { Row, Column, Typography, Button, Alert, EmptyState, Icon } from "@nannier/canvas";
import type { TemplateDoc } from "../types";

// Error and empty states built from real Canvas components: the honest 404 and
// 500 pages, a maintenance banner, and the first-run empty state that turns a
// dead end into the next step.

export const ERRORS_TEMPLATE: TemplateDoc = {
  slug: "errors",
  name: "Errors & empty states",
  description: "404, server error, maintenance, and first-run empty states. Calm, honest, and always pointing at the next step. Built from live Canvas components.",
  sections: [
    {
      title: "Not found (404)",
      anatomy: "EmptyState with a search icon: name the miss, offer the way home. The status code is muted metadata, not the headline.",
      render: () => (
        <Column cozy alignCenter>
          <Typography mono muted>404</Typography>
          <EmptyState
            icon={<Icon search />}
            title="Page not found"
            description="The page may have moved, or the link is out of date."
            actionLabel="Back to home"
          />
        </Column>
      ),
    },
    {
      title: "Something went wrong (500)",
      anatomy: "EmptyState with a warning icon and a retry action, plus a secondary support link.",
      render: () => (
        <Column cozy alignCenter>
          <EmptyState
            bordered
            icon={<Icon alertTriangle />}
            title="Something went wrong"
            description="The request failed on our side. Your data is safe; trying again usually works."
            actionLabel="Try again"
          />
          <Row center>
            <Button link small>Contact support</Button>
          </Row>
        </Column>
      ),
    },
    {
      title: "Maintenance",
      anatomy: "A warning Alert banner over the product shell while a window is active.",
      render: () => (
        <Alert
          warning
          icon={<Icon alertTriangle size={16} />}
          title="Scheduled maintenance"
          description="Canvas Cloud is read-only until 04:00 UTC while we upgrade the database. Nothing is lost; writes resume automatically."
          actions={<Button link small>Status page</Button>}
        />
      ),
    },
    {
      title: "First run",
      anatomy: "The empty project list as an invitation: what belongs here and the one action that creates it.",
      render: () => (
        <EmptyState
          bordered
          icon={<Icon folderPlus />}
          title="No projects yet"
          description="Projects group your identities, policies, and API keys per environment."
          actionLabel="Create your first project"
        />
      ),
    },
  ],
};
