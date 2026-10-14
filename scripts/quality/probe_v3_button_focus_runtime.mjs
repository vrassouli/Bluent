#!/usr/bin/env node
/**
 * Bluent v3 #501: real existing Button demo/CDP keyboard & focus-visible research.
 * Optional, browser-injected preview styles ONLY; no production styles or APIs.
 * Usage: node scripts/quality/probe_v3_button_focus_runtime.mjs [http://127.0.0.1:5080]
 */
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const base=(process.argv[2]||'http://127.0.0.1:5080').replace(/\/$/,'');
const browser=process.env.CHROME_PATH||(process.platform==='win32'?'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe':'/usr/bin/google-chrome');
const profile=await mkdtemp(join(tmpdir(),'bluent-v3-button-focus-'));
let child,ws,id=0;
const callbacks=new Map(),results=[],issues=[];
const poll=async(fn,limit=110)=>{for(let i=0;i<limit;i++){try{const v=await fn();if(v)return v;}catch{}await sleep(250);}throw Error('Timed out waiting for interactive Button demo');};
const send=(method,params={})=>new Promise((resolve,reject)=>{
 const task=++id,timer=setTimeout(()=>{callbacks.delete(task);reject(Error('CDP timeout '+method));},12000);
 callbacks.set(task,{resolve:v=>{clearTimeout(timer);resolve(v);},reject:e=>{clearTimeout(timer);reject(e);}});
 ws.send(JSON.stringify({id:task,method,params}));
});
const run=async js=>{const r=await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error('JS: '+r.exceptionDetails.text+' / '+js.slice(0,140));return r.result?.value;};
const assert=(name,yes,detail)=>{results.push({name,pass:!!yes,...(detail?{detail}: {})});if(!yes)issues.push(name);};
const key=async(name,code,vk,modifiers=0)=>{
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:name,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk,modifiers,...(name===' '?{text:' '}:name==='Enter'?{text:'\r'}:{})});
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:name,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk,modifiers});
 await sleep(100);
};
const jsSplit=String.raw`(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Split button');const group=h?.parentElement?.querySelector('.bui-button-group');return group?[...group.querySelectorAll(':scope > .bui-button')]:[];})()`;
const splitState=String.raw`(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Split button');const g=h?.parentElement?.querySelector('.bui-button-group'),xs=[...g?.querySelectorAll(':scope > .bui-button')||[]];return {found:!!g,count:xs.length,items:xs.map((b,i)=>{const r=b.getBoundingClientRect(),s=getComputedStyle(b);return {index:i,active:document.activeElement===b,focusVisible:b.matches(':focus-visible'),disabled:b.disabled,outlineWidth:s.outlineWidth,outlineStyle:s.outlineStyle,outlineOffset:s.outlineOffset,boxShadow:s.boxShadow,width:r.width,height:r.height,x:r.x,y:r.y,radiusTL:s.borderTopLeftRadius,radiusTR:s.borderTopRightRadius};})};})()`;
const previewCss=String.raw`
/* #501 isolated browser-injected candidate. NOT shipping CSS or finalized #418 tokens. */
body.v3-button-focus-research .bui-button:focus-visible {
  outline: 2px solid var(--colorNeutralForeground1, #242424) !important;
  outline-offset: 2px;
}
body.v3-button-focus-research .bui-button-group > .bui-button:focus-visible {
  outline: 2px solid var(--colorNeutralForeground1, #242424) !important;
  outline-offset: -3px !important;
  box-shadow: inset 0 0 0 1px var(--colorNeutralBackground1, white) !important;
  z-index: 1;
}
body.v3-button-focus-research .bui-button:disabled { outline: none !important; }
@media (forced-colors: active) {
  body.v3-button-focus-research .bui-button:focus-visible {
    outline: 2px solid Highlight !important;
    outline-offset: 2px;
    box-shadow: none !important;
  }
  body.v3-button-focus-research .bui-button-group > .bui-button:focus-visible { outline-offset: -3px !important; }
}
`;

