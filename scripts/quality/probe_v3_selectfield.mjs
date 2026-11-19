import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as wait } from "node:timers/promises";

const base = (process.argv[2] || "http://127.0.0.1:5080").replace(/\/$/, "");
const browserLabel = process.env.BLUENT_BROWSER_LABEL || "Chrome";
const renderMode = process.env.BLUENT_SELECT_RENDER_MODE || "WebAssembly";
const route = renderMode === "InteractiveServer" ? "/compatibility/select-fields-server" : "/components/select-fields";
const executable = process.env.BROWSER_PATH;
const evidencePath = process.env.BLUENT_SELECT_EVIDENCE_PATH;
const profilePrefix = process.env.BLUENT_SELECT_PROFILE_PREFIX || "bluent-v3-437-select-";
const profile = await mkdtemp(join(tmpdir(), profilePrefix));
const checks = [], signals = [], pending = new Map();
let browser, ws, sequence = 0;

const check = (name, condition, detail = null) => {
    console.log("QA CHECK " + (condition ? "PASS " : "FAIL ") + name);
    if (!condition && detail !== null) console.log("  detail:", JSON.stringify(detail));
    checks.push({ name, pass: !!condition, detail });
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error("CDP timeout: " + method)); }, 15000);
    pending.set(id, {
        resolve: value => { clearTimeout(timer); resolve(value); },
        reject: error => { clearTimeout(timer); reject(error); }
    });
    ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error("Browser exception: " + result.exceptionDetails.text);
    return result.result?.value;
};
const poll = async (fn, timeout = 25000) => {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
        try { const value = await fn(); if (value) return value; } catch {}
        await wait(150);
    }
    throw new Error("Timed out waiting for SelectField browser condition");
};
const key = async (keyValue, code, vk, modifiers = 0) => {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: keyValue, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: keyValue, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers });
};
const clickAt = async (x, y, modifiers = 0) => {
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, modifiers });
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1, modifiers });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1, modifiers });
};
const click = async selector => {
    const box = await evaluate("(() => { const e=document.querySelector(" + JSON.stringify(selector) + "); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height}; })()");
    if (!box || box.w <= 0 || box.h <= 0) throw new Error("Missing visible click target: " + selector);
    await clickAt(box.x, box.y);
};
const axFor = async selector => {
    const document = await send("DOM.getDocument", { depth: 0, pierce: true });
    const result = await send("DOM.querySelector", { nodeId: document.root.nodeId, selector });
    if (!result.nodeId) return null;
    const tree = await send("Accessibility.getPartialAXTree", { nodeId: result.nodeId, fetchRelatives: false });
    const node = tree.nodes?.[0];
    const property = name => node?.properties?.find(item => item.name === name)?.value?.value;
    return { role: node?.role?.value, name: node?.name?.value, disabled: property("disabled"), invalid: property("invalid") };
};
const snapshot = async name => {
    if (!evidencePath) return;
    const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    await writeFile(evidencePath.replace(/\.json$/i, "-" + name + ".png"), Buffer.from(result.data, "base64"));
};

