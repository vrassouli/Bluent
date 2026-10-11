#!/usr/bin/env node
// #418 Chrome/CDP probe for interactive Bluent WASM controls (not AT certification).
// No third-party packages; source design is Penpot Bluent v3 page 32.
import {spawn,execFileSync} from "node:child_process";
import {mkdtempSync,existsSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
const cwd=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const interactiveServer=process.env.BLUENT_V3_LAB_MODE==="server";
const origin=process.env.BLUENT_V3_LAB_ORIGIN||(interactiveServer?"http://127.0.0.1:5159":"http://127.0.0.1:5129");
const route=interactiveServer?"/v3/interactive-portal-lab":"/v3/styling-lab";
const chromePath=process.env.CHROME_PATH||"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const dir=mkdtempSync(join(tmpdir(),"bluent-v3-418-cdp-")),children=[],checks=[],errors=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function start(cmd,args,workDir=cwd,environment=process.env){const p=spawn(cmd,args,{cwd:workDir,env:environment,stdio:["ignore","pipe","pipe"],windowsHide:true});let log="";for(const s of [p.stdout,p.stderr])s.on("data",b=>log=(log+String(b)).slice(-2000));p.tail=()=>log;children.push(p);return p;}
function assert(name,ok,notes=""){checks.push({name,pass:!!ok,notes});if(!ok)errors.push(name+": "+notes);}
async function until(fn,name,ms=65000){const end=Date.now()+ms;let last="";while(Date.now()<end){try{const r=await fn();if(r)return r;}catch(e){last=String(e)}await sleep(320);}throw Error("Timeout "+name+" "+last);}
class CDP {
 constructor(url){this.url=url;this.serial=1;this.pending=new Map();this.events=[];}
 async open(){this.ws=new WebSocket(this.url);await new Promise((res,rej)=>{this.ws.addEventListener("open",res,{once:true});this.ws.addEventListener("error",rej,{once:true});});this.ws.addEventListener("message",e=>{const m=JSON.parse(String(e.data)),t=this.pending.get(m.id);if(!t){if(m.method && /exceptionThrown|consoleAPICalled|Log.entryAdded|loadingFailed/.test(m.method))this.events.push({method:m.method,params:m.params});return;}this.pending.delete(m.id);clearTimeout(t.timeout);m.error?t.reject(Error(JSON.stringify(m.error))):t.resolve(m.result||{});});}
 send(method,params={}){const id=this.serial++;return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{this.pending.delete(id);reject(Error("CDP timed out: "+method));},18000);this.pending.set(id,{resolve,reject,timeout});this.ws.send(JSON.stringify({id,method,params}));});}
 async js(expression){const r=await this.send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result?.value;}
 close(){this.ws?.close();}
}
let cdp;
try {
 // ASP.NET Core 10 Development static asset endpoints can be unavailable in
 // a raw --no-build host. Run a genuine PUBLISHED Production SSR host from
 // its own working directory, exactly as the verified SSR smoke does.
 let app;
 if(interactiveServer) {
   const published=join(dir,"published-ssr");
   execFileSync("dotnet",["publish","src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj",
     "--configuration","Release","--no-restore","--nologo","--verbosity","quiet","--output",published],
     {cwd,windowsHide:true,stdio:"pipe",timeout:120000});
   app=start("dotnet",["Bluent.UI.Demo.SSR.dll"],published,{
     ...process.env,ASPNETCORE_ENVIRONMENT:"Production",ASPNETCORE_URLS:origin
   });
 } else {
   app=start("dotnet",["run","--configuration","Debug","--no-build","--no-launch-profile",
     "--project","src/Bluent.UI.Demo/Bluent.UI.Demo.csproj","--","--urls="+origin]);
 }
 await until(async()=>{if(app.exitCode!==null)throw Error(app.tail());return (await fetch(origin+route,{signal:AbortSignal.timeout(1100)})).ok;},"WASM server",85000);
 const browser=start(chromePath,["--headless=new","--disable-gpu","--no-sandbox","--disable-extensions","--no-first-run","--remote-debugging-port=0","--remote-allow-origins=*","--user-data-dir="+dir,"about:blank"]);
 const port=await until(()=>{if(browser.exitCode!==null)throw Error(browser.tail());const p=join(dir,"DevToolsActivePort");return existsSync(p)?readFileSync(p,"utf8").split(/\r?\n/)[0]:null;},"Chrome CDP");
 const target=await until(async()=>{const r=await fetch("http://127.0.0.1:"+port+"/json/list");return (await r.json()).find(t=>t.type==="page"&&t.webSocketDebuggerUrl);},"Chrome target");
 cdp=new CDP(target.webSocketDebuggerUrl);await cdp.open();await cdp.send("Page.enable");await cdp.send("Runtime.enable");await cdp.send("Log.enable");await cdp.send("Network.enable");
 await cdp.send("Page.navigate",{url:origin+route});
 await until(()=>cdp.js("!!(document.querySelector('.v3-lab-surface')&&document.querySelector('#v3-token-action'))"),"real controls",18000);
 await sleep(2000);
 const initial=await cdp.js("(()=>{const h=document.querySelector('.v3-lab-surface'),b=document.querySelector('#v3-token-action');return {opted:h.hasAttribute('data-bui-v3-tokens'),color:getComputedStyle(b).backgroundColor,asset:[...document.styleSheets].some(s=>s.href?.includes('issue-418.opt-in.preview.css'))};})()");
 assert("Blazor Button plus opt-in CSS",initial.opted&&initial.asset&&!!initial.color,JSON.stringify(initial));
 const field=await cdp.js("(()=>{const f=document.querySelector('.v3-lab-field .bui-field'),input=document.querySelector('#v3-experiment-name');return f&&input&&{background:getComputedStyle(f).backgroundColor,border:getComputedStyle(f).borderTopColor};})()");
 assert("real Blazor TextField under alias bridge",field&&!!field.background&&!!field.border,JSON.stringify(field));
 const stateSemantics=await cdp.js("(()=>{const disabled=document.querySelector('#v3-disabled-button'),input=document.querySelector('#v3-invalid-field'),label=document.querySelector('label[for=v3-invalid-field]'),hint=document.querySelector('#v3-invalid-description'),field=input?.closest('.bui-field');return {disabled:disabled?.disabled,disabledTabIndex:disabled?.tabIndex,invalid:input?.getAttribute('aria-invalid'),described:input?.getAttribute('aria-describedby')===hint?.id,label:label?.textContent?.trim(),border:field&&getComputedStyle(field).borderTopColor,normalBorder:getComputedStyle(document.querySelector('.v3-lab-field .bui-field')).borderTopColor,danger:getComputedStyle(field).getPropertyValue('--colorStatusDangerBorder2').trim(),text:hint?.textContent?.trim()};})()");
 assert("disabled Bluent Button is natively disabled",stateSemantics.disabled===true&&stateSemantics.disabledTabIndex===0,JSON.stringify(stateSemantics));
 const disabledFocus=await cdp.js("(()=>{const b=document.querySelector('#v3-disabled-button');b.focus();return {focused:document.activeElement===b,disabled:b.disabled}})()");
 assert("disabled Button cannot receive programmatic keyboard focus",disabledFocus.disabled&&!disabledFocus.focused,JSON.stringify(disabledFocus));
 assert("Persian invalid TextField is labeled and aria-described",stateSemantics.invalid==="true"&&stateSemantics.described&&!!stateSemantics.label&&!!stateSemantics.text,JSON.stringify(stateSemantics));
 assert("opt-in error field border follows source danger token",!!stateSemantics.danger&&stateSemantics.border!==stateSemantics.normalBorder,JSON.stringify(stateSemantics));
 // #418 bilingual text and real Fluent icon/text geometry in the authored Blazor
 // sample. Restrict to measurable DOM/focus/layout; optical glyph centering and
 // Persian shaping still need visual/native review.
 const typography=await cdp.js("(()=>{const s=document.querySelector('.v3-lab-typography'),p=document.querySelector('#v3-fa-paragraph'),m=document.querySelector('#v3-mixed-paragraph'),i=document.querySelector('#v3-fa-field');const buttons=['v3-fa-button','v3-fa-mixed-button','v3-fa-long-button'].map(id=>{const b=document.getElementById(id),icon=b?.querySelector('.icon'),text=b?.querySelector('.text');if(!b||!icon||!text)return {id,missing:true};const a=icon.getBoundingClientRect(),t=text.getBoundingClientRect(),r=b.getBoundingClientRect();return {id,verticalOffset:Math.abs(a.top+a.height/2-t.top-t.height/2),iconX:a.x,textX:t.x,clipped:text.scrollWidth>text.clientWidth+1,buttonW:r.width,font:getComputedStyle(text).fontFamily};});return {lang:s.lang,dir:s.dir,bidi:[...m.querySelectorAll('bdi')].map(x=>({text:x.textContent,direction:getComputedStyle(x).direction,unicodeBidi:getComputedStyle(x).unicodeBidi})),zwnj:p.textContent.includes('گزارش‌های'),fieldDirection:getComputedStyle(i).direction,buttons};})()");
 assert("Persian lang/RTL/ZWNJ and editable field direction",typography.lang==="fa"&&typography.dir==="rtl"&&typography.zwnj&&typography.fieldDirection==="rtl",JSON.stringify(typography));
 assert("bidi mixed identifiers are isolated",typography.bidi.length===2&&typography.bidi.every(x=>x.unicodeBidi==="isolate"&&x.direction==="ltr"),JSON.stringify(typography.bidi));
 for(const item of typography.buttons) {
   assert("Fluent icon/text vertical centering "+item.id,!item.missing&&item.verticalOffset<=2,JSON.stringify(item));
   assert("RTL visual icon ordering "+item.id,!item.missing&&item.iconX>item.textX,JSON.stringify(item));
 }
 await cdp.send("DOM.enable");await cdp.send("CSS.enable");
 const doc=await cdp.send("DOM.getDocument",{depth:1});
 const node=await cdp.send("DOM.querySelector",{nodeId:doc.root.nodeId,selector:"#v3-fa-paragraph"});
 const platform=await cdp.send("CSS.getPlatformFontsForNode",{nodeId:node.nodeId});
 const actualFonts=platform.fonts?.map(x=>({family:x.familyName,glyphCount:x.glyphCount,isCustom:x.isCustomFont}))||[];
 assert("Chrome resolves real Persian fallback font glyphs",actualFonts.length>0&&actualFonts.some(x=>x.glyphCount>0),JSON.stringify(actualFonts));
 console.log("Persian typography runtime sources:",JSON.stringify({actualFonts,buttons:typography.buttons}));
 // Load each real shipped brand stylesheet against the SAME Blazor Button and
 // TextField, switching both modes. This tests runtime computed styles rather
 // than synthetic CSS fixtures. It modifies only this temporary browser tab.
 const matrix=JSON.parse(readFileSync(join(cwd,"docs/v3/tokens/issue-418-brand-matrix.preview.json"),"utf8")).brands;
 const hexRgb=v=>{const m=/^#([a-f0-9]{6})$/i.exec(v);if(!m)throw Error("Unexpected hex "+v);const x=m[1];return "rgb("+[0,2,4].map(i=>parseInt(x.slice(i,i+2),16)).join(", ")+")";};
 const rgbParts=v=>[...v.matchAll(/[0-9]+/g)].slice(0,3).map(x=>Number(x[0]));
 const luminance=v=>{const [r,g,b]=rgbParts(v).map(n=>{const c=n/255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b;};
 const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
 const combos=[];
 for(const [brand,modes] of Object.entries(matrix)) {
   const swap=await cdp.js("(async()=>{const l=[...document.querySelectorAll('link[rel=stylesheet]')].find(x=>x.href.includes('bluent.ui.theme.'));if(!l)return 'missing link';return await new Promise((resolve,reject)=>{const replacement=document.createElement('link');replacement.rel='stylesheet';replacement.href='_content/Bluent.UI/bluent.ui.theme."+brand+".min.css';replacement.onload=()=>{l.remove();resolve('ok');};replacement.onerror=()=>reject(Error('failed to load '+replacement.href));l.after(replacement);});})()");
   if(swap!=="ok"){assert("brand asset "+brand,false,String(swap));continue;}
   for(const mode of ["light","dark"]) {
     const sample=await cdp.js("(()=>{const h=document.querySelector('.v3-lab-surface');h.dataset.buiTheme='"+mode+"';const b=document.querySelector('#v3-token-action');return {button:getComputedStyle(b).backgroundColor,text:getComputedStyle(b).color,scope:getComputedStyle(h).getPropertyValue('--bui-v3-button-background-primary').trim(),root:getComputedStyle(document.documentElement).getPropertyValue('--bui-v3-button-background-primary').trim(),nestedWord:getComputedStyle(document.querySelector('#v3-nested-brand-action')).backgroundColor};})()");
     const expected=hexRgb(modes[mode].tokens["bluent.color.brandBackground"]);
     combos.push({brand,mode,match:sample.button===expected,button:sample.button,expected});
     assert("brand "+brand+" "+mode+" on real Button",sample.button===expected,JSON.stringify(sample));
     assert("Word nested host independent of global stylesheet "+brand+" "+mode,sample.nestedWord===hexRgb(matrix.word.dark.tokens["bluent.color.brandBackground"]),sample.nestedWord);
     assert("primary Button text/source contrast "+brand+" "+mode,contrast(sample.button,sample.text)>=4.5,contrast(sample.button,sample.text).toFixed(3)+":1");
     assert("opt-in alias not leaked to root "+brand+" "+mode,sample.root==="",sample.root);
   }
 }
 // Restore the initial stylesheet and mode before using Blazor's real event
 // handlers. This ensures that client-side demo state remains the sole owner.
 await cdp.js("(async()=>{const l=[...document.querySelectorAll('link[rel=stylesheet]')].find(x=>x.href.includes('bluent.ui.theme.'));return await new Promise((resolve,reject)=>{const n=document.createElement('link');n.rel='stylesheet';n.href='_content/Bluent.UI/bluent.ui.theme.default.min.css';n.onload=()=>{l.remove();resolve(true);};n.onerror=()=>reject(Error('restore default failed'));l.after(n);});})()");
 await cdp.js("document.querySelector('.v3-lab-surface').dataset.buiTheme='light'");
 // Simultaneous brand isolation: a live Blazor Excel Light host containing a
 // live Word Dark host. The document stylesheet remains the default brand.
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Set main brand Excel'))?.click()");
 await until(()=>cdp.js("document.querySelector('.v3-lab-surface')?.dataset.buiBrand==='excel'"),"Blazor Excel brand toggle",16000);
 const concurrent=await cdp.js("(()=>{const main=document.querySelector('.v3-lab-surface'),nested=document.querySelector('.v3-lab-independent-host'),root=document.documentElement;return {mainBrand:main.dataset.buiBrand,nestedBrand:nested.dataset.buiBrand,mainBg:getComputedStyle(document.querySelector('#v3-token-action')).backgroundColor,nestedBg:getComputedStyle(document.querySelector('#v3-nested-brand-action')).backgroundColor,rootBrand:getComputedStyle(root).getPropertyValue('--colorBrandBackground').trim(),mainHover:getComputedStyle(main).getPropertyValue('--colorBrandBackgroundHover').trim(),nestedHover:getComputedStyle(nested).getPropertyValue('--colorBrandBackgroundHover').trim()};})()");
 assert("simultaneous Excel Light and Word Dark host Button colors",concurrent.mainBrand==="excel"&&concurrent.nestedBrand==="word"&&concurrent.mainBg===hexRgb(matrix.excel.light.tokens["bluent.color.brandBackground"])&&concurrent.nestedBg===hexRgb(matrix.word.dark.tokens["bluent.color.brandBackground"])&&concurrent.mainHover.toLowerCase()!==concurrent.nestedHover.toLowerCase(),JSON.stringify(concurrent));
 // Swap 20 nested source-brand/mode combinations while the surrounding
 // Excel/Light host remains intact. Does not change the global stylesheet.
 const pairs=[];
 for(const [brand,modes] of Object.entries(matrix))for(const mode of ["light","dark"]) {
    const got=await cdp.js("(()=>{const n=document.querySelector('.v3-lab-independent-host');n.dataset.buiBrand='"+brand+"';n.dataset.buiTheme='"+mode+"';return {nested:getComputedStyle(document.querySelector('#v3-nested-brand-action')).backgroundColor,main:getComputedStyle(document.querySelector('#v3-token-action')).backgroundColor,root:getComputedStyle(document.documentElement).getPropertyValue('--colorBrandBackground').trim()};})()");
    const expected=hexRgb(modes[mode].tokens["bluent.color.brandBackground"]);
    const good=got.nested===expected&&got.main===hexRgb(matrix.excel.light.tokens["bluent.color.brandBackground"]);
    pairs.push({brand,mode,good});
    assert("concurrent host isolated "+brand+" "+mode,good,JSON.stringify(got)+" expected nested "+expected);
 }
 await cdp.js("(()=>{const n=document.querySelector('.v3-lab-independent-host');n.dataset.buiBrand='word';n.dataset.buiTheme='dark';})()");
 console.log("Scoped concurrent brand matrix:",JSON.stringify({pairs:pairs.length,errors:pairs.filter(x=>!x.good)}));
 console.log("v3 live brand/mode matrix:",JSON.stringify({combos:combos.length,bad:combos.filter(x=>!x.match)}));
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Switch to dark'))?.click()");
 assert("interactive dark toggle",await until(()=>cdp.js("document.querySelector('.v3-lab-surface')?.dataset.buiTheme==='dark'"),"dark",26000));
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Switch to RTL'))?.click()");
 assert("interactive RTL toggle",await until(()=>cdp.js("document.querySelector('.v3-lab-surface')?.dir==='rtl'"),"rtl",26000));
 await cdp.js("document.querySelector('#v3-popover-trigger')?.click()");
 const popover=await until(()=>cdp.js("(()=>{const x=document.querySelector('[data-v3-popover-probe]');if(!x)return null;const surface=x.closest('.bui-popover-surface');if(!surface||surface.classList.contains('hidden'))return null;return {outside:!x.closest('[data-bui-v3-tokens]'),ancestor:x.closest('[data-bui-theme]')?.dataset.buiTheme,lab:document.querySelector('.v3-lab-surface').dataset.buiTheme,brand:surface.dataset.buiBrand,brandColor:getComputedStyle(surface).getPropertyValue('--colorBrandBackground').trim(),surface:surface.id};})()"),"real service-hosted Popover",26000);
 assert("D2 Popover inherits Excel Dark scope",!popover.outside&&popover.lab==="dark"&&popover.ancestor==="dark"&&popover.brand==="excel"&&hexRgb(popover.brandColor)===hexRgb(matrix.excel.dark.tokens["bluent.color.brandBackground"]),JSON.stringify(popover));
 const popoverA11y=await cdp.js("(()=>{const t=document.querySelector('#v3-popover-trigger'),s=document.querySelector('#v3-popover-trigger_surface');return {triggerExpanded:t?.getAttribute('aria-expanded'),triggerControls:t?.getAttribute('aria-controls'),triggerHasPopup:t?.getAttribute('aria-haspopup'),surfaceRole:s?.getAttribute('role'),surfaceHidden:s?.classList.contains('hidden'),surfaceId:s?.id};})()");
 console.log("D5 Popover trigger/surface accessibility baseline (not certified):",JSON.stringify(popoverA11y));
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Clear main brand'))?.click()");
 const cleared=await until(()=>cdp.js("(()=>{const s=document.querySelector('#v3-popover-trigger_surface');if(!s||s.hasAttribute('data-bui-brand'))return null;return {source:getComputedStyle(s).getPropertyValue('--colorBrandBackground').trim(),word:getComputedStyle(document.querySelector('#v3-independent-popover-trigger_surface')).getPropertyValue('--colorBrandBackground').trim()};})()"),"live Popover brand reset",16000);
 assert("Popover brand reset follows owner without leaking into Word sibling",hexRgb(cleared.source)===hexRgb(matrix.default.dark.tokens["bluent.color.brandBackground"])&&hexRgb(cleared.word)===hexRgb(matrix.word.light.tokens["bluent.color.brandBackground"]),JSON.stringify(cleared));
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Set main brand Excel'))?.click()");
 const restored=await until(()=>cdp.js("(()=>{const s=document.querySelector('#v3-popover-trigger_surface');return s?.dataset.buiBrand==='excel'?getComputedStyle(s).getPropertyValue('--colorBrandBackground').trim():null;})()"),"live Popover brand restoration",16000);
 assert("Popover brand restores Excel Dark from owner",hexRgb(restored)===hexRgb(matrix.excel.dark.tokens["bluent.color.brandBackground"]),restored);
 // Verify a visible portal follows its owning Blazor CascadingValue when mode
 // switches, without affecting a sibling nested host or the root.
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Switch to light'))?.click()");
 const lightPop=await until(()=>cdp.js("document.querySelector('#v3-popover-trigger_surface')?.dataset.buiTheme==='light'"),"live Popover Light update",16000);
 assert("live owner mode switch updates existing Popover",lightPop);
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Switch to dark'))?.click()");
 const darkPop=await until(()=>cdp.js("document.querySelector('#v3-popover-trigger_surface')?.dataset.buiTheme==='dark'"),"live Popover Dark update",16000);
 assert("live owner mode switch restores Dark Popover",darkPop);
 await cdp.js("document.querySelector('#v3-independent-popover-trigger')?.click()");
 const secondary=await until(()=>cdp.js("(()=>{const x=document.querySelector('[data-v3-independent-popover-probe]');if(!x)return null;const s=x.closest('.bui-popover-surface');if(!s || s.classList.contains('hidden'))return null;return {mode:s.dataset.buiTheme,dir:s.dir,hasOptIn:s.hasAttribute('data-bui-v3-tokens'),brand:s.dataset.buiBrand,background:getComputedStyle(s).backgroundColor,sourceBrand:getComputedStyle(s).getPropertyValue('--colorBrandBackground').trim(),main:document.querySelector('#v3-popover-trigger_surface')?.dataset.buiTheme};})()"),"independent nested Popover",20000);
 assert("nested independent Popover has Light/LTR, parent Dark",secondary.mode==="light"&&secondary.dir==="ltr"&&secondary.brand==="word"&&hexRgb(secondary.sourceBrand)===hexRgb(matrix.word.light.tokens["bluent.color.brandBackground"])&&secondary.main==="dark"&&secondary.hasOptIn,JSON.stringify(secondary));
 await cdp.js("document.querySelector('#v3-independent-popover-trigger')?.click()");
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
 const popMotion=await cdp.js("getComputedStyle(document.querySelector('#v3-popover-trigger_surface')).transitionDuration");
 assert("D5 scoped Popover reduced-motion fixed",popMotion.split(",").every(s=>parseFloat(s)===0),popMotion);
 await cdp.send("Emulation.setEmulatedMedia",{features:[]});
 await cdp.js("document.querySelector('#v3-popover-trigger')?.click()");
 const defaultSize=await cdp.js("document.querySelector('#v3-token-action').getBoundingClientRect().height");
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Compact density'))?.click()");
 const compact=await until(()=>cdp.js("document.querySelector('.v3-lab-surface')?.dataset.density==='compact'"),"compact density",15000);
 const compactSize=await cdp.js("document.querySelector('#v3-token-action').getBoundingClientRect().height");
 assert("real Blazor compact density changes button height",compact&&compactSize<defaultSize,"comfortable="+defaultSize+" compact="+compactSize);
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Comfortable density'))?.click()");
 await until(()=>cdp.js("document.querySelector('.v3-lab-surface')?.dataset.density==='comfortable'"),"return comfortable",15000);
 await cdp.send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:false});
 const mobile=await cdp.js("(()=>{const h=document.querySelector('.v3-lab-surface'),box=h.getBoundingClientRect();return {width:window.innerWidth,x:box.x,right:box.right,scroll:h.scrollWidth,client:h.clientWidth,dir:h.dir};})()");
 assert("390px RTL lab host without horizontal overflow",mobile.width===390&&mobile.x>=-1&&mobile.right<=mobile.width+2&&mobile.scroll<=mobile.client+2,JSON.stringify(mobile));
 await cdp.send("Emulation.setDeviceMetricsOverride",{width:320,height:700,deviceScaleFactor:1,mobile:false});
 await cdp.js("document.documentElement.style.fontSize='200%'");
 const reflow=await cdp.js("(()=>{const host=document.querySelector('.v3-lab-surface');const outer=host.getBoundingClientRect(),nested=host.querySelector('.v3-lab-independent-host'),inner=nested.getBoundingClientRect();return {viewport:window.innerWidth,hostX:outer.x,hostRight:outer.right,hostScroll:host.scrollWidth,hostClient:host.clientWidth,nestedX:inner.x,nestedRight:inner.right,rootFont:getComputedStyle(document.documentElement).fontSize};})()");
 assert("320px viewport at 200% root text size preserves host reflow",reflow.viewport===320&&reflow.hostX>=-1&&reflow.hostRight<=reflow.viewport+1&&reflow.hostScroll<=reflow.hostClient+2&&reflow.nestedX>=reflow.hostX&&reflow.nestedRight<=reflow.hostRight+2&&reflow.rootFont==="32px",JSON.stringify(reflow));
 // True component text enlargement, distinct from changing the rem root:
 // Fluent v2 button tokens use absolute px, so setting html font-size alone
 // does not double the control text. Verify the RTL content survives an
 // explicit 200% consumer text-size override at 320px.
 await cdp.js("document.querySelectorAll('.v3-lab-typography .bui-button').forEach(b=>{b.style.fontSize='28px';b.style.lineHeight='1.5';})");
 const enlarged=await cdp.js("(()=>{const h=document.querySelector('.v3-lab-surface'),r=h.getBoundingClientRect();return [...document.querySelectorAll('.v3-lab-typography .bui-button')].map(b=>{const i=b.querySelector('.icon'),t=b.querySelector('.text'),a=i.getBoundingClientRect(),v=t.getBoundingClientRect(),x=b.getBoundingClientRect();return {id:b.id,font:getComputedStyle(b).fontSize,buttonLeft:x.left,buttonRight:x.right,hostLeft:r.left,hostRight:r.right,clipped:t.scrollWidth>t.clientWidth+1,iconOffset:Math.abs(a.top+a.height/2-v.top-v.height/2),buttonH:x.height};});})()");
 assert("200% Persian button text in 320px RTL does not clip or overflow",enlarged.every(x=>x.font==="28px"&&!x.clipped&&x.buttonLeft>=x.hostLeft-2&&x.buttonRight<=x.hostRight+2),JSON.stringify(enlarged));
 assert("icon/text remain vertically centered at 200% text size",enlarged.every(x=>x.iconOffset<=2),JSON.stringify(enlarged.map(x=>({id:x.id,offset:x.iconOffset}))));
 await cdp.js("document.querySelectorAll('.v3-lab-typography .bui-button').forEach(b=>{b.style.fontSize='56px';b.style.lineHeight='1.5';})");
 const huge=await cdp.js("(()=>{const h=document.querySelector('.v3-lab-surface'),r=h.getBoundingClientRect();return [...document.querySelectorAll('.v3-lab-typography .bui-button')].map(b=>{const t=b.querySelector('.text'),icon=b.querySelector('.icon'),v=b.getBoundingClientRect(),ix=icon.getBoundingClientRect(),tx=t.getBoundingClientRect();return {id:b.id,iconOffset:Math.abs(ix.top+ix.height/2-tx.top-tx.height/2),font:getComputedStyle(b).fontSize,clipped:t.scrollWidth>t.clientWidth+1,buttonLeft:v.left,buttonRight:v.right,hostLeft:r.left,hostRight:r.right,textScroll:t.scrollWidth,textClient:t.clientWidth};});})()");
 assert("400% Persian text inside 320px RTL host has no lost content",huge.every(x=>x.font==="56px"&&!x.clipped&&x.buttonLeft>=x.hostLeft-2&&x.buttonRight<=x.hostRight+2),JSON.stringify(huge));
 assert("400% Persian icon and wrapped text geometric centers aligned",huge.every(x=>x.iconOffset<=2),JSON.stringify(huge.map(x=>({id:x.id,offset:x.iconOffset}))));
 await cdp.js("document.querySelectorAll('.v3-lab-typography .bui-button').forEach(b=>{b.style.fontSize='';b.style.lineHeight='';})");
 await cdp.js("document.documentElement.style.fontSize=''");
 await cdp.send("Emulation.clearDeviceMetricsOverride");
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
 const normal=await cdp.js("getComputedStyle(document.querySelector('.v3-lab-surface')).getPropertyValue('--bui-v3-motion-duration-fast').trim()");
 assert("non-reduced duration 150ms",normal==="150ms",normal);
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Preview local overlay'))?.click()");
 const overlay=await until(()=>cdp.js("(()=>{const o=document.querySelector('.v3-lab-surface .bui-overlay');return o&&getComputedStyle(o).animationDuration;})()"),"real overlay",26000);
 assert("real Overlay reduced-motion",overlay.split(",").every(s=>s.trim()==="0s"),overlay);
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"forced-colors",value:"active"},{name:"prefers-reduced-motion",value:"reduce"}]});
 const forced=await cdp.js("(()=>{const c=getComputedStyle(document.querySelector('.v3-lab-surface'));return {enabled:matchMedia('(forced-colors: active)').matches,action:c.getPropertyValue('--bui-v3-action-background').trim(),focus:c.getPropertyValue('--bui-v3-border-focus').trim()};})()");
 assert("forced-colors aliases on real Blazor host",forced.enabled&&forced.action.toLowerCase()==="buttonface"&&forced.focus.toLowerCase()==="highlight",JSON.stringify(forced));
 await cdp.send("Emulation.setEmulatedMedia",{features:[]});
 await cdp.js("document.querySelector('.v3-lab-surface .bui-overlay')?.click()");
 await until(()=>cdp.js("!document.querySelector('.v3-lab-surface .bui-overlay')"),"dismiss overlay",24000);
 await cdp.js("document.querySelector('#v3-token-action')?.focus()");
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
 const keyboard=await cdp.js("(()=>{const e=document.activeElement;return {id:e.id,visible:e.matches(':focus-visible'),inHost:!!e.closest('.v3-lab-surface'),outline:getComputedStyle(e).outlineWidth};})()");
 assert("keyboard Tab focus-visible in opt-in host",keyboard.inHost&&keyboard.visible&&parseFloat(keyboard.outline)>=2,JSON.stringify(keyboard));
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Show service-hosted dialog'))?.click()");
 const portal=await until(()=>cdp.js("(()=>{const x=document.querySelector('.dialog-wrapper');return x&&{outside:!x.closest('[data-bui-v3-tokens]'),ancestor:x.closest('[data-bui-theme]')?.dataset.buiTheme,lab:document.querySelector('.v3-lab-surface').dataset.buiTheme};})()"),"real service dialog",24000);
 assert("D2 Dialog explicitly inherits Dark scope",!portal.outside&&portal.lab==="dark"&&portal.ancestor==="dark",JSON.stringify(portal));
 const dialogAccessibility=await cdp.js("(()=>{const wrap=document.querySelector('.dialog-wrapper[data-bui-v3-tokens]'),dlg=wrap?.querySelector('.bui-dialog'),close=dlg?.querySelector('.header button');return {role:dlg?.getAttribute('role')||null,ariaModal:dlg?.getAttribute('aria-modal')||null,title:dlg?.querySelector('.title')?.textContent?.trim(),closeText:close?.textContent?.trim(),closeAria:close?.getAttribute('aria-label'),closeTitle:close?.getAttribute('title'),focusId:document.activeElement?.id,focusInDialog:!!document.activeElement?.closest('.bui-dialog'),closeMarkup:close?.outerHTML?.slice(0,550)};})()");
 console.log("Dialog current keyboard/semantics baseline (not certified):",JSON.stringify(dialogAccessibility));
 const dialogDoc=await cdp.send("DOM.getDocument",{depth:1});
 const closeButtonNode=await cdp.send("DOM.querySelector",{nodeId:dialogDoc.root.nodeId,selector:".dialog-wrapper[data-bui-v3-tokens] .bui-dialog .header button"});
 const closeAx=await cdp.send("Accessibility.getPartialAXTree",{nodeId:closeButtonNode.nodeId,fetchRelatives:false});
 const closeAxInfo=closeAx.nodes?.find(x=>x.role?.value==="button");
 const accessibilityGap={dialogHasRole:!!dialogAccessibility.role,closeButtonAxName:closeAxInfo?.name?.value||"",closeButtonIgnored:closeAxInfo?.ignored,activeFocusInDialog:dialogAccessibility.focusInDialog,focusId:dialogAccessibility.focusId};
 console.log("D5 OPEN accessible-name/focus gap (read-only Chrome AX):",JSON.stringify(accessibilityGap));
 const openAccessibilityGaps=[];
 if(!accessibilityGap.dialogHasRole)openAccessibilityGaps.push("Dialog lacks role=dialog in current opt-in prototype");
 if([...accessibilityGap.closeButtonAxName].length>0&&[...accessibilityGap.closeButtonAxName].every(x=>x.codePointAt(0)>=0xE000&&x.codePointAt(0)<=0xF8FF))openAccessibilityGaps.push("Close button AX name is private-use icon glyph, not readable label");
 if(!accessibilityGap.activeFocusInDialog)openAccessibilityGaps.push("Programmatic Dialog open did not focus a descendant");
 if(popoverA11y.surfaceHidden===false&&popoverA11y.triggerExpanded===null&&popoverA11y.triggerControls===null)openAccessibilityGaps.push("Open button-triggered Popover lacks aria-expanded and aria-controls relation");
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Show alternate host dialog'))?.click()");
 const twinDialogs=await until(()=>cdp.js("(()=>{const list=[...document.querySelectorAll('.dialog-wrapper')];if(list.length<2)return null;return list.map(x=>({mode:x.dataset.buiTheme,dir:x.dir,brand:x.dataset.buiBrand,optIn:x.hasAttribute('data-bui-v3-tokens'),background:getComputedStyle(x.querySelector('.bui-dialog')).backgroundColor,sourceBrand:getComputedStyle(x).getPropertyValue('--colorBrandBackground').trim()}));})()"),"two simultaneous Dialog scopes",16000);
 assert("simultaneous Dialogs preserve independent Dark/Light scopes",twinDialogs.length===2&&twinDialogs[0].mode==="dark"&&twinDialogs[1].mode==="light"&&twinDialogs[0].brand==="excel"&&twinDialogs[1].brand==="word"&&hexRgb(twinDialogs[0].sourceBrand)===hexRgb(matrix.excel.dark.tokens["bluent.color.brandBackground"])&&hexRgb(twinDialogs[1].sourceBrand)===hexRgb(matrix.word.light.tokens["bluent.color.brandBackground"])&&twinDialogs[0].dir==="rtl"&&twinDialogs[1].dir==="ltr"&&twinDialogs.every(d=>d.optIn)&&twinDialogs[0].background!==twinDialogs[1].background,JSON.stringify(twinDialogs));
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Show legacy unscoped dialog'))?.click()");
 const fallback=await until(()=>cdp.js("(()=>{const all=[...document.querySelectorAll('.dialog-wrapper')];return all.length>=3?{mode:all[2].getAttribute('data-bui-theme'),dir:all[2].getAttribute('dir'),brand:all[2].getAttribute('data-bui-brand'),optIn:all[2].hasAttribute('data-bui-v3-tokens'),bg:getComputedStyle(all[2].querySelector('.bui-dialog')).backgroundColor}:null;})()"),"existing unscoped v2 Dialog",16000);
 assert("no-scope Dialog retains legacy fallback",fallback.mode===null&&fallback.dir===null&&fallback.brand===null&&!fallback.optIn,JSON.stringify(fallback));
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"forced-colors",value:"active"}]});
 const portalForced=await cdp.js("(()=>{const d=[...document.querySelectorAll('.dialog-wrapper')],p=document.querySelector('#v3-popover-trigger_surface');const pick=x=>{const s=getComputedStyle(x);return {background:s.getPropertyValue('--bui-v3-action-background').trim(),focus:s.getPropertyValue('--bui-v3-border-focus').trim()}};return {first:pick(d[0]),second:pick(d[1]),legacy:pick(d[2]),popover:pick(p)};})()");
 assert("forced colors reach scoped Dialog and Popover",portalForced.first.background==="ButtonFace"&&portalForced.second.background==="ButtonFace"&&portalForced.popover.background==="ButtonFace"&&portalForced.first.focus==="Highlight",JSON.stringify(portalForced));
 assert("forced colors do not leak v3 aliases into unscoped Dialog",portalForced.legacy.background==="",JSON.stringify(portalForced.legacy));
 const forcedError=await cdp.js("(()=>{const input=document.querySelector('#v3-invalid-field'),field=input.closest('.bui-field'),hint=document.querySelector('#v3-invalid-description');return {invalid:input.getAttribute('aria-invalid'),border:getComputedStyle(field).borderTopColor,textColor:getComputedStyle(hint).color,enabled:matchMedia('(forced-colors: active)').matches};})()");
 assert("forced-colors Persian error remains semantically identified",forcedError.enabled&&forcedError.invalid==="true"&&!!forcedError.border&&!!forcedError.textColor,JSON.stringify(forcedError));
 await cdp.send("Emulation.setEmulatedMedia",{features:[]});
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
 const dialogMotion=await cdp.js("getComputedStyle(document.querySelector('.dialog-wrapper .bui-dialog')).animationDuration");
 assert("D5 scoped Dialog reduced-motion fixed",dialogMotion.split(",").every(s=>parseFloat(s)===0),dialogMotion);
 const beforeClose=await cdp.js("document.querySelectorAll('.dialog-wrapper').length");
 await cdp.js("document.querySelector('.dialog-wrapper[data-bui-v3-tokens] .bui-dialog .header button')?.click()");
 await until(()=>cdp.js("document.querySelectorAll('.dialog-wrapper').length===2"),"scoped Dialog close after reduced motion",15000);
 const afterClose=await cdp.js("document.querySelectorAll('.dialog-wrapper').length");
 assert("opt-in reduced-motion Dialog can be dismissed",beforeClose===3&&afterClose===2,"before="+beforeClose+" after="+afterClose);
 await cdp.send("Emulation.setEmulatedMedia",{features:[]});
 const passCount=checks.filter(x=>x.pass).length;
 const summary={classification:interactiveServer?"actual Blazor interactive SSR Server Chrome/CDP interaction":"actual Blazor WebAssembly Chrome/CDP interaction",passed:passCount,total:checks.length,failed:errors.length,brandModeSamples:combos.length,brands:Object.keys(matrix).length,primaryTextContrastMin:Math.min(...checks.filter(x=>x.name.startsWith("primary Button text/source contrast")).map(x=>Number(x.notes.split(":")[0]))),observedUnfixedAccessibilityGaps:openAccessibilityGaps,errors,limits:"computed-style and real Blazor interaction smoke only; NOT full WCAG, AT, cross-browser, auto-render-mode, all-host or native OS certification"};
 if(process.env.BLUENT_V3_PROBE_VERBOSE==="1")summary.checks=checks;
 console.log(JSON.stringify(summary,null,2));
 if(errors.length)process.exitCode=1;
}catch(e){console.error("Probe error: "+String(e));if(cdp){try{console.error("Browser state: "+JSON.stringify(await cdp.js("({url:location.href,title:document.title,text:document.body?.innerText?.slice(0,1400),buttons:[...document.querySelectorAll(\"button\")].map(x=>({id:x.id,text:x.innerText})).slice(0,15)})")));}catch{}}console.error(JSON.stringify({checks,errors,events:cdp?.events?.slice(-12)},null,2));process.exitCode=1;}
finally{try{cdp?.close();}catch{}for(const p of children.reverse())if(p.pid&&p.exitCode===null){try{if(process.platform==="win32")execFileSync("taskkill",["/PID",String(p.pid),"/T","/F"],{stdio:"ignore",timeout:8000});else p.kill();}catch{try{p.kill();}catch{}}}try{rmSync(dir,{recursive:true,force:true});}catch{}}
