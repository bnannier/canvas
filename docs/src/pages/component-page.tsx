import { useParams } from "react-router-dom";
import { getComponent } from "@/data/components";
import { ExampleCard } from "@/components/example-card";
import { ClassTable } from "@/components/class-table";
import { CodeBlock } from "@/components/code-block";
import { Toc } from "@/components/toc";
import { NotFound } from "./not-found";

export function ComponentPage() {
  const { slug } = useParams<{ slug: string }>();
  const comp = slug ? getComponent(slug) : undefined;

  if (!comp) return <NotFound />;

  const tocItems = [
    { id: "import", label: "Import" },
    { id: "examples", label: "Examples" },
    { id: "classes", label: "CSS Classes" },
    ...(comp.notes ? [{ id: "notes", label: "Notes" }] : []),
  ];

  const importCode = `@import "@olympusoss/canvas/styles/${comp.cssFile}";`;

  return (
    <div className="docs-content">
      <div style={{ minWidth: 0 }}>
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="page-header-title"><h1>{comp.name}</h1></div>
            <p className="sub">{comp.description}</p>
          </div>
          <div className="page-header-actions">
            <span className="badge badge-secondary">{comp.category}</span>
          </div>
        </div>

        <section id="import" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Import</h2>
          <CodeBlock code={importCode} language="css" />
          <p className="small muted" style={{ marginTop: "0.5rem" }}>
            Or use the all-in-one entry point: <code className="code">@import "@olympusoss/canvas/styles/canvas.css"</code>
          </p>
        </section>

        <section id="examples" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "1rem" }}>Examples</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {comp.examples.map((ex, i) => (
              <ExampleCard key={i} example={ex} />
            ))}
          </div>
        </section>

        <section id="classes" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>CSS Classes</h2>
          <ClassTable classes={comp.classes} />
        </section>

        {comp.notes && (
          <section id="notes" className="docs-section" style={{ marginBottom: "2rem" }}>
            <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Notes</h2>
            <p className="body">{comp.notes}</p>
          </section>
        )}
      </div>

      <div style={{ display: "none" }} className="docs-toc-col">
        <Toc items={tocItems} />
      </div>
      <style>{`
        @media (min-width: 1280px) {
          .docs-toc-col { display: block !important; }
        }
      `}</style>
    </div>
  );
}
