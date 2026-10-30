#!/usr/bin/env node
/**
 * Bluent v3 #428: published Production InteractiveServer Button toggle/ARIA check.
 * Runs only a temporary local publish and disposable real-browser profiles.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const requested = (process.argv[2] || "both").toLowerCase();
console.log("[probe] requested engine=" + requested);
if (!["chrome", "edge", "both"].includes(requested)) throw Error("Usage: probe_v3_button_toggle_interactive_server.mjs [chrome|edge|both]");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const project = join(root, "src", "Bluent.UI.Demo.SSR", "Bluent.UI.Demo.SSR.csproj");
const output = await mkdtemp(join(tmpdir(), "bluent-v3-toggle-interactive-server-"));
const externalBase = process.env.BLUENT_TEST_BASE_URL?.replace(/\/+$/, "");
console.log("[probe] temp output=" + output);
const publishDir = join(output, "publish");

const executableFor = engine => engine === "chrome"
  ? (process.env.CHROME_PATH || (process.platform === "win32" ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : "/usr/bin/google-chrome"))
  : (process.env.EDGE_PATH || (process.platform === "win32" ? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" : "/usr/bin/microsoft-edge"));

const poll = async (fn, timeoutMs = 45000, description = "condition") => {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try { const value = await fn(); if (value) return value; }
    catch (error) { lastError = error; }
    await sleep(250);
  }
  throw Error("Timed out waiting for " + description + (lastError ? " (last error: " + lastError.message + ")" : ""));
};
const freePort = async () => new Promise((resolvePort, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const port = server.address().port;
    server.close(() => resolvePort(port));
  });
});
const runCommand = async (command, args) => {
  const child = spawn(command, args, { windowsHide: true, stdio: "inherit" });
  const code = await new Promise((resolveCode, reject) => {
    child.once("error", reject);
    child.once("close", resolveCode);
  });
  if (code !== 0) throw Error(command + " failed with exit code " + code);
};
const terminate = async child => {
  if (!child || !child.pid) return;
  if (process.platform === "win32") {
    await Promise.race([
      new Promise(resolveDone => {
        let killer;
        try {
          killer = spawn("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
        } catch { resolveDone(); return; }
        const watchdog = setTimeout(() => { try { killer.kill(); } catch { } resolveDone(); }, 2500);
        killer.once("error", () => { clearTimeout(watchdog); resolveDone(); });
        killer.once("close", () => { clearTimeout(watchdog); resolveDone(); });
      }),
      sleep(3000)
    ]);
    try { child.kill(); } catch { }
    await sleep(150);
  } else {
    child.kill("SIGTERM");
    await Promise.race([new Promise(resolveDone => child.once("close", resolveDone)), sleep(3000)]);
    try { child.kill("SIGKILL"); } catch { }
  }
};
const terminateProcessesUsingPath = async (path, processNames) => {
  if (process.platform !== "win32") return;
  const quote = value => "\u0027" + String(value).replace(/\u0027/g, "\u0027\u0027") + "\u0027";
  const names = processNames.map(quote).join(",");
  const script = `$needle=${quote(path)}; $names=@(${names}); Get-CimInstance Win32_Process | Where-Object { $_.Name -in $names -and $_.CommandLine -and $_.CommandLine.Contains($needle) } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`;
  let cleaner;
  try { cleaner = spawn("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script], { windowsHide: true, stdio: "ignore" }); } catch { return; }
  await Promise.race([new Promise(resolveDone => { cleaner.once("error", resolveDone); cleaner.once("close", resolveDone); }), sleep(5000)]);
  try { cleaner.kill(); } catch { }
};

const stateExpression = String.raw`(() => {
  const button = document.querySelector('[data-testid="toggle-semantics-button"]');
  const status = document.querySelector('[data-testid="toggle-semantics-state"]');
  const toggleChangedCount = Number(document.querySelector('[data-testid="toggle-change-count"]')?.textContent?.trim() ?? NaN);
  const toggleClickCount = Number(document.querySelector('[data-testid="toggle-click-count"]')?.textContent?.trim() ?? NaN);
  return button ? { pressed: button.getAttribute('aria-pressed'), attributeCount: button.getAttributeNames().filter(name => name.toLowerCase() === 'aria-pressed').length, status: status?.textContent?.trim() || '', text: button.textContent?.trim() || '', toggleChangedCount, toggleClickCount, renderer: document.querySelector('[data-testid="observed-renderer"]')?.textContent?.trim() || '' } : null;
})()`;

const secondaryCasesExpression = String.raw`(() => {
  const read = selector => {
    const element = document.querySelector(selector);
    return element ? {
      tagName: element.tagName,
      href: element.getAttribute("href"),
      pressed: element.getAttribute("aria-pressed"),
      attributeCount: element.getAttributeNames().filter(name => name.toLowerCase() === "aria-pressed").length,
      disabled: element.matches(":disabled")
    } : null;
  };
  return {
    ordinary: read('[data-testid="toggle-semantics-ordinary-button"]'),
    link: read('[data-testid="toggle-semantics-link-button"]'),
    disabled: read('[data-testid="toggle-semantics-disabled-button"]')
  };
})()`;

const localizedDirectionExpression = String.raw`(() => {
  const inspect = (direction) => {
    const row = document.querySelector('[data-testid="localized-button-row-' + direction + '"]');
    const button = document.querySelector('[data-testid="localized-button-' + direction + '"]');
    const wrapper = button?.querySelector(".text");
    const label = wrapper?.firstElementChild;
    const icon = button?.querySelector(".icon");
    const ir = icon?.getBoundingClientRect();
    const tr = label?.getBoundingClientRect();
    return {
      direction,
      rowDirection: row?.getAttribute("dir") ?? null,
      buttonFound: !!button,
      buttonDirection: button ? getComputedStyle(button).direction : null,
      textDirectionAttribute: wrapper?.getAttribute("dir") ?? null,
      wrapperDirection: wrapper ? getComputedStyle(wrapper).direction : null,
      labelDirection: label ? getComputedStyle(label).direction : null,
      text: label?.textContent?.trim() ?? "",
      iconFound: !!icon,
      iconBeforeText: !!ir && !!tr && ir.right <= tr.left + 2,
      iconAfterText: !!ir && !!tr && ir.left >= tr.right - 2,
      rowOverflow: !!row && row.scrollWidth > row.clientWidth
    };
  };
  return [inspect("ltr"), inspect("rtl")];
})()`;

const managedDropdownExpression = "(() => { const trigger = document.querySelector('[data-testid=button-managed-dropdown-trigger]'); const triggerRect = trigger?.getBoundingClientRect(); const hitTarget = triggerRect ? document.elementFromPoint(triggerRect.left + triggerRect.width / 2, triggerRect.top + triggerRect.height / 2) : null; const surface = trigger?.id ? document.getElementById(trigger.id + '_surface') : null; const menu = surface?.querySelector('[role=menu]') ?? null; const copy = document.querySelector('[data-testid=button-managed-dropdown-copy]'); const selection = document.querySelector('[data-testid=button-managed-dropdown-selection]'); const submenuTrigger = document.querySelector('[data-testid=button-managed-dropdown-submenu]'); const submenuSurface = submenuTrigger?.id ? document.getElementById(submenuTrigger.id + '_surface') : null; const items = menu ? [...menu.querySelectorAll('[role=menuitem]')].filter(item => item.closest('[role=menu]') === menu).map(item => ({ id: item.getAttribute('data-testid'), text: item.textContent?.trim() ?? '', role: item.getAttribute('role'), tabIndex: item.getAttribute('tabindex'), disabled: item.getAttribute('aria-disabled') })) : []; const active = document.activeElement; return { triggerFound: !!trigger, rect: triggerRect ? {x:triggerRect.x,y:triggerRect.y,width:triggerRect.width,height:triggerRect.height} : null, hitTarget: hitTarget ? {tag:hitTarget.tagName,testId:hitTarget.getAttribute('data-testid'),id:hitTarget.id,className:String(hitTarget.className)} : null, triggerId: trigger?.id || null, triggerTag: trigger?.tagName || null, hasCaret: !!trigger?.querySelector('.dropdown-icon'), popupAttributeCounts: { hasPopup: trigger?.getAttributeNames().filter(name => name.toLowerCase() === 'aria-haspopup').length ?? 0, expanded: trigger?.getAttributeNames().filter(name => name.toLowerCase() === 'aria-expanded').length ?? 0, controls: trigger?.getAttributeNames().filter(name => name.toLowerCase() === 'aria-controls').length ?? 0 }, hasPopup: trigger?.getAttribute('aria-haspopup') ?? null, expanded: trigger?.getAttribute('aria-expanded') ?? null, controls: trigger?.getAttribute('aria-controls') ?? null, controlsTargetExists: !!trigger && trigger.getAttribute('aria-controls') === trigger.id + '_surface' && !!document.getElementById(trigger.getAttribute('aria-controls')), surfaceFound: !!surface, hidden: !surface || surface.classList.contains('hidden'), visible: !!surface && !surface.classList.contains('hidden') && surface.classList.contains('show'), menuFound: !!menu, menuRole: menu?.getAttribute('role') ?? null, menuLabel: menu?.getAttribute('aria-label') ?? null, items, activeTestId: active?.getAttribute?.('data-testid') ?? null, activeText: active?.textContent?.trim() ?? '', focusWithinMenu: !!menu && !!active && menu.contains(active), triggerFocused: !!trigger && active === trigger, copyFound: !!copy, copyTag: copy?.tagName ?? null, copyText: copy?.textContent?.trim() ?? '', selectionText: selection?.textContent?.trim() ?? '', submenuTriggerFound: !!submenuTrigger, submenuHasPopup: submenuTrigger?.getAttribute('aria-haspopup') ?? null, submenuExpanded: submenuTrigger?.getAttribute('aria-expanded') ?? null, submenuControlsTargetExists: !!submenuTrigger && submenuTrigger.getAttribute('aria-controls') === submenuTrigger.id + '_surface' && !!submenuSurface, submenuVisible: !!submenuSurface && !submenuSurface.classList.contains('hidden') && submenuSurface.classList.contains('show'), submenuHidden: !submenuSurface || submenuSurface.classList.contains('hidden'), submenuMenuLabel: submenuSurface?.querySelector('[role=menu]')?.getAttribute('aria-label') ?? null }; })()";

const probeBrowser = async (engine, base, route) => {
  const routePath = route === "server" ? "/compatibility/server" : "/compatibility/webassembly";
  const modeLabel = route === "server" ? "Server" : "WebAssembly";
  const browser = executableFor(engine);
  await access(browser);
  const profile = await mkdtemp(join(tmpdir(), "bluent-v3-toggle-cdp-" + engine + "-"));
  let child, ws, sequence = 0;
  const pending = new Map();
  let websocketHandshakeStatus = null;
  const websocketEvents = [];
  const checks = [];
  const check = (name, pass, observed = undefined) => {
    const item = { name, pass: !!pass, ...(observed === undefined ? {} : { observed }) };
    checks.push(item);
    if (!item.pass)
      console.error("[probe:" + engine + "/" + route + "] ASSERTION FAILED: " + name + (observed === undefined ? "" : " observed=" + JSON.stringify(observed)));
  };
  const send = (method, params = {}) => new Promise((resolveResult, rejectResult) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); rejectResult(Error("CDP timeout: " + method)); }, 15000);
    pending.set(id, {
      resolve: result => { clearTimeout(timer); resolveResult(result); },
      reject: error => { clearTimeout(timer); rejectResult(error); }
    });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression, returnByValue = true) => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue });
    if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || "Runtime.evaluate failed");
    return returnByValue ? result.result?.value : result.result;
  };
  const readAxPressed = async () => {
    const result = await evaluate("document.querySelector('[data-testid=\"toggle-semantics-button\"]')", false);
    const objectId = result?.objectId;
    if (!objectId) throw Error("Could not resolve the rendered toggle button for AX inspection");
    try {
      const tree = await send("Accessibility.getPartialAXTree", { objectId, fetchRelatives: false });
      const node = tree.nodes.find(item => item.role?.value === "button") || tree.nodes[0];
      const pressed = node?.properties?.find(item => item.name === "pressed");
      return { role: node?.role?.value || null, name: node?.name?.value || null, pressedPropertyPresent: !!pressed, pressedValue: pressed?.value?.value ?? null, pressedType: pressed?.value?.type || null };
    } finally { await send("Runtime.releaseObject", { objectId }); }
  };
  const readAxName = async selector => {
    const result = await evaluate(`document.querySelector(${JSON.stringify(selector)})`, false);
    const objectId = result?.objectId;
    if (!objectId) throw Error(`Could not resolve Button for AX name inspection: ${selector}`);
    try {
      const tree = await send("Accessibility.getPartialAXTree", { objectId, fetchRelatives: false });
      const node = tree.nodes.find(item => item.role?.value === "button") || tree.nodes[0];
      return { role: node?.role?.value || null, name: node?.name?.value || null };
    } finally { await send("Runtime.releaseObject", { objectId }); }
  };
  const waitForPressed = expected => poll(async () => {
    const current = await evaluate(stateExpression);
    return current && current.pressed === expected && current.status.includes(expected) ? current : null;
  }, 15000, "InteractiveServer state " + expected);
  const dispatchKey = async (keyName, code, vk, text = undefined, modifiers = 0) => {
    const common = { key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, ...(modifiers ? { modifiers } : {}) };
    await send("Input.dispatchKeyEvent", { type: "keyDown", ...common, ...(text === undefined ? {} : { text }) });
    await send("Input.dispatchKeyEvent", { type: "keyUp", ...common });
    await sleep(350);
  };
  const pointerClick = async () => {
    const point = await evaluate("(() => { const button = document.querySelector('[data-testid=\"toggle-semantics-button\"]'); button.scrollIntoView({block:'center'}); const r = button.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; })()");
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
  };

  const clickSelector = async selector => {
    const point = await evaluate("(() => { const target = document.querySelector(" + JSON.stringify(selector) + "); if (!target) return null; target.scrollIntoView({ block: 'center' }); const r = target.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()");
    if (!point) throw Error("Could not resolve interactive element: " + selector);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
    await sleep(180);
  };
  const waitForManagedDropdown = async (expanded, restoreFocus = false) => {
    let lastState = null;
    try {
      return await poll(async () => {
        lastState = await evaluate(managedDropdownExpression);
        const visible = expanded ? lastState?.visible === true : lastState?.hidden === true;
        return lastState && lastState.expanded === (expanded ? "true" : "false") && visible && (!restoreFocus || lastState.triggerFocused) ? lastState : null;
      }, 15000, "managed Button dropdown " + (expanded ? "open" : "closed") + (restoreFocus ? " with trigger focus" : ""));
    } catch (error) {
      throw Error((error?.message || String(error)) + "; last DOM state=" + JSON.stringify(lastState));
    }
  };

  try {
    child = spawn(browser, ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-extensions", "--no-first-run", "--no-default-browser-check", "--remote-debugging-port=0", "--remote-allow-origins=*", "--user-data-dir=" + profile, "about:blank"], { windowsHide: true, stdio: "ignore" });
    const portText = await poll(async () => (await readFile(join(profile, "DevToolsActivePort"), "utf8")).trim().split(/\r?\n/)[0], 20000, engine + " DevTools startup");
    const debugPort = Number(portText);
console.log("[probe:" + engine + "] DevTools port=" + debugPort);
    const pages = await (await fetch("http://127.0.0.1:" + debugPort + "/json/list")).json();
    const page = pages.find(item => item.type === "page" && item.webSocketDebuggerUrl);
    if (!page) throw Error(engine + ": no DevTools page");
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolveOpen, rejectOpen) => {
      ws.addEventListener("open", resolveOpen, { once: true });
      ws.addEventListener("error", rejectOpen, { once: true });
    });
    ws.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        const callback = pending.get(message.id);
        pending.delete(message.id);
        message.error ? callback.reject(Error(JSON.stringify(message.error))) : callback.resolve(message.result || {});
        return;
      }
      if (message.method === "Network.webSocketCreated") websocketEvents.push({ method: message.method, url: message.params?.url });
      if (message.method === "Network.webSocketHandshakeResponseReceived") { websocketHandshakeStatus = message.params?.response?.status ?? null; websocketEvents.push({ method: message.method, status: websocketHandshakeStatus }); }
    });
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Network.enable");
    await send("Accessibility.enable");
    console.log("[probe:" + engine + "] CDP domains ready; navigating to " + routePath);
    await send("Page.navigate", { url: base + routePath });
console.log("[probe:" + engine + "] waiting for initial rendered toggle state");

    const initial = await poll(async () => {
      const current = await evaluate(stateExpression);
      return current && current.renderer.includes(modeLabel) && current.pressed !== null ? current : null;
    }, 60000, engine + " published " + route + " route");
console.log("[probe:" + engine + "] initial state=" + JSON.stringify(initial));
    if (route === "server") {
    await poll(async () => websocketHandshakeStatus === 101, 25000, engine + " SignalR WebSocket handshake (HTTP 101)");
    console.log("[probe:" + engine + "] SignalR WebSocket HTTP 101 confirmed: " + JSON.stringify(websocketEvents));
    check("InteractiveServer SignalR WebSocket completed HTTP 101 handshake", websocketHandshakeStatus === 101, websocketEvents);
    } else {
      check("InteractiveWebAssembly route uses the client renderer without a SignalR handshake", initial.renderer.includes("WebAssembly") && websocketHandshakeStatus !== 101, { renderer: initial.renderer, websocketEvents });
    }
    check("route uses the expected interactive renderer", initial.renderer.includes(modeLabel) && initial.text === "Toggle semantic state", initial);
    check("Toggled=false overrides caller aria-pressed=mixed and emits one attribute", initial.pressed === "false" && initial.attributeCount === 1, initial);
    check("toggle callbacks start at zero", initial.toggleChangedCount === 0 && initial.toggleClickCount === 0, initial);
    const semanticCases = await evaluate(secondaryCasesExpression);
    check("ordinary Button without Toggled preserves caller aria-pressed=mixed", semanticCases.ordinary?.tagName === "BUTTON" && semanticCases.ordinary.pressed === "mixed" && semanticCases.ordinary.attributeCount === 1, semanticCases.ordinary);
    check("navigation anchor with Toggled=true receives no generated aria-pressed", semanticCases.link?.tagName === "A" && semanticCases.link.href === "/compatibility/static" && semanticCases.link.pressed === null, semanticCases.link);
    check("disabled toggle Button remains disabled with authoritative pressed=false", semanticCases.disabled?.tagName === "BUTTON" && semanticCases.disabled.disabled && semanticCases.disabled.pressed === "false" && semanticCases.disabled.attributeCount === 1, semanticCases.disabled);
    const localizedDirections = await evaluate(localizedDirectionExpression);
    check("localized Persian text stays RTL while the Button icon follows LTR/RTL layout in both interactive renderers", localizedDirections.length === 2 && localizedDirections.every(item => item.buttonFound && item.textDirectionAttribute === "auto" && item.wrapperDirection === "rtl" && item.labelDirection === "rtl" && item.text === "ذخیره تغییرات" && item.iconFound && !item.rowOverflow) && localizedDirections.some(item => item.direction === "ltr" && item.rowDirection === "ltr" && item.buttonDirection === "ltr" && item.iconBeforeText) && localizedDirections.some(item => item.direction === "rtl" && item.rowDirection === "rtl" && item.buttonDirection === "rtl" && item.iconAfterText), localizedDirections);
    const localizedLtrAx = await readAxName('[data-testid="localized-button-ltr"]');
    const localizedRtlAx = await readAxName('[data-testid="localized-button-rtl"]');
    check("InteractiveServer and WebAssembly expose the exact Persian label as the AX name in LTR and RTL", localizedLtrAx.role === "button" && localizedLtrAx.name === "ذخیره تغییرات" && localizedRtlAx.role === "button" && localizedRtlAx.name === "ذخیره تغییرات", { ltr: localizedLtrAx, rtl: localizedRtlAx });
    const initialDropdown = await poll(async () => {
      const state = await evaluate(managedDropdownExpression);
      // The parent menu surface can render one interactive turn before a nested
      // MenuItem registers its KeepSurface popover from OnAfterRender. Wait for
      // both persistent surfaces so the initial ARIA relationship is measured
      // after the submenu's aria-controls target actually exists.
      return state?.surfaceFound &&
        state.menuFound &&
        state.items.length === 5 &&
        state.submenuTriggerFound &&
        state.submenuControlsTargetExists ? state : null;
    }, 15000, "parent and nested submenu surfaces are registered before initial ARIA checks");
    check("managed Button dropdown renders a native button and visible caret", initialDropdown.triggerFound && initialDropdown.triggerTag === "BUTTON" && initialDropdown.hasCaret, initialDropdown);
    check("collapsed Button dropdown exposes menu semantics and a stable controls target", initialDropdown.expanded === "false" && initialDropdown.controls === initialDropdown.triggerId + "_surface" && initialDropdown.controlsTargetExists && initialDropdown.hasPopup === "menu" && initialDropdown.popupAttributeCounts?.hasPopup === 1 && initialDropdown.popupAttributeCounts?.expanded === 1 && initialDropdown.popupAttributeCounts?.controls === 1 && initialDropdown.menuFound && initialDropdown.menuRole === "menu" && initialDropdown.menuLabel === "Managed actions" && initialDropdown.hidden, initialDropdown);
    check("MenuList items expose menuitem role, roving-focus tabindex and disabled state", initialDropdown.items.length === 5 && initialDropdown.items.every(item => item.role === "menuitem" && item.tabIndex === "-1") && initialDropdown.items.find(item => item.id === "button-managed-dropdown-disabled")?.disabled === "true", initialDropdown.items);
    check("submenu trigger exposes menu popup state and a stable surface relationship", initialDropdown.submenuTriggerFound && initialDropdown.submenuHasPopup === "menu" && initialDropdown.submenuExpanded === "false" && initialDropdown.submenuControlsTargetExists, initialDropdown);

    await clickSelector('[data-testid="button-managed-dropdown-trigger"]');
    const openedDropdown = await waitForManagedDropdown(true);
    check("managed Button dropdown opens and synchronizes aria-expanded=true with its persistent surface", openedDropdown.visible && openedDropdown.expanded === "true" && openedDropdown.controlsTargetExists && openedDropdown.copyFound && openedDropdown.copyText.includes("Copy"), openedDropdown);

    const focusedDropdownItem = await evaluate("(() => { const item = document.querySelector('[data-testid=\"button-managed-dropdown-copy\"]'); if (!item) return null; item.setAttribute('tabindex', '-1'); item.focus(); return { found: true, tagName: item.tagName, active: document.activeElement === item, text: item.textContent.trim() }; })()");
    check("dropdown command can receive focus for Escape-dismissal validation", focusedDropdownItem?.found && focusedDropdownItem.active && focusedDropdownItem.text.includes("Copy"), focusedDropdownItem);
    await dispatchKey("Escape", "Escape", 27);
    const escapedDropdown = await waitForManagedDropdown(false, true);
    check("Escape closes the managed Button dropdown and restores trigger focus", escapedDropdown.hidden && escapedDropdown.expanded === "false" && escapedDropdown.triggerFocused && escapedDropdown.controlsTargetExists, escapedDropdown);

    await clickSelector('[data-testid="button-managed-dropdown-trigger"]');
    const reopenedDropdown = await waitForManagedDropdown(true);
    check("managed Button dropdown can be reopened after Escape", reopenedDropdown.visible && reopenedDropdown.expanded === "true", reopenedDropdown);
    await clickSelector('[data-testid="button-managed-dropdown-copy"]');
    const selectedDropdown = await poll(async () => {
      const state = await evaluate(managedDropdownExpression);
      return state && state.selectionText.includes("Dropdown selection: Copy; count: 1") && state.expanded === "false" && state.hidden ? state : null;
    }, 15000, "managed Button dropdown command selection and close");
    check("activating Copy invokes the component callback once and closes the dropdown", selectedDropdown.selectionText.includes("Dropdown selection: Copy; count: 1") && selectedDropdown.expanded === "false" && selectedDropdown.hidden, selectedDropdown);

    await evaluate("document.querySelector('[data-testid=\"button-managed-dropdown-trigger\"]').focus()");
    await dispatchKey("ArrowDown", "ArrowDown", 40);
    const keyboardOpened = await poll(async () => {
      const state = await evaluate(managedDropdownExpression);
      return state?.visible && state.expanded === "true" && state.activeTestId === "button-managed-dropdown-copy" ? state : null;
    }, 15000, "ArrowDown opens menu and focuses first enabled menuitem");
    check("ArrowDown on trigger opens menu and focuses its first enabled item", keyboardOpened.activeTestId === "button-managed-dropdown-copy" && keyboardOpened.focusWithinMenu, keyboardOpened);

    await dispatchKey("ArrowDown", "ArrowDown", 40);
    const downToRename = await evaluate(managedDropdownExpression);
    check("ArrowDown moves focus to the next enabled menuitem", downToRename.activeTestId === "button-managed-dropdown-rename", downToRename);
    await dispatchKey("ArrowDown", "ArrowDown", 40);
    const skipDisabled = await evaluate(managedDropdownExpression);
    check("ArrowDown skips aria-disabled menuitems", skipDisabled.activeTestId === "button-managed-dropdown-delete", skipDisabled);
    await dispatchKey("ArrowDown", "ArrowDown", 40);
    const downToSubmenu = await evaluate(managedDropdownExpression);
    check("ArrowDown includes the enabled submenu trigger in menu order", downToSubmenu.activeTestId === "button-managed-dropdown-submenu", downToSubmenu);
    await dispatchKey("ArrowDown", "ArrowDown", 40);
    const wrapDown = await evaluate(managedDropdownExpression);
    check("ArrowDown wraps from the last to first enabled item", wrapDown.activeTestId === "button-managed-dropdown-copy", wrapDown);
    await dispatchKey("ArrowUp", "ArrowUp", 38);
    const wrapUp = await evaluate(managedDropdownExpression);
    check("ArrowUp wraps from the first to last enabled item", wrapUp.activeTestId === "button-managed-dropdown-submenu", wrapUp);
    await dispatchKey("Home", "Home", 36);
    const home = await evaluate(managedDropdownExpression);
    check("Home focuses the first enabled menuitem", home.activeTestId === "button-managed-dropdown-copy", home);
    await dispatchKey("End", "End", 35);
    const end = await evaluate(managedDropdownExpression);
    check("End focuses the last enabled menuitem", end.activeTestId === "button-managed-dropdown-submenu", end);
    await dispatchKey("r", "KeyR", 82, "r");
    const typeahead = await evaluate(managedDropdownExpression);
    check("type-ahead finds the first item with a matching text prefix", typeahead.activeTestId === "button-managed-dropdown-rename", typeahead);

    await dispatchKey("Enter", "Enter", 13, "\r");
    let lastEnterState = null;
    let enterSelection;
    try {
      enterSelection = await poll(async () => {
        lastEnterState = await evaluate(managedDropdownExpression);
        return lastEnterState?.selectionText.includes("Dropdown selection: Rename; count: 2") && lastEnterState.expanded === "false" && lastEnterState.hidden ? lastEnterState : null;
      }, 15000, "Enter activates Rename once and closes menu");
    } catch (error) {
      throw Error((error?.message || String(error)) + "; last Enter state=" + JSON.stringify(lastEnterState));
    }
    check("Enter activates a focused menuitem exactly once and closes the menu", enterSelection.selectionText.includes("Dropdown selection: Rename; count: 2") && enterSelection.triggerFocused, enterSelection);

    await evaluate("document.querySelector('[data-testid=\"button-managed-dropdown-trigger\"]').focus()");
    await dispatchKey("ArrowDown", "ArrowDown", 40);
    await poll(async () => {
      const state = await evaluate(managedDropdownExpression);
      return state?.visible && state.activeTestId === "button-managed-dropdown-copy" ? state : null;
    }, 15000, "reopen menu for Space activation");
    await dispatchKey(" ", "Space", 32, " ");
    const spaceSelection = await poll(async () => {
      const state = await evaluate(managedDropdownExpression);
      return state?.selectionText.includes("Dropdown selection: Copy; count: 3") && state.expanded === "false" && state.hidden ? state : null;
    }, 15000, "Space activates Copy once and closes menu");
    check("Space activates a focused menuitem exactly once and closes the menu", spaceSelection.selectionText.includes("Dropdown selection: Copy; count: 3") && spaceSelection.triggerFocused, spaceSelection);

    await evaluate("document.querySelector('[data-testid=\"button-managed-dropdown-trigger\"]').focus()");
    await dispatchKey("ArrowDown", "ArrowDown", 40);
    await poll(async () => {
      const state = await evaluate(managedDropdownExpression);
      return state?.visible && state.activeTestId === "button-managed-dropdown-copy" ? state : null;
    }, 15000, "open parent menu before testing submenu");
    await dispatchKey("ArrowDown", "ArrowDown", 40);
    await dispatchKey("ArrowDown", "ArrowDown", 40);
    await dispatchKey("ArrowDown", "ArrowDown", 40);
    const submenuFocus = await evaluate(managedDropdownExpression);
    check("parent navigation reaches submenu trigger after skipping disabled item", submenuFocus.activeTestId === "button-managed-dropdown-submenu", submenuFocus);
    await dispatchKey("ArrowRight", "ArrowRight", 39);
    const openedSubmenu = await poll(async () => {
      const state = await evaluate(managedDropdownExpression);
      return state?.submenuVisible && state.submenuExpanded === "true" && state.activeTestId === "button-managed-dropdown-archive" ? state : null;
    }, 15000, "ArrowRight opens submenu and focuses first nested item");
    check("ArrowRight opens submenu and focuses its first enabled menuitem", openedSubmenu.submenuVisible && openedSubmenu.activeTestId === "button-managed-dropdown-archive", openedSubmenu);
    await dispatchKey("ArrowLeft", "ArrowLeft", 37);
    const submenuClosed = await poll(async () => {
      const state = await evaluate(managedDropdownExpression);
      return state?.submenuHidden && state.submenuExpanded === "false" && state.activeTestId === "button-managed-dropdown-submenu" ? state : null;
    }, 15000, "ArrowLeft closes submenu and restores parent item focus");
    check("ArrowLeft closes submenu and restores focus to its parent item", submenuClosed.submenuHidden && submenuClosed.activeTestId === "button-managed-dropdown-submenu", submenuClosed);

    // Exercise direction-aware submenu keys in a real RTL document. This affects
    // only the disposable browser profile and is restored before the LTR checks resume.
    const rtlDirection = await evaluate("(() => { const root = document.documentElement; const previousDirection = root.getAttribute('dir'); root.setAttribute('dir', 'rtl'); const trigger = document.querySelector('[data-testid=\"button-managed-dropdown-submenu\"]'); return { previousDirection, documentDirection: getComputedStyle(root).direction, submenuTriggerDirection: trigger ? getComputedStyle(trigger).direction : null }; })()");
    check("RTL document direction reaches the nested submenu trigger", rtlDirection.documentDirection === "rtl" && rtlDirection.submenuTriggerDirection === "rtl", rtlDirection);

    await dispatchKey("ArrowRight", "ArrowRight", 39);
    const rtlWrongOpenKey = await evaluate(managedDropdownExpression);
    check("ArrowRight does not open an RTL submenu", rtlWrongOpenKey.submenuHidden && rtlWrongOpenKey.submenuExpanded === "false" && rtlWrongOpenKey.activeTestId === "button-managed-dropdown-submenu", rtlWrongOpenKey);

    await dispatchKey("ArrowLeft", "ArrowLeft", 37);
    const rtlOpenedSubmenu = await poll(async () => {
      const state = await evaluate(managedDropdownExpression);
      return state?.submenuVisible && state.submenuExpanded === "true" && state.activeTestId === "button-managed-dropdown-archive" ? state : null;
    }, 15000, "ArrowLeft opens RTL submenu and focuses first nested item");
    check("ArrowLeft opens RTL submenu and focuses its first enabled menuitem", rtlOpenedSubmenu.submenuVisible && rtlOpenedSubmenu.activeTestId === "button-managed-dropdown-archive", rtlOpenedSubmenu);

    await dispatchKey("ArrowLeft", "ArrowLeft", 37);
    const rtlWrongCloseKey = await evaluate(managedDropdownExpression);
    check("ArrowLeft leaves an open RTL submenu active", rtlWrongCloseKey.submenuVisible && rtlWrongCloseKey.submenuExpanded === "true" && rtlWrongCloseKey.activeTestId === "button-managed-dropdown-archive", rtlWrongCloseKey);

    await dispatchKey("ArrowRight", "ArrowRight", 39);
    const rtlClosedSubmenu = await poll(async () => {
      const state = await evaluate(managedDropdownExpression);
      return state?.submenuHidden && state.submenuExpanded === "false" && state.activeTestId === "button-managed-dropdown-submenu" ? state : null;
    }, 15000, "ArrowRight closes RTL submenu and restores parent item focus");
    check("ArrowRight closes RTL submenu and restores focus to its parent item", rtlClosedSubmenu.submenuHidden && rtlClosedSubmenu.activeTestId === "button-managed-dropdown-submenu", rtlClosedSubmenu);

    const restoreDirection = "(() => { const root = document.documentElement; const previousDirection = " + JSON.stringify(rtlDirection.previousDirection) + "; if (previousDirection === null) root.removeAttribute('dir'); else root.setAttribute('dir', previousDirection); return getComputedStyle(root).direction; })()";
    await evaluate(restoreDirection);

    await dispatchKey("Escape", "Escape", 27);
    const escapedKeyboardMenu = await waitForManagedDropdown(false, true);
    check("Escape closes the keyboard-opened menu and restores trigger focus", escapedKeyboardMenu.hidden && escapedKeyboardMenu.triggerFocused && escapedKeyboardMenu.expanded === "false", escapedKeyboardMenu);

    await evaluate("document.querySelector('[data-testid=\"button-managed-dropdown-trigger\"]').focus()");
    await dispatchKey("ArrowDown", "ArrowDown", 40);
    await poll(async () => {
      const state = await evaluate(managedDropdownExpression);
      return state?.visible && state.activeTestId === "button-managed-dropdown-copy" ? state : null;
    }, 15000, "open menu before Tab dismissal");
    await dispatchKey("Tab", "Tab", 9);
    const tabClosed = await poll(async () => {
      const state = await evaluate(managedDropdownExpression);
      const focus = await evaluate("(() => { const active = document.activeElement; const selector = 'a[href],area[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),iframe,[tabindex]:not([tabindex=\"-1\"]),[contenteditable=\"true\"]'; const owner = active?.closest(selector); return { tagName: active?.tagName ?? null, tabIndex: active?.tabIndex ?? null, focused: !!active && active.matches(':focus'), focusOwnerTag: owner?.tagName ?? null, focusOwnerId: owner?.id ?? null, focusOwnerTestId: owner?.getAttribute('data-testid') ?? null }; })()");
      return state?.hidden && state.expanded === "false" && !state.triggerFocused && !state.focusWithinMenu && focus.focused && !!focus.focusOwnerTag ? { ...state, nextFocus: focus } : null;
    }, 15000, "Tab closes menu and moves focus to a focusable control");
    check("Tab closes menu and moves focus to a real keyboard-focusable element without trapping or restoring trigger focus", tabClosed.hidden && !tabClosed.triggerFocused && !tabClosed.focusWithinMenu && !!tabClosed.nextFocus?.focusOwnerTag, tabClosed);

    await evaluate("document.querySelector('[data-testid=\"button-managed-dropdown-trigger\"]').focus()");
    await dispatchKey("ArrowDown", "ArrowDown", 40);
    await poll(async () => {
      const state = await evaluate(managedDropdownExpression);
      return state?.visible && state.activeTestId === "button-managed-dropdown-copy" ? state : null;
    }, 15000, "open menu before reverse Tab dismissal");
    await dispatchKey("Tab", "Tab", 9, undefined, 8);
    const shiftTabClosed = await poll(async () => {
      const state = await evaluate(managedDropdownExpression);
      const focus = await evaluate("(() => { const active = document.activeElement; const selector = 'a[href],area[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),iframe,[tabindex]:not([tabindex=\"-1\"]),[contenteditable=\"true\"]'; const owner = active?.closest(selector); return { tagName: active?.tagName ?? null, tabIndex: active?.tabIndex ?? null, focused: !!active && active.matches(':focus'), focusOwnerTag: owner?.tagName ?? null, focusOwnerId: owner?.id ?? null, focusOwnerTestId: owner?.getAttribute('data-testid') ?? null }; })()");
      return state?.hidden && state.expanded === "false" && !state.triggerFocused && !state.focusWithinMenu && focus.focused && !!focus.focusOwnerTag ? { ...state, previousFocus: focus } : null;
    }, 15000, "Shift+Tab closes menu and moves focus to the previous focusable control");
    check("Shift+Tab closes menu and moves focus to a real previous keyboard-focusable element without trapping or restoring trigger focus", shiftTabClosed.hidden && !shiftTabClosed.triggerFocused && !shiftTabClosed.focusWithinMenu && !!shiftTabClosed.previousFocus?.focusOwnerTag, shiftTabClosed);

    console.log("[probe:" + engine + "] reading the initial computed accessibility-tree pressed state");
    const initialAx = await readAxPressed();
    console.log("[probe:" + engine + "] initial AX=" + JSON.stringify(initialAx));
    check("initial accessibility tree exposes pressed=false", initialAx.role === "button" && initialAx.pressedPropertyPresent && initialAx.pressedValue === "false" && initialAx.pressedType === "tristate", initialAx);

    console.log("[probe:" + engine + "] dispatching trusted pointer click");
    await pointerClick();
    const afterClick = await waitForPressed("true");
    console.log("[probe:" + engine + "] post-click state=" + JSON.stringify(afterClick));
    check("trusted pointer click toggles to pressed=true through InteractiveServer", afterClick.pressed === "true" && afterClick.attributeCount === 1, afterClick);
    check("pointer click invokes ToggledChanged exactly once", afterClick.toggleChangedCount === 1, afterClick);
    check("pointer click invokes OnClick exactly once", afterClick.toggleClickCount === 1, afterClick);
    const clickAx = await readAxPressed();
    console.log("[probe:" + engine + "] post-click AX=" + JSON.stringify(clickAx));
    check("accessibility tree updates to pressed=true after server click", clickAx.role === "button" && clickAx.pressedPropertyPresent && clickAx.pressedValue === "true", clickAx);

    await evaluate("document.querySelector('[data-testid=\"toggle-semantics-button\"]').focus()");
    await dispatchKey(" ", "Space", 32, " ");
    const afterSpace = await waitForPressed("false");
    console.log("[probe:" + engine + "] post-Space state=" + JSON.stringify(afterSpace));
    check("real Space activation toggles back to pressed=false", afterSpace.pressed === "false" && afterSpace.attributeCount === 1, afterSpace);
    check("Space invokes ToggledChanged exactly once for this activation", afterSpace.toggleChangedCount === 2, afterSpace);
    check("Space invokes OnClick exactly once for this activation", afterSpace.toggleClickCount === 2, afterSpace);
    const spaceAx = await readAxPressed();
    check("accessibility tree updates to pressed=false after Space", spaceAx.role === "button" && spaceAx.pressedPropertyPresent && spaceAx.pressedValue === "false", spaceAx);

    await evaluate("document.querySelector('[data-testid=\"toggle-semantics-button\"]').focus()");
    await dispatchKey("Enter", "Enter", 13, "\r");
    const afterEnter = await waitForPressed("true");
    console.log("[probe:" + engine + "] post-Enter state=" + JSON.stringify(afterEnter));
    check("real Enter activation toggles to pressed=true", afterEnter.pressed === "true" && afterEnter.attributeCount === 1, afterEnter);
    check("Enter invokes ToggledChanged exactly once for this activation", afterEnter.toggleChangedCount === 3, afterEnter);
    check("Enter invokes OnClick exactly once for this activation", afterEnter.toggleClickCount === 3, afterEnter);

    const failed = checks.filter(item => !item.pass).length;
    return { engine, mode: route, host: "published Production ASP.NET Core host; " + (route === "server" ? "InteractiveServer " : "InteractiveWebAssembly ") + routePath, url: base + routePath, assertions: checks.length, passed: checks.length - failed, failed, checks, observations: { initial, initialAx, semanticCases, afterClick, clickAx, afterSpace, spaceAx, afterEnter, websocketEvents } };
  } finally {
    try { ws?.close(); } catch { }
    await terminate(child);
    await terminateProcessesUsingPath(profile, ["chrome.exe", "msedge.exe"]);
    await sleep(200);
    await rm(profile, { recursive: true, force: true, maxRetries: 6, retryDelay: 250 }).catch(() => {});
  }
};

let host;
try {
  let base = externalBase;
  if (base) {
    console.log("[probe] using externally managed Production InteractiveServer host at " + base);
    await poll(async () => (await fetch(base + "/compatibility/server", { redirect: "manual" })).status === 200, 15000, "external Production InteractiveServer host");
  } else {
    console.log("[probe] publishing temporary Production host to " + publishDir);
    await runCommand("dotnet", ["publish", project, "--configuration", "Release", "--no-restore", "--nologo", "--verbosity", "quiet", "--output", publishDir]);
    const assembly = join(publishDir, "Bluent.UI.Demo.SSR.dll");
    console.log("[probe] temporary Production host published");
    const port = await freePort();
    base = "http://127.0.0.1:" + port;
    host = spawn("dotnet", [assembly], { cwd: publishDir, windowsHide: true, stdio: "ignore", env: { ...process.env, ASPNETCORE_ENVIRONMENT: "Production", ASPNETCORE_URLS: base } });
    await poll(async () => (await fetch(base + "/compatibility/server", { redirect: "manual" })).status === 200, 60000, "published Production InteractiveServer host");
    console.log("[probe] host ready at " + base);
  }

  const engines = requested === "both" ? ["chrome", "edge"] : [requested];
  const results = [];
  const requestedRoute = (process.env.BLUENT_TEST_ROUTE || "").toLowerCase();
  const routes = requestedRoute ? [requestedRoute] : ["server", "webassembly"];
  if (routes.some(route => !["server", "webassembly"].includes(route))) throw Error("BLUENT_TEST_ROUTE must be server or webassembly");
  for (const route of routes) {
    for (const engine of engines) {
      try { results.push(await probeBrowser(engine, base, route)); }
      catch (error) {
        console.error("[probe:" + engine + "/" + route + "] FAILED: " + (error?.stack || error));
        results.push({ engine, mode: route, assertions: 0, passed: 0, failed: 1, error: error?.stack || String(error), checks: [] });
      }
    }
  }
  const summary = { classification: "Published Production ASP.NET Core host; InteractiveServer and InteractiveWebAssembly; trusted browser pointer/keyboard events and computed accessibility-tree pressed state", base, results, assertions: results.reduce((sum, item) => sum + item.assertions, 0), passed: results.reduce((sum, item) => sum + item.passed, 0), failed: results.reduce((sum, item) => sum + item.failed, 0) };
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failed) process.exitCode = 1;
} catch (error) {
  console.error("probe_v3_button_toggle_interactive_server: " + (error?.stack || error));
  process.exitCode = 1;
} finally {
  if (host) await terminate(host);
  if (host) await terminateProcessesUsingPath(publishDir, ["dotnet.exe"]);
  await rm(output, { recursive: true, force: true, maxRetries: 6, retryDelay: 300 }).catch(error => console.error("Temporary publish cleanup failed: " + error.message));
}
