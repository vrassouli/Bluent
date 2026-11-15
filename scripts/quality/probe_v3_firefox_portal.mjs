#!/usr/bin/env node
// #418 Firefox regression smoke for the actual Published InteractiveServer D2/D5 portal lab.
// This is opt-in preview verification, not native AT, OS contrast, Safari, or public API certification.
import { spawn } from "node:child_process";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";
import { createRequire } from "node:module";

const execFileAsync = promisify(execFile);
const cwd = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const packagePath = process.env.BLUENT_V3_PLAYWRIGHT_PACKAGE;
if (!packagePath) throw new Error("BLUENT_V3_PLAYWRIGHT_PACKAGE must point to the pinned Playwright package.");
const require = createRequire(import.meta.url);
const { firefox } = require(packagePath);
const artifactDir = process.env.BLUENT_V3_FIREFOX_ARTIFACTS || join(cwd, ".artifacts", "bluent-v3-firefox");
mkdirSync(artifactDir, { recursive: true });

const workDir = mkdtempSync(join(tmpdir(), "bluent-v3-418-firefox-"));
const publishDir = join(workDir, "published-ssr");
const origin = await allocateOrigin();
const route = "/v3/interactive-portal-lab";
const appLogs = [];
let app;
let browser;
let context;
let page;
let traceStarted = false;
const checks = [];
const pageErrors = [];

function record(name, pass, details = "") {
  checks.push({ name, pass: !!pass, details });
  console.log((pass ? "PASS " : "FAIL ") + name + (details ? " — " + details : ""));
  if (!pass) throw new Error(name + ": " + details);
}

async function allocateOrigin() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address()?.port;
      if (!port) return server.close(() => reject(new Error("Could not allocate local test port.")));
      server.close(error => error ? reject(error) : resolve("http://127.0.0.1:" + port));
    });
  });
}

function startServer(command, args, environment) {
  const child = spawn(command, args, {
    cwd: publishDir,
    env: environment,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });
  for (const stream of [child.stdout, child.stderr]) {
    stream.on("data", chunk => appLogs.push(String(chunk)));
  }
  child.on("error", error => appLogs.push("PROCESS ERROR: " + (error.stack || error)));
  child.on("exit", (code, signal) => appLogs.push("PROCESS EXIT: code=" + code + " signal=" + signal));
  return child;
}

async function waitForServer(url, timeoutMs = 90000) {
  const end = Date.now() + timeoutMs;
  let lastError = "";
  while (Date.now() < end) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) return;
      lastError = "HTTP " + response.status;
    } catch (error) {
      lastError = String(error);
    }
    await new Promise(resolve => setTimeout(resolve, 350));
  }
  throw new Error("Published SSR host did not become ready: " + lastError + ". " + appLogs.join("").slice(-5000));
}

async function expectDom(name, predicate, timeout = 15000) {
  await page.waitForFunction(predicate, undefined, { timeout });
  record(name, true);
}

async function clickAndWait(selector, predicate, name, timeout = 15000) {
  await page.locator(selector).click();
  await expectDom(name, predicate, timeout);
}

