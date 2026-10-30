#!/usr/bin/env node
// Regression probe for unique field IDs and explicit label associations in /components/fields.
// Uses real Chrome/Edge CDP sessions and the demo's own theme/direction switches.
import {spawn} from 'node:child_process';
import {mkdtemp, readFile, writeFile, mkdir, rm, access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {createServer} from 'node:net';
import {setTimeout as wait} from 'node:timers/promises';

const engine = (process.argv[2] || 'chrome').toLowerCase();
if (!['chrome', 'edge'].includes(engine)) throw new Error('Supported engines: chrome|edge');
const executable = engine === 'chrome'
  ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  : 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const root = resolve('.');
const evidenceDir = join(root, 'docs/v3/quality/evidence');
const profile = await mkdtemp(join(tmpdir(), 'bluent-fields-demo-ids-'));
let host, browser, socket, sequence = 0;
const pending = new Map();
const checks = [];
const modes = [
  {name: 'LIGHT-LTR', theme: 'light', dir: 'ltr', forced: false},
  {name: 'DARK-RTL', theme: 'dark', dir: 'rtl', forced: false},
  {name: 'FORCED-COLORS', theme: 'light', dir: 'ltr', forced: true},
];
const expected = [
  {id: 'textFieldDefault', label: 'Example text field'},
  {id: 'textFieldSearch', ariaLabel: 'Search'},
  {id: 'smallTextFieldDefault', label: 'Default size'},
  {id: 'smallTextFieldCompact', label: 'Small size'},
  {id: 'timeOnlyInput', label: 'Time only'},
  {id: 'timeOnlySecondsInput', label: 'Time only with seconds'},
  {id: 'dateTimeTimeField', label: 'Date and time'},
  {id: 'timeSpanInput', label: 'Time span'},
  {id: 'timeSpanSecondsInput', label: 'Time span with seconds'},
  {id: 'mediumDateField', label: 'Medium date field'},
  {id: 'switchAfterLabel', labelPrefix: 'Switch is '},
  {id: 'switchBeforeLabel', labelPrefix: 'Switch is '},
];
const port = () => new Promise((ok, no) => {
  const server = createServer();
  server.on('error', no);
  server.listen(0, '127.0.0.1', () => {
    const value = server.address().port;
    server.close(() => ok(value));
  });
});
const poll = async (fn, ms = 60000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try { const value = await fn(); if (value) return value; } catch {}
    await wait(250);
  }
  throw new Error('Timed out waiting for demo/browser startup');
};
const call = (method, params = {}) => new Promise((ok, no) => {
  const id = ++sequence;
  const timer = setTimeout(() => { pending.delete(id); no(new Error(`${method} timed out`)); }, 20000);
  pending.set(id, {
    ok: value => { clearTimeout(timer); ok(value); },
    no: error => { clearTimeout(timer); no(error); },
  });
  socket.send(JSON.stringify({id, method, params}));
});
const js = async expression => {
  const result = await call('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result?.value;
};
const keypress = async (key, code, virtualKeyCode) => {
  const payload = {key, code, windowsVirtualKeyCode: virtualKeyCode, nativeVirtualKeyCode: virtualKeyCode};
  await call('Input.dispatchKeyEvent', {type: 'keyDown', ...payload, ...(key === ' ' ? {text: ' ', unmodifiedText: ' '} : {})});
  await call('Input.dispatchKeyEvent', {type: 'keyUp', ...payload});
  await wait(250);
};
const ensureUiMode = async mode => {
  for (const target of [
    {index: 0, checked: mode.theme === 'dark'},
    {index: 1, checked: mode.dir === 'rtl'},
  ]) {
    const current = await js(`(() => { const input = [...document.querySelectorAll('.bui-switch input[type="checkbox"]')][${target.index}]; return input ? {id: input.id, checked: input.checked} : null; })()`);
    if (!current) throw new Error(`Header theme/direction switch ${target.index} not found`);
    if (current.checked !== target.checked) {
      await js(`document.getElementById(${JSON.stringify(current.id)})?.focus()`);
      await keypress(' ', 'Space', 32);
      const stateExpression = target.index === 0
        ? `document.documentElement.getAttribute('data-bui-theme') === ${JSON.stringify(mode.theme)}`
        : `document.documentElement.dir === ${JSON.stringify(mode.dir)}`;
      await poll(() => js(`(() => { const input = document.getElementById(${JSON.stringify(current.id)}); return !!input && input.checked === ${target.checked} && (${stateExpression}); })()`), 10000);
    }
  }
  return js(`({theme: document.documentElement.getAttribute('data-bui-theme'), dir: document.documentElement.dir, forced: matchMedia('(forced-colors: active)').matches})`);
};
const evaluateFields = () => {
  const allIds = [...document.querySelectorAll('[id]')].map(element => element.id).filter(Boolean);
  const counts = new Map();
  for (const id of allIds) counts.set(id, (counts.get(id) || 0) + 1);
  const duplicates = Object.fromEntries([...counts].filter(([, count]) => count > 1));
  const targets = [
    ...document.querySelectorAll('#textFieldDefault, #textFieldSearch, #smallTextFieldDefault, #smallTextFieldCompact, #timeOnlyInput, #timeOnlySecondsInput, #dateTimeTimeField, #timeSpanInput, #timeSpanSecondsInput, #mediumDateField, #switchAfterLabel, #switchBeforeLabel'),
  ].map(element => ({
    id: element.id,
    tag: element.tagName.toLowerCase(),
    count: document.querySelectorAll(`[id="${CSS.escape(element.id)}"]`).length,
    ariaLabel: element.getAttribute('aria-label'),
    labels: [...(element.labels || [])].map(label => ({text: label.textContent.trim(), htmlFor: label.htmlFor})),
  }));
  return {duplicates, targets};
};
const check = (name, pass, observed) => {
  checks.push({name, pass: !!pass, observed});
  console.log(`${engine} ${pass ? 'PASS' : 'FAIL'} ${name}`);
};
async function terminate(child) {
  if (!child?.pid || child.exitCode !== null) return;
  const exited = new Promise(ok => child.once('exit', ok));
  try { child.kill(); } catch {}
  await Promise.race([exited, wait(2500)]);
  if (child.exitCode === null) { try { child.kill('SIGKILL'); } catch {} }
}
async function closeBrowser() {
  try {
    const portLines = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).trim().split(/\r?\n/);
    const version = await (await fetch(`http://127.0.0.1:${portLines[0]}/json/version`)).json();
    await new Promise(resolveDone => {
      const browserSocket = new WebSocket(version.webSocketDebuggerUrl);
      let done = false;
      const finish = () => { if (!done) { done = true; resolveDone(); } };
      browserSocket.addEventListener('open', () => {
        try { browserSocket.send(JSON.stringify({id: 9001, method: 'Browser.close'})); } catch {}
        setTimeout(finish, 300);
      }, {once: true});
      browserSocket.addEventListener('close', finish, {once: true});
      browserSocket.addEventListener('error', finish, {once: true});
      setTimeout(finish, 2000);
    });
  } catch {}
}

