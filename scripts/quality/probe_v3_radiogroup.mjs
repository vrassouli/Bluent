import { spawn } from "node:child_process";
import { mkdtemp, readFile, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { setTimeout as wait } from "node:timers/promises";

const base = (process.argv[2] || "http://127.0.0.1:5080").replace(/\/$/, "");
const browserLabel = process.env.BLUENT_BROWSER_LABEL || "Chrome";
const renderMode = process.env.BLUENT_RADIO_RENDER_MODE || "WebAssembly";
const route = renderMode === "InteractiveServer" ? "/compatibility/radios-server" : "/components/radios";
const executable = process.env.BROWSER_PATH || process.env.CHROME_PATH;
const evidencePath = process.env.BLUENT_RADIO_EVIDENCE_PATH;
const profilePrefix = process.env.BLUENT_RADIO_PROFILE_PREFIX || "bluent-v3-436-radiogroup-";
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
    throw new Error("Timed out waiting for RadioGroup browser condition");
};
const key = async (keyValue, code, vk) => {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: keyValue, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: keyValue, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
};
const click = async selector => {
    const expression = "(() => { const e=document.querySelector(" + JSON.stringify(selector) +
        "); if(!e) return null; e.scrollIntoView({block:'center',inline:'center'}); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height}; })()";
    const box = await evaluate(expression);
    if (!box || box.w <= 0 || box.h <= 0) throw new Error("Missing visible click target: " + selector);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y });
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: box.x, y: box.y, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: box.x, y: box.y, button: "left", clickCount: 1 });
};
const axFor = async selector => {
    const document = await send("DOM.getDocument", { depth: 0, pierce: true });
    const result = await send("DOM.querySelector", { nodeId: document.root.nodeId, selector });
    if (!result.nodeId) return null;
    const tree = await send("Accessibility.getPartialAXTree", { nodeId: result.nodeId, fetchRelatives: false });
    const node = tree.nodes?.[0];
    const property = name => node?.properties?.find(item => item.name === name)?.value?.value;
    return { role: node?.role?.value, name: node?.name?.value, checked: property("checked"), disabled: property("disabled") };
};
const snapshot = async name => {
    if (!evidencePath) return;
    const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    await writeFile(evidencePath.replace(/\.json$/i, "-" + name + ".png"), Buffer.from(result.data, "base64"));
};

