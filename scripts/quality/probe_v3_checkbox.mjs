#!/usr/bin/env node
// #434 real-browser Checkbox probe. Runs against the shared source-owned demo.
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';

const base = (process.argv[2] || 'http://127.0.0.1:5080').replace(/\/$/, '');
const browserLabel = process.env.BLUENT_BROWSER_LABEL || 'Chrome';
const renderMode = process.env.BLUENT_CHECKBOX_RENDER_MODE || 'WebAssembly';
const route = renderMode === 'InteractiveServer'
  ? '/compatibility/checkboxes-server'
  : '/components/checkboxes';
const executable = process.env.BROWSER_PATH || process.env.CHROME_PATH;
const evidencePath = process.env.BLUENT_CHECKBOX_EVIDENCE_PATH;
const profilePrefix = process.env.BLUENT_CHECKBOX_PROFILE_PREFIX || 'bluent-v3-434-checkbox-';
const profile = await mkdtemp(join(tmpdir(), profilePrefix));
const checks = [];
const signals = [];
const pending = new Map();
let browser, ws, sequence = 0;

const check = (name, condition, detail = null) => {
  console.log(`QA CHECK ${condition ? 'PASS' : 'FAIL'} ${name}`);
  if (!condition && detail !== null) console.log('  detail:', JSON.stringify(detail));
  checks.push({ name, pass: !!condition, detail });
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  const timer = setTimeout(() => {
    pending.delete(id);
    reject(new Error(`CDP timeout: ${method}`));
  }, 15000);
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
    await wait(150);
  }
  throw new Error('Timed out waiting for Checkbox browser condition');
};
const key = async (value, code, virtualKey) => {
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown', key: value, code,
    windowsVirtualKeyCode: virtualKey, nativeVirtualKeyCode: virtualKey
  });
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp', key: value, code,
    windowsVirtualKeyCode: virtualKey, nativeVirtualKeyCode: virtualKey
  });
};
const click = async selector => {
  await evaluate(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(!e) throw new Error('missing click target'); e.scrollIntoView({block:'center',inline:'center'}); return true; })()`);
  await wait(80);
  const box = await evaluate(`(() => {
    const e=document.querySelector(${JSON.stringify(selector)});
    if(!e) return null;
    const r=e.getBoundingClientRect();
    return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height};
  })()`);
  if (!box || box.w <= 0 || box.h <= 0) throw new Error(`Missing visible click target: ${selector}`);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: box.x, y: box.y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: box.x, y: box.y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box.x, y: box.y, button: 'left', clickCount: 1 });
};
const axFor = async selector => {
  const node = await send('DOM.getDocument', { depth: 0, pierce: true });
  const found = await send('DOM.querySelector', { nodeId: node.root.nodeId, selector });
  if (!found.nodeId) return null;
  const tree = await send('Accessibility.getPartialAXTree', { nodeId: found.nodeId, fetchRelatives: false });
  const item = tree.nodes?.find(x => x.role?.value === 'checkbox') || tree.nodes?.[0];
  const prop = name => item?.properties?.find(x => x.name === name)?.value?.value;
  return { role: item?.role?.value, name: item?.name?.value, checked: prop('checked'), disabled: prop('disabled'), required: prop('required') };
};
const snapshot = async name => {
  await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    .then(async result => {
      if (!evidencePath) return;
      const file = evidencePath.replace(/\.json$/i, `-${name}.png`);
      await writeFile(file, Buffer.from(result.data, 'base64'));
    });
};

try {
  if (!executable) throw new Error('BROWSER_PATH or CHROME_PATH is required');
  browser = spawn(executable, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run',
    '--disable-extensions', '--disable-crash-reporter', '--disable-breakpad',
    '--remote-debugging-port=0', '--remote-allow-origins=*',
    `--user-data-dir=${profile}`, 'about:blank'
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
      const waiter = pending.get(message.id);
      pending.delete(message.id);
      message.error ? waiter.reject(new Error(JSON.stringify(message.error))) : waiter.resolve(message.result || {});
    }
    if (message.method === 'Runtime.exceptionThrown')
      signals.push({ type: 'exception', text: message.params?.exceptionDetails?.text });
    if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params?.type))
      signals.push({ type: message.params.type, text: message.params?.args?.map(x => x.value || x.description || '').join(' ').slice(0, 300) });
    if (message.method === 'Network.responseReceived' && message.params?.response?.status >= 400)
      signals.push({ type: 'http', status: message.params.response.status, url: message.params.response.url });
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('DOM.enable');
  await send('Accessibility.enable');
  await send('Page.navigate', { url: base + route });
  await poll(() => evaluate("document.readyState !== 'loading' && !!document.querySelector('#checkbox-select-all')"));
  if (renderMode === 'InteractiveServer') {
    await poll(() => evaluate("document.querySelector('#checkbox-interactive-ready')?.dataset.ready === 'true'"), 30000);
  }
  // The host marker proves the page's InteractiveServer circuit is alive. It does not await
  // every child's asynchronous JS-module import, so separately await the native mixed state.
  await poll(() => evaluate("document.querySelector('#checkbox-select-all')?.indeterminate === true"), 30000);
  check(`Checkbox showcase loads in ${browserLabel}/${renderMode}`, true, { url: base + route });

  const baseState = await evaluate(`(() => {
    const input=document.querySelector('#checkbox-select-all');
    const label=input?.labels?.[0];
    const required=document.querySelector('#checkbox-terms');
    const requiredLabel=required?.labels?.[0];
    const marker=requiredLabel?.querySelector('.required');
    const target=input?.getBoundingClientRect();
    return {
      inputCount:document.querySelectorAll('input[type=checkbox]').length,
      id:input?.id,
      labelFor:label?.htmlFor,
      checked:input?.checked,
      indeterminate:input?.indeterminate,
      role:input?.getAttribute('role'),
      ariaChecked:input?.getAttribute('aria-checked'),
      markerNameRef:required?.getAttribute('aria-labelledby'),
      markerNameText:requiredLabel?.querySelector('span[id]')?.textContent,
      markerText:marker?.textContent,
      markerHidden:marker?.getAttribute('aria-hidden'),
      markerNativeRequired:required?.required,
      markerOwnAriaLabel:required?.getAttribute('aria-label'),
      target:{width:target?.width,height:target?.height},
      disabledCount:document.querySelectorAll('input[type=checkbox]:disabled').length,
      rtlDirection:getComputedStyle(document.querySelector('[dir=rtl] .bui-checkbox')).direction,
      moduleLoaded:performance.getEntriesByType('resource').some(x=>x.name.includes('bluent.ui.checkbox'))
    };
  })()`);
  check('one native input per fixture and generated ID is associated with the visible label',
    baseState.inputCount >= 12 && !!baseState.id && baseState.labelFor === baseState.id, baseState);
  check('nullable Mixed is native indeterminate, unchecked, and does not author aria-checked',
    baseState.checked === false && baseState.indeterminate === true &&
    baseState.role === null && baseState.ariaChecked === null, baseState);
  check('Required marker is hidden from the native checkbox accessible name without making it required',
    baseState.markerNameRef === 'checkbox-terms-label' &&
    baseState.markerNameText === 'I accept the terms and conditions' &&
    baseState.markerText === '*' && baseState.markerHidden === 'true' &&
    baseState.markerNativeRequired === false, baseState);
  check('input hit target is at least 24×24 CSS pixels and RTL host direction is inherited',
    baseState.target.width >= 24 && baseState.target.height >= 24 && baseState.rtlDirection === 'rtl', baseState);
  check('component-specific ES module is requested by the browser', baseState.moduleLoaded, baseState);

  const mixedAX = await axFor('#checkbox-select-all');
  const requiredAX = await axFor('#checkbox-terms');
  check('native Mixed is exposed in the browser accessibility tree as a checkbox with a computed mixed state',
    mixedAX?.role === 'checkbox' && mixedAX.checked === 'mixed', mixedAX);
  check('Required checkbox computed accessible name excludes the decorative asterisk',
    requiredAX?.role === 'checkbox' && requiredAX.name === 'I accept the terms and conditions', requiredAX);

  await click('label[for="checkbox-select-all"]');
  await poll(() => evaluate("document.querySelector('#checkbox-select-all')?.checked === true && document.querySelector('#checkbox-select-all')?.indeterminate === false"));
  await poll(() => evaluate("[...document.querySelectorAll('p')].find(x=>x.textContent.includes('Model value:'))?.textContent.includes('true (Checked)') === true"), 30000);
  const afterPointer = await evaluate("({checked:document.querySelector('#checkbox-select-all').checked,indeterminate:document.querySelector('#checkbox-select-all').indeterminate,status:[...document.querySelectorAll('p')].find(x=>x.textContent.includes('Model value:'))?.textContent})");
  check('pointer activation changes Mixed to Checked and clears native indeterminate', afterPointer.checked && !afterPointer.indeterminate && afterPointer.status.includes('true'), afterPointer);

  await evaluate("document.querySelector('#checkbox-select-all').focus()");
  await key(' ', 'Space', 32);
  await poll(() => evaluate("document.querySelector('#checkbox-select-all')?.checked === false"));
  await poll(() => evaluate("[...document.querySelectorAll('p')].find(x=>x.textContent.includes('Model value:'))?.textContent.includes('false (Unchecked)') === true"), 30000);
  const afterSpace = await evaluate("({checked:document.querySelector('#checkbox-select-all').checked,indeterminate:document.querySelector('#checkbox-select-all').indeterminate,status:[...document.querySelectorAll('p')].find(x=>x.textContent.includes('Model value:'))?.textContent})");
  check('native Space activation changes Checked to Unchecked and updates the bound model', !afterSpace.checked && !afterSpace.indeterminate && afterSpace.status.includes('false'), afterSpace);

  await click('#checkbox-reset-mixed');
  await poll(() => evaluate("document.querySelector('#checkbox-select-all')?.indeterminate === true"));
  await evaluate("document.querySelector('#checkbox-select-all').focus()");
  await key(' ', 'Space', 32);
  await poll(() => evaluate("document.querySelector('#checkbox-select-all')?.checked === true && document.querySelector('#checkbox-select-all')?.indeterminate === false"));
  check('native Space activation from Mixed follows null → true without custom cycling', true,
    await evaluate("({checked:document.querySelector('#checkbox-select-all').checked,indeterminate:document.querySelector('#checkbox-select-all').indeterminate})"));

  const disabled = await evaluate(`(() => {
    const e=document.querySelectorAll('.bui-checkbox.disabled input[type=checkbox]');
    return [...e].map(x=>({disabled:x.disabled,checked:x.checked,indeterminate:x.indeterminate}));
  })()`);
  check('Disabled Unchecked/Checked/Mixed examples use native disabled inputs', disabled.length === 3 && disabled.every(x=>x.disabled), disabled);

  const variants = await evaluate(`(() => ({
    large:document.querySelector('.bui-checkbox.large')?.classList.contains('large'),
    circular:document.querySelector('.bui-checkbox.circular')?.classList.contains('circular'),
    before:document.querySelector('.bui-checkbox.label-before')?.classList.contains('label-before'),
    errorRow:document.querySelector('#checkbox-terms')?.closest('.bui-checkbox')?.classList.contains('invalid')
  }))()`);
  check('Large, Circular and LabelPosition.Before variants are present', variants.large && variants.circular && variants.before, variants);

  await click('#checkbox-validation-submit');
  await poll(() => evaluate("document.querySelector('#checkbox-terms')?.getAttribute('aria-invalid') === 'true'"));
  const validation = await evaluate("({invalid:document.querySelector('#checkbox-terms').getAttribute('aria-invalid'),required:document.querySelector('#checkbox-terms').required,message:document.querySelector('#checkbox-terms-validation')?.textContent.trim()})");
  check('EditForm validation adds native aria-invalid without treating the decoration as required',
    validation.invalid === 'true' && validation.required === false && validation.message.includes('You must accept'), validation);

  await click('.required');
  await poll(() => evaluate("document.querySelector('#checkbox-terms')?.checked === true"));
  check('clicking the decorative marker still activates its associated native checkbox', true,
    await evaluate("({checked:document.querySelector('#checkbox-terms').checked,markerHidden:document.querySelector('.required').getAttribute('aria-hidden')})"));

  await evaluate("document.activeElement?.blur()");
  let focus = null;
  for (let i = 0; i < 80; i++) {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
    focus = await evaluate(`(() => {
      const i=document.activeElement;
      const e=i?.matches('input[type=checkbox]') ? i.nextElementSibling : null;
      return {id:i?.id,isCheckbox:i?.matches('input[type=checkbox]')===true,focusVisible:i?.matches(':focus-visible')===true,outline:e?getComputedStyle(e).outlineWidth:null};
    })()`);
    if (focus?.isCheckbox && focus.focusVisible) break;
  }
  check('native Tab navigation reaches a checkbox and exposes the visible 2px focus ring',
    focus?.isCheckbox === true && focus.focusVisible === true && focus.outline === '2px', focus);

  await evaluate("document.querySelector('#checkbox-notifications')?.scrollIntoView({block:'center',inline:'center'})");
  await wait(120);
  const hoverTarget = await evaluate(`(() => { const r=document.querySelector('#checkbox-notifications')?.nextElementSibling?.getBoundingClientRect(); return r?{x:r.x+r.width/2,y:r.y+r.height/2}:null; })()`);
  if (hoverTarget) {
    await send('Input.dispatchMouseEvent', { type:'mouseMoved', x:hoverTarget.x, y:hoverTarget.y });
    await wait(80);
    const hover = await evaluate("({hover:document.querySelector('#checkbox-notifications')?.closest('.bui-checkbox')?.matches(':hover'),border:getComputedStyle(document.querySelector('#checkbox-notifications').nextElementSibling).borderColor})");
    check('unchecked Rest/Hover state responds to pointer hover', hover.hover === true && hover.border !== 'rgb(97, 97, 97)', hover);
    await send('Input.dispatchMouseEvent', { type:'mousePressed', x:hoverTarget.x, y:hoverTarget.y, button:'left', clickCount:1 });
    await wait(40);
    const pressed = await evaluate("({active:document.querySelector('#checkbox-notifications')?.closest('.bui-checkbox')?.matches(':active'),border:getComputedStyle(document.querySelector('#checkbox-notifications').nextElementSibling).borderColor})");
    check('unchecked Rest/Pressed state responds to pointer press', pressed.active === true && pressed.border !== hover.border, pressed);
    await send('Input.dispatchMouseEvent', { type:'mouseReleased', x:hoverTarget.x, y:hoverTarget.y, button:'left', clickCount:1 });
  } else check('unchecked Rest/Hover state responds to pointer hover', false, hoverTarget);

  await send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] });
  const forced = await evaluate("({active:matchMedia('(forced-colors: active)').matches,adjust:getComputedStyle(document.querySelector('#checkbox-select-all').nextElementSibling).forcedColorAdjust})");
  check('forced-colors stylesheet activates without removing native indicator semantics',
    forced.active && forced.adjust === 'none', forced);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'none' }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
  const reduced = await evaluate("({active:matchMedia('(prefers-reduced-motion: reduce)').matches,transition:getComputedStyle(document.querySelector('#checkbox-select-all').nextElementSibling).transitionDuration,animation:getComputedStyle(document.querySelector('#checkbox-select-all').nextElementSibling).animationDuration})");
  check('reduced-motion stylesheet disables Checkbox transitions and animations',
    reduced.active && reduced.transition === '0s' && reduced.animation === '0s', reduced);

  await send('Emulation.setEmulatedMedia', { features: [] });
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 740, deviceScaleFactor: 2, mobile: false });
  await poll(() => evaluate('window.innerWidth === 320'));
  const mobile = await evaluate("({width:window.innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth,checkboxes:document.querySelectorAll('input[type=checkbox]').length})");
  check('320px reflow preserves all Checkbox examples without horizontal overflow',
    mobile.width === 320 && mobile.scroll <= 320 && mobile.body <= 320, mobile);
  await snapshot('320px');

  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await poll(() => evaluate('window.innerWidth === 1280'));
  await snapshot('1280px');

  const hardErrors = signals.filter(x => x.type === 'exception' || x.type === 'error' || x.type === 'http');
  check('no browser exceptions, console errors or HTTP failures occurred', hardErrors.length === 0, hardErrors);
} catch (error) {
  signals.push({ type: 'fatal', text: error?.stack || String(error) });
  console.error(error?.stack || error);
} finally {
  try { ws?.close(); } catch {}
  if (browser && !browser.killed) {
    try { browser.kill(); } catch {}
  }
  const report = {
    issue: 434, browser: browserLabel, renderMode, base, route,
    generatedAt: new Date().toISOString(),
    passed: checks.filter(x => x.pass).length,
    failed: checks.filter(x => !x.pass).length,
    checks, runtimeSignals: signals,
    profilePrefix, screenshotPrefix: evidencePath?.replace(/\.json$/i, '') || null
  };
  if (evidencePath) {
    await mkdir(dirname(evidencePath), { recursive: true });
    await writeFile(evidencePath, JSON.stringify(report, null, 2), 'utf8');
  }
  console.log(`\nRESULT ${report.passed}/${checks.length} PASS; ${report.failed} FAIL`);
  if (report.failed || signals.some(x => x.type === 'fatal')) process.exitCode = 1;
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
