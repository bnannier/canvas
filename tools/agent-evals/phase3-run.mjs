// Manual, isolated consumer evaluation. Never runs in CI or changes the package.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const root = process.env.CANVAS_EVAL_ROOT ?? '/private/tmp/canvas-adoption-phase3';
const scaffold = process.env.CANVAS_EVAL_SCAFFOLD ?? '/private/tmp/canvas-agent-scaffold';
const [client, label, condition = 'skill', caseId = 'accessible-dialog'] = process.argv.slice(2);
if (!['codex', 'claude'].includes(client) || !/^[a-z0-9-]+$/.test(label ?? '') || !['discovery', 'skill'].includes(condition)) {
  throw new Error('Usage: node tools/agent-evals/phase3-run.mjs codex|claude label discovery|skill [case-id]');
}
const suite = JSON.parse(fs.readFileSync(path.join(repository, 'tools/agent-evals/cases.json'), 'utf8'));
const task = suite.cases.find((entry) => entry.id === caseId);
if (!task) throw new Error('Unknown case');
const emptyWorkspace = task.id === 'install-expo-rnw';
const cwd = path.join(root, label);
fs.mkdirSync(cwd, { recursive: true });
if (fs.readdirSync(cwd).length) throw new Error('Workspace must start empty');
if (!emptyWorkspace) {
  fs.cpSync(scaffold, cwd, {
    recursive: true,
    mode: fs.constants.COPYFILE_FICLONE,
    filter: (source) => !['.git', 'dist', '.expo', 'AGENTS.md', 'CLAUDE.md', '.claude', '.agents'].includes(path.relative(scaffold, source)),
  });
}
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const skillSource = path.join(repository, 'consumer/canvas');
const skillDestination = path.join(cwd, client === 'codex' ? '.agents' : '.claude', 'skills/canvas');
if (condition === 'skill') fs.cpSync(skillSource, skillDestination, { recursive: true });
const prompt = task.prompt + (condition === 'skill'
  ? '\n\nUse the Canvas consumer skill at ' + path.relative(cwd, path.join(skillDestination, 'SKILL.md')) + '. Read it before implementing this task.'
  : '');
