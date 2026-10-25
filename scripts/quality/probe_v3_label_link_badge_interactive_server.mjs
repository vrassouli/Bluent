#!/usr/bin/env node
// #552: published InteractiveServer evidence for existing Label, Link and Badge gaps.
// This test route is QA-only; product component source, CSS and API are unchanged.
import {spawn} from "node:child_process";
import {mkdtemp, readFile, writeFile, mkdir, rm, access} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";
import {createServer} from "node:net";
import {setTimeout as wait} from "node:timers/promises";

const engine = (process.argv[2] || "chrome").toLowerCase();
if (!["chrome", "edge"].includes(engine)) throw Error("Engine must be chrome or edge");
const browserExe = engine === "chrome"
  ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
  : "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const root = resolve(".");
const evidenceDir = resolve("docs/v3/quality/evidence");
const tempRoot = await mkdtemp(join(tmpdir(), "bluent552-label-link-badge-server-"));
const publishDir = join(tempRoot, "published-server");
const browserProfile = join(tempRoot, "browser-profile");
const pagePath = "/__quality/server-label-link-badge-probe";
const pending = new Map();
const checks = [];
const cases = [];
let sequence = 0;
let browser;
let host;
let hostOutput = "";
let ws;

const freePort = () => new Promise((resolvePort, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const port = server.address().port;
    server.close(() => resolvePort(port));
  });
});

const run = (command, args, options = {}) => new Promise((resolveRun, reject) => {
  const child = spawn(command, args, {cwd: root, windowsHide: true, ...options});
  let stdout = "";
  let stderr = "";
  child.stdout?.on("data", data => { stdout += data; });
  child.stderr?.on("data", data => { stderr += data; });
  child.once("error", reject);
  child.once("close", code => code === 0
    ? resolveRun({stdout, stderr})
    : reject(Error(command + " " + args.join(" ") + " exited " + code + "\n" + stderr.slice(-5000))));
});

const watchHost = child => {
  child.stdout?.on("data", data => { hostOutput = (hostOutput + data.toString()).slice(-12000); });
  child.stderr?.on("data", data => { hostOutput = (hostOutput + data.toString()).slice(-12000); });
  return child;
};

const poll = async (fn, timeoutMs = 60000) => {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    try {
      const value = await fn();
      if (value) return value;
    } catch {}
    await wait(250);
  }
  throw Error("Timed out waiting for renderer/browser state\n" + hostOutput.slice(-3500));
};

const send = (method, params = {}) => new Promise((resolveSend, rejectSend) => {
  const id = ++sequence;
  const timer = setTimeout(() => {
    pending.delete(id);
    rejectSend(Error(method + " timed out"));
  }, 20000);
  pending.set(id, {
    resolve: result => { clearTimeout(timer); resolveSend(result); },
    reject: error => { clearTimeout(timer); rejectSend(error); },
  });
  ws.send(JSON.stringify({id, method, params}));
});

const evaluate = async expression => {
  const result = await send("Runtime.evaluate", {
    expression, awaitPromise: true, returnByValue: true,
  });
  if (result.exceptionDetails)
    throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result?.value;
};

const check = (name, pass, actual) => {
  checks.push({name, pass: !!pass, actual});
  console.log(engine + " " + (pass ? "PASS " : "FAIL ") + name);
};

const axFor = async selector => {
  const result = await send("Runtime.evaluate", {
    expression: "document.querySelector(" + JSON.stringify(selector) + ")",
    returnByValue: false,
  });
  const objectId = result.result?.objectId;
  if (!objectId) return null;
  const tree = await send("Accessibility.getPartialAXTree", {objectId, fetchRelatives: false});
  return (tree.nodes || []).map(node => ({
    role: node.role?.value || null,
    name: node.name?.value ?? "",
    ignored: !!node.ignored,
    properties: Object.fromEntries((node.properties || []).map(p => [
      p.name, p.value?.value ?? p.value?.type ?? null,
    ])),
  }));
};

const eventListenersFor = async selector => {
  const found = await send("Runtime.evaluate", {
    expression:"document.querySelector("+JSON.stringify(selector)+")",
    returnByValue:false,
  });
  const objectId = found.result?.objectId;
  if (!objectId) return {found:false,listeners:[]};
  const result = await send("DOMDebugger.getEventListeners",{objectId});
  return {
    found:true,
    listeners:(result.listeners||[]).map(item=>({
      type:item.type,useCapture:!!item.useCapture,passive:!!item.passive,
      once:!!item.once,scriptId:item.scriptId,lineNumber:item.lineNumber,columnNumber:item.columnNumber,
    })),
  };
};

