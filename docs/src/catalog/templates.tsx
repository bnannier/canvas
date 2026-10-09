import { useState } from "react";
import { Calendar, Column, DescriptionList, Form, Input, MediaObject, Select, StackedList, Stats, Steps, Switch, Typography, useToast } from "@nannier/canvas";
import type { CatTile } from "./tile";

function CalendarPreview() {
  return <Calendar month="May 2026" today={23} defaultSelected={24} daysInMonth={31} startWeekday={4} />;
}

function DashboardPreview() {
  return <Stats items={[{ label: "Active users", value: "12,348", delta: "+12.3% this month" }]} />;
}

function DetailSidebarPreview() {
  return <DescriptionList items={[{ term: "Project", value: "Identity Platform" }, { term: "Owner", value: "Rachel Chen" }, { term: "Status", value: "Active" }]} />;
}

function IdentitiesPreview() {
  return <StackedList items={[{ name: "Rachel Chen", detail: "Engineering", meta: "admin" }, { name: "Ada Lovelace", detail: "Platform", meta: "editor" }]} />;
}

function OnboardingPreview() {
  const [step, setStep] = useState(0);
  const labels = ["Account", "Profile", "Review"];
  return <Column snug><Steps stacks steps={labels.map((label) => ({ label }))} current={step} onStepPress={setStep} /><Typography small muted>{labels[step]} setup</Typography></Column>;
}

function ProfilePreview() {
  return <MediaObject avatar="RC" title="Rachel Chen" description="Engineering Lead" body="Building the identity platform." bordered />;
}

function SettingsPreview() {
  return <Column relaxed><Switch defaultChecked description="Receive news about your projects.">Email notifications</Switch><Select label="Timezone" defaultValue="Toronto" options={["Toronto", "London", "Tokyo"]} /></Column>;
}

function SigninPreview() {
  const { toast } = useToast();
  return <Form accessibilityLabel="Demo sign-in" submitLabel="Try sign-in" onSubmit={() => toast({ success: true, message: "Demo sign-in complete" })}><Typography small muted>Acme demo · no account needed</Typography><Input label="Email" placeholder="you@example.com" /><Input label="Password" secureTextEntry /></Form>;
}

export const TEMPLATES_TILES: CatTile[] = [
  { title: "Calendar", href: "/templates/calendar", Preview: CalendarPreview },
  { title: "Dashboard", href: "/templates/dashboard", Preview: DashboardPreview },
  { title: "Detail w/ sidebar", href: "/templates/detail-sidebar", Preview: DetailSidebarPreview },
  { title: "Identities", href: "/templates/identities", Preview: IdentitiesPreview },
  { title: "Onboarding", href: "/templates/onboarding", Preview: OnboardingPreview },
  { title: "Profile", href: "/templates/profile", Preview: ProfilePreview },
  { title: "Settings", href: "/templates/settings", Preview: SettingsPreview },
  { title: "Sign-in", href: "/templates/signin", Preview: SigninPreview },
];
