import { useEffect } from "react";
import { Platform } from "react-native";
import { usePathname } from "expo-router";
import { Card, Column, Container, Typography, View } from "@nannier/canvas";
import { Page } from "./page";
import { PageNav } from "./page-nav";
import { useAuditProbe } from "../audit/probe-context";
import { variantSlug } from "../lib/variant";
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
            // Marks each section for tooling: the audit's page capture
            // (e2e/audit/pages.audit.ts) finds and photographs a section by this key,
            // its title slugified the way the audit inventory keys a section
            // (tools/audit/inventory.ts `sectionKeys`). Web-only attribute, the same as
            // the page scroller's mark in ./page.tsx; on native the wrapper is a plain
            // View that lays out exactly as the section alone would.
            <View key={section.title} {...(Platform.OS === "web" ? ({ dataSet: { mockupSection: variantSlug(section.title) } } as object) : null)}>
              <Column cozy>
                <Typography h2>{section.title}</Typography>
                {section.description ? <Typography small muted>{section.description}</Typography> : null}
                {section.anatomy ? <Card compact><Typography small><Typography semibold>Anatomy. </Typography>{section.anatomy}</Typography></Card> : null}
                <Card>{section.render()}</Card>
              </Column>
            </View>
          ))}
          <PageNav />
        </Column>
      </Container>
    </Page>
  );
}