const describe = async () => evaluate("(() => {" +
  "const infoButton=document.querySelector('#probe-label-section .bui-label button');" +
  "const disabledLink=document.querySelector('#probe-link-section .bui-link');" +
  "const badges=[...document.querySelectorAll('#probe-badge-section .bui-badge')];" +
  "const style=e=>{if(!e)return null;const s=getComputedStyle(e);const r=e.getBoundingClientRect();" +
  "return {tag:e.tagName,text:(e.innerText||e.textContent||'').trim(),id:e.id,className:e.className," +
  "role:e.getAttribute('role'),ariaLabel:e.getAttribute('aria-label'),ariaDisabled:e.getAttribute('aria-disabled')," +
  "disabledAttribute:e.hasAttribute('disabled'),tabIndex:e.tabIndex,hrefAttribute:e.getAttribute('href')," +
  "animationName:s.animationName,animationDuration:s.animationDuration,animationIterationCount:s.animationIterationCount," +
  "backgroundColor:s.backgroundColor,color:s.color,box:{x:r.left+r.width/2,y:r.top+r.height/2,width:r.width,height:r.height}};};" +
  "const sentinel=document.getElementById('server-interaction-count');" +
  "const disabledLinkClickCount=document.getElementById('disabled-link-click-count');" +
  "return {url:location.href,document:{readyState:document.readyState,theme:document.documentElement.getAttribute('data-bui-theme'),dir:document.documentElement.dir}," +
  "infoButton:style(infoButton),labelText:document.querySelector('#probe-label-section .bui-label')?.innerText?.trim()||''," +
  "disabledLink:style(disabledLink),staticBadge:style(badges[0]),animatedBadge:style(badges[1])," +
  "reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,sentinelCount:sentinel?.textContent?.trim()||null," +
  "disabledLinkClickCount:disabledLinkClickCount?.textContent?.trim()||null};})()");

const describePopover = async () => evaluate("(() => {" +
  "const trigger=document.querySelector('#probe-label-section .bui-label button');" +
  "const surface=trigger?.id ? document.getElementById(trigger.id+'_surface') : null;" +
  "const surfaceStyle=surface ? getComputedStyle(surface) : null;" +
  "const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,width:r.width,height:r.height,top:r.top,bottom:r.bottom};};" +
  "return {triggerPresent:!!trigger,triggerId:trigger?.id||null,triggerAriaExpanded:trigger?.getAttribute('aria-expanded')??null," +
  "triggerAriaHaspopup:trigger?.getAttribute('aria-haspopup')??null,triggerBox:rect(trigger)," +
  "surfacePresent:!!surface,surface:surface ? {id:surface.id,className:surface.className,hiddenClass:surface.classList.contains('hidden')," +
  "showClass:surface.classList.contains('show'),display:surfaceStyle.display,opacity:surfaceStyle.opacity," +
  "text:(surface.innerText||surface.textContent||'').trim(),role:surface.getAttribute('role'),ariaLabel:surface.getAttribute('aria-label'),box:rect(surface)} : null};})()");

const screenshot = async name => {
  const png = (await send("Page.captureScreenshot", {
    format: "png", captureBeyondViewport: false, fromSurface: true,
  })).data;
  const file = "BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-" + engine.toUpperCase() + "-" + name + ".png";
  await writeFile(join(evidenceDir, file), Buffer.from(png, "base64"));
  return file;
};

const click = async box => {
  await send("Input.dispatchMouseEvent", {type:"mouseMoved",x:box.x,y:box.y});
  await send("Input.dispatchMouseEvent", {type:"mousePressed",x:box.x,y:box.y,button:"left",clickCount:1});
  await send("Input.dispatchMouseEvent", {type:"mouseReleased",x:box.x,y:box.y,button:"left",clickCount:1});
};

const terminate = async child => {
  if (!child?.pid || child.exitCode !== null) return;
  await new Promise(done => {
    const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      stdio:"ignore", windowsHide:true,
    });
    killer.once("close", done);
    killer.once("error", done);
  });
};

const cleanupOwnedBrowserProcesses = async () => {
  // Only target descendants whose command line includes this exact temporary profile.
  const escapedProfile = browserProfile.replace(/'/g, "''");
  const command = "$profile = '" + escapedProfile + "'; " +
    "$roots = Get-CimInstance Win32_Process | Where-Object { " +
    "$_.Name -in @('chrome.exe','msedge.exe') -and $_.CommandLine -and " +
    "$_.CommandLine.Contains($profile) -and $_.CommandLine -match '--headless=new' -and " +
    "$_.CommandLine -notmatch '--type=' }; " +
    "foreach ($p in $roots) { & taskkill.exe /PID $p.ProcessId /T /F | Out-Null }";
  await run("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", command]);
};

