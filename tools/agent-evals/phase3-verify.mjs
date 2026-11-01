// Independent browser verification; no screenshots, videos, or traces are retained.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(path.join(repository, 'package.json'));
const { chromium, expect } = require('@playwright/test');
const root = process.env.CANVAS_EVAL_ROOT ?? '/private/tmp/canvas-adoption-phase3';
const [label] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(label ?? '')) throw new Error('Pass the run label');
const cwd = path.join(root, label);
const metadata = JSON.parse(fs.readFileSync(path.join(root, `${label}-metadata.json`)));
const caseId = metadata.caseId;
const output = path.join(root, `${label}-verified-export`);
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const result = {
  label, caseId, checkedAt: new Date().toISOString(),
  verifierSha256: hash(fs.readFileSync(fileURLToPath(import.meta.url))),
  package: {}, typecheck: 'not_run', webBuild: 'not_run', webRuntime: 'not_run',
  checks: [], errors: [], iosRuntime: 'not_run', androidRuntime: 'not_run',
};
const save = () => fs.writeFileSync(path.join(root, `${label}-verification.json`), JSON.stringify(result, null, 2) + '\n');
const env = { ...process.env, EXPO_OFFLINE: '1', EXPO_NO_TELEMETRY: '1', __UNSAFE_EXPO_HOME_DIRECTORY: path.join(root, `${label}-verify-expo`) };
try {
  const manifest = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json')));
  const installedPath = path.join(cwd, 'node_modules/@nannier/canvas');
  const installed = JSON.parse(fs.readFileSync(path.join(installedPath, 'package.json')));
  const lock = JSON.parse(fs.readFileSync(path.join(cwd, 'package-lock.json')));
  result.package = {
    requested: manifest.dependencies?.['@nannier/canvas'], installed: installed.version,
    ...lock.packages?.['node_modules/@nannier/canvas'],
    realPath: fs.realpathSync(installedPath),
    lockfileSha256: hash(fs.readFileSync(path.join(cwd, 'package-lock.json'))),
    appSourceSha256: hash(fs.readFileSync(path.join(cwd, 'App.tsx'))),
  };
  expect(result.package.requested).toBe('4.0.0');
  expect(installed.version).toBe('4.0.0');
  expect(result.package.resolved).toBe('https://registry.npmjs.org/@nannier/canvas/-/canvas-4.0.0.tgz');
  expect(result.package.integrity).toBe('sha512-Q1DuTEBMn4WbxrKcvHjnZeW23ZUJ9EjQxlPqhWXcOuC8nJt+LiPYKSyyx9NQgs4uBozzPJVva42U+M395uvkNQ==');
  expect(fs.lstatSync(installedPath).isSymbolicLink()).toBe(false);
  execFileSync('node', ['node_modules/typescript/bin/tsc', '--noEmit'], { cwd, env, stdio: 'pipe' });
  result.typecheck = 'pass';
  execFileSync('node', ['node_modules/expo/bin/cli', 'export', '--platform', 'web', '--max-workers', '2', '--output-dir', output], { cwd, env, stdio: 'pipe' });
  result.webBuild = 'pass';
} catch (error) {
  result.errors.push(String(error.stdout ?? '').slice(-2500) + String(error.stderr ?? error.message).slice(-2500));
  save();
  console.log(JSON.stringify(result));
  process.exitCode = 1;
}
if (result.webBuild === 'pass') {
  // Real browser zoom through the Tabs API, not CSS zoom or pinch emulation.
  // https://playwright.dev/docs/chrome-extensions
  // https://developer.chrome.com/docs/extensions/reference/api/tabs#method-setZoom
  let temporaryBrowser;
  let dashboardContext;
  let worker;
  let browser;
  if (caseId === 'responsive-dashboard') {
    temporaryBrowser = fs.mkdtempSync(path.join(os.tmpdir(), 'canvas-phase3-zoom-'));
    const extension = path.join(temporaryBrowser, 'extension');
    fs.mkdirSync(extension);
    fs.writeFileSync(path.join(extension, 'manifest.json'), JSON.stringify({ manifest_version: 3, name: 'Temporary Canvas zoom verifier', version: '1.0', permissions: ['tabs'], background: { service_worker: 'background.js' } }));
    fs.writeFileSync(path.join(extension, 'background.js'), 'chrome.runtime.onInstalled.addListener(() => {});\n');
    dashboardContext = await chromium.launchPersistentContext(path.join(temporaryBrowser, 'profile'), { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`] });
    worker = dashboardContext.serviceWorkers()[0] ?? await dashboardContext.waitForEvent('serviceworker');
  } else {
    browser = await chromium.launch();
  }
  const zoom = async (factor) => worker.evaluate(async (value) => {
    const tabs = await chrome.tabs.query({ url: 'https://consumer.test/*' });
    const tab = tabs[tabs.length - 1];
    await chrome.tabs.setZoom(tab.id, value);
    return chrome.tabs.getZoom(tab.id);
  }, factor);
  try {
    for (const width of [1280, 390]) {
      const page = dashboardContext ? await dashboardContext.newPage() : await browser.newPage({ viewport: { width, height: 900 } });
      if (dashboardContext) await page.setViewportSize({ width, height: 900 });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.route('https://consumer.test/**', async (route) => {
        const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
        const file = path.resolve(output, pathname === '/' ? 'index.html' : '.' + pathname);
        if (!file.startsWith(output + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
        const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
        await route.fulfill({ status: 200, contentType: types[path.extname(file)] ?? 'application/octet-stream', body: fs.readFileSync(file) });
      });
      const check = { width, status: 'not_run', observations: [] };
      result.checks.push(check);
      try {
        await page.goto('https://consumer.test/');
        if (dashboardContext) await zoom(1);
        if (caseId === 'install-expo-rnw') {
          await expect(page.getByRole('heading', { name: 'Canvas consumer check', exact: true })).toBeVisible();
          await page.getByRole('button', { name: 'Count: 0', exact: true }).click();
          await page.getByRole('button', { name: 'Count: 1', exact: true }).press('Enter');
          await expect(page.getByRole('button', { name: 'Count: 2', exact: true })).toBeVisible();
          check.observations.push('Named heading; pointer increments 0 to 1; Enter increments 1 to 2');
        } else if (caseId === 'settings-form') {
          const name = page.getByRole('textbox', { name: /display name/i });
          const email = page.getByRole('textbox', { name: /^email(?: address)?$/i });
          const toggle = page.getByRole('switch', { name: /email notifications/i });
          const saveButton = page.getByRole('button', { name: /^save(?: settings)?$/i });
          await expect(name).toHaveValue('Alex');
          await expect(email).toHaveValue('alex@example.com');
          await expect(toggle).toBeChecked();
          await toggle.click();
          await expect(toggle).not.toBeChecked();
          await toggle.press('Space');
          await expect(toggle).toBeChecked();
          await name.fill('');
          await saveButton.click();
          await expect(name).toHaveAttribute('aria-invalid', 'true');
          expect(await name.evaluate((node) => (node.getAttribute('aria-describedby') ?? '').split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' '))).toMatch(/name|required/i);
          await expect(page.getByText(/^(?:Name: |Display name: )?Alex$/).first()).toBeVisible();
          await name.fill('Sam');
          await email.fill('bad');
          await saveButton.click();
          await expect(email).toHaveAttribute('aria-invalid', 'true');
          expect(await email.evaluate((node) => (node.getAttribute('aria-describedby') ?? '').split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' '))).toMatch(/email|valid/i);
          await expect(page.getByText(/^(?:Email: )?alex@example.com$/).first()).toBeVisible();
          await email.fill('sam@example.com');
          await toggle.click();
          await saveButton.press('Enter');
          await expect(page.getByText(/^(?:Name: |Display name: )?Sam$/).first()).toBeVisible();
          await expect(page.getByText(/^(?:Email: )?sam@example.com$/).first()).toBeVisible();
          const savedBody = await page.locator('body').innerText();
          expect(/notifications[\s:]*(?:off|disabled)/i.test(savedBody)).toBe(true);
          await name.fill('Uncommitted');
          await email.fill('uncommitted@example.com');
          await expect(page.getByText(/^(?:Name: |Display name: )?Sam$/).first()).toBeVisible();
          await expect(page.getByText(/^(?:Email: )?sam@example.com$/).first()).toBeVisible();
          check.observations.push('Named editable fields and switch; pointer/Space toggle; blank-name and invalid-email aria-invalid states; invalid saves preserve summary; Enter saves Sam/sam@example.com/notifications off; draft remains separate');
        } else if (caseId === 'responsive-dashboard') {
          const boxes = [];
          for (const metric of ['Revenue', 'Orders', 'Customers']) {
            const item = page.getByText(metric, { exact: true }).first();
            await expect(item).toBeVisible();
            boxes.push(await item.boundingBox());
          }
          const layoutCorrect = width === 1280
            ? Math.max(...boxes.map((box) => box.y)) - Math.min(...boxes.map((box) => box.y)) < 10
            : boxes[0].y < boxes[1].y && boxes[1].y < boxes[2].y;
          check.metricPositions = boxes;
          const refresh = page.getByRole('button', { name: /^refresh/i });
          await refresh.click();
          await refresh.press('Enter');
          for (const value of ['$12,400', '86', '42']) await expect(page.getByText(value, { exact: true }).first()).toBeVisible();
          const body = await page.locator('body').innerText();
          expect(/(?:refresh[^\n]*\b2\b|\b2\b[^\n]*refresh)/i.test(body)).toBe(true);
          const semanticActivity = page.getByRole('list', { name: /recent activity/i }).getByRole('listitem');
          const activity = await semanticActivity.count()
            ? semanticActivity
            : page.getByTestId('activity-list').locator(':scope > *');
          const activityCount = await activity.count();
          expect(activityCount).toBeGreaterThanOrEqual(5);
          for (let index = 0; index < activityCount; index++) {
            await activity.nth(index).scrollIntoViewIfNeeded();
            await expect(activity.nth(index)).toBeInViewport();
          }
          check.activityCount = activityCount;
          check.observations.push('Exact metric labels/values; pointer and Enter Refresh produce count 2 without changing values; at least five activity entries individually scrolled into view');
          const zoomFactor = await zoom(2);
          expect(zoomFactor).toBe(2);
          await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(Math.round(width / 2));
          check.zoom200 = await page.evaluate(() => ({ factor: window.devicePixelRatio, innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
          for (const item of [refresh, ...['Revenue', 'Orders', 'Customers', '$12,400', '86', '42'].map((text) => page.getByText(text, { exact: true }).first()), ...Array.from({ length: activityCount }, (_, index) => activity.nth(index))]) {
            await item.scrollIntoViewIfNeeded();
            await expect(item).toBeInViewport();
            const bounds = await item.boundingBox();
            expect(bounds.x).toBeGreaterThanOrEqual(-1);
            expect(bounds.x + bounds.width).toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth) + 1);
          }
          expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
          check.observations.push('Real Tabs API browser zoom=2, CSS viewport halves; metrics/values/Refresh/all activity entries remain reachable and horizontally within viewport; no horizontal page overflow at 200%');
          await zoom(1);
          expect(layoutCorrect, 'Metrics must be a desktop row and phone column').toBe(true);
          check.observations.push('Metrics form the requested desktop row/phone column');
        } else if (caseId === 'optional-peer-fallback') {
          const installedPath = path.join(cwd, 'node_modules/@nannier/canvas/package.json');
          const canvasRequire = createRequire(installedPath);
          let absent = false;
          try { canvasRequire.resolve('react-native-qrcode-svg'); } catch (error) { if (error.code === 'MODULE_NOT_FOUND') absent = true; else throw error; }
          expect(absent).toBe(true);
          const packageTree = execFileSync('npm', ['ls', '--all', '--json'], { cwd, env, encoding: 'utf8', stdio: 'pipe' });
          const installedQrEntries = [];
          const visitDependencies = (node, trail = []) => {
            for (const [name, dependency] of Object.entries(node.dependencies ?? {})) {
              // npm lists a declared but absent optional peer as an empty object.
              if (name === 'react-native-qrcode-svg' && Object.keys(dependency).length) installedQrEntries.push({ trail: [...trail, name], dependency });
              visitDependencies(dependency, [...trail, name]);
            }
          };
          visitDependencies(JSON.parse(packageTree));
          expect(installedQrEntries).toEqual([]);
          check.optionalPeer = { canvasResolution: 'MODULE_NOT_FOUND', installedTreeEntries: installedQrEntries };
          const images = page.getByRole('img');
          expect(await images.count()).toBeGreaterThan(0);
          const qr = images.first();
          await expect(qr).toBeVisible();
          expect(await qr.getAttribute('aria-label')).toMatch(/QR|https:\/\/example.com\/share/i);
          await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
          await page.getByRole('button', { name: 'Copy link', exact: true }).click();
          await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('https://example.com/share');
          await expect(page.getByText(/copied/i).first()).toBeVisible();
          check.observations.push('QR peer cannot resolve from Canvas and npm whole-tree lacks installed QR peer; accessible image fallback mounted; Copy link copies exact URL with visible success');
        } else if (caseId === 'accessible-dialog') {
        const opener = page.getByRole('button', { name: 'Edit profile', exact: true });
        const dialog = page.getByRole('dialog', { name: 'Edit profile', exact: true });
        const field = dialog.getByRole('textbox', { name: /display name/i });
        const inside = async () => expect.poll(() => dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
        const closed = async () => {
          await expect(dialog).not.toBeVisible();
          await expect(opener).toBeFocused();
        };
        await expect(opener).toBeVisible();
        const openerBounds = await opener.boundingBox();
        await opener.click();
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAttribute('aria-modal', 'true');
        await inside();
        await expect(field).toHaveValue('Alex');
        for (const key of ['Tab', 'Shift+Tab']) {
          for (let index = 0; index < 12; index++) { await page.keyboard.press(key); await inside(); }
        }
        const backgroundBlocked = await dialog.evaluate((node, bounds) => {
          const hit = document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
          return hit != null && node.contains(hit);
        }, openerBounds);
        expect(backgroundBlocked).toBe(true);
        check.observations.push('Named modal and labeled field; pointer-open focus; 12 Tab and 12 Shift+Tab moves contained; overlay intercepts opener hit point');
        await field.fill('Discard with Escape');
        await page.keyboard.press('Escape');
        await closed();
        await opener.press('Enter');
        await inside();
        await expect(field).toHaveValue('Alex');
        await field.fill('Discard with Cancel');
        await dialog.getByRole('button', { name: /^Cancel\b/i }).click();
        await closed();
        await opener.click();
        await expect(field).toHaveValue('Alex');
        await field.fill('Sam');
        await dialog.getByRole('button', { name: /^Save\b/i }).click();
        await closed();
        await expect(page.getByText(/^(?:Display name: |Name: )?Sam$/)).toBeVisible();
        await opener.click();
        await expect(field).toHaveValue('Sam');
        const close = dialog.getByRole('button', { name: /^Close\b/i });
        if (await close.count()) {
          await field.fill('Discard with Close');
          await close.click();
          await closed();
          await opener.click();
          await expect(field).toHaveValue('Sam');
          check.observations.push('Header Close cancels and restores focus');
        }
        await page.keyboard.press('Escape');
        await closed();
        check.observations.push('Keyboard opening; Escape/Cancel discard; Save persists; focus returns after every tested close; reopen saved value');
        } else {
          throw new Error(`Unsupported case ${caseId}`);
        }
        expect(errors).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
        check.observations.push('No uncaught browser errors or horizontal page overflow');
        check.status = 'pass';
      } catch (error) {
        check.status = 'fail';
        check.error = error.message.slice(0, 2500);
        check.snapshot = (await page.locator('body').innerText()).slice(0, 2500);
      }
      await page.close();
      save();
    }
    result.webRuntime = result.checks.every((check) => check.status === 'pass') ? 'pass' : 'fail';
    if (result.webRuntime === 'fail') process.exitCode = 1;
  } finally {
    if (dashboardContext) await dashboardContext.close();
    if (browser) await browser.close();
    if (temporaryBrowser) fs.rmSync(temporaryBrowser, { recursive: true, force: true });
    save();
  }
  console.log(JSON.stringify(result));
}