try {
    if (!executable) throw new Error("BROWSER_PATH or CHROME_PATH is required");
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
        if (message.method === "Runtime.exceptionThrown") signals.push({ type: "exception", text: message.params?.exceptionDetails?.text });
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
    await poll(() => evaluate("document.readyState !== 'loading' && !!document.querySelector('#radio-delivery-window input')"));
    if (renderMode === "InteractiveServer")
        await poll(() => evaluate("document.querySelector('#radio-interactive-ready')?.dataset.ready === 'true'"), 30000);
    else
        await poll(() => evaluate("!!document.querySelector('#radio-delivery-window input') && document.querySelector('#radio-delivery-window input').name !== ''"));
    check("RadioGroup showcase loads in " + browserLabel + "/" + renderMode, true, { url: base + route });
    await snapshot("initial-1280px");

    const initial = await evaluate("(() => {" +
        "const group=id=>document.querySelector('#'+id); const inputs=id=>[...group(id).querySelectorAll('input[type=radio]')];" +
        "const first=inputs('radio-delivery-window'), second=inputs('radio-contact-window'); const unlabelled=group('radio-quiet-hours'), rtl=group('radio-delivery-language');" +
        "const attr=el=>el?{name:el.name,value:el.value,checked:el.checked,disabled:el.disabled,id:el.id,tabIndex:el.tabIndex}:null;" +
        "return {groups:[...document.querySelectorAll('#radio-delivery-window,#radio-contact-window,#radio-priority,#radio-delivery-speed,#radio-alert-frequency,#radio-quiet-hours,#radio-delivery-language,#radio-form-delivery')].map(x=>({id:x.id,tag:x.tagName,legend:x.querySelector('legend')?.textContent.trim()||null,ariaLabel:x.getAttribute('aria-label')}))," +
        "first:first.map(attr),second:second.map(attr),form:inputs('radio-form-delivery').map(attr)," +
        "quiet:{tag:unlabelled.tagName,aria:unlabelled.getAttribute('aria-label'),legend:unlabelled.querySelector('legend')?.textContent.trim()||null}," +
        "rtl:{direction:getComputedStyle(rtl).direction,legend:rtl.querySelector('legend')?.textContent.trim()}," +
        "disabled:[...group('radio-delivery-speed').querySelectorAll('input[type=radio]')].map(attr),submit:!!document.querySelector('#radio-form-submit')}; })()");
    const firstName = initial.first[0]?.name, secondName = initial.second[0]?.name;
    check("each visible group uses native fieldset and programmatically associated legend",
        initial.groups.filter(group => group.tag === "FIELDSET" && group.legend).length >= 6, initial.groups);
    check("radios share a name within each group but have distinct names between groups",
        !!firstName && initial.first.every(input => input.name === firstName) &&
        !!secondName && initial.second.every(input => input.name === secondName) && firstName !== secondName,
        { firstName, secondName, first: initial.first, second: initial.second });
    check("native radio values and initial checked states reflect Blazor model",
        initial.first.map(input => input.value).join(",") === "Morning,Afternoon,Evening" &&
        initial.first.filter(input => input.checked).map(input => input.value).join(",") === "Morning" &&
        initial.second.filter(input => input.checked).map(input => input.value).join(",") === "Evening",
        { first: initial.first, second: initial.second });
    check("unlabelled visual variant has an explicit accessible group name",
        initial.quiet.tag === "FIELDSET" && initial.quiet.aria === "Quiet hours preference" && initial.quiet.legend === null,
        initial.quiet);
    check("RTL group inherits right-to-left direction", initial.rtl.direction === "rtl" && initial.rtl.legend === "زبان اعلان", initial.rtl);
    check("disabled option is a native disabled radio between enabled options",
        initial.disabled.length === 3 && initial.disabled[0].disabled === false &&
        initial.disabled[1].disabled === true && initial.disabled[2].disabled === false,
        initial.disabled);

    const groupAx = await axFor("#radio-delivery-window");
    const radioAx = await axFor("#radio-delivery-window input");
    check("browser accessibility tree exposes a named native group and named radio option",
        !!groupAx?.name?.includes("Delivery window") &&
        (groupAx.role === "group" || groupAx.role === "radiogroup") &&
        radioAx?.role === "radio" && radioAx?.name === "Morning",
        { groupAx, radioAx });

    await evaluate("(() => { const marker=document.createElement('button'); marker.id='radio-qa-tab-anchor'; marker.type='button'; " +
        "marker.textContent='QA focus anchor'; marker.style.cssText='position:fixed;left:-10000px;top:0'; " +
        "const field=document.querySelector('#radio-delivery-window'); field.parentElement.insertBefore(marker,field); marker.focus(); return true; })()");
    await key("Tab", "Tab", 9);
    const focusFirst = await evaluate("(() => { const active=document.activeElement; return {value:active?.value,group:active?.closest('fieldset')?.id,checked:active?.checked,focusVisible:active?.matches(':focus-visible')}; })()");
    check("Tab enters the first radio group at its selected option",
        focusFirst.group === "radio-delivery-window" && focusFirst.value === "Morning" && focusFirst.checked, focusFirst);
    const focusRing = await evaluate("(() => { const input=document.activeElement, indicator=input?.nextElementSibling, style=indicator?getComputedStyle(indicator):null; " +
        "return {width:input?.getBoundingClientRect().width,height:input?.getBoundingClientRect().height,outlineStyle:style?.outlineStyle,outlineWidth:style?.outlineWidth}; })()");
    check("keyboard focus has a visible ring and a 24px native hit target",
        focusFirst.focusVisible === true && focusRing.width >= 24 && focusRing.height >= 24 &&
        focusRing.outlineStyle !== "none" && focusRing.outlineWidth !== "0px", { focusFirst, focusRing });

    await key("ArrowRight", "ArrowRight", 39);
    await poll(() => evaluate("document.querySelector('#radio-delivery-window input[value=Afternoon]')?.checked === true && " +
        "document.querySelector('#radio-delivery-status')?.textContent.includes('Afternoon')"));
    const afterRight = await evaluate("(() => ({delivery:[...document.querySelectorAll('#radio-delivery-window input')].filter(x=>x.checked).map(x=>x.value)," +
        "contact:[...document.querySelectorAll('#radio-contact-window input')].filter(x=>x.checked).map(x=>x.value)}))()");
    check("ArrowRight updates native selection and Blazor binding inside the current group",
        afterRight.delivery.join() === "Afternoon" && afterRight.contact.join() === "Evening", afterRight);
    await key("ArrowRight", "ArrowRight", 39);
    await key("ArrowRight", "ArrowRight", 39);
    await poll(() => evaluate("document.querySelector('#radio-delivery-window input[value=Morning]')?.checked === true && " +
        "document.querySelector('#radio-delivery-status')?.textContent.includes('Morning')"));
    const wrap = await evaluate("[...document.querySelectorAll('#radio-delivery-window input')].filter(x=>x.checked).map(x=>x.value)");
    check("ArrowRight wraps within the current group", wrap.join() === "Morning", wrap);

    await key("Tab", "Tab", 9);
    const focusSecond = await evaluate("(() => ({value:document.activeElement?.value,group:document.activeElement?.closest('fieldset')?.id,checked:document.activeElement?.checked}))()");
    check("one Tab leaves the first group and enters the second at its selected option",
        focusSecond.group === "radio-contact-window" && focusSecond.value === "Evening" && focusSecond.checked, focusSecond);
    await key("ArrowRight", "ArrowRight", 39);
    await poll(() => evaluate("document.querySelector('#radio-contact-window input[value=Morning]')?.checked === true && " +
        "document.querySelector('#radio-contact-status')?.textContent.includes('Morning') && " +
        "document.querySelector('#radio-delivery-status')?.textContent.includes('Morning')"));
    const isolation = await evaluate("(() => ({delivery:[...document.querySelectorAll('#radio-delivery-window input')].filter(x=>x.checked).map(x=>x.value)," +
        "contact:[...document.querySelectorAll('#radio-contact-window input')].filter(x=>x.checked).map(x=>x.value)}))()");
    check("Arrow navigation in the second group cannot change the first group",
        isolation.delivery.join() === "Morning" && isolation.contact.join() === "Morning", isolation);

    await evaluate("(() => { const marker=document.createElement('button'); marker.id='radio-qa-empty-anchor'; marker.type='button'; " +
        "marker.style.cssText='position:fixed;left:-10000px;top:0'; const group=document.querySelector('#radio-alert-frequency'); " +
        "group.parentElement.insertBefore(marker,group); marker.focus(); return true; })()");
    await key("Tab", "Tab", 9);
    const frequencyFocus = await evaluate("(() => ({group:document.activeElement?.closest('fieldset')?.id,value:document.activeElement?.value,checked:document.activeElement?.checked}))()");
    check("Tab enters an unselected group at its first enabled option without selecting it",
        frequencyFocus.group === "radio-alert-frequency" && frequencyFocus.value === "Immediately" && !frequencyFocus.checked,
        frequencyFocus);
    await key(" ", "Space", 32);
    await poll(() => evaluate("document.querySelector('#radio-alert-frequency input[value=Immediately]')?.checked === true && " +
        "document.querySelector('#radio-frequency-status')?.textContent.includes('Immediately')"));
    const space = await evaluate("(() => ({checked:[...document.querySelectorAll('#radio-alert-frequency input')].filter(x=>x.checked).map(x=>x.value)," +
        "status:document.querySelector('#radio-frequency-status')?.textContent.trim()}))()");
    check("Space selects the focused option when the group had no selection",
        space.checked.join() === "Immediately" && space.status.includes("Immediately"), space);

    await evaluate("document.querySelector('#radio-delivery-speed input[value=Standard]').focus()");
    await key("ArrowRight", "ArrowRight", 39);
    const disabledSkip = await evaluate("(() => ({checked:[...document.querySelectorAll('#radio-delivery-speed input')].filter(x=>x.checked).map(x=>x.value)," +
        "active:document.activeElement?.value}))()");
    check("ArrowRight skips a disabled option inside the current group",
        disabledSkip.checked.join() === "Overnight" && disabledSkip.active === "Overnight", disabledSkip);

    const unavailableId = await evaluate("document.querySelector('#radio-availability input[value=Unavailable]')?.id");
    await click('#radio-availability label[for="' + unavailableId + '"]');
    const disabledPointer = await evaluate("(() => ({selected:[...document.querySelectorAll('#radio-availability input')].filter(x=>x.checked).map(x=>x.value)," +
        "disabled:document.querySelector('#radio-availability input[value=Unavailable]')?.matches(':disabled')}))()");
    check("disabled option ignores pointer activation",
        disabledPointer.disabled && disabledPointer.selected.join() === "Available", disabledPointer);

    await click("#radio-form-submit");
    await poll(() => evaluate("document.querySelector('#radio-preference-form')?.textContent.includes('Choose a delivery window.')"));
    const invalid = await evaluate("(() => ({message:document.querySelector('#radio-preference-form')?.textContent.includes('Choose a delivery window.')," +
        "invalid:[...document.querySelectorAll('#radio-form-delivery input')].map(x=>x.getAttribute('aria-invalid'))," +
        "selected:[...document.querySelectorAll('#radio-form-delivery input')].filter(x=>x.checked).map(x=>x.value)}))()");
    check("EditContext validation marks native radio options invalid",
        invalid.message && invalid.invalid.every(value=>value==="true") && invalid.selected.length===0, invalid);

    const formMorningId = await evaluate("document.querySelector('#radio-form-delivery input[value=Morning]')?.id");
    await click("#radio-form-delivery label[for=\"" + formMorningId + "\"]");
    await poll(() => evaluate("document.querySelector('#radio-form-delivery input[value=Morning]')?.checked === true && " +
        "document.querySelector('#radio-form-selection')?.textContent.includes('Selected: Morning') && " +
        "document.querySelector('#radio-form-delivery input')?.getAttribute('aria-invalid') !== 'true'"));
    await click("#radio-form-submit");
    await poll(() => evaluate("document.querySelector('#radio-form-status')?.textContent.includes('Saved: Morning')"));
    const form = await evaluate("(() => { const element=document.querySelector('#radio-preference-form'); const input=element.querySelector('#radio-form-delivery input:checked'); " +
        "const data=new FormData(element); return {status:element.querySelector('#radio-form-status')?.textContent.trim(),name:input?.name,value:input?.value," +
        "formValue:input?data.get(input.name):null,invalid:[...element.querySelectorAll('#radio-form-delivery input')].map(x=>x.getAttribute('aria-invalid'))}; })()");
    check("valid form submission preserves the selected value in native FormData",
        form.status==="Saved: Morning" && form.value==="Morning" && form.formValue==="Morning" && form.invalid.every(value=>value===null),
        form);

    const afternoonId = await evaluate("document.querySelector('#radio-delivery-window input[value=Afternoon]')?.id");
    await click('#radio-delivery-window label[for="' + afternoonId + '"]');
    await poll(() => evaluate("document.querySelector('#radio-delivery-status')?.textContent.includes('Afternoon')"));
    const pointer = await evaluate("(() => ({checked:[...document.querySelectorAll('#radio-delivery-window input')].filter(x=>x.checked).map(x=>x.value)," +
        "status:document.querySelector('#radio-delivery-status')?.textContent.trim()}))()");
    check("hit-tested pointer activation updates the Blazor bound value",
        pointer.checked.join()==="Afternoon" && pointer.status.includes("Afternoon"), pointer);

    const rtl = await evaluate("(() => { const group=document.querySelector('#radio-delivery-language'), input=group.querySelector('input'), " +
        "label=input.labels?.[0], indicator=input.nextElementSibling, i=input.getBoundingClientRect(), l=label.getBoundingClientRect(), r=indicator.getBoundingClientRect(); " +
        "return {direction:getComputedStyle(group).direction,inputWidth:i.width,inputHeight:i.height,labelWidth:l.width,indicatorWidth:r.width}; })()");
    check("RTL options retain native label association and responsive hit target",
        rtl.direction==="rtl" && rtl.inputWidth>=24 && rtl.inputHeight>=24 && rtl.indicatorWidth===16, rtl);

    const appearance = await evaluate("(() => { const group=document.querySelector('#radio-delivery-window'), legend=group.querySelector('legend'), " +
        "input=group.querySelector('input'), indicator=input.nextElementSibling; return {background:getComputedStyle(indicator).backgroundColor," +
        "border:getComputedStyle(indicator).borderColor,legendColor:getComputedStyle(legend).color}; })()");
    await send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: "active" }] });
    const forced = await evaluate("(() => { const input=document.querySelector('#radio-delivery-window input'), style=getComputedStyle(input.nextElementSibling); " +
        "return {active:matchMedia('(forced-colors: active)').matches,adjust:style.forcedColorAdjust,border:style.borderColor}; })()");
    check("forced-colors browser emulation activates system-color radio indicators",
        forced.active && forced.adjust==="none" && forced.border!=="", forced);
    await send("Emulation.setEmulatedMedia", { features: [] });

    await evaluate("document.documentElement.setAttribute('data-bui-theme','dark')");
    const dark = await evaluate("(() => { const group=document.querySelector('#radio-delivery-window'), legend=group.querySelector('legend'), " +
        "input=group.querySelector('input'), indicator=input.nextElementSibling; return {theme:document.documentElement.getAttribute('data-bui-theme')," +
        "background:getComputedStyle(indicator).backgroundColor,border:getComputedStyle(indicator).borderColor,legendColor:getComputedStyle(legend).color}; })()");
    check("dark theme mode remains computed for the RadioGroup",
        dark.theme==="dark" && !!dark.legendColor && !!dark.border, { light:appearance, dark });

    await send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: "none" }] });
    await send("Emulation.setDeviceMetricsOverride", { width: 320, height: 740, deviceScaleFactor: 2, mobile: false });
    await poll(() => evaluate("window.innerWidth===320"));
    const mobile = await evaluate("(() => { const ids=['radio-delivery-window','radio-contact-window','radio-priority','radio-delivery-speed'," +
        "'radio-alert-frequency','radio-quiet-hours','radio-delivery-language','radio-form-delivery']; const groups=ids.map(id=>{" +
        "const element=document.querySelector('#'+id), rect=element.getBoundingClientRect(); return {id,x:rect.x,right:rect.right,width:rect.width};});" +
        "const targets=[...document.querySelectorAll('.bui-radio-box input')].map(input=>{const rect=input.getBoundingClientRect();return {w:rect.width,h:rect.height};});" +
        "const offenders=[...document.querySelectorAll('body *')].map(element=>{const rect=element.getBoundingClientRect(),style=getComputedStyle(element);return {tag:element.tagName,id:element.id,cls:typeof element.className==='string'?element.className.slice(0,90):'',text:(element.innerText||'').slice(0,70),left:Math.round(rect.left),right:Math.round(rect.right),width:Math.round(rect.width),scrollWidth:element.scrollWidth,overflowX:style.overflowX,whiteSpace:style.whiteSpace};}).filter(item=>item.right>320||item.left<0||item.scrollWidth>item.width+1).sort((a,b)=>b.right-a.right).slice(0,14); return {width:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth,groups,targets,offenders}; })()");
    check("320px viewport reflows groups and retains 24px targets without overflow",
        mobile.width===320 && mobile.document<=320 && mobile.body<=320 &&
        mobile.groups.every(group=>group.x>=0 && group.right<=320) &&
        mobile.targets.every(target=>target.w>=24 && target.h>=24), mobile);
    await snapshot("320px");

    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await poll(() => evaluate("window.innerWidth===1280"));
    await snapshot("1280px");

    const hard = signals.filter(signal => ["exception","error","http"].includes(signal.type));
    check("no browser exceptions, console errors or application HTTP failures", hard.length===0, hard);
} catch (error) {
    signals.push({ type: "fatal", text: error?.stack || String(error) });
    console.error(error?.stack || error);
} finally {
    try { ws?.close(); } catch {}
    if (browser && !browser.killed) { try { browser.kill(); } catch {} }
    const report = {
        issue: 436, browser: browserLabel, renderMode, base, route,
        generatedAt: new Date().toISOString(),
        passed: checks.filter(item=>item.pass).length,
        failed: checks.filter(item=>!item.pass).length,
        checks, runtimeSignals: signals, profilePrefix
    };
    if (evidencePath) {
        await mkdir(dirname(evidencePath), { recursive: true });
        await writeFile(evidencePath, JSON.stringify(report, null, 2), "utf8");
    }
    console.log("\nRESULT " + report.passed + "/" + checks.length + " PASS; " + report.failed + " FAIL");
    if (report.failed || signals.some(item=>item.type==="fatal")) process.exitCode=1;
    await rm(profile, { recursive:true, force:true }).catch(()=>{});
}
