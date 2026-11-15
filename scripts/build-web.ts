import ts from "typescript";
import { dirname, resolve } from "node:path";
import { mkdirSync } from "node:fs";

// TypeScript's inlineSources embeds JS-map sources but omits declaration-map
// sources. Embed both at emit time: src/ is deliberately absent from npm packs.
const writeWithSources: ts.WriteFileCallback = (file, text, writeByteOrderMark) => {
  if (file.endsWith(".map")) {
    const map = JSON.parse(text);
    map.sourcesContent = map.sources.map((source: string) => {
      const original = ts.sys.readFile(resolve(dirname(file), map.sourceRoot ?? "", source));
      if (original === undefined) throw new Error(`${file}: cannot embed source ${source}`);
      return original;
    });
    text = JSON.stringify(map);
  }
  mkdirSync(dirname(file), { recursive: true });
  ts.sys.writeFile(file, text, writeByteOrderMark);
};

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (file) => file,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
};
function report(diagnostics: readonly ts.Diagnostic[]) {
  if (diagnostics.length) console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost));
}

export function buildWeb(configFile = resolve("tsconfig.build.json")): boolean {
  const config = ts.getParsedCommandLineOfConfigFile(configFile, {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => report([diagnostic]),
  });
  if (!config) return false;
  const program = ts.createProgram(config.fileNames, config.options);
  const emit = program.emit(undefined, writeWithSources);
  const diagnostics = [...config.errors, ...ts.getPreEmitDiagnostics(program), ...emit.diagnostics];
  report(diagnostics);
  return !emit.emitSkipped && !diagnostics.some((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
}

export function watchWeb(configFile = resolve("tsconfig.build.json")) {
  const host = ts.createWatchCompilerHost(configFile, {}, ts.sys, ts.createEmitAndSemanticDiagnosticsBuilderProgram,
    (diagnostic) => report([diagnostic]),
    (diagnostic) => console.log(`[web] ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine)}`));
  host.writeFile = writeWithSources;
  return ts.createWatchProgram(host);
}

if (import.meta.main) {
  if (process.argv.includes("--watch")) watchWeb();
  else process.exitCode = buildWeb() ? 0 : 1;
}
