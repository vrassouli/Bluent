#!/usr/bin/env node
// #552: real browser DOM evidence for Icon AdditionalAttributes collisions.
// This is an intentionally narrow renderer observation, not Fluent parity or native AT sign-off.
import {spawn} from "node:child_process";
import {mkdtemp, readFile, writeFile, mkdir, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";
import {createServer as createNetServer} from "node:net";
import {createServer as createHttpServer, request as httpRequest} from "node:http";
import {setTimeout as wait} from "node:timers/promises";

const engine = (process.argv[2] || "chrome").toLowerCase();
const renderer = (process.argv[3] || "wasm").toLowerCase();
if (!["chrome", "edge"].includes(engine)) throw Error("Engine must be chrome or edge");
if (!["wasm", "interactive-server"].includes(renderer)) throw Error("Renderer must be wasm or interactive-server");

const browserExe = engine === "chrome"
  ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
  : "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const root = resolve(".");
const evidenceDir = resolve("docs/v3/quality/evidence");
const tempRoot = await mkdtemp(join(tmpdir(), "bluent552-icon-attrs-"));
const publishDir = join(tempRoot, "published-server");
const browserProfile = join(tempRoot, "browser-profile");
const pagePath = renderer === "wasm"
  ? "/__quality/icon-attribute-probe"
  : "/__quality/server-icon-attribute-probe";
const pending = new Map();
const checks = [];
const errors = [];
const resourceFailures = [];
const requests = new Map();
let sequence = 0;
let host;
let browser;
let proxy;
let hostOutput = "";
let ws;

const freePort = () => new Promise((resolvePort, reject) => {
  const server = createNetServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const port = server.address().port;
    server.close(() => resolvePort(port));
  });
});

const run = (command, args, options = {}) => new Promise((resolveRun, reject) => {
  const child = spawn(command, args, {
    cwd: root,
    windowsHide: true,
    ...options,
  });
  let stdout = "";
  let stderr = "";
  child.stdout?.on("data", data => { stdout += data; });
  child.stderr?.on("data", data => { stderr += data; });
  child.once("error", reject);
  child.once("close", code => code === 0
    ? resolveRun({stdout, stderr})
    : reject(Error(command + " " + args.join(" ") + " exited " + code + "\n" + stderr.slice(-5000))));
});

const poll = async (fn, timeoutMs = 45000) => {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    try {
      const value = await fn();
      if (value) return value;
    } catch {}
    await wait(250);
  }
  throw Error("Timed out waiting for renderer/browser state");
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
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails)
    throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result?.value;
};

const assert = (name, pass, actual) => {
  checks.push({name, pass: !!pass, actual});
  console.log(engine + " / " + renderer + " " + (pass ? "PASS " : "FAIL ") + name);
  if (!pass) throw Error(name + ": " + JSON.stringify(actual));
};

const capture = () => {
  const cases = [
    {id: "icon-probe-svg", tag: "SPAN", classTokens: ["bui-icon", "parameter-class"]},
    {id: "icon-probe-image", tag: "IMG", classTokens: ["bui-icon", "parameter-class"]},
    {id: "icon-probe-css", tag: "I", classTokens: ["bui-icon", "font-source-class", "parameter-class"]},
  ];
  const icons = cases.map(item => {
    const element = document.getElementById(item.id);
    if (!element) return {id: item.id, missing: true};
    const names = element.getAttributeNames();
    return {
      id: item.id,
      tag: element.tagName,
      attributeNames: names,
      idValue: element.getAttribute("id"),
      classValue: element.getAttribute("class"),
      styleValue: element.getAttribute("style"),
      styleWidth: element.style.width,
      styleColor: element.style.color,
      probeValue: element.getAttribute("data-probe-case"),
      src: element.getAttribute("src"),
      imageComplete: element.tagName === "IMG" ? element.complete : null,
      imageNaturalWidth: element.tagName === "IMG" ? element.naturalWidth : null,
      expectedTag: item.tag,
      expectedClassTokens: item.classTokens,
    };
  });
  return {
    renderer: document.querySelector("#icon-attribute-probe")?.getAttribute("data-renderer") ?? null,
    icons,
    clickCount: Number(document.querySelector("#icon-probe-count")?.textContent ?? "NaN"),
  };
};

