#!/usr/bin/env node
// #425 real mounted Blazor smoke; screenshots are evidence, not accepted visual parity.
import {spawn,execFileSync} from "node:child_process";
import {mkdtempSync,existsSync,readFileSync,writeFileSync,mkdirSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {inspectV3Png} from "./inspect_v3_png_evidence.mjs";
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
let app,browser,cdp;const checks=[],errors=[],browserStartupAttempts=[],cleanupAttempts=[],imageEvidence=[];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// CSS-computed text vs opaque host surface, narrow scoped test of contrast
// in THIS sample host; not universal WCAG or native OS/AT certification.
function headingHostContrast(foreground,background){
 const rgb=x=>{
  const n=String(x).match(/\d+(?:\.\d+)?/g)?.map(Number)||[];
  return n.length===3||n.length===4&&n[3]===1?n.slice(0,3):null;
 };
 const a=rgb(foreground),b=rgb(background);
 if(!a||!b)return 0;
 const lum=v=>v.map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4)
  .reduce((x,y,i)=>x+y*[.2126,.7152,.0722][i],0);
 const l1=lum(a),l2=lum(b);
 return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
}

function assert(label,value,notes){checks.push({label,pass:!!value,notes});if(!value)errors.push(label+" "+JSON.stringify(notes));}
function spawnTracked(cmd,args,cwd=root,env=process.env) {
 const p=spawn(cmd,args,{cwd,env,windowsHide:true,stdio:["ignore","pipe","pipe"]});
 let tail="";for(const stream of [p.stdout,p.stderr])stream.on("data",b=>tail=(tail+String(b)).slice(-6500));
 p.tail=()=>tail;
 // A missing executable or a rejected Windows process launch emits an async
 // "error" event. Preserve it as evidence instead of crashing before JSON.
 p.spawnError=null;
 p.on("error",e=>{p.spawnError=String(e);tail=(tail+" launch error: "+String(e)).slice(-6500);});
 return p;
}
// Chrome/Edge can relaunch or detach its Windows browser process while the
// original spawn() launcher exits with code 0. A child.kill() is insufficient:
// old headless processes then consume resources and block later DevTools ports.
// Clean ONLY this test invocation's generated temporary browser profiles.
function cleanupOwnedBrowserProcesses(profileRoot){
 if(process.platform!=="win32")return {supported:false};
 if(!profileRoot.includes("bluent-v3-425-"))
  throw Error("Refusing browser cleanup outside unique v3 #425 test profile");
 const ps=[
  "$root=$env:BLUENT_V3_425_OWNED_PROFILE",
  "if(-not $root -or $root.IndexOf('bluent-v3-425-') -lt 0){throw 'Unsafe browser cleanup scope'}",
  "$items=@(Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' OR Name='msedge.exe'\" |",
  "Where-Object { $_.CommandLine -and $_.CommandLine.IndexOf($root,[StringComparison]::OrdinalIgnoreCase) -ge 0 })",
  "$killed=0",
  "foreach($item in $items){try{Stop-Process -Id $item.ProcessId -Force -ErrorAction Stop;$killed++}catch{}}",
  "Start-Sleep -Milliseconds 250",
  "$remaining=@(Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' OR Name='msedge.exe'\" |",
  "Where-Object { $_.CommandLine -and $_.CommandLine.IndexOf($root,[StringComparison]::OrdinalIgnoreCase) -ge 0 })",
  "Write-Output \"killed=$killed remaining=$($remaining.Count)\"",
  "if($remaining.Count -gt 0){exit 17}"
 ].join("\n");
 try{
  return {supported:true,output:execFileSync("powershell.exe",
   ["-NoProfile","-NonInteractive","-Command",ps],
   {env:{...process.env,BLUENT_V3_425_OWNED_PROFILE:profileRoot},
    windowsHide:true,encoding:"utf8",timeout:22000}).trim()};
 }catch(e){return {supported:true,error:String(e.stderr||e.message).slice(-2200)};}
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
  if(app.spawnError)return "HOST_SPAWN_FAILED";
  if(app.exitCode!==null)return "HOST_EXITED";
  return (await fetch(url,{signal:AbortSignal.timeout(1400)})).ok;
 },"published Blazor app");
 if(app.spawnError||app.exitCode!==null)
  throw Error("Published Blazor host did not start: "+app.tail());
 // A Windows hosted runner can intermittently fail to start a Chromium
 // DevTools port on its first launch. Retry ONLY browser startup (never test
 // assertions) with isolated profiles and retain every failure reason in JSON.
 // If all attempts fail the job still fails, closed and with diagnostics.
 let target=null;
 for(let attempt=1;attempt<=3;attempt++){
  const userData=join(work,"browser-"+attempt);
  const candidate=spawnTracked(browserPath,["--headless=new","--no-sandbox","--disable-gpu","--disable-extensions","--no-first-run",
   "--disable-background-networking","--remote-debugging-port=0","--remote-allow-origins=*",
   "--user-data-dir="+userData,"about:blank"]);
  try{
   const port=await until(()=>{
    const f=join(userData,"DevToolsActivePort");
    if(existsSync(f))return readFileSync(f,"utf8").split(/\r?\n/)[0];
    if(candidate.spawnError)return "FAILED_TO_SPAWN";
    // Chrome on Windows can exit launcher 0 before its detached browser
    // writes DevToolsActivePort seconds later. Keep waiting on exit 0.
    if(candidate.exitCode!==null&&candidate.exitCode!==0)return "FAILED_NONZERO_EXIT";

    return null;
   },"CDP startup attempt "+attempt,33000);
   if(port==="FAILED_TO_SPAWN"||port==="FAILED_NONZERO_EXIT")
    throw Error("Browser launcher failed: "+candidate.tail());
   target=await until(async()=>{
    const list=await (await fetch("http://127.0.0.1:"+port+"/json/list",{signal:AbortSignal.timeout(1800)})).json();
    return list.find(x=>x.type==="page"&&x.webSocketDebuggerUrl);
   },"live CDP target attempt "+attempt,18000);
   browser=candidate;
   browserStartupAttempts.push({attempt,result:"connected"});
   break;
  }catch(e){
   browserStartupAttempts.push({
    attempt,result:"failed",reason:String(e),browserTail:candidate.tail(),
    spawnError:candidate.spawnError,exitCode:candidate.exitCode,
    hadDevToolsPort:existsSync(join(userData,"DevToolsActivePort"))
   });
   if(candidate.exitCode===null)candidate.kill();
   cleanupAttempts.push({phase:"failed-launch",attempt,...cleanupOwnedBrowserProcesses(userData)});
   await wait(700);
  }
 }
 if(!target)throw Error("All 3 actual Chromium DevTools startup attempts failed: "+
   JSON.stringify(browserStartupAttempts).slice(-6500));
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
 const tab=await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='Increment');return {left:document.activeElement?.id!=='compatibility-input',visible:document.activeElement?.getBoundingClientRect().width>0,incrementFocused:document.activeElement===b,focusVisible:b?.matches(':focus-visible')};})()");
 assert("keyboard Tab leaves input",tab.left&&tab.visible,tab);
 assert("keyboard Tab focuses actual Bluent Increment button",tab.incrementFocused,tab);
 assert("keyboard Tab enables native Button focus-visible modality",tab.focusVisible===true,tab);
 // Use genuine CDP keyboard events: keyDown must include text for Chromium's
 // native button Enter activation; JS .click() would conceal broken behavior.
 const enterBefore=await cdp.js("Number(document.querySelector('[data-testid=event-count]')?.textContent?.match(/\\d+/)?.[0]||-1)");
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Enter",code:"Enter",text:"\r",unmodifiedText:"\r",windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
 const enterAfter=await until(async()=>{const n=await cdp.js("Number(document.querySelector('[data-testid=event-count]')?.textContent?.match(/\\d+/)?.[0]||-1)");return n===enterBefore+1?n:null;},"real native Enter invokes one Blazor callback",9000);
 assert("Enter invokes actual Bluent Button callback exactly once",enterAfter===enterBefore+1,{enterBefore,enterAfter});
 // Pointer modality must first leave the keyboard-focused Button. A
 // mouse click on the *same already-keyboard-focused Button* may legitimately
 // retain focus-visible per browser heuristics; that is not a defect.
 await cdp.js("document.querySelector('label[for=compatibility-input]').scrollIntoView({block:'center',behavior:'instant'})");
 await wait(150);
 const labelHit=await cdp.js("(()=>{const l=document.querySelector('label[for=compatibility-input]'),r=l.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;return {x,y,hit:document.elementFromPoint(x,y)?.closest('label')===l}})()");
 assert("real pointer targets editable field label before Button",labelHit.hit===true,labelHit);
 if(!labelHit.hit)throw Error("Unsafe pointer target on field label");
 await cdp.send("Input.dispatchMouseEvent",{type:"mousePressed",button:"left",x:labelHit.x,y:labelHit.y,clickCount:1});
 await cdp.send("Input.dispatchMouseEvent",{type:"mouseReleased",button:"left",x:labelHit.x,y:labelHit.y,clickCount:1});
 const fieldPointerFocus=await cdp.js("document.activeElement?.id==='compatibility-input'");
 assert("pointer click transfers native focus to TextField",fieldPointerFocus);
 // A real pointer click must not inherit the old keyboard-only state.
 // Use hit testing to avoid navigating elsewhere after a scroll.
 await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='Increment');b.scrollIntoView({block:'center',behavior:'instant'})})()");
 await wait(200);
 const pointer=await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='Increment'),r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;return {x,y,hit:document.elementFromPoint(x,y)?.closest('button')===b}})()");
 assert("real pointer hit test targets Increment button",pointer.hit===true,pointer);
 if(!pointer.hit)throw Error("Unsafe pointer target in live keyboard QA");
 await cdp.send("Input.dispatchMouseEvent",{type:"mousePressed",button:"left",x:pointer.x,y:pointer.y,clickCount:1});
 await cdp.send("Input.dispatchMouseEvent",{type:"mouseReleased",button:"left",x:pointer.x,y:pointer.y,clickCount:1});
 const pointerAfter=await until(async()=>{const n=await cdp.js("Number(document.querySelector('[data-testid=event-count]')?.textContent?.match(/\\d+/)?.[0]||-1)");return n===enterBefore+2?n:null;},"real pointer Blazor callback",9000);
 const pointerModality=await cdp.js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='Increment');return {active:document.activeElement===b,focusVisible:b?.matches(':focus-visible')}})()");
 assert("real pointer activates Bluent Button exactly once",pointerAfter===enterBefore+2,{enterBefore,pointerAfter});
 assert("real pointer does not masquerade as keyboard Button focus-visible",pointerModality.active&&pointerModality.focusVisible===false,pointerModality);
 // Keep the later viewport/contrast screenshot grid independent of
 // scroll introduced by the keyboard/pointer fixture.
 await cdp.js("window.scrollTo({top:0,left:0,behavior:'instant'})");
 await wait(180);
 // Inspect the ACTUAL Chromium accessibility tree, not DOM attributes alone.
 // This baseline does not substitute for named screen-reader/OS AT testing.
 await cdp.send("Accessibility.enable");
 const ax=await cdp.send("Accessibility.getFullAXTree");
 const exposed=ax.nodes.filter(n=>!n.ignored).map(n=>({
  role:n.role?.value||"",name:n.name?.value||""
 }));
 const axButton=exposed.find(n=>n.role==="button"&&n.name==="Increment");
 const axField=exposed.find(n=>(n.role==="textbox"||n.role==="text field")&&n.name==="Bound value");
 // Connect the AX role to the exact counter DOM node by backendNodeId;
 // AX status nodes are allowed an empty computed name with text children.
 const documentNode=await cdp.send("DOM.getDocument",{depth:1});
 const counterDom=await cdp.send("DOM.querySelector",{nodeId:documentNode.root.nodeId,selector:"[data-testid=event-count]"});
 const counterDescription=await cdp.send("DOM.describeNode",{nodeId:counterDom.nodeId});
 const axStatus=ax.nodes.find(n=>!n.ignored&&n.backendDOMNodeId===counterDescription.node.backendNodeId&&n.role?.value==="status");
 assert("AX tree names real Increment button",!!axButton,
   {match:axButton||null,buttons:exposed.filter(n=>n.role==="button").slice(0,7)});
 assert("AX tree exposes TextField with Bound value accessible name",!!axField,
   {match:axField||null,textboxes:exposed.filter(n=>n.role.includes("text")).slice(0,8)});
 assert("AX tree maps live counter DOM node to status role",!!axStatus,
   {statusId:counterDescription.node.backendNodeId,matchedRole:axStatus?.role?.value||null});
 const screenshots=[[320,"light","ltr"],[320,"dark","rtl"],[768,"light","rtl"],[768,"dark","ltr"],[1280,"light","ltr"],[1280,"dark","rtl"]];
 for(const [width,theme,direction] of screenshots){
  await cdp.send("Emulation.setDeviceMetricsOverride",{width,height:820,deviceScaleFactor:1,mobile:false});
  const result=await cdp.js("(()=>{const h=document.documentElement;h.dataset.buiTheme='"+theme+"';h.dir='"+direction+"';"+
   "const title=document.querySelector('h1'),main=document.querySelector('main'),box=title?.getBoundingClientRect(),"+
   "link=document.querySelector('a[href=\"/compatibility/static\"]'),range=document.createRange();"+
   "if(title)range.selectNodeContents(title);"+
   "const rows=title?[...range.getClientRects()].map(r=>({top:r.top,bottom:r.bottom})):[];"+
   "return {w:innerWidth,dir:h.dir,theme:h.dataset.buiTheme,heading:!!title,main:!!main,"+
   "color:title?getComputedStyle(title).color:null,surface:main?getComputedStyle(main).backgroundColor:null,"+
   "linkColor:link?getComputedStyle(link).color:null,titleRows:rows,"+
   "headingBox:box?{x:box.x,y:box.y,w:box.width,h:box.height}:null};})()");
  assert("responsive "+width+" "+theme+" "+direction,result.w===width&&result.main&&result.heading&&result.dir===direction&&result.theme===theme,result);
  const ratio=headingHostContrast(result.color,result.surface),r=result.headingBox;
  assert("compatibility host foreground-to-surface contrast "+width+" "+theme+" "+direction,
    ratio>=4.5&&r&&r.x>=-1&&r.y>=-1&&r.x+r.w<=width+1&&r.y<820,
    {ratio,foreground:result.color,background:result.surface,rect:r});
  const linkRatio=headingHostContrast(result.linkColor,result.surface);
  assert("compatibility link text to host contrast "+width+" "+theme+" "+direction,
    linkRatio>=4.5,
    {ratio:linkRatio,foreground:result.linkColor,background:result.surface});
  const rows=(result.titleRows||[]).filter((row,i,list)=>list.findIndex(item=>Math.abs(item.top-row.top)<.5)===i);
  assert("multiline mobile heading does not overlap "+width+" "+theme+" "+direction,
    rows.length>=1&&rows.every((row,i)=>i===0||row.top>=rows[i-1].bottom-.8),
    {rows});
  await wait(150);
  const shot=await cdp.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
  const filename=mode.toLowerCase()+"-"+browserName+"-"+width+"-"+theme+"-"+direction+".png";
  const bytes=Buffer.from(shot.data,"base64");
  writeFileSync(join(dest,filename),bytes);
  // Validate actual PNG pixels, not just a screenshot name or CDP success.
  // This is artifact integrity only; not human accepted Penpot/pixel parity.
  const inspection=inspectV3Png(bytes,{width,height:820});
  imageEvidence.push({filename,theme,direction,...inspection});
  assert("PNG evidence integrity "+width+" "+theme+" "+direction,
    inspection.uniqueSampleColors>=4,inspection);
 }
 // #425 REAL CSS text-scaling reflow. This is NOT browser zoom or
 // system text scaling; the test never changes global Windows settings.
 const originalRootSize=await cdp.js("document.documentElement.style.fontSize");
 try{
  for(const percent of [200,400]){
   await cdp.send("Emulation.setDeviceMetricsOverride",
     {width:320,height:820,deviceScaleFactor:1,mobile:false});
   const result=await cdp.js("(()=>{document.documentElement.style.fontSize='"+percent+"%';"+
     "const sel=['h1','#compatibility-input','[data-testid=event-count]',"+
     "'a','[data-testid=popover-trigger]','[data-testid=tooltip-trigger]'];"+
     "const elements=sel.map(name=>{const e=document.querySelector(name),r=e?.getBoundingClientRect();"+
     "return {name,exists:!!e,x:r?.x,right:r?.right,width:r?.width};});"+
     "return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,"+
     "rootFontSize:getComputedStyle(document.documentElement).fontSize,elements};})()");
   const reflow=result.viewport===320&&result.scrollWidth<=321&&
     result.elements.every(e=>e.exists&&e.width>0&&e.x>=-1&&e.right<=321);
   assert("CSS 200/400 percent text scaling no horizontal clipping "+percent,reflow,result);
  }
 }finally{
  await cdp.js("document.documentElement.style.fontSize="+JSON.stringify(originalRootSize));
  await cdp.send("Emulation.setDeviceMetricsOverride",
    {width:1280,height:820,deviceScaleFactor:1,mobile:false});
 }
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"forced-colors",value:"active"},{name:"prefers-reduced-motion",value:"reduce"}]});
 const media=await cdp.js("(()=>({forced:matchMedia('(forced-colors: active)').matches,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches}))()");
 assert("forced-colors/reduced-motion emulation",media.forced&&media.reduced,media);
 const contrastShot=await cdp.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
 const contrastFilename=mode.toLowerCase()+"-"+browserName+"-rtl-emulated-contrast.png";
 const contrastBytes=Buffer.from(contrastShot.data,"base64");
 writeFileSync(join(dest,contrastFilename),contrastBytes);
 const contrastEvidence=inspectV3Png(contrastBytes,{width:1280,height:820});
 imageEvidence.push({filename:contrastFilename,theme:"dark",direction:"rtl",
   emulatedForcedColors:true,emulatedReducedMotion:true,...contrastEvidence});
 assert("browser-emulated contrast PNG evidence integrity",contrastEvidence.uniqueSampleColors>=4,contrastEvidence);
 assert("7 distinct screenshots captured for intended scenarios",
   imageEvidence.length===7&&new Set(imageEvidence.map(x=>x.sha256)).size===7,
   {count:imageEvidence.length,unique:new Set(imageEvidence.map(x=>x.sha256)).size});
 // #425 NATIVE browser site zoom, not CSS root font scaling or CDP emulated
 // viewport. Launch two dedicated Chromium profiles with persisted per-host
 // zoom preferences and run the same actual published Blazor component page.
 // Any settled horizontal document overflow (including a Chart.js canvas)
 // remains a HARD failure. Two extra PNGs and JSON per real browser mode.
 try{
  const nativeZoomLog=execFileSync(process.execPath,
   ["scripts/quality/probe_v3_native_site_zoom.mjs"],
   {cwd:root,env:{...process.env,
     BLUENT_V3_ZOOM_APP_URL:url,
     BLUENT_V3_ZOOM_EVIDENCE_DIR:dest,
     BLUENT_V3_BROWSER_NAME:browserName},
    windowsHide:true,encoding:"utf8",timeout:180000,maxBuffer:1024*1024});
  console.log(nativeZoomLog.trim());
  const zoom=JSON.parse(readFileSync(join(dest,"native-site-zoom-"+browserName+"-"+mode+".json"),"utf8"));
  for(const entry of zoom.results||[]){
   for(const test of entry.checks||[]){
    assert("native site zoom "+entry.factor+"00%: "+test.name,test.pass,test.detail);
   }
  }
  assert("actual Chromium 200/400 native zoom has two PNGs and no settled overflow",
    zoom.results?.length===2&&zoom.results.every(x=>x.screenshot?.png&&x.screenshot?.bytes>1000&&x.documentOverflowPx<=1&&x.cleanup?.includes("remaining=0")),
    {results:zoom.results?.map(x=>({factor:x.factor,screenshot:x.screenshot,overflow:x.documentOverflowPx,cleanup:x.cleanup})),errors:zoom.errors});
 }catch(e){
  errors.push("Native site zoom runner failed: "+String(e.stderr||e.message).slice(-3800));
 }

} catch(e){errors.push(String(e.stack||e));}
finally{
 writeFileSync(join(dest,mode.toLowerCase()+"-"+browserName+".json"),
  JSON.stringify({schema:1,mode,browser:browserName,commit:process.env.GITHUB_SHA||"local",browserStartupAttempts,imageEvidence,checks,errors},null,2));
 cdp?.close();
 for(const p of [browser,app])if(p&&p.exitCode===null)p.kill();
 cleanupAttempts.push({phase:"final",...cleanupOwnedBrowserProcesses(work)});
 const cleanupError=cleanupAttempts.find(x=>x.error);
 if(cleanupError)errors.push("Owned browser cleanup failed: "+JSON.stringify(cleanupError));
 // Write again to preserve actual cleanup evidence, not just test assertions.
 writeFileSync(join(dest,mode.toLowerCase()+"-"+browserName+".json"),
  JSON.stringify({schema:1,mode,browser:browserName,commit:process.env.GITHUB_SHA||"local",
   browserStartupAttempts,cleanupAttempts,imageEvidence,checks,errors},null,2));
 try{rmSync(work,{recursive:true,force:true,maxRetries:4,retryDelay:300});}catch{}
 console.log("Blazor "+mode+" "+browserName+": "+checks.filter(x=>x.pass).length+"/"+checks.length+" checks, "+errors.length+" errors");
 for(const error of errors)console.error("FAIL",error);
}
if(errors.length)process.exitCode=1;
