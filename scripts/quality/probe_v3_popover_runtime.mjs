#!/usr/bin/env node
// #420 actual Popover interaction test; real Chrome/Edge against Blazor WASM.
import {spawn,execFileSync} from "node:child_process";
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
let app,browser,cdp;const checks=[],errors=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
function result(name,ok,details){checks.push({name,pass:!!ok,details});if(!ok)errors.push(name+" "+JSON.stringify(details));}
function launch(exe,args,cwd=root,env=process.env){const p=spawn(exe,args,{cwd,env,windowsHide:true,stdio:["ignore","pipe","pipe"]});let tail="";for(const x of [p.stdout,p.stderr])x.on("data",v=>tail=(tail+String(v)).slice(-6500));p.tail=()=>tail;return p;}
async function until(fn,name,timeout=80000){const end=Date.now()+timeout;let last="";while(Date.now()<end){try{const x=await fn();if(x)return x;}catch(e){last=String(e);}await wait(300);}throw Error("Timeout "+name+": "+last);}
class CDP {
 constructor(url){this.ws=new WebSocket(url);this.next=0;this.pending=new Map();}
 async open(){await new Promise((done,fail)=>{this.ws.addEventListener("open",done,{once:true});this.ws.addEventListener("error",fail,{once:true});});this.ws.addEventListener("message",event=>{const x=JSON.parse(String(event.data)),p=this.pending.get(x.id);if(!p)return;clearTimeout(p.timer);this.pending.delete(x.id);x.error?p.reject(Error(JSON.stringify(x.error))):p.resolve(x.result||{});});}
 send(method,params={}){const id=++this.next;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(Error("Timeout "+method));},22000);this.pending.set(id,{resolve,reject,timer});this.ws.send(JSON.stringify({id,method,params}));});}
 async js(expr){const r=await this.send("Runtime.evaluate",{expression:expr,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result?.value;}
 close(){this.ws?.close();}
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
   app=launch("dotnet",["run","--project","src/Bluent.UI.Demo/Bluent.UI.Demo.csproj",
     "-c","Debug","--no-build","--no-launch-profile","--urls",origin]);
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
 const opened=await until(async()=>{
  await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Popover trigger'));b?.click();return !!b;})()");
  return cdp.js("!![...document.querySelectorAll('.bui-popover-surface.show')].find(x=>x.textContent.includes('This is a sample content.'))");
 },"default KeepSurface trigger opens",17000);
 result("KeepSurface trigger opens actual Popover",opened);
 // Escape is an actual browser keyboard event, not JS-dispatched synthetic
 // KeyboardEvent: it closes only the active surface and restores trigger focus.
 await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Popover trigger'));b?.focus();return !!b;})()");
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
 const escapeClosed=await until(()=>cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Popover trigger'));const surface=[...document.querySelectorAll('.bui-popover-surface')].find(x=>x.textContent.includes('This is a sample content.'));return !!(b&&surface&&!surface.classList.contains('show')&&document.activeElement===b);})()"),"Escape dismisses and returns focus",9000);
 result("Escape closes popover and restores exact trigger focus",escapeClosed);
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
 const stackShot=await cdp.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
 writeFileSync(join(evidence,"popover-stack-"+brand+".png"),Buffer.from(stackShot.data,"base64"));
}catch(e){errors.push(String(e.stack||e));}
finally{
 writeFileSync(join(evidence,"popover-"+brand+".json"),JSON.stringify({schema:1,browser:brand,commit:process.env.GITHUB_SHA||"local",checks,errors},null,2));
 cdp?.close();for(const p of [browser,app])if(p&&p.exitCode===null)p.kill();
 try{rmSync(work,{recursive:true,force:true,maxRetries:4,retryDelay:350});}catch{}
 console.log("Real Popover "+brand+" "+mode+": "+checks.filter(x=>x.pass).length+"/"+checks.length+" checks; failures="+errors.length);
 for(const error of errors)console.error("FAIL",error);
}
if(errors.length)process.exitCode=1;
