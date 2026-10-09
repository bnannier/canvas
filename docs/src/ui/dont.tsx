import type { ReactNode } from "react";
import { Platform } from "react-native";
import { View, Card, Badge, Column, Row, Container, Typography, useTheme } from "@nannier/canvas";
import { buildScopes } from "../core/build-scopes";
import type { DocDontPair } from "../core/scope";
import { CodeBlock } from "./code-block";
import { ExampleErrorBoundary } from "./playground";

export interface DoDontCardProps {
  do?: boolean;
  dont?: boolean;
  caption: string;
  code?: string;
  children?: ReactNode;
}

export function DoDontCard({ dont, caption, code, children }: DoDontCardProps) {
  return <Card>
    <Column snug>
      <Badge destructive={dont} success={!dont}>{dont ? "Don’t" : "Do"}</Badge>
      {children === undefined ? null : (
        <View
          {...(Platform.OS === "web" ? ({ dataSet: { previewStage: "" } } as object) : null)}
          // An intentional bad example may overflow; contain only that specimen.
          style={dont ? { overflow: "hidden" } : undefined}
        >
          <Container><ExampleErrorBoundary>{children}</ExampleErrorBoundary></Container>
        </View>
      )}
      {code === undefined ? null : <CodeBlock code={code} wrap />}
      <Typography small>{caption}</Typography>
    </Column>
  </Card>;
}

export function Donts({ donts }: { donts: DocDontPair[] }) {
  const { tokens } = useTheme();
  const previews = buildScopes(tokens);
  const scope = previews[previews.length - 1].scope;
  return <Column relaxed>
    <Typography h2>Do & Don’t</Typography>
    {donts.map((d, i) => <Column key={i} snug>
      {d.title ? <Typography h3>{d.title}</Typography> : null}
      <Row stacks stackBreakpoint="xl" relaxed>
        <Column span={6}><DoDontCard dont caption={d.dont.caption}>{d.dont.render(scope)}</DoDontCard></Column>
        <Column span={6}><DoDontCard do caption={d.do.caption}>{d.do.render(scope)}</DoDontCard></Column>
      </Row>
    </Column>)}
  </Column>;
}
