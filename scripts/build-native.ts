import ts from "typescript";
import { resolve } from "node:path";

// Keep web ESM's explicit extensions intact. Metro must see an extensionless
// relative JS request to choose a sibling .ios.js or .android.js before .js.
export const nativeSpecifiers: ts.TransformerFactory<ts.SourceFile> = (context) => {
  const visit: ts.Visitor = (node) => {
    if (ts.isStringLiteral(node) && /^\.\.?\/.*\.js$/.test(node.text)) {
      const parent = node.parent;
      const moduleSpecifier =
        ((ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) && parent.moduleSpecifier === node) ||
        (ts.isCallExpression(parent) && parent.arguments[0] === node &&
          (parent.expression.kind === ts.SyntaxKind.ImportKeyword ||
            (ts.isIdentifier(parent.expression) && parent.expression.text === "require")));
      if (moduleSpecifier) {
        const literal = ts.factory.createStringLiteral(node.text.slice(0, -3));
        // Original-node identity alone does not retain the literal's source-map
        // segment. Carry its range too, so shortened requests map to their source.
        return ts.setTextRange(ts.setOriginalNode(literal, node), node);
      }
    }
    return ts.visitEachChild(node, visit, context);
  };
  return (source) => ts.visitNode(source, visit) as ts.SourceFile;
};

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (file) => file,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
};
function report(diagnostics: readonly ts.Diagnostic[]) {
  if (diagnostics.length) console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost));
}

export function buildNative(configFile = resolve("tsconfig.native.json")): boolean {
  const config = ts.getParsedCommandLineOfConfigFile(configFile, {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => report([diagnostic]),
  });
  if (!config) return false;
  const program = ts.createProgram(config.fileNames, config.options);
  const emit = program.emit(undefined, undefined, undefined, undefined, { before: [nativeSpecifiers] });
  const diagnostics = [...config.errors, ...ts.getPreEmitDiagnostics(program), ...emit.diagnostics];
  report(diagnostics);
  return !emit.emitSkipped && !diagnostics.some((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
}

export function watchNative(configFile = resolve("tsconfig.native.json")) {
  const host = ts.createWatchCompilerHost(configFile, {}, ts.sys, ts.createEmitAndSemanticDiagnosticsBuilderProgram,
    (diagnostic) => report([diagnostic]),
    (diagnostic) => console.log(`[native] ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine)}`));
  // Replace the default emitter so EVERY incremental build uses the transformer.
  host.afterProgramCreate = (program) => {
    const emit = program.emit(undefined, undefined, undefined, undefined, { before: [nativeSpecifiers] });
    const diagnostics = [...ts.getPreEmitDiagnostics(program.getProgram()), ...emit.diagnostics];
    report(diagnostics);
    console.log(`[native] ${emit.emitSkipped ? "Emit skipped" : "Build complete"}, ${diagnostics.filter((d) => d.category === ts.DiagnosticCategory.Error).length} errors.`);
  };
  return ts.createWatchProgram(host);
}

if (import.meta.main) {
  if (process.argv.includes("--watch")) watchNative();
  else process.exitCode = buildNative() ? 0 : 1;
}
