import type { ReactNode } from "react";
import {
  Autocomplete,
  Card,
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
  useFormFactor,
} from "@nannier/canvas";
import { ShowcaseCard, ShowcaseGrid, VignetteStage } from "../ui/showcase";

// The Inputs section page (`Canvas v4.0.0 Inputs.dc.html`): its hero vignette and its seven
// cards, composed of live kit fields with the hand-off's copy. An option list the hand-off
// draws open (the Select, the Autocomplete, the PhoneInput's country list) is an anchored
// overlay in the kit: open, it would cover the card's next rows, and on a phone it presents
// as a sheet over the whole page (AO-6), so each starts closed and opens on press. The differences are recorded in the Phase 5 report.

/** The hero's still frame: a focused URL field and an empty verification code. */
export function Vignette() {
  // Six full-size cells overrun a phone-width stage; the small cells fit it.
  const phone = useFormFactor() === "phone";
  return (
    <VignetteStage>
      <Card raised>
        <Column relaxed>
          <InteractionOverride focused>
            <Input label="Workspace URL" suffix=".canvas.dev" accessibilityLabel="Workspace URL" />
          </InteractionOverride>
          <Field label="Verification code">
            <InputOTP length={6} small={phone} />
          </Field>
        </Column>
      </Card>
    </VignetteStage>
  );
}

/** Input · States: helper, focused, icon, error and disabled. */
function InputStates() {
  return (
    <ShowcaseCard id="c-input" caption={"<Input label=\"Workspace name\"> · <Input error> · <Input disabled> · the message line is <Field>'s"}>
      <Field label="Workspace name" helper="Shown in the sidebar and on invoices.">
        <Input placeholder="e.g. Riskora" accessibilityLabel="Workspace name" />
      </Field>
      <InteractionOverride focused>
        <Input label="Focused" defaultValue="Canvas v4.0.0" />
      </InteractionOverride>
      <Input label="With icon and shortcut" leadingIcon icon="search" placeholder="Search components…" shortcut="⌘K" />
      <Field label="Email" error="Enter a complete address.">
        <Input error defaultValue="bobby@nannier" accessibilityLabel="Email" />
      </Field>
      <Input label="Disabled" disabled defaultValue="Managed by SSO" />
    </ShowcaseCard>
  );
}

const ROLES = ["Design engineer", "Product designer", "Frontend engineer", "Founder"];

/** Select · Textarea · InputOTP. */
function SelectTextarea() {
  return (
    <ShowcaseCard id="c-select" caption={"<Select label=\"Role\" options={roles}> · <Textarea rows={3} maxLength={500}> · <InputOTP length={6}>"}>
      <Select label="Role" options={ROLES} defaultValue="Design engineer" />
      <Field label="Notes" helper="Markdown supported">
        <Textarea rows={3} maxLength={500} showCount placeholder="Anything the reviewer should know…" accessibilityLabel="Notes" />
      </Field>
      <Field label="One-time code">
        {/* Held focused: the active cell and its caret, the hand-off's focus state. */}
        <InteractionOverride focused>
          <InputOTP length={6} defaultValue="481" />
        </InteractionOverride>
      </Field>
    </ShowcaseCard>
  );
}

/** Input · addons · affordances. */
function Addons() {
  return (
    <ShowcaseCard
      id="c-input-addons"
      caption={"<Input prefix=\"https://\" suffix=\".canvas.app\"> · leadingIcon · passwordToggle · clearable · small · large · raw <TextInput> stays unskinned"}
    >
      <Input label="Workspace URL" prefix="https://" suffix=".canvas.app" defaultValue="riskora" />
      <Input label="Email" leadingIcon icon="mail" defaultValue="bobby@nannier.com" />
      <Input label="Password" leadingIcon icon="lock" passwordToggle secureTextEntry defaultValue="canvas-v4-glass" />
      <Input label="Search tokens" leadingIcon icon="search" clearable defaultValue="--ion" />
      <Row snug alignEnd>
        <Input small placeholder="small" accessibilityLabel="Small field" />
        <Input placeholder="default" accessibilityLabel="Default field" />
        <Input large placeholder="large" accessibilityLabel="Large field" />
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
function AutocompleteListbox() {
  return (
    <ShowcaseCard id="c-autocomplete" caption="<Autocomplete> searchable single-select · <Listbox> rich rows that stay on screen, single or multi">
      <InteractionOverride focused>
        <Autocomplete label="Runtime" options={RUNTIMES} defaultQuery="re" />
      </InteractionOverride>
      <Column relaxed>
        <Divider />
        <Field label="Notify me about">
          <Listbox
            multi
            bordered
            accessibilityLabel="Notify me about"
            defaultSelected={[0, 2]}
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
function PhoneField() {
  return (
    <ShowcaseCard id="c-phone-input" caption="<PhoneInput> flag · caret · dial code · <Field> adds the one message line no control owns">
      <PhoneInput label="Mobile" defaultCountry="US" defaultValue="(415) 555-0132" />
      <Column relaxed>
        <Divider />
        <Field label="Region" helper="Where tokens and assets are stored.">
          <Select accessibilityLabel="Region" options={["EU · Frankfurt", "US · Virginia", "AP · Tokyo"]} defaultValue="EU · Frankfurt" />
        </Field>
      </Column>
      <Field label="Contact email" error="Add the domain, e.g. team@riskora.com">
        <Input error defaultValue="team@" accessibilityLabel="Contact email" />
      </Field>
    </ShowcaseCard>
  );
}

/** FilterPanel: two groups of counted options. */
function Filters() {
  return (
    <ShowcaseCard id="c-filter-panel" caption="<FilterPanel> grouped checkbox options · count badges · Clear header · counts light up once checked">
      <FilterPanel
        bordered
        groups={[
          { title: "Status", options: [{ label: "Active", checked: true, count: "18" }, { label: "Invited", count: "4" }, { label: "Suspended", count: "2" }] },
          { title: "Team", options: [{ label: "Platform", count: "6" }, { label: "Design", count: "4" }, { label: "Mobile", checked: true, count: "5" }, { label: "Data", count: "6" }] },
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
function FormCard() {
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
        submitLabel="Save changes"
        cancelLabel="Cancel"
        accessibilityLabel="Workspace settings"
        hints={
          <Row relaxed wrap alignCenter>
            <Hint keys="↵">to save</Hint>
            <Hint keys="esc">to discard</Hint>
          </Row>
        }
      >
        <FormSection aside title="Workspace" description="Shown to everyone you invite, on invoices and in the sidebar.">
          <Grid relaxed minTileWidth={240} columns={2}>
            <Input label="Name" placeholder="Riskora" />
            <Input label="URL" prefix="canvas.app/" defaultValue="riskora" />
            <Select label="Region" options={["EU · Frankfurt", "US · Virginia", "AP · Tokyo"]} defaultValue="EU · Frankfurt" />
            <Input label="Fiscal year starts" trailingIcon icon="calendar" defaultValue="January" />
            <GridItem full>
              <Textarea label="Description" rows={2} placeholder="What this workspace is for…" />
            </GridItem>
          </Grid>
        </FormSection>
        <FormSection aside title="Members" description="Defaults for people who join from an invite link.">
          <Switch defaultChecked description="Guests see only the boards they are added to.">Allow guests</Switch>
          <Select label="Default role" options={["Admin", "Editor", "Viewer"]} defaultValue="Editor" />
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
