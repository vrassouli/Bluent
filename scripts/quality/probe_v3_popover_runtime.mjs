#!/usr/bin/env node
// #420 actual Popover interaction test; real Chrome/Edge against Blazor WASM.
import {spawn,execFile,execFileSync} from "node:child_process";
import {promisify} from "node:util";
const execFileAsync=promisify(execFile);
import {mkdtempSync,existsSync,readFileSync,writeFileSync,rmSync,mkdirSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const browserExe=process.env.CHROME_PATH;
if(!browserExe||!existsSync(browserExe))throw Error("CHROME_PATH must be installed Chrome or Edge");
const brand=process.env.BLUENT_V3_BROWSER_NAME||"local";
const mode=process.env.BLUENT_V3_RENDER_MODE||"WASM";
if(!["WASM","Server"].includes(mode))throw Error("Expected WASM or Server");
const work=mkdtempSync(join(tmpdir(),"bluent-v3-420-"));
const evidence=resolve(process.env.BLUENT_V3_EVIDENCE_DIR||join(work,"evidence"));
mkdirSync(evidence,{recursive:true});
const origin=process.env.BLUENT_V3_POPOVER_URL||"http://127.0.0.1:5099";
const url=origin+(process.env.BLUENT_V3_POPOVER_ROUTE||
    (mode==="Server"?"/compatibility/popover-server":"/components/popovers"));
let app,browser,cdp;const checks=[],errors=[],cleanupAttempts=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
function result(name,ok,details){checks.push({name,pass:!!ok,details});if(!ok)errors.push(name+" "+JSON.stringify(details));}
function launch(exe,args,cwd=root,env=process.env){const p=spawn(exe,args,{cwd,env,windowsHide:true,stdio:["ignore","pipe","pipe"]});let tail="";for(const x of [p.stdout,p.stderr])x.on("data",v=>tail=(tail+String(v)).slice(-6500));p.tail=()=>tail;return p;}
async function cleanupOnlyOwnedBrowserProfiles(profileRoot){
 if(process.platform!=="win32")return {supported:false};
 if(!profileRoot.includes("bluent-v3-420-"))
  throw Error("Refusing browser cleanup outside temporary #420 QA profile");
 const ps=[
  "$root=$env:BLUENT_V3_420_OWNED_PROFILE",
  "if(-not $root -or $root.IndexOf('bluent-v3-420-') -lt 0){throw 'Unsafe QA scope'}",
  "$items=@(Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' OR Name='msedge.exe'\" |",
  "Where-Object { $_.CommandLine -and $_.CommandLine.IndexOf($root,[StringComparison]::OrdinalIgnoreCase) -ge 0 })",
  "$killed=0",
  "foreach($item in $items){try{Stop-Process -Id $item.ProcessId -Force -ErrorAction Stop;$killed++}catch{}}",
  "Start-Sleep -Milliseconds 400",
  "$remaining=@($items | Where-Object { Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue })",
  "Write-Output \"killed=$killed remaining=$($remaining.Count)\"",
  "if($remaining.Count -gt 0){exit 17}"
 ].join("\n");
 const {stdout}=await execFileAsync("powershell.exe",
  ["-NoProfile","-NonInteractive","-Command",ps],
  {env:{...process.env,BLUENT_V3_420_OWNED_PROFILE:profileRoot},
   windowsHide:true,timeout:65000,maxBuffer:1024*1024});
 return {supported:true,output:stdout.trim()};
}
async function until(fn,name,timeout=80000){const end=Date.now()+timeout;let last="";while(Date.now()<end){try{const x=await fn();if(x)return x;}catch(e){last=String(e);}await wait(300);}throw Error("Timeout "+name+": "+last);}
class CDP {
 constructor(url){this.ws=new WebSocket(url);this.next=0;this.pending=new Map();this.runtimeExceptions=[];}
 async open(){await new Promise((done,fail)=>{this.ws.addEventListener("open",done,{once:true});this.ws.addEventListener("error",fail,{once:true});});this.ws.addEventListener("message",event=>{const x=JSON.parse(String(event.data));if(x.method==="Runtime.exceptionThrown"){this.runtimeExceptions.push(x.params.exceptionDetails.exception?.description||x.params.exceptionDetails.text);return;}const p=this.pending.get(x.id);if(!p)return;clearTimeout(p.timer);this.pending.delete(x.id);x.error?p.reject(Error(JSON.stringify(x.error))):p.resolve(x.result||{});});}
 send(method,params={}){const id=++this.next;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(Error("Timeout "+method));},22000);this.pending.set(id,{resolve,reject,timer});this.ws.send(JSON.stringify({id,method,params}));});}
 async js(expr){const r=await this.send("Runtime.evaluate",{expression:expr,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result?.value;}
 close(){this.ws?.close();}
}
// Chromium Accessibility domain is the browser's actual accessibility tree,
// NOT equivalent to a named OS screen reader or spoken-output certification.
async function triggerAxEvidence(cdp){
 const obj=await cdp.send("Runtime.evaluate",{
  expression:"[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Popover trigger'))"
 });
 if(!obj.result?.objectId)throw Error("Popover trigger has no CDP remote object");
 const tree=await cdp.send("Accessibility.getPartialAXTree",{
  objectId:obj.result.objectId,fetchRelatives:false
 });
 const node=tree.nodes?.find(n=>!n.ignored&&n.role?.value==="button");
 if(!node)throw Error("Popover trigger absent from browser accessibility tree");
 const attr=name=>node.properties?.find(x=>x.name===name)?.value;
 return {role:node.role?.value,name:node.name?.value,
  focusable:attr("focusable")?.value,focused:attr("focused")?.value??false,
  expanded:attr("expanded")?.value,
  controls:attr("controls")?.value,
  controlsTargetIds:attr("controls")?.relatedNodes?.map(x=>x.idref)||[]};
}
try{
 if(!process.env.BLUENT_V3_POPOVER_URL){
  if(mode==="Server"){
   const published=join(work,"published-ssr");
   try {
    execFileSync("dotnet",["publish","src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj",
      "--configuration","Release","--no-restore","--nologo","--output",published,"-v","quiet"],
      {cwd:root,windowsHide:true,timeout:300000,stdio:"pipe"});
   } catch(e){throw Error("SSR publish failed: "+String(e.stderr||e.stdout||e.message).slice(-6000));}
   app=launch("dotnet",["Bluent.UI.Demo.SSR.dll"],published,
     {...process.env,ASPNETCORE_ENVIRONMENT:"Production",ASPNETCORE_URLS:origin});
  } else {
   // Release standalone targets GitHub Pages /Bluent/; Debug hosts at root.
   // Build current Debug output on every actual WASM QA run. --no-build can
   // silently serve stale Razor fixture pages after a Release-only build.
   app=launch("dotnet",["run","--project","src/Bluent.UI.Demo/Bluent.UI.Demo.csproj",
     "-c","Debug","--no-launch-profile","--urls",origin]);
  }
 }
 await until(async()=>{if(app&&app.exitCode!==null)throw Error("Demo exited: "+app.tail());return (await fetch(url,{signal:AbortSignal.timeout(1300)})).ok;},"Demo http host");
 const profile=join(work,"browser");
 browser=launch(browserExe,["--headless=new","--no-sandbox","--disable-gpu","--no-first-run","--disable-extensions","--remote-debugging-port=0","--remote-allow-origins=*","--user-data-dir="+profile,"about:blank"]);
 const port=await until(()=>{const f=join(profile,"DevToolsActivePort");if(existsSync(f))return readFileSync(f,"utf8").split(/\r?\n/)[0];if(browser.exitCode!==null)throw Error("Browser died: "+browser.tail());return false;},"CDP port",32000);
 const tab=await until(async()=>{const items=await (await fetch("http://127.0.0.1:"+port+"/json/list")).json();return items.find(x=>x.type==="page"&&x.webSocketDebuggerUrl);},"CDP target");
 cdp=new CDP(tab.webSocketDebuggerUrl);await cdp.open();await cdp.send("Page.enable");await cdp.send("Runtime.enable");await cdp.send("Page.navigate",{url});
 const mounted=await until(()=>cdp.js("(()=>{const a=[...document.querySelectorAll('button')].filter(x=>x.textContent.includes('Popover trigger'));return document.querySelector('h1')?.textContent==='Popover'&&a.length>=3;})()"),"Blazor WASM popover demo",85000);
 result("real interactive Popover page mounted",mounted);
 // #420 regression: the publicly-supported RightEnd placement class is
 // emitted as right-end, and its ACTUAL shipped CSS must apply the
 // -10px entry transform before .show overrides it to zero.
 const rightEndInitial=await until(()=>cdp.js("(()=>{const s=document.querySelector('.bui-popover-surface.right-end');if(!s)return null;const prior=s.style.getPropertyValue('display'),priority=s.style.getPropertyPriority('display'),hidden=s.classList.contains('hidden');let x;try{s.style.setProperty('display','block','important');x=new DOMMatrixReadOnly(getComputedStyle(s).transform).m41;}finally{if(prior)s.style.setProperty('display',prior,priority);else s.style.removeProperty('display');}return {placement:s.className,entryTranslateX:x,hidden,restored:getComputedStyle(s).display==='none'};})()"),"real RightEnd Popover source-owned surface",14000);
 result("RightEnd native Blazor Popover has correct CSS entry transform",
   rightEndInitial.hidden&&rightEndInitial.restored&&Math.abs(rightEndInitial.entryTranslateX+10)<0.6,rightEndInitial);
 const rightEndOpened=await until(async()=>{
   await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent==='RightEnd placement trigger');b?.click();return !!b;})()");
   return cdp.js("(()=>{const s=document.querySelector('.bui-popover-surface.right-end.show:not(.hidden)');return s?.textContent.includes('RightEnd positioning surface')??false;})()");
 },"RightEnd real Blazor click opens placed surface",13000);
 result("RightEnd click opens correct native Popover surface",rightEndOpened);
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 const rightEndClosed=await until(()=>cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent==='RightEnd placement trigger');const s=document.querySelector('.bui-popover-surface.right-end');return !!(b&&s&&!s.classList.contains('show')&&document.activeElement===b);})()"),"RightEnd Escape restores trigger focus",9000);
 result("RightEnd Escape closes and restores exact trigger focus",rightEndClosed);
 // On InteractiveServer the child Popover may mount before its JS service
 // finishes binding. Wait for real Blazor/interop hydration, never fake ARIA.
 const initialDisclosure=await until(async()=>{
  const a=await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Popover trigger'));return {expanded:b?.getAttribute('aria-expanded'),controls:b?.getAttribute('aria-controls')}})()");
  return a.expanded==='false'&&a.controls===null?a:false;
 },"closed click disclosure ARIA initialized by real Blazor",13000);
 result("closed click-trigger Popover advertises aria-expanded=false without dangling aria-controls",
   initialDisclosure.expanded==='false'&&initialDisclosure.controls===null,initialDisclosure);
 const axInitiallyClosed=await triggerAxEvidence(cdp);
 result("Chromium AX tree exposes labeled focusable button as collapsed",
   axInitiallyClosed.role==="button"&&axInitiallyClosed.name==="Popover trigger"&&
   axInitiallyClosed.focusable===true&&axInitiallyClosed.expanded===false&&
   axInitiallyClosed.controlsTargetIds.length===0,axInitiallyClosed);
 const opened=await until(async()=>{
  await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Popover trigger'));b?.click();return !!b;})()");
  return cdp.js("!![...document.querySelectorAll('.bui-popover-surface.show')].find(x=>x.textContent.includes('This is a sample content.'))");
 },"default KeepSurface trigger opens",17000);
 result("KeepSurface trigger opens actual Popover",opened);
 const openedDisclosure=await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Popover trigger'));const s=[...document.querySelectorAll('.bui-popover-surface.show')].find(x=>x.textContent.includes('This is a sample content.'));return {expanded:b?.getAttribute('aria-expanded'),controls:b?.getAttribute('aria-controls'),surface:s?.id}})()");
 result("opened Popover announces expanded and references real visible surface",
   openedDisclosure.expanded==='true'&&!!openedDisclosure.surface&&
   openedDisclosure.controls===openedDisclosure.surface,openedDisclosure);
 const axOpened=await triggerAxEvidence(cdp);
 result("Chromium AX tree exposes expanded trigger and valid controlled surface",
   axOpened.role==="button"&&axOpened.expanded===true&&
   axOpened.controls===openedDisclosure.surface&&
   axOpened.controlsTargetIds.includes(openedDisclosure.surface),axOpened);
 // Escape is an actual browser keyboard event, not JS-dispatched synthetic
 // KeyboardEvent: it closes only the active surface and restores trigger focus.
 await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Popover trigger'));b?.focus();return !!b;})()");
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 const escapeClosed=await until(()=>cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Popover trigger'));const surface=[...document.querySelectorAll('.bui-popover-surface')].find(x=>x.textContent.includes('This is a sample content.'));return !!(b&&surface&&!surface.classList.contains('show')&&document.activeElement===b);})()"),"Escape dismisses and returns focus",9000);
 result("Escape closes popover and restores exact trigger focus",escapeClosed);
 const closedDisclosure=await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Popover trigger'));return {expanded:b?.getAttribute('aria-expanded'),controls:b?.getAttribute('aria-controls')}})()");
 result("Escape synchronizes aria-expanded=false and removes stale aria-controls",
   closedDisclosure.expanded==='false'&&closedDisclosure.controls===null,closedDisclosure);
 const axAfterEscape=await triggerAxEvidence(cdp);
 result("Chromium AX tree reports collapsed focused trigger after Escape",
   axAfterEscape.role==="button"&&axAfterEscape.expanded===false&&
   axAfterEscape.focused===true&&axAfterEscape.controlsTargetIds.length===0,
   axAfterEscape);
 const reopened=await until(async()=>{
  await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Popover trigger'));b?.click();return !!b;})()");
  return cdp.js("!![...document.querySelectorAll('.bui-popover-surface.show')].find(x=>x.textContent.includes('This is a sample content.'))");
 },"popover can reopen after Escape",13000);
 result("trigger reopens popover after Escape",reopened);
 // Outside click closes without stealing focus from another already-focused control.
 const noFocusTheft=await until(async()=>{
  await cdp.js("(()=>{const x=[...document.querySelectorAll('button')].filter(x=>x.textContent.includes('Popover trigger'))[1];x?.focus();document.body.click();return !!x;})()");
  return cdp.js("(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.textContent.includes('Popover trigger'))[1];const s=[...document.querySelectorAll('.bui-popover-surface')].find(x=>x.textContent.includes('This is a sample content.'));return !!(b&&s&&!s.classList.contains('show')&&document.activeElement===b);})()");
 },"outside click leaves user focus untouched",10000);
 result("outside click dismisses without moving focus to trigger",noFocusTheft);
 // Zero-duration styles simulate a real accessible reduced-motion host where
 // transitionend will never fire. The surface must still become fully hidden.
 await cdp.send("Emulation.setEmulatedMedia",{features:[
  {name:"prefers-reduced-motion",value:"reduce"},
  {name:"forced-colors",value:"active"}
 ]});
 const emulated=await cdp.js("(()=>{document.documentElement.dir='rtl';return {reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,forced:matchMedia('(forced-colors: active)').matches,dir:document.documentElement.dir};})()");
 result("RTL with reduced-motion and forced-colors browser emulation enabled",emulated.reduced&&emulated.forced&&emulated.dir==='rtl',emulated);
 // Check the ACTUAL shipped CSS, before manually forcing any transition
 // duration. A Reduce Motion host must not require inline overrides.
 const naturalReducedMotion=await cdp.js("(()=>{const s=[...document.querySelectorAll('.bui-popover-surface')].find(x=>x.textContent.includes('This is a sample content.'));if(!s)return {ok:false,reason:'missing surface'};const style=getComputedStyle(s);const durations=style.transitionDuration.split(',').map(x=>x.trim());return {ok:durations.every(x=>parseFloat(x)===0),duration:style.transitionDuration,delay:style.transitionDelay};})()");
 result("shipped Popover CSS naturally honors OS prefers-reduced-motion",naturalReducedMotion.ok,naturalReducedMotion);
 const zeroMotion=await until(async()=>{
  await cdp.js("(()=>{const surface=[...document.querySelectorAll('.bui-popover-surface')].find(x=>x.textContent.includes('This is a sample content.'));if(surface){surface.style.transitionDuration='0s';surface.style.transitionDelay='0s';}const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Popover trigger'));b?.click();return !!b;})()");
  return cdp.js("!![...document.querySelectorAll('.bui-popover-surface.show')].find(x=>x.textContent.includes('This is a sample content.'))");
 },"reduced-motion/zero-duration popover opens",14000);
 result("zero-duration RTL Popover opens",zeroMotion);
 const contrastShot=await cdp.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
 writeFileSync(join(evidence,"popover-rtl-emulated-contrast-"+brand+".png"),Buffer.from(contrastShot.data,"base64"));
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 const zeroHidden=await until(()=>cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Popover trigger'));const s=[...document.querySelectorAll('.bui-popover-surface')].find(x=>x.textContent.includes('This is a sample content.'));return !!(s&&s.classList.contains('hidden')&&!s.classList.contains('show')&&document.activeElement===b);})()"),"no-transition Escape fully hides surface and restores focus",7000);
 result("zero-duration Escape hides surface without transitionend",zeroHidden);
 // Closing during a longer transition and immediately reopening should cancel
 // the old transitionend listener/timer. No stale completion may hide it later.
 const rapidOpened=await until(async()=>{
  await cdp.js("(()=>{const s=[...document.querySelectorAll('.bui-popover-surface')].find(x=>x.textContent.includes('This is a sample content.'));if(s){s.style.transitionDuration='0.7s';s.style.transitionDelay='0s';}const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Popover trigger'));b?.click();return !!b;})()");
  return cdp.js("!![...document.querySelectorAll('.bui-popover-surface.show:not(.hidden)')].find(x=>x.textContent.includes('This is a sample content.'))");
 },"long-transition reopen before fast close",13000);
 result("long-animation Popover opens",rapidOpened);
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 const reopenedFast=await until(async()=>{
  await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Popover trigger'));b?.click();return !!b;})()");
  return cdp.js("!![...document.querySelectorAll('.bui-popover-surface.show:not(.hidden)')].find(x=>x.textContent.includes('This is a sample content.'))");
 },"immediate reopen during pending hide animation",11000);
 result("rapid reopen cancels pending hide",reopenedFast);
 await new Promise(done=>setTimeout(done,1100));
 const stableOpen=await cdp.js("(()=>{const s=[...document.querySelectorAll('.bui-popover-surface')].find(x=>x.textContent.includes('This is a sample content.'));return !!(s&&s.classList.contains('show')&&!s.classList.contains('hidden'));})()");
 result("old hide completion cannot conceal reopened Popover",stableOpen);
 await cdp.js("(()=>{const s=[...document.querySelectorAll('.bui-popover-surface')].find(x=>x.textContent.includes('This is a sample content.'));if(s){s.style.transitionDuration='0s';s.style.transitionDelay='0s';}document.body.click();return true;})()");
 await cdp.send("Emulation.setEmulatedMedia",{features:[]});
 await cdp.js("document.documentElement.dir='ltr'");
 const second=await until(async()=>{
  await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.textContent.includes('Popover trigger'))[1];b?.click();return !!b;})()");
  return cdp.js("!![...document.querySelectorAll('.bui-popover-surface.show')].find(x=>x.textContent.includes('Click to switch content.'))");
 },"dynamic Set before Show",20000);
 result("dynamic surface rendered from Set/Show sequence",second);
 const changed=await until(async()=>{
  await cdp.js("(()=>{const b=[...document.querySelectorAll('.bui-popover-surface.show button')].find(x=>x.textContent.includes('Action'));b?.click();return !!b;})()");
  return cdp.js("!![...document.querySelectorAll('.bui-popover-surface.show')].find(x=>x.textContent.includes('To switch back, click on button again.'))");
 },"inner Popover action rerender",16000);
 result("Popover inner action rerenders actual surface",changed);
 const manual=await until(async()=>{
  await cdp.js("(()=>{const a=[...document.querySelectorAll('input')];const x=a[a.length-1];if(!x)return false;Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(x,'show');x.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:'show'}));return true;})()");
  return cdp.js("!![...document.querySelectorAll('.bui-popover-surface.show')].find(x=>x.textContent.includes('You have entered'))");
 },"manual Show after Set",19000);
 result("manual Popover Show follows registration",manual);
 const closed=await until(async()=>{
  await cdp.js("(()=>{const a=[...document.querySelectorAll('input')];const x=a[a.length-1];if(!x)return false;Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(x,'close');x.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:'close'}));return true;})()");
  return cdp.js("![...document.querySelectorAll('.bui-popover-surface.show')].find(x=>x.textContent.includes('You have entered'))");
 },"manual Popover Close after Show",17000);
 result("manual Popover Close hides requested surface",closed);
 const visible=await cdp.js("(()=>({visible:document.querySelectorAll('.bui-popover-surface.show').length,inputs:document.querySelectorAll('input').length}))()");
 result("rendered surface and input still present",visible.visible>0&&visible.inputs>0,visible);
 const img=await cdp.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
 writeFileSync(join(evidence,"popover-"+brand+".png"),Buffer.from(img.data,"base64"));

 // A separate real Blazor fixture opens two non-modal surfaces concurrently.
 // Verify Escape works in LIFO order (topmost only), including trigger focus.
 const stackUrl=origin+(mode==="Server"?"/compatibility/popover-stack-server":"/components/popover-stack-probe");
 await cdp.send("Page.navigate",{url:stackUrl});
 const stackMounted=await until(()=>cdp.js("(()=>{const heading=document.querySelector('h1');const ready=document.querySelector('output[data-popover-probe-ready]');return heading?.textContent==='Popover stack probe'&&ready?.getAttribute('data-popover-probe-ready')==='true'&&[...document.querySelectorAll('button')].some(x=>x.textContent.includes('Open both popovers'));})()"),"interactive Blazor stacked Popover fixture",45000);
 result("separate real stacked Popover Blazor fixture loaded",stackMounted);
 // Do not repeatedly click Show while waiting for asynchronous Blazor Server
 // rendering. Repeated clicks generate overlapping manual Show events and can
 // cause stale hide animations to race with the next opening.
 const commandSent=await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Open both popovers'));b?.click();return !!b;})()");
 result("manual stack OpenBoth command delivered once after Blazor interactive readiness",commandSent);
 const stacked=await until(()=>cdp.js("(()=>{const visible=[...document.querySelectorAll('.bui-popover-surface.show:not(.hidden)')];return visible.some(x=>x.textContent.includes('First stack surface'))&&visible.some(x=>x.textContent.includes('Second stack surface'));})()"),"both concurrently open Popover surfaces",24000);
 result("two Popover surfaces can be open concurrently",stacked);
 const stackOpened=await cdp.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
 writeFileSync(join(evidence,"popover-stack-open-"+brand+".png"),Buffer.from(stackOpened.data,"base64"));
 // SameWidth must work independently for each surface. The second Popover
 // must not steal the first one's ResizeObserver when they share a host.
 const beforeWidths=await cdp.js("(()=>{const buttons=[...document.querySelectorAll('button')];const first=buttons.find(x=>x.textContent.includes('First stack trigger'));const second=buttons.find(x=>x.textContent.includes('Second stack trigger'));const surfaces=[...document.querySelectorAll('.bui-popover-surface.show')];const one=surfaces.find(x=>x.textContent.includes('First stack surface'));const two=surfaces.find(x=>x.textContent.includes('Second stack surface'));return {first:first?.getBoundingClientRect().width,second:second?.getBoundingClientRect().width,one:one?.getBoundingClientRect().width,two:two?.getBoundingClientRect().width};})()");
 result("independent initial SameWidth matches both trigger widths",
   Math.abs(beforeWidths.one-beforeWidths.first)<6&&Math.abs(beforeWidths.two-beforeWidths.second)<6,beforeWidths);
 const firstResized=await until(async()=>{
  await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('First stack trigger'));if(b)b.style.width='265px';return !!b;})()");
  return cdp.js("(()=>{const surfaces=[...document.querySelectorAll('.bui-popover-surface.show')];const one=surfaces.find(x=>x.textContent.includes('First stack surface'));const two=surfaces.find(x=>x.textContent.includes('Second stack surface'));return !!(one&&two&&one.getBoundingClientRect().width>245&&Math.abs(two.getBoundingClientRect().width-"+beforeWidths.two+")<6);})()");
 },"first Popover width changes but second remains unchanged",13000);
 result("first SameWidth ResizeObserver remains active with second open",firstResized);
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 const topClosed=await until(()=>cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Second stack trigger'));const surfaces=[...document.querySelectorAll('.bui-popover-surface')];const first=surfaces.find(x=>x.textContent.includes('First stack surface'));const second=surfaces.find(x=>x.textContent.includes('Second stack surface'));return !!(b&&first?.classList.contains('show')&&second&&!second.classList.contains('show')&&document.activeElement===b);})()"),"Escape closes uppermost only",9000);
 result("first Escape closes only topmost and focuses second trigger",topClosed);
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 const bottomClosed=await until(()=>cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('First stack trigger'));const surfaces=[...document.querySelectorAll('.bui-popover-surface')];const first=surfaces.find(x=>x.textContent.includes('First stack surface'));const second=surfaces.find(x=>x.textContent.includes('Second stack surface'));return !!(b&&first&&!first.classList.contains('show')&&second&&!second.classList.contains('show')&&document.activeElement===b);})()"),"second Escape closes remaining surface",9000);
 result("second Escape closes remaining and focuses first trigger",bottomClosed);
 // Reopen both, remove the first Blazor child while BOTH are active, and
 // prove that its JS teardown preserves sibling overlay and Escape focus.
 await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Open both popovers'));b?.click();return !!b;})()");
 const childRemovalReady=await until(()=>cdp.js("(()=>{const surfaces=[...document.querySelectorAll('.bui-popover-surface.show:not(.hidden)')];return surfaces.some(x=>x.textContent.includes('First stack surface'))&&surfaces.some(x=>x.textContent.includes('Second stack surface'));})()"),"both overlays re-open for child removal",18000);
 result("both Popovers reopened before one Blazor child is destroyed",childRemovalReady);
 await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Remove first popover'));b?.click();return !!b;})()");
 const removedOne=await until(()=>cdp.js("(()=>{const buttons=[...document.querySelectorAll('button')];const first=buttons.some(x=>x.textContent.includes('First stack trigger'));const second=buttons.some(x=>x.textContent.includes('Second stack trigger'));const surfaces=[...document.querySelectorAll('.bui-popover-surface.show:not(.hidden)')];return !first&&second&&surfaces.some(x=>x.textContent.includes('Second stack surface'))&&!surfaces.some(x=>x.textContent.includes('First stack surface'));})()"),"Blazor child removal retains sibling surface",18000);
 result("destroying one live Popover leaves sibling visible and usable",removedOne);
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 const siblingClosed=await until(()=>cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Second stack trigger'));const surface=[...document.querySelectorAll('.bui-popover-surface')].find(x=>x.textContent.includes('Second stack surface'));return !!(b&&surface&&!surface.classList.contains('show')&&document.activeElement===b);})()"),"sibling Escape after child destroy",11000);
 result("remaining Popover retains Escape-to-trigger-focus after sibling removal",siblingClosed);
 // The public DisplayArrow=false option must not feed a missing arrow element
 // into the floating geometry middleware or leave invalid positioning.
 const noArrowShown=await until(async()=>{
  await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('No-arrow trigger'));b?.click();return !!b;})()");
  return cdp.js("!![...document.querySelectorAll('.bui-popover-surface.show')].find(x=>x.textContent.includes('No-arrow RTL surface'))");
 },"real no-arrow optional middleware popover",12000);
 result("public DisplayArrow false opens actual Popover",noArrowShown);
 const noArrowGeometry=await until(()=>cdp.js("(()=>{const s=[...document.querySelectorAll('.bui-popover-surface.show')].find(x=>x.textContent.includes('No-arrow RTL surface'));if(!s)return false;const st=getComputedStyle(s);const r=s.getBoundingClientRect();return !s.querySelector('.arrow')&&Number.isFinite(r.x)&&Number.isFinite(r.y)&&r.width>0&&r.height>0&&st.position==='absolute';})()"),"no-arrow geometry finite and DOM has no arrow",8000);
 result("optional arrow positioning works without arrow DOM",noArrowGeometry);
 await wait(750);
 result("Popover positioning emits no unhandled JavaScript exceptions",
   cdp.runtimeExceptions.length===0,cdp.runtimeExceptions.slice(0,6));
 const stackShot=await cdp.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
 writeFileSync(join(evidence,"popover-stack-"+brand+".png"),Buffer.from(stackShot.data,"base64"));

 // Real generic Blazor event contract: Calendar month/year handlers must
 // keep parent async SelectedDateChanged callbacks observable and awaited.
 const calUrl=origin+(mode==="Server"?"/compatibility/calendar-async-server":
   "/components/calendar-async-probe");
 await cdp.send("Page.navigate",{url:calUrl});
 const calReady=await until(()=>cdp.js("(()=>document.querySelector('h1')?.textContent==='Calendar async event probe'&&document.querySelector('output[data-calendar-probe-ready]')?.textContent==='Ready'&&document.querySelectorAll('.bui-calendar').length===4&&document.querySelector('output[data-calendar-probe-ready]')?.getAttribute('data-calendar-probe-ready')==='true')()"),"real Calendar async mode fixture mounted",75000);
 result("real Calendar MonthSelect and YearSelect fixture mounted",calReady);
 for(const kind of ["month","year"]){
  const selector="section[data-calendar-kind='"+kind+"']";
  const clicked=await cdp.js("(()=>{const b=document.querySelector("+JSON.stringify(selector+" .bui-calendar .grid button")+");if(!b)return false;b.click();return true})()");
  result("real "+kind+" Calendar selection dispatched",clicked);
  const pending=await until(()=>cdp.js("document.querySelector("+JSON.stringify(selector+" output[data-calendar-status]")+")?.textContent==='pending'"),kind+" Calendar async callback pending",12500);
  result("real "+kind+" Calendar async callback reports pending",pending);
  const released=await cdp.js("(()=>{const b=[...document.querySelectorAll("+JSON.stringify(selector+" button")+ ")].find(x=>x.textContent.includes('Release "+kind+" callback'));if(!b)return false;b.click();return true})()");
  result("real "+kind+" Calendar pending callback released by user control",released);
  const completed=await until(()=>cdp.js("document.querySelector("+JSON.stringify(selector+" output[data-calendar-status]")+")?.textContent==='completed'"),kind+" Calendar async callback completed",12500);
  result("real "+kind+" Calendar callback finishes after awaited release",completed);
 }
 // MonthChanged must be Task-awaited both for interactive navigation
 // and when parent supplies a new SelectedDate through OnParametersSetAsync.
 for(const kind of ["navigation","external"]){
  const selector="section[data-calendar-kind='"+kind+"']";
  const selectorToClick=kind==="navigation"
   ? selector+" .bui-calendar .header .nav button:nth-child(2)"
   : selector+" button";
  const fired=await cdp.js("(()=>{let b;if("+JSON.stringify(kind)+"==='navigation')b=document.querySelector("+JSON.stringify(selectorToClick)+");else b=[...document.querySelectorAll("+JSON.stringify(selector+" button")+")].find(x=>x.textContent.includes('Change external SelectedDate'));if(!b)return false;b.click();return true})()");
  result("real "+kind+" MonthChanged dispatched",fired);
  const pending=await until(()=>cdp.js("document.querySelector("+JSON.stringify(selector+" output[data-calendar-status]")+")?.textContent==='pending'"),kind+" MonthChanged pending",15000);
  result("real "+kind+" MonthChanged awaiting consumer callback",pending);
  const released=await cdp.js("(()=>{const b=[...document.querySelectorAll("+JSON.stringify(selector+" button")+")].find(x=>x.textContent.includes("+JSON.stringify("Release "+kind+" callback")+"));if(!b)return false;b.click();return true})()");
  result("real "+kind+" MonthChanged release sent",released);
  const completed=await until(()=>cdp.js("document.querySelector("+JSON.stringify(selector+" output[data-calendar-status]")+")?.textContent==='completed'"),kind+" MonthChanged completed",15000);
  result("real "+kind+" MonthChanged completes after awaited release",completed);
 }
 result("Calendar async selection emits no JavaScript runtime exceptions",
   cdp.runtimeExceptions.length===0,cdp.runtimeExceptions.slice(0,5));
}catch(e){errors.push(String(e.stack||e));}
finally{
 cdp?.close();for(const p of [browser,app])if(p&&p.exitCode===null)p.kill();
 try{cleanupAttempts.push(await cleanupOnlyOwnedBrowserProfiles(work));}
 catch(e){const detail=String(e.stderr||e.message||e).slice(-1100);
  cleanupAttempts.push({error:detail});errors.push("Owned QA browser cleanup failed: "+detail);}
 writeFileSync(join(evidence,"popover-"+brand+".json"),
  JSON.stringify({schema:1,browser:brand,commit:process.env.GITHUB_SHA||"local",
   checks,cleanupAttempts,errors},null,2));
 try{rmSync(work,{recursive:true,force:true,maxRetries:4,retryDelay:350});}catch{}
 console.log("Real Popover "+brand+" "+mode+": "+checks.filter(x=>x.pass).length+"/"+checks.length+" checks; failures="+errors.length);
 for(const error of errors)console.error("FAIL",error);
}
if(errors.length)process.exitCode=1;
