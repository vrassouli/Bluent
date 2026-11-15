#!/usr/bin/env node
// Real Chrome/Edge CDP probe for NumericField on the focused Bluent v3 showcase.
// Usage: node scripts/quality/probe_v3_numericfield.mjs http://127.0.0.1:5080
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';

const base = (process.argv[2] || 'http://127.0.0.1:5080').replace(/\/$/, '');
const browserLabel = process.env.BLUENT_BROWSER_LABEL || 'Chrome';
const renderMode = process.env.BLUENT_NUMERIC_RENDER_MODE || 'WebAssembly';
const route = renderMode === 'InteractiveServer' ? '/components/numeric-fields-server' : '/components/numeric-fields';
const executable = process.env.BROWSER_PATH || process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile = await mkdtemp(join(tmpdir(), 'bluent-v3-433-numeric-'));
const checks = [];
const signals = [];
const pending = new Map();
let browser, ws, sequence = 0;

const check = (name, condition, detail = null) => {
  console.log(`QA CHECK ${condition ? 'PASS' : 'FAIL'} ${name}`); if (!condition && detail !== null) console.log('  detail:', JSON.stringify(detail));
  checks.push({ name, pass: !!condition, detail });
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
  pending.set(id, {
    resolve: value => { clearTimeout(timer); resolve(value); },
    reject: error => { clearTimeout(timer); reject(error); }
  });
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(`Browser exception: ${result.exceptionDetails.text}`);
  return result.result?.value;
};
const poll = async (fn, timeoutMs = 25000) => {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try { const value = await fn(); if (value) return value; } catch {}
    await wait(200);
  }
  throw new Error('Timed out waiting for NumericField browser condition');
};
const key = async (value, code, virtualKey) => {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: value, code, windowsVirtualKeyCode: virtualKey, nativeVirtualKeyCode: virtualKey });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: value, code, windowsVirtualKeyCode: virtualKey, nativeVirtualKeyCode: virtualKey });
};
const replaceText = async (id, value) => {
  await evaluate(`(() => { const e=document.getElementById(${JSON.stringify(id)}); if(!e) throw new Error('missing '+${JSON.stringify(id)}); e.focus(); e.select(); return true; })()`);
  await key('Backspace', 'Backspace', 8);
  await send('Input.insertText', { text: value });
};
const read = async expression => evaluate(expression);

