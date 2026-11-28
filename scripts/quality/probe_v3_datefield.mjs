#!/usr/bin/env node
// #438 local real-Chrome probe for the DateField showcase.
// Usage: node scripts/quality/probe_v3_datefield.mjs [http://127.0.0.1:5000]
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const origin = (process.argv[2] || 'http://127.0.0.1:5000').replace(/\/$/, '');
const route = process.env.BLUENT_DATEFIELD_ROUTE || '/compatibility/datefield-probe';
const renderMode = process.env.BLUENT_DATEFIELD_RENDER_MODE || 'WebAssembly';
const chrome = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile = await mkdtemp(join(tmpdir(), 'bluent-v3-438-datefield-'));
const checks = [];
const failures = [];
const exceptions = [];
const visualArtifacts = [];
const visualDir = process.env.BLUENT_DATEFIELD_VISUAL_DIR;
const axTreeEnabled = process.env.BLUENT_DATEFIELD_AX_TREE === '1';
let browser;
let ws;
let sequence = 0;
const pending = new Map();

const check = (name, pass, details = null) => {
  checks.push({ name, pass: !!pass, details });
  if (!pass) failures.push(name);
  console.log('QA CHECK ' + (pass ? 'PASS ' : 'FAIL ') + name);
};
const poll = async (fn, name, timeout = 30000) => {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try {
      const value = await fn();
      if (value) return value;
    } catch {}
    await delay(200);
  }
  throw new Error('Timed out waiting for ' + name);
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  const timer = setTimeout(() => {
    pending.delete(id);
    reject(new Error('CDP timeout: ' + method));
  }, 15000);
  pending.set(id, {
    resolve: value => { clearTimeout(timer); resolve(value); },
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
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser JavaScript exception');
  return result.result?.value;
};
const clickAt = async expression => {
  const point = await poll(async () => (await evaluate(expression)) || false, 'hit-testable pointer target', 10000);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y, button: 'none', buttons: 0 });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', buttons: 1, clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', buttons: 0, clickCount: 1 });
};
const press = async (key, { shift = false } = {}) => {
  const keys = {
    ArrowLeft: { code: 'ArrowLeft', vk: 37 },
    ArrowRight: { code: 'ArrowRight', vk: 39 },
    ArrowUp: { code: 'ArrowUp', vk: 38 },
    ArrowDown: { code: 'ArrowDown', vk: 40 },
    Home: { code: 'Home', vk: 36 },
    End: { code: 'End', vk: 35 },
    PageUp: { code: 'PageUp', vk: 33 },
    PageDown: { code: 'PageDown', vk: 34 },
    Enter: { code: 'Enter', vk: 13 },
    ' ': { code: 'Space', vk: 32 },
    Escape: { code: 'Escape', vk: 27 },
    Tab: { code: 'Tab', vk: 9 }
  };
  const entry = keys[key];
  if (!entry) throw new Error('Unsupported probe key: ' + key);
  const modifiers = shift ? 8 : 0;
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code: entry.code, modifiers, windowsVirtualKeyCode: entry.vk, nativeVirtualKeyCode: entry.vk });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: entry.code, modifiers, windowsVirtualKeyCode: entry.vk, nativeVirtualKeyCode: entry.vk });
};

