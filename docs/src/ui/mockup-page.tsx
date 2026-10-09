import { useEffect } from "react";
import { usePathname } from "expo-router";
import { Card, Column, Container, Typography } from "@nannier/canvas";
import { Page } from "./page";
import { PageNav } from "./page-nav";
import { useAuditProbe } from "../audit/probe-context";
import type { DocSection } from "../core/data/types";

// A shared reading layout around live Canvas patterns and templates. The render
// callback returns a named component, keeping hooks and state in that component.
export function MockupDocPage({ name, description, sections }: { name: string; description: string; sections: DocSection[] }) {
  // The page announces itself to the native audit driver (docs/src/audit/probe-context.tsx),
  // which photographs the whole page once it is the one on screen. Null outside the
  // audit build, where this registers nothing.
  const probe = useAuditProbe();
  const path = usePathname();
  useEffect(() => probe?.page({ name, path, sections: sections.map((section) => section.title) }), [probe, name, path, sections]);
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
