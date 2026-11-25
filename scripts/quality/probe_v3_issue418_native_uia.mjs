#!/usr/bin/env node
// Issue #418 native Windows High Contrast + UI Automation evidence.
// Uses an isolated Published InteractiveServer host and Edge profile.
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtempSync, mkdirSync, existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer } from "node:net";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
const execFileAsync = promisify(execFile);
const cwd = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const edgePath = process.env.EDGE_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const evidenceDir = join(cwd, "docs/v3/quality/evidence");
const requestedScheme = process.env.BLUENT_ISSUE418_NATIVE_SCHEME || "High Contrast White";
if (!["High Contrast White", "High Contrast Black"].includes(requestedScheme))
  throw new Error(`Unsupported native High Contrast scheme: ${requestedScheme}`);
const whiteBaseline = requestedScheme === "High Contrast White";
const evidenceSuffix = process.env.BLUENT_ISSUE418_NATIVE_EVIDENCE_SUFFIX || "";
if (evidenceSuffix && !/^[A-Z0-9-]{1,32}$/.test(evidenceSuffix))
  throw new Error("Evidence suffix must contain only uppercase ASCII letters, digits and hyphens (1–32 chars).");
const day = whiteBaseline && !evidenceSuffix ? "2026-11-24" : "2026-11-25";
const schemeSuffix = whiteBaseline ? (evidenceSuffix ? "-HC-WHITE" : "") : "-HC-BLACK";
const base = "BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-UIA-" + day + schemeSuffix + (evidenceSuffix ? "-" + evidenceSuffix : "");
const jsonPath = join(evidenceDir, base + ".json");
const dialogCapturePath = join(evidenceDir, base + "-DIALOG.png");
const popoverCapturePath = join(evidenceDir, base + "-POPOVER.png");
const scopedPopoverCapturePath = join(evidenceDir, base + "-SCOPED-WORD-POPOVER.png");
if ([jsonPath, dialogCapturePath, popoverCapturePath, scopedPopoverCapturePath].some(path => existsSync(path)))
  throw new Error("Refusing to overwrite existing native evidence; supply a new BLUENT_ISSUE418_NATIVE_EVIDENCE_SUFFIX.");
