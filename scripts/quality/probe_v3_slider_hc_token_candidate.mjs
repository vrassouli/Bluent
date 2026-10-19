#!/usr/bin/env node
// #418+552 research-only forced colors opt-in, compiled Bluent CSS, all 10x2 themes.
import {spawn} from "node:child_process";
import {mkdtemp,readFile,writeFile,rm,mkdir} from "node:fs/promises";
import {resolve,join} from "node:path";
import {tmpdir} from "node:os";
import {pathToFileURL} from "node:url";
import {setTimeout as delay} from "node:timers/promises";
const root=resolve(import.meta.dirname,"../..");
const css=await readFile(join(root,"src/Bluent.UI/wwwroot/bluent.ui.components.css"),"utf8");
const candidate=await readFile(join(root,"docs/v3/tokens/issue-418-slider-forced-colors.opt-in.preview.css"),"utf8");
const brandNames=["default","excel","office","outlook","powerapps","powerbi","powerpoint","stream","teams","word"];
const browserExe=process.env.CHROME_PATH||"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browserName=/msedge/i.test(browserExe)?"Edge":"Chrome";
const work=await mkdtemp(join(tmpdir(),"bluent-v3-418-slider-hc-")),profile=join(work,"profile");
const results=[],errors=[],screenshots=[],pending=new Map();let browser,socket,serial=0,clean="unverified";
function requireValue(label,ok,detail){if(!ok){errors.push({label,detail});console.error("HC FAIL "+label+" "+JSON.stringify(detail))}}
const wait=async(fn,limit=30000)=>{const until=Date.now()+limit;while(Date.now()<until){try{const x=await fn();if(x)return x}catch{}await delay(190)}throw Error("Chrome wait timeout")};
function send(method,params={}){return new Promise((yes,no)=>{const id=++serial,t=setTimeout(()=>{pending.delete(id);no(Error("CDP "+method+" timeout"))},15000);pending.set(id,{yes:x=>{clearTimeout(t);yes(x)},no:e=>{clearTimeout(t);no(e)}});socket.send(JSON.stringify({id,method,params}))})}
async function js(code){const r=await send("Runtime.evaluate",{expression:code,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value}
const role=(family,scope,dir)=>{
 const body=family==="slider"?
  '<div class="bui-slider" style="width:300px;--thumb-size:20px;--progress:35%"><div class="rail"></div><div class="thumb"></div></div>':
  '<div class="bui-range-slider" style="width:300px;--thumb-size:20px;--min-progress:20%;--max-progress:80%"><div class="rail"></div><div class="thumb min-thumb"></div><div class="thumb max-thumb"></div></div>';
 const attrs=scope==="direct"?"data-bui-v3-slider-hc-proposal":"";
 const contents=scope==="nested"?'<div data-bui-v3-slider-hc-proposal>'+body+'</div>':body;
 return '<section class="tile" data-bui-v3-tokens '+attrs+' data-family="'+family+'" data-scope="'+scope+'" dir="'+dir+'" style="padding:12px;border:1px solid ButtonText">'+family+' '+scope+' '+dir+contents+'</section>';
};
const inspect="(()=>[...document.querySelectorAll('.tile')].map(t=>{const e=t.querySelector('.bui-slider,.bui-range-slider'),r=e.querySelector('.rail'),x=getComputedStyle(r),y=getComputedStyle(r,'::after'),z=r.getBoundingClientRect(),h=e.querySelector('.thumb').getBoundingClientRect();return {family:t.dataset.family,scope:t.dataset.scope,dir:t.dir,forced:matchMedia('(forced-colors: active)').matches,width:z.width,height:z.height,color:x.backgroundColor,gradient:x.backgroundImage,progressColor:y.backgroundColor,progressContent:y.content,progressLeft:y.left,progressWidth:y.width,thumbCenter:h.left+h.width/2-z.left,legacyBrand:getComputedStyle(e).getPropertyValue('--colorBrandBackground').trim()}}))()";
async function cleanup(){
 if(process.platform!=="win32"){browser?.kill();return "remaining=0 (non-Windows)";}
 const cmd="$p=$env:BLUENT_418_HC_DIR; if(-not $p -or -not $p.Contains('bluent-v3-418-slider-hc-')){throw 'unsafe'};"+
 "$x=@(Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' OR Name='msedge.exe'\" | Where-Object {$_.CommandLine -and $_.CommandLine.Contains($p)});"+
 "foreach($r in $x){Stop-Process -Id $r.ProcessId -Force -ErrorAction SilentlyContinue};"+
 "Start-Sleep -Milliseconds 300;"+
 "$q=@(Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' OR Name='msedge.exe'\" | Where-Object {$_.CommandLine -and $_.CommandLine.Contains($p)});"+
 "'remaining='+$q.Count;if($q.Count){exit 18}";
 const p=spawn("powershell.exe",["-NoProfile","-NonInteractive","-Command",cmd],{windowsHide:true,env:{...process.env,BLUENT_418_HC_DIR:work},stdio:["ignore","pipe","pipe"]});
 let txt="";p.stdout.on("data",x=>txt+=x.toString());
 const exit=await Promise.race([new Promise(ok=>p.once("close",ok)),delay(14000).then(()=>null)]);
 if(exit!==0)throw Error("scoped cleanup failed "+exit+" "+txt);
 return txt.trim();
}
try{
 browser=spawn(browserExe,["--headless=new","--no-sandbox","--disable-gpu","--disable-extensions","--no-first-run","--no-default-browser-check","--remote-debugging-port=0","--remote-allow-origins=*","--user-data-dir="+profile,"about:blank"],{stdio:"ignore",windowsHide:true});
 const port=await wait(async()=>+(await readFile(join(profile,"DevToolsActivePort"),"utf8")).split(/\r?\n/)[0],36000);
 const tabs=await(await fetch("http://127.0.0.1:"+port+"/json/list")).json();
 socket=new WebSocket(tabs.find(t=>t.type==="page"&&t.webSocketDebuggerUrl).webSocketDebuggerUrl);
 await new Promise((yes,no)=>{socket.addEventListener("open",yes,{once:true});socket.addEventListener("error",no,{once:true})});
 socket.addEventListener("message",event=>{const p=JSON.parse(event.data),w=pending.get(p.id);if(!w)return;pending.delete(p.id);p.error?w.no(Error(JSON.stringify(p.error))):w.yes(p.result||{})});
 await send("Page.enable");await send("Runtime.enable");
 await send("Emulation.setDeviceMetricsOverride",{width:1380,height:1080,deviceScaleFactor:1,mobile:false});
 for(const brand of brandNames)for(const mode of ["light","dark"]){
  const theme=await readFile(join(root,"src/Bluent.UI/Styles/Themes/theme-"+brand+"-"+mode+".css"),"utf8");
  const expectedBrand=(theme.match(/--colorBrandBackground:\s*(#[0-9A-Fa-f]{6})\s*;/)||[])[1];
  if(!expectedBrand)throw Error("Missing source brand token "+brand+"/"+mode);
  const tiles=[];
  for(const direction of ["ltr","rtl"])for(const family of ["slider","range"])for(const scope of ["none","direct","nested"])tiles.push(role(family,scope,direction));
  const path=join(work,"case-"+brand+"-"+mode+".html");
  const page='<!doctype html><html><head><meta charset="utf-8"><style>'+theme+'</style><style>'+css+'</style><style>'+candidate+'</style><style>body{margin:10px;background:Canvas;color:CanvasText;font:14px sans-serif}main{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.tile{min-height:100px;box-sizing:border-box}.bui-slider,.bui-range-slider{margin-top:18px}</style></head><body data-bui-theme="'+mode+'"><h1>HC '+brand+' '+mode+'</h1><main>'+tiles.join("")+'</main></body></html>';
  await writeFile(path,page,"utf8");const url=pathToFileURL(path).href;
  await send("Emulation.setEmulatedMedia",{features:[{name:"forced-colors",value:"active"}]});
  await send("Page.navigate",{url});
  await wait(()=>js("location.href==="+JSON.stringify(url)+"&&document.querySelectorAll('.tile').length===12"));
  const forced=await js(inspect);
  await send("Emulation.setEmulatedMedia",{features:[{name:"forced-colors",value:"none"}]});
  const normal=await js(inspect);
  for(let i=0;i<12;i++){
   const f=forced[i],n=normal[i],id=brand+"/"+mode+"/"+f.dir+"/"+f.family+"/"+f.scope;
   const opted=f.scope!=="none",expectedLeft=f.family==="slider"?0:60,expectedWidth=f.family==="slider"?105:180;
   requireValue(id+" media",f.forced&&!n.forced,f);
   requireValue(id+" source brand/mode actually inherited",f.legacyBrand.toLowerCase()===expectedBrand.toLowerCase()&&n.legacyBrand.toLowerCase()===expectedBrand.toLowerCase(),{brand,mode,actual:f.legacyBrand,expectedBrand});
   requireValue(id+" natural geometry",Math.abs(f.width-300)<1&&Math.abs(f.height-4)<1,f);
   requireValue(id+" normal gradient unaffected",n.gradient.includes("linear-gradient"),n);
   requireValue(id+" explicit opt-in",f.gradient==="none"&&(opted?f.color!=="rgba(0, 0, 0, 0)":f.color==="rgba(0, 0, 0, 0)"),f);
   if(opted){
    requireValue(id+" system-highlight paint",f.progressContent!=="none"&&f.progressColor!=="rgba(0, 0, 0, 0)",f);
    requireValue(id+" physical RTL/LTR thumb alignment",Math.abs(parseFloat(f.progressLeft)-expectedLeft)<1&&Math.abs(parseFloat(f.progressWidth)-expectedWidth)<1&&Math.abs(f.thumbCenter-(f.family==="slider"?105:60))<1,f);
   }
   results.push({brand,mode,forced:f,normal:n});
  }
  if(brand==="default"){
   await send("Emulation.setEmulatedMedia",{features:[{name:"forced-colors",value:"active"}]});
   const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true});
   const name="SLIDER-HC-"+browserName.toUpperCase()+"-"+mode.toUpperCase()+"-QA.png";
   const dst=join(root,"docs/v3/tokens/evidence");await mkdir(dst,{recursive:true});await writeFile(join(dst,name),Buffer.from(shot.data,"base64"));
   screenshots.push(name);
  }
  console.log("HC MODE "+browserName+" "+brand+"/"+mode+" 12 tiles inspected");
 }
}catch(e){errors.push({fatal:String(e.stack||e)});console.error("HC FATAL "+String(e.stack||e))}
finally{
 try{socket?.close()}catch{}
 try{clean=await cleanup()}catch(e){errors.push({cleanup:String(e)});browser?.kill()}
 try{await rm(work,{recursive:true,force:true,maxRetries:10,retryDelay:280})}catch(e){errors.push({temporaryFiles:String(e)})}
}
const report={issue:418,related:[442,443,552],browser:browserName,brands:10,modes:2,tiles:results.length,checks:results.reduce((n,r)=>n+(r.forced.scope==="none"?5:7),0),failureCount:errors.length,errors,cleanup:clean,screenshots,scope:"ACTUAL compiled source CSS + generated 20 brand theme files; static markup and Chromium forced-colors emulator only; not product, native OS AT or approved RTL",records:results};
const dest=join(root,"docs/v3/tokens/evidence");await mkdir(dest,{recursive:true});
await writeFile(join(dest,"SLIDER-HC-"+browserName.toUpperCase()+"-MATRIX.json"),JSON.stringify(report,null,2)+"\n");
console.log("HC SUMMARY "+JSON.stringify({browser:browserName,tiles:report.tiles,checks:report.checks,errors:errors.length,cleanup:clean,screenshots}));
if(errors.length||results.length!==240||!clean.includes("remaining=0"))process.exitCode=1;
