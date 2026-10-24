#!/usr/bin/env node
// #552 / #428+#429 real Blazor Button hover/toggle/AX state audit. No product mutation.
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:net';
import {setTimeout as wait} from 'node:timers/promises';
const engine=(process.argv[2]||'chrome').toLowerCase();
if(!['chrome','edge'].includes(engine))throw Error('Only Chrome/Edge');
const exe=engine==='chrome'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const root=resolve('.'),output=join(root,'docs/v3/quality/evidence');
const profile=await mkdtemp(join(tmpdir(),'bluent552-button-states-'));
const pending=new Map(),checks=[],cases=[];
let serial=0,socket,host,browser;
const port=()=>new Promise((resolve,reject)=>{const s=createServer();s.once('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
const poll=async(f,ms=45000)=>{const end=Date.now()+ms;while(Date.now()<end){try{const v=await f();if(v)return v;}catch{}await wait(250)}throw Error('Timed out waiting for Bluent real browser DOM');};
const call=(method,params={})=>new Promise((resolve,reject)=>{
 const id=++serial,t=setTimeout(()=>{pending.delete(id);reject(Error(method+' timeout'));},16000);
 pending.set(id,{resolve:v=>{clearTimeout(t);resolve(v)},reject:e=>{clearTimeout(t);reject(e)}});
 socket.send(JSON.stringify({id,method,params}));
});
const js=async(expression)=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value;};
const check=(name,ok,evidence)=>{checks.push({name,pass:!!ok});console.log(engine+' '+(ok?'PASS ':'FAIL ')+name);if(!ok)throw Error(name+' '+JSON.stringify(evidence));};
function lookup(kind){
 const h=[...document.querySelectorAll('h5')].find(x=>x.textContent.trim()===(kind==='toggle'?'Toggle':'Size'));
 if(!h)throw Error('Section missing: '+kind);
 let section=h.nextElementSibling;
 if(kind==='size')section=section?.nextElementSibling;
 const buttons=[...section.querySelectorAll('.bui-button')];
 const target=kind==='toggle'?buttons[0]:buttons[2];
 if(!target)throw Error('Target missing '+kind);
 return target;
}
function describe(kind){
 const target=lookup(kind),r=target.getBoundingClientRect(),a=[...target.querySelectorAll('.bui-icon')];
 const icons=a.map(x=>{const s=getComputedStyle(x),rect=x.getBoundingClientRect(),g=getComputedStyle(x,'::before');
  return {classes:x.className,display:s.display,width:+rect.width.toFixed(2),height:+rect.height.toFixed(2),
   glyph:g.content,ariaHidden:x.getAttribute('aria-hidden'),fontFamily:g.fontFamily};});
 return {kind,buttonClasses:target.className,text:target.textContent.trim(),title:target.getAttribute('title'),
  ariaLabel:target.getAttribute('aria-label'),ariaPressed:target.getAttribute('aria-pressed'),hovered:target.matches(':hover'),
  box:{left:r.left,top:r.top,width:r.width,height:r.height,x:r.left+r.width/2,y:r.top+r.height/2},icons};
}
async function observe(kind){
 const desc=await js('(()=>{const lookup='+lookup.toString()+';return ('+describe.toString()+')('+JSON.stringify(kind)+')})()');
 const exp='(()=>{const lookup='+lookup.toString()+';return lookup('+JSON.stringify(kind)+')})()';
 const response=await call('Runtime.evaluate',{expression:exp,returnByValue:false});
 if(!response.result?.objectId)throw Error('Missing source DOM button for '+kind);
 const a=await call('Accessibility.getPartialAXTree',{objectId:response.result.objectId,fetchRelatives:false});
 const nodes=(a.nodes||[]).map(n=>({role:n.role?.value??null,name:n.name?.value??null,ignored:n.ignored,
    pressed:n.properties?.filter(p=>p.name==='pressed').map(p=>p.value?.value)??[]}));
 return {...desc,ax:nodes};
}
const move=async(x,y)=>call('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,modifiers:0});
const click=async(x,y)=>{await call('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await call('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1})};
async function screenshot(mode,suffix){
 const png=(await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true})).data;
 const name='BLUENT-BUTTON-STATE-'+engine.toUpperCase()+'-'+mode+'-'+suffix+'.png';
 await writeFile(join(output,name),Buffer.from(png,'base64'));return name;
}
async function terminate(c){if(!c?.pid)return;await new Promise(ok=>{const p=spawn('taskkill',['/PID',String(c.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});p.once('close',ok);p.once('error',ok);});}
try{
 await mkdir(output,{recursive:true});
 const p=await port(),url='http://127.0.0.1:'+p+'/components/buttons';
 host=spawn('dotnet',['run','--project',join(root,'src/Bluent.UI.Demo/Bluent.UI.Demo.csproj'),'-c','Debug','--no-build','--no-launch-profile','--urls','http://127.0.0.1:'+p],{cwd:root,stdio:'ignore',windowsHide:true});
 await poll(async()=>{const r=await fetch(url);return r.status===200;},60000);
 browser=spawn(exe,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--disable-extensions','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
 const dbg=await poll(async()=>Number((await readFile(join(profile,'DevToolsActivePort'),'utf8')).trim().split(/\r?\n/)[0]),35000);
 const tabs=await(await fetch('http://127.0.0.1:'+dbg+'/json/list')).json();
 const tab=tabs.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
 if(!tab)throw Error('Missing temporary Chromium CDP tab');
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 socket.addEventListener('message',e=>{const data=JSON.parse(e.data),o=pending.get(data.id);if(o){pending.delete(data.id);data.error?o.reject(Error(JSON.stringify(data.error))):o.resolve(data.result||{})}});
 await call('Page.enable');await call('Runtime.enable');await call('DOM.enable');await call('Accessibility.enable');
 await call('Emulation.setDeviceMetricsOverride',{width:1240,height:960,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url});
 await poll(()=>js("(()=>[...document.querySelectorAll('h5')].some(x=>x.textContent.trim()==='Toggle')&&document.querySelectorAll('.bui-button').length>25)()"));
 await poll(()=>js("document.fonts.status==='loaded'"));
 const modes=[{name:'light-ltr',theme:'light',dir:'ltr',forced:false},{name:'dark-rtl',theme:'dark',dir:'rtl',forced:false},{name:'forced-colors',theme:'light',dir:'ltr',forced:true}];
 for(const mode of modes){
  await call('Emulation.setEmulatedMedia',{features:mode.forced?[{name:'forced-colors',value:'active'},{name:'prefers-contrast',value:'more'}]:[]});
  await js("(()=>{document.documentElement.setAttribute('data-bui-theme',"+JSON.stringify(mode.theme)+");document.documentElement.setAttribute('dir',"+JSON.stringify(mode.dir)+");})()");
  await js('document.fonts.ready.then(()=>true)');
  // Scroll native target and move mouse away; no DOM alteration to the original source.
  await js('(()=>{const lookup='+lookup.toString()+';lookup("toggle").scrollIntoView({block:"center"})})()');
  await move(10,10);await wait(180);
  const start=await observe('toggle');
  check(mode.name+' toggle initial regular icon visible',
    !start.buttonClasses.includes('toggled')&&start.icons.length===2&&start.icons.some(x=>x.classes.includes('icon-ic_')&&x.classes.includes('active-icon')&&x.display==='none')&&start.icons.some(x=>x.classes.includes(' icon')&&x.display!=='none'),start);
  check(mode.name+' original Button aria-pressed absent',start.ariaPressed===null&&start.ax[0]?.pressed.length===0,start);
  // Controlled state=false + pointer hover option. Neither alters Blazor public API or source.
  await js('(()=>{const lookup='+lookup.toString()+';const b=lookup("toggle");b.querySelectorAll(".bui-icon").forEach(x=>x.setAttribute("aria-hidden","true"));b.setAttribute("aria-pressed","false");return true})()');
  const falseCandidate=await observe('toggle');
  check(mode.name+' temporary aria-pressed=false exposes clean accessible name',
    falseCandidate.ax[0]?.name==='Default'&&falseCandidate.ax[0]?.pressed.includes('false'),falseCandidate);
  await move(start.box.x,start.box.y);await wait(180);
  const falseCandidateHovered=await observe('toggle');
  check(mode.name+' hover does not mutate accessible name in semantic candidate',
    falseCandidateHovered.hovered&&falseCandidateHovered.ax[0]?.name==='Default'&&falseCandidateHovered.ax[0]?.pressed.includes('false'),falseCandidateHovered);
  await js('(()=>{const lookup='+lookup.toString()+';const b=lookup("toggle");b.querySelectorAll(".bui-icon").forEach(x=>x.removeAttribute("aria-hidden"));b.removeAttribute("aria-pressed");return true})()');
  await move(10,10);await wait(180);
  const falseRestored=await observe('toggle');
  check(mode.name+' unselected state browser experiment restores original AX',
    falseRestored.ax[0]?.name===start.ax[0]?.name&&falseRestored.ariaPressed===null&&!falseRestored.buttonClasses.includes('toggled'),falseRestored);
  await move(start.box.x,start.box.y);await wait(200);
  const hover=await observe('toggle');
  check(mode.name+' hover activates filled glyph while hiding regular',hover.hovered&&hover.icons.some(x=>x.classes.includes('active-icon')&&x.display!=='none')&&hover.icons.some(x=>x.classes.endsWith(' icon')&&x.display==='none'),hover);
  await click(hover.box.x,hover.box.y);
  await poll(async()=>{const r=await observe('toggle');return r.buttonClasses.includes('toggled')?r:false;},9000);
  const clicked=await observe('toggle');
  await move(10,10);await wait(200);
  const toggled=await observe('toggle');
  check(mode.name+' native click toggles persistent Filled icon after mouse leaves',
    toggled.buttonClasses.includes('toggled')&&!toggled.hovered&&toggled.icons.some(x=>x.classes.includes('active-icon')&&x.display!=='none')&&toggled.icons.some(x=>x.classes.endsWith(' icon')&&x.display==='none'),toggled);
  const initialPua=start.ax[0]?.name,hoverPua=hover.ax[0]?.name,toggledPua=toggled.ax[0]?.name;
  check(mode.name+' original toggle stays unnamed by state and has PUA accessible name',
    !!initialPua&&!!hoverPua&&!!toggledPua&&start.ariaPressed===null&&hover.ariaPressed===null&&toggled.ariaPressed===null,{initialPua,hoverPua,toggledPua});
  const image=await screenshot(mode.name.toUpperCase(),'TOGGLED');
  // Controlled isolated DOM experiment. Both icon sources decorative; native toggle retains its actual state.
  await js('(()=>{const lookup='+lookup.toString()+';const b=lookup("toggle");b.querySelectorAll(".bui-icon").forEach(x=>x.setAttribute("aria-hidden","true"));b.setAttribute("aria-pressed","true");return true})()');
  const candidate=await observe('toggle');
  check(mode.name+' temporary aria-pressed reflects current toggle with clean accessible name',
    candidate.ax[0]?.name==='Default'&&candidate.ax[0]?.pressed.includes('true'),candidate);
  await js('(()=>{const lookup='+lookup.toString()+';const b=lookup("toggle");b.querySelectorAll(".bui-icon").forEach(x=>x.removeAttribute("aria-hidden"));b.removeAttribute("aria-pressed");return true})()');
  const restored=await observe('toggle');
  check(mode.name+' temporary semantic experiment exactly restores original state',
    restored.ax[0]?.name===toggled.ax[0]?.name&&restored.ariaPressed===null&&restored.buttonClasses.includes('toggled'),{restored,toggled});
  await move(restored.box.x,restored.box.y);await click(restored.box.x,restored.box.y);
  await poll(async()=>{const r=await observe('toggle');return !r.buttonClasses.includes('toggled')?r:false;},9000);
  await move(10,10);await wait(160);
  const reset=await observe('toggle');
  check(mode.name+' second native click resets toggle source state',!reset.buttonClasses.includes('toggled')&&reset.icons.some(x=>x.classes.endsWith(' icon')&&x.display!=='none'),reset);
  cases.push({scenario:mode.name,theme:mode.theme,direction:mode.dir,forcedColors:mode.forced,start,falseCandidate,falseCandidateHovered,falseRestored,hover,clicked,toggled,candidate,restored,reset,image});
  console.log('STATES '+engine+' '+mode.name+' '+JSON.stringify({names:[start.ax[0]?.name,hover.ax[0]?.name,toggled.ax[0]?.name],toggledAfterMouseout:toggled.buttonClasses,pressed:[start.ariaPressed,toggled.ariaPressed],candidatePressed:candidate.ax[0]?.pressed}));
 }
 const data={issue:552,buttonIssue:428,iconIssue:429,branch:'v3/issue-552-fluent-parity-audit',sourceRef:'0eb2afdd',
  engine,host:'original .NET 10 Blazor WebAssembly Debug Buttons demo (no Bluent source mutation)',
  claim:'Real Chrome/Edge hover and mouse clicks, AX partial-tree, not Fluent parity, native OS AT or approved design',checks,cases};
 await writeFile(join(output,'BLUENT-BUTTON-STATE-'+engine.toUpperCase()+'.json'),JSON.stringify(data,null,2)+'\n');
 console.log('SUMMARY '+JSON.stringify({engine,passed:checks.filter(x=>x.pass).length,checks:checks.length,scenarios:cases.length}));
}catch(e){console.error('ERROR '+engine+' '+(e?.stack||e));process.exitCode=1;}
finally{
 try{socket?.close()}catch{}
 await terminate(browser);await terminate(host);
 const escaped=profile.replace(/'/g,"''");
 const cmd="$p='"+escaped+"'; Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' OR Name='msedge.exe'\" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($p) } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }";
 try{const q=spawn('pwsh',['-NoProfile','-NonInteractive','-Command',cmd],{stdio:'ignore',windowsHide:true});await Promise.race([new Promise(ok=>{q.once('close',ok);q.once('error',ok)}),wait(6000)]);}catch{}
 await wait(700);try{await rm(profile,{recursive:true,force:true,maxRetries:12,retryDelay:200});}catch(e){console.error('Temp profile cleanup failed '+e.message);process.exitCode=1;}
}
