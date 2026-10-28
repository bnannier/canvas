import type { TemplateDoc, TemplateGroup } from "./types";
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

// Every template is a LIVE screen built from real Canvas components: one file per
// template under ./templates/ (see ./templates/README.md for the authoring contract).
// The order is the hand-off's (`Canvas v4.0.0 Templates.dc.html` TPLS): the list numbers
// each template by its place here.
const TEMPLATES: TemplateDoc[] = [
  SIGNIN_TEMPLATE,
  SIGNUP_TEMPLATE,
  ONBOARDING_TEMPLATE,
  DASHBOARD_TEMPLATE,
  ACTIVITY_TEMPLATE,
  IDENTITIES_TEMPLATE,
  TEAM_TEMPLATE,
  INBOX_TEMPLATE,
  CHAT_TEMPLATE,
  CALENDAR_TEMPLATE,
  KANBAN_TEMPLATE,
  DETAIL_SIDEBAR_TEMPLATE,
  PROFILE_TEMPLATE,
  SETTINGS_TEMPLATE,
  BILLING_TEMPLATE,
  API_KEYS_TEMPLATE,
  PRICING_TEMPLATE,
  ERRORS_TEMPLATE,
];

/** The template the bare Templates page opens on, as the hand-off's does. */
export const DEFAULT_TEMPLATE = "dashboard";

export function getTemplate(slug: string): TemplateDoc | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

export function getAllTemplates(): TemplateDoc[] {
  return TEMPLATES;
}

/** A template's place in the list, two digits from 01 (the hand-off's `num`). */
export function templateNumber(slug: string): string {
  return String(TEMPLATES.findIndex((t) => t.slug === slug) + 1).padStart(2, "0");
}

/** The templates by group, in list order. */
export function templateGroups(): { group: TemplateGroup; templates: TemplateDoc[] }[] {
  const groups: { group: TemplateGroup; templates: TemplateDoc[] }[] = [];
  for (const template of TEMPLATES) {
    const last = groups[groups.length - 1];
    if (last && last.group === template.group) last.templates.push(template);
    else groups.push({ group: template.group, templates: [template] });
  }
  return groups;
}
