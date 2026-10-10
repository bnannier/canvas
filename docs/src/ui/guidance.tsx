import type { ReactNode } from "react";
import { Platform } from "react-native";
import { View, Card, Column, Container, Typography, useTheme } from "@nannier/canvas";
import { buildScopes } from "../core/build-scopes";
import type { DocGuidance, DocGuidanceBlock, DocProse, ExampleScope } from "../core/scope";
import { CodeBlock } from "./code-block";
import { ExampleErrorBoundary } from "./playground";
import { InlineMarkdown, Prose } from "./prose";

// The sections of a component's own after Do & Don't ("## Touch area", "## Real links
// (href)", and, once the audit signs a component off, "## Accessibility"): each an h2
// over its prose, its "###" headings, and its fences rendered live over their source,
// the way a Do/Don't card shows its specimen. Like Do & Don't, the live examples render
// in this platform's own skins (the web's on the web, the device's natively).

function GuidanceExample({ code, render, scope }: { code: string; render: (scope: ExampleScope) => ReactNode; scope: ExampleScope }) {
  return (
    <Card>
      <Column snug>
        <View
          // The live example, found by the same web-only tooling attribute as every other
          // example on the page, so the e2e checks that hold examples to the kit's rules
          // hold this one too.
          {...(Platform.OS === "web" ? ({ dataSet: { previewStage: "" } } as object) : null)}
        >
          <Container><ExampleErrorBoundary>{render(scope)}</ExampleErrorBoundary></Container>
        </View>
        {/* The example's source scrolls like the Playground's rather than soft-wrapping:
            a guidance fence carries whole call sites (Button's href example holds a URL
            longer than a phone line), and a wrapped block clips a token it cannot break. */}
        <CodeBlock code={code} />
      </Column>
    </Card>
  );
}

type Run = DocProse[] | Exclude<DocGuidanceBlock, DocProse>;

const isProse = (block: DocGuidanceBlock): block is DocProse => typeof block === "string" || "list" in block;

// A section's blocks with each run of prose kept together, so its paragraphs sit a
// paragraph's gap apart, and a heading or an example a section's gap from them.
function runs(blocks: DocGuidanceBlock[]): Run[] {
  const out: Run[] = [];
  for (const block of blocks) {
    const last = out[out.length - 1];
    if (!isProse(block)) out.push(block);
    else if (Array.isArray(last)) last.push(block);
    else out.push([block]);
  }
  return out;
}

export function Guidance({ sections }: { sections: DocGuidance[] }) {
  const { tokens } = useTheme();
  const previews = buildScopes(tokens);
  const scope = previews[previews.length - 1].scope;
  return (
    <>
      {sections.map((section, i) => (
        <Column key={i} relaxed>
          <Typography h2><InlineMarkdown text={section.title} heading /></Typography>
          {runs(section.blocks).map((run, j) =>
            Array.isArray(run) ? (
              <Container key={j} xxl start><Prose blocks={run} /></Container>
            ) : "heading" in run ? (
              <Typography key={j} h3><InlineMarkdown text={run.heading} heading /></Typography>
            ) : (
              <GuidanceExample key={j} code={run.code} render={run.render} scope={scope} />
            ),
          )}
        </Column>
      ))}
    </>
  );
}