try{
 child=spawn(browser,['--headless=new','--no-sandbox','--disable-gpu','--disable-extensions','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
 const port=await poll(async()=>{const p=await readFile(join(profile,'DevToolsActivePort'),'utf8');return p.trim().split(/\r?\n/)[0];});
 const tabs=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();
 const tab=tabs.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
 if(!tab)throw Error('No Chrome debug tab');
 ws=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&callbacks.has(m.id)){const c=callbacks.get(m.id);callbacks.delete(m.id);m.error?c.reject(Error(JSON.stringify(m.error))):c.resolve(m.result||{});}});
 await send('Page.enable');await send('Runtime.enable');
 await send('Page.navigate',{url:base+'/components/buttons'});
 await poll(async()=>await run("(()=>document.readyState==='complete'&&[...document.querySelectorAll('h5')].some(h=>h.textContent.trim()==='Split button')&&document.querySelectorAll('.bui-button').length>25)()"));
 // The existing SSR /components/buttons endpoint is statically rendered. Do not
 // mistake its inert event handlers for a Button keyboard regression.
 if (!await run("!!document.querySelector('script[src*=\\\"blazor.webassembly.js\\\"]')")) {
   throw Error('This #501 keyboard probe needs the interactive WebAssembly demo; static SSR /components/buttons has no Blazor event handlers. Use the WASM host, or build an explicit InteractiveServer fixture under #428.');
 }
 const initial=await run(splitState);
 assert('real Bluent Split renders two separately focusable button elements',initial.found&&initial.count===2,initial);
 const disabled=await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Disabled');return [...h?.parentElement?.querySelectorAll('button')||[]].map(x=>({disabled:x.disabled,tabIndex:x.tabIndex}));})()");
 assert('disabled demo has disabled native Button',disabled.some(x=>x.disabled),disabled);
 // Test the actual Tab order, rather than checking only the disabled attribute.
 await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Disabled');h.parentElement.querySelector('button').focus();return true;})()");
 await key('Tab','Tab',9);
 const disabledSkip=await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Disabled'),a=[...h.parentElement.querySelectorAll('button')];return {disabledActive:document.activeElement===a[1],activeTag:document.activeElement?.tagName,disabledActual:a[1]?.disabled};})()");
 assert('Tab skips the native disabled button',disabledSkip.disabledActual&&!disabledSkip.disabledActive,disabledSkip);
 // Inject #501 candidate only in headless browser, never disk CSS or NuGet.
 await run("(()=>{document.body.classList.add('v3-button-focus-research');const s=document.createElement('style');s.id='v3-issue501-candidate';s.textContent="+JSON.stringify(previewCss)+";document.head.append(s);return true;})()");
 // Genuine CDP keyboard navigation from main to popup segment and backwards.
 await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Split button');h.parentElement.querySelector('.bui-button-group > .bui-button:first-child').focus();return true;})()");
 const first=await run(splitState);
 await key('Tab','Tab',9);
 const second=await run(splitState);
 assert('Tab moves from Split main to menu',first.items?.[0]?.active&&second.items?.[1]?.active,second);
 assert('Split menu shows focus-visible and >=2px outline',second.items?.[1]?.focusVisible&&parseFloat(second.items[1].outlineWidth)>=2,second);
 const stable=first.items.every((b,i)=>Math.abs(b.width-second.items[i].width)<0.1&&Math.abs(b.height-second.items[i].height)<0.1&&Math.abs(b.x-second.items[i].x)<0.1);
 assert('Split focus does not cause button layout shift',stable,{before:first.items,after:second.items});
 assert('Split focus outline is inset rather than covering adjacent action',parseFloat(second.items?.[1]?.outlineOffset)<0,second.items?.[1]);
 await key('Tab','Tab',9,8);
 const back=await run(splitState);
 assert('Shift+Tab returns to Split main action',back.items?.[0]?.active&&back.items?.[0]?.focusVisible,back);
 // Confirm the native Button handles pointer vs keyboard :focus-visible.
 const pointer=await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Split button'),b=h.parentElement.querySelector('.bui-button-group > .bui-button:first-child'),r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()");
 // Change focus to a different button with the pointer first: clicking the
 // already-keyboard-focused element may legally retain :focus-visible.
 const other=await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Split button'),b=h.parentElement.querySelectorAll('.bui-button-group > .bui-button')[1],r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()");
 await send('Input.dispatchMouseEvent',{type:'mousePressed',x:other.x,y:other.y,button:'left',clickCount:1});
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:other.x,y:other.y,button:'left',clickCount:1});
 await sleep(150);
 await send('Input.dispatchMouseEvent',{type:'mousePressed',x:pointer.x,y:pointer.y,button:'left',clickCount:1});
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:pointer.x,y:pointer.y,button:'left',clickCount:1});
 const mouse=await run(splitState);
 assert('mouse activation does not require keyboard focus ring',!mouse.items?.[0]?.focusVisible,mouse.items?.[0]);
 // Direction probe keeps distinct segments and geometric positions (do not assume OS/tab reversal).
 await run("(()=>{document.documentElement.setAttribute('dir','rtl');document.body.classList.add('rtl');return true;})()");
 const rtl=await run(splitState);
 assert('RTL split still has two adjacent native button targets',rtl.count===2&&Math.abs(rtl.items[0].x+rtl.items[0].width-rtl.items[1].x)<2||rtl.count===2&&Math.abs(rtl.items[1].x+rtl.items[1].width-rtl.items[0].x)<2,rtl);
 await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Split button');h.parentElement.querySelector('.bui-button-group > .bui-button:first-child').focus();return true;})()");
 await key('Tab','Tab',9);
 const rtlMenu=await run(splitState);
 assert('RTL Tab still reaches Split menu independently',rtlMenu.items?.[1]?.active,rtlMenu);
 // Accessibility diagnostic: component toggle semantic gap must not be silently treated as passed.
 const toggle=await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Toggle');const x=h.parentElement.querySelector('button');return {present:!!x,pressed:x?.getAttribute('aria-pressed')??null,cls:x?.className};})()");
 assert('existing toggle specimen is present',toggle.present,toggle);
 await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Toggle');h.parentElement.querySelector('button').focus();return true;})()");
 await key(' ','Space',32);
 const space=await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Toggle');const b=h.parentElement.querySelector('button');return {toggled:b.classList.contains('toggled'),pressed:b.getAttribute('aria-pressed'),focusVisible:b.matches(':focus-visible')};})()");
 assert('native Space activates the existing Button toggle state',space.toggled,space);
 assert('keyboard-toggled Button remains focus-visible',space.toggled&&space.focusVisible,space);
 // Danger is a real ButtonAppearance, not a mock in a Penpot-only sample.
 await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Appearance');h.parentElement.querySelectorAll('button')[1].focus();return true;})()");
 await key('Tab','Tab',9);
 const danger=await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Appearance'),b=[...h.parentElement.querySelectorAll('button')].find(x=>x.classList.contains('danger')),s=b?getComputedStyle(b):null,r=b?.getBoundingClientRect();return {present:!!b,active:document.activeElement===b,visible:b?.matches(':focus-visible'),outline:s?.outlineStyle,outlineWidth:s?.outlineWidth,bounds:r?{w:r.width,h:r.height}:null};})()");
 assert('real Danger appearance receives keyboard focus-visible ring',danger.present&&danger.active&&danger.visible&&danger.outline==='solid'&&parseFloat(danger.outlineWidth)>=2,danger);
 const semanticGap=!space.pressed;
 // Enter on a separate primary toggle verifies native keyboard activation in the real host.
 await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Toggle');h.parentElement.querySelectorAll('button')[1].focus();return true;})()");
 await run("(()=>{window.__v3EnterTrace=[];const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Toggle'),b=h.parentElement.querySelectorAll('button')[1];for(const type of ['click','keydown','keyup'])b.addEventListener(type,e=>window.__v3EnterTrace.push({type:e.type,key:e.key||null,trusted:e.isTrusted}),true);return true;})()");
 const beforeEnter=await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Toggle'),b=h.parentElement.querySelectorAll('button')[1];return {toggled:b.classList.contains('toggled'),focused:document.activeElement===b};})()");
 await key('Enter','Enter',13);
 await sleep(250);
 const enter=await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Toggle');const b=h.parentElement.querySelectorAll('button')[1];return {toggled:b.classList.contains('toggled'),pressed:b.getAttribute('aria-pressed'),focused:document.activeElement===b,events:window.__v3EnterTrace,before:"+JSON.stringify(beforeEnter)+"};})()");
 assert('native Enter activates Button toggle state',enter.toggled,enter);
 // High-contrast emulation exercises actual Windows color fallback selector.
 await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
 await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Split button');h.parentElement.querySelector('.bui-button-group > .bui-button:first-child').focus();return true;})()");
 await key('Tab','Tab',9);
 const forced=await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Split button'),b=h.parentElement.querySelectorAll('.bui-button-group > .bui-button')[1],s=getComputedStyle(b);return {forced:matchMedia('(forced-colors: active)').matches,visible:b.matches(':focus-visible'),width:s.outlineWidth,style:s.outlineStyle,color:s.outlineColor,offset:s.outlineOffset};})()");
 assert('emulated forced-colors retains visible native Split keyboard outline',forced.forced&&forced.visible&&parseFloat(forced.width)>=2&&forced.style==='solid',forced);
 console.log(JSON.stringify({classification:'Real Chrome CDP on unmodified Bluent WASM demo; candidate style injected into transient browser tab only (#501)',url:base+'/components/buttons',assertions:results.length,passed:results.length-issues.length,failed:issues.length,issues,observations:{initialSplit:initial,disabled,pointer:mouse,rtl,space,enter,forced,knownAriaPressedGap:semanticGap},checks:results},null,2));
 process.exitCode=issues.length?1:0;
}catch(e){console.error('probe_v3_button_focus_runtime: '+(e.stack||e));process.exitCode=1;}
finally{try{ws?.close();}catch{}try{child?.kill();}catch{}await sleep(200);try{await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:300});}catch{}}
