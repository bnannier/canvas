import { useMemo, type ComponentType } from "react";
import { View, Text, ScrollView, FILL, useTheme } from "../../style/index.js";
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
  /** Compact monospace transcript, with flat horizontally scrolling tables. */
  terminal?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}
export interface MarkdownParts { Checkbox: ComponentType<CheckboxProps>; DataTable: ComponentType<DataTableProps>; Divider: ComponentType<DividerProps> }
function Inline({ value, terminal }: { value: string; terminal?: boolean }) {
  const { tokens } = useTheme();
  return <>{markdownRuns(value).map((run, index) => <Text key={index} style={[run.strong ? s.strong : null, run.emphasis ? s.emphasis : null, run.code ? terminal ? s.terminalCode : s.code(tokens) : null]}>{run.text}</Text>)}</>;
}
/** Shared with ChatMessage; its existing skin keeps conversation typography intact. */
export function createMarkdown(skin: s.MarkdownSkin, { Checkbox = WebCheckbox, DataTable = WebDataTable, Divider = WebDivider }: Partial<MarkdownParts> = {}, fillRoot = true) {
  return function Markdown({ children, compact, terminal, accessibilityLabel, testID }: MarkdownProps) {
    const { tokens } = useTheme();
    const blocks = useMemo(() => markdownBlocks(children), [children]);
    const body = terminal ? s.terminalBody(tokens) : skin.body(tokens, compact);
    return <View testID={testID} accessibilityLabel={accessibilityLabel} style={[fillRoot ? FILL : null, s.root(terminal || compact)]}>
      {blocks.map((block, index) => {
        if (block.kind === "rule") return <Divider key={index} />;
        if (block.kind === "table") {
          const count = Math.max(block.columns?.length ?? 0, ...block.rows!.map(row => row.length));
          if (terminal) {
            const cells = [block.columns ?? [], ...block.rows!];
            const widths = Array.from({ length: count }, (_, column) => Math.ceil((Math.min(40, Math.max(6, ...cells.map(row => markdownRuns(row[column] ?? "").map(run => run.text).join("").length))) + 1) * 8) + 16);
            return <ScrollView key={index} horizontal nestedScrollEnabled><View role="table" style={s.terminalTable}>
              {cells.map((row, rowIndex) => <View key={rowIndex} role="row" style={[s.terminalTableRow, rowIndex === 0 ? s.terminalTableHeader(tokens) : null]}>
                {Array.from({ length: count }, (_, column) => <View key={column} role={rowIndex === 0 ? "columnheader" : "cell"} style={s.terminalTableCell(widths[column])}>
                  <Text selectable style={[body, rowIndex === 0 ? s.strong : null]}><Inline terminal value={row[column] ?? ""} /></Text>
                </View>)}
              </View>)}
            </View></ScrollView>;
          }
          return <DataTable key={index} compact stacks columns={Array.from({ length: count }, (_, column) => markdownRuns(block.columns?.[column] ?? "").map(run => run.text).join(""))}
            rows={block.rows!.map(row => Array.from({ length: count }, (_, column) => <Text key={column} selectable style={body}><Inline terminal={terminal} value={row[column] ?? ""} /></Text>))} />;
        }
        if (block.kind === "list" && block.checked !== undefined) return <View key={index} style={[s.list, s.indent(block.indent)]}><Checkbox selection small disabled checked={block.checked} accessibilityLabel={markdownRuns(block.text).map(run => run.text).join("")} /><Text selectable style={[body, s.listText]}><Inline terminal={terminal} value={block.text} /></Text></View>;
        const text = <Text selectable accessibilityRole={block.kind === "heading" ? "header" : undefined} aria-level={block.level}
          style={[body, block.kind === "heading" ? terminal ? s.terminalHeading : skin.heading(tokens, block.level ?? 1, compact) : null, block.kind === "code" ? terminal ? s.terminalCode : s.code(tokens) : null, block.kind === "list" ? s.listText : null]}>{block.kind === "code" ? block.text : <Inline terminal={terminal} value={block.text} />}</Text>;
        if (block.kind === "list") return <View key={index} style={[s.list, s.indent(block.indent)]}><Text style={[body, s.marker(tokens)]}>{block.marker}</Text>{text}</View>;
        return <View key={index} style={block.kind === "quote" ? s.quote(tokens) : undefined}>{text}</View>;
      })}
    </View>;
  };
}
