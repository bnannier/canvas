import { SectionVignette } from "../ui/showcase/section-vignette";
import type { ReactNode } from "react";
import {
  Autocomplete,
  Column,
  Divider,
  Field,
  FilterPanel,
  Form,
  FormSection,
  Grid,
  GridItem,
  Input,
  InputOTP,
  InteractionOverride,
  Kbd,
  Listbox,
  PhoneInput,
  Row,
  Select,
  Switch,
  Textarea,
  Typography,
} from "@nannier/canvas";
import { ShowcaseCard, ShowcaseGrid } from "../ui/showcase";
import { useShowcaseDemo } from "../ui/showcase/demo";

// The Inputs section page (`Canvas v4.0.0 Inputs.dc.html`): its hero vignette and its seven
// cards, composed of live kit fields with the hand-off's copy. An option list the hand-off
// draws open (the Select, the Autocomplete, the PhoneInput's country list) is an anchored
// overlay in the kit: open, it would cover the card's next rows, and on a phone it presents
// as a sheet over the whole page (AO-6), so each starts closed and opens on press. The differences are recorded in the Phase 5 report.

/** The animated hero: a focused URL field and an empty verification code. */
export function Vignette() {
  return <SectionVignette kind="inputs" />;
}

/** Input · States: helper, focused, icon, error and disabled. */
const INPUT_REST = { workspace: "", focused: "Canvas v4.0.0", search: "", email: "bobby@nannier" };
const INPUT_FRAMES = [
  INPUT_REST, INPUT_REST,
  { ...INPUT_REST, workspace: "Ri" },
  { ...INPUT_REST, workspace: "Risk" },
  { ...INPUT_REST, workspace: "Riskora" },
  { ...INPUT_REST, workspace: "Riskora", search: "S" },
  { ...INPUT_REST, workspace: "Riskora", search: "Sli" },
  { ...INPUT_REST, workspace: "Riskora", search: "Slider" },
  { ...INPUT_REST, workspace: "Riskora", search: "Slider", email: "bobby@nannier." },
  { ...INPUT_REST, workspace: "Riskora", search: "Slider", email: "bobby@nannier.com" },
  { ...INPUT_REST, workspace: "Riskora", search: "Slider", email: "bobby@nannier.com" },
];
const isCompleteEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function InputStates() {
  const { value, setValue, stop, manual } = useShowcaseDemo("c-input", INPUT_FRAMES, { interval: 480 });
  const update = (key: keyof typeof INPUT_REST) => (next: string) => setValue((current) => ({ ...current, [key]: next }));
  const complete = isCompleteEmail(value.email);
  const error = value.email !== "" && !complete;
  return (
    <ShowcaseCard id="c-input" caption={"<Input label=\"Workspace name\"> · <Input error> · <Input disabled> · the message line is <Field>'s"}>
      <Field label="Workspace name" helper="Shown in the sidebar and on invoices.">
        <Input value={value.workspace} onChangeText={update("workspace")} onFocus={stop} placeholder="e.g. Riskora" accessibilityLabel="Workspace name" testID="section-demo-workspace-name" />
      </Field>
      <InteractionOverride focused={!manual}>
        <Input label="Focused" value={value.focused} onChangeText={update("focused")} onFocus={stop} />
      </InteractionOverride>
      <Input label="With icon and shortcut" leadingIcon icon="search" placeholder="Search components…" shortcut="⌘K" value={value.search} onChangeText={update("search")} onFocus={stop} />
      <Field label="Email" helper={complete ? "Address complete." : "Use a complete email address."} error={error ? "Enter a complete address." : undefined}>
        <Input error={error} value={value.email} onChangeText={update("email")} onFocus={stop} accessibilityLabel="Email" testID="section-demo-email-validation" />
      </Field>
      <Input label="Disabled" disabled defaultValue="Managed by SSO" />
    </ShowcaseCard>
  );
}

const ROLES = ["Design engineer", "Product designer", "Frontend engineer", "Founder"];
const SELECT_REST = { role: ROLES[0]!, notes: "", code: "481" };
const SELECT_FRAMES = [
  SELECT_REST, SELECT_REST,
  { role: ROLES[1]!, notes: "", code: "481" },
  { role: ROLES[1]!, notes: "Review", code: "481" },
  { role: ROLES[1]!, notes: "Review the **new", code: "4817" },
  { role: ROLES[2]!, notes: "Review the **new tokens**.", code: "48179" },
  { role: ROLES[2]!, notes: "Review the **new tokens**.", code: "481792" },
  { role: ROLES[2]!, notes: "Review the **new tokens**.", code: "481792" },
];