const temp = mkdtempSync(join(tmpdir(), "bluent-v3-418-native-uia-"));
const profile = join(temp, "edge-profile");
const published = join(temp, "published-ssr");
const highContrastScript = join(cwd, "scripts/quality/v3_issue418_native_highcontrast.ps1");
const uiaScript = join(cwd, "scripts/quality/v3_issue418_native_uia.ps1");
mkdirSync(evidenceDir, { recursive: true });
function start(command, args, options = {}) {
  const child = spawn(command, args, { cwd, windowsHide: true, stdio: ["ignore", "pipe", "pipe"], ...options });
  let stdout = "", stderr = "";
  child.stdout.on("data", x => stdout = (stdout + String(x)).slice(-12000));
  child.stderr.on("data", x => stderr = (stderr + String(x)).slice(-12000));
  child.tail = () => ({ stdout, stderr, exitCode: child.exitCode, signalCode: child.signalCode });
  return child;
}
async function ps(script, args, timeout = 45000) {
  const result = await execFileAsync("powershell.exe",
    ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", script, ...args],
    { cwd, windowsHide: true, timeout, maxBuffer: 12 * 1024 * 1024 });
  return result.stdout.trim();
}
async function allocateOrigin() {
  return await new Promise((resolvePromise, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(error => error ? reject(error) : resolvePromise("http://127.0.0.1:" + port));
    });
  });
}
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
async function until(fn, label, timeout = 65000) {
  const end = Date.now() + timeout;
  let last = "";
  while (Date.now() < end) {
    try { const value = await fn(); if (value) return value; } catch (error) { last = String(error); }
    await sleep(300);
  }
  throw new Error("Timeout waiting for " + label + (last ? ": " + last : ""));
}
class CDP {
  constructor(url) { this.url = url; this.id = 1; this.pending = new Map(); this.events = []; }
  async open() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolvePromise, reject) => {
      this.ws.addEventListener("open", resolvePromise, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", event => {
      const message = JSON.parse(String(event.data));
      const pending = this.pending.get(message.id);
      if (!pending) {
        if (message.method && /exceptionThrown|consoleAPICalled|loadingFailed/.test(message.method))
          this.events.push({ method: message.method, params: message.params });
        return;
      }
      this.pending.delete(message.id); clearTimeout(pending.timer);
      message.error ? pending.reject(new Error(JSON.stringify(message.error))) : pending.resolve(message.result || {});
    });
  }
  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error("CDP timeout: " + method)); }, 18000);
      this.pending.set(id, { resolve: resolvePromise, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async js(expression) {
    const result = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result?.value;
  }
  close() { try { this.ws?.close(); } catch {} }
}
async function uia(label) {
  const raw = await ps(uiaScript, ["-Action", "snapshot", "-Profile", profile], 50000);
  return { label, ...JSON.parse(raw) };
}
async function key(keyName) {
  const raw = await ps(uiaScript, ["-Action", "key", "-Profile", profile, "-Key", keyName], 50000);
  return JSON.parse(raw);
}
function screenshot(fileName, base64) {
  const bytes = Buffer.from(base64, "base64");
  writeFileSync(join(evidenceDir, fileName), bytes);
  return { file: fileName, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
}
let app = null, edge = null, cdp = null, original = null;
const report = {
  schemaVersion: 1, issue: 418,
  title: "Native Windows High Contrast and UI Automation evidence for Bluent Dialog/Popover prototype",
  capturedAt: new Date().toISOString(),
  status: "limited-native-windows-ui-automation-prototype-evidence-only",
  environment: { browser: "Microsoft Edge", fixtureRoute: "/v3/interactive-portal-lab", renderMode: "Published InteractiveServer", nativeHighContrastScheme: requestedScheme },
  nativeHighContrast: { api: "SystemParametersInfoW / SPI_GETHIGHCONTRAST / SPI_SETHIGHCONTRAST", targetScheme: requestedScheme },
  interactionMethod: {
    dialogOpen: "CDP click on the Bluent fixture trigger",
    keyboard: "Windows user32 keybd_event targeted to isolated Edge",
    keyboardEventsAreSynthetic: true, physicalKeyboardUsed: false,
    uiAutomation: "Windows AutomationElement ControlView tree from the native Edge window",
    narratorStarted: false, assistiveTechnologySpeechCaptured: false
  },
  dialog: {}, popover: {}, scopedPopover: {}, cleanup: {},
  limitations: [
    `One Windows 11 Pro build, one Edge version, ${requestedScheme} only.`,
    "Tab/Shift+Tab/Escape were synthetic OS keyboard events; no physical keyboard hardware was used.",
    "UI Automation tree data was inspected, but no Narrator/NVDA/VoiceOver speech was recorded or evaluated.",
    "The Dialog keyboard path is limited and is not exhaustive focus-cycle acceptance.",
    "Screenshots are raw evidence and were not independently pixel-reviewed.",
    "This prototype evidence does not approve the public token allow-list, CSS aliases, Focus host contract, Dialog/Popover API, or general product accessibility support."
  ]
};
try {
  if (!existsSync(edgePath)) throw new Error("Microsoft Edge binary is missing: " + edgePath);
  original = JSON.parse(await ps(highContrastScript, ["-Action", "get"]));
  report.nativeHighContrast.originalState = original;
  if (!original.success) throw new Error("Native High Contrast API read failed.");
  if (!original.scheme) throw new Error("Native High Contrast original scheme is missing; refusing a non-restorable change.");
  // Apply only this probe's requested built-in scheme. The exact original flags and scheme are restored in finally.
  const active = JSON.parse(await ps(highContrastScript,
    ["-Action", "set", "-Flags", String(original.flags | 1), "-Scheme", requestedScheme]));
  if (!active.enabled || active.scheme !== requestedScheme)
    throw new Error(`Native High Contrast activation failed for ${requestedScheme}; observed ${active.scheme}.`);
  report.nativeHighContrast.testState = active;

  const testOrigin = await allocateOrigin();
  const route = testOrigin + "/v3/interactive-portal-lab";
  await execFileAsync("dotnet", [
    "publish", "src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj",
    "--configuration", "Release", "--no-restore", "--nologo", "--verbosity", "quiet", "--output", published
  ], { cwd, windowsHide: true, timeout: 300000, maxBuffer: 4 * 1024 * 1024 });
  report.publish = { completed: true, mode: "Release publish to isolated temporary directory" };

  app = start("dotnet", ["Bluent.UI.Demo.SSR.dll"],
    { cwd: published, env: { ...process.env, ASPNETCORE_ENVIRONMENT: "Production", ASPNETCORE_URLS: testOrigin } });
  await until(async () => {
    if (app.exitCode !== null) throw new Error("Published host exited: " + JSON.stringify(app.tail()));
    const response = await fetch(route, { signal: AbortSignal.timeout(1500) });
    return response.ok;
  }, "Published Bluent InteractiveServer fixture", 90000);

  mkdirSync(profile, { recursive: true });
  edge = start(edgePath, [
    "--new-window", "--start-maximized", "--no-first-run", "--disable-extensions",
    "--remote-debugging-port=0", "--remote-allow-origins=*",
    "--user-data-dir=" + profile, route
  ]);
  const debugPort = await until(() => {
    const file = join(profile, "DevToolsActivePort");
    return existsSync(file) ? readFileSync(file, "utf8").split(/\r?\n/)[0] : null;
  }, "isolated Edge DevTools port", 45000);
  const target = await until(async () => {
    const response = await fetch("http://127.0.0.1:" + debugPort + "/json/list");
    return (await response.json()).find(item => item.type === "page" && item.url.includes("/v3/interactive-portal-lab"));
  }, "isolated Edge page target", 35000);
  cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.open();
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable");
  await cdp.send("Accessibility.enable"); await cdp.send("Log.enable");
  await until(() => cdp.js("document.readyState === 'complete' && !!document.querySelector('#v3-show-keyboard-modal') && !!document.querySelector('#v3-popover-trigger')"),
    "Blazor interactive controls", 45000);
  await sleep(2500);

  const osInfo = await execFileAsync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command",
    "Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,BuildNumber,OSArchitecture | ConvertTo-Json -Compress"],
    { cwd, windowsHide: true, timeout: 20000 });
  report.environment.os = JSON.parse(osInfo.stdout.trim());
  report.environment.edgeUserAgent = await cdp.js("navigator.userAgent");
  report.environment.forcedColorsActive = await cdp.js("matchMedia('(forced-colors: active)').matches");
  report.environment.prefersContrastMore = await cdp.js("matchMedia('(prefers-contrast: more)').matches");
  if (!report.environment.forcedColorsActive) throw new Error("Edge does not report forced-colors: active.");

  await cdp.js("document.querySelector('#v3-show-keyboard-modal').click()");
  report.dialog.domOnOpen = await until(() => cdp.js("(() => {const d=document.querySelector('.dialog-wrapper .bui-dialog[role=dialog]');if(!d||!d.getClientRects().length)return null;const s=getComputedStyle(d);return {id:d.id,role:d.getAttribute('role'),ariaModal:d.getAttribute('aria-modal'),ariaLabelledBy:d.getAttribute('aria-labelledby'),ariaDescribedBy:d.getAttribute('aria-describedby'),text:d.innerText?.slice(0,500),activeElementId:document.activeElement?.id,activeElementText:document.activeElement?.textContent?.trim(),background:s.backgroundColor,color:s.color,border:s.borderTopColor,outline:s.outlineColor,boxShadow:s.boxShadow,forcedColorAdjust:s.forcedColorAdjust};})()"),
    "visible Bluent Dialog", 25000);
  report.dialog.uiAutomationOnOpen = await uia("Dialog open");
  const dialogImage = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  report.dialog.screenshot = screenshot(base + "-DIALOG.png", dialogImage.data);

  report.dialog.afterTab = await key("Tab");
  report.dialog.domAfterTab = await cdp.js("({activeElementId:document.activeElement?.id,activeElementText:document.activeElement?.textContent?.trim(),dialogVisible:!!document.querySelector('.dialog-wrapper .bui-dialog[role=dialog]')})");
  report.dialog.afterShiftTab = await key("ShiftTab");
  report.dialog.domAfterShiftTab = await cdp.js("({activeElementId:document.activeElement?.id,activeElementText:document.activeElement?.textContent?.trim(),dialogVisible:!!document.querySelector('.dialog-wrapper .bui-dialog[role=dialog]')})");
  report.dialog.afterEscape = await key("Escape");
  report.dialog.domAfterEscape = await until(() => cdp.js("(() => {const d=document.querySelector('.dialog-wrapper .bui-dialog[role=dialog]');return (!d||!d.getClientRects().length||d.classList.contains('hidden'))?{closed:true,activeElementId:document.activeElement?.id,activeElementText:document.activeElement?.textContent?.trim()}:null;})()"),
    "Dialog Escape close and return", 18000);

  await cdp.js("document.querySelector('#v3-popover-trigger').click()");
  report.popover.dom = await until(() => cdp.js("(() => {const t=document.querySelector('#v3-popover-trigger'),s=document.querySelector('#v3-popover-trigger_surface'),x=document.querySelector('[data-v3-popover-probe]');if(!t||!s||!x||s.classList.contains('hidden'))return null;const cs=getComputedStyle(s);return {triggerId:t.id,triggerExpanded:t.getAttribute('aria-expanded'),triggerControls:t.getAttribute('aria-controls'),triggerHasPopup:t.getAttribute('aria-haspopup'),surfaceId:s.id,surfaceTag:s.tagName,surfaceRole:s.getAttribute('role'),surfaceLabel:x.getAttribute('aria-label'),surfaceTheme:s.getAttribute('data-bui-theme'),surfaceBrand:s.getAttribute('data-bui-brand'),surfaceV3Tokens:s.hasAttribute('data-bui-v3-tokens'),surfaceDensity:s.getAttribute('data-density'),surfaceDirection:s.getAttribute('dir'),surfaceBackground:cs.backgroundColor,surfaceColor:cs.color,surfaceBorder:cs.borderTopColor,surfaceOutline:cs.outlineColor,surfaceBoxShadow:cs.boxShadow,surfaceForcedColorAdjust:cs.forcedColorAdjust,text:x.innerText?.slice(0,400),activeElementId:document.activeElement?.id};})()"),
    "visible service-hosted Popover", 22000);
  report.popover.uiAutomation = await uia("Popover open");
  const popoverImage = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  report.popover.screenshot = screenshot(base + "-POPOVER.png", popoverImage.data);
  try {
    const ax = await cdp.send("Accessibility.getFullAXTree");
    report.popover.browserAccessibilityTree = (ax.nodes || [])
      .filter(node => ["dialog","region","group","button","generic","text"].includes(node.role?.value) &&
        /v3 detached theme ownership probe|global Popover ownership check|Show service-hosted popover/i.test(node.name?.value || ""))
      .map(node => ({ role: node.role?.value, name: node.name?.value, ignored: node.ignored }));
  } catch (error) { report.popover.browserAccessibilityTreeError = String(error); }
  // Keep the CurrentScope surface open while opening the independent
  // AlternateScope surface. PopoverContainer supports multiple live contexts;
  // this gives a same-run comparison without relying on focus-dependent Escape.
  const scopedTrigger = await cdp.js("document.querySelector('#v3-independent-popover-trigger')?.id || null");
  if (!scopedTrigger) throw new Error("The AlternateScope (Word/dark) Popover trigger is missing.");
  await cdp.js("document.querySelector('#v3-independent-popover-trigger').click()");
  report.scopedPopover.dom = await until(() => cdp.js("(() => {const t=document.querySelector('#v3-independent-popover-trigger'),s=document.querySelector('#v3-independent-popover-trigger_surface'),x=document.querySelector('[data-v3-independent-popover-probe]');if(!t||!s||!x||s.classList.contains('hidden'))return null;const cs=getComputedStyle(s);return {triggerId:t.id,triggerExpanded:t.getAttribute('aria-expanded'),triggerControls:t.getAttribute('aria-controls'),triggerHasPopup:t.getAttribute('aria-haspopup'),surfaceId:s.id,surfaceTag:s.tagName,surfaceRole:s.getAttribute('role'),surfaceTheme:s.getAttribute('data-bui-theme'),surfaceBrand:s.getAttribute('data-bui-brand'),surfaceV3Tokens:s.hasAttribute('data-bui-v3-tokens'),surfaceDensity:s.getAttribute('data-density'),surfaceDirection:s.getAttribute('dir'),surfaceBackground:cs.backgroundColor,surfaceColor:cs.color,surfaceBorder:cs.borderTopColor,surfaceOutline:cs.outlineColor,surfaceBoxShadow:cs.boxShadow,surfaceForcedColorAdjust:cs.forcedColorAdjust,text:x.innerText?.slice(0,400),activeElementId:document.activeElement?.id};})()"),
    "visible AlternateScope (Word/dark) service-hosted Popover", 22000);
  report.scopedPopover.uiAutomation = await uia("AlternateScope Word/dark Popover open");
  const scopedPopoverImage = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  report.scopedPopover.screenshot = screenshot(base + "-SCOPED-WORD-POPOVER.png", scopedPopoverImage.data);
  report.browserEvents = cdp.events.slice(-15);
  console.log("Dialog, CurrentScope Popover and AlternateScope Word/dark Popover native UIA observations captured.");
} catch (error) {
  report.error = String(error?.stack || error);
  console.error(report.error);
  if (app) console.error("Published host diagnostics: " + JSON.stringify(app.tail()));
  process.exitCode = 1;
} finally {
  try { cdp?.close(); } catch {}
  if (edge?.pid) {
    try {
      const script = [
        "$profile=$env:BLUENT_NATIVE_PROFILE",
        "if(-not $profile -or $profile.IndexOf('bluent-v3-418-native-uia-') -lt 0){throw 'Refusing unscoped Edge cleanup'}",
        "$owned=@(Get-CimInstance Win32_Process | Where-Object {$_.Name -eq 'msedge.exe' -and $_.CommandLine -and $_.CommandLine.IndexOf($profile,[StringComparison]::OrdinalIgnoreCase) -ge 0})",
        "foreach($p in $owned){Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue}",
        "Start-Sleep -Milliseconds 250",
        "$remaining=@($owned | Where-Object {Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue})",
        "if($remaining.Count -gt 0){throw ('Owned Edge processes remain: '+$remaining.Count)}"
      ].join("\n");
      await execFileAsync("powershell.exe", ["-NoProfile","-NonInteractive","-Command",script],
        { cwd, windowsHide: true, timeout: 30000, maxBuffer: 1024 * 1024,
          env: { ...process.env, BLUENT_NATIVE_PROFILE: profile } });
      report.cleanup.edgeOwnedProcessesRemaining = 0;
    } catch (error) { report.cleanup.edgeCleanupError = String(error); process.exitCode = 1; }
  }
  if (app?.pid && app.exitCode === null) {
    try { await execFileAsync("taskkill.exe", ["/PID", String(app.pid), "/T", "/F"], { cwd, windowsHide: true, timeout: 12000 }); }
    catch { try { app.kill(); } catch {} }
  }
  if (original) {
    try {
      const restored = JSON.parse(await ps(highContrastScript, ["-Action","set","-Flags",String(original.flags),"-Scheme",original.scheme]));
      const verified = JSON.parse(await ps(highContrastScript, ["-Action","get"]));
      report.nativeHighContrast.restoredState = verified;
      report.nativeHighContrast.exactlyMatchesOriginal =
        verified.flags === original.flags && verified.scheme === original.scheme &&
        verified.enabled === original.enabled && restored.success === true;
      if (!report.nativeHighContrast.exactlyMatchesOriginal) {
        report.cleanup.highContrastRestoreError = "Original flags/scheme did not verify.";
        process.exitCode = 1;
      }
    } catch (error) { report.cleanup.highContrastRestoreError = String(error); process.exitCode = 1; }
  }
  try { rmSync(temp, { recursive: true, force: true }); } catch {}
  report.completed = !report.error && report.nativeHighContrast.exactlyMatchesOriginal === true &&
    !!report.dialog?.uiAutomationOnOpen && !!report.popover?.uiAutomation && !!report.scopedPopover?.uiAutomation;
  report.capturedAt = new Date().toISOString();
  writeFileSync(jsonPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({
    completed: report.completed, error: report.error || null, jsonPath,
    nativeHighContrast: report.nativeHighContrast, environment: report.environment,
    dialog: { elements: report.dialog?.uiAutomationOnOpen?.controlViewElementCount,
      relevant: report.dialog?.uiAutomationOnOpen?.relevant, afterTab: report.dialog?.afterTab?.relevant,
      afterShiftTab: report.dialog?.afterShiftTab?.relevant, focusAfterEscape: report.dialog?.domAfterEscape },
    popover: { elements: report.popover?.uiAutomation?.controlViewElementCount,
      relevant: report.popover?.uiAutomation?.relevant, dom: report.popover?.dom },
    scopedPopover: { elements: report.scopedPopover?.uiAutomation?.controlViewElementCount,
      relevant: report.scopedPopover?.uiAutomation?.relevant, dom: report.scopedPopover?.dom },
    cleanup: report.cleanup
  }, null, 2));
}
