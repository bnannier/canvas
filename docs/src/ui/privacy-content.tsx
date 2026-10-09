import { Card, Column, DescriptionList, Divider, Typography } from "@nannier/canvas";
import {
  PRIVACY_EFFECTIVE, PRIVACY_INTRO, PRIVACY_ISSUES_URL, PRIVACY_NETWORK_COLUMNS,
  PRIVACY_NETWORK_INTRO, PRIVACY_NETWORK_OUTRO, PRIVACY_NETWORK_ROWS,
  PRIVACY_NOT_DONE, PRIVACY_SECTIONS, PRIVACY_SUMMARY, PRIVACY_TITLE,
} from "../data/privacy-policy";

/** One Canvas composition for the app and the script-free public policy. */
export function PrivacyContent({ onContact }: { onContact?: () => void }) {
  return <Column loose>
    <Column snug>
      <Typography h1>{PRIVACY_TITLE}</Typography>
      <Typography lead muted>{PRIVACY_INTRO}</Typography>
    </Column>
    <Column relaxed>
      <Typography h2>Summary</Typography>
      <Typography muted>{PRIVACY_SUMMARY}</Typography>
    </Column>
    <Divider />
    <Column relaxed>
      <Typography h2>What Canvas does not do</Typography>
      {PRIVACY_NOT_DONE.map(item => <Card key={item.title}>
        <Column tight>
          <Typography h3>{item.title}</Typography>
          <Typography muted>{item.description}</Typography>
        </Column>
      </Card>)}
    </Column>
    <Divider />
    <Column relaxed>
      <Typography h2>Network connections</Typography>
      <Typography muted>{PRIVACY_NETWORK_INTRO}</Typography>
      {PRIVACY_NETWORK_ROWS.map(row => <DescriptionList key={row[0]} card stacked divided title={row[0]} subtitle={PRIVACY_NETWORK_COLUMNS[0]}
        items={PRIVACY_NETWORK_COLUMNS.slice(1).map((term, index) => ({ term, value: row[index + 1]! }))} />)}
      <Typography muted>{PRIVACY_NETWORK_OUTRO}</Typography>
    </Column>
    {PRIVACY_SECTIONS.map(section => <Column key={section.title} loose>
      <Divider />
      <Column relaxed>
        <Typography h2>{section.title}</Typography>
        <Typography muted>{section.description}</Typography>
      </Column>
    </Column>)}
    <Divider />
    <Column snug>
      <Typography small muted>{`Effective ${PRIVACY_EFFECTIVE}.`}</Typography>
      <Typography small muted>Questions and privacy requests:</Typography>
      <Typography primary underline href={PRIVACY_ISSUES_URL} onPress={onContact}>Open an issue</Typography>
    </Column>
  </Column>;
}
