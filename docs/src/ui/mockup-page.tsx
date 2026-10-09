import { Card, Column, Container, Typography } from "@nannier/canvas";
import { Page } from "./page";
import { PageNav } from "./page-nav";
import type { DocSection } from "../core/data/types";

// A shared reading layout around live Canvas patterns and templates. The render
// callback returns a named component, keeping hooks and state in that component.
export function MockupDocPage({ name, description, sections }: { name: string; description: string; sections: DocSection[] }) {
  return (
    <Page>
      <Container wider start>
        <Column loose>
          <Column tight>
            <Typography h1>{name}</Typography>
            <Typography lead muted>{description}</Typography>
          </Column>
          {sections.map((section) => (
            <Column key={section.title} cozy>
              <Typography h2>{section.title}</Typography>
              {section.description ? <Typography small muted>{section.description}</Typography> : null}
              {section.anatomy ? <Card compact><Typography small><Typography semibold>Anatomy. </Typography>{section.anatomy}</Typography></Card> : null}
              <Card>{section.render()}</Card>
            </Column>
          ))}
          <PageNav />
        </Column>
      </Container>
    </Page>
  );
}