const main = async () => {
  await access(browserExe);
  await mkdir(evidenceDir, {recursive:true});
  await run("dotnet", [
    "publish", join(root,"src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj"),
    "--configuration","Release","--output",publishDir,"--verbosity","quiet","/p:UseAppHost=false",
  ]);
  console.log("Published the SSR host and QA-only probe route.");
  const hostPort = await freePort();
  const origin = "http://127.0.0.1:" + hostPort;
  host = watchHost(spawn("dotnet", [join(publishDir,"Bluent.UI.Demo.SSR.dll")], {
    cwd:publishDir, windowsHide:true, stdio:["ignore","pipe","pipe"],
    env:{...process.env,ASPNETCORE_URLS:origin,ASPNETCORE_CONTENTROOT:publishDir,ASPNETCORE_ENVIRONMENT:"Production"},
  }));
  const probeUrl = origin + pagePath;
  await poll(async () => {
    const response = await fetch(probeUrl, {redirect:"manual"});
    return response.status === 200;
  },120000);

  browser = spawn(browserExe, [
    "--headless=new","--no-sandbox","--disable-gpu","--no-first-run",
    "--disable-extensions","--remote-debugging-port=0","--remote-allow-origins=*",
    "--user-data-dir="+browserProfile,"about:blank",
  ], {windowsHide:true,stdio:"ignore"});
  const cdpPort = await poll(async () => Number(
    (await readFile(join(browserProfile,"DevToolsActivePort"),"utf8")).trim().split(/\r?\n/)[0]
  ),40000);
  const tabs = await (await fetch("http://127.0.0.1:"+cdpPort+"/json/list")).json();
  const tab = tabs.find(item => item.type === "page" && item.webSocketDebuggerUrl);
  if (!tab) throw Error("No temporary browser page");
  ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((ok,no) => {
    ws.addEventListener("open",ok,{once:true});
    ws.addEventListener("error",no,{once:true});
  });
  ws.addEventListener("message",event => {
    const value = JSON.parse(event.data);
    const waiter = pending.get(value.id);
    if (waiter) {
      pending.delete(value.id);
      value.error ? waiter.reject(Error(JSON.stringify(value.error))) : waiter.resolve(value.result||{});
    }
  });
  await send("Page.enable"); await send("Runtime.enable"); await send("DOM.enable"); await send("Accessibility.enable");
  await send("Emulation.setDeviceMetricsOverride",{width:1280,height:960,deviceScaleFactor:1,mobile:false});
  await send("Page.navigate",{url:probeUrl});
  await poll(async () => evaluate("!!document.querySelector('#probe-label-section .bui-label') && " +
    "!!document.querySelector('#probe-link-section .bui-link') && " +
    "document.querySelectorAll('#probe-badge-section .bui-badge').length===2 && " +
    "!!document.getElementById('server-interaction-sentinel')"),60000);
  await poll(async () => {
    const state = await describe();
    return state.document.readyState === "complete" && state.sentinelCount === "0";
  },30000);

  // A real Razor callback/state round-trip proves InteractiveServer, not prerender-only HTML.
  const initialState = await describe();
  const sentinelBox = await evaluate("(() => {const e=document.getElementById('server-interaction-sentinel');e.scrollIntoView({block:'center',inline:'center'});const r=e.getBoundingClientRect();" +
    "return {x:r.left+r.width/2,y:r.top+r.height/2,top:r.top,bottom:r.bottom,viewportHeight:innerHeight};})()");
  await click(sentinelBox);
  await poll(async () => (await describe()).sentinelCount === "1",15000);
  const afterClick = await describe();
  check("Published Production InteractiveServer event round-trip updates Razor state",
    initialState.sentinelCount === "0" && afterClick.sentinelCount === "1",
    {initial:initialState.sentinelCount,after:afterClick.sentinelCount});
  const sentinelEvidence = {before:initialState.sentinelCount,after:afterClick.sentinelCount,endpoint:probeUrl};

  // Probe the unresolved owner question directly: does the disabled anchor still invoke OnClick?
  const disabledLinkStateBefore = await describe();
  await click(disabledLinkStateBefore.disabledLink.box);
  await poll(async () => (await describe()).disabledLinkClickCount === "1",15000);
  const disabledLinkStateAfter = await describe();
  const disabledLinkActivationEvidence = {
    before: disabledLinkStateBefore.disabledLinkClickCount,
    after: disabledLinkStateAfter.disabledLinkClickCount,
    disabledElement: disabledLinkStateAfter.disabledLink,
  };
  check("Disabled Link still invokes its OnClick callback after a real pointer click",
    disabledLinkStateBefore.disabledLinkClickCount === "0" &&
    disabledLinkStateAfter.disabledLinkClickCount === "1",
    disabledLinkActivationEvidence);

  // Test sequential focus from the preceding real focusable control, not only HTMLElement.tabIndex.
  const keyboardProbeEvidence = {
    before: disabledLinkStateAfter.disabledLinkClickCount,
    disabledLinkTabindexProperty: disabledLinkStateAfter.disabledLink.tabIndex,
    disabledLinkTabindexAttribute: await evaluate("document.querySelector('#probe-link-section .bui-link').getAttribute('tabindex')"),
    startFocus: await evaluate("(() => { const e=document.querySelector('#probe-label-section .bui-label button'); e.focus(); return {tag:document.activeElement?.tagName||null,id:document.activeElement?.id||null,isInfoAction:document.activeElement===e}; })()"),
  };
  await send("Input.dispatchKeyEvent", {
    type:"rawKeyDown", key:"Tab", code:"Tab",
    windowsVirtualKeyCode:9, nativeVirtualKeyCode:9,
  });
  await send("Input.dispatchKeyEvent", {
    type:"keyUp", key:"Tab", code:"Tab",
    windowsVirtualKeyCode:9, nativeVirtualKeyCode:9,
  });
  await wait(150);
  keyboardProbeEvidence.firstTabAfterLabel = await evaluate("(() => { const e=document.activeElement; const disabled=document.querySelector('#probe-link-section .bui-link'); return {tag:e?.tagName||null,id:e?.id||null,text:(e?.innerText||e?.textContent||'').trim().slice(0,80),isDisabledLink:e===disabled,className:e?.className||null}; })()");
  keyboardProbeEvidence.focusedViaTab = keyboardProbeEvidence.firstTabAfterLabel.isDisabledLink;
  check("Sequential Tab skips the disabled Link despite tabIndex property 0 and no tabindex attribute",
    keyboardProbeEvidence.startFocus.isInfoAction &&
    !keyboardProbeEvidence.focusedViaTab &&
    keyboardProbeEvidence.firstTabAfterLabel.tag === "BUTTON" &&
    keyboardProbeEvidence.firstTabAfterLabel.id === "server-interaction-sentinel" &&
    keyboardProbeEvidence.disabledLinkTabindexProperty === 0 &&
    keyboardProbeEvidence.disabledLinkTabindexAttribute === null,
    keyboardProbeEvidence);
  if (keyboardProbeEvidence.focusedViaTab) {
    await send("Input.dispatchKeyEvent", {
      type:"rawKeyDown", key:"Enter", code:"Enter",
      windowsVirtualKeyCode:13, nativeVirtualKeyCode:13,
    });
    await send("Input.dispatchKeyEvent", {
      type:"keyUp", key:"Enter", code:"Enter",
      windowsVirtualKeyCode:13, nativeVirtualKeyCode:13,
    });
    await wait(350);
    keyboardProbeEvidence.afterEnter = (await describe()).disabledLinkClickCount;
    await send("Input.dispatchKeyEvent", {
      type:"rawKeyDown", key:" ", code:"Space",
      windowsVirtualKeyCode:32, nativeVirtualKeyCode:32,
    });
    await send("Input.dispatchKeyEvent", {
      type:"keyUp", key:" ", code:"Space",
      windowsVirtualKeyCode:32, nativeVirtualKeyCode:32,
    });
    await wait(350);
    keyboardProbeEvidence.afterSpace = (await describe()).disabledLinkClickCount;
  } else {
    keyboardProbeEvidence.afterEnter = null;
    keyboardProbeEvidence.afterSpace = null;
  }
  console.log(engine + " keyboard trace " + JSON.stringify(keyboardProbeEvidence));

  const modes = [
    {name:"LIGHT-LTR",theme:"light",dir:"ltr",forced:false},
    {name:"DARK-RTL",theme:"dark",dir:"rtl",forced:false},
    {name:"FORCED-COLORS",theme:"light",dir:"ltr",forced:true},
  ];
  for (const mode of modes) {
    await send("Emulation.setEmulatedMedia",{features:mode.forced
      ? [{name:"forced-colors",value:"active"},{name:"prefers-contrast",value:"more"}] : []});
    await evaluate("(() => {document.documentElement.setAttribute('data-bui-theme'," +
      JSON.stringify(mode.theme) + ");document.documentElement.setAttribute('dir'," +
      JSON.stringify(mode.dir) + ");})()");
    await wait(150);
    const state = await describe();
    const infoAx = await axFor("#probe-label-section .bui-label button");
    const linkAx = await axFor("#probe-link-section .bui-link");
    const badgeAx = await axFor("#probe-badge-section .bui-badge");
    const current = {mode,state,infoAx,linkAx,badgeAx};
    check(mode.name+" Label Info action inherits surrounding Label text as accessible name",
      state.infoButton?.tag==="BUTTON" && infoAx?.some(node=>node.role==="button" && node.name===state.labelText),
      {infoButton:state.infoButton,labelText:state.labelText,ax:infoAx});
    check(mode.name+" disabled Link remains an anchor without href and aria-disabled",
      state.disabledLink?.tag==="A" && state.disabledLink.disabledAttribute &&
      state.disabledLink.ariaDisabled===null && state.disabledLink.hrefAttribute===null,
      {link:state.disabledLink,ax:linkAx});
    check(mode.name+" disabled Link is tabbable and exposed as generic unnamed AX node",
      state.disabledLink?.tabIndex===0 && linkAx?.some(node=>node.role==="generic" && node.name===""),
      {link:state.disabledLink,ax:linkAx});
    check(mode.name+" static count Badge is non-focusable and has no component-imposed role",
      state.staticBadge?.tag==="DIV" && !state.staticBadge.role && state.staticBadge.tabIndex<0,
      state.staticBadge);
    check(mode.name+" animated Badge uses infinite 1.5s pulse animation",
      state.animatedBadge?.animationName==="badge-pulse-shadow" &&
      state.animatedBadge.animationDuration==="1.5s" &&
      state.animatedBadge.animationIterationCount==="infinite",state.animatedBadge);
    const screenshotFile = await screenshot(mode.name);
    cases.push({...current,screenshot:screenshotFile});
  }

  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await wait(150);
  const reducedMotion = await describe();
  check("prefers-reduced-motion emulation leaves Badge infinite pulse active",
    reducedMotion.reducedMotion && reducedMotion.animatedBadge?.animationName==="badge-pulse-shadow" &&
    reducedMotion.animatedBadge.animationDuration==="1.5s" &&
    reducedMotion.animatedBadge.animationIterationCount==="infinite",reducedMotion);
  const reducedScreenshot = await screenshot("REDUCED-MOTION");
  cases.push({mode:{name:"REDUCED-MOTION",forced:false},state:reducedMotion,screenshot:reducedScreenshot});

  // Label's Info action is a click-triggered Popover. Exercise the actual surface lifecycle
  // after screenshots so these interactions do not alter the existing visual-mode captures.
  await evaluate("document.querySelector('#probe-label-section .bui-label button').scrollIntoView({block:'center',inline:'center'})");
  const popoverBefore = await describePopover();
  await click(popoverBefore.triggerBox);
  await wait(700);
  const popoverDebug = await evaluate("(() => { const t=document.querySelector('#probe-label-section .bui-label button'); return {triggerId:t?.id||null,triggerHTML:t?.outerHTML||null,surfaces:[...document.querySelectorAll('.bui-popover-surface')].map(e=>({id:e.id,className:e.className,text:(e.innerText||e.textContent||'').trim(),display:getComputedStyle(e).display,opacity:getComputedStyle(e).opacity})),surfaceIds:[...document.querySelectorAll('[id$=\\\"_surface\\\"]')].map(e=>({id:e.id,tag:e.tagName,className:e.className}))}; })()");
  const popoverOpen = await describePopover();
  popoverDebug.triggerListeners = await eventListenersFor("#probe-label-section .bui-label button");
  console.log(engine + " Popover debug " + JSON.stringify({popoverDebug,popoverOpen}));
  const infoContentFound = popoverOpen.surface?.text.includes("This is example information for an InfoLabel.") === true;
  const popoverObservation = {
    before: popoverBefore,
    afterTriggerClick: popoverOpen,
    contentFound: infoContentFound,
    accessibilityTree: null,
    keyboard: null,
    insideClick: null,
    afterOutsideClick: null,
    outsideClickRoundTrip: null,
  };
  check("Label Info trigger click creates a visible Popover surface with the supplied info content",
    popoverOpen.triggerPresent && popoverOpen.surfacePresent &&
    !popoverOpen.surface.hiddenClass && popoverOpen.surface.showClass && infoContentFound,
    popoverObservation);

  if (popoverOpen.surfacePresent && !popoverOpen.surface.hiddenClass && popoverOpen.surface.showClass) {
    const surfaceSelector = "#" + popoverOpen.surface.id;
    const triggerSelector = "#probe-label-section .bui-label button";
    popoverObservation.accessibilityTree = {
      trigger: await axFor(triggerSelector),
      surface: await axFor(surfaceSelector),
      learnMore: await axFor(surfaceSelector + " a"),
    };

    await evaluate("document.querySelector(" + JSON.stringify(triggerSelector) + ").focus()");
    const focusBeforeTab = await evaluate("(() => { const e=document.activeElement; return {tag:e?.tagName||null,id:e?.id||null,text:(e?.innerText||e?.textContent||'').trim().slice(0,80)}; })()");
    await send("Input.dispatchKeyEvent", {type:"rawKeyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
    await send("Input.dispatchKeyEvent", {type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
    await wait(150);
    const focusAfterTab = await evaluate("(() => { const e=document.activeElement; return {tag:e?.tagName||null,id:e?.id||null,text:(e?.innerText||e?.textContent||'').trim().slice(0,80),href:e?.getAttribute('href')||null}; })()");
    const surfaceAfterTab = await describePopover();

    await evaluate("document.querySelector(" + JSON.stringify(triggerSelector) + ").focus()");
    await send("Input.dispatchKeyEvent", {type:"rawKeyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
    await send("Input.dispatchKeyEvent", {type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
    await wait(250);
    const popoverAfterEscape = await describePopover();
    const escapeDismissed = !popoverAfterEscape.surfacePresent ||
      popoverAfterEscape.surface.hiddenClass || popoverAfterEscape.surface.display === "none";
    popoverObservation.keyboard = {
      focusBeforeTab,
      focusAfterTab,
      surfaceAfterTab,
      popoverAfterEscape,
      escapeDismissed,
    };
    check("Tab from Label Info trigger records real focus order while Popover is open",
      focusBeforeTab.id === popoverOpen.triggerId &&
      !!focusAfterTab.tag && surfaceAfterTab.surfacePresent &&
      !surfaceAfterTab.surface.hiddenClass && surfaceAfterTab.surface.showClass,
      popoverObservation.keyboard);
    check("Escape dismissal outcome is captured for the open Label Info Popover",
      typeof escapeDismissed === "boolean" && !!popoverAfterEscape.triggerPresent,
      popoverObservation.keyboard);
  }

  if (popoverOpen.surfacePresent && !popoverOpen.surface.hiddenClass && popoverOpen.surface.showClass) {
    await evaluate("document.getElementById(" + JSON.stringify(popoverOpen.surface.id) + ").scrollIntoView({block:'center',inline:'center'})");
    const surfaceBeforeInsideClick = await describePopover();
    await click(surfaceBeforeInsideClick.surface.box);
    await wait(150);
    const surfaceAfterInsideClick = await describePopover();
    popoverObservation.insideClick = {before:surfaceBeforeInsideClick,after:surfaceAfterInsideClick};
    check("Clicking inside the Label Info Popover keeps the surface visible",
      surfaceAfterInsideClick.surfacePresent && !surfaceAfterInsideClick.surface.hiddenClass &&
      surfaceAfterInsideClick.surface.showClass,
      popoverObservation.insideClick);
  } else {
    popoverObservation.insideClick = {skipped:true,reason:"No visible Popover surface was observed after clicking the Info trigger.",debug:popoverDebug};
    check("Clicking inside the Label Info Popover keeps the surface visible", false, popoverObservation.insideClick);
  }

  await evaluate("document.getElementById('server-interaction-sentinel').scrollIntoView({block:'center',inline:'center'})");
  const beforeOutsideClick = await describe();
  const outsideBox = await evaluate("(() => {const e=document.getElementById('server-interaction-sentinel');const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()");
  await click(outsideBox);
  await poll(async () => {
    const state = await describePopover();
    return !state.surfacePresent || state.surface.hiddenClass || state.surface.display === "none";
  },15000);
  const popoverAfterOutside = await describePopover();
  const afterOutsideClick = await describe();
  popoverObservation.afterOutsideClick = popoverAfterOutside;
  popoverObservation.outsideClickRoundTrip = {
    sentinelBefore:beforeOutsideClick.sentinelCount,
    sentinelAfter:afterOutsideClick.sentinelCount,
  };
  const popoverWasVisible = popoverOpen.surfacePresent && !popoverOpen.surface.hiddenClass && popoverOpen.surface.showClass;
  check("Clicking outside the Label Info Popover closes/removes the surface",
    popoverWasVisible && (!popoverAfterOutside.surfacePresent || popoverAfterOutside.surface.hiddenClass ||
    popoverAfterOutside.surface.display === "none"),
    {popoverWasVisible,after:popoverObservation.afterOutsideClick});
  check("Outside click still reaches the underlying InteractiveServer sentinel",
    beforeOutsideClick.sentinelCount === "1" && afterOutsideClick.sentinelCount === "2",
    popoverObservation.outsideClickRoundTrip);


  // Fluent React InfoLabel is used as the explicit cross-platform fallback: the Fluent
  // Web Components catalogue does not expose a corresponding InfoLabel component.
  // These checks capture observed behavior for comparison; a passing capture is NOT parity acceptance.
  const fluentInfoLabelKeyboardReference = {
    url:"https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-infolabel/library/docs/Spec.md",
    storybook:"https://storybooks.fluentui.dev/react/?path=/docs/components-infolabel--docs",
    comparisonKind:"Fluent React cross-platform fallback; not an assertion of 1:1 Web Components behavior or a pinned-version acceptance",
    referenceRequirements:{
      activation:"Enter or Space opens the Popover",
      focus:"Focus moves to the PopoverSurface; focusable descendants can be reached by Tab",
      escape:"Escape closes the Popover when focus is on the surface or its content",
      focusDeparture:"Moving focus away from the bubble dismisses it"
    },
    observations:{}
  };
  const keyboardTriggerSelector = "#probe-label-section .bui-label button";
  const keyboardSurfaceSelector = async () => {
    const id = await evaluate("document.querySelector(" + JSON.stringify(keyboardTriggerSelector) + ")?.id || null");
    return id ? "#" + id + "_surface" : null;
  };
  const sendKey = async (key, code, virtualKey) => {
    await send("Input.dispatchKeyEvent", {
      type:"keyDown",key,code,windowsVirtualKeyCode:virtualKey,nativeVirtualKeyCode:virtualKey,
      ...(key === "Enter" ? {text:"\r",unmodifiedText:"\r"} : {}),
    });
    await send("Input.dispatchKeyEvent", {
      type:"keyUp",key,code,windowsVirtualKeyCode:virtualKey,nativeVirtualKeyCode:virtualKey,
    });
  };
  const keyboardFocus = async () => evaluate("(() => { const e=document.activeElement; const t=document.querySelector(" +
    JSON.stringify(keyboardTriggerSelector) + "); const s=t?.id?document.getElementById(t.id+'_surface'):null; " +
    "return {tag:e?.tagName||null,id:e?.id||null,text:(e?.innerText||e?.textContent||'').trim().slice(0,80)," +
    "isTrigger:e===t,isInsideSurface:!!s&&s.contains(e),isSurface:e===s}; })()");
  const captureKeyboardActivation = async (name, key, code, virtualKey) => {
    await evaluate("document.querySelector(" + JSON.stringify(keyboardTriggerSelector) + ").focus()");
    const focusBeforeActivation = await keyboardFocus();
    await sendKey(key,code,virtualKey);
    await wait(500);
    const opened = await describePopover();
    const focusAfterOpen = await keyboardFocus();
    let tabFocusAfterOpen = null;
    let remainsOpenAfterFocusMoves = null;
    let escapeFromContent = null;
    if (opened.surfacePresent && !opened.surface.hiddenClass && opened.surface.showClass) {
      await sendKey("Tab","Tab",9);
      await wait(150);
      tabFocusAfterOpen = await keyboardFocus();
      const afterTab = await describePopover();
      remainsOpenAfterFocusMoves = afterTab.surfacePresent && !afterTab.surface.hiddenClass &&
        afterTab.surface.showClass && tabFocusAfterOpen.isInsideSurface === false;
      const linkSelector = (await keyboardSurfaceSelector() || "") + " a";
      await evaluate("document.querySelector(" + JSON.stringify(linkSelector) + ")?.focus()");
      const focusBeforeEscape = await keyboardFocus();
      await sendKey("Escape","Escape",27);
      await wait(250);
      const afterEscape = await describePopover();
      escapeFromContent = {
        focusBeforeEscape,
        surfaceAfterEscape:afterEscape,
        dismissed:!afterEscape.surfacePresent || afterEscape.surface.hiddenClass ||
          afterEscape.surface.display === "none"
      };
    }
    const record = {
      key:name,
      focusBeforeActivation,
      opens:opened.surfacePresent && !opened.surface.hiddenClass && opened.surface.showClass,
      focusAfterOpen,
      focusMovedIntoSurfaceOrContent:focusAfterOpen.isSurface || focusAfterOpen.isInsideSurface,
      tabFocusAfterOpen,
      remainsOpenAfterFocusMoves,
      escapeFromContent
    };
    fluentInfoLabelKeyboardReference.observations[name] = record;
    check(name + " keyboard activation trace is captured for the Fluent InfoLabel comparison",
      focusBeforeActivation.isTrigger && typeof record.opens === "boolean" &&
        typeof record.focusMovedIntoSurfaceOrContent === "boolean",
      record);
    console.log(engine + " Fluent InfoLabel " + name + " comparison " + JSON.stringify(record));
    if (name === "Enter" && escapeFromContent) {
      check("Escape-from-Popover-content outcome is captured against the Fluent InfoLabel reference",
        typeof escapeFromContent.dismissed === "boolean" && !!escapeFromContent.focusBeforeEscape.isInsideSurface,
        escapeFromContent);
      check("Focus-departure dismissal outcome is captured against the Fluent InfoLabel reference",
        typeof remainsOpenAfterFocusMoves === "boolean" && !!tabFocusAfterOpen.tag,
        {tabFocusAfterOpen,remainsOpenAfterFocusMoves});
    }
    const isClosed = async () => {
      const state = await describePopover();
      return !state.surfacePresent || state.surface.hiddenClass || state.surface.display === "none";
    };
    if (!await isClosed()) {
      const outside = await evaluate("(() => {const e=document.getElementById('server-interaction-sentinel');e.scrollIntoView({block:'center',inline:'center'});const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()");
      await click(outside);
      await poll(isClosed,15000);
    }
  };
  await captureKeyboardActivation("Enter","Enter","Enter",13);
  await captureKeyboardActivation("Space"," ","Space",32);
  fluentInfoLabelKeyboardReference.observations.referenceComparison = {
    enterOpens:fluentInfoLabelKeyboardReference.observations.Enter.opens,
    spaceOpens:fluentInfoLabelKeyboardReference.observations.Space.opens,
    enterFocusMovesIntoSurfaceOrContent:fluentInfoLabelKeyboardReference.observations.Enter.focusMovedIntoSurfaceOrContent,
    tabAfterEnterOpensSurface:fluentInfoLabelKeyboardReference.observations.Enter.tabFocusAfterOpen,
    focusDepartureKeepsSurfaceOpen:fluentInfoLabelKeyboardReference.observations.Enter.remainsOpenAfterFocusMoves,
    escapeFromContentDismisses:fluentInfoLabelKeyboardReference.observations.Enter.escapeFromContent?.dismissed ?? null
  };

  const output = {
    issue:552,owningIssues:{Label:430,Link:431,Badge:445},
    engine,renderer:"published Production Blazor InteractiveServer",
    host:"Bluent.UI.Demo.SSR Release publish with a QA-only route; temporary published output",
    route:pagePath,sourceRef:"7165a7671044b9c58b7d0c96cc93bf2b2b97fd52",
    scope:"Real Chromium DOM/AX/computed style and server event round-trip. Forced-colors and reduced-motion are emulated. Not native OS/screen-reader validation or Fluent parity acceptance.",
    createdAt:new Date().toISOString(),sentinelEvidence,disabledLinkActivationEvidence,keyboardProbeEvidence,popoverObservation,fluentInfoLabelKeyboardReference,checks,cases,
    summary:{checks:checks.length,passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length,
      screenshots:cases.map(item=>item.screenshot)},
  };
  const outputFile = "BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-"+engine.toUpperCase()+".json";
  await writeFile(join(evidenceDir,outputFile),JSON.stringify(output,null,2)+"\n","utf8");
  console.log("SUMMARY "+JSON.stringify(output.summary));
  if (checks.some(x=>!x.pass)) process.exitCode=1;
};

try { await main(); }
catch (error) { console.error("ERROR "+(error?.stack||error)); process.exitCode=1; }
finally {
  try { ws?.close(); } catch {}
  await terminate(browser);
  try { await cleanupOwnedBrowserProcesses(); }
  catch(error) { console.error("Owned browser-process cleanup failed: " + error.message); process.exitCode=1; }
  await terminate(host);
  await wait(350);
  try { await rm(tempRoot,{recursive:true,force:true,maxRetries:10,retryDelay:250}); }
  catch(error) { console.error("Temporary test folder cleanup failed: "+error.message); process.exitCode=1; }
}