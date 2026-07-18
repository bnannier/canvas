import type { TemplateDoc } from "./types";
import { ACTIVITY_TEMPLATE } from "./templates/activity";
import { API_KEYS_TEMPLATE } from "./templates/api-keys";
import { BILLING_TEMPLATE } from "./templates/billing";
import { CALENDAR_TEMPLATE } from "./templates/calendar";
import { CHAT_TEMPLATE } from "./templates/chat";
import { DASHBOARD_TEMPLATE } from "./templates/dashboard";
import { DETAIL_SIDEBAR_TEMPLATE } from "./templates/detail-sidebar";
import { ERRORS_TEMPLATE } from "./templates/errors";
import { IDENTITIES_TEMPLATE } from "./templates/identities";
import { INBOX_TEMPLATE } from "./templates/inbox";
import { KANBAN_TEMPLATE } from "./templates/kanban";
import { ONBOARDING_TEMPLATE } from "./templates/onboarding";
import { PRICING_TEMPLATE } from "./templates/pricing";
import { PROFILE_TEMPLATE } from "./templates/profile";
import { SETTINGS_TEMPLATE } from "./templates/settings";
import { SIGNIN_TEMPLATE } from "./templates/signin";
import { SIGNUP_TEMPLATE } from "./templates/signup";
import { TEAM_TEMPLATE } from "./templates/team";

// Every template is a LIVE demo built from real Canvas components: one file per
// template under ./templates/ (see ./templates/README.md for the authoring
// contract). The legacy HTML-string mockups are gone; patterns still carry some
// and render them through the Mockup interpreter.
const TEMPLATES: TemplateDoc[] = [
  ACTIVITY_TEMPLATE,
  API_KEYS_TEMPLATE,
  BILLING_TEMPLATE,
  CALENDAR_TEMPLATE,
  CHAT_TEMPLATE,
  DASHBOARD_TEMPLATE,
  DETAIL_SIDEBAR_TEMPLATE,
  ERRORS_TEMPLATE,
  IDENTITIES_TEMPLATE,
  INBOX_TEMPLATE,
  KANBAN_TEMPLATE,
  ONBOARDING_TEMPLATE,
  PRICING_TEMPLATE,
  PROFILE_TEMPLATE,
  SETTINGS_TEMPLATE,
  SIGNIN_TEMPLATE,
  SIGNUP_TEMPLATE,
  TEAM_TEMPLATE,
];

export function getTemplate(slug: string): TemplateDoc | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

export function getAllTemplates(): TemplateDoc[] {
  return TEMPLATES;
}
