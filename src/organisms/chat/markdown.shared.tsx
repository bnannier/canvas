import { useMemo, type ComponentType } from "react";
import { View, Text, FILL, useTheme } from "../../style/index.js";
import { Checkbox as WebCheckbox, type CheckboxProps } from "../../atoms/checkbox/checkbox.js";
import { Divider as WebDivider, type DividerProps } from "../../atoms/divider/divider.js";
import { DataTable as WebDataTable, type DataTableProps } from "../data-table/data-table.js";
import { markdownBlocks, markdownRuns } from "./markdown.logic.js";
import * as s from "./markdown.styles.js";

export interface MarkdownProps {
  /** Untrusted Markdown source. HTML, URLs and images remain inert text. */
  children: string;
  /** Denser document typography using Canvas's body reading scale. */
  compact?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}
export interface MarkdownParts { Checkbox: ComponentType<CheckboxProps>; DataTable: ComponentType<DataTableProps>; Divider: ComponentType<DividerProps> }
function Inline({ value }: { value: string }) {
  return <>{markdownRuns(value).map((run, index) => <Text key={index} style={[run.strong ? s.strong : null, run.emphasis ? s.emphasis : null, run.code ? s.code : null]}>{run.text}</Text>)}</>;
}
/** Shared with ChatMessage; its existing skin keeps conversation typography intact. */
export function createMarkdown(skin: s.MarkdownSkin, { Checkbox = WebCheckbox, DataTable = WebDataTable, Divider = WebDivider }: Partial<MarkdownParts> = {}, fillRoot = true) {
  return function Markdown({ children, compact, accessibilityLabel, testID }: MarkdownProps) {
    const { tokens } = useTheme();
    const blocks = useMemo(() => markdownBlocks(children), [children]);
    const body = skin.body(tokens, compact);
    return <View testID={testID} accessibilityLabel={accessibilityLabel} style={[fillRoot ? FILL : null, s.root]}>
      {blocks.map((block, index) => {
        if (block.kind === "rule") return <Divider key={index} />;
        if (block.kind === "table") {
          const count = Math.max(block.columns?.length ?? 0, ...block.rows!.map(row => row.length));
          return <DataTable key={index} compact stacks columns={Array.from({ length: count }, (_, column) => markdownRuns(block.columns?.[column] ?? "").map(run => run.text).join(""))}
            rows={block.rows!.map(row => Array.from({ length: count }, (_, column) => <Text key={column} selectable style={body}><Inline value={row[column] ?? ""} /></Text>))} />;
        }
        if (block.kind === "list" && block.checked !== undefined) return <View key={index} style={[s.list, s.indent(block.indent)]}><Checkbox selection small disabled checked={block.checked} accessibilityLabel={markdownRuns(block.text).map(run => run.text).join("")} /><Text selectable style={[body, s.listText]}><Inline value={block.text} /></Text></View>;
        const text = <Text selectable accessibilityRole={block.kind === "heading" ? "header" : undefined} aria-level={block.level}
          style={[body, block.kind === "heading" ? skin.heading(tokens, block.level ?? 1, compact) : null, block.kind === "code" ? s.code : null, block.kind === "list" ? s.listText : null]}>{block.kind === "code" ? block.text : <Inline value={block.text} />}</Text>;
        if (block.kind === "list") return <View key={index} style={[s.list, s.indent(block.indent)]}><Text style={body}>{block.marker}</Text>{text}</View>;
        return <View key={index} style={block.kind === "quote" ? s.quote(tokens) : undefined}>{text}</View>;
      })}
    </View>;
  };
}
