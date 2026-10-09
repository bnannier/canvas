import type { ReactNode } from "react";

// The web build's audit driver: nothing. The component audit drives the web docs from
// Playwright (tools/audit/run-web.ts) and needs no help from inside the page, so this
// renders the app untouched and provides no probe. Metro picks driver.native.tsx on iOS
// and Android, and tsc resolves the import here, so both share this signature. Only the
// root layout's flagged branch requires either (tools/docs/audit-driver-bundle.test.ts).
export function AuditDriver({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
