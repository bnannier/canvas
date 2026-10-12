import { Column } from "@nannier/canvas";
import { Input as AndroidInput } from "../../../../../src/atoms/input/input.android";
import { Select as AndroidSelect } from "../../../../../src/atoms/select/select.android";
import { Autocomplete as AndroidAutocomplete } from "../../../../../src/atoms/autocomplete/autocomplete.android";
import { Textarea as AndroidTextarea } from "../../../../../src/atoms/textarea/textarea.android";
import { Page, PageHeader } from "../../../ui/page";

// The Android floating label, the one place it renders on the web: every field family that
// floats its label, each with a label longer than a phone-width field holds, at rest and
// filled. The label must stay inside its field and clear of a trailing chevron or toggle,
// truncating with an ellipsis, while the field's accessible name stays the whole label
// (e2e/behavior/floating-label.e2e.ts). Browser skin comparisons remain docs-only, as on
// the form-autocomplete page.
const LONG = "the name of the project as it appears on every invoice we send";
const REGIONS = ["Europe", "United States"];

export default function FloatingLabelFixture() {
  return (
    <Page>
      <PageHeader title="Floating label" description="Android's floating label with a label longer than its field." />
      <Column relaxed>
        <AndroidInput label={`Input: ${LONG}`} />
        <AndroidInput label={`Filled input: ${LONG}`} defaultValue="Canvas" />
        <AndroidSelect label={`Select: ${LONG}`} options={REGIONS} />
        <AndroidSelect label={`Filled select: ${LONG}`} options={REGIONS} defaultValue="Europe" />
        <AndroidAutocomplete label={`Autocomplete: ${LONG}`} options={REGIONS} />
        <AndroidTextarea label={`Textarea: ${LONG}`} rows={3} />
      </Column>
    </Page>
  );
}
