#!/usr/bin/env node
// #552 live Bluent WebAssembly TabList scenario observations; never a parity/AT approval.
import {spawn} from 'node:child_process';
import {mkdtemp, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {createServer} from 'node:net';
import {setTimeout as sleep} from 'node:timers/promises';
const engine = (process.argv[2] || 'chrome').toLowerCase();
if (!['chrome','edge'].includes(engine)) throw Error('Use chrome or edge');
const executable = engine === 'chrome' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const root=resolve('.'), profile=await mkdtemp(join(tmpdir(),'bluent552-tablist-'));
let host, browser, socket, seq=0;
const pending=new Map();
const port=()=>new Promise((yes,no)=>{const s=createServer();s.once('error',no);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>yes(p));});});
const poll=async(fn,ms=45000)=>{const end=Date.now()+ms;while(Date.now()<end){try{const value=await fn();if(value)return value}catch{}await sleep(160)}throw Error('Polling timeout')};
const cdp=(method,params={})=>new Promise((yes,no)=>{const id=++seq;const t=setTimeout(()=>{pending.delete(id);no(Error(method+' timeout'));},18000);pending.set(id,{yes:v=>{clearTimeout(t);yes(v)},no:e=>{clearTimeout(t);no(e)}});socket.send(JSON.stringify({id,method,params}));});
const evalJs=async(expression)=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result?.value};
const key=async(k,code,vk)=>{for(const type of ['keyDown','keyUp'])await cdp('Input.dispatchKeyEvent',{type,key:k,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk,...(type==='keyDown' && k==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})});await sleep(130)};
async function stop(proc){if(!proc?.pid)return;await new Promise(ok=>{const x=spawn('taskkill',['/PID',String(proc.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});x.once('close',ok);x.once('error',ok);})}
const capture=()=>evalJs(`(()=>{
 const section=(name)=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()===name);return h?.nextElementSibling};
 const inspect=(name)=>{const root=section(name);const items=[...(root?.querySelectorAll('.tab-item')||[])];const panels=[...(root?.querySelectorAll('.tab-panel')||[])];return {name,items:items.map(x=>({tag:x.tagName,text:x.textContent.trim(),href:x.getAttribute('href'),role:x.getAttribute('role'),tabindex:x.getAttribute('tabindex'),ariaSelected:x.getAttribute('aria-selected'),ariaControls:x.getAttribute('aria-controls'),disabled:x.hasAttribute('disabled'),selected:x.classList.contains('selected'),focused:x===document.activeElement})),panels:panels.map(x=>({role:x.getAttribute('role'),labelledBy:x.getAttribute('aria-labelledby'),selected:x.classList.contains('selected'),visible:getComputedStyle(x).display!=='none'}))};};
 return {panel:inspect('With Panels'),links:inspect('Urls'),disabled:inspect('Disabled')};
})()`);
async function action(selector,kind) {
 const expr=`(()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()===${JSON.stringify(kind)});const root=h?.nextElementSibling;const tab=root?.querySelectorAll('.tab-item')[${selector}];if(!tab)throw Error('No item for '+${JSON.stringify(kind)});tab.scrollIntoView({block:'center'});tab.focus();return tab===document.activeElement})()`;
 return evalJs(expr);
}
try {
 const p=await port(), base='http://127.0.0.1:'+p;
 host=spawn('dotnet',['run','--project',join(root,'src/Bluent.UI.Demo/Bluent.UI.Demo.csproj'),'-c','Debug','--no-build','--no-launch-profile','--urls',base],{cwd:root,windowsHide:true,stdio:'ignore'});
 await poll(async()=>{const r=await fetch(base+'/components/tablists');return r.ok});
 browser=spawn(executable,['--headless=new','--no-first-run','--disable-extensions','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
 const bp=await poll(async()=>Number((await readFile(join(profile,'DevToolsActivePort'),'utf8')).trim().split(/\r?\n/)[0]));
 const tabs=await(await fetch('http://127.0.0.1:'+bp+'/json/list')).json(),tab=tabs.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
 if(!tab)throw Error('No browser tab');
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((yes,no)=>{socket.addEventListener('open',yes,{once:true});socket.addEventListener('error',no,{once:true})});
 socket.addEventListener('message',event=>{const r=JSON.parse(event.data),q=pending.get(r.id);if(!q)return;pending.delete(r.id);r.error?q.no(Error(JSON.stringify(r.error))):q.yes(r.result||{})});
 await cdp('Page.enable');await cdp('Runtime.enable');
 await cdp('Page.navigate',{url:base+'/components/tablists'});
 await poll(async()=>evalJs("!![...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Urls') && document.querySelectorAll('.tab-item').length>20"));
 await sleep(1100);
 const before=await capture();
 const focusPanelSecond=await action(1,'With Panels');
 await key('ArrowRight','ArrowRight',39);const afterArrow=await capture();
 await key('Enter','Enter',13);await sleep(450);const afterEnter=await capture();
 const focusDisabled=await action(1,'Disabled');const afterDisabledFocus=await capture();
 const focusLink=await action(1,'Urls');const afterLinkFocus=await capture();
 const result={issue:552,owner:465,engine,host:'actual Bluent WebAssembly Demo',scope:'observations only, not Fluent acceptance or AT signoff',before,focusPanelSecond,afterArrow,afterEnter,focusDisabled,afterDisabledFocus,focusLink,afterLinkFocus};
 const output=join(root,'docs/v3/quality/evidence/BLUENT-TABLIST-SCENARIOS-'+engine.toUpperCase()+'.json');
 await writeFile(output,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({engine,initialPanels:before.panel.panels.length,panelButtons:before.panel.items.length,links:before.links.items.map(x=>({tag:x.tag,href:x.href})),panelArrowFocusStayed:afterArrow.panel.items[1]?.focused,afterEnterSelected:afterEnter.panel.items.map(x=>x.selected),disabledTabFocus:focusDisabled,disabledAttributes:afterDisabledFocus.disabled.items.map(x=>x.disabled),linkFocus:focusLink}));
} catch(e){console.error(e.stack||String(e));process.exitCode=1}
finally {try{socket?.close()}catch{}await stop(browser);await stop(host);await rm(profile,{recursive:true,force:true,maxRetries:8,retryDelay:200}).catch(e=>console.error('Profile cleanup: '+e.message));}
