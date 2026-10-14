#!/usr/bin/env node
// #418: isolated *real Blazor* forced-colors/reduced-motion contract.
// Run in a new browser process so emulation cannot contaminate the large CDP suite.
// Penpot source: Bluent v3 Design System / #418 page 32; reviewer preference:
// Button has keyboard focus ring; TextField has bottom underline, NOT outer ring.
// Emulation is browser CSS evidence, NOT native Windows High Contrast / AT certification.
import {spawn,spawnSync} from "node:child_process";
import {mkdtempSync,existsSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
const cwd=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const origin=process.env.BLUENT_V3_FORCED_ORIGIN||"http://127.0.0.1:5137";
const browserPath=process.env.CHROME_PATH||"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const dir=mkdtempSync(join(tmpdir(),"bluent-v3-418-media-")),children=[],results=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function start(command,args,environment=process.env){
 const p=spawn(command,args,{cwd,env:environment,stdio:["ignore","pipe","pipe"],windowsHide:true});
 let tail="";for(const s of [p.stdout,p.stderr])s.on("data",v=>tail=(tail+String(v)).slice(-1500));
 p.tail=()=>tail;children.push(p);return p;
}
async function until(fn,label,ms=80000){
 const end=Date.now()+ms;let last="";
 while(Date.now()<end){try{const r=await fn();if(r)return r;}catch(e){last=String(e);}await sleep(300);}
 throw Error("Timed out "+label+": "+last);
}
function check(label,ok,observed){
 results.push({label,ok:!!ok,observed});
 if(!ok)throw Error(label+": "+JSON.stringify(observed));
}
class CDP {
 constructor(url){this.url=url;this.id=1;this.pending=new Map();}
 async connect(){
  this.ws=new WebSocket(this.url);
  await new Promise((resolve,reject)=>{this.ws.addEventListener("open",resolve,{once:true});this.ws.addEventListener("error",reject,{once:true});});
  this.ws.addEventListener("message",e=>{
   const r=JSON.parse(String(e.data)),p=this.pending.get(r.id);if(!p)return;
   clearTimeout(p.timer);this.pending.delete(r.id);r.error?p.reject(Error(JSON.stringify(r.error))):p.resolve(r.result||{});
  });
 }
 send(method,params={}){
  const id=this.id++;return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{this.pending.delete(id);reject(Error("CDP timeout "+method));},16000);
   this.pending.set(id,{resolve,reject,timer});this.ws.send(JSON.stringify({id,method,params}));
  });
 }
 async js(expr){
  const r=await this.send("Runtime.evaluate",{expression:expr,returnByValue:true,awaitPromise:true});
  if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result?.value;
 }
 close(){this.ws?.close();}
}
let cdp;
try{
 const app=start("dotnet",["run","--configuration","Debug","--no-build","--no-launch-profile","--project","src/Bluent.UI.Demo/Bluent.UI.Demo.csproj","--","--urls="+origin]);
 await until(async()=>{if(app.exitCode!==null)throw Error(app.tail());return (await fetch(origin+"/v3/styling-lab",{signal:AbortSignal.timeout(1500)})).ok;},"WASM Blazor styling lab");
 const browser=start(browserPath,["--headless=new","--disable-gpu","--disable-extensions","--no-first-run","--no-sandbox","--remote-debugging-port=0","--remote-allow-origins=*","--user-data-dir="+dir,"about:blank"]);
 const port=await until(()=>{if(browser.exitCode!==null)throw Error(browser.tail());const p=join(dir,"DevToolsActivePort");return existsSync(p)?readFileSync(p,"utf8").split(/\r?\n/)[0]:null;},"browser debug port");
 const target=await until(async()=>{const r=await fetch("http://127.0.0.1:"+port+"/json/list");return (await r.json()).find(t=>t.type==="page"&&t.webSocketDebuggerUrl);},"browser page");
 cdp=new CDP(target.webSocketDebuggerUrl);await cdp.connect();await cdp.send("Page.enable");await cdp.send("Runtime.enable");
 await cdp.send("Page.navigate",{url:origin+"/v3/styling-lab"});
 await until(()=>cdp.js("!!(document.querySelector('.v3-lab-surface')&&document.getElementById('v3-experiment-name')&&document.getElementById('v3-fa-button'))"),"Blazor components mounted");
 await sleep(1500);
 for(const mode of ["light","dark"]){
  await cdp.send("Emulation.setEmulatedMedia",{features:[]});
  await cdp.js("document.querySelector('.v3-lab-surface').dataset.buiTheme='"+mode+"'; document.getElementById('v3-experiment-name').blur(); document.getElementById('v3-fa-button').blur();");
  await sleep(120);
  const baseline=await cdp.js("(()=>{const h=document.querySelector('.v3-lab-surface'),b=document.getElementById('v3-fa-button');return {forced:matchMedia('(forced-colors: active)').matches,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,mode:h.dataset.buiTheme,action:getComputedStyle(h).getPropertyValue('--bui-v3-action-background').trim(),faceWidth:b.getBoundingClientRect().width,faceHeight:b.getBoundingClientRect().height};})()");
  check(mode+" normal CSS media baseline",!baseline.forced&&baseline.mode===mode&&baseline.action.length>0,baseline);
  // Start from keyboard modality, not pointer focus.
  await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
  await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
  await cdp.js("document.getElementById('v3-fa-button').focus()");
  await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"forced-colors",value:"active"},{name:"prefers-reduced-motion",value:"reduce"}]});
  const button=await cdp.js("(()=>{const h=document.querySelector('.v3-lab-surface'),b=document.getElementById('v3-fa-button'),s=getComputedStyle(b),root=getComputedStyle(h),r=b.getBoundingClientRect();return {forced:matchMedia('(forced-colors: active)').matches,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,focused:document.activeElement===b,visible:b.matches(':focus-visible'),outline:s.outlineStyle,width:parseFloat(s.outlineWidth),color:s.outlineColor,action:root.getPropertyValue('--bui-v3-action-background').trim(),focus:root.getPropertyValue('--bui-v3-border-focus').trim(),motion:root.getPropertyValue('--bui-v3-motion-duration-fast').trim(),faceWidth:r.width,faceHeight:r.height};})()");
  check(mode+" browser media emulation activated",button.forced&&button.reduced,button);
  check(mode+" keyboard Button focus visible without layout shift",button.focused&&button.visible&&button.outline!=="none"&&button.width>=2&&button.faceWidth===baseline.faceWidth&&button.faceHeight===baseline.faceHeight,button);
  // Only assert system colors for the explicitly opted-in token overlay.
  check(mode+" forced system tokens and reduced motion",button.action==="ButtonFace"&&button.focus==="Highlight"&&button.motion==="0ms"&&button.color!=="rgba(0, 0, 0, 0)",button);
  await cdp.js("document.getElementById('v3-experiment-name').focus()");
  await sleep(200);
  const field=await cdp.js("(()=>{const i=document.getElementById('v3-experiment-name'),f=i.closest('.bui-field'),s=getComputedStyle(f),u=getComputedStyle(f,'::after');return {forced:matchMedia('(forced-colors: active)').matches,focused:document.activeElement===i,within:f.matches(':focus-within'),outline:s.outlineStyle,outlineWidth:parseFloat(s.outlineWidth),underlineStyle:u.borderBottomStyle,underlineWidth:parseFloat(u.borderBottomWidth),underlineColor:u.borderBottomColor,transform:u.transform};})()");
  check(mode+" focused TextField uses underline, never an extra outer ring",field.forced&&field.focused&&field.within&&(field.outline==="none"||field.outlineWidth===0)&&field.underlineStyle==="solid"&&field.underlineWidth>=2&&field.underlineColor!=="rgba(0, 0, 0, 0)"&&!field.transform.includes("matrix(0,"),field);
  await cdp.send("Emulation.setEmulatedMedia",{features:[]});
  await cdp.js("document.getElementById('v3-experiment-name').blur()");
  const reset=await cdp.js("(()=>{const h=document.querySelector('.v3-lab-surface'),b=document.getElementById('v3-fa-button');return {forced:matchMedia('(forced-colors: active)').matches,mode:h.dataset.buiTheme,action:getComputedStyle(h).getPropertyValue('--bui-v3-action-background').trim(),faceWidth:b.getBoundingClientRect().width,faceHeight:b.getBoundingClientRect().height};})()");
  check(mode+" forced colors reset without leaking into next scenario",!reset.forced&&reset.mode===mode&&reset.action===baseline.action&&reset.faceWidth===baseline.faceWidth&&reset.faceHeight===baseline.faceHeight,{baseline,reset});
 }
 console.log(JSON.stringify({scope:"Real Blazor WASM, isolated Chrome/Edge CDP emulation; NOT native OS/AT certification",checks:results.length,passed:results.filter(r=>r.ok).length,results},null,2));
}catch(e){console.error(JSON.stringify({failure:String(e),checks:results.length,results},null,2));process.exitCode=1;}
finally{
 try{await cdp?.send("Emulation.setEmulatedMedia",{features:[]});}catch{}
 cdp?.close();
 for(const p of children.reverse()){if(p.exitCode===null){p.kill();try{if(process.platform==="win32")spawnSync("taskkill",["/T","/F","/PID",String(p.pid)],{windowsHide:true,timeout:5000,stdio:"ignore"});}catch{}}}
 try{rmSync(dir,{force:true,recursive:true,maxRetries:4,retryDelay:300});}catch{}
}
