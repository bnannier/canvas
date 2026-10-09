import type { ReactNode } from "react";
import { Column } from "@nannier/canvas";
import { H2 } from "./prose";

export function Section({ title, children }: { title?: string; children: ReactNode }) {
  return <Column relaxed>{title ? <H2>{title}</H2> : null}{children}</Column>;
}