try {
  browser = spawn(executable, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--disable-extensions',
    '--disable-crash-reporter', '--disable-breakpad', '--disable-features=Crashpad', '--remote-debugging-port=0', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'about:blank'
  ], { stdio: 'ignore', windowsHide: true });

  const port = await poll(async () => {
    const content = await readFile(join(profile, 'DevToolsActivePort'), 'utf8');
    return content.trim().split(/\r?\n/)[0];
  }, 60000);
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const tab = tabs.find(item => item.type === 'page' && item.webSocketDebuggerUrl);
  if (!tab) throw new Error('No Chrome CDP page target');
  ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const waiter = pending.get(message.id); pending.delete(message.id);
      message.error ? waiter.reject(new Error(JSON.stringify(message.error))) : waiter.resolve(message.result || {});
    }
    if (message.method === 'Runtime.exceptionThrown') signals.push({ type: 'exception', text: message.params?.exceptionDetails?.text });
    if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params?.type))
      signals.push({ type: message.params.type, text: message.params?.args?.map(x => x.value || x.description || '').join(' ').slice(0, 300) });
    if (message.method === 'Network.responseReceived' && message.params?.response?.status >= 400)
      signals.push({ type: 'http', status: message.params.response.status, url: message.params.response.url });
  });
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Page.navigate', { url: base + route });
  await poll(() => read("document.readyState !== 'loading' && !!document.querySelector('#numeric-quantity')"));
  if (renderMode === 'InteractiveServer') {
    await poll(() => read("document.querySelector('#numericfield-interactive-ready')?.dataset.ready === 'true'"), 30000);
  }
  check(`NumericFields route loads in real ${browserLabel} ${renderMode}`, true, { url: base + route });

  const structure = await read(`(() => {
    const get=id=>document.getElementById(id);
    const q=get('numeric-quantity'), p=get('numeric-price'), rtl=get('numeric-rtl');
    const styles=rtl?getComputedStyle(rtl):null;
    return {
      quantity:{type:q?.type,role:q?.getAttribute('role'),dir:q?.dir,mode:q?.getAttribute('inputmode'),min:q?.getAttribute('aria-valuemin'),max:q?.getAttribute('aria-valuemax'),now:q?.getAttribute('aria-valuenow'),hasMin:q?.dataset.buiNumericHasMin,hasMax:q?.dataset.buiNumericHasMax},
      price:{type:p?.type,stepper:!!p?.parentElement?.querySelector('.numeric-stepper')},
      rtl:{hostDirection:rtl?.closest('[dir=rtl]')?.getAttribute('dir'),inputDirAttribute:rtl?.getAttribute('dir'),inputDirection:styles?.direction,textAlign:styles?.textAlign,classes:rtl?.parentElement?.className},
      moduleLoaded:[...performance.getEntriesByType('resource')].some(x=>x.name.includes('bluent.ui.numeric-field.js')),
      moduleUrl:[...performance.getEntriesByType('resource')].map(x=>x.name).find(x=>x.includes('bluent.ui.numeric-field.js')) || null
    };
  })()`);
  check('native text input exposes spinbutton semantics and LTR direction', structure.quantity.type === 'text' && structure.quantity.role === 'spinbutton' && structure.quantity.dir === 'ltr' && structure.quantity.mode === 'text', structure.quantity);
  check('spinbutton announces inclusive range and current value', structure.quantity.min === '0' && structure.quantity.max === '100' && structure.quantity.now === '25', structure.quantity);
  check('RTL host retains LTR physical-left numeric text', structure.rtl.hostDirection === 'rtl' && structure.rtl.inputDirection === 'ltr' && structure.rtl.textAlign === 'left', structure.rtl);
  const moduleFetch = await read("fetch('/_content/Bluent.UI/bluent.ui.numeric-field.js').then(r => ({ status: r.status, url: r.url, contentType: r.headers.get('content-type') }))");
  check('component ES module static web asset is served successfully', moduleFetch.status === 200, moduleFetch);

  await replaceText('numeric-signed', '-12.50');
  await poll(() => read("document.querySelector('#numeric-signed')?.value === '-12.50'"));
  await poll(() => read("[...document.querySelectorAll('p')].some(x => x.textContent.includes('Signed value: -12.50'))"), 15000);
  const signed = await read("({value:document.querySelector('#numeric-signed').value,output:[...document.querySelectorAll('p')].find(x=>x.textContent.includes('Signed value:'))?.textContent,now:document.querySelector('#numeric-signed').getAttribute('aria-valuenow')})");
  check('signed decimal input commits without stripping sign or decimal separator', signed.value === '-12.50' && signed.output?.includes('-12.50'), signed);
  check('signed decimal aria-valuenow remains the numeric value', signed.now === '-12.5', signed);

  await read("document.querySelector('#numeric-price').focus()");
  await evaluate("document.querySelector('#numeric-price').parentElement.querySelector('.numeric-step-up').click()");
  await poll(() => read("[...document.querySelectorAll('p')].some(x=>x.textContent.includes('Committed value: 12.75'))"));
  const afterPointer = await read("({value:document.querySelector('#numeric-price').value,output:[...document.querySelectorAll('p')].find(x=>x.textContent.includes('Committed value:'))?.textContent,active:document.activeElement?.id})");
  check('pointer step-up increments decimal by configured 0.25', afterPointer.value.includes('12.75') && afterPointer.output?.includes('12.75'), afterPointer);

  await read("document.querySelector('#numeric-price').focus()");
  await key('ArrowUp', 'ArrowUp', 38);
  await poll(() => read("[...document.querySelectorAll('p')].some(x=>x.textContent.includes('Committed value: 13.00'))"));
  const afterArrow = await read("({value:document.querySelector('#numeric-price').value,output:[...document.querySelectorAll('p')].find(x=>x.textContent.includes('Committed value:'))?.textContent})");
  check('ArrowUp increments decimal by configured Step', afterArrow.value.includes('13.00') && afterArrow.output?.includes('13.00'), afterArrow);

  await replaceText('numeric-quantity', '-1');
  await poll(() => read("document.querySelector('#numeric-quantity')?.value === '-1'"));
  await read("document.querySelector('#numeric-quantity').blur()");
  await wait(250);
  const invalid = await read("({value:document.querySelector('#numeric-quantity').value,now:document.querySelector('#numeric-quantity').getAttribute('aria-valuenow'),invalid:document.querySelector('#numeric-quantity').getAttribute('aria-invalid'),message:[...document.querySelectorAll('*')].find(x=>x.children.length===0 && x.textContent.includes('at least'))?.textContent})");
  check('out-of-range text remains visible after blur and omits stale aria-valuenow', invalid.value === '-1' && invalid.now === null, invalid);
  await read("document.querySelector('#numeric-quantity').focus()");
  const recoveryBefore = await read("({value:document.querySelector('#numeric-quantity').value,upDisabled:document.querySelector('#numeric-quantity').parentElement.querySelector('.numeric-step-up').disabled,downDisabled:document.querySelector('#numeric-quantity').parentElement.querySelector('.numeric-step-down').disabled,active:document.activeElement.id})");
  await key('ArrowUp', 'ArrowUp', 38);
  await wait(500);
  let recoveryAfter = await read("({value:document.querySelector('#numeric-quantity').value,now:document.querySelector('#numeric-quantity').getAttribute('aria-valuenow'),upDisabled:document.querySelector('#numeric-quantity').parentElement.querySelector('.numeric-step-up').disabled,downDisabled:document.querySelector('#numeric-quantity').parentElement.querySelector('.numeric-step-down').disabled,active:document.activeElement.id})");
  if (recoveryAfter.value !== '4') {
    await evaluate("document.querySelector('#numeric-quantity').parentElement.querySelector('.numeric-step-up').click()");
    await wait(500);
    recoveryAfter = await read("({value:document.querySelector('#numeric-quantity').value,now:document.querySelector('#numeric-quantity').getAttribute('aria-valuenow'),upDisabled:document.querySelector('#numeric-quantity').parentElement.querySelector('.numeric-step-up').disabled,downDisabled:document.querySelector('#numeric-quantity').parentElement.querySelector('.numeric-step-down').disabled,active:document.activeElement.id})");
  }
  check('ArrowUp or stepper moves an out-of-range value into the inclusive range', recoveryAfter.value === '4', { before: recoveryBefore, after: recoveryAfter });

  await read("document.querySelector('#numeric-quantity').focus()");
  await key('End', 'End', 35);
  await wait(500); const endState = await read("({value:document.querySelector('#numeric-quantity').value,hasMax:document.querySelector('#numeric-quantity').dataset.buiNumericHasMax,active:document.activeElement.id})"); check('End moves to the explicitly configured Max', endState.value === '100', endState);
  await key('Home', 'Home', 36);
  await wait(500); const homeState = await read("({value:document.querySelector('#numeric-quantity').value,hasMin:document.querySelector('#numeric-quantity').dataset.buiNumericHasMin,active:document.activeElement.id})"); check('Home moves to the explicitly configured Min', homeState.value === '0', homeState);

  const states = await read(`({
    readOnly:{readOnly:!!document.getElementById('numeric-readonly')?.readOnly,stepperHidden:!document.getElementById('numeric-readonly')?.closest('.bui-numeric-field')?.querySelector('.numeric-stepper')?.getClientRects().length},
    disabled:{disabled:!!document.getElementById('numeric-disabled')?.disabled,stepperHidden:!document.getElementById('numeric-disabled')?.closest('.bui-numeric-field')?.querySelector('.numeric-stepper')?.getClientRects().length},
    buttons:[...document.querySelectorAll('.bui-numeric-field .numeric-stepper button')].map(x=>({tag:x.tagName,tabindex:x.getAttribute('tabindex')}))
})`);
  check('readonly and disabled native states suppress stepper controls', states.readOnly.readOnly && states.readOnly.stepperHidden && states.disabled.disabled && states.disabled.stepperHidden, states);
  check('pointer stepper buttons are not sequential Tab stops', states.buttons.every(x=>x.tabindex === '-1'), states.buttons);

  const finalSignals = signals.filter(x => x.type === 'exception' || x.type === 'error' || (x.type === 'http' && x.status >= 500));
  check('no unhandled browser exceptions or console errors', finalSignals.length === 0, finalSignals);
  console.log(JSON.stringify({ browser: browserLabel, renderMode, passed: checks.filter(x=>x.pass).length, total: checks.length, failures: checks.filter(x=>!x.pass), checks, runtimeSignals: signals }, null, 2));
  if (checks.some(x => !x.pass)) process.exitCode = 1;
} catch (error) {
  console.error(error?.stack || error);
  process.exitCode = 1;
} finally {
  try { ws?.close(); } catch {}
  if (browser && !browser.killed) browser.kill();
  await wait(250);
  try { await rm(profile, { recursive: true, force: true }); } catch (error) { console.warn(`TEMP PROFILE CLEANUP DEFERRED: ${error.code || error.message}`); }
}