/** Select · Textarea · InputOTP. */
function SelectTextarea() {
  const { value, setValue, stop, manual } = useShowcaseDemo("c-select", SELECT_FRAMES, { interval: 660 });
  return (
    <ShowcaseCard id="c-select" caption={"<Select label=\"Role\" options={roles}> · <Textarea rows={3} maxLength={500}> · <InputOTP length={6}>"}>
      <Select label="Role" options={ROLES} value={value.role} onSelect={(role) => setValue((current) => ({ ...current, role }))} onOpenChange={stop} testID="section-demo-role" />
      <Field label="Notes" helper="Markdown supported">
        <Textarea rows={3} maxLength={500} showCount placeholder="Anything the reviewer should know…" accessibilityLabel="Notes"
          value={value.notes} onChangeText={(notes) => setValue((current) => ({ ...current, notes }))} onFocus={stop} testID="section-demo-notes" />
      </Field>
      <Field label="One-time code">
        {/* Held focused: the active cell and its caret, the hand-off's focus state. */}
        <InteractionOverride focused={!manual}>
          <InputOTP length={6} value={value.code} onChangeText={(code) => setValue((current) => ({ ...current, code }))} testID="section-demo-otp" />
        </InteractionOverride>
      </Field>
    </ShowcaseCard>
  );
}

/** Input · addons · affordances. */
const ADDON_REST = { url: "riskora", email: "bobby@nannier.com", password: "canvas-v4-glass", search: "--ion" };
const ADDON_FRAMES = [
  ADDON_REST, ADDON_REST,
  { ...ADDON_REST, search: "--ion-" },
  { ...ADDON_REST, search: "--ion-soft" },
  { ...ADDON_REST, url: "riskora-", search: "--ion-soft" },
  { ...ADDON_REST, url: "riskora-labs", search: "" },
  { ...ADDON_REST, url: "riskora-labs", search: "--glass" },
  { ...ADDON_REST, url: "riskora-labs", search: "--glass" },
];

function Addons() {
  const { value, setValue, stop } = useShowcaseDemo("c-input-addons", ADDON_FRAMES, { interval: 570 });
  const update = (key: keyof typeof ADDON_REST) => (next: string) => setValue((current) => ({ ...current, [key]: next }));
  return (
    <ShowcaseCard
      id="c-input-addons"
      caption={"<Input prefix=\"https://\" suffix=\".canvas.app\"> · leadingIcon · passwordToggle · clearable · small · large · raw <TextInput> stays unskinned"}
    >
      <Input label="Workspace URL" prefix="https://" suffix=".canvas.app" value={value.url} onChangeText={update("url")} onFocus={stop} testID="section-demo-workspace-url" />
      <Input label="Email" leadingIcon icon="mail" value={value.email} onChangeText={update("email")} onFocus={stop} />
      <Input label="Password" leadingIcon icon="lock" passwordToggle secureTextEntry value={value.password} onChangeText={update("password")} onFocus={stop} />
      <Input label="Search tokens" leadingIcon icon="search" clearable value={value.search} onChangeText={update("search")} onFocus={stop} testID="section-demo-token-search" />
      <Row snug alignEnd>
        <Input small placeholder="small" accessibilityLabel="Small field" onFocus={stop} />
        <Input placeholder="default" accessibilityLabel="Default field" onFocus={stop} />
        <Input large placeholder="large" accessibilityLabel="Large field" onFocus={stop} />
      </Row>
    </ShowcaseCard>
  );
}

const RUNTIMES = [
  { label: "Expo", detail: "SDK 57" },
  { label: "React Native", detail: "0.86" },
  { label: "React Native Web", detail: "web" },
  { label: "Next.js", detail: "App Router" },
  { label: "Remix", detail: "web" },
  { label: "Vite", detail: "web" },
  { label: "Metro", detail: "bundler" },
  { label: "Electron", detail: "desktop" },
];

/** Autocomplete · Listbox. */
const AUTOCOMPLETE_FRAMES = [
  { query: "re", runtime: "", selected: [0, 2] },
  { query: "re", runtime: "", selected: [0, 2] },
  { query: "react", runtime: "", selected: [0, 1, 2] },
  { query: "react na", runtime: "", selected: [0, 1, 2] },
  { query: "", runtime: "React Native", selected: [1, 2] },
  { query: "", runtime: "React Native", selected: [1, 2] },
  { query: "vi", runtime: "", selected: [1] },
  { query: "", runtime: "Vite", selected: [0, 1] },
  { query: "", runtime: "Vite", selected: [0, 1] },
];

