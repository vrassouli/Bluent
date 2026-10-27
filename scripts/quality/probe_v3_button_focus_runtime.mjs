#!/usr/bin/env node
/**
 * Bluent v3 #428/#501: real existing Button toggle semantics and focus-visible research.
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
const toggleAx = async (buttonIndex) => {
 const evaluated = await send('Runtime.evaluate', {expression:`(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Toggle');return h?.parentElement?.querySelectorAll('button')[${buttonIndex}]||null;})()`,returnByValue:false,awaitPromise:true});
 const objectId=evaluated.result?.objectId;
 if(!objectId) throw Error('Could not resolve the real Button DOM node for the AX check');
 try {
  const tree=await send('Accessibility.getPartialAXTree',{objectId,fetchRelatives:false});
  const node=tree.nodes.find(n=>n.role?.value==='button')||tree.nodes[0];
  const pressed=node?.properties?.find(p=>p.name==='pressed');
  return {role:node?.role?.value||null,name:node?.name?.value||null,pressedPropertyPresent:!!pressed,pressedValue:pressed?.value?.value??null,pressedType:pressed?.value?.type||null};
 } finally { await send('Runtime.releaseObject',{objectId}); }
};
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
 await send('Page.enable');await send('Runtime.enable');await send('DOM.enable');await send('Accessibility.enable');
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
 assert('false Toggled renders aria-pressed=false',toggle.pressed==='false',toggle);
 const initialToggleAx=await toggleAx(0);
 assert('false Toggled exposes AX pressed=false',initialToggleAx.role==='button'&&initialToggleAx.pressedPropertyPresent&&initialToggleAx.pressedValue==='false'&&initialToggleAx.pressedType==='tristate',initialToggleAx);
const boundToggleMatrix = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Toggle\");const bs=[...h.parentElement.querySelectorAll(\"button\")];return {count:bs.length,pressed:bs.map(b=>b.getAttribute(\"aria-pressed\")),state:h.parentElement.querySelector(\"p\")?.textContent??\"\",classes:bs.map(b=>b.className)};})()");
  assert("demo exposes six initially unpressed bound toggle appearances", boundToggleMatrix.count === 6 && boundToggleMatrix.pressed.every(value => value === "false"), boundToggleMatrix);
  assert("visible demo feedback starts Off for every appearance", ["Default: Off","Primary: Off","Danger: Off","Outline: Off","Subtle: Off","Transparent: Off"].every(value => boundToggleMatrix.state.includes(value)), boundToggleMatrix);
  await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Toggle\");h.parentElement.querySelectorAll(\"button\")[3].focus();return true;})()");
  await key(" ", "Space", 32);
  await sleep(250);
  const outlineBoundOn = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Toggle\");const b=h.parentElement.querySelectorAll(\"button\")[3];return {pressed:b.getAttribute(\"aria-pressed\"),toggled:b.classList.contains(\"toggled\"),state:h.parentElement.querySelector(\"p\")?.textContent??\"\"};})()");
  assert("Space updates the bound Outline toggle and visible state", outlineBoundOn.pressed === "true" && outlineBoundOn.toggled && outlineBoundOn.state.includes("Outline: On"), outlineBoundOn);
  await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Toggle\");h.parentElement.querySelectorAll(\"button\")[3].focus();return true;})()");
  await key(" ", "Space", 32);
  await sleep(250);
  const outlineBoundOff = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Toggle\");const b=h.parentElement.querySelectorAll(\"button\")[3];return {pressed:b.getAttribute(\"aria-pressed\"),toggled:b.classList.contains(\"toggled\"),state:h.parentElement.querySelector(\"p\")?.textContent??\"\"};})()");
  assert("second Space returns the bound Outline toggle to Off", outlineBoundOff.pressed === "false" && !outlineBoundOff.toggled && outlineBoundOff.state.includes("Outline: Off"), outlineBoundOff);

  const explicitToggleStart = await run(String.raw`(()=>{const h=[...document.querySelectorAll("h5")].find(x=>x.textContent.trim()==="Explicit ToggledChanged callback"),b=h?.parentElement.querySelector('button[data-demo-toggle-callback="true"]'),status=h?.parentElement.querySelector("[data-demo-toggle-callback-status]");if(b)b.scrollIntoView({block:"center"});const r=b?.getBoundingClientRect();return {found:!!b,tag:b?.tagName,pressed:b?.getAttribute("aria-pressed"),name:b?.innerText.trim(),state:status?.innerText.trim(),x:r?r.left+r.width/2:null,y:r?r.top+r.height/2:null};})()`);
  assert("explicit ToggledChanged example starts Off with zero callbacks and a stable accessible name", explicitToggleStart.found && explicitToggleStart.tag==="BUTTON" && explicitToggleStart.pressed==="false" && explicitToggleStart.name==="Explicit callback toggle" && explicitToggleStart.state.includes("Explicit toggle state: Off") && explicitToggleStart.state.includes("ToggledChanged calls: 0"), explicitToggleStart);
  await send("Input.dispatchMouseEvent", {type:"mousePressed",x:explicitToggleStart.x,y:explicitToggleStart.y,button:"left",clickCount:1});
  await send("Input.dispatchMouseEvent", {type:"mouseReleased",x:explicitToggleStart.x,y:explicitToggleStart.y,button:"left",clickCount:1});
  await sleep(250);
  const explicitToggleOn = await run(String.raw`(()=>{const b=document.querySelector('button[data-demo-toggle-callback="true"]'),status=document.querySelector("[data-demo-toggle-callback-status]");return {pressed:b?.getAttribute("aria-pressed"),toggled:b?.classList.contains("toggled"),name:b?.innerText.trim(),state:status?.innerText.trim()};})()`);
  assert("trusted pointer invokes explicit ToggledChanged exactly once and updates On state", explicitToggleOn.pressed==="true" && explicitToggleOn.toggled && explicitToggleOn.name==="Explicit callback toggle" && explicitToggleOn.state.includes("Explicit toggle state: On") && explicitToggleOn.state.includes("ToggledChanged calls: 1"), explicitToggleOn);
  await run(String.raw`(()=>{document.querySelector('button[data-demo-toggle-callback="true"]')?.focus();return true;})()`);
  await key(" ","Space",32);
  await sleep(250);
  const explicitToggleOff = await run(String.raw`(()=>{const b=document.querySelector('button[data-demo-toggle-callback="true"]'),status=document.querySelector("[data-demo-toggle-callback-status]");return {pressed:b?.getAttribute("aria-pressed"),toggled:b?.classList.contains("toggled"),name:b?.innerText.trim(),state:status?.innerText.trim()};})()`);
  assert("native Space invokes explicit ToggledChanged once more and returns Off", explicitToggleOff.pressed==="false" && !explicitToggleOff.toggled && explicitToggleOff.name==="Explicit callback toggle" && explicitToggleOff.state.includes("Explicit toggle state: Off") && explicitToggleOff.state.includes("ToggledChanged calls: 2"), explicitToggleOff);
  const layoutOptions = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Layout, orientation and density\");const bs=[...h.parentElement.querySelectorAll(\"button\")];return {count:bs.length,classes:bs.map(b=>b.className),labels:bs.map(b=>b.getAttribute(\"aria-label\"))};})()");
  assert("Compact, Vertical and Rotated demo cases map to their current public properties", layoutOptions.count === 3 && layoutOptions.classes[0].includes("compact") && layoutOptions.classes[1].includes("vertical") && layoutOptions.classes[2].includes("rotated"), layoutOptions);
  const rootStyle = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Styling and native attributes\");const b=[...h?.parentElement?.querySelectorAll(\"button\")||[]].find(b=>b.getAttribute(\"data-demo-case\")===\"root-style\");const s=b?getComputedStyle(b):null;return {found:!!b,classApplied:b?.classList.contains(\"fw-semibold\")??false,inlineStyle:b?.getAttribute(\"style\")??\"\",minWidth:s?.minWidth??\"\",dataCase:b?.getAttribute(\"data-demo-case\")??\"\",attributeSibling:!!h?.parentElement?.querySelector(\"[data-demo-case=root-attributes]\")};})()");
  assert("Class, Style and data attributes are forwarded to the native Button", rootStyle.found && rootStyle.classApplied && rootStyle.minWidth === "128px" && rootStyle.dataCase === "root-style" && rootStyle.attributeSibling, rootStyle);
  const badgeExamples = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Badge and notification\");const bs=[...h.parentElement.querySelectorAll(\"button\")];const labels=[...h.parentElement.querySelectorAll(\"[aria-label]\")].map(x=>x.getAttribute(\"aria-label\"));return {count:bs.length,badged:bs.map(b=>b.classList.contains(\"badged\")),wrappers:h.parentElement.querySelectorAll(\".badge-wrapper\").length,labels};})()");
  assert("Badge examples render both positioned wrappers and accessible labels", badgeExamples.count === 4 && badgeExamples.badged.every(Boolean) && badgeExamples.wrappers === 4 && badgeExamples.labels.includes("3 unread notifications") && badgeExamples.labels.includes("New updates") && badgeExamples.labels.includes("Archive alert") && badgeExamples.labels.includes("4 open tasks"), badgeExamples);
  const badgePositionMatrix = await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Badge and notification');const bs=[...h.parentElement.querySelectorAll('button')];const wrappers=[...h.parentElement.querySelectorAll('.badge-wrapper')];return {buttonCount:bs.length,allBadged:bs.every(b=>b.classList.contains('badged')),positions:wrappers.map(w=>({classes:w.className,top:getComputedStyle(w).top,bottom:getComputedStyle(w).bottom,left:getComputedStyle(w).left,right:getComputedStyle(w).right})),labels:[...h.parentElement.querySelectorAll('[aria-label]')].map(x=>x.getAttribute('aria-label'))};})()");
  assert("Badge placement covers Start/End crossed with Top/Bottom", badgePositionMatrix.buttonCount===4 && badgePositionMatrix.allBadged && badgePositionMatrix.positions.length===4 && [["top","start"],["bottom","end"],["bottom","start"],["top","end"]].every(expected=>badgePositionMatrix.positions.some(item=>expected.every(token=>item.classes.split(" ").includes(token)))) && ["3 unread notifications","New updates","Archive alert","4 open tasks"].every(label=>badgePositionMatrix.labels.includes(label)), badgePositionMatrix);
  const inspectTooltipTrigger = async label => {
    const expression = "(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Tooltip');const b=[...h?.parentElement?.querySelectorAll('button')||[]].find(b=>b.textContent.includes(" + JSON.stringify(label) + "));if(!b)return null;b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return {id:b.id,text:b.textContent.trim(),x:r.left+r.width/2,y:r.top+r.height/2,tag:b.tagName};})()";
    return await run(expression);
  };
  const inspectTooltipSurface = async id => {
    const expression = "(()=>{const trigger=document.getElementById(" + JSON.stringify(id) + "),surface=document.getElementById(" + JSON.stringify(id + "_surface") + ");return {triggerFound:!!trigger,exists:!!surface,hidden:!surface||surface.classList.contains('hidden'),visible:!!surface&&!surface.classList.contains('hidden')&&surface.classList.contains('show'),classes:surface?.className??'',text:surface?.innerText?.trim()??'',arrow:!!surface?.querySelector(':scope > .arrow'),rect:surface?(()=>{const r=surface.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};})():null};})()";
    return await run(expression);
  };
  const waitTooltipState = async (id, expectedVisible) => {
    let state;
    for (let attempt=0;attempt<60;attempt++) {
      state=await inspectTooltipSurface(id);
      if (expectedVisible ? state.visible : state.hidden) { await sleep(80); state=await inspectTooltipSurface(id); if (expectedVisible ? state.visible : state.hidden) return state; }
      await sleep(100);
    }
    return state;
  };
  const stringTooltip = await inspectTooltipTrigger("String tooltip");
  assert("String Tooltip button has a real DOM trigger id", !!stringTooltip?.id && stringTooltip.tag==="BUTTON", stringTooltip);
  if (stringTooltip?.id) {
    await send("Input.dispatchMouseEvent",{type:"mouseMoved",x:stringTooltip.x,y:stringTooltip.y});
    const shown=await waitTooltipState(stringTooltip.id,true);
    assert("Tooltip string, Brand appearance, Right placement and arrow render on hover", shown.visible && shown.text.includes("String tooltip content") && shown.classes.includes("brand") && shown.classes.includes("right") && shown.arrow, shown);
    await send("Input.dispatchMouseEvent",{type:"mouseMoved",x:8,y:8});
    const hidden=await waitTooltipState(stringTooltip.id,false);
    assert("String Tooltip hides when pointer leaves its trigger", hidden.hidden, hidden);
  }
  const defaultTooltip = await inspectTooltipTrigger("Button with tooltip");
  assert("TooltipContent example has a real DOM trigger id", !!defaultTooltip?.id && defaultTooltip.tag==="BUTTON", defaultTooltip);
  if (defaultTooltip?.id) {
    await run("(()=>{const b=document.getElementById(" + JSON.stringify(defaultTooltip.id) + ");b.focus();return true;})()");
    const shown=await waitTooltipState(defaultTooltip.id,true);
    assert("TooltipContent fragment shows on keyboard focus with default appearance/Top placement", shown.visible && shown.text.includes("This is a tooltip!") && shown.classes.includes("default") && shown.classes.includes("top") && !shown.arrow, shown);
    await run("(()=>{document.getElementById(" + JSON.stringify(defaultTooltip.id) + ").blur();return true;})()");
    const hidden=await waitTooltipState(defaultTooltip.id,false);
    assert("TooltipContent hides after its trigger blurs", hidden.hidden, hidden);
  }
  const invertedTooltip=await inspectTooltipTrigger("Inverted tooltip");
  assert("Inverted TooltipContent example has a real DOM trigger id", !!invertedTooltip?.id && invertedTooltip.tag==="BUTTON", invertedTooltip);
  if (invertedTooltip?.id) {
    await run("(()=>{const b=document.getElementById(" + JSON.stringify(invertedTooltip.id) + ");b.focus();return true;})()");
    const shown=await waitTooltipState(invertedTooltip.id,true);
    assert("Inverted TooltipContent shows on focus with BottomEnd placement and arrow", shown.visible && shown.text.includes("Keyboard tooltip content") && shown.classes.includes("inverted") && shown.classes.includes("bottom-end") && shown.arrow, shown);
    await run("(()=>{document.getElementById(" + JSON.stringify(invertedTooltip.id) + ").blur();return true;})()");
    const hidden=await waitTooltipState(invertedTooltip.id,false);
    assert("Inverted TooltipContent hides after blur", hidden.hidden, hidden);
  }
  const tooltipPlacementNames = ["Top", "Bottom", "Left", "Right", "TopStart", "TopEnd", "RightStart", "RightEnd", "BottomStart", "BottomEnd", "LeftStart", "LeftEnd"];
  const tooltipPlacementMatrix = await run("(() => { const xs=[...document.querySelectorAll('button[data-demo-tooltip-placement]')]; return {count:xs.length,items:xs.map(b=>({placement:b.dataset.demoTooltipPlacement,text:b.textContent.trim(),id:b.id,hasIcon:[...b.querySelectorAll('.icon,.active-icon')].every(x=>x.getAttribute('aria-hidden')==='true')}))}; })()");
  assert("Tooltip placement matrix exposes all twelve public Placement values with named controls", tooltipPlacementMatrix.count===tooltipPlacementNames.length && tooltipPlacementNames.every(p=>tooltipPlacementMatrix.items.some(x=>x.placement===p && x.text===`Tooltip ${p}` && !!x.id && x.hasIcon)), tooltipPlacementMatrix);
  for (const placement of tooltipPlacementNames) {
    const trigger = await run(`(() => { const b=[...document.querySelectorAll('button[data-demo-tooltip-placement]')].find(x=>x.dataset.demoTooltipPlacement===${JSON.stringify(placement)}); if(!b)return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return {id:b.id,text:b.textContent.trim(),x:r.left+r.width/2,y:r.top+r.height/2,tag:b.tagName}; })()`);
    assert(`Tooltip ${placement} matrix trigger renders as a native Button`, !!trigger?.id && trigger.tag==="BUTTON" && trigger.text===`Tooltip ${placement}`, trigger);
    if (!trigger?.id) continue;
    await send("Input.dispatchMouseEvent", {type:"mouseMoved", x:trigger.x, y:trigger.y});
    const shown = await waitTooltipState(trigger.id, true);
    const expectedClass = placement.replace(/[A-Z]/g, letter=>`-${letter.toLowerCase()}`).replace(/^-/, "");
    assert(`Tooltip ${placement} displays the matching placement and arrow on hover`, shown.visible && shown.text.includes(`Tooltip placement: ${placement}`) && shown.classes.split(/\s+/).includes(expectedClass) && shown.arrow, shown);
    await send("Input.dispatchMouseEvent", {type:"mouseMoved", x:1, y:1});
    const hidden = await waitTooltipState(trigger.id, false);
    assert(`Tooltip ${placement} hides when the pointer leaves its trigger`, hidden.hidden, hidden);
  }

  const buttonVariantAppearances = ["Default", "Primary", "Danger", "Outline", "Subtle", "Transparent"];
  const buttonVariantSizes = ["Small", "Medium", "Large"];
  const buttonVariantShapes = ["Rounded", "Circular", "Square"];
  const expectedButtonVariants = buttonVariantAppearances.flatMap(appearance => buttonVariantSizes.flatMap(size => buttonVariantShapes.map(shape => ({appearance,size,shape,key:`${appearance}-${size}-${shape}`}))));
  const buttonVariantMatrix = await run(String.raw`(()=>{const xs=[...document.querySelectorAll('button[data-demo-button-variant]')];return {count:xs.length,items:xs.map(b=>({key:b.dataset.demoButtonVariant,text:b.textContent.trim(),id:b.id,tag:b.tagName,classes:[...b.classList],height:b.getBoundingClientRect().height,visible:!!(b.offsetWidth||b.offsetHeight||b.getClientRects().length)}))};})()`);
  const foundVariantKeys = buttonVariantMatrix.items.map(x=>x.key);
  assert("Button appearance/size/shape matrix renders all 54 combinations exactly once", buttonVariantMatrix.count===54 && new Set(foundVariantKeys).size===54 && expectedButtonVariants.every(x=>buttonVariantMatrix.items.some(y=>y.key===x.key && y.id && y.tag==="BUTTON" && y.visible && y.text===`${x.size} ${x.shape}`)), {count:buttonVariantMatrix.count,expected:expectedButtonVariants.length,duplicates:foundVariantKeys.length-new Set(foundVariantKeys).size,missing:expectedButtonVariants.filter(x=>!foundVariantKeys.includes(x.key)).map(x=>x.key)});
  for (const variant of expectedButtonVariants) {
    const item = buttonVariantMatrix.items.find(x=>x.key===variant.key);
    const appearanceClasses = ["primary","danger","outline","subtle","transparent"];
    const sizeClasses = ["small","large"];
    const shapeClasses = ["circular","square"];
    const hasExpectedClasses = !!item && item.classes.includes("bui-button") && appearanceClasses.every(c=>item.classes.includes(c)===(c===variant.appearance.toLowerCase())) && sizeClasses.every(c=>item.classes.includes(c)===(c===variant.size.toLowerCase())) && shapeClasses.every(c=>item.classes.includes(c)===(c===variant.shape.toLowerCase()));
    assert(`Button ${variant.key} maps to the expected runtime classes`, hasExpectedClasses, {variant:variant.key,classes:item?.classes});
  }
  const dropdownExample = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Dropdown button\");const b=[...h.parentElement.querySelectorAll(\"button\")].find(b=>b.textContent.includes(\"Menu above\"));return {found:!!b,text:b?.textContent.trim()??\"\",hasCaret:!!b?.querySelector(\".dropdown-icon\"),disabled:b?.disabled??null};})()");
  assert("top-placement Dropdown example renders a live caret trigger", dropdownExample.found && dropdownExample.hasCaret && !dropdownExample.disabled, dropdownExample);
  const noCaretSnapshot = await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Dropdown button');const b=[...h?.parentElement?.querySelectorAll('button')||[]].find(b=>b.textContent.includes('Menu without caret'));if(!b)return null;return {id:b.id,hasCaret:!!b.querySelector('.dropdown-icon'),hasPopup:b.getAttribute('aria-haspopup'),expanded:b.getAttribute('aria-expanded'),controls:b.getAttribute('aria-controls'),controlsTargetExists:!!document.getElementById(b.getAttribute('aria-controls'))};})()");
  assert("popup expansion semantics do not require a visible dropdown caret", !!noCaretSnapshot && !noCaretSnapshot.hasCaret && noCaretSnapshot.hasPopup===null && noCaretSnapshot.expanded==="false" && !!noCaretSnapshot.id && noCaretSnapshot.controls===noCaretSnapshot.id+"_surface" && noCaretSnapshot.controlsTargetExists, noCaretSnapshot);
  const inspectDropdownTrigger = async label => {
    const expression = "(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Dropdown button');const b=[...h?.parentElement?.querySelectorAll('button')||[]].find(b=>b.textContent.includes(" + JSON.stringify(label) + "));if(!b)return null;b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return {id:b.id,hasPopup:b.getAttribute('aria-haspopup'),expanded:b.getAttribute('aria-expanded'),controls:b.getAttribute('aria-controls'),controlsTargetExists:!!document.getElementById(b.getAttribute('aria-controls')),x:r.left+r.width/2,y:r.top+r.height/2,bounds:{left:r.left,right:r.right,top:r.top,bottom:r.bottom}};})()";
    return await run(expression);
  };
  const inspectDropdownSurface = async id => {
    const expression = "(()=>{const trigger=document.getElementById(" + JSON.stringify(id) + "),surface=document.getElementById(" + JSON.stringify(id + "_surface") + ");if(!trigger)return {triggerFound:false,exists:!!surface,hidden:true,visible:false};const tr=trigger.getBoundingClientRect(),r=surface?.getBoundingClientRect(),copy=surface?[...surface.querySelectorAll('.menu-item')].find(x=>x.textContent.includes('Copy')):null,cr=copy?.getBoundingClientRect();return {triggerFound:true,triggerFocused:document.activeElement===trigger,exists:!!surface,hidden:!surface||surface.classList.contains('hidden'),visible:!!surface&&!surface.classList.contains('hidden')&&surface.classList.contains('show'),popup:{hasPopup:trigger.getAttribute('aria-haspopup'),expanded:trigger.getAttribute('aria-expanded'),controls:trigger.getAttribute('aria-controls'),controlsTargetExists:!!document.getElementById(trigger.getAttribute('aria-controls'))},placement:surface?['top-start','top-end','bottom-start','bottom-end','left-start','left-end','right-start','right-end','top','bottom','left','right'].find(x=>surface.classList.contains(x))??null:null,viewport:{width:window.innerWidth,height:window.innerHeight},trigger:{left:tr.left,right:tr.right,top:tr.top,bottom:tr.bottom},surface:r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}:null,hasCopy:!!copy,copyPoint:cr?{x:cr.left+cr.width/2,y:cr.top+cr.height/2}:null,items:surface?[...surface.querySelectorAll('.menu-item')].map(x=>x.textContent.trim()):[]};})()";
    return await run(expression);
  };
  const waitDropdownState = async (id, expectedVisible) => {
    let state;
    for (let attempt = 0; attempt < 50; attempt++) {
      state = await inspectDropdownSurface(id);
      if (expectedVisible ? state?.visible === true : state?.hidden === true) { await sleep(80); return await inspectDropdownSurface(id); }
      await sleep(100);
    }
    return state;
  };
  if (noCaretSnapshot?.id) {
    const trigger = await inspectDropdownTrigger("Menu without caret");
    await send("Input.dispatchMouseEvent", {type:"mousePressed",x:trigger.x,y:trigger.y,button:"left",clickCount:1});
    await send("Input.dispatchMouseEvent", {type:"mouseReleased",x:trigger.x,y:trigger.y,button:"left",clickCount:1});
    const opened = await waitDropdownState(trigger.id, true);
    assert("caretless dropdown opens with expanded popup semantics", !!opened?.visible && opened.popup?.hasPopup===null && opened.popup?.expanded==="true" && opened.popup?.controlsTargetExists, opened);
    await key("Escape","Escape",27);
    const closed = await waitDropdownState(trigger.id, false);
    assert("caretless dropdown Escape closes, collapses, and restores focus", !!closed?.hidden && closed.popup?.expanded==="false" && closed.popup?.controlsTargetExists && closed.triggerFocused, closed);
  }
  // The split-button probe above intentionally leaves RTL active. Restore LTR so Start/End alignment assertions have a defined direction.
  await run("(()=>{document.documentElement.setAttribute(\"dir\",\"ltr\");document.body.classList.remove(\"rtl\");return true;})()");
  for (const [label, expectedPlacement] of [[ "Menu above","top"],["Menu below","bottom"],["Menu right","right"],["Menu left","left"], ["Menu top-start","top-start"],["Menu top-end","top-end"], ["Menu bottom-start","bottom-start"],["Menu bottom-end","bottom-end"], ["Menu right-start","right-start"],["Menu right-end","right-end"], ["Menu left-start","left-start"],["Menu left-end","left-end"]]) {
    const trigger = await inspectDropdownTrigger(label);
    assert(label + " dropdown exposes expanded state and a stable controlled surface while collapsed", !!trigger?.id && trigger.hasPopup === null && trigger.expanded === "false" && trigger.controls === trigger.id + "_surface" && trigger.controlsTargetExists, trigger);
    if (!trigger?.id) continue;
    await send("Input.dispatchMouseEvent", {type:"mousePressed",x:trigger.x,y:trigger.y,button:"left",clickCount:1});
    await send("Input.dispatchMouseEvent", {type:"mouseReleased",x:trigger.x,y:trigger.y,button:"left",clickCount:1});
    const opened = await waitDropdownState(trigger.id, true);
    const geometry = opened?.surface && opened?.trigger ? (() => {
      const s=opened.surface,t=opened.trigger;
      const isTop=expectedPlacement.startsWith("top"),isBottom=expectedPlacement.startsWith("bottom"),isLeft=expectedPlacement.startsWith("left"),isRight=expectedPlacement.startsWith("right");
      const requestedSide=expectedPlacement.split("-")[0];
      const actualSide=s.bottom<=t.top+8?"top":s.top>=t.bottom-8?"bottom":s.right<=t.left+8?"left":s.left>=t.right-8?"right":"overlap";
      const available=requestedSide==="top"?t.top:requestedSide==="bottom"?opened.viewport.height-t.bottom:requestedSide==="left"?t.left:opened.viewport.width-t.right;
      const required=(isTop||isBottom?s.height:s.width)+8;
      const opposite={top:"bottom",bottom:"top",left:"right",right:"left"}[requestedSide];
      const collisionFlipped=available<required&&actualSide===opposite;
      const aligned=expectedPlacement.endsWith("-start")?((isTop||isBottom)?Math.abs(s.left-t.left)<12:Math.abs(s.top-t.top)<12):expectedPlacement.endsWith("-end")?((isTop||isBottom)?Math.abs(s.right-t.right)<12:Math.abs(s.bottom-t.bottom)<12):true;
      return {ok:(actualSide===requestedSide||collisionFlipped)&&aligned,actualSide,requestedSide,available,required,collisionFlipped,aligned};
    })() : {ok:false,actualSide:"missing",collisionFlipped:false,aligned:false};
    const side=geometry.ok;
    assert(label + " opens with configured placement/alignment or a justified collision flip and selectable items", opened?.visible && opened.placement === expectedPlacement && side && opened.hasCopy && opened.popup?.hasPopup === null && opened.popup?.expanded === "true" && opened.popup?.controls === trigger.id + "_surface" && opened.popup?.controlsTargetExists, {expectedPlacement,opened,geometry});
    if (opened?.copyPoint) {
      await send("Input.dispatchMouseEvent", {type:"mousePressed",x:opened.copyPoint.x,y:opened.copyPoint.y,button:"left",clickCount:1});
      await send("Input.dispatchMouseEvent", {type:"mouseReleased",x:opened.copyPoint.x,y:opened.copyPoint.y,button:"left",clickCount:1});
    }
    const closed = await waitDropdownState(trigger.id, false);
    assert(label + " selecting Copy closes its popover and restores focus to the trigger", !!opened?.copyPoint && closed?.hidden && closed.popup?.expanded === "false" && closed.popup?.controlsTargetExists && closed.triggerFocused, {hadCopy:!!opened?.copyPoint,closed});
  }
  const outsideTrigger = await inspectDropdownTrigger("Menu above");
  assert("Top dropdown trigger is available for outside-dismissal testing", !!outsideTrigger?.id, outsideTrigger);
  if (outsideTrigger?.id) {
    await send("Input.dispatchMouseEvent", {type:"mousePressed",x:outsideTrigger.x,y:outsideTrigger.y,button:"left",clickCount:1});
    await send("Input.dispatchMouseEvent", {type:"mouseReleased",x:outsideTrigger.x,y:outsideTrigger.y,button:"left",clickCount:1});
    const outsideOpened = await waitDropdownState(outsideTrigger.id, true);
    assert("Top dropdown reopens and reports expanded before outside-dismissal testing", !!outsideOpened?.visible && outsideOpened.popup?.expanded === "true", outsideOpened);
    const headingPoint = await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Dropdown button');if(!h)return null;const r=h.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()");
    if (headingPoint) {
      await send("Input.dispatchMouseEvent", {type:"mousePressed",x:headingPoint.x,y:headingPoint.y,button:"left",clickCount:1});
      await send("Input.dispatchMouseEvent", {type:"mouseReleased",x:headingPoint.x,y:headingPoint.y,button:"left",clickCount:1});
    }
    const outsideClosed = await waitDropdownState(outsideTrigger.id, false);
    assert("Clicking outside an open dropdown dismisses its popover", !!headingPoint && !!outsideClosed?.hidden && outsideClosed.popup?.expanded === "false" && outsideClosed.popup?.controlsTargetExists, {headingPoint,outsideClosed});
  }
  const escapeTrigger = await inspectDropdownTrigger("Menu above");
  assert("Escape dropdown trigger is available", !!escapeTrigger?.id, escapeTrigger);
  if (escapeTrigger?.id) {
    await send("Input.dispatchMouseEvent", {type:"mousePressed",x:escapeTrigger.x,y:escapeTrigger.y,button:"left",clickCount:1});
    await send("Input.dispatchMouseEvent", {type:"mouseReleased",x:escapeTrigger.x,y:escapeTrigger.y,button:"left",clickCount:1});
    const escapeOpened = await waitDropdownState(escapeTrigger.id, true);
    assert("Dropdown opens and reports expanded before Escape/focus test", !!escapeOpened?.visible && escapeOpened.popup?.expanded === "true", escapeOpened);
    const focusedItem = await run("(()=>{const surface=document.getElementById(" + JSON.stringify(escapeTrigger.id + "_surface") + ");const item=surface?[...surface.querySelectorAll('.menu-item')].find(x=>x.textContent.includes('Copy')):null;if(!surface||!item)return {surfaceFound:!!surface,itemFound:!!item,focused:false};item.setAttribute('tabindex','-1');item.focus();return {surfaceFound:true,itemFound:true,focused:surface.contains(document.activeElement),activeText:document.activeElement?.textContent?.trim()??''};})()");
    assert("Focus is moved into the open dropdown before pressing Escape", focusedItem.surfaceFound && focusedItem.itemFound && focusedItem.focused && focusedItem.activeText.includes("Copy"), focusedItem);
    await key("Escape","Escape",27);
    const escapeClosed = await waitDropdownState(escapeTrigger.id, false);
    assert("Escape closes the open dropdown and clears expanded state", !!escapeClosed?.hidden && escapeClosed.popup?.expanded === "false" && escapeClosed.popup?.controlsTargetExists, escapeClosed);
    const escapeFocus = await run("(()=>{const trigger=document.getElementById(" + JSON.stringify(escapeTrigger.id) + "),surface=document.getElementById(" + JSON.stringify(escapeTrigger.id + "_surface") + ");return {triggerFound:!!trigger,triggerFocused:!!trigger&&document.activeElement===trigger,expanded:trigger?.getAttribute('aria-expanded')??null,activeTag:document.activeElement?.tagName??null,activeText:document.activeElement?.textContent?.trim()??'',hidden:!surface||surface.classList.contains('hidden'),visible:!!surface&&surface.classList.contains('show')};})()");
    assert("Escape restores focus to the dropdown trigger", escapeFocus.triggerFound && escapeFocus.triggerFocused && escapeFocus.expanded === "false" && escapeFocus.hidden && !escapeFocus.visible, escapeFocus);
  }
  const iconOnlySections = await run("(()=>{return [\"Icon\",\"Size\",\"Button Group\"].map(name=>{const h=[...document.querySelectorAll(\"h5\")].find(x=>x.textContent.trim()===name);const bs=[...h.parentElement.querySelectorAll(\"button.icon\")];return {name,count:bs.length,labels:bs.map(b=>b.getAttribute(\"aria-label\"))};});})()");
  assert("icon-only Button demos provide accessible names", iconOnlySections.every(section=>section.count>0 && section.labels.every(label=>!!label?.trim())), iconOnlySections);
  const decorativeIconAudit = await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Toggle');const b=h?.parentElement?.querySelector('button');const size=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Size');const withText=[...size?.parentElement?.querySelectorAll('button')||[]].find(b=>b.textContent.includes('Small with icon'));const iconOnly=[...size?.parentElement?.querySelectorAll('button.icon')||[]].find(b=>b.getAttribute('aria-label')==='Small icon-only action');const splitHeading=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Split button');const split=splitHeading?.parentElement?.querySelector('.bui-button-group');const caret=split?.querySelector(':scope > .bui-button:nth-child(2)');return {toggleName:b?b.getAttribute('aria-label')||b.textContent.trim():null,toggleIcons:[...(b?.querySelectorAll('.icon,.active-icon')||[])].map(x=>({className:x.className,ariaHidden:x.getAttribute('aria-hidden')})),withTextName:withText?withText.getAttribute('aria-label')||withText.textContent.trim():null,withTextIcons:[...(withText?.querySelectorAll('.icon,.active-icon')||[])].map(x=>x.getAttribute('aria-hidden')),iconOnlyName:iconOnly?iconOnly.getAttribute('aria-label'):null,iconOnlyIcons:[...(iconOnly?.querySelectorAll('.icon,.active-icon')||[])].map(x=>x.getAttribute('aria-hidden')),splitCaretName:caret?caret.getAttribute('aria-label'):null,splitCaretIcons:[...(caret?.querySelectorAll('.icon,.active-icon,.dropdown-icon,.dropdown-active-icon')||[])].map(x=>x.getAttribute('aria-hidden'))};})()");
  assert("Button label remains visible text while Regular/Filled glyphs are decorative", decorativeIconAudit.toggleName==="Default" && decorativeIconAudit.toggleIcons.length===2 && decorativeIconAudit.toggleIcons.every(x=>x.ariaHidden==="true"), decorativeIconAudit);
  assert("icon-plus-text accessible name excludes font glyphs", decorativeIconAudit.withTextName==="Small with icon" && decorativeIconAudit.withTextIcons.length===2 && decorativeIconAudit.withTextIcons.every(x=>x==="true"), decorativeIconAudit);
  assert("caller aria-label remains the name of icon-only Button", decorativeIconAudit.iconOnlyName==="Small icon-only action" && decorativeIconAudit.iconOnlyIcons.length>=1 && decorativeIconAudit.iconOnlyIcons.every(x=>x==="true"), decorativeIconAudit);
  assert("split-button menu trigger has a stable contextual name and decorative caret", decorativeIconAudit.splitCaretName==="Open menu" && decorativeIconAudit.splitCaretIcons.length>=1 && decorativeIconAudit.splitCaretIcons.every(x=>x==="true"), decorativeIconAudit);
  const shapeExamples = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Shapes\");const bs=[...h?.parentElement?.querySelectorAll(\"button\")||[]];return {count:bs.length,items:bs.map(b=>({text:b.textContent.trim(),classes:b.className,radius:getComputedStyle(b).borderTopLeftRadius,tag:b.tagName}))};})()");
  assert("Rounded, Circular and Square map to native Button shape classes and geometry", shapeExamples.count===3 && shapeExamples.items[0].text.includes("Rounded") && !shapeExamples.items[0].classes.includes("circular") && !shapeExamples.items[0].classes.includes("square") && shapeExamples.items[1].classes.includes("circular") && shapeExamples.items[2].classes.includes("square") && shapeExamples.items[2].radius==="0px" && shapeExamples.items[0].radius!==shapeExamples.items[1].radius, shapeExamples);
  const compoundExamples = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Compound\");const bs=[...h?.parentElement?.querySelectorAll(\"button\")||[]];return {count:bs.length,items:bs.map(b=>({text:b.textContent.trim(),compound:b.classList.contains(\"compound\"),primary:b.querySelector(\".text > div:not(.secondary-text)\")?.textContent.trim()??\"\",secondary:b.querySelector(\".secondary-text\")?.textContent.trim()??\"\"}))};})()");
  assert("SecondaryText creates compound Buttons for all supported shapes", compoundExamples.count===3 && compoundExamples.items.every(b=>b.compound && !!b.primary && b.secondary==="Compound text") && compoundExamples.items.map(b=>b.primary).join(",")==="Rounded,Circular,Square", compoundExamples);
  const linkExamples = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Link\");const bs=[...h?.parentElement?.querySelectorAll(\"button,a\")||[]];return {count:bs.length,items:bs.map(b=>({tag:b.tagName,text:b.textContent.trim(),href:b.getAttribute(\"href\"),disabled:b.disabled??false,ariaPressed:b.getAttribute(\"aria-pressed\")}))};})()");
  assert("Href renders enabled links as anchors and disabled links as native disabled Buttons", linkExamples.count===3 && linkExamples.items[0].tag==="A" && linkExamples.items[1].tag==="A" && linkExamples.items[0].href==="https://google.com" && linkExamples.items[1].href==="https://google.com" && linkExamples.items.every(b=>b.ariaPressed===null) && linkExamples.items[2].tag==="BUTTON" && linkExamples.items[2].disabled && linkExamples.items[2].href===null, linkExamples);
  const disabledLinkTarget = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Link\");const b=[...h?.parentElement?.querySelectorAll(\"button\")||[]].find(b=>b.textContent.includes(\"Google\")&&b.disabled);if(!b)return null;b.scrollIntoView({block:\"center\"});const r=b.getBoundingClientRect();return {found:true,tag:b.tagName,href:b.getAttribute(\"href\"),disabled:b.disabled,tabIndex:b.tabIndex,classes:b.className,x:r.left+r.width/2,y:r.top+r.height/2,status:h.parentElement.querySelector(\"[role=status]\")?.textContent.trim()??\"\"};})()");
  assert("disabled Href starts as a native disabled Button without href or action", !!disabledLinkTarget && disabledLinkTarget.tag==="BUTTON" && disabledLinkTarget.href===null && disabledLinkTarget.disabled && disabledLinkTarget.status==="Disabled link action count: 0", disabledLinkTarget);
  if (disabledLinkTarget) {
    await send("Input.dispatchMouseEvent", {type:"mousePressed",x:disabledLinkTarget.x,y:disabledLinkTarget.y,button:"left",clickCount:1});
    await send("Input.dispatchMouseEvent", {type:"mouseReleased",x:disabledLinkTarget.x,y:disabledLinkTarget.y,button:"left",clickCount:1});
    await sleep(180);
  }
  const disabledLinkAfterClick = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Link\");const b=[...h?.parentElement?.querySelectorAll(\"button\")||[]].find(b=>b.textContent.includes(\"Google\")&&b.disabled);return {exists:!!b,tag:b?.tagName??null,disabled:b?.disabled??false,href:b?.getAttribute(\"href\")??null,status:h?.parentElement?.querySelector(\"[role=status]\")?.textContent.trim()??\"\"};})()");
  assert("pointer activation cannot invoke OnClick for the disabled Href action", !!disabledLinkTarget && disabledLinkAfterClick.exists && disabledLinkAfterClick.disabled && disabledLinkAfterClick.href===null && disabledLinkAfterClick.status==="Disabled link action count: 0", disabledLinkAfterClick);
  const disabledLinkTabSetup = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Link\");const a=[...h?.parentElement?.querySelectorAll(\"a\")||[]];if(a.length<2)return {ready:false};a[1].focus();return {ready:document.activeElement===a[1]};})()");
  await key("Tab","Tab",9);
  const disabledLinkTabResult = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Link\");const b=[...h?.parentElement?.querySelectorAll(\"button\")||[]].find(b=>b.textContent.includes(\"Google\")&&b.disabled);const a=document.activeElement;return {disabledFound:!!b,disabledActive:!!b&&a===b,nextTag:a?.tagName??null,nextText:a?.textContent.trim()??\"\",nextDisabled:a?.disabled??false};})()");
  assert("Tab navigation skips the disabled Href action", disabledLinkTabSetup.ready && disabledLinkTabResult.disabledFound && !disabledLinkTabResult.disabledActive && disabledLinkTabResult.nextTag==="BUTTON" && !disabledLinkTabResult.nextDisabled && disabledLinkTabResult.nextText.includes("Rounded"), {setup:disabledLinkTabSetup,result:disabledLinkTabResult});
  const syntheticDisabledClick = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Link\");const b=[...h?.parentElement?.querySelectorAll(\"button\")||[]].find(b=>b.textContent.includes(\"Google\")&&b.disabled);return !!b && b.dispatchEvent(new MouseEvent(\"click\",{bubbles:true,cancelable:true}));})()");
  await sleep(180);
  const syntheticDisabledStatus = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Link\");return h?.parentElement?.querySelector(\"[role=status]\")?.textContent.trim()??\"\";})()");
  assert("disabled click handler ignores a manually dispatched click event", syntheticDisabledClick && syntheticDisabledStatus==="Disabled link action count: 0", {dispatched:syntheticDisabledClick,status:syntheticDisabledStatus});
  const sizeExamples = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Size\");const bs=[...h?.parentElement?.querySelectorAll(\"button\")||[]];const dims=bs.map(b=>({text:b.textContent.trim(),classes:b.className,height:b.getBoundingClientRect().height}));return {count:bs.length,small:dims.slice(0,3),medium:dims.slice(3,6),large:dims.slice(6,9)};})()");
  assert("Small, Medium and Large each demonstrate text, icon and icon-only Buttons with increasing height", sizeExamples.count===9 && sizeExamples.small.every(b=>b.classes.includes("small")) && sizeExamples.large.every(b=>b.classes.includes("large")) && sizeExamples.medium.every(b=>!b.classes.includes("small")&&!b.classes.includes("large")) && sizeExamples.small[0].height<sizeExamples.medium[0].height && sizeExamples.medium[0].height<sizeExamples.large[0].height, sizeExamples);
  const saveTarget = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Click action\");const b=[...h.parentElement.querySelectorAll(\"button\")].find(b=>b.textContent.includes(\"Simulate save\"));if(!b)return null;b.scrollIntoView({block:\"center\"});const r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,status:h.parentElement.querySelector(\"[role=status]\")?.textContent.trim()??\"\"};})()");
  assert("OnClick demo starts available and untriggered", !!saveTarget && saveTarget.status === "Save action count: 0", saveTarget);
  await send("Input.dispatchMouseEvent", {type:"mousePressed",x:saveTarget.x,y:saveTarget.y,button:"left",clickCount:1});
  await send("Input.dispatchMouseEvent", {type:"mouseReleased",x:saveTarget.x,y:saveTarget.y,button:"left",clickCount:1});
  await sleep(300);
  const saveAfterClick = await run("(()=>{const h=[...document.querySelectorAll(\"h5\")].find(h=>h.textContent.trim()===\"Click action\");return {status:h.parentElement.querySelector(\"[role=status]\")?.textContent.trim()??\"\"};})()");
  assert("trusted pointer click exercises the public OnClick binding", saveAfterClick.status === "Save action count: 1", saveAfterClick);
 await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Toggle');h.parentElement.querySelector('button').focus();return true;})()");
 await key(' ','Space',32);
 const space=await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Toggle');const b=h.parentElement.querySelector('button');return {toggled:b.classList.contains('toggled'),pressed:b.getAttribute('aria-pressed'),focusVisible:b.matches(':focus-visible')};})()");
 assert('native Space activates the existing Button toggle state',space.toggled,space);
 assert('Space updates aria-pressed=true with component state',space.toggled&&space.pressed==='true',space);
 const spaceAx=await toggleAx(0);
 assert('Space updates the computed AX pressed state to true',spaceAx.role==='button'&&spaceAx.pressedPropertyPresent&&spaceAx.pressedValue==='true'&&spaceAx.pressedType==='tristate',spaceAx);
 assert('toggle Button accessible name is stable when its glyph changes from Regular to Filled',initialToggleAx.name==='Default'&&spaceAx.name==='Default',{initial:initialToggleAx.name,afterSpace:spaceAx.name});
 assert('keyboard-toggled Button remains focus-visible',space.toggled&&space.focusVisible,space);
 // Danger is a real ButtonAppearance, not a mock in a Penpot-only sample.
 await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Appearance');h.parentElement.querySelectorAll('button')[1].focus();return true;})()");
 await key('Tab','Tab',9);
 const danger=await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Appearance'),b=[...h.parentElement.querySelectorAll('button')].find(x=>x.classList.contains('danger')),s=b?getComputedStyle(b):null,r=b?.getBoundingClientRect();return {present:!!b,active:document.activeElement===b,visible:b?.matches(':focus-visible'),outline:s?.outlineStyle,outlineWidth:s?.outlineWidth,bounds:r?{w:r.width,h:r.height}:null};})()");
 assert('real Danger appearance receives keyboard focus-visible ring',danger.present&&danger.active&&danger.visible&&danger.outline==='solid'&&parseFloat(danger.outlineWidth)>=2,danger);
  const ariaPressedGapResolved=toggle.pressed==='false'&&initialToggleAx.pressedPropertyPresent&&initialToggleAx.pressedValue==='false'&&space.pressed==='true'&&spaceAx.pressedPropertyPresent&&spaceAx.pressedValue==='true';
 // Enter on a separate primary toggle verifies native keyboard activation in the real host.
 await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Toggle');h.parentElement.querySelectorAll('button')[1].focus();return true;})()");
 await run("(()=>{window.__v3EnterTrace=[];const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Toggle'),b=h.parentElement.querySelectorAll('button')[1];for(const type of ['click','keydown','keyup'])b.addEventListener(type,e=>window.__v3EnterTrace.push({type:e.type,key:e.key||null,trusted:e.isTrusted}),true);return true;})()");
 const beforeEnter=await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Toggle'),b=h.parentElement.querySelectorAll('button')[1];return {toggled:b.classList.contains('toggled'),focused:document.activeElement===b};})()");
 await key('Enter','Enter',13);
 await sleep(250);
 const enter=await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Toggle');const b=h.parentElement.querySelectorAll('button')[1];return {toggled:b.classList.contains('toggled'),pressed:b.getAttribute('aria-pressed'),focused:document.activeElement===b,events:window.__v3EnterTrace,before:"+JSON.stringify(beforeEnter)+"};})()");
 assert('native Enter activates Button toggle state',enter.toggled,enter);
 assert('Enter updates aria-pressed=true with component state',enter.toggled&&enter.pressed==='true',enter);
 const enterAx=await toggleAx(1);
 assert('Enter updates the computed AX pressed state to true',enterAx.role==='button'&&enterAx.pressedPropertyPresent&&enterAx.pressedValue==='true'&&enterAx.pressedType==='tristate',enterAx);
  const allToggleSemanticsResolved=ariaPressedGapResolved&&enter.pressed==='true'&&enterAx.pressedPropertyPresent&&enterAx.pressedValue==='true';
 // High-contrast emulation exercises actual Windows color fallback selector.
 await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
 await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Split button');h.parentElement.querySelector('.bui-button-group > .bui-button:first-child').focus();return true;})()");
 await key('Tab','Tab',9);
 const forced=await run("(()=>{const h=[...document.querySelectorAll('h5')].find(h=>h.textContent.trim()==='Split button'),b=h.parentElement.querySelectorAll('.bui-button-group > .bui-button')[1],s=getComputedStyle(b);return {forced:matchMedia('(forced-colors: active)').matches,visible:b.matches(':focus-visible'),width:s.outlineWidth,style:s.outlineStyle,color:s.outlineColor,offset:s.outlineOffset};})()");
 assert('emulated forced-colors retains visible native Split keyboard outline',forced.forced&&forced.visible&&parseFloat(forced.width)>=2&&forced.style==='solid',forced);
  await send("Emulation.setEmulatedMedia", {features:[]});
  await send("Emulation.setDeviceMetricsOverride", {width:390,height:844,deviceScaleFactor:1,mobile:false});
  const narrow = await run(String.raw`(()=>{const matrixRows=[...document.querySelectorAll("[data-demo-button-size-row]")].map(row=>({key:row.dataset.demoButtonSizeRow,flexWrap:getComputedStyle(row).flexWrap,overflow:row.scrollWidth>row.clientWidth}));return {viewportWidth:window.innerWidth,clientWidth:document.documentElement.clientWidth,documentWidth:document.documentElement.scrollWidth,wrap:[...document.querySelectorAll("h5")].filter(h=>["Layout, orientation and density","Badge and notification","Styling and native attributes"].includes(h.textContent.trim())).map(h=>({heading:h.textContent.trim(),flexWrap:getComputedStyle(h.nextElementSibling).flexWrap})),matrixRows:matrixRows.length,matrixRowsWrap:matrixRows.every(row=>row.flexWrap==="wrap"),matrixOverflowingRows:matrixRows.filter(row=>row.overflow).map(row=>row.key),overflow:document.documentElement.scrollWidth>window.innerWidth};})()`);
  assert("Button showcase fits a 390px viewport with wrapped demo rows", narrow.viewportWidth===390 && !narrow.overflow && narrow.wrap.every(row=>row.flexWrap==="wrap"), narrow);
  assert("all 18 appearance/size rows wrap without horizontal overflow at 390px", narrow.matrixRows===18 && narrow.matrixRowsWrap && narrow.matrixOverflowingRows.length===0, narrow);
  const inspectButtonTheme = async theme => {
    await run(`(()=>{const root=document.documentElement;root.setAttribute("data-bui-theme",${JSON.stringify(theme)});root.setAttribute("dir","ltr");document.body.classList.remove("rtl");return true;})()`);
    // Button background/border/text use CSS transitions; wait before reading computed styles.
    await sleep(350);
    return await run(String.raw`(()=>{const root=document.documentElement,xs=[...document.querySelectorAll("button[data-demo-button-variant]")],keys=xs.map(b=>b.dataset.demoButtonVariant),styles=xs.map(b=>{const s=getComputedStyle(b);return {key:b.dataset.demoButtonVariant,color:s.color,backgroundColor:s.backgroundColor,borderColor:s.borderColor,height:b.getBoundingClientRect().height,valid:!!s.color&&!s.color.includes("var(")&&!!s.backgroundColor&&!s.backgroundColor.includes("var(")&&!!s.borderColor&&!s.borderColor.includes("var(")}}),sample=styles.find(x=>x.key==="Default-Medium-Rounded");return {theme:root.getAttribute("data-bui-theme"),rootToken:getComputedStyle(root).getPropertyValue("--colorNeutralBackground1").trim(),count:xs.length,uniqueCount:new Set(keys).size,resolvedStyles:styles.length===54&&styles.every(x=>x.valid&&x.height>0),sample:sample??null};})()`);
  };
  const lightThemeMatrix = await inspectButtonTheme("light");
  assert("Light theme resolves real computed styles for all 54 Button variants", lightThemeMatrix.theme==="light" && lightThemeMatrix.count===54 && lightThemeMatrix.uniqueCount===54 && lightThemeMatrix.resolvedStyles && !!lightThemeMatrix.sample?.backgroundColor && !!lightThemeMatrix.sample?.color, lightThemeMatrix);
  const darkThemeMatrix = await inspectButtonTheme("dark");
  assert("Dark theme resolves real computed styles for all 54 Button variants", darkThemeMatrix.theme==="dark" && darkThemeMatrix.count===54 && darkThemeMatrix.uniqueCount===54 && darkThemeMatrix.resolvedStyles && !!darkThemeMatrix.sample?.backgroundColor && !!darkThemeMatrix.sample?.color, darkThemeMatrix);
  assert("Button default surface or foreground changes between light and dark theme tokens", !!lightThemeMatrix.sample && !!darkThemeMatrix.sample && (lightThemeMatrix.sample.backgroundColor!==darkThemeMatrix.sample.backgroundColor || lightThemeMatrix.sample.color!==darkThemeMatrix.sample.color), {light:lightThemeMatrix.sample,dark:darkThemeMatrix.sample});
  const inspectIconTextDirection = async direction => await run(`(()=>{document.documentElement.setAttribute("dir",${JSON.stringify(direction)});document.body.classList.toggle("rtl",${direction==="rtl"});const b=document.querySelector('button[data-demo-button-direction="icon-text"]'),i=b?.querySelector(".icon"),t=b?.querySelector(".text"),ir=i?.getBoundingClientRect(),tr=t?.getBoundingClientRect();return {direction:document.documentElement.getAttribute("dir"),buttonFound:!!b,iconFound:!!i,textFound:!!t,iconLeft:ir?.left??null,iconRight:ir?.right??null,textLeft:tr?.left??null,textRight:tr?.right??null,iconBeforeText:!!ir&&!!tr&&ir.right<=tr.left+2,iconAfterText:!!ir&&!!tr&&ir.left>=tr.right-2,accessibleName:b?.getAttribute("aria-label")??b?.innerText.trim()??null};})()`);
  const ltrIconText = await inspectIconTextDirection("ltr");
  const rtlIconText = await inspectIconTextDirection("rtl");
  assert("Icon-and-text Button mirrors icon position from left in LTR to right in RTL", ltrIconText.buttonFound && ltrIconText.iconBeforeText && rtlIconText.buttonFound && rtlIconText.iconAfterText && !!ltrIconText.accessibleName && ltrIconText.accessibleName===rtlIconText.accessibleName, {ltr:ltrIconText,rtl:rtlIconText});
  const rtlNarrow = await run(String.raw`(()=>{const rows=[...document.querySelectorAll("[data-demo-button-size-row]")].map(row=>({key:row.dataset.demoButtonSizeRow,wrap:getComputedStyle(row).flexWrap,overflow:row.scrollWidth>row.clientWidth}));return {theme:document.documentElement.getAttribute("data-bui-theme"),direction:document.documentElement.getAttribute("dir"),viewport:window.innerWidth,clientWidth:document.documentElement.clientWidth,documentWidth:document.documentElement.scrollWidth,buttonCount:document.querySelectorAll("button[data-demo-button-variant]").length,rowCount:rows.length,allWrap:rows.every(x=>x.wrap==="wrap"),overflowRows:rows.filter(x=>x.overflow).map(x=>x.key),pageOverflow:document.documentElement.scrollWidth>window.innerWidth};})()`);
  assert("Dark RTL Button matrix remains responsive at 390px without page or row overflow", rtlNarrow.theme==="dark" && rtlNarrow.direction==="rtl" && rtlNarrow.viewport===390 && rtlNarrow.clientWidth===390 && rtlNarrow.documentWidth===390 && rtlNarrow.buttonCount===54 && rtlNarrow.rowCount===18 && rtlNarrow.allWrap && rtlNarrow.overflowRows.length===0 && !rtlNarrow.pageOverflow, rtlNarrow);
  await run(`(()=>{document.documentElement.setAttribute("data-bui-theme","light");document.documentElement.setAttribute("dir","ltr");document.body.classList.remove("rtl");return true;})()`);
  await send("Emulation.clearDeviceMetricsOverride");
 console.log(JSON.stringify({classification:'Real Chromium CDP ('+browser+') on live Bluent WASM Button demo; API/demo checks plus #501 focus candidate injected into transient browser tab only',url:base+'/components/buttons',assertions:results.length,passed:results.length-issues.length,failed:issues.length,issues,observations:{initialSplit:initial,disabled,pointer:mouse,rtl,space,enter,forced,ariaPressedGapResolved:allToggleSemanticsResolved,ariaPressedAX:{initial:initialToggleAx,afterSpace:spaceAx,afterEnter:enterAx}},checks:results},null,2));
 process.exitCode=issues.length?1:0;
}catch(e){console.error('probe_v3_button_focus_runtime: '+(e.stack||e));process.exitCode=1;}
finally {
  try { ws?.close(); } catch { }
  if (process.platform === "win32") {
    await new Promise(resolveDone => {
      const quote = value => "\u0027" + String(value).replace(/\u0027/g, "\u0027\u0027") + "\u0027";
      const script = `$needle=${quote(profile)}; $names=@(${["chrome.exe", "msedge.exe"].map(quote).join(",")}); Get-CimInstance Win32_Process | Where-Object { $_.Name -in $names -and $_.CommandLine -and $_.CommandLine.Contains($needle) } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`;
      let cleaner;
      try { cleaner = spawn("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script], { windowsHide: true, stdio: "ignore" }); } catch { try { child?.kill(); } catch { } resolveDone(); return; }
      const watchdog = setTimeout(() => { try { cleaner.kill(); } catch { } resolveDone(); }, 4000);
      cleaner.once("error", () => { clearTimeout(watchdog); resolveDone(); });
      cleaner.once("close", () => { clearTimeout(watchdog); resolveDone(); });
    });
    try { child?.kill(); } catch { }
  } else { try { child?.kill("SIGTERM"); } catch { } }
  await sleep(400);
  try { await rm(profile, { recursive: true, force: true, maxRetries: 4, retryDelay: 300 }); } catch { }
}
