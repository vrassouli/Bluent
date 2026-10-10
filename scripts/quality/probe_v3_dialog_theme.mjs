#!/usr/bin/env node
/** Actual Bluent #417 DialogContainer theme inheritance probe.
 * Node 22+, local Chrome; demo must be running at optional URL argument.
 * No application source changes; isolated Chrome profile is removed.
 */
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const base=(process.argv[2]||'http://127.0.0.1:5080').replace(/\/$/,'');
const chrome=process.env.CHROME_PATH||(process.platform==='win32'?'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe':'/usr/bin/google-chrome');
const dir=await mkdtemp(join(tmpdir(),'bluent-v3-dialog-'));
let child,ws,seq=0;
const tasks=new Map();
const poll=async(fn,max=75)=>{for(let i=0;i<max;i++){try{const x=await fn();if(x)return x;}catch{}await sleep(200);}throw Error('Timeout awaiting browser/app');};
const send=(method,params={})=>new Promise((resolve,reject)=>{
 const id=++seq;
 const timer=setTimeout(()=>{tasks.delete(id);reject(Error('CDP timeout '+method));},10000);
 tasks.set(id,{resolve:x=>{clearTimeout(timer);resolve(x);},reject});
 ws.send(JSON.stringify({id,method,params}));
});
const evaluate=async expression=>{
 const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));
 return r.result?.value;
};
try{
 child=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-extensions','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+dir,'about:blank'],{stdio:'ignore'});
 const port=await poll(async()=>{const s=await readFile(join(dir,'DevToolsActivePort'),'utf8');return s.trim().split(/\r?\n/)[0];});
 const tabs=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();
 const tab=tabs.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
 if(!tab)throw Error('No CDP page found');
 ws=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
 ws.addEventListener('message',event=>{
  const m=JSON.parse(event.data);
  if(m.id&&tasks.has(m.id)){const t=tasks.get(m.id);tasks.delete(m.id);if(m.error)t.reject(Error(JSON.stringify(m.error)));else t.resolve(m.result||{});}
 });
 await send('Page.enable');await send('Runtime.enable');
 await send('Page.navigate',{url:base+'/components/dialogs'});
 await poll(async()=>await evaluate("!!document.querySelector('.page-content') && [...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Show default dialog')"),120);
 await evaluate("document.querySelector('.page-content').setAttribute('data-bui-theme','dark'); true");
 await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Show default dialog').click(); true");
 await poll(async()=>await evaluate("!!document.querySelector('.dialog-wrapper .bui-dialog')"),70);
 const js="(()=>{const scope=document.querySelector('.page-content'),wrapper=document.querySelector('.dialog-wrapper'),dialog=wrapper.querySelector('.bui-dialog'),token='--colorNeutralBackground1';return {htmlTheme:document.documentElement.getAttribute('data-bui-theme'),contentTheme:scope.getAttribute('data-bui-theme'),contentToken:getComputedStyle(scope).getPropertyValue(token).trim(),dialogToken:getComputedStyle(dialog).getPropertyValue(token).trim(),dialogBackground:getComputedStyle(dialog).backgroundColor,dialogInsideScopedContent:scope.contains(dialog),overlayInsideScopedContent:scope.contains(wrapper.querySelector('.bui-overlay')),dialogWrapperParentClass:wrapper.parentElement?.className||''};})()";
 const observed=await evaluate(js);
 // Additional non-blocking accessibility evidence from the existing styling lab.
 await send('Page.navigate',{url:base+'/v3/styling-lab'});
 await poll(async()=>await evaluate("[...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Preview overlay')"),120);
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 const reducedBefore=await evaluate("(()=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Primary action');return {queryMatches:matchMedia('(prefers-reduced-motion: reduce)').matches,buttonTransitionDuration:getComputedStyle(button).transitionDuration};})()");
 await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Preview overlay').click();true");
 await poll(async()=>await evaluate("!!document.querySelector('.v3-lab-surface .bui-overlay')"),60);
 const reducedAfter=await evaluate("(()=>{const overlay=document.querySelector('.v3-lab-surface .bui-overlay');return {overlayAnimationDuration:getComputedStyle(overlay).animationDuration,overlayAnimationName:getComputedStyle(overlay).animationName};})()");
 await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
 const forcedColors=await evaluate("(()=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Primary action'),surf=document.querySelector('.v3-lab-surface');return {queryMatches:matchMedia('(forced-colors: active)').matches,buttonBackground:getComputedStyle(button).backgroundColor,buttonText:getComputedStyle(button).color,surfaceBackground:getComputedStyle(surf).backgroundColor};})()");
 await evaluate("document.querySelector('.v3-lab-surface .bui-overlay').click();true");
 await poll(async()=>await evaluate("!document.querySelector('.v3-lab-surface .bui-overlay')"),40);
 await evaluate("document.querySelector('.v3-lab-field input').focus();true");
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:8});
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:8});
 const focusAndTargets=await evaluate("(()=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Preview overlay');const style=getComputedStyle(button),r=button.getBoundingClientRect(),field=document.querySelector('.v3-lab-field input');const f=field?.getBoundingClientRect();return {keyboardFocusOnPreviousButton:document.activeElement===button,buttonFocusVisible:button.matches(':focus-visible'),outlineStyle:style.outlineStyle,outlineWidth:style.outlineWidth,outlineColor:style.outlineColor,buttonWidth:Math.round(r.width),buttonHeight:Math.round(r.height),fieldWidth:f?Math.round(f.width):null,fieldHeight:f?Math.round(f.height):null};})()");
 await send('Emulation.setEmulatedMedia',{features:[]});
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
 await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Compact density').click();true");
 const mobileAndDensity=await evaluate("(()=>{const surf=document.querySelector('.v3-lab-surface'),button=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Primary action'),rect=button.getBoundingClientRect();return {viewportWidth:innerWidth,density:surf.dataset.density,buttonHeight:Math.round(rect.height),buttonWidth:Math.round(rect.width),documentScrollWidth:document.documentElement.scrollWidth};})()");
 const mediaObservations={reducedMotion:{...reducedBefore,...reducedAfter},forcedColors,focusAndTargets,mobileAndDensity};
 const passed=observed.contentTheme==='dark'&&observed.htmlTheme==='light'&&observed.contentToken.toLowerCase()==='#292929'&&['#fff','#ffffff'].includes(observed.dialogToken.toLowerCase())&&!observed.dialogInsideScopedContent&&!observed.overlayInsideScopedContent;
 console.log(JSON.stringify({classification:'real Bluent Debug WASM runtime, scoped theme experiment; NOT a proposed v3 fix',url:base+'/components/dialogs',observed,expected:'Dialog remains under the global light theme while the local page is dark',mediaObservations,passed},null,2));
 process.exitCode=passed?0:1;
}catch(e){console.error('probe_v3_dialog_theme: '+(e.stack||e));process.exitCode=1;}
finally{try{ws?.close()}catch{}try{child?.kill()}catch{}await sleep(250);try{await rm(dir,{recursive:true,force:true,maxRetries:3,retryDelay:250})}catch{}}