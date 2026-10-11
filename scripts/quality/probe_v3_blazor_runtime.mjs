#!/usr/bin/env node
// #418 Chrome/CDP probe for interactive Bluent WASM controls (not AT certification).
// No third-party packages; source design is Penpot Bluent v3 page 32.
import {spawn,execFileSync} from "node:child_process";
import {mkdtempSync,existsSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
const cwd=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const origin=process.env.BLUENT_V3_LAB_ORIGIN||"http://127.0.0.1:5129";
const chromePath=process.env.CHROME_PATH||"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const dir=mkdtempSync(join(tmpdir(),"bluent-v3-418-cdp-")),children=[],checks=[],errors=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function start(cmd,args){const p=spawn(cmd,args,{cwd,stdio:["ignore","pipe","pipe"],windowsHide:true});let log="";for(const s of [p.stdout,p.stderr])s.on("data",b=>log=(log+String(b)).slice(-2000));p.tail=()=>log;children.push(p);return p;}
function assert(name,ok,notes=""){checks.push({name,pass:!!ok,notes});if(!ok)errors.push(name+": "+notes);}
async function until(fn,name,ms=65000){const end=Date.now()+ms;let last="";while(Date.now()<end){try{const r=await fn();if(r)return r;}catch(e){last=String(e)}await sleep(320);}throw Error("Timeout "+name+" "+last);}
class CDP {
 constructor(url){this.url=url;this.serial=1;this.pending=new Map();this.events=[];}
 async open(){this.ws=new WebSocket(this.url);await new Promise((res,rej)=>{this.ws.addEventListener("open",res,{once:true});this.ws.addEventListener("error",rej,{once:true});});this.ws.addEventListener("message",e=>{const m=JSON.parse(String(e.data)),t=this.pending.get(m.id);if(!t){if(m.method && /exceptionThrown|consoleAPICalled|Log.entryAdded|loadingFailed/.test(m.method))this.events.push({method:m.method,params:m.params});return;}this.pending.delete(m.id);clearTimeout(t.timeout);m.error?t.reject(Error(JSON.stringify(m.error))):t.resolve(m.result||{});});}
 send(method,params={}){const id=this.serial++;return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{this.pending.delete(id);reject(Error("CDP timed out: "+method));},18000);this.pending.set(id,{resolve,reject,timeout});this.ws.send(JSON.stringify({id,method,params}));});}
 async js(expression){const r=await this.send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result?.value;}
 close(){this.ws?.close();}
}
let cdp;
try {
 const app=start("dotnet",["run","--configuration","Debug","--no-build","--no-launch-profile","--project","src/Bluent.UI.Demo/Bluent.UI.Demo.csproj","--","--urls="+origin]);
 await until(async()=>{if(app.exitCode!==null)throw Error(app.tail());return (await fetch(origin+"/v3/styling-lab",{signal:AbortSignal.timeout(1100)})).ok;},"WASM server",85000);
 const browser=start(chromePath,["--headless=new","--disable-gpu","--no-sandbox","--disable-extensions","--no-first-run","--remote-debugging-port=0","--remote-allow-origins=*","--user-data-dir="+dir,"about:blank"]);
 const port=await until(()=>{if(browser.exitCode!==null)throw Error(browser.tail());const p=join(dir,"DevToolsActivePort");return existsSync(p)?readFileSync(p,"utf8").split(/\r?\n/)[0]:null;},"Chrome CDP");
 const target=await until(async()=>{const r=await fetch("http://127.0.0.1:"+port+"/json/list");return (await r.json()).find(t=>t.type==="page"&&t.webSocketDebuggerUrl);},"Chrome target");
 cdp=new CDP(target.webSocketDebuggerUrl);await cdp.open();await cdp.send("Page.enable");await cdp.send("Runtime.enable");await cdp.send("Log.enable");await cdp.send("Network.enable");
 await cdp.send("Page.navigate",{url:origin+"/v3/styling-lab"});
 await until(()=>cdp.js("!!(document.querySelector('.v3-lab-surface')&&document.querySelector('#v3-token-action'))"),"real controls",18000);
 await sleep(2000);
 const initial=await cdp.js("(()=>{const h=document.querySelector('.v3-lab-surface'),b=document.querySelector('#v3-token-action');return {opted:h.hasAttribute('data-bui-v3-tokens'),color:getComputedStyle(b).backgroundColor,asset:[...document.styleSheets].some(s=>s.href?.includes('issue-418.opt-in.preview.css'))};})()");
 assert("Blazor Button plus opt-in CSS",initial.opted&&initial.asset&&!!initial.color,JSON.stringify(initial));
 const field=await cdp.js("(()=>{const f=document.querySelector('.v3-lab-field .bui-field'),input=document.querySelector('#v3-experiment-name');return f&&input&&{background:getComputedStyle(f).backgroundColor,border:getComputedStyle(f).borderTopColor};})()");
 assert("real Blazor TextField under alias bridge",field&&!!field.background&&!!field.border,JSON.stringify(field));
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Switch to dark'))?.click()");
 assert("interactive dark toggle",await until(()=>cdp.js("document.querySelector('.v3-lab-surface')?.dataset.buiTheme==='dark'"),"dark",26000));
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Switch to RTL'))?.click()");
 assert("interactive RTL toggle",await until(()=>cdp.js("document.querySelector('.v3-lab-surface')?.dir==='rtl'"),"rtl",26000));
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
 const normal=await cdp.js("getComputedStyle(document.querySelector('.v3-lab-surface')).getPropertyValue('--bui-v3-motion-duration-fast').trim()");
 assert("non-reduced duration 150ms",normal==="150ms",normal);
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Preview local overlay'))?.click()");
 const overlay=await until(()=>cdp.js("(()=>{const o=document.querySelector('.v3-lab-surface .bui-overlay');return o&&getComputedStyle(o).animationDuration;})()"),"real overlay",26000);
 assert("real Overlay reduced-motion",overlay.split(",").every(s=>s.trim()==="0s"),overlay);
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"forced-colors",value:"active"},{name:"prefers-reduced-motion",value:"reduce"}]});
 const forced=await cdp.js("(()=>{const c=getComputedStyle(document.querySelector('.v3-lab-surface'));return {enabled:matchMedia('(forced-colors: active)').matches,action:c.getPropertyValue('--bui-v3-action-background').trim(),focus:c.getPropertyValue('--bui-v3-border-focus').trim()};})()");
 assert("forced-colors aliases on real Blazor host",forced.enabled&&forced.action.toLowerCase()==="buttonface"&&forced.focus.toLowerCase()==="highlight",JSON.stringify(forced));
 await cdp.send("Emulation.setEmulatedMedia",{features:[]});
 await cdp.js("document.querySelector('.v3-lab-surface .bui-overlay')?.click()");
 await until(()=>cdp.js("!document.querySelector('.v3-lab-surface .bui-overlay')"),"dismiss overlay",24000);
 await cdp.js("document.querySelector('#v3-token-action')?.focus()");
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
 const keyboard=await cdp.js("(()=>{const e=document.activeElement;return {id:e.id,visible:e.matches(':focus-visible'),inHost:!!e.closest('.v3-lab-surface'),outline:getComputedStyle(e).outlineWidth};})()");
 assert("keyboard Tab focus-visible in opt-in host",keyboard.inHost&&keyboard.visible&&parseFloat(keyboard.outline)>=2,JSON.stringify(keyboard));
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Show service-hosted dialog'))?.click()");
 const portal=await until(()=>cdp.js("(()=>{const x=document.querySelector('.dialog-wrapper');return x&&{outside:!x.closest('[data-bui-v3-tokens]'),ancestor:x.closest('[data-bui-theme]')?.dataset.buiTheme,lab:document.querySelector('.v3-lab-surface').dataset.buiTheme};})()"),"real service dialog",24000);
 assert("D2 global Dialog theme gap reproduced",portal.outside&&portal.lab==="dark"&&portal.ancestor!=="dark",JSON.stringify(portal));
 console.log(JSON.stringify({classification:"actual Blazor WebAssembly Chrome/CDP interaction",checks,errors,limits:"not full keyboard, AT, zoom or native OS certification"},null,2));
 if(errors.length)process.exitCode=1;
}catch(e){console.error("Probe error: "+String(e));if(cdp){try{console.error("Browser state: "+JSON.stringify(await cdp.js("({url:location.href,title:document.title,text:document.body?.innerText?.slice(0,1400),buttons:[...document.querySelectorAll(\"button\")].map(x=>({id:x.id,text:x.innerText})).slice(0,15)})")));}catch{}}console.error(JSON.stringify({checks,errors,events:cdp?.events?.slice(-12)},null,2));process.exitCode=1;}
finally{try{cdp?.close();}catch{}for(const p of children.reverse())if(p.pid&&p.exitCode===null){try{if(process.platform==="win32")execFileSync("taskkill",["/PID",String(p.pid),"/T","/F"],{stdio:"ignore",timeout:8000});else p.kill();}catch{try{p.kill();}catch{}}}try{rmSync(dir,{recursive:true,force:true});}catch{}}