const watchHost = child => {
  child.stdout?.on("data", data => { hostOutput += data.toString(); });
  child.stderr?.on("data", data => { hostOutput += data.toString(); });
  return child;
};

const killOwned = async child => {
  if (!child?.pid) return;
  await new Promise(resolveKill => {
    const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      windowsHide: true,
      stdio: "ignore",
    });
    killer.once("close", resolveKill);
    killer.once("error", resolveKill);
  });
};

try {
  await mkdir(evidenceDir, {recursive: true});
  const hostPort = await freePort();
  const hostOrigin = "http://127.0.0.1:" + hostPort;
  let origin = hostOrigin;
  if (renderer === "wasm") {
    const proxyPort = await freePort();
    origin = "http://127.0.0.1:" + proxyPort;
    proxy = createHttpServer((incoming, outgoing) => {
      const requestUrl = new URL(incoming.url || "/", origin);
      const path = requestUrl.pathname.startsWith("/Bluent/")
        ? requestUrl.pathname.slice("/Bluent".length)
        : requestUrl.pathname === "/Bluent" ? "/" : requestUrl.pathname;
      const upstream = httpRequest({
        hostname: "127.0.0.1",
        port: hostPort,
        path: path + requestUrl.search,
        method: incoming.method,
        headers: {...incoming.headers, host: "127.0.0.1:" + hostPort},
      }, response => {
        outgoing.writeHead(response.statusCode || 502, response.headers);
        response.pipe(outgoing);
      });
      upstream.on("error", error => {
        if (!outgoing.headersSent) outgoing.writeHead(502);
        outgoing.end(String(error));
      });
      incoming.pipe(upstream);
    });
    await new Promise((resolveListen, rejectListen) => {
      proxy.once("error", rejectListen);
      proxy.listen(proxyPort, "127.0.0.1", resolveListen);
    });
  }
  const url = origin + (renderer === "wasm" ? "/Bluent" : "") + pagePath;

  if (renderer === "interactive-server") {
    await run("dotnet", [
      "publish",
      join(root, "src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj"),
      "--configuration", "Release",
      "--output", publishDir,
      "--verbosity", "quiet",
      "/p:UseAppHost=false",
    ]);
    host = watchHost(spawn("dotnet", [join(publishDir, "Bluent.UI.Demo.SSR.dll")], {
      cwd: publishDir,
      windowsHide: true,
      env: {
        ...process.env,
        ASPNETCORE_URLS: hostOrigin,
        ASPNETCORE_CONTENTROOT: publishDir,
        ASPNETCORE_ENVIRONMENT: "Production",
      },
      stdio: ["ignore", "pipe", "pipe"],
    }));
  } else {
    host = watchHost(spawn("dotnet", [
      "run",
      "--project", join(root, "src/Bluent.UI.Demo/Bluent.UI.Demo.csproj"),
      "--configuration", "Release",
      "--no-launch-profile",
      "--urls", hostOrigin,
    ], {
      cwd: root,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    }));
  }

  await poll(async () => {
    const response = await fetch(url);
    return response.status === 200;
  }, 90000);

  browser = spawn(browserExe, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--no-first-run",
    "--disable-extensions",
    "--remote-debugging-port=0",
    "--remote-allow-origins=*",
    "--user-data-dir=" + browserProfile,
    "about:blank",
  ], {windowsHide: true, stdio: "ignore"});

  const debugPort = await poll(async () => {
    const data = await readFile(join(browserProfile, "DevToolsActivePort"), "utf8");
    return Number(data.trim().split(/\r?\n/)[0]);
  }, 35000);
  const tabs = await (await fetch("http://127.0.0.1:" + debugPort + "/json/list")).json();
  const page = tabs.find(tab => tab.type === "page" && tab.webSocketDebuggerUrl);
  if (!page) throw Error("No isolated browser tab was created");

  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolveOpen, rejectOpen) => {
    ws.addEventListener("open", resolveOpen, {once: true});
    ws.addEventListener("error", rejectOpen, {once: true});
  });
  ws.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    const request = pending.get(message.id);
    if (request) {
      pending.delete(message.id);
      message.error ? request.reject(Error(JSON.stringify(message.error))) : request.resolve(message.result || {});
    }
  });
  ws.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.exceptionThrown")
      errors.push(message.params.exceptionDetails?.exception?.description || message.params.exceptionDetails?.text || "page exception");
    if (message.method === "Log.entryAdded" && message.params.entry?.level === "error" &&
      !message.params.entry.text.includes("Failed to load resource"))
      errors.push(message.params.entry.text);
    if (message.method === "Network.requestWillBeSent")
      requests.set(message.params.requestId, message.params.request.url);
    if (message.method === "Network.loadingFailed")
      resourceFailures.push("network " + (requests.get(message.params.requestId) || "") + " " + message.params.errorText + " " + (message.params.blockedReason || ""));
    if (message.method === "Network.responseReceived" && message.params.response.status >= 400)
      resourceFailures.push("http " + message.params.response.status + " " + message.params.response.url);
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", {width: 1280, height: 900, deviceScaleFactor: 1, mobile: false});
  const browserInfo = await send("Browser.getVersion");
  await send("Page.navigate", {url});
  try {
    await poll(() => evaluate("(() => { const root=document.querySelector('#icon-attribute-probe'); return root && ['icon-probe-svg','icon-probe-image','icon-probe-css'].every(id => document.getElementById(id)); })()"), 60000);
  } catch (error) {
    const diagnostic = await evaluate("({url:location.href,title:document.title,base:document.querySelector('base')?.href,body:document.body.innerText.slice(0,700),blazorError:document.querySelector('#blazor-error-ui')?.innerText})").catch(value => String(value));
    console.error("BROWSER DIAGNOSTICS " + JSON.stringify({diagnostic, errors, hostOutput}));
    throw error;
  }
  await poll(() => evaluate("(() => { const img=document.getElementById('icon-probe-image'); return img?.complete && img.naturalWidth > 0; })()"), 15000);
  await wait(1500);

  const observed = await evaluate("(" + capture.toString() + ")()");
  assert("expected renderer route is mounted", observed.renderer === renderer, observed.renderer);
  for (const item of observed.icons) {
    const expectedId = item.id;
    assert(item.id + " renders the expected root tag", item.tag === item.expectedTag, item.tag);
    assert(item.id + " has one id, class, and style in the browser DOM",
      ["id", "class", "style"].every(name => item.attributeNames.filter(value => value === name).length === 1),
      item.attributeNames);
    assert(item.id + " keeps the caller id and forwards its data attribute",
      item.idValue === expectedId && item.probeValue === expectedId,
      {id: item.idValue, probe: item.probeValue});
    assert(item.id + " uses the explicit Class parameter",
      item.expectedClassTokens.every(token => item.classValue.split(/\s+/).includes(token)) &&
        !item.classValue.includes("attribute-class"),
      item.classValue);
    assert(item.id + " uses the explicit Style parameter",
      item.styleWidth === "2em" && item.styleColor === "" && !item.styleValue.includes("color"),
      {style: item.styleValue, width: item.styleWidth, color: item.styleColor});
  }
  const image = observed.icons.find(item => item.id === "icon-probe-image");
  const expectedSource = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='lime'/%3E%3C/svg%3E";
  assert("image Value src wins over the unmatched src and loads",
    image.src === expectedSource &&
      image.attributeNames.filter(value => value === "src").length === 1 &&
      image.imageComplete &&
      image.imageNaturalWidth > 0,
    {src: image.src, complete: image.imageComplete, naturalWidth: image.imageNaturalWidth});

  await wait(2500);
  const clickPoint = await evaluate("(() => { const button=document.querySelector('#icon-probe-click');button.scrollIntoView({block:'center'});const r=button.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,rect:{top:r.top,bottom:r.bottom,left:r.left,right:r.right}};})()");
  await send("Input.dispatchMouseEvent", {type: "mousePressed", x: clickPoint.x, y: clickPoint.y, button: "left", clickCount: 1});
  await send("Input.dispatchMouseEvent", {type: "mouseReleased", x: clickPoint.x, y: clickPoint.y, button: "left", clickCount: 1});
  try {
    await poll(() => evaluate("Number(document.querySelector('#icon-probe-count')?.textContent || 0) > 0"), 20000);
  } catch (error) {
    const diagnostic = await evaluate("(async () => { const walker=document.createTreeWalker(document,NodeFilter.SHOW_COMMENT);const comments=[];while(walker.nextNode())if(walker.currentNode.data.includes('Blazor'))comments.push(walker.currentNode.data.slice(0,160));const script=document.querySelector('script[src*=blazor\\\\.web]');const boot=script?await fetch(script.src).then(async r=>({status:r.status,type:r.headers.get('content-type'),length:(await r.arrayBuffer()).byteLength})).catch(e=>String(e)):null;return {url:location.href,button:document.querySelector('#icon-probe-click')?.outerHTML,count:document.querySelector('#icon-probe-count')?.textContent,body:document.body.innerText.slice(0,800),blazor:typeof Blazor,markers:comments,html:document.body.innerHTML.slice(0,2200),resources:performance.getEntriesByType('resource').map(r=>r.name).filter(n=>n.includes('_blazor')),boot};})()").catch(value => String(value));
    console.error("INTERACTION DIAGNOSTICS " + JSON.stringify({diagnostic, clickPoint, errors, requests: [...requests.values()], hostOutput}));
    throw error;
  }
  observed.clickCount = await evaluate("Number(document.querySelector('#icon-probe-count')?.textContent || 0)");
  assert("renderer event handler updates after a real browser click", observed.clickCount > 0, observed.clickCount);
  assert("browser page reported no JavaScript errors", errors.length === 0, errors);
  const unexpectedResourceFailures = resourceFailures.filter(failure =>
    !(renderer === "interactive-server" && failure.includes("/app.css")));
  assert("browser has no unexpected failed resources", unexpectedResourceFailures.length === 0, resourceFailures);

  const git = await run("git", ["rev-parse", "HEAD"]);
  const filename = "BLUENT-ICON-ATTRIBUTE-COLLISIONS-" + renderer.toUpperCase() + "-" + engine.toUpperCase() + ".json";
  const report = {
    auditIssue: 552,
    ownerIssue: 429,
    sourceRevision: git.stdout.trim(),
    engine,
    browserVersion: browserInfo.product,
    renderer,
    route: pagePath,
    urlPath: new URL(url).pathname,
    viewport: {width: 1280, height: 900},
    host: renderer === "wasm" ? "Bluent.UI.Demo real Release WebAssembly host" : "published Bluent.UI.Demo.SSR with InteractiveServer page",
    status: "actual browser DOM and interaction observation; not Fluent parity, native OS contrast, or assistive-technology sign-off",
    checks,
    observed,
    consoleErrors: errors,
    resourceFailures,
  };
  await writeFile(join(evidenceDir, filename), JSON.stringify(report, null, 2) + "\n");
  console.log("SUMMARY " + JSON.stringify({engine, renderer, passed: checks.filter(check => check.pass).length, total: checks.length, evidence: filename}));
} catch (error) {
  console.error("ERROR " + engine + " / " + renderer + " " + (error?.stack || error));
  process.exitCode = 1;
} finally {
  try { ws?.close(); } catch {}
  await killOwned(browser);
  if (proxy) await new Promise(resolveClose => proxy.close(resolveClose));
  await killOwned(host);
  try { await rm(tempRoot, {recursive: true, force: true, maxRetries: 12, retryDelay: 250}); }
  catch (error) { console.error("Owned browser/build temp cleanup failed: " + error.message); process.exitCode = 1; }
}
