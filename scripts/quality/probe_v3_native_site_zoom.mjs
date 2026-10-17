// #425: REAL native Chromium per-site zoom evidence on a published Bluent host.
// Distinct from CSS font-size and DevTools device-metrics simulation.
// This quality probe fails on actual SETTLED page overflow (including #486).
import {spawn,execFileSync} from "node:child_process";
import {mkdtempSync,mkdirSync,writeFileSync,existsSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const browserPath=process.env.CHROME_PATH;
const url=process.env.BLUENT_V3_ZOOM_APP_URL;
if(!browserPath||!existsSync(browserPath))throw Error("Provide real installed CHROME_PATH");
if(!url||!/^http:\/\/127\.0\.0\.1:\d+\/compatibility\/(server|webassembly)$/.test(url))
 throw Error("Provide BLUENT_V3_ZOOM_APP_URL pointing to local published /compatibility/server");
const outputDir=resolve(process.env.BLUENT_V3_ZOOM_EVIDENCE_DIR||join(root,"artifacts/v3-native-zoom-evidence"));
mkdirSync(outputDir,{recursive:true});
const work=mkdtempSync(join(tmpdir(),"bluent-v3-425-native-zoom-"));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const results=[],failures=[];
const appHost="127.0.0.1";
const renderMode=url.endsWith("/server")?"Server":"WASM";
class CDP{
 constructor(wsUrl){this.ws=new WebSocket(wsUrl);this.id=0;this.waiting=new Map();}
 async open(){
  await new Promise((ok,err)=>{this.ws.addEventListener("open",ok,{once:true});this.ws.addEventListener("error",err,{once:true});});
  this.ws.addEventListener("message",event=>{
   const msg=JSON.parse(String(event.data)),p=this.waiting.get(msg.id);
   if(!p)return;clearTimeout(p.timer);this.waiting.delete(msg.id);
   msg.error?p.reject(Error(JSON.stringify(msg.error))):p.resolve(msg.result||{});
  });
 }
 send(method,params={}){
  const id=++this.id;
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{this.waiting.delete(id);reject(Error("CDP timeout "+method));},12000);
   this.waiting.set(id,{resolve,reject,timer});
   this.ws.send(JSON.stringify({id,method,params}));
  });
 }
 async js(expression){
  const r=await this.send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
  if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));
  return r.result?.value;
 }
 close(){this.ws?.close();}
}
async function until(fn,description,limit=20000){
 const deadline=Date.now()+limit;let last="";
 while(Date.now()<deadline){try{const value=await fn();if(value)return value;}catch(e){last=String(e);}await wait(250);}
 throw Error("Timed out "+description+" "+last);
}
function cleanupOwned(profileRoot){
 if(process.platform!=="win32")return {supported:false};
 if(!profileRoot.includes("bluent-v3-425-native-zoom-"))
  throw Error("Unsafe unscoped Chromium cleanup attempted");
 const code=[
  "$root=$env:BLUENT_V3_ZOOM_OWNED",
  "if(-not $root -or $root.IndexOf('bluent-v3-425-native-zoom-') -lt 0){throw 'Unsafe profile'}",
  "$items=@(Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' OR Name='msedge.exe'\" | Where-Object { $_.CommandLine -and $_.CommandLine.IndexOf($root,[StringComparison]::OrdinalIgnoreCase) -ge 0 })",
  "$killed=0",
  "foreach($item in $items){try{Stop-Process -Id $item.ProcessId -Force -ErrorAction Stop;$killed++}catch{}}",
  "Start-Sleep -Milliseconds 350",
  "$left=@(Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' OR Name='msedge.exe'\" | Where-Object { $_.CommandLine -and $_.CommandLine.IndexOf($root,[StringComparison]::OrdinalIgnoreCase) -ge 0 })",
  "Write-Output \"killed=$killed remaining=$($left.Count)\"",
  "if($left.Count -gt 0){exit 17}"
 ].join("\n");
 return execFileSync("powershell.exe",["-NoProfile","-NonInteractive","-Command",code],
  {env:{...process.env,BLUENT_V3_ZOOM_OWNED:profileRoot},
   windowsHide:true,encoding:"utf8",timeout:23000}).trim();
}
const metricExpr="(()=>{const sels=['h1','#compatibility-input','[data-testid=event-count]','[data-testid=popover-trigger]'];const items=sels.map(selector=>{const e=document.querySelector(selector),r=e?.getBoundingClientRect();return {selector,exists:!!e,left:r?.left,right:r?.right,width:r?.width}});const offenders=[...document.querySelectorAll('body *')].map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,id:e.id,cls:String(e.className?.baseVal??e.className??'').slice(0,75),left:r.left,right:r.right,width:r.width}}).filter(x=>x.right>innerWidth+.5||x.left<-.5).slice(0,15);return {devicePixelRatio,viewportWidth:innerWidth,documentScrollWidth:document.documentElement.scrollWidth,rootFont:getComputedStyle(document.documentElement).fontSize,blazorReady:!!window.Blazor,items,offenders}})()";
for(const factor of [2,4]){
 const folder=join(work,"zoom-"+factor),profile=join(folder,"profile");
 mkdirSync(join(profile,"Default"),{recursive:true});
 // This native Chromium per-host preference schema was confirmed
 // from a real Zoom 200% in a disposable Chrome profile. It is
 // actual saved per-site zoom rather than a device-scale override.
 const nativeZoomLevel=Math.log(factor)/Math.log(1.2);
 const preferences={partition:{per_host_zoom_levels:{x:{[appHost]:{
   last_modified:String(Math.trunc(Date.now()*10000+116444736000000000)),
   zoom_level:nativeZoomLevel
 }}}}};
 writeFileSync(join(profile,"Default","Preferences"),JSON.stringify(preferences));
 const record={factor,mode:"native-Chromium-profile-site-zoom",browser:process.env.BLUENT_V3_BROWSER_NAME||"local",url,profile:folder,checks:[],errors:[]};
 const check=(name,pass,detail)=>{record.checks.push({name,pass:!!pass,detail});if(!pass)record.errors.push(name+": "+JSON.stringify(detail));};
 let browser,cdp;
 try{
  browser=spawn(browserPath,[
   "--headless=new","--no-sandbox","--disable-gpu","--disable-extensions",
   "--no-first-run","--disable-background-networking",
   "--remote-debugging-port=0","--remote-allow-origins=*",
   "--window-size=1280,820","--user-data-dir="+profile,url
  ],{windowsHide:true,stdio:"ignore"});
  let launchError=null;browser.on("error",e=>launchError=String(e));
  const port=await until(()=>{
   const f=join(profile,"DevToolsActivePort");
   if(launchError)throw Error(launchError);
   if(browser.exitCode!==null&&browser.exitCode!==0)throw Error("Browser launcher exited "+browser.exitCode);
   return existsSync(f)?readFileSync(f,"utf8").split(/\r?\n/)[0]:null;
  },"native zoom browser startup",45000);
  const target=await until(async()=>{
   const tabs=await (await fetch("http://127.0.0.1:"+port+"/json/list",{signal:AbortSignal.timeout(1500)})).json();
   return tabs.find(t=>t.type==="page"&&t.url===url&&t.webSocketDebuggerUrl);
  },"actual Bluent target",25000);
  cdp=new CDP(target.webSocketDebuggerUrl);await cdp.open();
  await cdp.send("Page.enable");
  let state=await until(async()=>{
   const v=await cdp.js(metricExpr);
   return v?.blazorReady&&v.items.every(e=>e.exists)?v:null;
  },"interactive published Bluent app at site zoom",50000);
  record.initialMetrics=state;
  // Native zoom affects Chart.js canvas sizing after Blazor hydration.
  // Its initial intrinsic canvas box is often 300px before ResizeObserver
  // settles. Preserve the early snapshot, then verify real settled layout.
  await wait(1800);
  state=await cdp.js(metricExpr);
  await wait(600);
  const second=await cdp.js(metricExpr);
  if(second.documentScrollWidth!==state.documentScrollWidth){
   await wait(1200);
   state=await cdp.js(metricExpr);
  }else state=second;
  record.metrics=state;
  record.earlyOverflowPx=Math.max(0,record.initialMetrics.documentScrollWidth-record.initialMetrics.viewportWidth);
  check("native browser persisted site zoom applied to device pixel ratio",
   Math.abs(state.devicePixelRatio-factor)<.05,
   {actual:state.devicePixelRatio,factor,nativeZoomLevel});
  check("required real Bluent controls remain horizontally in zoom viewport",
   state.items.every(e=>e.exists&&e.width>0&&e.left>=-1&&e.right<=state.viewportWidth+1),
   state.items);
  // Chart.js may initially expose its intrinsic 300px canvas while loading.
  // Only the settled state is a fail-closed page-overflow verdict. #486
  // retains the transient sizing investigation and future regression route.
  const overflow=Math.max(0,state.documentScrollWidth-state.viewportWidth);
  record.documentOverflowPx=overflow;
  record.knownIssue=overflow>1?"#486 investigate SETTLED Chart.js canvas overflow":"none";
  check("entire app document has no horizontal overflow at native site zoom",
   overflow<=1,
   {overflow,offenders:state.offenders,knownIssue:"#486"});
  const shot=await cdp.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
  const bytes=Buffer.from(shot.data,"base64");
  const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const width=png?bytes.readUInt32BE(16):0,height=png?bytes.readUInt32BE(20):0;
  const filename="native-zoom-"+factor+"00-"+record.browser+"-"+renderMode+".png";
  writeFileSync(join(outputDir,filename),bytes);
  record.screenshot={filename,png,width,height,bytes:bytes.length};
  // Screenshot physical-pixel width is a real browser measurement. Do not
  // assume Chrome and Edge reserve identical horizontal viewport margins.
  const expectedCssViewport=width/factor;
  check("site zoom shrinks CSS viewport without CSS font resizing",
   png&&Math.abs(state.viewportWidth-expectedCssViewport)<=1&&state.rootFont==="16px",
   {actual:state.viewportWidth,expectedCssViewport,rootFont:state.rootFont,pngWidth:width});
  check("actual native zoom viewport screenshot is a nonempty PNG",png&&width>100&&height>100&&bytes.length>1000,record.screenshot);
 }catch(e){record.errors.push(String(e.stack||e));}
 finally{
  cdp?.close();if(browser&&browser.exitCode===null)browser.kill();
  try{record.cleanup=cleanupOwned(folder);}catch(e){record.errors.push("Browser cleanup failed: "+String(e));}
  results.push(record);
 }
}
const summary={schema:1,renderMode,scope:"actual Chromium per-site zoom loaded before browser launch; fail on SETTLED document overflow; initial Chart.js width is separately recorded",source:"Chromium persisted per_host_zoom_levels",browser:process.env.BLUENT_V3_BROWSER_NAME||"local",results,errors:results.flatMap(r=>r.errors)};
const report=join(outputDir,"native-site-zoom-"+summary.browser+"-"+renderMode+".json");
writeFileSync(report,JSON.stringify(summary,null,2));
try{rmSync(work,{recursive:true,force:true,maxRetries:5,retryDelay:200});}catch(e){summary.errors.push("Temporary profile deletion: "+String(e));}
for(const r of results)console.log("NATIVE SITE ZOOM",summary.browser,r.factor+"00%",r.checks.filter(c=>c.pass).length+"/"+r.checks.length,
 "viewport="+r.metrics?.viewportWidth,"scroll="+r.metrics?.documentScrollWidth,
 "overflow="+r.documentOverflowPx,"cleanup="+r.cleanup,"errors="+r.errors.length);
console.log("NATIVE_SITE_ZOOM_EVIDENCE",report);
if(summary.errors.length){for(const e of summary.errors)console.error("NATIVE_ZOOM_FAILURE",e);process.exitCode=2;}
