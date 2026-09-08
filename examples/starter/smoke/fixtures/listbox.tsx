import { useState } from "react";
import { Button, Checkbox, Column, Listbox, Row, Typography } from "@nannier-com/canvas";

const teams = [{ label: "Backend" }, { label: "Frontend", detail: "Web applications" }, { label: "Design" }];

export function ListboxBody({ controlled = false }: { controlled?: boolean }) {
  const isControlled = controlled;
  const [single, setSingle] = useState(0);
  const [multi, setMulti] = useState<number[]>([]);
  const [singleChanges, setSingleChanges] = useState(0);
  const [singlePicks, setSinglePicks] = useState(0);
  const [multiChanges, setMultiChanges] = useState(0);
  const [multiPicks, setMultiPicks] = useState(0);

  return (
      <Column relaxed testID="listbox-checks">
        <Column snug>
          <Typography h2>Single selection</Typography>
          <Listbox bordered items={teams} accessibilityLabel="Primary team" defaultSelected={0}
            selected={isControlled ? single : undefined}
            onChange={(next) => {
              setSingle(Array.isArray(next) ? next[0] : next);
              setSingleChanges((count) => count + 1);
            }} onSelect={() => setSinglePicks((count) => count + 1)} />
          <Typography small muted testID="single-change-count">Changes: {singleChanges}</Typography>
          <Typography small muted testID="single-pick-count">Picks: {singlePicks}</Typography>
        </Column>
        <Column snug>
          <Typography h2>Multiple selections</Typography>
          <Button ghost small>Before teams</Button>
          <Listbox bordered multi items={teams} accessibilityLabel="Project teams" testID="project-teams"
            selected={isControlled ? multi : undefined}
            onChange={(next) => {
              setMulti(Array.isArray(next) ? next : [next]);
              setMultiChanges((count) => count + 1);
            }} onSelect={() => setMultiPicks((count) => count + 1)} />
          <Button ghost small>After teams</Button>
          <Typography small muted testID="multi-change-count">Changes: {multiChanges}</Typography>
          <Typography small muted testID="multi-pick-count">Picks: {multiPicks}</Typography>
        </Column>
        <Column snug>
          <Typography h2>Checkbox artwork</Typography>
          <Row relaxed wrap>
            <Checkbox>Unchecked</Checkbox>
            <Checkbox defaultChecked>Checked</Checkbox>
            <Checkbox indeterminate>Mixed</Checkbox>
            <Checkbox checked disabled>Disabled</Checkbox>
          </Row>
        </Column>
      </Column>
  );
}
