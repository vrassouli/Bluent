#!/usr/bin/env node
// #552 research: REAL isolated ASP.NET Core Blazor InteractiveServer and ElementReference.FocusAsync.
// NEVER imply original Bluent product passed these experiments.
import {spawn} from 'node:child_process';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {createServer} from 'node:net';
import {setTimeout as sleep} from 'node:timers/promises';
const engine=(process.argv[2]||'chrome').toLowerCase();
if(!['chrome','edge'].includes(engine))throw Error('chrome|edge expected');
const executable=engine==='chrome'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const root=resolve('.'),evidence=join(root,'docs/v3/quality/evidence');
const project=join(root,'scripts/quality/fixtures/blazor-focus-lab/Bluent.FocusLifecycleLab.csproj');
const profile=await mkdtemp(join(tmpdir(),'bluent552-blazor-focus-'));
let dotnet,browser,socket,sequence=0;
const pending=new Map(),records=[];
const port=()=>new Promise((ok,no)=>{const s=createServer();s.once('error',no);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>ok(p));});});
const poll=async(fn,timeoutMs=42000)=>{const end=Date.now()+timeoutMs;while(Date.now()<end){try{const r=await fn();if(r)return r}catch{}await sleep(175)}throw Error('Polling timeout');};
const call=(method,params={})=>new Promise((ok,no)=>{
 const id=++sequence,t=setTimeout(()=>{pending.delete(id);no(Error('CDP timeout '+method))},17000);
 pending.set(id,{ok:v=>{clearTimeout(t);ok(v)},no:e=>{clearTimeout(t);no(e)}});
 socket.send(JSON.stringify({id,method,params}));
});
const evaluate=async expr=>{
 const r=await call('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
 return r.result?.value;
};
const state=()=>evaluate('(()=>{const el=document.getElementById("result");return {status:el?.getAttribute("data-status")||null,focusCalls:Number(el?.getAttribute("data-focusasync-calls")||0),epoch:Number(el?.getAttribute("data-epoch")||0),active:document.activeElement?.id||null,trigger:!!document.getElementById("trigger"),target:!!document.getElementById("target"),popup:!!document.getElementById("popup"),direction:getComputedStyle(document.documentElement).direction,forced:matchMedia("(forced-colors: active)").matches,interactive:typeof Blazor!=="undefined"}})()');
const waitState=(wanted)=>poll(async()=>{const x=await state();return typeof wanted==='function'?wanted(x)?x:null:x.status===wanted?x:null},15000);
const mouseClick=async id=>{
 const box=await evaluate('(()=>{const el=document.getElementById('+JSON.stringify(id)+');if(!el)throw Error("No button: '+id+'");const b=el.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})()');
 await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:box.x,y:box.y});
 await call('Input.dispatchMouseEvent',{type:'mousePressed',x:box.x,y:box.y,button:'left',clickCount:1});
 await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:box.x,y:box.y,button:'left',clickCount:1});
};
const key=async(key,code,vk)=>{
 const p={key,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk};
 await call('Input.dispatchKeyEvent',{type:'keyDown',...p,...(key==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})});
 await call('Input.dispatchKeyEvent',{type:'keyUp',...p});await sleep(80);
};
const check=(condition,text,rec,actual)=>{
 const observed=actual&&typeof actual==='object'?{
  status:actual.status??null,active:actual.active??null,
  focusCalls:actual.focusCalls??null,target:actual.target??null,
  trigger:actual.trigger??null,popup:actual.popup??null
 }:null;
 rec.checks.push({name:text,pass:!!condition,...(observed?{observed}:{})});
 if(!condition)throw Error(engine+' '+rec.mode+' '+text+' '+JSON.stringify(actual));
};
const screenshot=async name=>{
 const file='BLUENT-BLAZOR-FOCUS-'+engine.toUpperCase()+'-'+name+'.png';
 const data=(await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true})).data;
 await writeFile(join(evidence,file),Buffer.from(data,'base64'));return file;
};
async function cleanup(c){
 if(!c?.pid)return;
 await new Promise(ok=>{const t=spawn('taskkill',['/PID',String(c.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});t.once('close',ok);t.once('error',ok);});
}
try{
 await mkdir(evidence,{recursive:true});
 const sitePort=await port(),cdpPort=await port();
 const base='http://127.0.0.1:'+sitePort;
 dotnet=spawn('dotnet',['run','--project',project,'-c','Debug','--no-build','--no-launch-profile','--urls',base],{stdio:'ignore',windowsHide:true,cwd:root});
 await poll(async()=>{const r=await fetch(base);return r.ok?true:false},50000);
 browser=spawn(executable,['--headless=new','--no-first-run','--disable-extensions','--remote-debugging-address=127.0.0.1','--remote-debugging-port='+cdpPort,'--user-data-dir='+profile,'--window-size=1080,900','about:blank'],{stdio:'ignore',windowsHide:true});
 const page=await poll(async()=>{const r=await fetch('http://127.0.0.1:'+cdpPort+'/json/list');const l=await r.json();return l.find(x=>x.type==='page'&&x.webSocketDebuggerUrl)});
 socket=new WebSocket(page.webSocketDebuggerUrl);
 await new Promise((ok,no)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',no,{once:true})});
 socket.addEventListener('message',message=>{
  const r=JSON.parse(message.data);
  if(!r.id)return;const p=pending.get(r.id);if(!p)return;pending.delete(r.id);
  if(r.error)p.no(Error(JSON.stringify(r.error)));else p.ok(r.result||{});
 });
 await call('Page.enable');await call('Runtime.enable');
 const version=await call('Browser.getVersion');
 for(const mode of [{name:'light-ltr',rtl:false,forced:false},{name:'dark-rtl',rtl:true,forced:false},{name:'forced-colors',rtl:false,forced:true}]){
  await call('Emulation.setEmulatedMedia',{features:mode.forced?[{name:'forced-colors',value:'active'},{name:'prefers-contrast',value:'more'}]:[]});
  await call('Page.navigate',{url:base+'/?mode='+mode.name});
  await poll(async()=>{const v=await state();return v.status==='ready'&&v.interactive});
  await sleep(850);
  await evaluate('document.documentElement.dir='+JSON.stringify(mode.rtl?'rtl':'ltr'));
  await evaluate('document.documentElement.style.colorScheme='+JSON.stringify(mode.rtl?'dark':'light'));
  const rec={mode:mode.name,checks:[],screenshots:[],states:[],host:'isolated .NET 10 Blazor InteractiveServer, NOT Bluent product'};
  const capture=async()=>{const s=await state();rec.states.push(s);return s};
  let s=await capture();
  check(s.interactive,'Blazor runtime loaded',rec,s);
  check(s.direction===(mode.rtl?'rtl':'ltr'),'document actual direction',rec,s);
  check(s.forced===mode.forced,'emulated forced-colors matches',rec,s);
  await mouseClick('queue');s=await waitState('queued');check(s.focusCalls===0,'queue does not directly call FocusAsync',rec,s);
  await mouseClick('apply');s=await waitState('focused-target');
  check(s.active==='target','real ElementReference.FocusAsync focused target',rec,s);
  check(s.focusCalls===1,'Blazor FocusAsync call count',rec,s);
  rec.screenshots.push(await screenshot(mode.name.toUpperCase()+'-FOCUSED'));
  await mouseClick('delay');await waitState('delay-pending');
  s=await waitState('delay-focused-target');
  check(s.active==='target','actual async delayed Blazor FocusAsync selects target',rec,s);
  check(s.focusCalls===2,'async FocusAsync actually called after await',rec,s);
  await mouseClick('delay');await waitState('delay-pending');
  await mouseClick('outside');s=await waitState('delay-canceled-owner');
  check(s.active==='outside','outside user focus survives delayed resume',rec,s);
  check(s.focusCalls===2,'async request canceled before FocusAsync after outside focus',rec,s);
  await mouseClick('queue');await waitState('queued');
  await mouseClick('apply-outside');s=await waitState('canceled-focus-owner');
  check(s.active==='apply-outside','outside owner prevents focus hijack',rec,s);
  check(s.focusCalls===2,'rejected outside focus request never invoked FocusAsync',rec,s);
  await mouseClick('queue');await waitState('queued');
  await mouseClick('remove');await waitState('target-removed');
  await mouseClick('apply');s=await waitState('canceled-stale-target');
  check(!s.target,'Razor actually unmounted target',rec,s);
  check(s.active!=='target','removed target never receives focus',rec,s);
  check(s.focusCalls===2,'stale request does not invoke FocusAsync',rec,s);
  await mouseClick('restore-target');s=await waitState('target-restored');
  check(s.target,'Razor rerender restored a target node',rec,s);
  await mouseClick('delay');await waitState('delay-pending');
  await mouseClick('remove');await waitState('target-removed');
  s=await waitState('delay-canceled-target');
  check(!s.target,'async delayed target is actually removed in Blazor',rec,s);
  check(s.active!=='target','async awaited FocusAsync never focuses removed target',rec,s);
  check(s.focusCalls===2,'async canceled stale target never calls FocusAsync',rec,s);
  await mouseClick('trigger');s=await waitState('popup-focused');
  check(s.active==='popup-item','OnAfterRenderAsync FocusAsync focused mounted popup',rec,s);
  check(s.focusCalls===3,'Blazor real postrender focus called',rec,s);
  await key('Escape','Escape',27);s=await waitState('restored-trigger');
  check(s.active==='trigger','Escape restores connected trigger via FocusAsync',rec,s);
  check(!s.popup,'popup is unmounted by Razor render',rec,s);
  check(s.focusCalls===4,'Blazor postrender restore FocusAsync called',rec,s);
  await mouseClick('trigger');await waitState('popup-focused');
  await mouseClick('close-outside');s=await waitState('closed-unowned');
  check(s.active==='close-outside','outside-close preserves unrelated user focus',rec,s);
  check(!s.popup,'outside-close unmounts popup',rec,s);
  await mouseClick('trigger');await waitState('popup-focused');
  await mouseClick('remove-trigger');await waitState('trigger-removed');
  await mouseClick('popup-item');await key('Escape','Escape',27);
  s=await waitState('closed-no-trigger');
  check(!s.trigger,'Razor unmounted trigger before close',rec,s);
  check(s.active!=='trigger','no stale FocusAsync to removed trigger',rec,s);
  check(!s.popup,'Escape closes popup with removed trigger',rec,s);
  rec.screenshots.push(await screenshot(mode.name.toUpperCase()+'-FINAL'));
  rec.states.push(s);records.push(rec);
  console.log(engine+' '+rec.mode+' checks='+rec.checks.length+' passed='+rec.checks.filter(c=>c.pass).length);
 }
 const file='BLUENT-BLAZOR-FOCUS-'+engine.toUpperCase()+'.json';
 await writeFile(join(evidence,file),JSON.stringify({issue:552,status:'isolated Blazor InteractiveServer actual ElementReference.FocusAsync; NOT Bluent component/Fluent/AT acceptance',browser:version.product,platform:'Windows',records},null,2)+'\n');
 console.log('BLAZOR REAL FOCUS SUMMARY '+engine+' '+records.reduce((n,r)=>n+r.checks.length,0)+' checks');
}catch(e){console.error('ERROR '+(e.stack||e));process.exitCode=1}
finally{
 try{socket?.close()}catch{}
 await cleanup(browser);await cleanup(dotnet);
 // Kill ONLY children with this unique disposable browser profile path.
 const quote=profile.replace(/'/g,"''");
 await new Promise(ok=>{
  const cleanupScript="$p='"+quote+"'; Get-CimInstance Win32_Process | Where-Object { $_.Name -in @('chrome.exe','msedge.exe') -and $_.CommandLine -and $_.CommandLine.Contains($p) } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }";
  const s=spawn('pwsh',['-NoProfile','-NonInteractive','-Command',cleanupScript],{stdio:'ignore',windowsHide:true});
  s.once('close',ok);s.once('error',ok);
 });
 await sleep(350);
 try{await rm(profile,{recursive:true,force:true,maxRetries:7,retryDelay:250})}catch(e){console.error('Browser temp cleanup failed '+e.message);process.exitCode=1}
}
