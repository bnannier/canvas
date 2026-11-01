import { useRef, useState } from "react";
import { type TextInput } from "react-native";
import { Alert, Badge, Card, Column, DescriptionList, Field, Form, Grid, Input, Row, Switch, Typography } from "@nannier/canvas";

type Profile = { name: string; email: string; updates: boolean; digest: boolean };
const initial: Profile = { name: "Alex Morgan", email: "alex@example.com", updates: true, digest: false };
export const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function useSettings() {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [attempted, setAttempted] = useState(false);
  const [notice, setNotice] = useState("");
  const errors = {
    name: attempted && draft.name.trim().length < 2 ? "Enter a name with at least two characters." : undefined,
    email: attempted && !validEmail(draft.email.trim()) ? "Enter a valid email address." : undefined,
  };
  const update = (patch: Partial<Profile>) => { setDraft((value) => ({ ...value, ...patch })); setNotice(""); };
  const save = () => {
    setAttempted(true);
    if (draft.name.trim().length < 2 || !validEmail(draft.email.trim())) return false;
    const next = { ...draft, name: draft.name.trim(), email: draft.email.trim() };
    setSaved(next); setDraft(next); setAttempted(false); setNotice("Settings saved for this session.");
    return true;
  };
  const cancel = () => { setDraft(saved); setAttempted(false); setNotice("Unsaved changes discarded."); };
  return { saved, draft, errors, update, save, cancel, notice };
}

export function Settings({ model }: { model: ReturnType<typeof useSettings> }) {
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const submit = () => {
    if (!model.save()) {
      if (model.draft.name.trim().length < 2) nameRef.current?.focus();
      else emailRef.current?.focus();
    }
  };
  return <Column loose>
    <Column snug>
      <Row wrap snug alignCenter><Badge primary>01 / Settings</Badge><Typography small muted>Personal workspace</Typography></Row>
      <Typography h1>Make it yours.</Typography>
      <Typography lead muted>Keep your profile current and choose the updates you want to receive.</Typography>
    </Column>
    {model.notice ? <Alert success title={model.notice} /> : null}
    <Grid columns={2} minTileWidth={340} loose>
      <Card><Column loose>
        <Column tight><Typography h2>Profile & notifications</Typography><Typography muted>Edit your draft, then save or cancel.</Typography></Column>
        <Form accessibilityLabel="Profile settings" submitLabel="Save settings" cancelLabel="Cancel changes" onSubmit={submit} onCancel={model.cancel}>
          <Field label="Full name" required helper="Use at least two characters." error={model.errors.name}>
            <Input testID="settings-name" ref={nameRef} value={model.draft.name} onChangeText={(name) => model.update({ name })} autoComplete="name" />
          </Field>
          <Field label="Email address" required helper="Used for the sample notification preferences below." error={model.errors.email}>
            <Input testID="settings-email" ref={emailRef} value={model.draft.email} onChangeText={(email) => model.update({ email })} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          </Field>
          <Column tight>
            <Switch listed accessibilityLabel="Project updates" checked={model.draft.updates} onChange={(updates) => model.update({ updates })} description="Important changes to your projects.">Project updates</Switch>
            <Switch listed divided accessibilityLabel="Weekly digest" checked={model.draft.digest} onChange={(digest) => model.update({ digest })} description="A weekly recap of activity in your workspace.">Weekly digest</Switch>
          </Column>
        </Form>
      </Column></Card>
      <Card><Column loose>
        <Column tight><Typography h2>Saved profile</Typography><Typography muted>The saved summary changes only after a successful save.</Typography></Column>
        <DescriptionList divided items={[
          { term: "Full name", value: model.saved.name },
          { term: "Email", value: model.saved.email },
          { term: "Project updates", value: model.saved.updates ? "On" : "Off" },
          { term: "Weekly digest", value: model.saved.digest ? "On" : "Off" },
        ]} />
        <Alert info title="A frontend recipe" description="These preferences live in memory. No email is sent, and reloading restores the sample profile." />
      </Column></Card>
    </Grid>
  </Column>;
}