function AutocompleteListbox() {
  const { value, setValue, stop, manual } = useShowcaseDemo("c-autocomplete", AUTOCOMPLETE_FRAMES, { interval: 650 });
  return (
    <ShowcaseCard id="c-autocomplete" caption="<Autocomplete> searchable single-select · <Listbox> rich rows that stay on screen, single or multi">
      <InteractionOverride focused={!manual}>
        <Autocomplete label="Runtime" options={RUNTIMES} query={value.query} value={value.runtime}
          onQueryChange={(query) => setValue((current) => ({ ...current, query }))}
          onValueChange={(runtime) => setValue((current) => ({ ...current, runtime }))}
          onOpenChange={stop} testID="section-demo-runtime" />
      </InteractionOverride>
      <Column relaxed>
        <Divider />
        <Field label="Notify me about">
          <Listbox
            multi
            bordered
            accessibilityLabel="Notify me about"
            selected={value.selected}
            onChange={(selected) => setValue((current) => ({ ...current, selected: typeof selected === "number" ? [selected] : selected }))}
            testID="section-demo-notify-listbox"
            items={[
              { label: "Mentions", detail: "Someone tags you in a comment or on a board." },
              { label: "Token changes", detail: "Any value in src/style/tokens.ts moves." },
              { label: "Releases", detail: "A new version of the kit reaches npm." },
            ]}
          />
        </Field>
      </Column>
    </ShowcaseCard>
  );
}

/** PhoneInput · Field. */
const REGIONS = ["EU · Frankfurt", "US · Virginia", "AP · Tokyo"];
const PHONE_REST = { country: "US", phone: "(415) 555-0132", region: REGIONS[0]!, email: "team@" };
const PHONE_FRAMES = [
  PHONE_REST, PHONE_REST,
  { ...PHONE_REST, country: "GB", phone: "", region: "US · Virginia" },
  { ...PHONE_REST, country: "GB", phone: "20 79", region: "US · Virginia" },
  { ...PHONE_REST, country: "GB", phone: "20 7946 0958", region: "AP · Tokyo", email: "team@riskora" },
  { ...PHONE_REST, country: "GB", phone: "20 7946 0958", region: "AP · Tokyo", email: "team@riskora.com" },
  { ...PHONE_REST, country: "GB", phone: "20 7946 0958", region: "AP · Tokyo", email: "team@riskora.com" },
];

function PhoneField() {
  const { value, setValue, stop } = useShowcaseDemo("c-phone-input", PHONE_FRAMES, { interval: 800 });
  const update = (key: keyof typeof PHONE_REST) => (next: string) => setValue((current) => ({ ...current, [key]: next }));
  const complete = isCompleteEmail(value.email);
  const error = value.email !== "" && !complete;
  return (
    <ShowcaseCard id="c-phone-input" caption="<PhoneInput> flag · caret · dial code · <Field> adds the one message line no control owns">
      <PhoneInput label="Mobile" country={value.country} value={value.phone} onCountryChange={update("country")} onChangeText={update("phone")} onFocus={stop} testID="section-demo-phone-number" />
      <Column relaxed>
        <Divider />
        <Field label="Region" helper="Where tokens and assets are stored.">
          <Select accessibilityLabel="Region" options={REGIONS} value={value.region} onSelect={update("region")} onOpenChange={stop} />
        </Field>
      </Column>
      <Field label="Contact email" helper={complete ? "Address complete." : "Use a complete email address."} error={error ? "Add the domain, e.g. team@riskora.com" : undefined}>
        <Input error={error} value={value.email} onChangeText={update("email")} onFocus={stop} accessibilityLabel="Contact email" />
      </Field>
    </ShowcaseCard>
  );
}

/** FilterPanel: two groups of counted options. */
const FILTER_FRAMES = [
  ["active", "mobile"], ["active", "invited", "mobile"],
  ["active", "invited", "mobile", "design"], ["invited", "design"],
  [], ["active"], ["active", "mobile"],
];

function Filters() {
  const { value, setValue } = useShowcaseDemo("c-filter-panel", FILTER_FRAMES, { interval: 1150 });
  return (
    <ShowcaseCard id="c-filter-panel" caption="<FilterPanel> grouped checkbox options · count badges · Clear header · counts light up once checked">
      <FilterPanel
        bordered
        value={value}
        onSelectionChange={setValue}
        testID="section-demo-filters"
        groups={[
          { title: "Status", options: [{ value: "active", label: "Active", count: "18" }, { value: "invited", label: "Invited", count: "4" }, { value: "suspended", label: "Suspended", count: "2" }] },
          { title: "Team", options: [{ value: "platform", label: "Platform", count: "6" }, { value: "design", label: "Design", count: "4" }, { value: "mobile", label: "Mobile", count: "5" }, { value: "data", label: "Data", count: "6" }] },
        ]}
      />
    </ShowcaseCard>
  );
}

