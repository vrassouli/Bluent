#!/usr/bin/env node
// #418 transparent focus research: real Chromium CDP computed CSS, not raster pixels.
import {spawn,execFileSync} from "node:child_process";
import {mkdtempSync,readFileSync,writeFileSync,existsSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
const root=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const browser=process.env.CHROME_PATH;
if(!browser||!existsSync(browser))throw Error("Real installed CHROME_PATH required");
const report=JSON.parse(execFileSync("python",["scripts/quality/audit_v3_focus_alpha_hosts.py"],{cwd:root,encoding:"utf8",windowsHide:true,timeout:18000,maxBuffer:500000}));
if(!report.passedResearchContract||report.entries!==80)throw Error("Source contract not ready");
const work=mkdtempSync(join(tmpdir(),"bluent-v3-418-alpha-cdp-")),profile=join(work,"profile");
const groups=new Map();
for(const c of report.cases){const id=c.brand+"/"+c.mode;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(c)}
let child,ws,id=0,count=0,cleanup="unverified";
const errors=[],pending=new Map(),wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,ms=30000){const end=Date.now()+ms;let last;while(Date.now()<end){try{const v=await fn();if(v)return v}catch(e){last=String(e)}await wait(170)}throw Error("Timeout "+label+" "+last)}
function send(method,params={}){const n=++id;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(n);reject(Error("CDP timeout "+method))},14000);pending.set(n,{resolve,reject,timer});ws.send(JSON.stringify({id:n,method,params}))})}
async function js(expr){const v=await send("Runtime.evaluate",{expression:expr,returnByValue:true,awaitPromise:true});if(v.exceptionDetails)throw Error(v.exceptionDetails.text);return v.result?.value}
function rgb(x){if(!/^#[0-9A-Fa-f]{6}$/.test(x))throw Error("not opaque source hex");return "rgb("+[1,3,5].map(i=>parseInt(x.slice(i,i+2),16)).join(", ")+")"}
function clean(){
 if(process.platform!=="win32"){child?.kill();return "remaining=0 (non-Windows launcher)";}
 if(!work.includes("bluent-v3-418-alpha-cdp-"))throw Error("unsafe cleanup");
 const ps=[
 "$root=$env:BLUENT_ALPHA_OWNED",
 "if(-not $root -or $root.IndexOf('bluent-v3-418-alpha-cdp-') -lt 0){throw 'Bad cleanup scope'}",
 "$p=@(Get-CimInstance Win32_Process | Where-Object {($_.Name -eq 'chrome.exe' -or $_.Name -eq 'msedge.exe') -and $_.CommandLine -and $_.CommandLine.IndexOf($root,[StringComparison]::OrdinalIgnoreCase) -ge 0})",
 "foreach($x in $p){Stop-Process -Id $x.ProcessId -Force -ErrorAction SilentlyContinue}",
 "Start-Sleep -Milliseconds 200",
 "$remain=@(Get-CimInstance Win32_Process | Where-Object {($_.Name -eq 'chrome.exe' -or $_.Name -eq 'msedge.exe') -and $_.CommandLine -and $_.CommandLine.IndexOf($root,[StringComparison]::OrdinalIgnoreCase) -ge 0})",
 "Write-Output ('remaining='+$remain.Count)",
 "if($remain.Count){exit 17}"
 ].join("\n");
 return execFileSync("powershell.exe",["-NoProfile","-NonInteractive","-Command",ps],{env:{...process.env,BLUENT_ALPHA_OWNED:work},encoding:"utf8",windowsHide:true,timeout:19000}).trim();
}
try{
 child=spawn(browser,["--headless=new","--no-sandbox","--disable-gpu","--disable-extensions","--no-first-run","--remote-debugging-port=0","--remote-allow-origins=*","--user-data-dir="+profile,"about:blank"],{windowsHide:true,stdio:"ignore"});
 const port=await until(()=>{const f=join(profile,"DevToolsActivePort");return existsSync(f)?readFileSync(f,"utf8").split(/\r?\n/)[0]:null},"browser launch",36000);
 const tabs=await(await fetch("http://127.0.0.1:"+port+"/json/list")).json();
 ws=new WebSocket(tabs.find(t=>t.type==="page").webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true})});
 ws.addEventListener("message",e=>{const x=JSON.parse(String(e.data)),p=pending.get(x.id);if(!p)return;pending.delete(x.id);clearTimeout(p.timer);x.error?p.reject(Error(JSON.stringify(x.error))):p.resolve(x.result||{})});
 await send("Page.enable");await send("Runtime.enable");
 for(const [name,cases] of groups){
  const [brand,mode]=name.split("/");
  const css=readFileSync(join(root,"src/Bluent.UI/Styles/Themes/theme-"+brand+"-"+mode+".css"),"utf8");
  const items=cases.map((c,i)=>'<section style="background:var('+c.underlayToken+')"><div class="alpha" style="background:var('+c.overlayToken+')">Focus fixture '+i+'</div></section>').join("");
  const path=join(work,"sample-"+brand+"-"+mode+".html");
  const script='document.getElementById("alpha-data").textContent=JSON.stringify([...document.querySelectorAll(".alpha")].map(e=>({overlay:getComputedStyle(e).backgroundColor,underlay:getComputedStyle(e.parentElement).backgroundColor})))';
  writeFileSync(path,'<!doctype html><html><head><meta charset="utf-8"><style>'+css+'</style></head><body data-bui-theme="'+mode+'">'+items+'<output id="alpha-data">pending</output><script>'+script+'</script></body></html>');
  const link=pathToFileURL(path).href;await send("Page.navigate",{url:link});
  const seen=await until(()=>js("(()=>location.href==="+JSON.stringify(link)+"&&document.querySelector('#alpha-data')?.textContent!=='pending'?JSON.parse(document.querySelector('#alpha-data').textContent):null)()"),name,18000);
  if(seen.length!==4)throw Error("Expected four real computed records for "+name);
  for(let i=0;i<seen.length;i++){
   if(seen[i].overlay!==cases[i].overlayRgba||seen[i].underlay!==rgb(cases[i].underlayColor))
    errors.push({name,i,actual:seen[i],expected:cases[i]});
   count++;
  }
 }
}catch(e){errors.push({fatal:String(e.stack||e)})}
finally{
 try{ws?.close();cleanup=clean()}catch(e){errors.push({cleanup:String(e)})}
 try{rmSync(work,{recursive:true,force:true,maxRetries:4,retryDelay:250})}catch(e){errors.push({profileDeletion:String(e)})}
}
const actualBrowser=browser.toLowerCase().includes("msedge")?"Edge":"Chrome";
const result={browser:actualBrowser,passed:count===80&&errors.length===0&&cleanup.includes("remaining=0"),checked:count,expected:80,dualUnsafeLight:report.dualFailureByMode.light,cleanup,errors,scope:"Real Chrome computed CSS only, not raster pixels/native OS or WCAG certification"};
console.log("ALPHA_CHROMIUM_CDP "+JSON.stringify(result));
if(!result.passed)process.exitCode=1;
