#!/usr/bin/env node
// #552 Wave I native Chrome / Edge CDP, ISOLATED HTML experiment, NOT Bluent product QA.
import {spawn} from 'node:child_process';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createServer} from 'node:net';
import {setTimeout as sleep} from 'node:timers/promises';
const engine=(process.argv[2]||'chrome').toLowerCase();
if(!['chrome','edge'].includes(engine))throw Error('Valid engines: chrome or edge');
const executable=engine==='chrome'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const root=resolve('.'),ev=join(root,'docs/v3/quality/evidence');
const fixture=pathToFileURL(join(root,'scripts/quality/fixtures/focus-lifecycle-browser.html')).href;
const profile=await mkdtemp(join(tmpdir(),'bluent552-lifecycle-'));
const port=()=>new Promise((ok,no)=>{
 const server=createServer();server.once('error',no);
 server.listen(0,'127.0.0.1',()=>{const p=server.address().port;server.close(()=>ok(p));});
});
let browser=null,socket=null,seq=0;
const pending=new Map(),modes=[];
const until=async fn=>{for(let i=0;i<140;i++){try{const v=await fn();if(v)return v}catch{}await sleep(120)}throw Error('Chromium CDP response timeout')};
const cdp=(method,params={})=>new Promise((ok,no)=>{
 const id=++seq,t=setTimeout(()=>{pending.delete(id);no(Error('CDP timeout '+method))},15000);
 pending.set(id,{ok:v=>{clearTimeout(t);ok(v)},no:e=>{clearTimeout(t);no(e)}});
 socket.send(JSON.stringify({id,method,params}));
});
const js=async expression=>{
 const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
 return r.result?.value;
};
const key=async(k,code,vk,modifiers=0)=>{
 const p={key:k,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk,modifiers};
 await cdp('Input.dispatchKeyEvent',{type:'keyDown',...p,...(k==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})});
 await cdp('Input.dispatchKeyEvent',{type:'keyUp',...p});
 await sleep(90);
};
const focus=id=>js('(()=>{const e=document.getElementById('+JSON.stringify(id)+');e.focus();return document.activeElement===e})()');
const state=()=>js('window.researchState()');
const screenshot=async label=>{
 const name='BLUENT-FOCUS-LIFECYCLE-WIN-'+engine.toUpperCase()+'-'+label+'.png';
 const png=(await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true})).data;
 await writeFile(join(ev,name),Buffer.from(png,'base64'));return name;
};
const check=(outcome,name,obj)=>{
 obj.checks.push({name,pass:!!outcome});if(!outcome)throw Error(engine+' '+obj.mode+' '+name+' FAILED');
};
async function killOwned(){
 // Chromium's multiprocess children may outlive its browser PID. Kill ONLY processes
 // whose command lines contain our unique disposable user-data-dir pathname.
 if(browser?.pid)await new Promise(ok=>{
  const k=spawn('taskkill',['/PID',String(browser.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});
  k.once('error',ok);k.once('close',ok);
 });
 const escaped=profile.replace(/'/g,"''");
 const script="$p='"+escaped+"'; Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' OR Name='msedge.exe'\" | Where-Object {$_.CommandLine -and $_.CommandLine.Contains($p)} | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }";
 await new Promise(ok=>{
  const t=spawn('pwsh',['-NoProfile','-NonInteractive','-Command',script],{stdio:'ignore',windowsHide:true});
  t.once('error',ok);t.once('close',ok);
 });
}
try{
 await mkdir(ev,{recursive:true});
 const portNumber=await port();
 browser=spawn(executable,['--headless=new','--disable-extensions','--no-first-run',
 '--remote-debugging-port='+portNumber,'--remote-debugging-address=127.0.0.1',
 '--user-data-dir='+profile,'--window-size=1100,760','about:blank'],{stdio:'ignore',windowsHide:true});
 const target=await until(async()=>{
  const response=await fetch('http://127.0.0.1:'+portNumber+'/json/list');
  const tabs=await response.json();return tabs.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
 });
 socket=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((ok,no)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',no,{once:true})});
 socket.addEventListener('message',message=>{
  const r=JSON.parse(message.data);
  if(!r.id)return;const p=pending.get(r.id);if(!p)return;pending.delete(r.id);
  if(r.error)p.no(Error(JSON.stringify(r.error)));else p.ok(r.result||{});
 });
 await cdp('Page.enable');await cdp('Runtime.enable');
 const version=await cdp('Browser.getVersion');
 for(const opt of [
  {mode:'light-ltr',dir:'ltr',theme:'light',forced:false},
  {mode:'dark-rtl',dir:'rtl',theme:'dark',forced:false},
  {mode:'forced-colors',dir:'ltr',theme:'light',forced:true}]){
  await cdp('Emulation.setEmulatedMedia',{features:opt.forced?[{name:'forced-colors',value:'active'},{name:'prefers-contrast',value:'more'}]:[]});
  await cdp('Page.navigate',{url:fixture});
  await until(()=>js('!!window.researchState && document.readyState==="complete"'));
  await js('document.documentElement.setAttribute("dir",'+JSON.stringify(opt.dir)+')');
  await js('document.documentElement.style.colorScheme='+JSON.stringify(opt.theme));
  const rec={mode:opt.mode,checks:[],source:'ISOLATED HTML research fixture, NOT Bluent component'};
  const before=await state();
  check(before.dir===opt.dir,'computed effective direction',rec);
  check(before.forced===opt.forced,'forced colors CSS emulation',rec);
  check(before.selected==='tab-a','initial selection A',rec);
  check(await focus('before'),'fixture preceding control focusable',rec);
  await key('Tab','Tab',9);
  check((await state()).focus==='tab-a','native Tab enters selected A',rec);
  await key(opt.dir==='rtl'?'ArrowLeft':'ArrowRight',opt.dir==='rtl'?'ArrowLeft':'ArrowRight',opt.dir==='rtl'?37:39);
  let v=await state();
  check(v.focus==='tab-b','native directional arrow moves focus to B',rec);
  check(v.selected==='tab-a','manual activation preserves selected A',rec);
  check(v.roving.some(e=>e.id==='tab-b'&&e.tabIndex===0),'roving focus follows B internally',rec);
  check(v.trace.some(t=>t.event==='focusout'&&t.target==='tab-a'&&t.related==='tab-b'),'native focusout relates to B',rec);
  rec.arrowScreenshot=await screenshot(opt.mode.toUpperCase()+'-ARROW');
  await key('Tab','Tab',9);
  v=await state();
  check(v.focus==='after','native Tab exits composite',rec);
  check(v.roving.some(e=>e.id==='tab-a'&&e.tabIndex===0),'external focus restores selected A tab stop',rec);
  await key('Tab','Tab',9,8);
  check((await state()).focus==='tab-a','native Shift+Tab reenters selected A',rec);
  await key(opt.dir==='rtl'?'ArrowLeft':'ArrowRight',opt.dir==='rtl'?'ArrowLeft':'ArrowRight',opt.dir==='rtl'?37:39);
  check((await state()).focus==='tab-b','native arrow B before deletion',rec);
  await js('window.removeFocusedTab()');await sleep(80);
  v=await state();
  check(v.focus!=='tab-a','removing focused B does not forcibly focus A',rec);
  check(v.roving.length===1&&v.roving[0].id==='tab-a'&&v.roving[0].tabIndex===0,'surviving A remains valid roving target',rec);
  await focus('before');await key('Tab','Tab',9);
  check((await state()).focus==='tab-a','Tab reenters surviving A after removal',rec);
  await focus('trigger');await key('Enter','Enter',13);
  check((await state()).focus==='menu-a','native Enter opens popup with focus inside',rec);
  await key('Escape','Escape',27);
  v=await state();
  check(v.focus==='trigger','native Escape restores trigger while popup owns focus',rec);
  check(v.popupHidden,'Escape closes popup',rec);
  await focus('trigger');await key('Enter','Enter',13);
  await focus('outside');await js('window.closeResearchPopup()');
  v=await state();
  check(v.focus==='outside','closing after outside focus cannot hijack it',rec);
  check(!v.menuOpen&&v.popupHidden,'externally closed popup state',rec);
  rec.screenshot=await screenshot(opt.mode.toUpperCase());
  await focus('trigger');await key('Enter','Enter',13);
  await js('document.getElementById("trigger").remove()');await key('Escape','Escape',27);
  v=await state();
  check(v.focus!=='trigger','removed trigger is never focused',rec);
  check(v.popupHidden,'Escape closes popup without trigger',rec);
  rec.trace=v.trace;rec.setup={dir:v.dir,forced:v.forced};
  modes.push(rec);
  console.log('MODE '+engine+' '+rec.mode+' checks='+rec.checks.length+' passed='+rec.checks.filter(x=>x.pass).length);
 }
 const output={issue:552,status:'Native CDP keyboard on isolated HTML; NOT product/Fluent/AT acceptance',browser:{family:engine==='chrome'?'Google Chrome':'Microsoft Edge',version:version.product,os:'Windows'},modes};
 await writeFile(join(ev,'BLUENT-FOCUS-LIFECYCLE-WIN-'+engine.toUpperCase()+'.json'),JSON.stringify(output,null,2)+'\n');
 console.log('SUMMARY '+JSON.stringify({engine,checks:modes.flatMap(m=>m.checks).length,passed:modes.flatMap(m=>m.checks).filter(c=>c.pass).length,cases:modes.length}));
}catch(e){console.error('ERROR '+(e?.stack||e));process.exitCode=1}
finally{
 try{socket?.close()}catch{}
 await killOwned();await sleep(350);
 try{await rm(profile,{recursive:true,force:true,maxRetries:10,retryDelay:250})}catch(e){console.error('Owned profile cleanup failed '+e.message);process.exitCode=1}
}
