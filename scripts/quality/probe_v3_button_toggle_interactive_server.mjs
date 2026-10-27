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
  const check = (name, pass, observed = undefined) => checks.push({ name, pass: !!pass, ...(observed === undefined ? {} : { observed }) });
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
  const dispatchKey = async (keyName, code, vk, text = undefined) => {
    const common = { key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
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
  for (const route of ["server", "webassembly"]) {
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
