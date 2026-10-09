import type { ReactNode } from "react";
import { Column, Container, Typography, Alert } from "@nannier/canvas";

export function TokenH1({ children }: { children: ReactNode }) { return <Typography h1>{children}</Typography>; }
export function TokenLede({ children }: { children: ReactNode }) { return <Container xxl start><Typography lead subtle>{children}</Typography></Container>; }
export function Callout({ label, children }: { label: string; children: ReactNode }) {
  return <Alert title={label}><Typography small>{children}</Typography></Alert>;
}
export function TokenSection({ title, description, anatomy, children }: {
  title: string; description?: string; anatomy?: string; children: ReactNode;
}) {
  return <Column relaxed>
    <Column tight><Typography h2>{title}</Typography>{description ? <Typography subtle>{description}</Typography> : null}</Column>
    {anatomy ? <Callout label="Anatomy">{anatomy}</Callout> : null}
    {children}
  </Column>;
}
