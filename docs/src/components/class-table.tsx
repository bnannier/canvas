import type { CssClass } from "@/data/types";

interface ClassTableProps {
  classes: CssClass[];
}

export function ClassTable({ classes }: ClassTableProps) {
  return (
    <div className="dt-wrap">
      <div className="dt-scroll">
        <table className="dt-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.name}>
                <td>
                  <code className="code">{c.name}</code>
                </td>
                <td>
                  <span className="docs-class-type">{c.type}</span>
                </td>
                <td>{c.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