/** A keyboard hint: the keycap and what it does. */
function Hint({ keys, children }: { keys: string; children: ReactNode }) {
  return (
    <Row snug alignCenter>
      <Kbd>{keys}</Kbd>
      <Typography small subtle>{children}</Typography>
    </Row>
  );
}

/** Form · two-column · titled sections · actions. */
const FORM_ROLES = ["Admin", "Editor", "Viewer"];
const FORM_REST = {
  name: "", url: "riskora", region: "EU · Frankfurt", fiscal: "January",
  description: "", allowGuests: true, role: "Editor", saved: false,
};
const FORM_DRAFT = { ...FORM_REST, name: "Riskora Studio", url: "riskora-studio", region: "US · Virginia" };
const FORM_COMPLETE = { ...FORM_DRAFT, description: "Design tokens and components for the studio.", allowGuests: false, role: "Viewer" };
const FORM_FRAMES = [
  FORM_REST, FORM_REST,
  { ...FORM_REST, name: "Risk" },
  { ...FORM_REST, name: "Riskora Studio", url: "riskora-st" },
  FORM_DRAFT,
  { ...FORM_DRAFT, description: "Design tokens and" },
  FORM_COMPLETE,
  { ...FORM_COMPLETE, saved: true },
  { ...FORM_COMPLETE, saved: true },
];

function FormCard() {
  const { value, setValue, stop } = useShowcaseDemo("c-form", FORM_FRAMES, { interval: 700 });
  const update = <K extends keyof typeof FORM_REST>(key: K) => (next: (typeof FORM_REST)[K]) => setValue((current) => ({ ...current, [key]: next, saved: false }));
  return (
    <ShowcaseCard
      id="c-form"
      title="Form · two-column · titled sections · actions"
      meta="↵ submits"
      caption="<Form> + <FormSection> · stacked or two-column · titled sections · submit and cancel row · ↵ submits · you stitch the fields inside"
    >
      {/* Each FormSection is an aside section: its heading in a rail beside its rows, the
          rail stacking over the rows in a narrow card. The Workspace fields pair in a Grid
          of 240 px tiles (the hand-off's auto-fit grid), the Description spanning both. The
          keyboard hints lead the actions row. */}
      <Form
        submitLabel={value.saved ? "Changes saved" : "Save changes"}
        cancelLabel="Cancel"
        accessibilityLabel="Workspace settings"
        onSubmit={() => setValue((current) => ({ ...current, saved: true }))}
        onCancel={() => setValue(FORM_REST)}
        testID="section-demo-workspace-form"
        hints={
          <Row relaxed wrap alignCenter>
            <Hint keys="↵">to save</Hint>
            <Hint keys="esc">to discard</Hint>
          </Row>
        }
      >
        <FormSection aside title="Workspace" description="Shown to everyone you invite, on invoices and in the sidebar.">
          <Grid relaxed minTileWidth={240} columns={2}>
            <Input label="Name" placeholder="Riskora" value={value.name} onChangeText={update("name")} onFocus={stop} />
            <Input label="URL" prefix="canvas.app/" value={value.url} onChangeText={update("url")} onFocus={stop} />
            <Select label="Region" options={REGIONS} value={value.region} onSelect={update("region")} onOpenChange={stop} />
            <Input label="Fiscal year starts" trailingIcon icon="calendar" value={value.fiscal} onChangeText={update("fiscal")} onFocus={stop} />
            <GridItem full>
              <Textarea label="Description" rows={2} placeholder="What this workspace is for…" value={value.description} onChangeText={update("description")} onFocus={stop} />
            </GridItem>
          </Grid>
        </FormSection>
        <FormSection aside title="Members" description="Defaults for people who join from an invite link.">
          <Switch checked={value.allowGuests} onChange={update("allowGuests")} description="Guests see only the boards they are added to.">Allow guests</Switch>
          <Select label="Default role" options={FORM_ROLES} value={value.role} onSelect={update("role")} onOpenChange={stop} />
        </FormSection>
      </Form>
    </ShowcaseCard>
  );
}

export function Cards() {
  return (
    <ShowcaseGrid minTileWidth={340}>
      <InputStates />
      <SelectTextarea />
      <Addons />
      <AutocompleteListbox />
      <PhoneField />
      <Filters />
      <GridItem full><FormCard /></GridItem>
    </ShowcaseGrid>
  );
}
