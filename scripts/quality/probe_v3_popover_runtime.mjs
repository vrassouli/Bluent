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
   } catch(e){throw Error("SSR publish failed: "+String(e.stderr||e.message).slice(-3800));}
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
 await cdp.js("document.body.click()");
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
}catch(e){errors.push(String(e.stack||e));}
finally{
 writeFileSync(join(evidence,"popover-"+brand+".json"),JSON.stringify({schema:1,browser:brand,commit:process.env.GITHUB_SHA||"local",checks,errors},null,2));
 cdp?.close();for(const p of [browser,app])if(p&&p.exitCode===null)p.kill();
 try{rmSync(work,{recursive:true,force:true,maxRetries:4,retryDelay:350});}catch{}
 console.log("Real Popover "+brand+" "+mode+": "+checks.filter(x=>x.pass).length+"/"+checks.length+" checks; failures="+errors.length);
 for(const error of errors)console.error("FAIL",error);
}
if(errors.length)process.exitCode=1;
