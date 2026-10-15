#!/usr/bin/env node
// #425 real mounted Blazor smoke; screenshots are evidence, not accepted visual parity.
import {spawn,execFileSync} from "node:child_process";
import {mkdtempSync,existsSync,readFileSync,writeFileSync,mkdirSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const mode=process.env.BLUENT_V3_RENDER_MODE||"Server";
if(!["Server","WASM"].includes(mode))throw Error("Expected Server or WASM");
const browserName=process.env.BLUENT_V3_BROWSER_NAME||"local";
const browserPath=process.env.CHROME_PATH;
if(!browserPath||!existsSync(browserPath))throw Error("Missing installed CHROME_PATH browser");
const work=mkdtempSync(join(tmpdir(),"bluent-v3-425-"));
const dest=resolve(process.env.BLUENT_V3_EVIDENCE_DIR||join(root,"artifacts/v3-browser-evidence"));
mkdirSync(dest,{recursive:true});
const host="http://127.0.0.1:"+(mode==="Server"?"5268":"5269");
const url=host+"/compatibility/"+(mode==="Server"?"server":"webassembly");
let app,browser,cdp;const checks=[],errors=[];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function assert(label,value,notes){checks.push({label,pass:!!value,notes});if(!value)errors.push(label+" "+JSON.stringify(notes));}
function spawnTracked(cmd,args,cwd=root,env=process.env) {
 const p=spawn(cmd,args,{cwd,env,windowsHide:true,stdio:["ignore","pipe","pipe"]});
 let tail="";for(const stream of [p.stdout,p.stderr])stream.on("data",b=>tail=(tail+String(b)).slice(-6500));
 p.tail=()=>tail;return p;
}
async function until(fn,label,ms=110000) {
 const end=Date.now()+ms;let last="";
 while(Date.now()<end){try{const r=await fn();if(r)return r;}catch(e){last=String(e);}await wait(300);}
 throw Error("Timeout "+label+" "+last);
}
class CDP {
 constructor(url){this.ws=new WebSocket(url);this.id=0;this.pending=new Map();}
 async open(){
  await new Promise((resolve,reject)=>{
   this.ws.addEventListener("open",resolve,{once:true});this.ws.addEventListener("error",reject,{once:true});
  });
  this.ws.addEventListener("message",event=>{
   const msg=JSON.parse(String(event.data)),p=this.pending.get(msg.id);
   if(!p)return;clearTimeout(p.timer);this.pending.delete(msg.id);
   msg.error?p.reject(Error(JSON.stringify(msg.error))):p.resolve(msg.result||{});
  });
 }
 send(method,params={}){
  const id=++this.id;
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{this.pending.delete(id);reject(Error("CDP timeout "+method));},20000);
   this.pending.set(id,{resolve,reject,timer});this.ws.send(JSON.stringify({id,method,params}));
  });
 }
 async js(expr){const x=await this.send("Runtime.evaluate",{expression:expr,returnByValue:true,awaitPromise:true});
  if(x.exceptionDetails)throw Error(JSON.stringify(x.exceptionDetails));
  return x.result?.value;
 }
 close(){this.ws?.close();}
}
try {
 const publish=join(work,"app");
 try {
  execFileSync("dotnet",["publish","src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj","-c","Release","--no-restore","--nologo","-v","quiet","--output",publish],
    {cwd:root,windowsHide:true,timeout:300000,stdio:"pipe"});
 } catch(e){throw Error("Publish failed "+String(e.stderr||e.message).slice(-4500));}
 app=spawnTracked("dotnet",["Bluent.UI.Demo.SSR.dll"],publish,
  {...process.env,ASPNETCORE_ENVIRONMENT:"Production",ASPNETCORE_URLS:host});
 await until(async()=>{
  if(app.exitCode!==null)throw Error("Host stopped "+app.tail());
  return (await fetch(url,{signal:AbortSignal.timeout(1400)})).ok;
 },"published Blazor app");
 const userData=join(work,"browser");
 browser=spawnTracked(browserPath,["--headless=new","--no-sandbox","--disable-gpu","--disable-extensions","--no-first-run",
  "--remote-debugging-port=0","--remote-allow-origins=*","--user-data-dir="+userData,"about:blank"]);
 const port=await until(()=>{
  const f=join(userData,"DevToolsActivePort");
  if(existsSync(f))return readFileSync(f,"utf8").split(/\r?\n/)[0];
  if(browser.exitCode!==null)throw Error("Browser launcher exited before DevTools port was written: "+browser.tail());
  return null;
 },"CDP startup",45000);
 const target=await until(async()=>{
  const list=await (await fetch("http://127.0.0.1:"+port+"/json/list")).json();
  return list.find(x=>x.type==="page"&&x.webSocketDebuggerUrl);
 },"CDP tab");
 cdp=new CDP(target.webSocketDebuggerUrl);
 await cdp.open();await cdp.send("Page.enable");await cdp.send("Runtime.enable");
 await cdp.send("Page.navigate",{url});
 await until(()=>cdp.js("(()=>{const p=document.querySelector('[data-testid=observed-renderer]');return !!(p&&p.textContent.includes('"+(mode==="Server"?"Server":"WebAssembly")+"')&&document.querySelector('#compatibility-input'));})()"),"Blazor mounted",90000);
 const initial=await cdp.js("(()=>({mode:document.querySelector('[data-testid=observed-renderer]')?.textContent,button:[...document.querySelectorAll('button')].some(x=>x.textContent.includes('Increment')),hasLabel:!!document.querySelector('label[for=compatibility-input]')}))()");
 assert("real renderer and Button",initial.mode?.includes(mode==="WASM"?"WebAssembly":mode)&&initial.button,initial);
 const clicked=await until(async()=>{
  const count=await cdp.js("document.querySelector('[data-testid=event-count]')?.textContent||''");
  if(count.includes("1"))return true;
  await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Increment'));b.click();return true;})()");
  return await cdp.js("document.querySelector('[data-testid=event-count]')?.textContent.includes('1')");
 },"real Blazor button callback",30000);
 assert("click changed real component state",clicked);
 const value=await cdp.js("(()=>{const x=document.querySelector('#compatibility-input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(x,'v3-qa');x.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:'v3-qa'}));return x.value;})()");
 const bound=await until(()=>cdp.js("document.querySelector('[data-testid=bound-value]')?.textContent.includes('v3-qa')"),"live bound field",17000);
 assert("two-way TextField binding",initial.hasLabel&&value==="v3-qa"&&bound);
 const focus=await cdp.js("(()=>{const x=document.querySelector('#compatibility-input');x.focus();return document.activeElement===x&&x.getBoundingClientRect().width>0;})()");
 assert("native input focus",focus);
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
 const tab=await cdp.js("(()=>({left:document.activeElement?.id!=='compatibility-input',visible:document.activeElement?.getBoundingClientRect().width>0}))()");
 assert("keyboard Tab leaves input",tab.left&&tab.visible,tab);
 const screenshots=[[320,"light","ltr"],[320,"dark","rtl"],[768,"light","rtl"],[768,"dark","ltr"],[1280,"light","ltr"],[1280,"dark","rtl"]];
 for(const [width,theme,direction] of screenshots){
  await cdp.send("Emulation.setDeviceMetricsOverride",{width,height:820,deviceScaleFactor:1,mobile:false});
  const result=await cdp.js("(()=>{const h=document.documentElement;h.dataset.buiTheme='"+theme+"';h.dir='"+direction+"';return {w:innerWidth,dir:h.dir,theme:h.dataset.buiTheme,heading:!!document.querySelector('h1'),main:!!document.querySelector('main')}})()");
  assert("responsive "+width+" "+theme+" "+direction,result.w===width&&result.main&&result.heading&&result.dir===direction&&result.theme===theme,result);
  await wait(150);
  const shot=await cdp.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
  writeFileSync(join(dest,mode.toLowerCase()+"-"+browserName+"-"+width+"-"+theme+"-"+direction+".png"),Buffer.from(shot.data,"base64"));
 }
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"forced-colors",value:"active"},{name:"prefers-reduced-motion",value:"reduce"}]});
 const media=await cdp.js("(()=>({forced:matchMedia('(forced-colors: active)').matches,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches}))()");
 assert("forced-colors/reduced-motion emulation",media.forced&&media.reduced,media);
} catch(e){errors.push(String(e.stack||e));}
finally{
 writeFileSync(join(dest,mode.toLowerCase()+"-"+browserName+".json"),
  JSON.stringify({schema:1,mode,browser:browserName,commit:process.env.GITHUB_SHA||"local",checks,errors},null,2));
 cdp?.close();
 for(const p of [browser,app])if(p&&p.exitCode===null)p.kill();
 try{rmSync(work,{recursive:true,force:true,maxRetries:4,retryDelay:300});}catch{}
 console.log("Blazor "+mode+" "+browserName+": "+checks.filter(x=>x.pass).length+"/"+checks.length+" checks, "+errors.length+" errors");
 for(const error of errors)console.error("FAIL",error);
}
if(errors.length)process.exitCode=1;
