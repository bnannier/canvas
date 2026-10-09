import type { ReactNode } from "react";
import { Typography, Divider, Container } from "@nannier/canvas";
import { geistMono } from "./fonts";
import { splitCodeSpans } from "../lib/code-spans";

export const MONO = geistMono("400");

// Docs names are composition aliases; the kit owns all type and divider styling.
export function H1({ children }: { children: ReactNode }) { return <Typography h1>{children}</Typography>; }
export function H2({ children }: { children: ReactNode }) { return <Typography h2>{children}</Typography>; }
export function H3({ children }: { children: ReactNode }) { return <Typography h3>{children}</Typography>; }
export function P({ children, muted }: { children: ReactNode; muted?: boolean }) { return <Typography subtle={muted}>{children}</Typography>; }
export function Lead({ children }: { children: ReactNode }) { return <Container xxl start><Typography lead subtle>{children}</Typography></Container>; }
export function InlineCode({ children }: { children: ReactNode }) { return <Typography mono>{children}</Typography>; }
// A line of Markdown from a component's .md (a Do/Don't caption or title), for inside a
// Typography: its code spans set as InlineCode rather than printed with their backticks.
export function CodeSpans({ text }: { text: string }) {
  return <>{splitCodeSpans(text).map((run, i) => (run.code ? <InlineCode key={i}>{run.text}</InlineCode> : run.text))}</>;
}
export function Rule() { return <Divider />; }