try {
  console.log("Firefox D2/D5 probe origin: " + origin);
  await execFileAsync("dotnet", [
    "publish", "src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj",
    "--configuration", "Release", "--no-restore", "--nologo", "--verbosity", "quiet",
    "--output", publishDir
  ], { cwd, windowsHide: true, timeout: 300000, maxBuffer: 8 * 1024 * 1024 });

  app = startServer("dotnet", ["Bluent.UI.Demo.SSR.dll"], {
    ...process.env,
    ASPNETCORE_ENVIRONMENT: "Production",
    ASPNETCORE_URLS: origin
  });
  await waitForServer(origin + route);

  browser = await firefox.launch({ headless: true });
  context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  traceStarted = true;
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on("pageerror", error => pageErrors.push(error.stack || String(error)));

  await page.goto(origin + route, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.locator(".v3-lab-surface").waitFor({ state: "visible", timeout: 60000 });
  await expectDom(
    "InteractiveServer page registers Bluent Popover trigger",
    () => {
      const trigger = document.querySelector("#v3-popover-trigger");
      return trigger?.getAttribute("aria-expanded") === "false" &&
        trigger?.getAttribute("aria-controls") === "v3-popover-trigger_surface";
    },
    30000
  );

  await clickAndWait(
    "#v3-lab-switch-theme",
    () => document.querySelector(".v3-lab-surface")?.dataset.buiTheme === "dark",
    "InteractiveServer owner switches to Dark"
  );
  await clickAndWait(
    "#v3-lab-switch-brand",
    () => document.querySelector(".v3-lab-surface")?.dataset.buiBrand === "excel",
    "InteractiveServer owner switches to Excel brand"
  );
  await page.getByRole("button", { name: "Switch to RTL" }).click();
  await expectDom(
    "InteractiveServer owner switches to RTL",
    () => document.querySelector(".v3-lab-surface")?.dir === "rtl"
  );
  await page.locator("#v3-popover-trigger").click();
  await expectDom(
    "Detached Popover opens with its owner snapshot",
    () => {
      const surface = document.querySelector("#v3-popover-trigger_surface");
      return !!surface && !surface.classList.contains("hidden") &&
        surface.dataset.buiTheme === "dark" && surface.dataset.buiBrand === "excel";
    }
  );
  const firstPopover = await page.evaluate(() => {
    const probe = document.querySelector("[data-v3-popover-probe]");
    const surface = probe?.closest(".bui-popover-surface");
    const host = document.querySelector(".v3-lab-surface");
    return {
      detached: !!surface && !surface.closest(".v3-lab-surface"),
      mode: surface?.dataset.buiTheme,
      brand: surface?.dataset.buiBrand,
      direction: surface?.dir,
      optedIn: surface?.hasAttribute("data-bui-v3-tokens"),
      sourceBrand: getComputedStyle(surface).getPropertyValue("--colorBrandBackground").trim(),
      hostMode: host?.dataset.buiTheme
    };
  });
  record(
    "D2 detached Popover inherits Excel Dark owner and opt-in preview scope",
    firstPopover.detached && firstPopover.mode === "dark" && firstPopover.brand === "excel" && firstPopover.direction === "rtl" && firstPopover.optedIn && !!firstPopover.sourceBrand && firstPopover.hostMode === "dark",
    JSON.stringify(firstPopover)
  );

  await clickAndWait(
    "#v3-lab-switch-theme",
    () => document.querySelector("#v3-popover-trigger_surface")?.dataset.buiTheme === "light",
    "Existing Popover follows a live owner Light-mode change"
  );
  await clickAndWait(
    "#v3-lab-switch-brand",
    () => !document.querySelector("#v3-popover-trigger_surface")?.hasAttribute("data-bui-brand"),
    "Existing Popover follows the owner brand reset"
  );
  await clickAndWait(
    "#v3-lab-switch-theme",
    () => document.querySelector("#v3-popover-trigger_surface")?.dataset.buiTheme === "dark",
    "Existing Popover follows a live owner Dark-mode restore"
  );
  await clickAndWait(
    "#v3-lab-switch-brand",
    () => document.querySelector("#v3-popover-trigger_surface")?.dataset.buiBrand === "excel",
    "Existing Popover follows the owner Excel-brand restore"
  );
  await page.locator("#v3-popover-trigger").click();
  await expectDom(
    "Owner Popover closes and reports collapsed state",
    () => document.querySelector("#v3-popover-trigger_surface")?.classList.contains("hidden") &&
      document.querySelector("#v3-popover-trigger")?.getAttribute("aria-expanded") === "false"
  );

  await page.locator("#v3-independent-popover-trigger").click();
  await expectDom(
    "Independent nested Word Popover opens",
    () => {
      const probe = document.querySelector("[data-v3-independent-popover-probe]");
      const surface = probe?.closest(".bui-popover-surface");
      return !!surface && !surface.classList.contains("hidden") &&
        surface.dataset.buiBrand === "word" && surface.dataset.buiTheme === "light";
    }
  );
  const nestedPopover = await page.evaluate(() => {
    const probe = document.querySelector("[data-v3-independent-popover-probe]");
    const surface = probe?.closest(".bui-popover-surface");
    return {
      mode: surface?.dataset.buiTheme,
      brand: surface?.dataset.buiBrand,
      direction: surface?.dir,
      optedIn: surface?.hasAttribute("data-bui-v3-tokens"),
      parentMode: document.querySelector(".v3-lab-surface")?.dataset.buiTheme,
      sourceBrand: getComputedStyle(surface).getPropertyValue("--colorBrandBackground").trim()
    };
  });
  record(
    "D2 nested Word Light portal remains independent from Excel Dark parent",
    nestedPopover.mode === "light" && nestedPopover.brand === "word" &&
      nestedPopover.direction === "ltr" && nestedPopover.optedIn &&
      nestedPopover.parentMode === "dark" && !!nestedPopover.sourceBrand,
    JSON.stringify(nestedPopover)
  );
  await page.locator("#v3-independent-popover-trigger").click();
  await expectDom(
    "Independent nested Popover closes",
    () => document.querySelector("#v3-independent-popover-trigger_surface")?.classList.contains("hidden")
  );

  await page.locator("#v3-show-service-dialog").click();
  await expectDom("Excel Dialog is mounted", () => document.querySelectorAll(".dialog-wrapper").length === 1);
  await page.getByRole("button", { name: "Show alternate host dialog" }).click();
  await expectDom("Independent Word Dialog is mounted", () => document.querySelectorAll(".dialog-wrapper").length === 2);
  const initialDialogs = await page.locator(".dialog-wrapper").evaluateAll(nodes => nodes.map(node => ({
    mode: node.dataset.buiTheme,
    brand: node.dataset.buiBrand,
    direction: node.getAttribute("dir"),
    optedIn: node.hasAttribute("data-bui-v3-tokens"),
    dialogRole: node.querySelector(".bui-dialog")?.getAttribute("role")
  })));
  record(
    "D2 concurrent Dialogs retain separate Excel Dark and Word Light owner snapshots",
    initialDialogs.length === 2 &&
      initialDialogs[0].mode === "dark" && initialDialogs[0].brand === "excel" && initialDialogs[0].direction === "rtl" &&
      initialDialogs[1].mode === "light" && initialDialogs[1].brand === "word" && initialDialogs[1].direction === "ltr" &&
      initialDialogs.every(item => item.optedIn && item.dialogRole === "dialog"),
    JSON.stringify(initialDialogs)
  );

  await page.locator("#v3-lab-switch-theme").click();
  await page.locator("#v3-lab-switch-brand").click();
  await expectDom(
    "Page owner changes while non-modal service Dialogs remain mounted",
    () => document.querySelector(".v3-lab-surface")?.dataset.buiTheme === "light" &&
      !document.querySelector(".v3-lab-surface")?.hasAttribute("data-bui-brand")
  );
  const immutableDialogs = await page.locator(".dialog-wrapper").evaluateAll(nodes => nodes.map(node => ({
    mode: node.dataset.buiTheme,
    brand: node.dataset.buiBrand
  })));
  record(
    "D2 Dialog snapshots do not drift when page owner changes",
    immutableDialogs.length === 2 &&
      immutableDialogs[0].mode === "dark" && immutableDialogs[0].brand === "excel" &&
      immutableDialogs[1].mode === "light" && immutableDialogs[1].brand === "word",
    JSON.stringify(immutableDialogs)
  );

  await page.locator(".dialog-wrapper").nth(1).locator('button[aria-label="بستن پنجره"]').click();
  await page.locator(".dialog-wrapper").nth(0).locator('button[aria-label="Close dialog"]').click();
  await expectDom("Both non-modal service Dialogs close", () => document.querySelectorAll(".dialog-wrapper").length === 0);

  await page.locator("#v3-show-keyboard-modal").click();
  await expectDom(
    "Opt-in keyboard Modal opens with dialog semantics and focus management",
    () => {
      const dialog = document.querySelector(".dialog-wrapper .bui-dialog");
      return document.querySelectorAll(".dialog-wrapper").length === 1 &&
        dialog?.getAttribute("role") === "dialog" &&
        dialog?.getAttribute("aria-modal") === "true" &&
        dialog.hasAttribute("data-bui-v3-keyboard-bound");
    }
  );
  await page.locator("#v3-modal-popover-trigger").click();
  await expectDom(
    "Popover opens from inside the owning Modal",
    () => {
      const surface = document.querySelector("#v3-modal-popover-trigger_surface");
      const trigger = document.querySelector("#v3-modal-popover-trigger");
      return !!surface && !surface.classList.contains("hidden") &&
        trigger?.getAttribute("aria-expanded") === "true";
    }
  );
  const modalPopupOwnership = await page.evaluate(() => {
    const trigger = document.querySelector("#v3-modal-popover-trigger");
    const surface = document.querySelector("#v3-modal-popover-trigger_surface");
    const launcher = document.querySelector("#v3-show-keyboard-modal");
    const dialog = trigger?.closest(".bui-dialog");
    return {
      triggerInsideDialog: !!dialog && dialog.contains(trigger),
      portalTrigger: surface?.dataset.buiV3ModalTrigger,
      surfaceInert: !!surface?.closest("[inert]"),
      pageLauncherInert: !!launcher?.closest("[inert]"),
      pageLauncherHidden: !!launcher?.closest('[aria-hidden="true"]'),
      ariaControls: trigger?.getAttribute("aria-controls"),
      surfaceId: surface?.id
    };
  });
  record(
    "D5 modal-owned portal remains interactive while background is inert",
    modalPopupOwnership.triggerInsideDialog && modalPopupOwnership.portalTrigger === "v3-modal-popover-trigger" &&
      !modalPopupOwnership.surfaceInert && modalPopupOwnership.pageLauncherInert && modalPopupOwnership.pageLauncherHidden &&
      modalPopupOwnership.ariaControls === modalPopupOwnership.surfaceId,
    JSON.stringify(modalPopupOwnership)
  );
  await page.keyboard.press("Escape");
  await expectDom(
    "First Escape closes only the Popover and restores trigger focus",
    () => {
      const surface = document.querySelector("#v3-modal-popover-trigger_surface");
      const trigger = document.querySelector("#v3-modal-popover-trigger");
      return surface?.classList.contains("hidden") &&
        trigger?.getAttribute("aria-expanded") === "false" &&
        document.querySelectorAll(".dialog-wrapper").length === 1 &&
        document.activeElement === trigger;
    }
  );
  await page.keyboard.press("Escape");
  await expectDom(
    "Second Escape closes the Modal and restores its launcher",
    () => document.querySelectorAll(".dialog-wrapper").length === 0 &&
      document.activeElement?.id === "v3-show-keyboard-modal"
  );

  await page.locator("#v3-show-keyboard-modal").click();
  await page.locator("#v3-modal-open-nested").click();
  await expectDom("Nested Dialog is stacked above its owner", () => document.querySelectorAll(".dialog-wrapper").length === 2);
  await page.keyboard.press("Escape");
  await expectDom(
    "Nested Escape closes only the top Dialog and returns focus to its opener",
    () => document.querySelectorAll(".dialog-wrapper").length === 1 &&
      document.activeElement?.id === "v3-modal-open-nested"
  );
  await page.keyboard.press("Escape");
  await expectDom(
    "Parent Modal closes after nested Dialog and restores page focus",
    () => document.querySelectorAll(".dialog-wrapper").length === 0 &&
      document.activeElement?.id === "v3-show-keyboard-modal"
  );

  await page.locator("#v3-show-route-exit-modal").click();
  await expectDom(
    "Route-local Dialog is open before navigation",
    () => !!document.querySelector("#v3-dialog-route-leave") &&
      document.querySelector(".dialog-wrapper .bui-dialog")?.getAttribute("role") === "dialog"
  );
  await page.locator("#v3-dialog-route-leave").click();
  await page.waitForURL(url => new URL(url).pathname === "/v3/route-after-dialog", { timeout: 30000 });
  await expectDom(
    "Route navigation disposes the old Dialog host",
    () => document.querySelector("[data-v3-route-after-dialog]") &&
      document.querySelectorAll(".dialog-wrapper").length === 0 &&
      !document.querySelector("#v3-show-route-exit-modal")
  );
  record("Firefox probe reached the route-after-dialog destination", true, page.url());

  record("No uncaught browser page errors", pageErrors.length === 0, pageErrors.join("\n").slice(0, 3000));
  console.log(JSON.stringify({
    classification: "Firefox / Published InteractiveServer / D2-D5 opt-in preview smoke",
    passed: checks.length,
    total: checks.length,
    errors: [],
    limitations: [
      "not native assistive-technology certification",
      "not Windows Contrast Themes or forced-colors certification",
      "not Safari or WebKit certification",
      "not public v3 API acceptance"
    ]
  }, null, 2));
} catch (error) {
  console.error("Firefox D2/D5 probe failed:", error.stack || error);
  try {
    if (page) await page.screenshot({ path: join(artifactDir, "firefox-portal-failure.png"), fullPage: true });
  } catch (screenshotError) {
    console.error("Failure screenshot could not be saved:", String(screenshotError));
  }
  try { writeFileSync(join(artifactDir, "firefox-portal-server.log"), appLogs.join("")); } catch {}
  console.error("Server log tail:\n" + appLogs.join("").slice(-8000));
  process.exitCode = 1;
} finally {
  if (traceStarted && context) {
    try {
      await context.tracing.stop({ path: join(artifactDir, "firefox-portal-trace.zip") });
    } catch (traceError) {
      console.error("Trace could not be saved:", String(traceError));
    }
  }
  try { await context?.close(); } catch {}
  try { await browser?.close(); } catch {}
  try { app?.kill(); } catch {}
  try { rmSync(workDir, { recursive: true, force: true }); } catch (cleanupError) {
    console.error("Temporary published host cleanup warning:", String(cleanupError));
  }
}