try {
  await access(executable);
  await mkdir(evidenceDir, {recursive: true});
  const demoPort = await port();
  const base = `http://127.0.0.1:${demoPort}`;
  host = spawn('dotnet', ['run', '--project', join(root, 'src/Bluent.UI.Demo/Bluent.UI.Demo.csproj'), '--configuration', 'Debug', '--no-build', '--no-launch-profile', '--urls', base], {cwd: root, windowsHide: true, stdio: 'ignore'});
  await poll(async () => (await fetch(`${base}/components/fields`)).status === 200, 120000);
  browser = spawn(executable, ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--disable-extensions', '--remote-debugging-port=0', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'about:blank'], {windowsHide: true, stdio: 'ignore'});
  const cdpPort = await poll(async () => Number((await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).trim().split(/\r?\n/)[0]), 40000);
  const tabs = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json();
  const tab = tabs.find(item => item.type === 'page' && item.webSocketDebuggerUrl);
  if (!tab) throw new Error('No temporary browser page');
  socket = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((ok, no) => { socket.addEventListener('open', ok, {once: true}); socket.addEventListener('error', no, {once: true}); });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    const request = pending.get(message.id);
    if (request) { pending.delete(message.id); message.error ? request.no(new Error(JSON.stringify(message.error))) : request.ok(message.result || {}); }
  });
  await call('Page.enable');
  await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride', {width: 1280, height: 960, deviceScaleFactor: 1, mobile: false});
  const results = [];
  for (const mode of modes) {
    await call('Emulation.setEmulatedMedia', {features: mode.forced ? [{name: 'forced-colors', value: 'active'}, {name: 'prefers-contrast', value: 'more'}] : []});
    await call('Page.navigate', {url: `${base}/components/fields`});
    await poll(() => js('!!document.querySelector("#textFieldDefault")'), 30000);
    const ui = await ensureUiMode(mode);
    const observed = await js(`(${evaluateFields.toString()})()`);
    const expectedResults = expected.map(item => {
      const target = observed.targets.find(value => value.id === item.id);
      const labelValid = item.ariaLabel
        ? target?.ariaLabel === item.ariaLabel
        : target?.labels.some(label => label.htmlFor === item.id && (item.label ? label.text === item.label : label.text.startsWith(item.labelPrefix)));
      return {id: item.id, found: !!target, count: target?.count ?? 0, labelValid: !!labelValid, observed: target || null};
    });
    check(`${mode.name} all document IDs are unique`, Object.keys(observed.duplicates).length === 0, observed.duplicates);
    check(`${mode.name} all repeated-bound controls have unique IDs and associated names`, expectedResults.every(item => item.found && item.count === 1 && item.labelValid), expectedResults);
    check(`${mode.name} live theme, direction and forced-colors state applied`, ui.theme === mode.theme && ui.dir === mode.dir && ui.forced === mode.forced, ui);
    results.push({mode: mode.name, ui, duplicates: observed.duplicates, targets: observed.targets, expected: expectedResults});
  }
  await call('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
  await call('Emulation.setEmulatedMedia', {features: []});
  await call('Page.navigate', {url: `${base}/components/fields`});
  await poll(() => js('!!document.querySelector("#textFieldDefault")'), 30000);
  const mobile = await js('({width: innerWidth, scrollWidth: document.documentElement.scrollWidth, viewportHeight: innerHeight, pageHeight: document.documentElement.scrollHeight})');
  check('MOBILE viewport does not overflow horizontally', mobile.scrollWidth <= mobile.width, mobile);
  const report = {
    issue: 552,
    route: '/components/fields',
    engine,
    viewport: {desktop: '1280x960', mobile: '390x844'},
    modes: results,
    mobile,
    checks,
    summary: {checks: checks.length, passed: checks.filter(item => item.pass).length, failed: checks.filter(item => !item.pass).length},
    limits: ['Headless Chromium CDP evidence only.', 'forced-colors is emulated, not native OS contrast.', 'No screen-reader or manual visual acceptance is claimed.'],
  };
  const file = join(evidenceDir, `BLUENT-FIELDS-DEMO-ASSOCIATIONS-${engine.toUpperCase()}.json`);
  await writeFile(file, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`SUMMARY ${JSON.stringify(report.summary)}`);
  if (report.summary.failed > 0) process.exitCode = 1;
} catch (error) {
  console.error(`ERROR ${engine} ${(error?.stack || error)}`);
  process.exitCode = 1;
} finally {
  try { socket?.close(); } catch {}
  await closeBrowser();
  await terminate(browser);
  await terminate(host);
  await rm(profile, {recursive: true, force: true}).catch(() => {});
}