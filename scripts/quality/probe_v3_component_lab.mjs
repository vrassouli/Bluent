#!/usr/bin/env node
// #421 actual Blazor WebAssembly browser smoke on a disposable Chrome profile.
// Example: node scripts/quality/probe_v3_component_lab.mjs http://127.0.0.1:5279
import {spawn} from 'node:child_process';
import {mkdtemp,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as wait} from 'node:timers/promises';

const base=(process.argv[2]||'http://127.0.0.1:5279').replace(/\/$/,'');
const chrome=process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserName=/msedge/i.test(chrome)?'Edge':'Chrome';
const profile=await mkdtemp(join(tmpdir(),'bluent-v3-421-lab-'));
const checks=[],errors=[],pending=new Map(); let browser,ws,seq=0;
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
 });
 await send('Page.enable');await send('Runtime.enable');
 await send('Page.navigate',{url:base+'/component-lab'});console.log('QA: page navigation initiated');
 const ready=await poll(async()=>js("document.querySelector('h1')?.textContent==='Component Lab' && [...document.querySelectorAll('button')].some(x=>x.textContent==='Continue') && !!document.querySelector('input#lab-search')"),16000);
 check('real WebAssembly Component Lab hydrated with live Bluent Button',!!ready);
 console.log('QA: lab first DOM loaded');
 const initial=await js("(()=>({heading:document.querySelector('h1')?.textContent,catalog:[...document.querySelectorAll('button.lab-family')].map(x=>x.textContent.trim()),runnable:document.querySelectorAll('.lab-canvas .bui-button').length,controls:document.querySelectorAll('.lab-controls select').length}))()");
 check('four pilot families and four functional controls rendered',initial.catalog.length===4&&initial.controls===4,initial);
 check('real library Button elements rendered, not image/mock',initial.runnable===3,initial);
 await js("(()=>{const x=[...document.querySelectorAll('.lab-canvas button')].find(x=>x.textContent.includes('Continue'));x?.click()})()");
 const clicked=await poll(()=>js("document.querySelector('.lab-canvas [role=status]')?.textContent?.includes('1')"));
 check('actual Blazor OnClick event increments visible count',clicked);
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
 const launchPilot=await poll(()=>js("document.querySelector('.lab-stage-heading h2')?.textContent.startsWith('Button')&&document.querySelector('.lab-canvas [role=status]')?.textContent.includes('1')"),12000);
 check('source queue opens actual previously tested Button specimen',launchPilot);
 await js("(()=>{const el=document.querySelector('#lab-queue-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'');el.dispatchEvent(new Event('input',{bubbles:true}));})()");
 await poll(()=>js("document.querySelectorAll('.lab-queue-row').length===66"),12000);
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:760,deviceScaleFactor:1,mobile:false});
 const queuedMobile=await js("(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,rows:document.querySelectorAll('.lab-queue-row').length}))()");
 check('full 66-family queue reflows without document overflow at 320px',
  queuedMobile.width<=321&&queuedMobile.rows===66,queuedMobile);
 await send('Emulation.clearDeviceMetricsOverride');

} catch(e){
 console.log('QA: runtime error '+String(e));
 try{
  const page=await js("(()=>({url:location.href,title:document.title,ready:document.readyState,h1:[...document.querySelectorAll('h1')].map(x=>x.textContent),body:document.body?.innerText?.slice(0,900),scripts:[...document.scripts].map(x=>x.src).slice(-5)}))()");
  console.log('QA: failure DOM evidence '+JSON.stringify(page));
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
const report=JSON.stringify({issue:421,environment:'actual headless '+browserName+'/Blazor WASM',url:base,passed:checks.filter(x=>x.pass).length,total:checks.length,checks,errors},null,2);
// A failed Windows Chromium process teardown must not hide a completed
// browser test report. Flush the result, then let the owned-process
// PowerShell runner reap only its temporary Chrome children.
await new Promise((resolve,reject)=>process.stdout.write(report+'\n',err=>err?reject(err):resolve()));
process.exit(errors.length?1:0);
