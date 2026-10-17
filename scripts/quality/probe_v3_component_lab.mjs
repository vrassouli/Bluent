#!/usr/bin/env node
// #421 actual Blazor WebAssembly browser smoke on a disposable Chrome profile.
// Example: node scripts/quality/probe_v3_component_lab.mjs http://127.0.0.1:5279
import {spawn} from 'node:child_process';
import {mkdtemp,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as wait} from 'node:timers/promises';

const base=(process.argv[2]||'http://127.0.0.1:5279').replace(/\/$/,'');
const renderMode=process.env.BLUENT_V3_LAB_MODE==='Server'?'Server':'WebAssembly';
const labRoute=renderMode==='Server'?'/compatibility/component-lab-server':'/component-lab';
const chrome=process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserName=/msedge/i.test(chrome)?'Edge':'Chrome';
const profile=await mkdtemp(join(tmpdir(),'bluent-v3-421-lab-'));
const checks=[],errors=[],pending=new Map(),runtimeSignals=[]; let browser,ws,seq=0;
const check=(name,pass,detail)=>{console.log('QA CHECK '+(pass?'PASS ':'FAIL ')+name);checks.push({name,pass:!!pass,detail});if(!pass)errors.push(name);};
const poll=async(fn,timeoutMs=70000)=>{
 const end=Date.now()+timeoutMs;
 while(Date.now()<end){try{const x=await fn();if(x)return x;}catch{}await wait(300);}
 throw Error('Timed out waiting for actual Blazor WASM action');
};
const send=(method,params={})=>new Promise((resolve,reject)=>{
 const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP '+method+' timed out'));},15000);
 pending.set(id,{resolve:x=>{clearTimeout(timer);resolve(x)},reject:e=>{clearTimeout(timer);reject(e)}});
 ws.send(JSON.stringify({id,method,params}));
});
const js=async code=>{
 const r=await send('Runtime.evaluate',{expression:code,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)throw Error('Chromium JS exception: '+r.exceptionDetails.text);
 return r.result?.value;
};
try {
 browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run',
 '--disable-extensions','--remote-debugging-port=0','--remote-allow-origins=*',
 '--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
 console.log('QA: waiting CDP port');
 const port=await poll(async()=>{const p=await readFile(join(profile,'DevToolsActivePort'),'utf8');return p.trim().split(/\r?\n/)[0]},20000);
 console.log('QA: CDP port '+port);
 const tabs=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();
 const tab=tabs.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
 if(!tab)throw Error('Missing temporary Chrome page');
 ws=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((res,rej)=>{ws.addEventListener('open',res,{once:true});ws.addEventListener('error',rej,{once:true})});
 ws.addEventListener('message',e=>{
  const m=JSON.parse(e.data),p=pending.get(m.id);
  if(p){pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result||{});}
  if(m.method==='Runtime.exceptionThrown'||m.method==='Runtime.consoleAPICalled'){
    const text=m.method==='Runtime.exceptionThrown' ? m.params?.exceptionDetails?.text:
      m.params?.args?.map(x=>x.value||x.description||'').join(' ');
    runtimeSignals.push({type:m.method,text:String(text).slice(0,320)});
  }
  if(m.method==='Network.responseReceived'&&m.params?.response?.status>=400)
    runtimeSignals.push({type:'HTTP',status:m.params.response.status,url:m.params.response.url});
  if(m.method==='Network.loadingFailed')runtimeSignals.push({type:'Network',detail:m.params?.errorText});
 });
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
 await send('Page.navigate',{url:base+labRoute});console.log('QA: page navigation initiated');
 const ready=await poll(async()=>js("document.querySelector('h1')?.textContent==='Component Lab' && [...document.querySelectorAll('button')].some(x=>x.textContent==='Continue') && !!document.querySelector('input#lab-search') && document.querySelector('main.component-lab')?.getAttribute('data-lab-interactive')==='true'"),renderMode==="Server"?55000:20000);
 check('real '+renderMode+' Component Lab hydrated with live Bluent Button',!!ready);
 console.log('QA: lab first DOM loaded');
 const initial=await js("(()=>({heading:document.querySelector('h1')?.textContent,catalog:[...document.querySelectorAll('button.lab-family')].map(x=>x.textContent.trim()),runnable:document.querySelectorAll('.lab-canvas .bui-button').length,controls:document.querySelectorAll('.lab-controls select').length}))()");
 check('four pilot families and four functional controls rendered',initial.catalog.length===4&&initial.controls===4,initial);
 check('real library Button elements rendered, not image/mock',initial.runnable===7,initial);
 await js("(()=>{const x=[...document.querySelectorAll('.lab-canvas button')].find(x=>x.textContent.includes('Continue'));x?.click()})()");
 const clicked=await poll(()=>js("document.querySelector('.lab-canvas .lab-click-status')?.textContent?.includes('1')"));
 check('actual Blazor OnClick event increments visible count',clicked);
 // Existing-API Button variant explorer: prove real Appearance, Size and
 // Shape parameter rebinding, not merely select state in a static mock.
 const variantDefaults=await js("(()=>{const ids=['lab-button-appearance','lab-button-size','lab-button-shape'];return ids.map(id=>document.getElementById(id)?.value)})()");
 check('live Button explorer uses source-backed default enum values',
  JSON.stringify(variantDefaults)===JSON.stringify(['Outline','Medium','Rounded']),variantDefaults);
 await js("(()=>{for(const [id,value] of [['lab-button-appearance','Danger'],['lab-button-size','Large'],['lab-button-shape','Square']]){const x=document.getElementById(id);x.value=value;x.dispatchEvent(new Event('change',{bubbles:true}));}})()");
 const variantUpdated=await poll(()=>js("(()=>{const btn=[...document.querySelectorAll('.lab-canvas button.bui-button')].find(x=>x.textContent.includes('Secondary'));return !!btn&&['danger','large','square'].every(x=>btn.classList.contains(x))})()"),14000);
 check('real Bluent Button responds to dynamic Danger/Large/Square parameters',variantUpdated);
 const variantSource=await js("document.querySelector('.lab-source pre code')?.textContent");
 check('generated Razor example matches all three selected Button values',
   variantSource?.includes('ButtonAppearance.Danger')&&
   variantSource?.includes('ButtonSize.Large')&&variantSource?.includes('ButtonShape.Square'),variantSource);

 // Two missing existing public Button contracts: controlled Toggled/
 // ToggledChanged and Href. This is source-backed lab coverage, NOT a new
 // v3 implementation or proof of ARIA toggle parity.
 const toggleBefore=await js("(()=>{const b=[...document.querySelectorAll('.lab-canvas button.bui-button')].find(x=>x.textContent?.includes('Pin selection'));const status=document.querySelector('.lab-toggle-status');return {nativeButton:b?.tagName==='BUTTON',toggled:b?.classList.contains('toggled'),text:status?.textContent?.trim(),ariaPressed:b?.getAttribute('aria-pressed')}})()");
 check('public Toggled Button starts untoggled with zero EventCallback notifications',
  toggleBefore.nativeButton&&toggleBefore.toggled===false&&toggleBefore.text==='Pinned: no; change callbacks: 0',toggleBefore);
 // CDP Enter (not synthetic dispatchEvent) exercises Button ClickHandler
 // and the public ToggledChanged EventCallback<bool> in actual Blazor.
 await js("(()=>{const b=[...document.querySelectorAll('.lab-canvas button.bui-button')].find(x=>x.textContent?.includes('Pin selection'));b?.focus()})()");
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
 const toggleOn=await poll(()=>js("(()=>{const b=[...document.querySelectorAll('.lab-canvas button.bui-button')].find(x=>x.textContent?.includes('Pin selection'));const status=document.querySelector('.lab-toggle-status');return b?.classList.contains('toggled')&&status?.textContent?.trim()==='Pinned: yes; change callbacks: 1'})()"),14000);
 check('native keyboard Enter sets public Toggled state and invokes ToggledChanged once',toggleOn);
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
 const toggleOff=await poll(()=>js("(()=>{const b=[...document.querySelectorAll('.lab-canvas button.bui-button')].find(x=>x.textContent?.includes('Pin selection'));const status=document.querySelector('.lab-toggle-status');return !!b&&!b.classList.contains('toggled')&&status?.textContent?.trim()==='Pinned: no; change callbacks: 2'})()"),14000);
 check('native second Enter reverts Toggled state with exactly second callback',toggleOff);
 const navigation=await js("(()=>{const b=[...document.querySelectorAll('.lab-canvas .bui-button')].find(x=>x.textContent?.includes('Open guide'));return {tag:b?.tagName,href:b?.getAttribute('href'),appearance:b?.classList.contains('subtle'),role:b?.getAttribute('role')}})()");
 check('public Button Href renders native anchor with a real destination',
   navigation.tag==='A'&&navigation.href==='getting-started'&&navigation.appearance===true,navigation);
 const expandedSource=await js("document.querySelector('.lab-source pre code')?.textContent");
 check('copyable source reflects existing Button toggle callback and Href contracts',
   expandedSource?.includes('ToggledChanged="ButtonToggledAsync"')&&
   expandedSource?.includes('Toggled="@_buttonToggled"')&&
   expandedSource?.includes('private Task ButtonToggledAsync(bool toggled)')&&
   expandedSource?.includes('Href="getting-started"'),expandedSource);


 // Advanced existing-API Button fixtures are NOT final v3 component parity.
 const badge=await js("(()=>{const b=[...document.querySelectorAll('.lab-advanced-actions button.bui-button')].find(e=>e.textContent?.includes('Notifications'));const n=b?.querySelector('.badge-wrapper.bottom.end .bui-badge');return {exists:!!b,compound:b?.classList.contains('compound'),compact:b?.classList.contains('compact'),badged:b?.classList.contains('badged'),detail:b?.querySelector('.secondary-text')?.textContent?.trim(),number:n?.textContent?.trim()}})()");
 check('native Button Compact Compound Badge and end/bottom positions render',
  badge.exists&&badge.compound&&badge.compact&&badge.badged&&badge.detail==='Recent activity'&&badge.number==='3',badge);
 const trigger=await js("(()=>{const b=[...document.querySelectorAll('.lab-advanced-actions button.bui-button')].find(e=>e.textContent?.includes('More actions'));if(!b)return null;b.focus();return {tag:b.tagName,focused:document.activeElement===b,indicator:!!b.querySelector('.dropdown-icon')}})()");
 check('existing Dropdown Button exposes native focusable indicator trigger',
  trigger?.tag==='BUTTON'&&trigger.focused&&trigger.indicator,trigger);
 const pressEnter=async()=>{
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
 };
 await pressEnter();
 const opened=await poll(()=>js("!![...document.querySelectorAll('.bui-popover-surface.show:not(.hidden)')].find(e=>e.textContent?.includes('Export report')&&e.textContent?.includes('Share summary'))"),16000);
 check('native keyboard Enter opens actual Dropdown MenuList with two choices',opened);
 const selectMenu=async name=>{
  const lookup="(()=>{const s=[...document.querySelectorAll('.bui-popover-surface.show:not(.hidden)')].find(e=>e.textContent?.includes("+JSON.stringify(name)+"));return [...s?.querySelectorAll('.menu-item')||[]].find(e=>e.querySelector('.title')?.textContent?.trim()==="+JSON.stringify(name)+")})()";
  await js("(()=>{const e="+lookup+";e?.scrollIntoView({block:'center',behavior:'instant'})})()");
  await wait(250);
  const position=await js("(()=>{const e="+lookup+";if(!e)return {hit:false};const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;return {x,y,hit:document.elementFromPoint(x,y)?.closest('.menu-item')===e}})()");
  check('CDP pointer hit tests actual '+name+' menu action',position.hit===true,position);
  if(!position.hit)throw Error('Unsafe menu click target '+name);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',x:position.x,y:position.y,clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',x:position.x,y:position.y,clickCount:1});
 };
 await selectMenu('Export report');
 const exportResult=await poll(()=>js("document.querySelector('.lab-menu-status')?.textContent?.trim()==='Menu choice: Export report; callbacks: 1'"),13000);
 check('real Export report menu click invokes exactly one Blazor callback',exportResult);
 await js("(()=>{const b=[...document.querySelectorAll('.lab-advanced-actions button.bui-button')].find(e=>e.textContent?.includes('More actions'));b?.focus()})()");
 await pressEnter();
 await poll(()=>js("!![...document.querySelectorAll('.bui-popover-surface.show:not(.hidden)')].find(e=>e.textContent?.includes('Share summary'))"),15000);
 await selectMenu('Share summary');
 const shareResult=await poll(()=>js("document.querySelector('.lab-menu-status')?.textContent?.trim()==='Menu choice: Share summary; callbacks: 2'"),13000);
 check('real Share summary menu click invokes exactly a second callback',shareResult);
 const sourceAdvanced=await js("document.querySelector('.lab-source pre code')?.textContent");
 check('copyable Razor includes badge/menu source and backing event handlers',
  sourceAdvanced?.includes('SecondaryText="Recent activity"')&&sourceAdvanced?.includes('BadgeHorizontalPosition="HorizontalSides.End"')&&
  sourceAdvanced?.includes('DropdownPlacement="Placement.BottomEnd"')&&
  sourceAdvanced?.includes('private Task ChooseExportAsync()')&&sourceAdvanced?.includes('private Task ChooseShareAsync()'),sourceAdvanced);

 await js("(()=>{const el=document.querySelector('#lab-search');const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(el,'Icon');el.dispatchEvent(new Event('input',{bubbles:true}));})()");
 const filtered=await poll(()=>js("document.querySelectorAll('button.lab-family').length===1 && document.querySelector('button.lab-family')?.textContent.includes('Icon')"));
 check('live Blazor search filters to matching Icon family',filtered);
 await js("document.querySelector('button.lab-family')?.click()");
 const switched=await poll(()=>js("document.querySelector('.lab-stage-heading h2')?.textContent.includes('Icon') && document.querySelectorAll('.lab-canvas .bui-icon').length>=3"));
 check('catalog selection renders real Bluent Icon specimens',switched);
 // Exercise BOTH source-only pilot families before granting runtime evidence.
 for(const family of ['Label','Link']){
  await js("(()=>{const x=document.querySelector('#lab-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(x,"+JSON.stringify(family)+");x.dispatchEvent(new Event('input',{bubbles:true}));})()");
  await poll(()=>js("document.querySelectorAll('button.lab-family').length===1&&document.querySelector('button.lab-family')?.textContent.includes("+JSON.stringify(family)+")"));
  await js("document.querySelector('button.lab-family')?.click()");
  const selected=await poll(()=>js("document.querySelector('.lab-stage-heading h2')?.textContent.startsWith("+JSON.stringify(family)+")"));
  check('real '+family+' catalog family selected through interactive Blazor search',selected);
  const markup=await js("(()=>{const canvas=document.querySelector('.lab-canvas');if("+JSON.stringify(family)+"==='Label'){const x=canvas?.querySelector('label');return {tag:x?.tagName?.toLowerCase(),text:x?.textContent?.trim(),className:x?.className};}const a=canvas?.querySelector('a.bui-link');return {tag:a?.tagName?.toLowerCase(),text:a?.textContent?.trim(),href:a?.getAttribute('href')};})()");
  check('actual Bluent '+family+' specimen emits native accessible markup',
   family==='Label'
    ? markup.tag==='label'&&markup.text==='Customer name'
    : markup.tag==='a'&&markup.text==='Read documentation'&&markup.href==='getting-started',
   markup);
 }
 await js("(()=>{const x=document.querySelector('#lab-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(x,'');x.dispatchEvent(new Event('input',{bubbles:true}));})()");
 await poll(()=>js("document.querySelectorAll('button.lab-family').length===4"));
 await js("(()=>{for(const [id,val] of [['lab-direction','rtl'],['lab-viewport','narrow'],['lab-density','compact'],['lab-contrast','dark']]){const x=document.getElementById(id);x.value=val;x.dispatchEvent(new Event('change',{bubbles:true}));}})()");
 const controlState=await poll(()=>js("(()=>{const x=document.querySelector('.lab-canvas');return x?.getAttribute('dir')==='rtl'&&x?.classList.contains('narrow')&&x?.classList.contains('compact')&&x?.dataset.labCanvas==='dark';})()"));
 check('RTL, narrow viewport, compact density and canvas contrast controls all update',controlState);
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:760,deviceScaleFactor:1,mobile:false});
 const narrow=await js("(()=>({innerWidth,scrollWidth:document.documentElement.scrollWidth,lab:document.querySelector('.component-lab')?.getBoundingClientRect().width}))()");
 check('mobile 320px viewport has no unintended horizontal document clipping',narrow.scrollWidth<=321,narrow);
 await send('Emulation.clearDeviceMetricsOverride');
 const source=await js("(()=>({text:document.querySelector('.lab-source pre code')?.textContent,buttons:document.querySelectorAll('.lab-source button').length,heading:document.querySelector('.lab-source h2')?.textContent}))()");
 check('copyable Razor source visible in native code block',source.text?.includes('<Link')&&source.buttons===1,source);

 // Exercise the actual Copy source click, not just the presence of a decorative control.
 // Scroll into view and dispatch real CDP pointer events to grant user activation.
 await js("document.querySelector('.lab-source button')?.scrollIntoView({block:'center',behavior:'instant'})");
 await wait(350); // Let layout / scroll settle before deriving CDP viewport coordinates.
 const copyPos=await js("(()=>{const b=document.querySelector('.lab-source button'),r=b.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,hit:document.elementFromPoint(x,y)?.closest('button')===b}})()");
 check('CDP Copy source pointer target is the actual visible button',copyPos.hit===true,copyPos);
 if(!copyPos.hit)throw Error('Copy source target cannot be safely clicked');
 await send('Input.dispatchMouseEvent',{type:'mousePressed',x:copyPos.x,y:copyPos.y,button:'left',clickCount:1});
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:copyPos.x,y:copyPos.y,button:'left',clickCount:1});
 const copied=await poll(()=>js("document.querySelector('.lab-source [aria-live=polite]')?.textContent?.trim()==='Razor source copied.'"),9000);
 check('real pointer activation completes Razor Copy source interop',copied);

 const allQueue=await js("(()=>{const rows=[...document.querySelectorAll('.lab-queue-row')];return {count:rows.length,pilots:rows.filter(x=>x.textContent.includes('Live pilot')).length,queued:rows.filter(x=>x.textContent.includes('Queued')).length,firstLink:rows[0]?.querySelector('a')?.getAttribute('href'),lastLink:rows.at(-1)?.querySelector('a')?.getAttribute('href')}})()");
 check('canonical 66 candidate rows are visible; only four have live pilots',
  allQueue.count===66&&allQueue.pilots===4&&allQueue.queued===62&&
  allQueue.firstLink?.endsWith('/issues/428')&&allQueue.lastLink?.endsWith('/issues/493'),allQueue);
 await js("(()=>{const el=document.querySelector('#lab-queue-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'432');el.dispatchEvent(new Event('input',{bubbles:true}));})()");
 const filteredQueue=await poll(()=>js("(()=>{const rows=[...document.querySelectorAll('.lab-queue-row')];if(rows.length!==1)return null;const x=rows[0];return x.textContent.includes('TextField')&&x.textContent.includes('Queued')&&!x.querySelector('button')&&x.querySelector('a')?.getAttribute('href')?.endsWith('/issues/432')})()"),12000);
 check('issue 432 search finds queued TextField without fake demo control',filteredQueue);
 await js("(()=>{const el=document.querySelector('#lab-queue-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'428');el.dispatchEvent(new Event('input',{bubbles:true}));})()");
 await poll(()=>js("document.querySelectorAll('.lab-queue-row').length===1&&document.querySelector('.lab-queue-row button')?.textContent.includes('View pilot')"),12000);
 await js("document.querySelector('.lab-queue-row button')?.click()");
 const launchPilot=await poll(()=>js("document.querySelector('.lab-stage-heading h2')?.textContent.startsWith('Button')&&document.querySelector('.lab-canvas .lab-click-status')?.textContent.includes('1')"),12000);
 check('source queue opens actual previously tested Button specimen',launchPilot);

 // A real keyboard dispatch tests the native Button and Blazor EventCallback,
 // rather than programmatically calling element.click() a second time.
 await js("(()=>{const b=[...document.querySelectorAll('.lab-canvas button.bui-button')].find(x=>x.textContent?.includes('Continue'));b?.focus()})()");
 const focusOnButton=await js("document.activeElement?.classList.contains('bui-button') && document.activeElement?.textContent.includes('Continue')");
 check('enabled Bluent Button receives native keyboard focus',focusOnButton);
 const keyboardBefore=await js("document.querySelector('.lab-canvas .lab-click-status')?.textContent?.trim()");
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
 await wait(350);
 const keyboardAfter=await js("document.querySelector('.lab-canvas .lab-click-status')?.textContent?.trim()");
 check('real Enter key activates native Bluent Button exactly once',
   keyboardBefore==='Completed clicks: 1' && keyboardAfter==='Completed clicks: 2',
   {before:keyboardBefore,after:keyboardAfter});
 const disabledButton=await js("(()=>{const b=[...document.querySelectorAll('.lab-canvas button.bui-button')].find(x=>x.textContent?.includes('Unavailable'));if(!b)return null;const nativeDisabled=b.disabled;b.focus();return {disabled:nativeDisabled,focusStayedElsewhere:document.activeElement!==b}})()");
 check('disabled Bluent Button cannot receive native focus',disabledButton?.disabled===true&&disabledButton?.focusStayedElsewhere===true,disabledButton);

 await js("(()=>{const el=document.querySelector('#lab-queue-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'');el.dispatchEvent(new Event('input',{bubbles:true}));})()");
 await poll(()=>js("document.querySelectorAll('.lab-queue-row').length===66"),12000);
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:760,deviceScaleFactor:1,mobile:false});
 const queuedMobile=await js("(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,rows:document.querySelectorAll('.lab-queue-row').length}))()");
 check('full 66-family queue reflows without document overflow at 320px',
  queuedMobile.width<=321&&queuedMobile.rows===66,queuedMobile);
 await send('Emulation.clearDeviceMetricsOverride');
 const missingRequiredAssets=runtimeSignals.filter(x=>x.type==='HTTP' && x.status>=400 &&
   /\/_framework\/|\/_content\/|\.(?:css|js)(?:[?#]|$)/i.test(x.url||''));
 check('framework JavaScript and stylesheet requests have no HTTP failures',
   missingRequiredAssets.length===0,missingRequiredAssets);
 const uncaught=runtimeSignals.filter(x=>x.type==='Runtime.exceptionThrown');
 check('browser reports no unhandled JavaScript exceptions',uncaught.length===0,uncaught);

} catch(e){
 console.log('QA: runtime error '+String(e));
 try{
  const page=await js("(()=>({url:location.href,title:document.title,ready:document.readyState,interactive:document.querySelector('main.component-lab')?.getAttribute('data-lab-interactive'),blazorLoaded:typeof window.Blazor,blazorStarted:window.Blazor?.isStarted,h1:[...document.querySelectorAll('h1')].map(x=>x.textContent),body:document.body?.innerText?.slice(0,450),scripts:[...document.scripts].map(x=>x.src).slice(-5)}))()");
  console.log('QA: failure DOM evidence '+JSON.stringify(page));console.log('QA: browser runtime signals '+JSON.stringify(runtimeSignals.slice(-22)));
 }catch(err){console.log('QA: failure DOM readback unavailable '+String(err))}
 errors.push('runtime: '+String(e.message||e));
}
finally {
 try{ws?.close()}catch{}
 console.log('QA: cleanup temporary profile');
 if(browser?.pid){
  browser.kill();
 }
 // Windows Chromium subprocesses can keep profile files locked after
 // root termination. The outer PowerShell test owner reaps only its
 // bluent-v3-421-lab-* processes and profiles, after evidence is printed.
}
const report=JSON.stringify({issue:421,environment:'actual headless '+browserName+'/Blazor '+renderMode,url:base,passed:checks.filter(x=>x.pass).length,total:checks.length,checks,errors},null,2);
// A failed Windows Chromium process teardown must not hide a completed
// browser test report. Flush the result, then let the owned-process
// PowerShell runner reap only its temporary Chrome children.
await new Promise((resolve,reject)=>process.stdout.write(report+'\n',err=>err?reject(err):resolve()));
process.exit(errors.length?1:0);
