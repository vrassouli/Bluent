#!/usr/bin/env node
// #432 real Chrome / Blazor WebAssembly probe for the focused TextField showcase.
// Usage: node scripts/quality/probe_v3_textfield_demo.mjs http://127.0.0.1:5080
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';

const base = (process.argv[2] || 'http://127.0.0.1:5080').replace(/\/$/, '');
const route = process.env.BLUENT_TEXTFIELD_ROUTE || '/components/text-fields';
const chrome = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserLabel = process.env.BLUENT_BROWSER_LABEL || 'Chrome';
const renderMode = process.env.BLUENT_TEXTFIELD_RENDER_MODE || 'WebAssembly';
const evidenceMode = renderMode.toLowerCase() === 'webassembly' ? 'WASM' : renderMode.toUpperCase();
const evidenceStem = 'BLUENT-TEXTFIELD-' + browserLabel.toUpperCase() + '-' + evidenceMode;
const profile = await mkdtemp(join(tmpdir(), 'bluent-v3-432-textfield-'));
const checks = [];
const errors = [];
const pending = new Map();
const runtimeSignals = [];
const requestUrls = new Map();
let browser;
let ws;
let sequence = 0;

const check = (name, pass, detail = null) => {
  console.log('QA CHECK ' + (pass ? 'PASS ' : 'FAIL ') + name);
  checks.push({ name, pass: !!pass, detail });
  if (!pass) errors.push(name);
};
const poll = async (fn, timeoutMs = 30000) => {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      const value = await fn();
      if (value) return value;
    } catch {}
    await wait(250);
  }
  throw new Error('Timed out waiting for TextField browser condition');
};
const send = (method, params = {}) => new Promise((resolvePromise, reject) => {
  const id = ++sequence;
  const timer = setTimeout(() => {
    pending.delete(id);
    reject(new Error('CDP ' + method + ' timed out'));
  }, 15000);
  pending.set(id, {
    resolve: value => { clearTimeout(timer); resolvePromise(value); },
    reject: error => { clearTimeout(timer); reject(error); }
  });
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (result.exceptionDetails) throw new Error('Browser JS exception: ' + result.exceptionDetails.text);
  return result.result?.value;
};
const setNativeValue = async (id, value, eventNames = ['input', 'change']) => {
  const fn = function (elementId, nextValue, names) {
    const element = document.getElementById(elementId);
    if (!element) return { ok: false, reason: 'missing element ' + elementId };
    element.focus();
    const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (!setter) return { ok: false, reason: 'native value setter missing' };
    setter.call(element, nextValue);
    for (const type of names) element.dispatchEvent(new Event(type, { bubbles: true }));
    return { ok: true, value: element.value };
  };
  return evaluate('(' + fn.toString() + ')(' + JSON.stringify(id) + ',' + JSON.stringify(value) + ',' + JSON.stringify(eventNames) + ')');
};
const clickByText = async (selector, exactText) => {
  const fn = function (css, text) {
    const element = [...document.querySelectorAll(css)].find(item => (item.textContent || '').trim() === text);
    if (!element) return false;
    element.click();
    return true;
  };
  return evaluate('(' + fn.toString() + ')(' + JSON.stringify(selector) + ',' + JSON.stringify(exactText) + ')');
};

try {
  browser = spawn(chrome, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run',
    '--disable-extensions', '--remote-debugging-port=0', '--remote-allow-origins=*',
    '--user-data-dir=' + profile, 'about:blank'
  ], { stdio: 'ignore', windowsHide: true });

  console.log('QA: waiting for disposable Chrome CDP endpoint');
  const port = await poll(async () => {
    const content = await readFile(join(profile, 'DevToolsActivePort'), 'utf8');
    return content.trim().split(/\r?\n/)[0];
  }, 60000);
  const tabs = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  const tab = tabs.find(item => item.type === 'page' && item.webSocketDebuggerUrl);
  if (!tab) throw new Error('Chrome did not expose a page target');
  ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolvePromise, reject) => {
    ws.addEventListener('open', resolvePromise, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    const waiter = pending.get(message.id);
    if (waiter) {
      pending.delete(message.id);
      message.error ? waiter.reject(new Error(JSON.stringify(message.error))) : waiter.resolve(message.result || {});
    }
    if (message.method === 'Network.requestWillBeSent') {
      requestUrls.set(message.params.requestId, message.params.request?.url || '');
    }
    if (message.method === 'Runtime.exceptionThrown') {
      runtimeSignals.push({ type: 'exception', text: String(message.params?.exceptionDetails?.text || '').slice(0, 300) });
    }
    if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params?.type)) {
      runtimeSignals.push({
        type: message.params.type,
        text: String(message.params?.args?.map(arg => arg.value || arg.description || '').join(' ') || '').slice(0, 300)
      });
    }
    if (message.method === 'Network.responseReceived' && message.params?.response?.status >= 400) {
      runtimeSignals.push({ type: 'http', status: message.params.response.status, url: message.params.response.url });
    }
    if (message.method === 'Network.loadingFailed') {
      runtimeSignals.push({
        type: 'network',
        text: message.params?.errorText || '',
        url: requestUrls.get(message.params?.requestId) || undefined
      });
    }
    if (message.method === 'Network.webSocketCreated') {
      runtimeSignals.push({ type: 'websocket-created', url: message.params?.url });
    }
    if (message.method === 'Network.webSocketHandshakeResponseReceived') {
      runtimeSignals.push({
        type: 'websocket-handshake',
        status: message.params?.response?.status,
        url: message.params?.response?.url
      });
    }
    if (message.method === 'Network.webSocketFrameError') {
      runtimeSignals.push({ type: 'websocket-frame-error', text: message.params?.errorMessage || '' });
    }
    if (message.method === 'Network.responseReceived' &&
        /_blazor|_content\/Bluent\.UI\/bluent\.ui\.js/.test(message.params?.response?.url || '')) {
      runtimeSignals.push({
        type: 'interactive-resource',
        status: message.params.response.status,
        url: message.params.response.url
      });
    }
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Page.navigate', { url: base + route });

  try {
    await poll(() => evaluate(
      "document.readyState !== 'loading' && !!document.querySelector('#textfield-basic')"
    ), 25000);
  } catch (error) {
    const diagnosticFn = function () {
      return {
        url: location.href,
        title: document.title,
        readyState: document.readyState,
        bodyText: document.body?.innerText?.slice(0, 2500),
        appHtml: document.querySelector('#app')?.innerHTML?.slice(0, 2500),
        scripts: [...document.scripts].map(script => script.src).filter(Boolean),
        appClass: document.querySelector('#app')?.className
      };
    };
    console.error('QA ROUTE DIAGNOSTICS ' + JSON.stringify(await evaluate('(' + diagnosticFn.toString() + ')()')));
    console.error('QA RUNTIME SIGNALS ' + JSON.stringify(runtimeSignals));
    throw error;
  }
  check('focused TextField route loads in real ' + browserLabel + ' ' + renderMode, true, { url: base + route });

  const structureFn = function () {
    const basic = document.querySelector('#textfield-basic');
    const label = document.querySelector('label[for="textfield-basic"]');
    const fixed = document.querySelector('#textfield-textarea-fixed');
    const resizable = document.querySelector('#textfield-textarea-resize');
    const disabled = document.querySelector('#textfield-disabled');
    const readonly = document.querySelector('#textfield-readonly');
    return {
      basicTag: basic?.tagName,
      labelFor: label?.htmlFor,
      initialValue: basic?.value,
      fixedRows: fixed?.rows,
      fixedResize: fixed ? getComputedStyle(fixed).resize : null,
      resizableRows: resizable?.rows,
      resizableResize: resizable ? getComputedStyle(resizable).resize : null,
      disabled: disabled?.disabled,
      readonly: readonly?.readOnly,
      rtlDirection: getComputedStyle(document.querySelector('#textfield-rtl-name')).direction,
      transformCount: [...document.querySelectorAll('input[id^="textfield-transform-"]')].length
    };
  };
  const structure = await evaluate('(' + structureFn.toString() + ')()');
  check('native input and visible Label association render', structure.basicTag === 'INPUT' &&
    structure.labelFor === 'textfield-basic' && structure.initialValue === 'Ada Lovelace', structure);
  check('native textarea modes render with requested rows and resize behavior',
    structure.fixedRows === 3 && structure.fixedResize === 'none' &&
    structure.resizableRows === 3 && structure.resizableResize !== 'none', structure);
  check('disabled and readonly remain separate native attributes',
    structure.disabled === true && structure.readonly === true, structure);
  check('Persian field inherits RTL direction', structure.rtlDirection === 'rtl', structure);
  check('all eight normalization specimens are present', structure.transformCount === 8, structure.transformCount);

  const basicSet = await setNativeValue('textfield-basic', 'Grace Hopper');
  let basicBound = false;
  try {
    basicBound = await poll(() => evaluate("document.body.innerText.includes('Bound value: Grace Hopper')"));
  } catch (error) {
    const bindingDiagnosticFn = function () {
      const input = document.querySelector('#textfield-basic');
      const blazor = window.Blazor;
      return {
        url: location.href,
        inputValue: input?.value,
        inputMarkup: input?.outerHTML,
        boundText: [...document.querySelectorAll('p[role="status"]')].map(item => item.innerText),
        blazorPresent: !!blazor,
        blazorKeys: blazor ? Object.keys(blazor) : [],
        scripts: [...document.scripts].map(script => script.src).filter(Boolean),
        bodyText: document.body?.innerText?.slice(0, 900)
      };
    };
    console.error('QA BINDING DIAGNOSTICS ' + JSON.stringify({
      set: basicSet,
      browser: await evaluate('(' + bindingDiagnosticFn.toString() + ')()'),
      runtimeSignals
    }));
    throw error;
  }
  check('onchange binding updates the InputBase model', basicSet.ok && basicBound, basicSet);

  const liveSet = await setNativeValue('textfield-oninput', 'Live update verified', ['input']);
  const liveBound = await poll(() => evaluate("document.querySelector('#textfield-live-description')?.textContent?.includes('Live update verified')"));
  check('oninput binding updates the model before change/blur', liveSet.ok && liveBound, liveSet);

  const readonlyFocusFn = function () {
    const disabled = document.querySelector('#textfield-disabled');
    const readonly = document.querySelector('#textfield-readonly');
    disabled.focus();
    const disabledSkipped = document.activeElement !== disabled;
    readonly.focus();
    const readonlyFocused = document.activeElement === readonly;
    readonly.setSelectionRange(0, 3);
    return {
      disabledSkipped,
      readonlyFocused,
      selected: readonly.value.slice(readonly.selectionStart, readonly.selectionEnd)
    };
  };
  const readonlyFocus = await evaluate('(' + readonlyFocusFn.toString() + ')()');
  check('readonly remains keyboard-focusable/selectable while disabled is skipped',
    readonlyFocus.disabledSkipped && readonlyFocus.readonlyFocused && readonlyFocus.selected === 'Ada', readonlyFocus);

  const addonClicked = await clickByText('.bui-text-field .end-addon button', 'Search');
  const addonMessage = await poll(() => evaluate("[...document.querySelectorAll('[role=status]')].some(x => x.textContent.includes('Enter a search term first.'))"));
  const addonAccessibilityFn = function () {
    const button = [...document.querySelectorAll('.bui-text-field .end-addon button')].find(x => x.textContent.trim() === 'Search');
    return button ? { tag: button.tagName, tabIndex: button.tabIndex, name: button.getAttribute('aria-label') || button.textContent.trim() } : null;
  };
  const addonAccessibility = await evaluate('(' + addonAccessibilityFn.toString() + ')()');
  check('EndAddon action remains an independent named button and invokes its callback',
    addonClicked && addonMessage && addonAccessibility?.name === 'Search' && addonAccessibility.tabIndex >= 0, addonAccessibility);

  const focusButton = await clickByText('button', 'Mount and focus the field');
  const gainedFocus = await poll(() => evaluate("document.activeElement?.id === 'textfield-gain-focus'"));
  check('GainFocus targets the native input on its first interactive render', focusButton && gainedFocus);

  const expected = [
    ['textfield-transform-none', 'A١۲۳٤-5 ك ي', 'A١۲۳٤-5 ك ي'],
    ['textfield-transform-digits', 'A١۲۳٤-5 ك ي', '١۲۳٤5'],
    ['textfield-transform-ascii', 'A١۲۳٤-5 ك ي', 'A1234-5 ك ي'],
    ['textfield-transform-persian', 'A١۲۳٤-5 ك ي', 'A١۲۳٤-5 ک ی'],
    ['textfield-transform-digits-ascii', 'A١۲۳٤-5 ك ي', '12345'],
    ['textfield-transform-digits-persian', 'A١۲۳٤-5 ك ي', '١۲۳٤5'],
    ['textfield-transform-ascii-persian', 'A١۲۳٤-5 ك ي', 'A1234-5 ک ی'],
    ['textfield-transform-all', 'A١۲۳٤-5 ك ي', '12345']
  ];
  for (const [id, input, output] of expected) {
    const result = await setNativeValue(id, input, ['input', 'change']);
    const actual = await poll(() => evaluate(
      "document.getElementById(" + JSON.stringify(id) + ")?.value === " + JSON.stringify(output)
    ));
    check('normalization pipeline: ' + id, result.ok && actual, { expected: output });
  }

  const submit = await clickByText('button[type="submit"]', 'Submit');
  const invalid = await poll(() => evaluate(
    "document.querySelector('#textfield-required')?.getAttribute('aria-invalid') === 'true' && " +
    "document.body.innerText.includes('Please enter a display name.')"
  ));
  const invalidStateFn = function () {
    const input = document.querySelector('#textfield-required');
    return { ariaInvalid: input?.getAttribute('aria-invalid'), wrapperClass: input?.parentElement?.className };
  };
  const invalidState = await evaluate('(' + invalidStateFn.toString() + ')()');
  check('EditContext validation exposes aria-invalid and readable message on native input',
    submit && invalid && invalidState.wrapperClass.includes('invalid'), invalidState);

  const validSet = await setNativeValue('textfield-required', 'Validated name', ['input', 'change']);
  const submitValid = await clickByText('button[type="submit"]', 'Submit');
  const valid = await poll(() => evaluate("[...document.querySelectorAll('[role=status]')].some(x => x.textContent.includes('Submitted: Validated name'))"));
  check('valid form submission updates the form status', validSet.ok && submitValid && valid);

  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 900, deviceScaleFactor: 1, mobile: false });
  await wait(500);
  const reflowFn = function () {
    return {
      viewport: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      fields: document.querySelectorAll('.bui-text-field').length
    };
  };
  const reflow = await evaluate('(' + reflowFn.toString() + ')()');
  check('320px viewport reflows without horizontal page overflow', reflow.scrollWidth <= reflow.viewport, reflow);

  const diagnostics = runtimeSignals.filter(item =>
    item.type === 'exception' || item.type === 'error' || item.type === 'http'
  );
  check('no browser JavaScript exceptions, console errors or HTTP failures', diagnostics.length === 0, diagnostics);
  console.log('QA RUNTIME SIGNALS ' + JSON.stringify(runtimeSignals));

  const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  const evidenceDir = join(resolve('.'), 'docs', 'v3', 'quality', 'evidence');
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(join(evidenceDir, evidenceStem + '.png'), Buffer.from(screenshot.data, 'base64'));
  const evidence = {
    issue: 432,
    date: new Date().toISOString(),
    browser: browserLabel + ' headless local Dev01',
    renderMode,
    route: base + route,
    checksPassed: checks.filter(item => item.pass).length,
    checksTotal: checks.length,
    checks,
    runtimeSignals,
    result: errors.length === 0 ? 'PASS' : 'FAIL',
    boundary: 'Focused route runtime evidence only; not native Windows Contrast Themes, screen-reader speech, physical OS IME certification, full API acceptance or Penpot/token approval.'
  };
  await writeFile(join(evidenceDir, evidenceStem + '.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log('QA SUMMARY ' + evidence.checksPassed + '/' + evidence.checksTotal);
  console.log('QA RESULT ' + evidence.result);
  if (errors.length) console.error('QA FAILURES ' + JSON.stringify(errors));
} catch (error) {
  console.error('QA FATAL ' + (error?.stack || error));
  errors.push('fatal: ' + (error?.message || error));
} finally {
  try { ws?.close(); } catch {}
  if (browser?.pid && process.platform === 'win32') {
    try {
      const killer = spawn('taskkill', ['/PID', String(browser.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true
      });
      await new Promise(resolvePromise => {
        killer.once('exit', resolvePromise);
        killer.once('error', resolvePromise);
      });
    } catch {}
    // Chromium can detach descendants from its launcher; sweep only processes
    // whose command line contains this run's unique temporary user-data-dir.
    try {
      const safeProfile = profile.replace(/'/g, "''");
      const cleanupScript =
        "$profile = '" + safeProfile + "'; " +
        "$owned = @(Get-CimInstance Win32_Process | Where-Object { " +
        "$_.Name -in @('chrome.exe','msedge.exe') -and $_.CommandLine -like ('*' + $profile + '*') }); " +
        "foreach ($item in $owned) { Stop-Process -Id ([int]$item.ProcessId) -Force -ErrorAction SilentlyContinue }; " +
        "Start-Sleep -Milliseconds 250; " +
        "$remaining = @(Get-CimInstance Win32_Process | Where-Object { " +
        "$_.Name -in @('chrome.exe','msedge.exe') -and $_.CommandLine -like ('*' + $profile + '*') }); " +
        "Write-Output $remaining.Count";
      const cleaner = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', cleanupScript], {
        stdio: ['ignore', 'pipe', 'ignore'],
        windowsHide: true
      });
      let cleanupOutput = '';
      cleaner.stdout?.on('data', chunk => { cleanupOutput += chunk.toString(); });
      await new Promise(resolvePromise => {
        cleaner.once('exit', resolvePromise);
        cleaner.once('error', resolvePromise);
      });
      const remaining = Number(cleanupOutput.trim().split(/\r?\n/).at(-1));
      console.log('QA CLEANUP browser processes remaining=' + (Number.isFinite(remaining) ? remaining : 'unknown'));
    } catch (error) {
      console.error('QA CLEANUP failed: ' + (error?.message || error));
    }
  } else {
    try { browser?.kill(); } catch {}
  }
  await wait(500);
  try { await rm(profile, { recursive: true, force: true }); } catch {}
}
if (errors.length) process.exitCode = 1;
