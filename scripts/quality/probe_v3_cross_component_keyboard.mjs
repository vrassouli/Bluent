#!/usr/bin/env node
// #552 Wave E native keyboard navigation audit, no product change.
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:net';
import {setTimeout as wait} from 'node:timers/promises';
const engine=(process.argv[2]||'chrome').toLowerCase();
if(!['chrome','edge'].includes(engine))throw Error('Supported: chrome|edge');
const executable=engine==='chrome'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const root=resolve('.'),evidence=join(root,'docs/v3/quality/evidence'),profile=await mkdtemp(join(tmpdir(),'bluent552-keyboard-'));
let browser,host,socket,sequence=0;const pending=new Map(),checks=[],cases=[];
const port=()=>new Promise((ok,no)=>{const s=createServer();s.on('error',no);s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>ok(n));});});
const poll=async(fn,ms=30000)=>{const end=Date.now()+ms;while(Date.now()<end){try{const x=await fn();if(x)return x;}catch{}await wait(200);}throw Error('Timeout polling real demo');};
const call=(method,params={})=>new Promise((ok,no)=>{const id=++sequence,t=setTimeout(()=>{pending.delete(id);no(Error(method+' timed out'));},16000);pending.set(id,{ok:v=>{clearTimeout(t);ok(v)},no:e=>{clearTimeout(t);no(e)}});socket.send(JSON.stringify({id,method,params}));});
const js=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value;};
const check=(name,good,data)=>{checks.push({name,pass:!!good});console.log(engine+' '+(good?'PASS ':'FAIL ')+name);if(!good)throw Error(name+' '+JSON.stringify(data));};
function select(kind){
 const section=name=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()===name);return h?.nextElementSibling;};
 if(kind==='tab')return section('Size')?.querySelector('.tab-item .bui-icon')?.closest('.tab-item');
 if(kind==='menu-disabled')return section('Disabled Items')?.querySelector('.menu-item');
 if(kind==='menu-enabled')return [...(section('Disabled Items')?.querySelectorAll('.menu-item')||[])].find(x=>x.textContent.trim().includes('Paste'));
 if(kind==='nav')return [...(section('Default')?.querySelectorAll('.bui-nav-item')||[])].find(x=>x.textContent.includes('Components')&&!x.textContent.includes('Dashboard'));
 if(kind==='accordion')return section('Default')?.querySelector('.accordion-panel .header');
 throw Error('Unknown kind '+kind);
}
function measure(kind){
 const el=select(kind);
 if(!el)return null;
 const b=el.getBoundingClientRect();
 return {kind,tag:el.tagName,classes:el.className,ancestorClasses:el.parentElement?.className??null,role:el.getAttribute('role'),ariaLabel:el.getAttribute('aria-label'),
  ariaExpanded:el.getAttribute('aria-expanded'),ariaSelected:el.getAttribute('aria-selected'),
  ariaDisabled:el.getAttribute('aria-disabled'),disabled:el.hasAttribute('disabled'),
  tabindex:el.getAttribute('tabindex'),html:el.outerHTML.slice(0,1100),text:el.textContent.trim().slice(0,140),
  box:{left:b.left,top:b.top,width:b.width,height:b.height,x:b.left+b.width/2,y:b.top+b.height/2},
  icons:[...el.querySelectorAll('.bui-icon')].map(i=>({class:i.className,hidden:i.getAttribute('aria-hidden'),display:getComputedStyle(i).display,
    content:getComputedStyle(i,'::before').content}))};
}
async function observe(kind){
 const expression='(()=>{const select='+select.toString()+';return ('+measure.toString()+')('+JSON.stringify(kind)+')})()';
 const value=await js(expression);
 if(!value)throw Error(kind+' DOM not located');
 const node='(()=>{const select='+select.toString()+';return select('+JSON.stringify(kind)+')})()';
 const r=await call('Runtime.evaluate',{expression:node,returnByValue:false});
 if(!r.result?.objectId)throw Error('Missing AX handle '+kind);
 const tree=await call('Accessibility.getPartialAXTree',{objectId:r.result.objectId,fetchRelatives:false});
 const ax=(tree.nodes||[]).map(n=>({role:n.role?.value||null,name:n.name?.value||'',ignored:n.ignored,
  selected:n.properties?.filter(p=>p.name==='selected').map(p=>p.value?.value)||[],
  disabled:n.properties?.filter(p=>p.name==='disabled').map(p=>p.value?.value)||[],
  expanded:n.properties?.filter(p=>p.name==='expanded').map(p=>p.value?.value)||[]}));
 return {...value,ax};
}
const hover=async box=>{await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:box.x,y:box.y});await wait(140);};
const click=async box=>{await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:box.x,y:box.y});await call('Input.dispatchMouseEvent',{type:'mousePressed',x:box.x,y:box.y,button:'left',clickCount:1});await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:box.x,y:box.y,button:'left',clickCount:1});await wait(220);};
const keypress=async(key,code,vk)=>{
 const props={key,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk};
 await call('Input.dispatchKeyEvent',{type:'keyDown',...props,...(key==='Enter'?{text:'\r',unmodifiedText:'\r'}:key===' '?{text:' ',unmodifiedText:' '}: {})});
 await call('Input.dispatchKeyEvent',{type:'keyUp',...props});
 await wait(160);
};
async function keyboard(kind){
 const state=()=>js('(()=>{const select='+select.toString()+';const e=select('+JSON.stringify(kind)+'),a=document.activeElement;return {focused:e===a,tabIndex:e.tabIndex,tag:e.tagName,classes:e.className,selected:e.classList.contains("selected"),ariaSelected:e.getAttribute("aria-selected"),expanded:e.getAttribute("aria-expanded"),activeTag:a?.tagName||null,activeClasses:a?.className||null,activeText:a?.textContent?.trim().slice(0,65)||"",isActiveInTarget:!!e.contains(a)}})()');
 const focus=()=>js('(()=>{const select='+select.toString()+';const e=select('+JSON.stringify(kind)+');e.focus();return document.activeElement===e})()');
 const setup=await js('(()=>{const select='+select.toString()+';const e=select('+JSON.stringify(kind)+');const all=[...document.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]")].filter(x=>x.tabIndex>=0&&x.getClientRects().length>0&&!x.closest("[inert]"));const prior=all.filter(x=>x.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING).at(-1);if(prior){prior.focus();return {prior:prior.tagName,priorText:prior.textContent?.trim().slice(0,40)||"",priorFocused:document.activeElement===prior}}return {prior:null,priorFocused:false}})()');
 const beforeTab=await state();
 await keypress('Tab','Tab',9);
 const afterTab=await state();
 const direct=await focus();
 const afterFocus=await state();
 let arrowRight=null,arrowLeft=null,enter=null,space=null,secondBeforeEnter=null;
 if(kind==='tab'){
   await keypress('ArrowRight','ArrowRight',39);arrowRight=await state();
   await keypress('ArrowLeft','ArrowLeft',37);arrowLeft=await state();
   secondBeforeEnter=await js('(()=>{const select='+select.toString()+';const t=select("tab");const e=[...t.parentElement.querySelectorAll(".tab-item")][1];if(!e)throw Error("Missing second tab");e.focus();return {focused:document.activeElement===e,selected:e.classList.contains("selected"),text:e.textContent.trim()}})()');
   await keypress('Enter','Enter',13);enter=await state();
   await focus();await keypress(' ','Space',32);space=await state();
 }else if(direct){
   await keypress('Enter','Enter',13);enter=await state();
   await keypress(' ','Space',32);space=await state();
 }
 return {setup,beforeTab,afterTab,direct,afterFocus,arrowRight,arrowLeft,secondBeforeEnter,enter,space,skippedNonFocusableKeyActivation:kind!=='tab'&&!direct};
}
const screenshot=async key=>{const png=(await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true})).data;const name='BLUENT-KEYBOARD-'+engine.toUpperCase()+'-'+key+'.png';await writeFile(join(evidence,name),Buffer.from(png,'base64'));return name;};
async function terminate(c){if(!c?.pid)return;await new Promise(ok=>{const t=spawn('taskkill',['/PID',String(c.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});t.once('close',ok);t.once('error',ok);});}
try{
 await mkdir(evidence,{recursive:true});
 const p=await port(),base='http://127.0.0.1:'+p;
 host=spawn('dotnet',['run','--project',join(root,'src/Bluent.UI.Demo/Bluent.UI.Demo.csproj'),'-c','Debug','--no-build','--no-launch-profile','--urls',base],{cwd:root,windowsHide:true,stdio:'ignore'});
 await poll(async()=>{const r=await fetch(base+'/components/menus');return r.status===200;},50000);
 browser=spawn(executable,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--disable-extensions','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
 const cp=await poll(async()=>Number((await readFile(join(profile,'DevToolsActivePort'),'utf8')).trim().split(/\r?\n/)[0]),35000);
 const tabs=await(await fetch('http://127.0.0.1:'+cp+'/json/list')).json();const tab=tabs.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);if(!tab)throw Error('No temporary Chromium page');
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((ok,no)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',no,{once:true});});
 socket.addEventListener('message',e=>{const v=JSON.parse(e.data),q=pending.get(v.id);if(q){pending.delete(v.id);v.error?q.no(Error(JSON.stringify(v.error))):q.ok(v.result||{});}});
 await call('Page.enable');await call('Runtime.enable');await call('DOM.enable');await call('Accessibility.enable');
 await call('Emulation.setDeviceMetricsOverride',{width:1240,height:960,deviceScaleFactor:1,mobile:false});
 for(const mode of [{name:'light-ltr',theme:'light',dir:'ltr',forced:false},{name:'dark-rtl',theme:'dark',dir:'rtl',forced:false},{name:'forced-colors',theme:'light',dir:'ltr',forced:true}]){
  await call('Emulation.setEmulatedMedia',{features:mode.forced?[{name:'forced-colors',value:'active'},{name:'prefers-contrast',value:'more'}]:[]});
  for(const [kind,path] of [['tab','tablists'],['nav','nav-lists'],['accordion','accordions'],['menu-disabled','menus'],['menu-enabled','menus']]){
   await call('Page.navigate',{url:base+'/components/'+path});
   await poll(async()=>js('(()=>{const select='+select.toString()+';return !!select('+JSON.stringify(kind)+')})()'),25000);
   await js("(()=>{document.documentElement.setAttribute('data-bui-theme',"+JSON.stringify(mode.theme)+");document.documentElement.setAttribute('dir',"+JSON.stringify(mode.dir)+");})()");
   await js('document.fonts.ready.then(()=>true)');
   const setup=await js("({theme:document.documentElement.getAttribute('data-bui-theme'),dir:document.documentElement.dir,forced:matchMedia('(forced-colors: active)').matches})");
   check(mode.name+' '+kind+' actual source DOM and media',setup.theme===mode.theme&&setup.dir===mode.dir&&setup.forced===mode.forced,setup);
   await js('(()=>{const select='+select.toString()+';select('+JSON.stringify(kind)+').scrollIntoView({block:"center"})})()');
   await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:5,y:5});await wait(120);
   const before=await observe(kind);
   check(mode.name+' '+kind+' real nested icon and title',before.icons.length>=1&&before.text.length>0,before);
   const keys=await keyboard(kind);
   check(mode.name+' '+kind+' real native keyboard sequence recorded',keys.setup.priorFocused&&!!keys.afterTab.activeTag,keys);
   if(kind==='tab'){
    check(mode.name+' tab native focus is available',keys.direct&&keys.afterFocus.focused&&keys.afterFocus.tag==='BUTTON',keys);
    check(mode.name+' native Enter selects second and Space restores first',keys.secondBeforeEnter?.focused&&keys.enter?.selected===false&&keys.space?.selected===true,keys);
   }else{
    check(mode.name+' '+kind+' original DIV has no native focus',keys.direct===false&&keys.afterFocus.tabIndex===-1&&keys.skippedNonFocusableKeyActivation,keys);
   }
   // Pointer evidence collected separately after native keyboard probe.
   await hover(before.box);const hovered=await observe(kind);
   let selected=null,tabTransition=null;
   if(kind==='tab'||kind==='nav'||kind==='accordion'){await click(hovered.box);selected=await observe(kind);}
   if(kind==='tab'){
    // Actual pointer select SECOND then FIRST, no synthetic Blazor class mutation.
    const other=await js('(()=>{const select='+select.toString()+';const first=select("tab");const second=first?.parentElement?.querySelectorAll(".tab-item")[1];if(!second)throw Error("No second tab");const b=second.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}})()');
    await click(other);
    const deselected=await observe('tab');
    check(mode.name+' tab native pointer selection changes source selected class',
      !deselected.classes.split(/\s+/).includes('selected')&&deselected.ariaSelected===null,{deselected,other});
    await click(before.box);
    const reselected=await observe('tab');
    check(mode.name+' tab native pointer reselect restores first tab',
      reselected.classes.split(/\s+/).includes('selected')&&reselected.ariaSelected===null,reselected);
    tabTransition={deselected,reselected};
   }
   if(kind==='accordion'){
    check(mode.name+' accordion native pointer expands parent despite absent header ARIA',
      selected?.ancestorClasses?.split(/\s+/).includes('expanded')===true && selected.ariaExpanded===null,selected);
   }
   if(kind==='nav'){
    check(mode.name+' nav group click expands despite generic AX role',
      selected?.classes?.split(/\s+/).includes('expanded')===true && selected.ax[0]?.role==='generic',selected);
   }
   const picture=await screenshot(mode.name.toUpperCase()+'-'+kind.toUpperCase());
   cases.push({kind,mode:mode.name,page:path,setup,before,keyboard:keys,hovered,selected,tabTransition,image:picture});
   console.log('OBSERVED '+engine+' '+mode.name+' '+kind+' '+JSON.stringify({before:{tag:before.tag,role:before.role,ariaSelected:before.ariaSelected,ariaExpanded:before.ariaExpanded,disabled:before.disabled,ax:before.ax.slice(0,2),icons:before.icons},hover:{ax:hovered.ax.slice(0,2),icons:hovered.icons},selected:selected&&{classes:selected.classes,ariaSelected:selected.ariaSelected,ariaExpanded:selected.ariaExpanded,ax:selected.ax.slice(0,2),icons:selected.icons}}));
  }
 }
 await writeFile(join(evidence,'BLUENT-KEYBOARD-'+engine.toUpperCase()+'.json'),JSON.stringify({issue:552,sourceRef:'8141cd77',engine,host:'original unchanged Bluent WebAssembly Demo with Chrome/Edge native CDP key events',status:'Actual Tab/Arrow/Enter/Space browser observations; NOT Fluent parity, OS screen reader or design approval',checks,cases},null,2)+'\n');
 console.log('SUMMARY '+JSON.stringify({engine,checks:checks.length,passed:checks.filter(x=>x.pass).length,cases:cases.length}));
}catch(e){console.error('ERROR '+engine+' '+(e?.stack||e));process.exitCode=1;}
finally{
 try{socket?.close()}catch{}
 await terminate(browser);await terminate(host);
 const escaped=profile.replace(/'/g,"''");
 const clean="$p='"+escaped+"'; Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' OR Name='msedge.exe'\" | Where-Object {$_.CommandLine -and $_.CommandLine.Contains($p)} | ForEach-Object {Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue}";
 try{const t=spawn('pwsh',['-NoProfile','-NonInteractive','-Command',clean],{stdio:'ignore',windowsHide:true});await Promise.race([new Promise(ok=>{t.once('close',ok);t.once('error',ok)}),wait(6000)]);}catch{}
 await wait(700);try{await rm(profile,{recursive:true,force:true,maxRetries:12,retryDelay:200})}catch(e){console.error('Owned profile cleanup failed '+e.message);process.exitCode=1;}
}