const disabled = [];
function visit(directory) {
  if (!fs.existsSync(directory)) return;
  if (fs.existsSync(path.join(directory, 'SKILL.md'))) {
    for (const entry of new Set([directory, path.join(directory, 'SKILL.md'), fs.realpathSync(directory), fs.realpathSync(path.join(directory, 'SKILL.md'))])) disabled.push(entry);
    return;
  }
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const child = path.join(directory, entry.name);
    if (entry.name !== 'node_modules' && (entry.isDirectory() || (entry.isSymbolicLink() && fs.statSync(child).isDirectory()))) visit(child);
  }
}
visit(path.join(process.env.CODEX_HOME ?? path.join(os.homedir(), '.codex'), 'skills'));
visit(path.join(os.homedir(), '.agents/skills'));
const disabledSkills = '[' + disabled.map((entry) => `{path=${JSON.stringify(entry)},enabled=false}`).join(',') + ']';
const claudeSettings = {
  claudeMdExcludes: [path.join(os.homedir(), '.claude/CLAUDE.md'), path.join(os.homedir(), '.claude/rules/**')],
  autoMemoryEnabled: false,
  sandbox: { enabled: true, network: { allowedDomains: ['registry.npmjs.org', 'canvas.nannier.com', 'docs.expo.dev', 'expo.dev'] } },
};
const args = client === 'codex' ? [
  'exec', '--ignore-user-config', '--ephemeral', '--sandbox', 'workspace-write', '--skip-git-repo-check',
  '--model', 'gpt-6.1-sol', '-c', 'model_reasoning_effort="medium"', '-c', 'project_doc_max_bytes=0',
  '-c', 'skills.bundled.enabled=false', '-c', `skills.config=${disabledSkills}`,
  '-c', 'features.plugins=false', '-c', 'features.apps=false', '-c', 'features.memories=false',
  '-c', 'sandbox_workspace_write.network_access=true', '--json', '-',
] : [
  '-p', '--setting-sources', '', '--strict-mcp-config', '--disable-slash-commands',
  '--settings', JSON.stringify(claudeSettings), '--model', 'sonnet', '--effort', 'medium',
  '--tools', 'Bash,Edit,Read,Write,Glob,Grep,WebFetch,WebSearch',
  '--permission-mode', 'acceptEdits', '--allowedTools', 'Read,Edit,Write,Glob,Grep,WebFetch,WebSearch,Bash',
  '--no-session-persistence', '--output-format', 'stream-json', '--verbose',
];
const environmentOverrides = {
  TMPDIR: '/private/tmp', npm_config_cache: path.join(root, `${label}-npm-cache`),
  __UNSAFE_EXPO_HOME_DIRECTORY: path.join(root, `${label}-expo-state`), EXPO_NO_TELEMETRY: '1',
};
const env = { ...process.env, ...environmentOverrides };
const metadata = {
  suiteId: suite.suiteId, suiteRevision: suite.revision, caseId: task.id, client, condition, cwd, args,
  invocation: condition === 'skill' ? 'explicit_file_read; not automatic routing' : 'no consumer skill',
  startedAt: new Date().toISOString(), originalPromptSha256: hash(task.prompt), promptSha256: hash(prompt),
  promptUtf8Bytes: Buffer.byteLength(prompt), budgetMinutes: 20, maximumCorrections: 0,
  skillSha256: condition === 'skill' ? hash(fs.readFileSync(path.join(skillDestination, 'SKILL.md'))) : null,
  prerequisite: emptyWorkspace ? 'empty workspace; only consumer skill when informed' : 'verified blank Expo scaffold without Canvas',
  scaffoldMetadata: emptyWorkspace ? null : '/private/tmp/canvas-agent-scaffold-metadata.json',
  scaffoldLockfileSha256: emptyWorkspace ? null : hash(fs.readFileSync(path.join(scaffold, 'package-lock.json'))),
  environmentOverrides, instructionIsolationVerified: false,
  iosRuntime: 'not_run', androidRuntime: 'not_run', webRuntime: 'not_run',
};
const metaPath = path.join(root, `${label}-metadata.json`);
const save = () => fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2) + '\n');
save();
fs.writeFileSync(path.join(root, `${label}-prompt.txt`), prompt);
try {
  if (emptyWorkspace) {
    metadata.preflight = 'not applicable: empty workspace';
  } else {
    execFileSync('node', ['node_modules/typescript/bin/tsc', '--noEmit'], { cwd, env, stdio: 'pipe' });
    execFileSync('node', ['node_modules/expo/bin/cli', 'export', '--platform', 'web', '--max-workers', '2', '--output-dir', path.join(root, `${label}-preflight`)], { cwd, env: { ...env, EXPO_OFFLINE: '1' }, stdio: 'pipe' });
    metadata.preflight = 'typecheck and web export passed';
  }
} catch (error) {
  metadata.preflight = 'failed';
  metadata.error = String(error.stdout ?? '') + String(error.stderr ?? error.message);
  save();
  throw error;
}
metadata.clientVersion = execFileSync(client, ['--version'], { encoding: 'utf8' }).trim();
const out = fs.openSync(path.join(root, `${label}.jsonl`), 'wx');
const err = fs.openSync(path.join(root, `${label}.stderr.txt`), 'wx');
const child = spawn(client, args, { cwd, env, stdio: ['pipe', out, err] });
metadata.pid = child.pid;
save();
child.stdin.end(prompt);
let timedOut = false;
const deadline = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); }, 20 * 60 * 1000);
child.on('error', (error) => { metadata.launchError = error.message; });
child.on('close', (code, signal) => {
  clearTimeout(deadline);
  fs.closeSync(out);
  fs.closeSync(err);
  Object.assign(metadata, { finishedAt: new Date().toISOString(), exitCode: code, signal, timedOut });
  save();
  console.log(JSON.stringify({ client, label, condition, code, signal, timedOut, cwd }));
});
console.log(JSON.stringify({ client, label, condition, pid: child.pid, cwd }));
