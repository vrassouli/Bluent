#!/usr/bin/env node
// #552 audit: source-real button icon/text geometry and Chromium AX, not parity approval.
// Usage: node scripts/quality/probe_v3_button_icon_alignment.mjs chrome|edge
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:net';
import {setTimeout as wait} from 'node:timers/promises';

const engine=(process.argv[2]||'chrome').toLowerCase();
const semanticCandidate=process.argv[3]==='semantic-candidate';
if(process.argv[3]&&!semanticCandidate)throw Error('Optional mode must be semantic-candidate');
if(!['chrome','edge'].includes(engine))throw Error('chrome/edge only');
const exe=engine==='chrome'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const root=resolve('.'),out=resolve('docs/v3/quality/evidence');
const profile=await mkdtemp(join(tmpdir(),'bluent552-button-icon-'));
const pending=new Map(),checks=[],modes=[];
let seq=0,host,browser,socket;
const freePort=()=>new Promise((ok,no)=>{const s=createServer();s.on('error',no);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>ok(p));});});
const poll=async(fn,ms=45000)=>{const end=Date.now()+ms;while(Date.now()<end){try{const v=await fn();if(v)return v;}catch{}await wait(250);}throw Error('Timeout waiting for original WASM Buttons demo');};
const send=(method,params={})=>new Promise((ok,no)=>{
 const id=++seq,t=setTimeout(()=>{pending.delete(id);no(Error(method+' timed out'));},17000);
 pending.set(id,{ok:x=>{clearTimeout(t);ok(x)},no:e=>{clearTimeout(t);no(e)}});
 socket.send(JSON.stringify({id,method,params}));
});
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value;};
const check=(label,yes,actual)=>{checks.push({label,pass:!!yes});console.log(engine+' '+(yes?'PASS ':'FAIL ')+label);if(!yes)throw Error(label+' '+JSON.stringify(actual));};
const shape=e=>{
 if(!e)return null;
 const r=e.getBoundingClientRect(),s=getComputedStyle(e);
 return {tag:e.tagName,cls:e.className,top:+r.top.toFixed(2),bottom:+r.bottom.toFixed(2),left:+r.left.toFixed(2),right:+r.right.toFixed(2),
 width:+r.width.toFixed(2),height:+r.height.toFixed(2),centerX:+((r.left+r.right)/2).toFixed(2),centerY:+((r.top+r.bottom)/2).toFixed(2),
 display:s.display,fontSize:s.fontSize,lineHeight:s.lineHeight,verticalAlign:s.verticalAlign};
};
function getSizes(){
 const h=[...document.querySelectorAll('h5')].find(e=>e.textContent.trim()==='Size');
 if(!h)return {error:'missing Size heading'};
 const rows=[],names=['Small','Medium','Large'];let next=h.nextElementSibling;
 for(let i=0;i<3;i++){
  if(!next)throw Error('Missing Size row '+i);
  const buttons=[...next.querySelectorAll('.bui-button')];
  rows.push({size:names[i],buttons:buttons.map((button,index)=>{
   const icon=button.querySelector('.bui-icon.icon'),filled=button.querySelector('.bui-icon.active-icon'),text=button.querySelector('.text');
   const body=text?.firstElementChild;
   return {kind:index===0?'text-only':index===1?'icon-with-text':'icon-only',
    button:shape(button),icon:shape(icon),filled:shape(filled),text:shape(text),label:shape(body),
    visibleText:button.textContent.trim(),ariaLabel:button.getAttribute('aria-label'),title:button.getAttribute('title'),html:button.outerHTML.slice(0,650),
    deltaIconText:icon&&body?+(shape(icon).centerY-shape(body).centerY).toFixed(2):null,
    deltaIconButton:icon?+(shape(icon).centerY-shape(button).centerY).toFixed(2):null,
    deltaTextButton:body?+(shape(body).centerY-shape(button).centerY).toFixed(2):null,
    glyph:icon?getComputedStyle(icon,'::before').content:null};
  })});
  next=next.nextElementSibling;
 }
 const header=[...document.querySelectorAll('h5')].find(e=>e.textContent.trim()==='Icon');
 const root=header?.parentElement;
 return {rows,iconSection:root?[...root.querySelectorAll('.bui-button')].map(e=>({button:shape(e),text:e.textContent.trim(),ariaLabel:e.getAttribute('aria-label'),html:e.outerHTML.slice(0,450)})):[],
  viewport:{width:innerWidth,documentWidth:document.documentElement.scrollWidth},
  theme:document.documentElement.getAttribute('data-bui-theme'),direction:document.documentElement.dir,forcedColors:matchMedia('(forced-colors: active)').matches};
}
async function axSize(size,kind){
 const expr="(()=>{const h=[...document.querySelectorAll('h5')].find(x=>x.textContent.trim()==='Size');const n=['Small','Medium','Large'].indexOf("+JSON.stringify(size)+");let row=h?.nextElementSibling;for(let i=0;i<n;i++)row=row?.nextElementSibling;return row?.querySelectorAll('.bui-button')["+({ 'text-only':0,'icon-with-text':1,'icon-only':2 })[kind]+"];})()";
 const r=await send('Runtime.evaluate',{expression:expr,returnByValue:false});
 if(!r.result?.objectId)return [];
 const a=await send('Accessibility.getPartialAXTree',{objectId:r.result.objectId,fetchRelatives:false});
 return (a.nodes||[]).map(n=>({role:n.role?.value??null,name:n.name?.value??null,ignored:n.ignored,
  disabled:n.properties?.some(p=>p.name==='disabled'&&p.value?.value===true)||false}));
}
async function killOwned(child){
 if(!child?.pid)return;
 await new Promise(ok=>{const c=spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});c.once('close',ok);c.once('error',ok);});
}
try{
 await mkdir(out,{recursive:true});
 const port=await freePort(),url='http://127.0.0.1:'+port+'/components/buttons';
 host=spawn('dotnet',['run','--project',join(root,'src/Bluent.UI.Demo/Bluent.UI.Demo.csproj'),'-c','Debug','--no-build','--no-launch-profile','--urls','http://127.0.0.1:'+port],{cwd:root,windowsHide:true,stdio:'ignore'});
 await poll(async()=>{const r=await fetch(url);return r.status===200;},60000);
 browser=spawn(exe,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--disable-extensions','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
 const bp=await poll(async()=>Number((await readFile(join(profile,'DevToolsActivePort'),'utf8')).trim().split(/\r?\n/)[0]),35000);
 const tabs=await(await fetch('http://127.0.0.1:'+bp+'/json/list')).json();
 const tab=tabs.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
 if(!tab)throw Error('no CDP page');
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((ok,no)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',no,{once:true});});
 socket.addEventListener('message',e=>{const x=JSON.parse(e.data),q=pending.get(x.id);if(q){pending.delete(x.id);x.error?q.no(Error(JSON.stringify(x.error))):q.ok(x.result||{});}});
 await send('Page.enable');await send('Runtime.enable');await send('DOM.enable');await send('Accessibility.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1240,height:960,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url});
 await poll(()=>js("(()=>!![...document.querySelectorAll('h5')].find(x=>x.textContent.trim()==='Size') && document.querySelectorAll('.bui-button').length>25)()"));
 await poll(()=>js("document.fonts.status==='loaded'"));
 for(const mode of [
  {name:'light-ltr',theme:'light',dir:'ltr',forced:false},
  {name:'dark-rtl',theme:'dark',dir:'rtl',forced:false},
  {name:'forced-colors',theme:'light',dir:'ltr',forced:true}
 ]){
  await send('Emulation.setEmulatedMedia',{features:mode.forced?[{name:'forced-colors',value:'active'},{name:'prefers-contrast',value:'more'}]:[]});
  await js("(()=>{document.documentElement.setAttribute('data-bui-theme',"+JSON.stringify(mode.theme)+");document.documentElement.setAttribute('dir',"+JSON.stringify(mode.dir)+");})()");
  await js('document.fonts.ready.then(()=>true)');
  const data=await js("(()=>{const shape="+shape.toString()+";return ("+getSizes.toString()+")()})()");
  check(mode.name+' actual three Size rows and three Button variants',data.rows?.length===3&&data.rows.every(r=>r.buttons.length===3),data);
  check(mode.name+' document theme/RTL/media setup',data.theme===mode.theme&&data.direction===mode.dir&&data.forcedColors===mode.forced,data);
  check(mode.name+' original font icons load with visible SVG-free native Button DOM',
    data.rows.every(r=>r.buttons.slice(1).every(b=>b.icon?.tag==='I'&&b.glyph&&b.glyph!=='none')),data.rows);
  const accessibility={};
  for(const r of data.rows){
   accessibility[r.size]={};
   for(const kind of ['text-only','icon-with-text','icon-only'])accessibility[r.size][kind]=await axSize(r.size,kind);
  }
  let semanticExperiment=null;
  if(semanticCandidate){
   semanticExperiment={};
   for(const row of data.rows){
    const size=row.size;
    const mutate="(()=>{let r=[...document.querySelectorAll('h5')].find(x=>x.textContent.trim()==='Size')?.nextElementSibling;for(let i=0;i<"+JSON.stringify(['Small','Medium','Large'].indexOf(size))+";i++)r=r?.nextElementSibling;const b=r?.querySelectorAll('.bui-button');if(!b||b.length!==3)throw Error('missing row');[...b[1].querySelectorAll('.bui-icon'),...b[2].querySelectorAll('.bui-icon')].forEach(e=>e.setAttribute('aria-hidden','true'));b[2].setAttribute('aria-label','Cursor-click example');return true})()";
    check(mode.name+' '+size+' temporary semantic candidate injected',await js(mutate),null);
    const textAfter=await axSize(size,'icon-with-text'),onlyAfter=await axSize(size,'icon-only');
    check(mode.name+' '+size+' decorative glyph removed from accessible text-button name',
      textAfter.some(x=>x.role==='button'&&x.name===size+' with icon'&&!x.ignored),textAfter);
    check(mode.name+' '+size+' icon-only action has contextual accessible name',
      onlyAfter.some(x=>x.role==='button'&&x.name==='Cursor-click example'&&!x.ignored),onlyAfter);
    const undo="(()=>{let r=[...document.querySelectorAll('h5')].find(x=>x.textContent.trim()==='Size')?.nextElementSibling;for(let i=0;i<"+JSON.stringify(['Small','Medium','Large'].indexOf(size))+";i++)r=r?.nextElementSibling;const b=r?.querySelectorAll('.bui-button');[...b[1].querySelectorAll('.bui-icon'),...b[2].querySelectorAll('.bui-icon')].forEach(e=>e.removeAttribute('aria-hidden'));b[2].removeAttribute('aria-label');return true})()";
    await js(undo);
    const restoredText=await axSize(size,'icon-with-text'),restoredOnly=await axSize(size,'icon-only');
    check(mode.name+' '+size+' source AX state restored after browser experiment',
      restoredText[0]?.name===accessibility[size]['icon-with-text'][0]?.name &&
      restoredOnly[0]?.name===accessibility[size]['icon-only'][0]?.name,{restoredText,restoredOnly,baseline:accessibility[size]});
    semanticExperiment[size]={before:accessibility[size],textAfter,iconOnlyAfter:onlyAfter,restoredText,restoredOnly};
   }
  }
  await js("(()=>{const h=[...document.querySelectorAll('h5')].find(x=>x.textContent.trim()==='Size');h.scrollIntoView({block:'start'})})()");
  await wait(180);
  const png=(await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true})).data;
  const file='BLUENT-BUTTON-ICON-ALIGN-'+engine.toUpperCase()+(semanticCandidate?'-SEMANTIC-CANDIDATE':'')+'-'+mode.name.toUpperCase()+'.png';
  await writeFile(join(out,file),Buffer.from(png,'base64'));
  modes.push({...data,mode:mode.name,ax:accessibility,semanticExperiment,screenshot:file});
  console.log('GEOMETRY '+engine+' '+mode.name+' '+JSON.stringify(data.rows.map(r=>({size:r.size,delta:r.buttons[1].deltaIconText,iconButton:r.buttons[1].deltaIconButton,textButton:r.buttons[1].deltaTextButton,iconOnly:r.buttons[2].deltaIconButton}))));
  console.log('ACCESSIBILITY '+engine+' '+mode.name+' '+JSON.stringify(Object.fromEntries(Object.entries(accessibility).map(([k,v])=>[k,v['icon-only']]))));
 }
 const result={auditIssue:552,ownerIssue:428,relatedIssue:429,sourceRef:'0da72322',engine,semanticCandidate,
  host:'original unmodified Bluent WebAssembly Debug /components/buttons, actual browser',
  status:'Source component geometry and Chrome/Edge CDP accessibility observations; NOT Fluent parity or native OS AT approval',
  checks,modes};
 await writeFile(join(out,'BLUENT-BUTTON-ICON-ALIGN-'+engine.toUpperCase()+(semanticCandidate?'-SEMANTIC-CANDIDATE':'')+'.json'),JSON.stringify(result,null,2)+'\n');
 console.log('SUMMARY '+JSON.stringify({engine,checks:checks.length,passed:checks.filter(x=>x.pass).length,modes:modes.length}));
}catch(e){console.error('ERROR '+engine+' '+(e.stack||String(e)));process.exitCode=1;}
finally{
 try{socket?.close()}catch{}
 await killOwned(browser);await killOwned(host);
 const escaped=profile.replace(/'/g,"''");
 const command="$p='"+escaped+"'; Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' OR Name='msedge.exe'\" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($p) } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }";
 try{const cleanup=spawn('pwsh',['-NoProfile','-NonInteractive','-Command',command],{windowsHide:true,stdio:'ignore'});await Promise.race([new Promise(ok=>{cleanup.once('close',ok);cleanup.once('error',ok)}),wait(7000)]);}catch{}
 await wait(750);
 try{await rm(profile,{recursive:true,force:true,maxRetries:12,retryDelay:250});}catch(e){console.error('Owned profile cleanup failed '+e.message);process.exitCode=1;}
}