try {
    if (!executable) throw new Error("BROWSER_PATH is required");
    browser = spawn(executable, [
        "--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run",
        "--disable-extensions", "--disable-crash-reporter", "--disable-breakpad",
        "--remote-debugging-port=0", "--remote-allow-origins=*",
        "--user-data-dir=" + profile, "about:blank"
    ], { stdio: "ignore", windowsHide: true });

    const port = await poll(async () => {
        const content = await readFile(join(profile, "DevToolsActivePort"), "utf8");
        return content.trim().split(/\r?\n/)[0];
    }, 60000);
    const tabs = await (await fetch("http://127.0.0.1:" + port + "/json/list")).json();
    const tab = tabs.find(item => item.type === "page" && item.webSocketDebuggerUrl);
    if (!tab) throw new Error("No CDP page target");

    ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
        ws.addEventListener("open", resolve, { once: true });
        ws.addEventListener("error", reject, { once: true });
    });
    ws.addEventListener("message", event => {
        const message = JSON.parse(event.data);
        if (message.id && pending.has(message.id)) {
            const waiter = pending.get(message.id); pending.delete(message.id);
            message.error ? waiter.reject(new Error(JSON.stringify(message.error))) : waiter.resolve(message.result || {});
        }
        if (message.method === "Runtime.exceptionThrown")
            signals.push({ type: "exception", text: message.params?.exceptionDetails?.text });
        if (message.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(message.params?.type))
            signals.push({ type: message.params.type, text: message.params?.args?.map(arg => arg.value || arg.description || "").join(" ").slice(0, 300) });
        if (message.method === "Network.responseReceived" && message.params?.response?.status >= 400) {
            const response = message.params.response, path = new URL(response.url).pathname;
            if (!(response.status === 404 && path === "/_framework/dotnet-browser-tools/hot-reload-settings.json"))
                signals.push({ type: "http", status: response.status, url: response.url });
        }
    });

    await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
    await send("DOM.enable"); await send("Accessibility.enable");
    await send("Page.navigate", { url: base + route });
    await poll(() => evaluate("document.readyState !== 'loading' && !!document.querySelector('#select-department')"));
    if (renderMode === "InteractiveServer")
        await poll(() => evaluate("document.querySelector('#selectfield-interactive-ready')?.dataset.ready === 'true'"), 30000);

    check("SelectField showcase loads in " + browserLabel + "/" + renderMode, true, { url: base + route });
    await snapshot("initial");

    const initial = await evaluate("(() => { const get=id=>document.querySelector('#'+id); const selected=id=>[...get(id).selectedOptions].map(o=>o.value); return {single:{tag:get('select-department').tagName,multiple:get('select-department').multiple,value:get('select-department').value,id:get('select-department').id},integer:{value:get('select-priority').value},teams:{multiple:get('select-teams').multiple,selected:selected('select-teams'),options:[...get('select-teams').options].map(o=>{const r=o.getBoundingClientRect();return{value:o.value,x:r.x,y:r.y,w:r.width,h:r.height}}),box:(()=>{const r=get('select-teams').getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})()},codes:{multiple:get('select-codes').multiple,selected:selected('select-codes')},flags:{multiple:get('select-flags').multiple,selected:selected('select-flags')},onchange:{value:get('select-onchange').value,status:get('select-onchange-status').textContent.trim()},oninput:{value:get('select-oninput').value,status:get('select-oninput-status').textContent.trim()},rtl:{direction:getComputedStyle(get('select-rtl')).direction},disabled:get('select-disabled').disabled}; })()");
    check("single selection remains a native, named select", initial.single.tag === "SELECT" && !initial.single.multiple && initial.single.id === "select-department", initial.single);
    check("string array initializes native multiple selected options", initial.teams.multiple && initial.teams.selected.join(",") === "ENG,PRD", initial.teams);
    check("integer array initializes the native multiple selected options", initial.codes.multiple && initial.codes.selected.join(",") === "10,30", initial.codes);    check("boolean array uses lowercase HTML option values and initializes true selection", initial.flags.multiple && initial.flags.selected.join(",") === "true", initial.flags);
    check("typed scalar, disabled and RTL examples initialize", initial.integer.value === "2" && initial.disabled && initial.rtl.direction === "rtl", { integer: initial.integer, disabled: initial.disabled, rtl: initial.rtl });
    const selectAx = await axFor("#select-department");
    check("single select has a named native combobox in the browser accessibility tree", selectAx?.role === "combobox" && selectAx?.name === "Department", selectAx);
    const multipleAx = await axFor("#select-teams");
    check("native multiple select is exposed as a listbox", multipleAx?.role === "listbox", multipleAx);
    const addonStructure = await evaluate("(() => { const select=document.querySelector('#select-addons'),root=select?.parentElement,start=root?.querySelector(':scope > .start-addon'),end=root?.querySelector(':scope > .end-addon'); return {start:!!start,end:!!end,startBefore:start?!!(start.compareDocumentPosition(select)&Node.DOCUMENT_POSITION_FOLLOWING):false,endAfter:end?!!(select.compareDocumentPosition(end)&Node.DOCUMENT_POSITION_FOLLOWING):false}; })()");
    check("start/end addons remain direct siblings outside the native select", addonStructure.start && addonStructure.end && addonStructure.startBefore && addonStructure.endAfter, addonStructure);

    await evaluate("document.querySelector('#select-onchange').focus()");
    await key("ArrowDown", "ArrowDown", 40);
    await poll(() => evaluate("document.querySelector('#select-onchange').value === 'Green' && document.querySelector('#select-onchange-status').textContent.includes('Green')"));
    const changed = await evaluate("({value:document.querySelector('#select-onchange').value,status:document.querySelector('#select-onchange-status').textContent.trim()})");
    check("default onchange updates the typed Blazor value using native keyboard input", changed.value === "Green" && changed.status.includes("Green"), changed);

    await evaluate("document.querySelector('#select-oninput').focus()");
    await key("ArrowDown", "ArrowDown", 40);
    await poll(() => evaluate("document.querySelector('#select-oninput').value === 'Red' && document.querySelector('#select-oninput-status').textContent.includes('Red')"));
    const inputChanged = await evaluate("({value:document.querySelector('#select-oninput').value,status:document.querySelector('#select-oninput-status').textContent.trim()})");
    check("explicit oninput updates the typed Blazor value using native keyboard input", inputChanged.value === "Red" && inputChanged.status.includes("Red"), inputChanged);

    const optionBox = await evaluate("(() => { const select=document.querySelector('#select-teams'); select.scrollIntoView({block:'center'}); const option=[...select.options].find(o=>o.value==='OPS'),r=option.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; })()");
    let multiClickError = null;
    try { await clickAt(optionBox.x + Math.min(30, Math.max(10, optionBox.w / 4)), optionBox.y + optionBox.h / 2, 2); }
    catch (error) { multiClickError = error.message; }
    await poll(() => evaluate("document.querySelector('#select-teams-value').textContent.includes('OPS')"), 5000).catch(() => {});
    const multiAfter = await evaluate("({selected:[...document.querySelector('#select-teams').selectedOptions].map(o=>o.value),status:document.querySelector('#select-teams-value').textContent.trim()})");
    check("native multiple selection toggles an additional string value and updates the bound array", multiAfter.selected.includes("OPS") && multiAfter.selected.includes("ENG") && multiAfter.selected.includes("PRD") && multiAfter.status.includes("OPS"), { optionBox, multiAfter, multiClickError });

    const codeBox = await evaluate("(() => { const s=document.querySelector('#select-codes'); s.scrollIntoView({block:'center'}); const o=[...s.options].find(x=>x.value==='20'),r=o.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; })()");
    let codeClickError = null;
    try { await clickAt(codeBox.x + Math.min(30, Math.max(10, codeBox.w / 4)), codeBox.y + codeBox.h / 2, 2); }
    catch (error) { codeClickError = error.message; }
    await poll(() => evaluate("document.querySelector('#select-codes-value').textContent.includes('20')"), 5000).catch(() => {});
    const codesAfter = await evaluate("({selected:[...document.querySelector('#select-codes').selectedOptions].map(o=>o.value),status:document.querySelector('#select-codes-value').textContent.trim()})");
    check("native multiple selection parses selected values back into int[]", codesAfter.selected.includes("10") && codesAfter.selected.includes("20") && codesAfter.selected.includes("30") && codesAfter.status.includes("20"), { codeBox, codesAfter, codeClickError });    const flagBox = await evaluate("(() => { const s=document.querySelector('#select-flags'); s.scrollIntoView({block:'center'}); const o=[...s.options].find(x=>x.value==='false'),r=o.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; })()");
    let flagClickError = null;
    try { await clickAt(flagBox.x + Math.min(30, Math.max(10, flagBox.w / 4)), flagBox.y + flagBox.h / 2, 2); }
    catch (error) { flagClickError = error.message; }
    await poll(() => evaluate("document.querySelector('#select-flags-value').textContent.includes('false')"), 10000).catch(() => {});
    const flagsAfter = await evaluate("({selected:[...document.querySelector('#select-flags').selectedOptions].map(o=>o.value),status:document.querySelector('#select-flags-value').textContent.trim()})");
    check("native multiple selection parses lowercase boolean options back into bool[]", flagsAfter.selected.includes("true") && flagsAfter.selected.includes("false") && flagsAfter.status.includes("true, false"), { flagBox, flagsAfter, flagClickError });

    await click("#select-form-submit");
    await poll(() => evaluate("document.querySelector('#select-preference-form')?.textContent.includes('Choose a delivery window.')"));
    const invalid = await evaluate("({invalid:document.querySelector('#select-delivery-window')?.getAttribute('aria-invalid'),message:document.querySelector('#select-preference-form')?.textContent.includes('Choose a delivery window.')})");
    check("EditForm validation marks the native select invalid and shows the message", invalid.invalid === "true" && invalid.message, invalid);
    await evaluate("document.querySelector('#select-delivery-window').focus()");
    await key("ArrowDown", "ArrowDown", 40);
    await poll(() => evaluate("document.querySelector('#select-delivery-window').value === 'Morning' && document.querySelector('#select-delivery-window').getAttribute('aria-invalid') !== 'true'"));
    await click("#select-form-submit");
    await poll(() => evaluate("document.querySelector('#select-form-status')?.textContent.includes('Saved: Morning')"));
    const submitted = await evaluate("({status:document.querySelector('#select-form-status').textContent.trim(),value:document.querySelector('#select-delivery-window').value,invalid:document.querySelector('#select-delivery-window').getAttribute('aria-invalid')})");
    check("valid native form selection submits the typed value and clears validation", submitted.status === "Saved: Morning" && submitted.value === "Morning" && submitted.invalid !== "true", submitted);

    await evaluate("document.querySelector('#select-department').focus()");
    const focus = await evaluate("({active:document.activeElement?.id,visible:document.activeElement?.matches(':focus-visible'),disabled:document.querySelector('#select-disabled').disabled})");
    check("select is natively keyboard-focusable and disabled select remains disabled", focus.active === "select-department" && focus.visible && focus.disabled, focus);
    await send("Emulation.setDeviceMetricsOverride", { width: 320, height: 800, deviceScaleFactor: 1, mobile: true });
    await wait(300);
    const narrow = await evaluate("({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth,direction:getComputedStyle(document.querySelector('#select-rtl')).direction})");
    check("320px narrow viewport retains RTL and avoids horizontal document overflow", narrow.document <= narrow.viewport && narrow.body <= narrow.viewport && narrow.direction === "rtl", narrow);
    await snapshot("narrow-320px");
    await send("Emulation.clearDeviceMetricsOverride");
    await snapshot("final");

    check("no unexpected browser console errors, exceptions or HTTP failures", signals.length === 0, signals);
    const report = {
        component: "SelectField",
        issue: 437,
        browser: browserLabel,
        renderMode,
        route,
        base,
        timestamp: new Date().toISOString(),
        checks,
        signals,
        summary: { passed: checks.filter(item => item.pass).length, failed: checks.filter(item => !item.pass).length }
    };
    if (evidencePath) await writeFile(evidencePath, JSON.stringify(report, null, 2));
    console.log("QA RESULT " + report.summary.passed + "/" + checks.length + " passed");
    if (checks.some(item => !item.pass)) process.exitCode = 1;
} finally {
    try { if (ws && ws.readyState === WebSocket.OPEN) ws.close(); } catch {}
    try { if (browser && !browser.killed) browser.kill("SIGTERM"); } catch {}
    await wait(300);
    // PowerShell owns bounded browser-process cleanup and removes this isolated profile afterward.
}