try {
  browser = spawn(chrome, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--disable-extensions',
    '--remote-debugging-port=0', '--remote-allow-origins=*', '--user-data-dir=' + profile, 'about:blank'
  ], { stdio: 'ignore', windowsHide: true });

  const port = await poll(async () => {
    const value = await readFile(join(profile, 'DevToolsActivePort'), 'utf8');
    return value.trim().split(/\r?\n/)[0];
  }, 'Chrome DevTools endpoint', 60000);
  const tabs = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  const tab = tabs.find(item => item.type === 'page' && item.webSocketDebuggerUrl);
  if (!tab) throw new Error('Chrome did not expose a page target');

  ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  ws.addEventListener('message', event => {
    const message = JSON.parse(String(event.data));
    if (message.method === 'Runtime.exceptionThrown') {
      exceptions.push(message.params.exceptionDetails?.text || 'JavaScript exception');
      return;
    }
    if (message.method === 'Runtime.consoleAPICalled' && message.params?.type === 'error') {
      exceptions.push((message.params.args || []).map(arg => arg.value || arg.description || '').join(' '));
      return;
    }
    const waiter = pending.get(message.id);
    if (waiter) {
      pending.delete(message.id);
      message.error ? waiter.reject(new Error(JSON.stringify(message.error))) : waiter.resolve(message.result || {});
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: origin + route });
  const readiness = renderMode === 'InteractiveServer'
    ? "!!document.querySelector('#datefield-interactive-ready[data-ready=true]') && !!document.querySelector('#smallDateField')"
    : "!!document.querySelector('#datefield-probe-ready[data-ready=true]') && !!document.querySelector('#smallDateField')";
  await poll(() => evaluate(readiness), 'interactive DateField showcase');
  check('browser loads the isolated DateField browser probe', true, { url: origin + route, renderMode });

  const initial = await evaluate("(()=>({input:document.querySelector('#smallDateField')?.value,triggerCount:document.querySelectorAll('button[aria-haspopup=dialog]').length,disabledTrigger:[...document.querySelectorAll('button[aria-haspopup=dialog]')].some(b=>b.disabled) }))()");
  check('probe renders DateTime and DateOnly fields with calendar triggers', initial.triggerCount >= 2, initial);
  if (axTreeEnabled) {
    await send('Accessibility.enable');
    const tree = await send('Accessibility.getFullAXTree');
    const fieldNames = (tree.nodes || [])
      .filter(node => node.role?.value === 'textbox')
      .map(node => node.name?.value)
      .filter(Boolean);
    check('Chromium accessibility tree exposes the DateTime and DateOnly labels',
      fieldNames.includes('DateTime value') && fieldNames.includes('DateOnly value'), fieldNames);
  }

  await clickAt("(()=>{const b=[...document.querySelectorAll('button[aria-haspopup=dialog]')].find(x=>!x.disabled);if(!b)return null;b.scrollIntoView({block:'center',behavior:'instant'});const r=b.getBoundingClientRect(),x=Math.round(r.left+r.width/2),y=Math.round(r.top+r.height/2);return document.elementFromPoint(x,y)?.closest('button')===b?{x,y}:null})()");
  await poll(() => evaluate("!!document.querySelector('[role=dialog]')"), 'DateField calendar dialog');
  const semantics = await evaluate("(()=>{const d=document.querySelector('[role=dialog]'),id=d?.getAttribute('aria-labelledby'),h=id&&document.getElementById(id),g=d?.querySelector('[role=grid]'),selected=g?.querySelectorAll('button[aria-pressed=\\\"true\\\"]'),day=g?.querySelector('button[aria-pressed=\\\"true\\\"]');return {labelledBy:id,heading:h?.textContent?.trim(),headingLive:h?.getAttribute('aria-live'),gridLabel:g?.getAttribute('aria-label'),dialogModal:d?.getAttribute('aria-modal'),selectedCount:selected?.length,selectedTabIndex:day?.tabIndex,activeInside:!!g?.contains(document.activeElement),expanded:[...document.querySelectorAll('button[aria-haspopup=dialog]')].find(b=>b.getAttribute('aria-expanded')==='true')!==undefined}})()");
  check('DateField dialog is named by the current live month/year heading',
    !!semantics.labelledBy && !!semantics.heading && semantics.heading === semantics.gridLabel && semantics.headingLive === 'polite',
    semantics);
  check('calendar keeps one selected, tabbable day in a non-modal dialog',
    semantics.selectedCount === 1 && semantics.selectedTabIndex === 0 && semantics.dialogModal !== 'true',
    semantics);
  const dateFieldVisual = await evaluate("(()=>{const c=document.querySelector('[role=dialog] .datefield-calendar-popup'),d=c?.querySelector('td.day-cell:not(.selected):not(.disabled):not(.today) > button'),n=c?.querySelector('.header .nav > button'),p=c?.querySelector('.header .nav > button:first-child > svg'),q=c?.querySelector('.header .nav > button:last-child > svg'),ds=d&&getComputedStyle(d),ns=n&&getComputedStyle(n),pt=p&&getComputedStyle(p).transform,qt=q&&getComputedStyle(q).transform,pm=pt&&pt!=='none'?new DOMMatrixReadOnly(pt):null,qm=qt&&qt!=='none'?new DOMMatrixReadOnly(qt):null,dr=d?.getBoundingClientRect(),nr=n?.getBoundingClientRect();return {dayWidth:dr?.width,dayHeight:dr?.height,dayRadius:ds?.borderRadius,dayBorderStyle:ds?.borderTopStyle,dayBorderColor:ds?.borderTopColor,navWidth:nr?.width,navHeight:nr?.height,navBorderStyle:ns?.borderTopStyle,navBorderColor:ns?.borderTopColor,previousIconTransform:pt,nextIconTransform:qt,previousArrowPointsLeft:!!pm&&pm.b<0,nextArrowPointsRight:!!qm&&qm.b<0}})()");
  check('DateField day circles and navigation controls use the approved outlined geometry',
    dateFieldVisual.dayWidth === 30 && dateFieldVisual.dayHeight === 30 && parseFloat(dateFieldVisual.dayRadius) >= dateFieldVisual.dayWidth / 2 &&
      dateFieldVisual.dayBorderStyle === 'solid' && Math.abs(dateFieldVisual.navWidth - 44) < 0.5 && Math.abs(dateFieldVisual.navHeight - 44) < 0.5 &&
      dateFieldVisual.navBorderStyle === 'solid' && dateFieldVisual.previousArrowPointsLeft && dateFieldVisual.nextArrowPointsRight,
    dateFieldVisual);
  const dateFieldPopupSurface = await evaluate("(()=>{const d=document.querySelector('[role=dialog]'),r=d?.getBoundingClientRect();return d&&r?{width:r.width,height:r.height,viewportWidth:innerWidth,arrowCount:d.querySelectorAll('.arrow').length,clientWidth:d.clientWidth,scrollWidth:d.scrollWidth,horizontalOverflow:d.scrollWidth>d.clientWidth+1}:null})()");
  check('DateField popup has no arrow or horizontal scroll overflow',
    !!dateFieldPopupSurface && dateFieldPopupSurface.arrowCount === 0 && !dateFieldPopupSurface.horizontalOverflow,
    dateFieldPopupSurface);
  if (axTreeEnabled) {
    const tree = await send('Accessibility.getFullAXTree');
    const dialogs = (tree.nodes || []).filter(node => node.role?.value === 'dialog');
    const grids = (tree.nodes || []).filter(node => node.role?.value === 'grid');
    const axNames = { dialogs: dialogs.map(node => node.name?.value), grids: grids.map(node => node.name?.value) };
    check('Chromium accessibility tree names the calendar dialog and grid',
      dialogs.some(node => node.name?.value === semantics.heading) && grids.some(node => node.name?.value === semantics.heading), axNames);
  }

  const triggerWasFocused = await evaluate("document.activeElement?.matches('button[aria-haspopup=dialog]')");
  check('calendar opens with focus inside its grid', semantics.activeInside && triggerWasFocused === false, semantics);
  const readDayFocus = async () => evaluate("(()=>{const button=document.activeElement,row=button?.closest('tr'),days=[...(row?.querySelectorAll('td.day-cell > button')||[])];return {label:button?.getAttribute('aria-label'),index:days.indexOf(button),count:days.length}})()");
  const readCalendarTitle = async () => evaluate("document.querySelector('[role=dialog] .datefield-calendar-popup .header > .title')?.textContent?.trim()");
  const waitForCalendarFocus = (title, action) => poll(async () => {
    const state = await readDayFocus();
    return await readCalendarTitle() === title && state.index >= 0 ? state : false;
  }, action);

  const beforeArrow = await evaluate("document.activeElement?.getAttribute('aria-label')");
  await press('ArrowRight');
  const afterArrow = await poll(async () => {
    const value = await evaluate("document.activeElement?.getAttribute('aria-label')");
    return value && value !== beforeArrow ? value : false;
  }, 'ArrowRight roving focus');
  check('ArrowRight moves the active day button', !!afterArrow, { before: beforeArrow, after: afterArrow });

  await press('Home');
  const homeFocus = await poll(async () => { const state = await readDayFocus(); return state.index === 0 ? state : false; }, 'Home reaches first day of the culture-defined week');
  check('Home moves focus to the first day of the culture-defined week', homeFocus.index === 0, homeFocus);
  await press('End');
  const endFocus = await poll(async () => { const state = await readDayFocus(); return state.index === state.count - 1 ? state : false; }, 'End reaches last day of the culture-defined week');
  check('End moves focus to the last day of the culture-defined week', endFocus.index === endFocus.count - 1, endFocus);

  const initialCalendarTitle = semantics.heading;
  await waitForCalendarFocus(initialCalendarTitle, 'day focus before month navigation');
  await press('PageUp');
  const previousMonthTitle = await poll(async () => { const title = await readCalendarTitle(); return title && title !== initialCalendarTitle ? title : false; }, 'PageUp changes calendar month');
  check('PageUp moves to the previous month', !!previousMonthTitle && previousMonthTitle !== initialCalendarTitle, { before: initialCalendarTitle, after: previousMonthTitle });
  await waitForCalendarFocus(previousMonthTitle, 'day focus after PageUp');
  await press('PageDown');
  const restoredMonthTitle = await poll(async () => { const title = await readCalendarTitle(); return title === initialCalendarTitle ? title : false; }, 'PageDown restores calendar month');
  check('PageDown moves to the next month', restoredMonthTitle === initialCalendarTitle, restoredMonthTitle);
  await waitForCalendarFocus(initialCalendarTitle, 'day focus after PageDown');

  await press('PageUp', { shift: true });
  const previousYearTitle = await poll(async () => { const title = await readCalendarTitle(); return title && title !== initialCalendarTitle ? title : false; }, 'Shift+PageUp changes calendar year');
  check('Shift+PageUp moves to the previous year', !!previousYearTitle && previousYearTitle !== initialCalendarTitle, { before: initialCalendarTitle, after: previousYearTitle });
  await waitForCalendarFocus(previousYearTitle, 'day focus after Shift+PageUp');
  await press('PageDown', { shift: true });
  const restoredYearTitle = await poll(async () => { const title = await readCalendarTitle(); return title === initialCalendarTitle ? title : false; }, 'Shift+PageDown restores calendar year');
  check('Shift+PageDown moves to the next year', restoredYearTitle === initialCalendarTitle, restoredYearTitle);
  await waitForCalendarFocus(initialCalendarTitle, 'day focus after Shift+PageDown');

  const beforeKeyboardSelection = await evaluate("(()=>({input:document.querySelector('#smallDateField')?.value,output:document.querySelector('#dateTimeValue')?.textContent?.trim()}))()");
  await press(' ');
  await poll(() => evaluate("!document.querySelector('[role=dialog]')"), 'Space selects the focused day');
  const keyboardSelection = await poll(async () => {
    const value = await evaluate("(()=>({input:document.querySelector('#smallDateField')?.value,output:document.querySelector('#dateTimeValue')?.textContent?.trim()}))()");
    return value?.input && value.input !== beforeKeyboardSelection.input && value.output && value.output !== beforeKeyboardSelection.output ? value : false;
  }, 'Space selection updates the bound DateTime value');
  const spaceSelectionRestoresFocus = await evaluate("document.activeElement?.matches('button[aria-haspopup=dialog]') === true");
  check('Space selects the focused day, updates DateTime, and returns focus to the trigger',
    !!keyboardSelection && spaceSelectionRestoresFocus, { before: beforeKeyboardSelection, after: keyboardSelection, focusRestored: spaceSelectionRestoresFocus });

  // Headless CDP key events do not synthesize native Enter activation on buttons.
  // Enter activation is covered separately through the interactive browser controls.
  await clickAt("(()=>{const b=[...document.querySelectorAll('button[aria-haspopup=dialog]')].find(x=>!x.disabled);if(!b)return null;b.scrollIntoView({block:'center',behavior:'instant'});const r=b.getBoundingClientRect();const x=Math.round(r.left+r.width/2),y=Math.round(r.top+r.height/2);return document.elementFromPoint(x,y)?.closest('button')===b?{x,y}:null})()");
  await poll(() => evaluate("!!document.querySelector('[role=dialog]')"), 'calendar reopens after selection');
  await press('Escape');
  await poll(() => evaluate("!document.querySelector('[role=dialog]')"), 'Escape closes DateField calendar');

  const escapeRestoresFocus = await evaluate("document.activeElement?.matches('button[aria-haspopup=dialog]') === true");
  check('Escape closes the picker and restores focus to its trigger', escapeRestoresFocus);

  await press(' ');
  await poll(() => evaluate("!!document.querySelector('[role=dialog]')"), 'Space opens calendar trigger');
  const spaceOpensCalendar = await evaluate("!!document.querySelector('[role=dialog]')?.querySelector('[role=grid]')?.contains(document.activeElement)");
  check('Space opens the calendar and moves focus inside its grid', spaceOpensCalendar);
  await press('Tab');
  await poll(() => evaluate("!document.querySelector('[role=dialog]')"), 'Tab exits the calendar surface');
  const tabExit = await evaluate("!document.querySelector('[role=dialog]') && !document.querySelector('[role=dialog]')?.contains(document.activeElement)");
  check('Tab leaves the calendar naturally without a focus trap', tabExit);

  await clickAt("(()=>{const b=[...document.querySelectorAll('button[aria-haspopup=dialog]')].find(x=>!x.disabled);if(!b)return null;b.scrollIntoView({block:'center',behavior:'instant'});const r=b.getBoundingClientRect();const x=Math.round(r.left+r.width/2),y=Math.round(r.top+r.height/2);return document.elementFromPoint(x,y)?.closest('button')===b?{x,y}:null})()");
  await poll(() => evaluate("!!document.querySelector('[role=dialog]')"), 'picker reopens for day selection');

  const dayTarget = await poll(async () => {
    const candidate = await evaluate("(()=>{const d=[...document.querySelectorAll('[role=dialog]')].find(d=>{const r=d.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(d).visibility!=='hidden'}),b=[...(d?.querySelectorAll('table[role=grid] button')||[])].find(x=>x.getAttribute('aria-pressed')==='false'&&!x.disabled);if(!b)return null;b.scrollIntoView({block:'center',behavior:'instant'});const r=b.getBoundingClientRect(),x=Math.round(r.left+r.width/2),y=Math.round(r.top+r.height/2),hit=document.elementFromPoint(x,y);return {x,y,label:b.getAttribute('aria-label'),value:b.textContent.trim(),hit:hit?.closest('button')===b,hitTag:hit?.tagName,hitClass:hit?.className,hitText:hit?.textContent?.trim()}})()");
    return candidate?.hit ? candidate : false;
  }, 'visible unselected day target');
  check('browser identifies a visible unselected day target', !!dayTarget && dayTarget.hit, dayTarget);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: dayTarget.x, y: dayTarget.y, button: 'none', buttons: 0 });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: dayTarget.x, y: dayTarget.y, button: 'left', buttons: 1, clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: dayTarget.x, y: dayTarget.y, button: 'left', buttons: 0, clickCount: 1 });
  await poll(() => evaluate("!document.querySelector('[role=dialog]')"), 'day selection closes the picker');
  await delay(500);
  const selectedValue = await evaluate("document.querySelector('#smallDateField')?.value");
  const selectedOutput = await evaluate("document.querySelector('#dateTimeValue')?.textContent?.trim()");
  check('selecting a day updates the bound DateTime field', !!selectedValue && selectedValue !== initial.input && !!selectedOutput, { target: dayTarget, before: initial.input, after: selectedValue, output: selectedOutput });

  const dateOnlyState = await evaluate("(()=>({input:document.querySelector('#dateOnlyField')?.value,output:document.querySelector('#dateOnlyValue')?.textContent?.trim()}))()");
  check('DateOnly probe field renders its bound initial value', dateOnlyState.input === initial.input && dateOnlyState.output === '2026-11-24', dateOnlyState);

  await clickAt("(()=>{const b=document.querySelector('#dateOnlyField')?.closest('section')?.querySelector('button[aria-haspopup=dialog]');if(!b)return null;b.scrollIntoView({block:'center',behavior:'instant'});const r=b.getBoundingClientRect(),x=Math.round(r.left+r.width/2),y=Math.round(r.top+r.height/2);return document.elementFromPoint(x,y)?.closest('button')===b?{x,y}:null})()")
  await poll(() => evaluate("!!document.querySelector('[role=dialog]')"), 'DateOnly calendar dialog')
  await poll(async () => {
    const state = await evaluate("(()=>{const d=[...document.querySelectorAll('[role=dialog]')].find(d=>{const r=d.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(d).visibility!=='hidden'});return d?{runningAnimations:d.getAnimations({subtree:true}).filter(a=>a.playState==='running').length}:null})()")
    return state?.runningAnimations === 0 ? state : false
  }, 'DateOnly calendar position settle')
  const dateOnlyPlacement = await evaluate("(()=>{const d=[...document.querySelectorAll('[role=dialog]')].find(d=>{const r=d.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(d).visibility!=='hidden'}),r=d?.getBoundingClientRect(),id=d?.getAttribute('aria-labelledby'),h=id&&document.getElementById(id),title=d?.querySelector('.header > .title'),tr=title?.getBoundingClientRect(),titleStyle=title&&getComputedStyle(title),titleText=title?.textContent?.trim(),titleVisible=!!title&&!!tr&&tr.width>0&&tr.height>0&&tr.left>=0&&tr.right<=innerWidth&&tr.top>=r.top&&tr.bottom<=r.bottom&&tr.top>=0&&tr.bottom<=innerHeight&&titleStyle?.visibility!=='hidden'&&titleStyle?.display!=='none'&&!!titleText;return r?{top:r.top,bottom:r.bottom,height:r.height,viewportWidth:innerWidth,viewportHeight:innerHeight,titleVisible,titleText,titleTop:tr?.top,titleBottom:tr?.bottom,titleLeft:tr?.left,titleRight:tr?.right,accessibleHeadingPresent:!!h}:null})()")
  check('DateOnly calendar remains inside the viewport after opening',
    !!dateOnlyPlacement && dateOnlyPlacement.top >= 0 && dateOnlyPlacement.bottom <= dateOnlyPlacement.viewportHeight,
    dateOnlyPlacement)
  check('DateOnly calendar title remains visible in the compact viewport',
    !!dateOnlyPlacement?.titleVisible && !!dateOnlyPlacement?.titleText,
    dateOnlyPlacement)
  if (!dateOnlyPlacement?.titleVisible ||
      dateOnlyPlacement.top < 0 ||
      dateOnlyPlacement.bottom > dateOnlyPlacement.viewportHeight) {
    throw new Error('DateOnly compact popup placement failed: ' + JSON.stringify(dateOnlyPlacement))
  }
  if (visualDir) {
    const settledVisual = await poll(async () => {
      const state = await evaluate("(()=>{const d=[...document.querySelectorAll('[role=dialog]')].find(d=>{const r=d.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(d).visibility!=='hidden'});const runningAnimations=d?.getAnimations({subtree:true}).filter(a=>a.playState==='running').length??0;return {runningAnimations}})()")
      return state?.runningAnimations === 0 ? state : false
    }, 'DateOnly calendar content animations')
    check('calendar content animations settle before visual capture', settledVisual.runningAnimations === 0, settledVisual)
    await mkdir(visualDir, { recursive: true })
    const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    const file = join(visualDir, 'datefield-calendar-viewport-default.png')
    await writeFile(file, Buffer.from(screenshot.data, 'base64'))
    visualArtifacts.push({ file: file.split(/[\\\\/]/).at(-1), viewportHeight: dateOnlyPlacement.viewportHeight, placement: dateOnlyPlacement })
  }
  const dateOnlyDayTarget = await poll(async () => {
    const candidate = await evaluate("(()=>{const d=[...document.querySelectorAll('[role=dialog]')].find(d=>{const r=d.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(d).visibility!=='hidden'}),b=[...(d?.querySelectorAll('table[role=grid] button')||[])].find(x=>x.getAttribute('aria-pressed')==='false'&&!x.disabled);if(!b)return null;b.scrollIntoView({block:'center',behavior:'instant'});const r=b.getBoundingClientRect(),x=Math.round(r.left+r.width/2),y=Math.round(r.top+r.height/2),hit=document.elementFromPoint(x,y);return {x,y,label:b.getAttribute('aria-label'),value:b.textContent.trim(),hit:hit?.closest('button')===b}})()")
    return candidate?.hit ? candidate : false
  }, 'visible DateOnly unselected day target')
  check('browser identifies a visible unselected DateOnly day target', !!dateOnlyDayTarget && dateOnlyDayTarget.hit, dateOnlyDayTarget)
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: dateOnlyDayTarget.x, y: dateOnlyDayTarget.y, button: 'none', buttons: 0 })
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: dateOnlyDayTarget.x, y: dateOnlyDayTarget.y, button: 'left', buttons: 1, clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: dateOnlyDayTarget.x, y: dateOnlyDayTarget.y, button: 'left', buttons: 0, clickCount: 1 })
  await poll(() => evaluate("!document.querySelector('[role=dialog]')"), 'DateOnly day selection closes the picker')
  const dateOnlySelected = await poll(async () => {
    const value = await evaluate("(()=>({input:document.querySelector('#dateOnlyField')?.value,output:document.querySelector('#dateOnlyValue')?.textContent?.trim()}))()")
    return value?.output && value.output !== dateOnlyState.output ? value : false
  }, 'DateOnly binding update')
  check('selecting a day updates the bound DateOnly field', !!dateOnlySelected?.input && !!dateOnlySelected?.output && dateOnlySelected.output !== dateOnlyState.output, { before: dateOnlyState, after: dateOnlySelected, target: dateOnlyDayTarget })


  if (process.env.BLUENT_DATEFIELD_SELECTION_GRID_CHECK === '1') {
    for (const option of [
      { fieldId: 'monthSelectField', mode: 'month-select', label: 'MonthSelect' },
      { fieldId: 'yearSelectField', mode: 'year-select', label: 'YearSelect' }
    ]) {
      const triggerSelector = JSON.stringify('#' + option.fieldId);
      await clickAt("(()=>{const b=document.querySelector(" + triggerSelector + ")?.closest('section')?.querySelector('button[aria-haspopup=dialog]');if(!b)return null;b.scrollIntoView({block:'center',behavior:'instant'});const r=b.getBoundingClientRect(),x=Math.round(r.left+r.width/2),y=Math.round(r.top+r.height/2);return document.elementFromPoint(x,y)?.closest('button')===b?{x,y}:null})()");
      const gridSelector = '[role=dialog] .bui-calendar.' + option.mode + ' .grid';
      await poll(() => evaluate("!!document.querySelector(" + JSON.stringify(gridSelector) + ")"), option.label + ' selection grid');
      const readGrid = async () => evaluate("(()=>{const grid=document.querySelector(" + JSON.stringify(gridSelector) + "),buttons=[...(grid?.querySelectorAll('button')||[])].filter(button=>!button.disabled),style=grid&&getComputedStyle(grid),positions=buttons.map(button=>{const r=button.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top)]}),columns=new Set(positions.map(position=>position[0])).size,activeIndex=buttons.indexOf(document.activeElement);return {columns,gridTemplate:style?.gridTemplateColumns,display:style?.display,count:buttons.length,index:activeIndex,active:buttons[activeIndex]?.getAttribute('aria-label')||buttons[activeIndex]?.textContent?.trim(),positions}})()");
      const before = await poll(async () => { const state = await readGrid(); return state.index >= 0 ? state : false; }, option.label + ' initial grid focus');
      check(option.label + ' grid renders three columns', before.columns === 3 && before.count === 12, before);
      await press('ArrowDown');
      const down = await poll(async () => { const state = await readGrid(); return state.index === before.index + 3 ? state : false; }, option.label + ' ArrowDown movement');
      check(option.label + ' ArrowDown moves down three columns', down.index === before.index + 3, { before, after: down });
      await press('ArrowUp');
      const up = await poll(async () => { const state = await readGrid(); return state.index === before.index ? state : false; }, option.label + ' ArrowUp movement');
      check(option.label + ' ArrowUp returns up three columns', up.index === before.index, { before, after: up });
      await press('Escape');
      await poll(() => evaluate("!document.querySelector('[role=dialog]')"), option.label + ' picker closes');
    }
  }

  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 1, mobile: true });
  await evaluate("document.querySelector('#smallDateField')?.scrollIntoView({block:'center',behavior:'instant'})");
  const mobile = await evaluate("(()=>{const e=document.querySelector('#smallDateField')?.closest('.bui-date-field')||document.querySelector('#smallDateField')?.parentElement;const r=e?.getBoundingClientRect();return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,left:r?.left,right:r?.right}})()");
  check('DateField input stays within a 320px viewport', mobile.viewport === 320 && mobile.right <= 320 && mobile.left >= 0, mobile);

  if (visualDir) {
    const variants = [
      { width: 320, height: 800, theme: 'light', direction: 'ltr' },
      { width: 320, height: 800, theme: 'dark', direction: 'rtl' },
      { width: 390, height: 844, theme: 'light', direction: 'rtl' },
      { width: 390, height: 844, theme: 'dark', direction: 'ltr' }
    ];
    await mkdir(visualDir, { recursive: true });
    for (const variant of variants) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: variant.width, height: variant.height, deviceScaleFactor: 1, mobile: true
      });
      await evaluate(`(()=>{document.documentElement.dir='${variant.direction}';document.documentElement.dataset.buiTheme='${variant.theme}';window.scrollTo(0,0);return true})()`);
      await evaluate('document.fonts.ready');
      const layout = await evaluate("(()=>{const input=document.querySelector('#smallDateField'),r=input?.getBoundingClientRect();return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,left:r?.left,right:r?.right,theme:document.documentElement.dataset.buiTheme,direction:document.documentElement.dir}})()");
      const fits = layout.viewport === variant.width && layout.scrollWidth <= variant.width &&
        layout.left >= 0 && layout.right <= variant.width &&
        layout.theme === variant.theme && layout.direction === variant.direction;
      check(`DateField reflows at ${variant.width}px in ${variant.theme} ${variant.direction.toUpperCase()}`, fits, layout);
      const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      const file = join(visualDir, `datefield-${variant.width}-${variant.theme}-${variant.direction}.png`);
      await writeFile(file, Buffer.from(screenshot.data, 'base64'));
      visualArtifacts.push({ file: file.split(/[\\/]/).at(-1), ...variant, layout });
    }
    await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 1, mobile: true });
    await send('Emulation.setEmulatedMedia', { features: [
      { name: 'forced-colors', value: 'active' },
      { name: 'prefers-reduced-motion', value: 'reduce' }
    ] });
    await evaluate("(()=>{document.documentElement.dir='ltr';document.documentElement.dataset.buiTheme='light';window.scrollTo(0,0);return true})()");
    const emulatedState = await evaluate("(()=>{const r=document.querySelector('#smallDateField')?.getBoundingClientRect();return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,left:r?.left,right:r?.right,forcedColors:matchMedia('(forced-colors: active)').matches,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches}})()");
    check('DateField reflows under forced-colors and reduced-motion emulation',
      emulatedState.viewport === 320 && emulatedState.scrollWidth <= 320 &&
      emulatedState.left >= 0 && emulatedState.right <= 320 &&
      emulatedState.forcedColors && emulatedState.reducedMotion, emulatedState);
    const emulatedScreenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const emulatedFile = join(visualDir, 'datefield-320-forced-colors-reduced-motion.png');
    await writeFile(emulatedFile, Buffer.from(emulatedScreenshot.data, 'base64'));
    visualArtifacts.push({ file: emulatedFile.split(/[\\/]/).at(-1), width: 320, height: 800, theme: 'light', direction: 'ltr', emulated: ['forced-colors: active', 'prefers-reduced-motion: reduce'], layout: emulatedState });
    await send('Emulation.setEmulatedMedia', { features: [] });
  }

  if (process.env.BLUENT_DATEFIELD_POPUP_EDGE_CHECK === '1') {
    await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 480, deviceScaleFactor: 1, mobile: true });
    await evaluate("(()=>{const root=document.querySelector('#datefield-browser-probe'),section=document.querySelector('#smallDateField')?.closest('section');document.documentElement.dir='rtl';root.style.padding='0';section.style.position='fixed';section.style.left='0';section.style.right='0';section.style.bottom='8px';section.style.width='auto';section.style.margin='0';section.style.zIndex='9999';return true})()");
    await clickAt("(()=>{const b=document.querySelector('#smallDateField')?.closest('section')?.querySelector('button[aria-haspopup=dialog]');if(!b)return null;const r=b.getBoundingClientRect(),x=Math.round(r.left+r.width/2),y=Math.round(r.top+r.height/2);return document.elementFromPoint(x,y)?.closest('button')===b?{x,y}:null})()");
    await poll(() => evaluate("!!document.querySelector('[role=dialog]')"), 'edge-positioned DateField calendar');
    const placement = await evaluate("(()=>{const d=document.querySelector('[role=dialog]'),r=d?.getBoundingClientRect();return {viewportWidth:innerWidth,viewportHeight:innerHeight,left:r?.left,right:r?.right,top:r?.top,bottom:r?.bottom,trigger:document.querySelector('#smallDateField')?.closest('section')?.querySelector('button[aria-haspopup=dialog]')?.getBoundingClientRect().toJSON()}})()");
    check('DateField calendar flips and shifts within a 320px RTL viewport', placement.left >= 0 && placement.right <= placement.viewportWidth && placement.top >= 0 && placement.bottom <= placement.viewportHeight, placement);
    if (visualDir) {
      const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      const file = join(visualDir, 'datefield-calendar-edge-320-rtl.png');
      await writeFile(file, Buffer.from(screenshot.data, 'base64'));
      visualArtifacts.push({ file: file.split(/[\\/]/).at(-1), width: 320, height: 480, theme: 'light', direction: 'rtl', placement });
    }
  }

  check('browser runtime reports no uncaught JavaScript errors', exceptions.length === 0, exceptions);
} catch (error) {
  console.error('QA ERROR ' + (error?.stack || error));
  failures.push(String(error?.message || error));
} finally {
  try { ws?.close(); } catch {}
  if (browser && browser.exitCode === null) {
    try { browser.kill(); } catch {}
  }
  try { await rm(profile, { recursive: true, force: true }); } catch {}
  console.log(JSON.stringify({ url: origin + route, total: checks.length, passed: checks.filter(x => x.pass).length, failed: checks.filter(x => !x.pass).length, checks, failures, browserErrors: exceptions, visualArtifacts }, null, 2));
}
if (failures.length) process.exitCode = 1;
