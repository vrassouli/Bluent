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
let cdp, app;
try {
 // ASP.NET Core 10 Development static asset endpoints can be unavailable in
 // a raw --no-build host. Run a genuine PUBLISHED Production SSR host from
 // its own working directory, exactly as the verified SSR smoke does.
 if(interactiveServer) {
   const published=join(dir,"published-ssr");
   // Cold Windows CI Release publish exceeded the former 120s timeout.
   try {
     execFileSync("dotnet",["publish","src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj",
     "--configuration","Release","--no-restore","--nologo","--verbosity","quiet","--output",published],
     {cwd,windowsHide:true,stdio:"pipe",timeout:300000});
   } catch (e) {
     throw Error("InteractiveServer publish failed before browser checks: "+(e.code||e.message)
       +"; stderr="+String(e.stderr||"").slice(-3000)
       +"; stdout="+String(e.stdout||"").slice(-2000));
   }
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
 const typography=await cdp.js("(()=>{const s=document.querySelector('.v3-lab-typography'),p=document.querySelector('#v3-fa-paragraph'),m=document.querySelector('#v3-mixed-paragraph'),i=document.querySelector('#v3-fa-field');const buttons=['v3-fa-button','v3-fa-mixed-button','v3-fa-long-button'].map(id=>{const b=document.getElementById(id),icon=[...(b?.querySelectorAll('.bui-icon')||[])].find(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>8&&e.getBoundingClientRect().height>8),text=b?.querySelector('.text');if(!b||!icon||!text)return {id,missing:true};const a=icon.getBoundingClientRect(),t=text.getBoundingClientRect(),r=b.getBoundingClientRect();return {id,verticalOffset:Math.abs(a.top+a.height/2-t.top-t.height/2),faceTextOffset:Math.abs(r.top+r.height/2-t.top-t.height/2),faceIconOffset:Math.abs(r.top+r.height/2-a.top-a.height/2),iconW:a.width,iconH:a.height,iconClass:icon.className,iconInside:a.left>=r.left-1&&a.right<=r.right+1&&a.top>=r.top-1&&a.bottom<=r.bottom+1,iconX:a.x,textX:t.x,clipped:text.scrollWidth>text.clientWidth+1,buttonW:r.width,font:getComputedStyle(text).fontFamily};});return {lang:s.lang,dir:s.dir,bidi:[...m.querySelectorAll('bdi')].map(x=>({text:x.textContent,direction:getComputedStyle(x).direction,unicodeBidi:getComputedStyle(x).unicodeBidi})),zwnj:p.textContent.includes('گزارش‌های'),fieldDirection:getComputedStyle(i).direction,buttons};})()");
 assert("Persian lang/RTL/ZWNJ and editable field direction",typography.lang==="fa"&&typography.dir==="rtl"&&typography.zwnj&&typography.fieldDirection==="rtl",JSON.stringify(typography));
 assert("bidi mixed identifiers are isolated",typography.bidi.length===2&&typography.bidi.every(x=>x.unicodeBidi==="isolate"&&x.direction==="ltr"),JSON.stringify(typography.bidi));
 for(const item of typography.buttons) {
   assert("real active/regular Fluent icon has nonzero painted-element bounds "+item.id,!item.missing&&item.iconW>=10&&item.iconH>=10,JSON.stringify(item));
   assert("Fluent icon/text vertical centering "+item.id,!item.missing&&item.verticalOffset<=2,JSON.stringify(item));
   assert("Button face centers Persian label and Fluent icon "+item.id,!item.missing&&item.faceTextOffset<=2&&item.faceIconOffset<=2,JSON.stringify(item));
   assert("visible RTL Fluent icon stays inside Button face "+item.id,item.iconInside,JSON.stringify(item));
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
 const hexToRgb=v=>{const full=/^#[a-f0-9]{3}$/i.test(v)?"#"+[...v.slice(1)].map(c=>c+c).join(""):v;return hexRgb(full);};
 const rgbParts=v=>[...v.matchAll(/[0-9]+/g)].slice(0,3).map(x=>Number(x[0]));
 const luminance=v=>{const [r,g,b]=rgbParts(v).map(n=>{const c=n/255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b;};
 const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
 const combos=[];
 for(const [brand,modes] of Object.entries(matrix)) {
   const swap=await cdp.js("(async()=>{const l=[...document.querySelectorAll('link[rel=stylesheet]')].find(x=>x.href.includes('bluent.ui.theme.'));if(!l)return 'missing link';return await new Promise((resolve,reject)=>{const replacement=document.createElement('link');replacement.rel='stylesheet';replacement.href='_content/Bluent.UI/bluent.ui.theme."+brand+".min.css';replacement.onload=()=>{l.remove();resolve('ok');};replacement.onerror=()=>reject(Error('failed to load '+replacement.href));l.after(replacement);});})()");
   if(swap!=="ok"){assert("brand asset "+brand,false,String(swap));continue;}
   for(const mode of ["light","dark"]) {
     const sample=await cdp.js("(()=>{const h=document.querySelector('.v3-lab-surface');h.dataset.buiTheme='"+mode+"';const b=document.querySelector('#v3-token-action');return {button:getComputedStyle(b).backgroundColor,text:getComputedStyle(b).color,scope:getComputedStyle(h).getPropertyValue('--bui-v3-button-background-primary').trim(),root:getComputedStyle(document.documentElement).getPropertyValue('--bui-v3-button-background-primary').trim(),nestedWord:getComputedStyle(document.querySelector('#v3-nested-brand-action')).backgroundColor,sourceBrand:getComputedStyle(h).getPropertyValue('--colorBrandBackground').trim(),sourceEnhanced:getComputedStyle(h).getPropertyValue('--colorBrandForeground2').trim(),sourceSurface:getComputedStyle(h).getPropertyValue('--colorNeutralBackground1').trim(),sourceHover:getComputedStyle(h).getPropertyValue('--colorNeutralBackground1Hover').trim(),brandCandidate:(() => {h.setAttribute('data-bui-v3-focus-brand-candidate','');const v=getComputedStyle(h).getPropertyValue('--v3-lab-focus').trim();h.removeAttribute('data-bui-v3-focus-brand-candidate');return v;})()};})()");
     const expected=hexRgb(modes[mode].tokens["bluent.color.brandBackground"]);
     combos.push({brand,mode,match:sample.button===expected,button:sample.button,expected});
     assert("brand "+brand+" "+mode+" on real Button",sample.button===expected,JSON.stringify(sample));
     assert("Word nested host independent of global stylesheet "+brand+" "+mode,sample.nestedWord===hexRgb(matrix.word.dark.tokens["bluent.color.brandBackground"]),sample.nestedWord);
     assert("primary Button text/source contrast "+brand+" "+mode,contrast(sample.button,sample.text)>=4.5,contrast(sample.button,sample.text).toFixed(3)+":1");
     const expectedBrandFocus=mode==="dark"?sample.sourceEnhanced:sample.sourceBrand;
     assert("brand-focus preview matches emitted source role "+brand+" "+mode,
       sample.brandCandidate.toLowerCase()===expectedBrandFocus.toLowerCase(),
       JSON.stringify({brand,mode,focus:sample.brandCandidate,source:expectedBrandFocus}));
     assert("brand-preserving focus candidate on normal AND hover neutral hosts "+brand+" "+mode,
       contrast(hexToRgb(sample.brandCandidate),hexToRgb(sample.sourceSurface))>=3&&
       contrast(hexToRgb(sample.brandCandidate),hexToRgb(sample.sourceHover))>=3,
       JSON.stringify({brand,mode,focus:sample.brandCandidate,normal:sample.sourceSurface,
                       hover:sample.sourceHover,normalRatio:contrast(hexToRgb(sample.brandCandidate),hexToRgb(sample.sourceSurface)),
                       hoverRatio:contrast(hexToRgb(sample.brandCandidate),hexToRgb(sample.sourceHover))}));
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
 const popInitially=await until(()=>cdp.js("(()=>{const t=document.querySelector('#v3-popover-trigger'),expanded=t?.getAttribute('aria-expanded'),controls=t?.getAttribute('aria-controls');if(expanded===null||controls===null)return null;return {expanded,controls,surface:document.querySelector('#v3-popover-trigger_surface')?.id};})()"),"Popover initial ARIA after component registration",16000);
 assert("v3 Popover initially reports collapsed trigger with valid controls",popInitially.expanded==="false"&&popInitially.controls==="v3-popover-trigger_surface"&&popInitially.surface===popInitially.controls,JSON.stringify(popInitially));
 const oldPopoverBefore=await cdp.js("(()=>{const t=document.querySelector('#v3-legacy-popover-trigger');return {expanded:t?.getAttribute('aria-expanded'),controls:t?.getAttribute('aria-controls')};})()");
 assert("nonopted legacy Popover has no v3 ARIA trigger attributes",oldPopoverBefore.expanded===null&&oldPopoverBefore.controls===null,JSON.stringify(oldPopoverBefore));
 await cdp.js("document.querySelector('#v3-legacy-popover-trigger')?.click()");
 const oldPopoverAfter=await until(()=>cdp.js("(()=>{const s=document.querySelector('#v3-legacy-popover-trigger_surface'),t=document.querySelector('#v3-legacy-popover-trigger');return s&&!s.classList.contains('hidden')?{expanded:t.getAttribute('aria-expanded'),controls:t.getAttribute('aria-controls')}:null;})()"),"real nonopted legacy Popover",16000);
 assert("legacy Popover remains without opt-in aria-expanded/controls after opening",oldPopoverAfter.expanded===null&&oldPopoverAfter.controls===null,JSON.stringify(oldPopoverAfter));
 await cdp.js("document.querySelector('#v3-token-action')?.click()");
 await cdp.js("document.querySelector('#v3-popover-trigger')?.click()");
 const popover=await until(()=>cdp.js("(()=>{const x=document.querySelector('[data-v3-popover-probe]');if(!x)return null;const surface=x.closest('.bui-popover-surface');if(!surface||surface.classList.contains('hidden'))return null;return {outside:!x.closest('[data-bui-v3-tokens]'),ancestor:x.closest('[data-bui-theme]')?.dataset.buiTheme,lab:document.querySelector('.v3-lab-surface').dataset.buiTheme,brand:surface.dataset.buiBrand,brandColor:getComputedStyle(surface).getPropertyValue('--colorBrandBackground').trim(),surface:surface.id};})()"),"real service-hosted Popover",26000);
 assert("D2 Popover inherits Excel Dark scope",!popover.outside&&popover.lab==="dark"&&popover.ancestor==="dark"&&popover.brand==="excel"&&hexRgb(popover.brandColor)===hexRgb(matrix.excel.dark.tokens["bluent.color.brandBackground"]),JSON.stringify(popover));
 const popoverA11y=await cdp.js("(()=>{const t=document.querySelector('#v3-popover-trigger'),s=document.querySelector('#v3-popover-trigger_surface');return {triggerExpanded:t?.getAttribute('aria-expanded'),triggerControls:t?.getAttribute('aria-controls'),triggerHasPopup:t?.getAttribute('aria-haspopup'),surfaceRole:s?.getAttribute('role'),surfaceHidden:s?.classList.contains('hidden'),surfaceId:s?.id};})()");
 console.log("D5 opted-in Popover ARIA state:",JSON.stringify(popoverA11y));
 assert("visible Popover reports expanded=true with correct aria-controls",popoverA11y.triggerExpanded==="true"&&popoverA11y.triggerControls===popoverA11y.surfaceId&&!popoverA11y.surfaceHidden,JSON.stringify(popoverA11y));
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
 await cdp.js("document.querySelector('#v3-token-action')?.click()");
 await sleep(920);
 const popDismissDebug=await cdp.js("(()=>{const s=document.querySelector('#v3-popover-trigger_surface'),t=document.querySelector('#v3-popover-trigger');return {classes:s?.className,transition:getComputedStyle(s).transitionDuration,visible:s&&!s.classList.contains('hidden'),expanded:t?.getAttribute('aria-expanded'),controls:t?.getAttribute('aria-controls'),show:s?.classList.contains('show'),tokenAction:document.querySelector('#v3-token-action')?.id};})()");
 console.log("D5 Popover dismissal evidence:",JSON.stringify(popDismissDebug));
 const popClosed=await until(()=>cdp.js("(()=>{const s=document.querySelector('#v3-popover-trigger_surface'),t=document.querySelector('#v3-popover-trigger');return s?.classList.contains('hidden')&&t?.getAttribute('aria-expanded')==='false'&&t?.getAttribute('aria-controls')===s?.id;})()"),"real Popover close updates aria-expanded",16000);
 assert("Popover outside dismissal reports collapsed=false with retained controls",popClosed);
 await cdp.js("document.querySelector('#v3-popover-trigger')?.click()");
 const popReopen=await until(()=>cdp.js("(()=>{const s=document.querySelector('#v3-popover-trigger_surface'),t=document.querySelector('#v3-popover-trigger');return s&&!s.classList.contains('hidden')&&t?.getAttribute('aria-expanded')==='true';})()"),"Popover reopened aria-expanded",16000);
 assert("Popover reopening reports expanded=true after previous close",popReopen);
 // #418 opt-in unmount regression: an already visible Popover removed by
 // Blazor must release its document Escape listener, not retain stale refs.
 const countDocumentKeydowns=async()=>{
   const target=await cdp.send("Runtime.evaluate",{expression:"document",returnByValue:false});
   const listeners=await cdp.send("DOMDebugger.getEventListeners",{objectId:target.result.objectId});
   return listeners.listeners.filter(l=>l.type==="keydown").length;
 };
 await cdp.js("document.querySelector('#v3-toggle-removable-popover')?.click()");
 await until(()=>cdp.js("!!document.querySelector('#v3-removable-popover-trigger[aria-expanded]')"),"removable Popover mounted",16000);
 const keydownBefore=await countDocumentKeydowns();
 await cdp.js("document.querySelector('#v3-removable-popover-trigger')?.click()");
 await until(()=>cdp.js("document.querySelector('#v3-removable-popover-trigger')?.getAttribute('aria-expanded')==='true'"),"removable Popover opened",17000);
 const keydownDuring=await countDocumentKeydowns();
 await cdp.js("document.querySelector('#v3-remove-open-popover')?.click()");
 const removed=await until(()=>cdp.js("!document.querySelector('#v3-removable-popover-trigger')"),"removable Popover disposed",17000);
 const removedListener=await until(async()=>await countDocumentKeydowns()===keydownBefore,"removed Popover Escape listener cleanup",17000);
 assert("unmounting an open v3 Popover frees exactly its Escape listener",removed&&keydownDuring===keydownBefore+1&&removedListener,JSON.stringify({keydownBefore,keydownDuring,removed}));
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
 const enlarged=await cdp.js("(()=>{const h=document.querySelector('.v3-lab-surface'),r=h.getBoundingClientRect();return [...document.querySelectorAll('.v3-lab-typography .bui-button')].map(b=>{const i=[...b.querySelectorAll('.bui-icon')].find(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>8&&e.getBoundingClientRect().height>8),t=b.querySelector('.text'),a=i.getBoundingClientRect(),v=t.getBoundingClientRect(),x=b.getBoundingClientRect();return {id:b.id,font:getComputedStyle(b).fontSize,buttonLeft:x.left,buttonRight:x.right,hostLeft:r.left,hostRight:r.right,clipped:t.scrollWidth>t.clientWidth+1,iconOffset:Math.abs(a.top+a.height/2-v.top-v.height/2),faceTextOffset:Math.abs(x.top+x.height/2-v.top-v.height/2),faceIconOffset:Math.abs(x.top+x.height/2-a.top-a.height/2),buttonH:x.height,iconW:a.width,iconH:a.height,iconInside:a.left>=x.left-1&&a.right<=x.right+1&&a.top>=x.top-1&&a.bottom<=x.bottom+1,iconRightOfText:a.left>=v.right-2};});})()");
 assert("200% Persian button text in 320px RTL does not clip or overflow",enlarged.every(x=>x.font==="28px"&&!x.clipped&&x.buttonLeft>=x.hostLeft-2&&x.buttonRight<=x.hostRight+2),JSON.stringify(enlarged));
 assert("visible Fluent icons retain measurable dimensions at 200%",enlarged.every(x=>x.iconW>=10&&x.iconH>=10),JSON.stringify(enlarged));
 assert("200% RTL icon stays in Button face and after Persian label",enlarged.every(x=>x.iconInside&&x.iconRightOfText),JSON.stringify(enlarged));
 assert("icon/text remain vertically centered at 200% text size",enlarged.every(x=>x.iconOffset<=2),JSON.stringify(enlarged.map(x=>({id:x.id,offset:x.iconOffset}))));
 assert("200% Persian label and icon remain centered within Button face",enlarged.every(x=>x.faceTextOffset<=2&&x.faceIconOffset<=2),JSON.stringify(enlarged));
 await cdp.js("document.querySelectorAll('.v3-lab-typography .bui-button').forEach(b=>{b.style.fontSize='56px';b.style.lineHeight='1.5';})");
 const huge=await cdp.js("(()=>{const h=document.querySelector('.v3-lab-surface'),r=h.getBoundingClientRect();return [...document.querySelectorAll('.v3-lab-typography .bui-button')].map(b=>{const t=b.querySelector('.text'),icon=[...b.querySelectorAll('.bui-icon')].find(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>8&&e.getBoundingClientRect().height>8),v=b.getBoundingClientRect(),ix=icon.getBoundingClientRect(),tx=t.getBoundingClientRect();return {id:b.id,iconOffset:Math.abs(ix.top+ix.height/2-tx.top-tx.height/2),faceTextOffset:Math.abs(v.top+v.height/2-tx.top-tx.height/2),faceIconOffset:Math.abs(v.top+v.height/2-ix.top-ix.height/2),font:getComputedStyle(b).fontSize,clipped:t.scrollWidth>t.clientWidth+1,buttonLeft:v.left,buttonRight:v.right,hostLeft:r.left,hostRight:r.right,textScroll:t.scrollWidth,textClient:t.clientWidth,iconW:ix.width,iconH:ix.height,iconInside:ix.left>=v.left-1&&ix.right<=v.right+1&&ix.top>=v.top-1&&ix.bottom<=v.bottom+1,iconRightOfText:ix.left>=tx.right-2};});})()");
 assert("400% Persian text inside 320px RTL host has no lost content",huge.every(x=>x.font==="56px"&&!x.clipped&&x.buttonLeft>=x.hostLeft-2&&x.buttonRight<=x.hostRight+2),JSON.stringify(huge));
 assert("visible Fluent icons retain measurable dimensions at 400%",huge.every(x=>x.iconW>=10&&x.iconH>=10),JSON.stringify(huge));
 assert("400% RTL icon stays in Button face and after wrapped Persian label",huge.every(x=>x.iconInside&&x.iconRightOfText),JSON.stringify(huge));
 assert("400% Persian icon and wrapped text geometric centers aligned",huge.every(x=>x.iconOffset<=2),JSON.stringify(huge.map(x=>({id:x.id,offset:x.iconOffset}))));
 assert("400% wrapped Persian label and icon remain centered within Button face",huge.every(x=>x.faceTextOffset<=2&&x.faceIconOffset<=2),JSON.stringify(huge));
 await cdp.js("document.querySelectorAll('.v3-lab-typography .bui-button').forEach(b=>{b.style.fontSize='';b.style.lineHeight='';})");
 await cdp.js("document.documentElement.style.fontSize=''");
 await cdp.send("Emulation.clearDeviceMetricsOverride");
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
 const normal=await cdp.js("getComputedStyle(document.querySelector('.v3-lab-surface')).getPropertyValue('--bui-v3-motion-duration-fast').trim()");
 assert("non-reduced duration 150ms",normal==="150ms",normal);
 const normalMotion=await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface'),p=document.querySelector('#v3-popover-trigger_surface');return {reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,token:getComputedStyle(h).getPropertyValue('--bui-v3-motion-duration-fast').trim(),popoverTransition:getComputedStyle(p).transitionDuration};})()");
 assert("real Blazor Popover has normal-motion transition when no-preference is active",!normalMotion.reduced&&normalMotion.token==="150ms"&&normalMotion.popoverTransition.split(",").some(x=>parseFloat(x)>0),JSON.stringify(normalMotion));
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
 const dialogAccessibility=await cdp.js("(()=>{const wrap=document.querySelector('.dialog-wrapper[data-bui-v3-tokens]'),dlg=wrap?.querySelector('.bui-dialog'),close=dlg?.querySelector('.header button');return {role:dlg?.getAttribute('role')||null,ariaModal:dlg?.getAttribute('aria-modal')||null,title:dlg?.querySelector('.title')?.textContent?.trim(),labelledBy:dlg?.getAttribute('aria-labelledby'),headingId:dlg?.querySelector('h2.title')?.id,explicitName:dlg?.getAttribute('aria-label'),closeText:close?.textContent?.trim(),closeAria:close?.getAttribute('aria-label'),closeTitle:close?.getAttribute('title'),focusId:document.activeElement?.id,focusInDialog:!!document.activeElement?.closest('.bui-dialog'),closeMarkup:close?.outerHTML?.slice(0,550)};})()");
 console.log("Dialog current keyboard/semantics baseline (not certified):",JSON.stringify(dialogAccessibility));
 const dialogDoc=await cdp.send("DOM.getDocument",{depth:1});
 const closeButtonNode=await cdp.send("DOM.querySelector",{nodeId:dialogDoc.root.nodeId,selector:".dialog-wrapper[data-bui-v3-tokens] .bui-dialog .header button"});
 const closeAx=await cdp.send("Accessibility.getPartialAXTree",{nodeId:closeButtonNode.nodeId,fetchRelatives:false});
 const closeAxInfo=closeAx.nodes?.find(x=>x.role?.value==="button");
 const accessibilityGap={dialogHasRole:!!dialogAccessibility.role,closeButtonAxName:closeAxInfo?.name?.value||"",closeButtonIgnored:closeAxInfo?.ignored,activeFocusInDialog:dialogAccessibility.focusInDialog,focusId:dialogAccessibility.focusId};
 console.log("D5 accessible-name/focus proof (read-only Chrome AX):",JSON.stringify(accessibilityGap));
 assert("opt-in Dialog uses semantic role",dialogAccessibility.role==="dialog"&&dialogAccessibility.ariaModal===null,JSON.stringify(dialogAccessibility));
 assert("named title-based Dialog links aria-labelledby to its actual h2",dialogAccessibility.labelledBy===dialogAccessibility.headingId&&dialogAccessibility.title==="v3 scoped Dialog"&&dialogAccessibility.explicitName===null,JSON.stringify(dialogAccessibility));
 const dialogRootNode=await cdp.send("DOM.querySelector",{nodeId:dialogDoc.root.nodeId,selector:".dialog-wrapper[data-bui-v3-tokens] .bui-dialog"});
 const dialogRootAx=await cdp.send("Accessibility.getPartialAXTree",{nodeId:dialogRootNode.nodeId,fetchRelatives:false});
 const rootAx=dialogRootAx.nodes?.find(x=>x.role?.value==="dialog");
 assert("Chrome accessibility tree computes name from visible Dialog heading",rootAx?.name?.value===dialogAccessibility.title,JSON.stringify({name:rootAx?.name,relatedNodes:rootAx?.name?.sources?.map(x=>x.type)}));
 const standardDescription=await cdp.js("(()=>{const d=document.querySelector('.dialog-wrapper[data-bui-v3-tokens] .bui-dialog'),id=d.getAttribute('aria-describedby'),p=id&&d.querySelector('#'+id);return {id,description:p?.textContent?.trim(),visible:!!p&&p.getClientRects().length>0,onlyOne:!!id&&document.querySelectorAll('#'+id).length===1};})()");
 assert("standard opt-in Dialog aria-describedby targets exactly one visible explanation",standardDescription.visible&&standardDescription.onlyOne&&standardDescription.description==="Review the attendance changes before confirming.",JSON.stringify(standardDescription));
 assert("Chrome AX Dialog description comes from the actual explanation node",rootAx?.description?.value===standardDescription.description,JSON.stringify({name:rootAx?.name?.value,description:rootAx?.description?.value}));
 assert("opt-in close Button has readable AX name",accessibilityGap.closeButtonAxName==="Close dialog"&&!accessibilityGap.closeButtonIgnored,JSON.stringify(accessibilityGap));
 assert("opt-in Dialog initially receives focus",accessibilityGap.activeFocusInDialog,JSON.stringify(accessibilityGap));
 const openAccessibilityGaps=[];
 if(!accessibilityGap.dialogHasRole)openAccessibilityGaps.push("Dialog lacks role=dialog in current opt-in prototype");
 if([...accessibilityGap.closeButtonAxName].length>0&&[...accessibilityGap.closeButtonAxName].every(x=>x.codePointAt(0)>=0xE000&&x.codePointAt(0)<=0xF8FF))openAccessibilityGaps.push("Close button AX name is private-use icon glyph, not readable label");
 if(!accessibilityGap.activeFocusInDialog)openAccessibilityGaps.push("Programmatic Dialog open did not focus a descendant");
 if(popoverA11y.surfaceHidden===false&&popoverA11y.triggerExpanded===null&&popoverA11y.triggerControls===null)openAccessibilityGaps.push("Open button-triggered Popover lacks aria-expanded and aria-controls relation");
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Show alternate host dialog'))?.click()");
 const twinDialogs=await until(()=>cdp.js("(()=>{const list=[...document.querySelectorAll('.dialog-wrapper')];if(list.length<2)return null;return list.map(x=>({mode:x.dataset.buiTheme,dir:x.dir,brand:x.dataset.buiBrand,optIn:x.hasAttribute('data-bui-v3-tokens'),background:getComputedStyle(x.querySelector('.bui-dialog')).backgroundColor,sourceBrand:getComputedStyle(x).getPropertyValue('--colorBrandBackground').trim()}));})()"),"two simultaneous Dialog scopes",16000);
 assert("simultaneous Dialogs preserve independent Dark/Light scopes",twinDialogs.length===2&&twinDialogs[0].mode==="dark"&&twinDialogs[1].mode==="light"&&twinDialogs[0].brand==="excel"&&twinDialogs[1].brand==="word"&&hexRgb(twinDialogs[0].sourceBrand)===hexRgb(matrix.excel.dark.tokens["bluent.color.brandBackground"])&&hexRgb(twinDialogs[1].sourceBrand)===hexRgb(matrix.word.light.tokens["bluent.color.brandBackground"])&&twinDialogs[0].dir==="rtl"&&twinDialogs[1].dir==="ltr"&&twinDialogs.every(d=>d.optIn)&&twinDialogs[0].background!==twinDialogs[1].background,JSON.stringify(twinDialogs));
 const secondDialogLabel=await cdp.js("(()=>{const d=[...document.querySelectorAll('.dialog-wrapper')][1]?.querySelector('.bui-dialog');return {role:d?.getAttribute('role'),name:d?.getAttribute('aria-label'),labelledBy:d?.getAttribute('aria-labelledby'),headingId:d?.querySelector('h2.title')?.id,close:d?.querySelector('.header button')?.getAttribute('aria-label'),focus:document.activeElement===d};})()");
 assert("concurrent RTL/LTR Dialog owns localized Persian close label",secondDialogLabel.role==="dialog"&&secondDialogLabel.name===null&&secondDialogLabel.labelledBy===secondDialogLabel.headingId&&secondDialogLabel.close==="بستن پنجره"&&secondDialogLabel.focus,JSON.stringify(secondDialogLabel));
 const headingReferences=await cdp.js("(()=>[...document.querySelectorAll('.dialog-wrapper .bui-dialog[aria-labelledby]')].map(d=>({dialog:d.id,reference:d.getAttribute('aria-labelledby'),matches:[...document.querySelectorAll('[id]')].filter(x=>x.id===d.getAttribute('aria-labelledby')).length,inside:!!d.querySelector('#'+d.getAttribute('aria-labelledby'))})))()");
 assert("simultaneous Dialog headings have unique, correctly scoped IDREF targets",headingReferences.length===2&&new Set(headingReferences.map(x=>x.reference)).size===2&&headingReferences.every(x=>x.matches===1&&x.inside),JSON.stringify(headingReferences));
 await cdp.js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Show legacy unscoped dialog'))?.click()");
 const fallback=await until(()=>cdp.js("(()=>{const all=[...document.querySelectorAll('.dialog-wrapper')];return all.length>=3?{mode:all[2].getAttribute('data-bui-theme'),dir:all[2].getAttribute('dir'),brand:all[2].getAttribute('data-bui-brand'),optIn:all[2].hasAttribute('data-bui-v3-tokens'),bg:getComputedStyle(all[2].querySelector('.bui-dialog')).backgroundColor}:null;})()"),"existing unscoped v2 Dialog",16000);
 assert("no-scope Dialog retains legacy fallback",fallback.mode===null&&fallback.dir===null&&fallback.brand===null&&!fallback.optIn,JSON.stringify(fallback));
 const legacyAx=await cdp.js("(()=>{const d=[...document.querySelectorAll('.dialog-wrapper')][2]?.querySelector('.bui-dialog');return {role:d?.getAttribute('role'),name:d?.getAttribute('aria-label'),tabindex:d?.getAttribute('tabindex'),close:d?.querySelector('.header button')?.getAttribute('aria-label')};})()");
 assert("unscoped Dialog preserves legacy accessibility markup",legacyAx.role===null&&legacyAx.name===null&&legacyAx.tabindex===null&&legacyAx.close===null,JSON.stringify(legacyAx));
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
 // Clean up the two pre-existing sibling dialogs before testing single-owner
 // focus restoration. Focus must not be redirected behind an open sibling.
 await cdp.js("[...document.querySelectorAll('.dialog-wrapper')].at(-1)?.querySelector('.header button')?.click()");
 await until(()=>cdp.js("document.querySelectorAll('.dialog-wrapper').length===1"),"legacy Dialog cleanup",15000);
 await cdp.js("document.querySelector('.dialog-wrapper .header button')?.click()");
 await until(()=>cdp.js("document.querySelectorAll('.dialog-wrapper').length===0"),"independent Dialog cleanup",15000);
 await cdp.js("document.querySelector('#v3-show-service-dialog')?.focus()");
 const beforeReturn=await cdp.js("document.activeElement?.id");
 assert("explicit opt-in Dialog launcher can hold keyboard focus",beforeReturn==="v3-show-service-dialog",beforeReturn);
 await cdp.js("document.querySelector('#v3-show-service-dialog')?.click()");
 await until(()=>cdp.js("document.querySelectorAll('.dialog-wrapper').length===1&&!!document.activeElement?.closest('.bui-dialog')"),"return-focus Dialog open",16000);
 await cdp.js("document.querySelector('.dialog-wrapper .header button')?.click()");
 const focusReturned=await until(()=>cdp.js("document.querySelectorAll('.dialog-wrapper').length===0&&document.activeElement?.id==='v3-show-service-dialog'"),"Dialog focus restoration after close",16000);
 assert("opt-in Dialog restores focus to explicitly supplied live Bluent Button",focusReturned);
 // D5: exercise the actual v3 opt-in MODAL, including topmost-only keyboard
 // capture, real Tab/Shift+Tab cycling and nested Escape focus ownership.
 const sendModalKey=async(key,shift=false)=>{
     const code=key==="Tab"?"Tab":"Escape",vk=key==="Tab"?9:27,modifiers=shift?8:0;
     await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk,modifiers});
     await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk,modifiers});
 };
 await cdp.js("document.querySelector('#v3-show-keyboard-modal')?.focus()");
 await cdp.js("document.querySelector('#v3-show-keyboard-modal')?.click()");
 const modal=await until(()=>cdp.js("(()=>{const list=[...document.querySelectorAll('.dialog-wrapper')],d=list[0]?.querySelector('.bui-dialog');return list.length===1&&d?.hasAttribute('data-bui-v3-keyboard-bound')?{role:d.getAttribute('role'),modal:d.getAttribute('aria-modal'),focused:document.activeElement===d,dir:d.closest('.dialog-wrapper').dir,hasNested:!!d.querySelector('#v3-modal-open-nested')}:null;})()"),"v3 opted-in modal is registered",25000);
 assert("opt-in v3 Modal role aria-modal and focus entry",modal.role==="dialog"&&modal.modal==="true"&&modal.focused&&modal.dir==="rtl"&&modal.hasNested,JSON.stringify(modal));
 await cdp.js("document.querySelector('#v3-modal-popover-trigger')?.focus()");
 await cdp.js("document.querySelector('#v3-modal-popover-trigger')?.click()");
 const modalPopupOpen=await until(()=>cdp.js("(()=>{const t=document.querySelector('#v3-modal-popover-trigger'),s=document.querySelector('#v3-modal-popover-trigger_surface');return !!s&&!s.classList.contains('hidden')&&t?.getAttribute('aria-expanded')==='true'&&document.activeElement===t;})()"),"Popover child opens inside Modal",17000);
 assert("opt-in Popover inside real Modal opens and owns focus",modalPopupOpen);
 await sendModalKey("Escape");
 const popupEscape=await until(()=>cdp.js("(()=>{const t=document.querySelector('#v3-modal-popover-trigger'),s=document.querySelector('#v3-modal-popover-trigger_surface');return s?.classList.contains('hidden')&&t?.getAttribute('aria-expanded')==='false'&&document.querySelectorAll('.dialog-wrapper').length===1&&document.activeElement===t;})()"),"Escape closes Popover before Modal",17000);
 assert("first Escape closes visible child Popover but keeps parent Modal open",popupEscape);
 await cdp.js("(()=>{const b=document.querySelector('#v3-modal-first-0');b?.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();}},{once:true});b?.focus();})()");
 await sendModalKey("Escape");
 const innerEscape=await cdp.js("(()=>({modals:document.querySelectorAll('.dialog-wrapper').length,focus:document.activeElement?.id}))()");
 assert("inner composite control can consume Escape before Modal window handler",innerEscape.modals===1&&innerEscape.focus==="v3-modal-first-0",JSON.stringify(innerEscape));
 await cdp.js("document.querySelector('.dialog-wrapper .bui-dialog')?.focus()");
 await sendModalKey("Tab");
 const firstTab=await until(()=>cdp.js("(()=>{const d=document.querySelector('.dialog-wrapper .bui-dialog');return document.activeElement===d?.querySelector('.header button');})()"),"Tab from modal root enters first close action",9000);
 assert("Modal Tab starts at its first focusable button",firstTab);
 await sendModalKey("Tab",true);
 const backwards=await until(()=>cdp.js("document.activeElement?.id==='v3-modal-last-0'"),"Shift Tab from first wraps to last",9000);
 assert("Modal Shift+Tab wraps from first to last",backwards);
 await sendModalKey("Tab");
 const forwards=await until(()=>cdp.js("document.activeElement?.closest('.bui-dialog')?.querySelector('.header button')===document.activeElement"),"Tab from last wraps to first",9000);
 assert("Modal Tab wraps from last to first",forwards);
 await cdp.js("document.querySelector('#v3-token-action')?.focus()");
 await sendModalKey("Tab");
 const recaptured=await until(()=>cdp.js("document.activeElement?.closest('.bui-dialog')?.querySelector('.header button')===document.activeElement"),"modal Tab recaptures focus",9000);
 assert("Modal prevents Tab escape when focus is outside",recaptured);
 await cdp.js("document.querySelector('#v3-modal-open-nested')?.focus()");
 await cdp.js("document.querySelector('#v3-modal-open-nested')?.click()");
 const nested=await until(()=>cdp.js("(()=>{const w=[...document.querySelectorAll('.dialog-wrapper')];const d=w.at(-1)?.querySelector('.bui-dialog');return w.length===2&&d?.hasAttribute('data-bui-v3-keyboard-bound')?{focused:document.activeElement===d,role:d.getAttribute('role'),modal:d.getAttribute('aria-modal'),nestedButton:!!d.querySelector('#v3-modal-last-1')}:null;})()"),"stacked nested modal registered",23000);
 assert("nested v3 Modal becomes the focused topmost owner",nested.focused&&nested.modal==="true"&&nested.nestedButton,JSON.stringify(nested));
 await sendModalKey("Tab",true);
 const nestedShift=await until(()=>cdp.js("document.activeElement?.id==='v3-modal-last-1'"),"nested Shift Tab last",9000);
 assert("nested modal Shift+Tab remains inside topmost modal",nestedShift);
 await sendModalKey("Escape");
 // A held/repeating Escape must never pass through a closing child
 // and unexpectedly dismiss the still-open parent.
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27,nativeVirtualKeyCode:27,autoRepeat:true});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
 const nestedClosed=await until(()=>cdp.js("document.querySelectorAll('.dialog-wrapper').length===1&&document.activeElement?.id==='v3-modal-open-nested'"),"nested Escape closes only top dialog and returns focus",23000);
 assert("Escape closes top nested Dialog and restores owning launcher focus",nestedClosed);
 await sendModalKey("Escape");
 const outerClosed=await until(()=>cdp.js("document.querySelectorAll('.dialog-wrapper').length===0&&document.activeElement?.id==='v3-show-keyboard-modal'"),"outer Escape closes and restores page launcher",23000);
 assert("Escape closes remaining Modal and restores page-launcher focus",outerClosed);
 await sendModalKey("Tab");
 const noTrap=await cdp.js("(()=>({active:document.activeElement?.id,withinModal:!!document.activeElement?.closest('.bui-dialog'),modalCount:document.querySelectorAll('[data-bui-v3-keyboard-bound]').length}))()");
 assert("modal listener release restores normal page tab order",noTrap.modalCount===0&&!noTrap.withinModal&&noTrap.active!=="v3-show-keyboard-modal",JSON.stringify(noTrap));
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
 await cdp.js("document.querySelector('#v3-show-keyboard-modal')?.click()");
 const reducedModal=await until(()=>cdp.js("(()=>{const d=document.querySelector('.dialog-wrapper .bui-dialog[data-bui-v3-keyboard-bound]');return d?{duration:getComputedStyle(d).animationDuration,role:d.getAttribute('role')}:null;})()"),"reduced-motion modal registration",24000);
 assert("reduced-motion opt-in modal preserves semantic keyboard registration",reducedModal.duration.split(",").every(x=>parseFloat(x)===0)&&reducedModal.role==="dialog",JSON.stringify(reducedModal));
 await sendModalKey("Escape");
 const reducedDismiss=await until(()=>cdp.js("document.querySelectorAll('.dialog-wrapper').length===0&&document.activeElement?.id==='v3-show-keyboard-modal'"),"reduced-motion Escape dismiss and focus return",23000);
 assert("reduced-motion Escape completes dismissal and launcher restoration",reducedDismiss);
 await cdp.js("document.querySelector('#v3-show-initial-focus-modal')?.click()");
 const initialPreferred=await until(()=>cdp.js("document.querySelectorAll('.dialog-wrapper').length===1&&document.activeElement?.id==='v3-modal-last-0'"),"explicit internal last-action initial focus",19000);
 assert("explicit initial focus chooses enabled target inside Modal",initialPreferred);
 await sendModalKey("Escape");
 const initialClosed=await until(()=>cdp.js("document.querySelectorAll('.dialog-wrapper').length===0&&document.activeElement?.id==='v3-show-initial-focus-modal'"),"preferred focus modal closes",16000);
 assert("preferred focus Modal restores its own page launcher",initialClosed);
 await cdp.js("document.querySelector('#v3-show-invalid-focus-modal')?.click()");
 const rejectedOutside=await until(()=>cdp.js("(()=>{const d=document.querySelector('.dialog-wrapper .bui-dialog');return !!d&&document.activeElement===d;})()"),"external initial focus target rejected",19000);
 assert("external initial-focus ID cannot steal focus outside Modal",rejectedOutside);
 await sendModalKey("Escape");
 const invalidClosed=await until(()=>cdp.js("document.querySelectorAll('.dialog-wrapper').length===0&&document.activeElement?.id==='v3-show-invalid-focus-modal'"),"invalid focus modal dismiss",16000);
 assert("invalid focus fallback still restores correct launcher",invalidClosed);
 await cdp.js("document.querySelector('#v3-show-custom-fragment')?.click()");
 const customRoot=await until(()=>cdp.js("(()=>{const d=document.querySelector('.dialog-wrapper .bui-dialog');if(!d||!d.hasAttribute('data-bui-v3-keyboard-bound'))return null;return {role:d.getAttribute('role'),name:d.getAttribute('aria-label'),labelledBy:d.getAttribute('aria-labelledby'),heading:d.querySelector('h2'),fragment:!!d.querySelector('#v3-custom-fragment-content'),focused:document.activeElement===d};})()"),"custom render fragment opt-in Dialog without standard header",18000);
 assert("custom Dialog uses valid aria-label fallback without missing aria-labelledby",customRoot.role==="dialog"&&customRoot.name==="پنجره سفارشی"&&customRoot.labelledBy===null&&customRoot.heading===null&&customRoot.fragment&&customRoot.focused,JSON.stringify(customRoot));
 const customDocument=await cdp.send("DOM.getDocument",{depth:1});
 const customNode=await cdp.send("DOM.querySelector",{nodeId:customDocument.root.nodeId,selector:".dialog-wrapper .bui-dialog"});
 const customAxTree=await cdp.send("Accessibility.getPartialAXTree",{nodeId:customNode.nodeId,fetchRelatives:false});
 assert("custom Dialog Persian fallback is computed AX name",customAxTree.nodes?.find(x=>x.role?.value==="dialog")?.name?.value==="پنجره سفارشی",JSON.stringify(customAxTree.nodes?.map(x=>({role:x.role?.value,name:x.name?.value}))));
 const customDescription=await cdp.js("(()=>{const d=document.querySelector('.dialog-wrapper .bui-dialog'),id=d?.getAttribute('aria-describedby'),p=id&&d.querySelector('#'+id);return {id,present:!!p,text:p?.textContent?.trim(),count:id?document.querySelectorAll('#'+id).length:0};})()");
 const customAxRoot=customAxTree.nodes?.find(x=>x.role?.value==="dialog");
 assert("custom Persian Dialog description is visible, unique and exposed in AX",customDescription.present&&customDescription.count===1&&customDescription.text==="متن راهنمای این پنجره سفارشی برای صفحه‌خوان"&&customAxRoot?.description?.value===customDescription.text,JSON.stringify({customDescription,ax:customAxRoot?.description?.value}));
 await sendModalKey("Escape");
 const customClosed=await until(()=>cdp.js("document.querySelectorAll('.dialog-wrapper').length===0&&document.activeElement?.id==='v3-show-custom-fragment'"),"custom fragment dismiss and return",16000);
 assert("custom Dialog closes and restores its explicitly configured launcher",customClosed);
 await cdp.js("document.querySelector('#v3-show-live-title')?.click()");
 const liveBefore=await until(()=>cdp.js("(()=>{const d=document.querySelector('.dialog-wrapper .bui-dialog'),h=d?.querySelector('h2.title'),description=d?.querySelector('.bui-v3-dialog-description');return h&&d.hasAttribute('data-bui-v3-keyboard-bound')?{id:h.id,text:h.textContent.trim(),reference:d.getAttribute('aria-labelledby'),descId:d.getAttribute('aria-describedby'),descText:description?.textContent.trim(),focus:document.activeElement?.id}:null;})()"),"live title Dialog is opened and has rendered heading",18000);
 assert("live-title opt-in Dialog initializes proper heading description and TextField focus",liveBefore.reference===liveBefore.id&&liveBefore.text==="Review attendance changes"&&liveBefore.descText==="Review this person's changes before approving."&&liveBefore.focus==="v3-live-title-field",JSON.stringify(liveBefore));
 await cdp.js("document.querySelector('#v3-live-title-update')?.click()");
 const liveAfter=await until(()=>cdp.js("(()=>{const d=document.querySelector('.dialog-wrapper .bui-dialog'),h=d?.querySelector('h2.title');return h?.textContent?.trim()==='تأیید درخواست - عنوان جدید'?{id:h.id,reference:d.getAttribute('aria-labelledby'),title:h.textContent.trim(),desc:d.getAttribute('aria-describedby')}:null;})()"),"Blazor changes live Dialog title",18000);
 assert("Blazor re-render changes only visible heading text and preserves IDREFs",liveAfter.id===liveBefore.id&&liveAfter.reference===liveBefore.reference&&liveAfter.desc===liveBefore.descId,JSON.stringify(liveAfter));
 const liveDocument=await cdp.send("DOM.getDocument",{depth:1});
 const liveNode=await cdp.send("DOM.querySelector",{nodeId:liveDocument.root.nodeId,selector:".dialog-wrapper .bui-dialog"});
 const liveAxTree=await cdp.send("Accessibility.getPartialAXTree",{nodeId:liveNode.nodeId,fetchRelatives:false});
 const liveAx=liveAxTree.nodes?.find(x=>x.role?.value==="dialog");
 assert("Chrome AX name follows Blazor-updated Persian title and retains description",liveAx?.name?.value===liveAfter.title&&liveAx?.description?.value===liveBefore.descText,JSON.stringify({name:liveAx?.name?.value,description:liveAx?.description?.value}));
 await sendModalKey("Escape");
 const liveClosed=await until(()=>cdp.js("document.querySelectorAll('.dialog-wrapper').length===0&&document.activeElement?.id==='v3-show-live-title'"),"dynamic heading modal close and return",16000);
 assert("live-title Dialog Escape restores launcher and tears down overlay",liveClosed);
 // D5: Persian-first text, explicit localized close action, and live AX text.
 // Unlike the English-heading demo, both name and description start Persian.
 await cdp.js("document.querySelector('#v3-show-persian-dialog')?.click()");
 const faDialog=await until(()=>cdp.js("(()=>{const d=document.querySelector('.dialog-wrapper .bui-dialog'),h=d?.querySelector('h2.title');if(!h||!d.hasAttribute('data-bui-v3-keyboard-bound'))return null;const ref=d.getAttribute('aria-describedby'),p=ref&&d.querySelector('#'+ref),close=d.querySelector('button[aria-label=\"بستن پنجره\"]');return {name:h.textContent.trim(),id:h.id,labelledBy:d.getAttribute('aria-labelledby'),description:p?.textContent.trim(),descRef:ref,descVisible:!!p&&p.getClientRects().length>0,descCount:ref?document.querySelectorAll('#'+ref).length:0,close:!!close,focused:document.activeElement?.id};})()"),"real Persian-heading Dialog rendered",20000);
 const expectedFaDescription="برای تأیید درخواست مرخصی شماره ABC-123، اطلاعات را بررسی کنید؛ سپس پنجره را ببندید.";
 assert("fully Persian Dialog heading linked and initial TextField focus",
   faDialog.name==="بررسی درخواست مرخصی"&&faDialog.id===faDialog.labelledBy&&faDialog.focused==="v3-live-title-field",JSON.stringify(faDialog));
 assert("Persian explanation is visible and uniquely referenced by aria-describedby",
   faDialog.descVisible&&faDialog.descCount===1&&faDialog.description===expectedFaDescription,JSON.stringify(faDialog));
 const faDocument=await cdp.send("DOM.getDocument",{depth:1});
 const faNode=await cdp.send("DOM.querySelector",{nodeId:faDocument.root.nodeId,selector:".dialog-wrapper .bui-dialog"});
 const faAxTree=await cdp.send("Accessibility.getPartialAXTree",{nodeId:faNode.nodeId,fetchRelatives:false});
 const faAx=faAxTree.nodes?.find(x=>x.role?.value==="dialog");
 assert("Chromium AX computes Persian accessible name and description",
   faAx?.name?.value===faDialog.name&&faAx?.description?.value===expectedFaDescription,JSON.stringify({name:faAx?.name?.value,description:faAx?.description?.value}));
 await cdp.js("document.querySelector('.dialog-wrapper button[aria-label=\"بستن پنجره\"]')?.click()");
 const faClosed=await until(()=>cdp.js("document.querySelectorAll('.dialog-wrapper').length===0&&document.activeElement?.id==='v3-show-persian-dialog'"),"localized Close button dismissal and return",19000);
 assert("localized Persian Close button is actionable and restores launcher",faDialog.close&&faClosed);
 await cdp.send("Emulation.setEmulatedMedia",{features:[]});
 // D5 lifecycle: remove an opt-in Dialog component from a live Blazor
 // render tree, without calling Close(). Check actual global keydown count.
 const windowKeydownCount=async()=>{
   const ref=await cdp.send("Runtime.evaluate",{expression:"window",returnByValue:false});
   const result=await cdp.send("DOMDebugger.getEventListeners",{objectId:ref.result.objectId});
   return result.listeners.filter(l=>l.type==="keydown").length;
 };
 const baselineWindowKeys=await windowKeydownCount();
 for(let pass=1;pass<=3;pass++){
   await cdp.js("document.querySelector('#v3-mount-lifecycle-modal')?.click()");
   const mounted=await until(()=>cdp.js("(()=>{const d=document.querySelector('.bui-dialog[data-bui-v3-keyboard-modal]'),section=d?.querySelector('[data-v3-lifecycle-modal]');return !!section&&d.hasAttribute('data-bui-v3-keyboard-bound')&&document.activeElement===d;})()"),"temporary modal mounted and registered #"+pass,19000);
   const activeListeners=await until(async()=>{const n=await windowKeydownCount();return n===baselineWindowKeys+1?n:null;},"opt-in global keyboard listener registered #"+pass,12000);
   await cdp.js("document.querySelector('#v3-unmount-lifecycle-modal')?.click()");
   const removed=await until(()=>cdp.js("!document.querySelector('[data-v3-lifecycle-modal]')&&!document.querySelector('.bui-dialog[data-bui-v3-keyboard-modal]')"),"temporary Dialog unmounted without closing #"+pass,16000);
   const after=await until(async()=>{const n=await windowKeydownCount();return n===baselineWindowKeys;},"window keydown cleanup after actual Dialog dispose #"+pass,18000);
   assert("Dialog owner unmount "+pass+" releases JS window keydown listener and references",mounted&&activeListeners===baselineWindowKeys+1&&removed&&after===true,
    JSON.stringify({baselineWindowKeys,activeListeners,after,pass}));
 }
 await cdp.js("document.querySelector('#v3-mount-lifecycle-modal')?.focus()");
 await sendModalKey("Tab");
 const freeAfterUnmount=await cdp.js("(()=>({active:document.activeElement?.id,dialogs:document.querySelectorAll('.bui-dialog[data-bui-v3-keyboard-bound]').length}))()");
 assert("after repeated Dialog teardown Tab remains normal and no modal is registered",
   freeAfterUnmount.dialogs===0&&freeAfterUnmount.active!=="v3-mount-lifecycle-modal",JSON.stringify(freeAfterUnmount));
 // #418 / #501 focus modality regression: a real pointer action must not
 // retain the keyboard-only :focus-visible ring, while the next Tab must.
 const pointerTarget=await cdp.js("(() => { const b=document.querySelector('#v3-fa-button');b.scrollIntoView({block:'center',inline:'center'});const r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,visible:r.width>0&&r.height>0};})()");
 assert("pointer focus target is a rendered Button",pointerTarget.visible,JSON.stringify(pointerTarget));
 await cdp.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:pointerTarget.x,y:pointerTarget.y});
 await cdp.send("Input.dispatchMouseEvent",{type:"mousePressed",x:pointerTarget.x,y:pointerTarget.y,button:"left",clickCount:1});
 await cdp.send("Input.dispatchMouseEvent",{type:"mouseReleased",x:pointerTarget.x,y:pointerTarget.y,button:"left",clickCount:1});
 const pointerFocus=await cdp.js("(() => {const b=document.querySelector('#v3-fa-button');return {active:document.activeElement===b,focusVisible:b.matches(':focus-visible'),outlineStyle:getComputedStyle(b).outlineStyle};})()");
 assert("real mouse click does not show keyboard-only Button focus ring",pointerFocus.active&&!pointerFocus.focusVisible,JSON.stringify(pointerFocus));
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
 const restoredKeyFocus=await cdp.js("(() => {const e=document.activeElement;return {id:e?.id,keyboardVisible:e?.matches(':focus-visible'),insideLab:!!e?.closest('.v3-lab-surface'),outline:getComputedStyle(e).outlineWidth};})()");
 assert("Tab after mouse click restores keyboard focus-visible ring",restoredKeyFocus.insideLab&&restoredKeyFocus.keyboardVisible&&parseFloat(restoredKeyFocus.outline)>=2,JSON.stringify(restoredKeyFocus));

 // #418 reviewer UX: preview choices are visible clickable Bluent Buttons,
 // not DevTools-only attributes. Always return to Baseline for the remaining
 // scope/brand/keyboard matrix to keep earlier regression expectations stable.
 for(const id of ["baseline","brand","focus2","double","baseline"]){
   await cdp.js("document.getElementById('v3-focus-preview-"+id+"').click()");
   await new Promise(resolve=>setTimeout(resolve,85));
   const ui=await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface');return {brand:h.hasAttribute('data-bui-v3-focus-brand-candidate'),single:h.hasAttribute('data-bui-v3-focus-contrast-candidate'),double:h.hasAttribute('data-bui-v3-focus-double-ring-candidate'),text:document.querySelector('.v3-lab-focus-matrix [role=status]')?.textContent?.trim(),buttons:document.querySelectorAll('.v3-lab-focus-preview-controls .bui-button').length};})()");
   assert("interactive brand-first reviewer selector "+id,
     ui.buttons===4&&ui.brand===(id==="brand")&&ui.single===(id==="focus2")&&
     ui.double===(id==="double")&&ui.text?.length>20,JSON.stringify(ui));
 }
 // #418 / #501 research gate: focus decoration must not resize the same
 // native Button face. Test a real Shift+Tab return after an actual click.
 const focusGeometry = await cdp.js("(() => {const b=document.querySelector('#v3-fa-button'),r=b.getBoundingClientRect(),t=b.querySelector('.text')?.getBoundingClientRect(),i=[...b.querySelectorAll('.bui-icon')].find(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>8&&e.getBoundingClientRect().height>8)?.getBoundingClientRect();return {w:r.width,h:r.height,tw:t?.width,th:t?.height,iw:i?.width,ih:i?.height,visible:b.matches(':focus-visible'),outline:getComputedStyle(b).outlineWidth};})()");
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,nativeVirtualKeyCode:9,modifiers:8});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,nativeVirtualKeyCode:9,modifiers:8});
 const returnedFocus=await cdp.js("(() => {const b=document.querySelector('#v3-fa-button'),r=b.getBoundingClientRect(),t=b.querySelector('.text')?.getBoundingClientRect(),i=[...b.querySelectorAll('.bui-icon')].find(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>8&&e.getBoundingClientRect().height>8)?.getBoundingClientRect(),s=getComputedStyle(b);return {active:document.activeElement===b,visible:b.matches(':focus-visible'),w:r.width,h:r.height,tw:t?.width,th:t?.height,iw:i?.width,ih:i?.height,outline:s.outlineWidth,style:s.outlineStyle,offset:s.outlineOffset};})()");
 const stableFace=["w","h","tw","th","iw","ih"].every(k=>Math.abs(focusGeometry[k]-returnedFocus[k])<0.5);
 assert("real Shift+Tab restores keyboard-only focus on the same Persian Button",returnedFocus.active&&returnedFocus.visible&&returnedFocus.style!=="none"&&parseFloat(returnedFocus.outline)>=2,JSON.stringify(returnedFocus));
 assert("opt-in keyboard focus ring changes no Button face or label/icon dimensions",stableFace,JSON.stringify({before:focusGeometry,after:returnedFocus}));
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"forced-colors",value:"active"},{name:"prefers-reduced-motion",value:"reduce"}]});
 const contrastFocus=await cdp.js("(() => {const b=document.querySelector('#v3-fa-button'),s=getComputedStyle(b),r=b.getBoundingClientRect(),t=b.querySelector('.text').getBoundingClientRect(),i=[...b.querySelectorAll('.bui-icon')].find(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>8&&e.getBoundingClientRect().height>8).getBoundingClientRect();return {forced:matchMedia('(forced-colors: active)').matches,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,active:document.activeElement===b,visible:b.matches(':focus-visible'),color:s.outlineColor,style:s.outlineStyle,width:s.outlineWidth,offset:s.outlineOffset,w:r.width,h:r.height,tw:t.width,th:t.height,iw:i.width,ih:i.height};})()");
 assert("forced colors preserve actual keyboard-visible Button focus outline",contrastFocus.forced&&contrastFocus.reduced&&contrastFocus.active&&contrastFocus.visible&&contrastFocus.style!=="none"&&parseFloat(contrastFocus.width)>=2&&contrastFocus.color!=="rgba(0, 0, 0, 0)",JSON.stringify(contrastFocus));
 assert("forced-colors focus leaves Button face and Persian label/icon geometry stable",["w","h","tw","th","iw","ih"].every(k=>Math.abs(focusGeometry[k]-contrastFocus[k])<0.5),JSON.stringify({before:focusGeometry,forced:contrastFocus}));
 await cdp.send("Emulation.setEmulatedMedia",{features:[]});
 console.log("Real Button focus decoration geometry:",JSON.stringify({before:focusGeometry,keyboard:returnedFocus,forcedColors:contrastFocus}));
 // #418 / #501: native Tab/Shift+Tab focus for six existing Bluent appearances.
 const appearanceIds=["v3-focus-default","v3-focus-primary","v3-focus-danger","v3-focus-outline","v3-focus-subtle","v3-focus-transparent"];
 const appearanceGeometry=await cdp.js("(() => Object.fromEntries([...document.querySelectorAll('.v3-lab-focus-actions > .bui-button')].map(b=>{const r=b.getBoundingClientRect();return [b.id,{w:r.width,h:r.height}]})))()");
 const matrixTab=async(shift=false)=>{
   const modifiers=shift?8:0;
   await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,nativeVirtualKeyCode:9,modifiers});
   await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,nativeVirtualKeyCode:9,modifiers});
   return await cdp.js("(() => {const e=document.activeElement,s=getComputedStyle(e),r=e.getBoundingClientRect();return {id:e.id,visible:e.matches(':focus-visible'),width:parseFloat(s.outlineWidth),style:s.outlineStyle,color:s.outlineColor,w:r.width,h:r.height};})()");
 };
 await cdp.js("document.querySelector('#v3-focus-start').focus()");
 for(const id of appearanceIds){
   const state=await matrixTab();
   assert("real keyboard focus traverses appearance "+id,state.id===id&&state.visible&&state.width>=2&&state.style!=="none",JSON.stringify(state));
   const original=appearanceGeometry[id];
   assert("appearance focus adds no layout shift "+id,original&&Math.abs(state.w-original.w)<0.5&&Math.abs(state.h-original.h)<0.5,JSON.stringify({state,original}));
   // A pointer hovering over a keyboard-focused button must not erase the
   // keyboard modality. Measure whichever icon is actually painted.
   const center=await cdp.js("(() => {const b=document.querySelector('#"+id+"');b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");
   await cdp.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:center.x,y:center.y});
   const hovered=await cdp.js("(() => {const b=document.querySelector('#"+id+"'),r=b.getBoundingClientRect(),v=[...b.querySelectorAll('.bui-icon')].find(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>8),i=v?.getBoundingClientRect(),t=b.querySelector('.text')?.getBoundingClientRect(),s=getComputedStyle(b);return {id:b.id,hover:b.matches(':hover'),focus:document.activeElement===b,focusVisible:b.matches(':focus-visible'),ring:parseFloat(s.outlineWidth),w:r.width,h:r.height,iconW:i?.width,iconH:i?.height,iconInFace:!!i&&i.left>=r.left-1&&i.right<=r.right+1&&i.top>=r.top-1&&i.bottom<=r.bottom+1,textVertical:t?Math.abs((t.top+t.bottom-r.top-r.bottom)/2):null,iconVertical:i?Math.abs((i.top+i.bottom-r.top-r.bottom)/2):null};})()");
   assert("keyboard focus-visible survives real pointer hover "+id,hovered.hover&&hovered.focus&&hovered.focusVisible&&hovered.ring>=2,JSON.stringify(hovered));
   assert("hover/focus keeps visible icon and label centered with no face shift "+id,hovered.iconW>=10&&hovered.iconH>=10&&hovered.iconInFace&&hovered.textVertical<=2&&hovered.iconVertical<=2&&Math.abs(hovered.w-original.w)<0.5&&Math.abs(hovered.h-original.h)<0.5,JSON.stringify(hovered));
   await cdp.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:0,y:0});
   // Real keyboard-pressed combination (Space while Tab-focused), not a
   // programmatic :active CSS toggle. Release before advancing to next Tab.
   await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:" ",code:"Space",windowsVirtualKeyCode:32,nativeVirtualKeyCode:32});
   const pressed=await cdp.js("(() => {const b=document.querySelector('#"+id+"'),r=b.getBoundingClientRect(),s=getComputedStyle(b),i=[...b.querySelectorAll('.bui-icon')].find(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>8)?.getBoundingClientRect();return {id:b.id,active:b.matches(':active'),focusVisible:b.matches(':focus-visible'),outline:s.outlineWidth,iconW:i?.width,iconH:i?.height,w:r.width,h:r.height};})()");
   await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:" ",code:"Space",windowsVirtualKeyCode:32,nativeVirtualKeyCode:32});
   assert("keyboard Space-pressed state preserves focus-visible "+id,pressed.active&&pressed.focusVisible&&parseFloat(pressed.outline)>=2,JSON.stringify(pressed));
   assert("keyboard pressed visible icon and face remain stable "+id,pressed.iconW>=10&&pressed.iconH>=10&&Math.abs(pressed.w-original.w)<0.5&&Math.abs(pressed.h-original.h)<0.5,JSON.stringify(pressed));
 }
 const afterDisabled=await matrixTab();
 const disabledMatrix=await cdp.js("(() => {const b=document.querySelector('#v3-focus-disabled');return {disabled:b.disabled,focused:document.activeElement===b,ring:b.matches(':focus-visible')};})()");
 assert("Tab skips disabled appearance and reaches end sentinel",afterDisabled.id==="v3-focus-end"&&disabledMatrix.disabled&&!disabledMatrix.focused&&!disabledMatrix.ring,JSON.stringify({afterDisabled,disabledMatrix}));
 const reverse=await matrixTab(true);
 assert("Shift+Tab skips disabled appearance and returns to Transparent",reverse.id==="v3-focus-transparent"&&reverse.visible,JSON.stringify(reverse));
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"forced-colors",value:"active"}]});
 await cdp.js("document.querySelector('#v3-focus-start').focus()");
 const forcedAppearance=[];
 for(const id of appearanceIds){
   const state=await matrixTab();
   forcedAppearance.push(state);
   assert("forced-color keyboard focus remains visible "+id,state.id===id&&state.visible&&state.width>=2&&state.style!=="none"&&state.color!=="rgba(0, 0, 0, 0)",JSON.stringify(state));
 }
 await cdp.send("Emulation.setEmulatedMedia",{features:[]});
 console.log("Existing Button appearance keyboard matrix:",JSON.stringify({normal:appearanceIds,disabledSkip:afterDisabled.id,reverse:reverse.id,forced:forcedAppearance.map(s=>({id:s.id,color:s.color,width:s.width}))}));
 // Selected is an independent toggle visual state, NOT keyboard focus.
 // Exercise its real CSS and focus ring together without changing public API.
 const selectedIds=appearanceIds.map(x=>x.replace("v3-focus-","v3-selected-"));
 const selectedGeometry=await cdp.js("(() => Object.fromEntries([...document.querySelectorAll('.v3-lab-focus-actions .bui-button.toggled')].map(b=>{const r=b.getBoundingClientRect();return [b.id,{w:r.width,h:r.height}]})))()");
 await cdp.js("document.querySelector('#v3-selected-start').focus()");
 const selectedSemantics=[];
 for(const id of selectedIds){
   const state=await matrixTab();
   const selected=await cdp.js("(() => {const b=document.querySelector('#"+id+"'),r=b.getBoundingClientRect(),s=getComputedStyle(b),i=[...b.querySelectorAll('.bui-icon')].find(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>8),v=i?.getBoundingClientRect();return {id:b.id,selected:b.classList.contains('toggled'),focusVisible:b.matches(':focus-visible'),ring:parseFloat(s.outlineWidth),iconClass:i?.className,iconWidth:v?.width,iconHeight:v?.height,iconInside:!!v&&v.left>=r.left-1&&v.right<=r.right+1&&v.top>=r.top-1&&v.bottom<=r.bottom+1,ariaPressed:b.getAttribute('aria-pressed'),w:r.width,h:r.height};})()");
   selectedSemantics.push({id,ariaPressed:selected.ariaPressed});
   const original=selectedGeometry[id];
   assert("selected visual state and keyboard focus coexist "+id,state.id===id&&selected.selected&&selected.focusVisible&&selected.ring>=2,JSON.stringify(selected));
   assert("selected focused icon stays measurable with no layout shift "+id,selected.iconWidth>=10&&selected.iconHeight>=10&&selected.iconInside&&original&&Math.abs(original.w-selected.w)<0.5&&Math.abs(original.h-selected.h)<0.5,JSON.stringify({selected,original}));
 }
 // One selected + hovered + keyboard-focused example. Mouse movement is
 // deliberately not a click, so it must not mutate toggle/keyboard modality.
 const selectedPrimaryPos=await cdp.js("(() => {const b=document.querySelector('#v3-selected-transparent');b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()");
 await cdp.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:selectedPrimaryPos.x,y:selectedPrimaryPos.y});
 const combinedSelected=await cdp.js("(() => {const b=document.querySelector('#v3-selected-transparent'),r=b.getBoundingClientRect(),s=getComputedStyle(b),i=[...b.querySelectorAll('.bui-icon')].find(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>8)?.getBoundingClientRect();return {hover:b.matches(':hover'),selected:b.classList.contains('toggled'),focus:b.matches(':focus-visible'),outline:parseFloat(s.outlineWidth),iconW:i?.width,w:r.width,h:r.height};})()");
 assert("selected plus hovered plus keyboard focus coexist",combinedSelected.hover&&combinedSelected.selected&&combinedSelected.focus&&combinedSelected.outline>=2&&combinedSelected.iconW>=10,JSON.stringify(combinedSelected));
 await cdp.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:0,y:0});
 if(selectedSemantics.some(x=>x.ariaPressed!=="true"))openAccessibilityGaps.push("Button Toggled=true is visually selected but does not expose aria-pressed=true; #428 migration/a11y gate");
 console.log("Selected Button focus semantics audit:",JSON.stringify(selectedSemantics));

 // Baseline behavior only: an unbound nullable Toggled parameter changes its
 // CSS-selected state on Space key activation. Do not infer accessibility from it.
 await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:" ",code:"Space",windowsVirtualKeyCode:32,nativeVirtualKeyCode:32});
 await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:" ",code:"Space",windowsVirtualKeyCode:32,nativeVirtualKeyCode:32});
 await sleep(300);
 const toggleAfterSpace=await cdp.js("(() => {const b=document.querySelector('#v3-selected-transparent');return {stillFocused:document.activeElement===b,selected:b.classList.contains('toggled'),ariaPressed:b.getAttribute('aria-pressed'),focusVisible:b.matches(':focus-visible')};})()");
 assert("keyboard Space activates existing nullable Toggled Button",toggleAfterSpace.stillFocused&&!toggleAfterSpace.selected&&toggleAfterSpace.focusVisible,JSON.stringify(toggleAfterSpace));
 console.log("Selected Button native Space toggle baseline:",JSON.stringify(toggleAfterSpace));
 // #418 genuine interactive reviewer toggle; return it to the brand baseline.
 for(const expected of ["brand","adaptive","brand"]){
   if(expected==="adaptive"||(expected==="brand"&&
       (await cdp.js("document.querySelector('.v3-lab-focus-host-review')?.dataset.v3FocusHostMode"))==="adaptive"))
     await cdp.js("document.getElementById('v3-focus-host-toggle').click()");
   await sleep(100);
   const actual=await cdp.js("(() => {const s=document.querySelector('.v3-lab-focus-host-review');return {mode:s?.dataset.v3FocusHostMode,count:s?.querySelectorAll('.v3-lab-focus-host-card .bui-button').length,status:s?.querySelector('[role=status]')?.textContent?.trim()};})()");
   assert("real Blazor host-focus reviewer choice "+expected,
     actual.mode===expected&&actual.count===5&&actual.status?.length>40,JSON.stringify(actual));
 }
 // #418: real scoped CSS Focus-visible across 10 source brands × Light/Dark.
 // This tests an actual keyboard-focused Button, not a faux :focus-visible
 // class. Re-scope only the opt-in lab; restore Blazor-owned attributes after.
 const focusScopeBefore=await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface');return {brand:h.getAttribute('data-bui-brand'),mode:h.getAttribute('data-bui-theme')};})()");
 await cdp.js("document.querySelector('#v3-focus-start').focus()");
 const keyboardFocusStart=await matrixTab();
 assert("20-way scope probe starts on real keyboard-focused Button",keyboardFocusStart.id==="v3-focus-default"&&keyboardFocusStart.visible,JSON.stringify(keyboardFocusStart));
 const appearanceFocusReport=[];
 const hostReviewMatrix=[];
 const coloredHostReport=[];
 const focusThemeSamples=[];
 const candidateFocusSamples=[];
 for(const brand of Object.keys(matrix))for(const mode of ["light","dark"]){
   const got=await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface');h.dataset.buiBrand='"+brand+"';h.dataset.buiTheme='"+mode+"';const b=document.querySelector('#v3-focus-default'),s=getComputedStyle(b),hs=getComputedStyle(h);return {brand:h.dataset.buiBrand,mode:h.dataset.buiTheme,focused:document.activeElement===b,focusVisible:b.matches(':focus-visible'),outlineStyle:s.outlineStyle,outlineWidth:parseFloat(s.outlineWidth),outlineColor:s.outlineColor,surfaceColor:hs.backgroundColor,rootBrand:document.documentElement.getAttribute('data-bui-brand')};})()");
   const ratio=contrast(got.outlineColor,got.surfaceColor);
   focusThemeSamples.push({...got,ratio});
   assert("scoped keyboard focus ring persists "+brand+"/"+mode,got.focused&&got.focusVisible&&got.outlineStyle!=="none"&&got.outlineWidth>=2&&got.outlineColor!=="rgba(0, 0, 0, 0)",JSON.stringify(got));

   // Actual keyboard-focused same-brand Dark CSS outline candidate:
   // prove that the computed outlineColor resolves the intended existing source,
   // remains visible without changing the Button, and is contrasted against
   // BOTH researched neutral host backgrounds. Not a universal UI guarantee.
   const brandRing=await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface'),b=document.querySelector('#v3-focus-default');h.setAttribute('data-bui-v3-focus-brand-candidate','');const bs=getComputedStyle(b),hs=getComputedStyle(h);const v={visible:b.matches(':focus-visible'),color:bs.outlineColor,width:parseFloat(bs.outlineWidth),normal:hs.backgroundColor,hover:hs.getPropertyValue('--colorNeutralBackground1Hover').trim(),lightRole:hs.getPropertyValue('--colorBrandBackground').trim(),darkRole:hs.getPropertyValue('--colorBrandForeground2').trim()};h.removeAttribute('data-bui-v3-focus-brand-candidate');return v;})()");
   const desiredRole=mode==="dark"?brandRing.darkRole:brandRing.lightRole;
   const computedNormal=contrast(brandRing.color,brandRing.normal);
   const computedHover=contrast(brandRing.color,hexToRgb(brandRing.hover));
   assert("real keyboard-focused branded outline CSS on normal+hover hosts "+brand+"/"+mode,
     brandRing.visible&&brandRing.width>=2&&
     brandRing.color===hexToRgb(desiredRole)&&computedNormal>=3&&computedHover>=3,
     JSON.stringify({brand,mode,...brandRing,expected:desiredRole,computedNormal,computedHover}));
   // Real native six-appearance matrix: read each actual Bluent Button
   // focused with keyboard modality under the new experimental brand ring.
   // The focus outline is OFFSET 2px outside the Button border, so contrast
   // vs its own filled Primary/Danger face is diagnostic, not a false WCAG
   // failure. The adjacent host surface is the relevant tested backdrop.
   const appearanceBrandFocus=await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface'),hs=getComputedStyle(h),names=['default','primary','danger','outline','subtle','transparent'];const sample=names.map(name=>{const b=document.querySelector('#v3-focus-'+name);b.focus();const r=b.getBoundingClientRect();const before={x:r.x,y:r.y,w:r.width,h:r.height};h.setAttribute('data-bui-v3-focus-brand-candidate','');const s=getComputedStyle(b),a=b.getBoundingClientRect();const out={name,focusVisible:b.matches(':focus-visible'),width:parseFloat(s.outlineWidth),offset:parseFloat(s.outlineOffset),color:s.outlineColor,faceColor:s.backgroundColor,outlineStyle:s.outlineStyle,stable:Math.abs(before.x-a.x)<.1&&Math.abs(before.y-a.y)<.1&&Math.abs(before.w-a.width)<.1&&Math.abs(before.h-a.height)<.1};h.removeAttribute('data-bui-v3-focus-brand-candidate');return out;});document.querySelector('#v3-focus-default').focus();return {host:hs.backgroundColor,hover:hs.getPropertyValue('--colorNeutralBackground1Hover').trim(),buttons:sample};})()");
   const appearanceData=appearanceBrandFocus.buttons.map(b=>({...b,
     backdropRatio:contrast(b.color,appearanceBrandFocus.host),
     hoverRatio:contrast(b.color,hexToRgb(appearanceBrandFocus.hover)),
     faceOpaque:b.faceColor.startsWith("rgb("),
     faceRatio:b.faceColor.startsWith("rgb(")?contrast(b.color,b.faceColor):null}));
   assert("brand-colored focus all six native appearances on normal and hover neutral hosts "+brand+"/"+mode,
     appearanceData.length===6&&appearanceData.every(x=>x.focusVisible&&x.width>=2&&x.offset===2&&
       x.outlineStyle==="solid"&&x.stable&&x.color===hexToRgb(desiredRole)&&x.backdropRatio>=3&&x.hoverRatio>=3),
     JSON.stringify({brand,mode,buttons:appearanceData}));
   appearanceFocusReport.push({brand,mode,buttons:appearanceData});
   // #418 actual five Bluent Button host cards; CSS is opt-in-only research.
   const review=await cdp.js("(() => {const section=document.querySelector('.v3-lab-focus-host-review'),previous=section.getAttribute('data-v3-focus-host-mode'),ids=['neutral','brand','brandHover','danger','inverted'],rows=[];try {for(const design of ['brand','adaptive']){section.setAttribute('data-v3-focus-host-mode',design);for(const name of ids){const card=section.querySelector('[data-v3-focus-host='+name+']'),b=card?.querySelector('.bui-button');b.focus();const bs=getComputedStyle(b),cs=getComputedStyle(card);rows.push({design,name,visible:b.matches(':focus-visible'),width:parseFloat(bs.outlineWidth),offset:parseFloat(bs.outlineOffset),ring:bs.outlineColor,host:cs.backgroundColor,ringSource:cs.getPropertyValue('--v3-lab-focus').trim(),inverse:cs.getPropertyValue('--colorNeutralForegroundOnBrand').trim(),brand:cs.getPropertyValue('--colorBrandBackground').trim(),enhanced:cs.getPropertyValue('--colorBrandForeground2').trim()});}}}finally{if(previous===null)section.removeAttribute('data-v3-focus-host-mode');else section.setAttribute('data-v3-focus-host-mode',previous);document.querySelector('#v3-focus-default').focus();}return rows;})()");
   const enhancedSource=mode==="dark"?review[0].enhanced:review[0].brand;
   const contextDetails=review.map(x=>{const ratio=contrast(x.ring,x.host),selected=x.design==="adaptive"&&(x.name==="brand"||x.name==="brandHover"||x.name==="danger"||(x.name==="inverted"&&mode==="light"))?x.inverse:enhancedSource;return {...x,ratio,expectedColor:hexToRgb(selected),passes:ratio>=3,correctSource:x.ring===hexToRgb(selected)};});
   const unconditional=contextDetails.filter(x=>x.design==="brand");
   const adaptive=contextDetails.filter(x=>x.design==="adaptive");
   const expectedBaselineFailed=mode==="light"?4:3;
   assert("five native host cards reveal expected same-brand failures "+brand+"/"+mode,
     unconditional.length===5&&unconditional.every(x=>x.visible&&x.width>=2&&x.offset===2&&x.correctSource)&&
     unconditional.filter(x=>!x.passes).length===expectedBaselineFailed,
     JSON.stringify({brand,mode,unconditional}));
   assert("explicit context-aware focus passes all five emitted host roles "+brand+"/"+mode,
     adaptive.length===5&&adaptive.every(x=>x.visible&&x.width>=2&&x.offset===2&&x.correctSource&&x.passes),
     JSON.stringify({brand,mode,adaptive}));
   hostReviewMatrix.push({brand,mode,baselineFailed:unconditional.filter(x=>!x.passes).length,adaptedPass:adaptive.filter(x=>x.passes).length});

   // #418 design-first colored-host test, from real page-07 Penpot source
   // boards. Temporarily recolor the ACTUAL surrounding Blazor host while
   // the keyboard-focused Button stays mounted. Contrast vs container, not
   // the Button face; no public Button API or shipped style is changed.
   const coloredHosts=await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface'),b=document.querySelector('#v3-focus-default');const previous=h.getAttribute('style');const roles=[['brand','--colorBrandBackground'],['brandHover','--colorBrandBackgroundHover'],['danger','--colorPaletteRedBackground3'],['inverted','--colorNeutralBackgroundInverted']];const results=[];h.setAttribute('data-bui-v3-focus-brand-candidate','');try {for(const [name,role] of roles){const host=getComputedStyle(h).getPropertyValue(role).trim();h.style.backgroundColor=host;const current={focus:b.matches(':focus-visible'),ring:getComputedStyle(b).outlineColor,host:getComputedStyle(h).backgroundColor,width:parseFloat(getComputedStyle(b).outlineWidth)};h.style.setProperty('--v3-lab-focus','var(--colorNeutralForegroundOnBrand)');const inverse={ring:getComputedStyle(b).outlineColor,host:getComputedStyle(h).backgroundColor};h.style.removeProperty('--v3-lab-focus');results.push({name,role,current,inverse});}}finally{h.removeAttribute('data-bui-v3-focus-brand-candidate');if(previous===null)h.removeAttribute('style');else h.setAttribute('style',previous);}return results;})()");
   for(const observed of coloredHosts){
     const selectedRatio=contrast(observed.current.ring,observed.current.host);
     const inverseRatio=contrast(observed.inverse.ring,observed.inverse.host);
     const expectedSelectedFail=observed.name!=="inverted"||mode==="light";
     const expectedInverseFail=observed.name==="inverted"&&mode==="dark";
     assert("real focused Button in colored host "+brand+"/"+mode+"/"+observed.name,
       observed.current.focus&&observed.current.width>=2&&
       (expectedSelectedFail?selectedRatio<3:selectedRatio>=3)&&
       (expectedInverseFail?inverseRatio<3:inverseRatio>=3),
       JSON.stringify({brand,mode,...observed,selectedRatio,inverseRatio}));
     coloredHostReport.push({brand,mode,name:observed.name,selectedRatio,inverseRatio});
   }

   // Explicitly opt in to the *existing* Fluent focus2 source token for an
   // alternate design candidate. Do not change the default focus token.
   const candidate=await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface');h.setAttribute('data-bui-v3-focus-contrast-candidate','');const b=document.querySelector('#v3-focus-default'),s=getComputedStyle(b);const got={focusVisible:b.matches(':focus-visible'),outlineColor:s.outlineColor,outlineWidth:parseFloat(s.outlineWidth),strokeSource:getComputedStyle(h).getPropertyValue('--colorStrokeFocus2').trim(),semanticAlias:getComputedStyle(h).getPropertyValue('--bui-v3-focus-ring-strong-candidate').trim(),componentAlias:getComputedStyle(h).getPropertyValue('--bui-v3-button-focus-outer-candidate').trim(),surfaceColor:getComputedStyle(h).backgroundColor};h.removeAttribute('data-bui-v3-focus-contrast-candidate');return got;})()");
   const candidateRatio=contrast(candidate.outlineColor,candidate.surfaceColor);
   candidateFocusSamples.push({brand,mode,ratio:candidateRatio,source:candidate.strokeSource});
   // Independent opt-in two-layer browser treatment, aligned with the
   // *unapproved* Light/Dark Penpot geometry board. No shipping CSS changes.
   const doubleRing=await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface'),b=document.querySelector('#v3-focus-default'),r=b.getBoundingClientRect();"+
     "h.setAttribute('data-bui-v3-focus-double-ring-candidate','');const s=getComputedStyle(b),after=b.getBoundingClientRect();"+
     "const got={focused:document.activeElement===b,visible:b.matches(':focus-visible'),color:s.outlineColor,"+
     "width:parseFloat(s.outlineWidth),offset:parseFloat(s.outlineOffset),shadow:s.boxShadow,shadowSpread:Number(s.boxShadow.match(/(-?[0-9.]+)px\\s*$/)?.[1]),"+
     "scope:getComputedStyle(h).getPropertyValue('--v3-lab-focus').trim(),bg:getComputedStyle(h).backgroundColor,"+
     "stable:Math.abs(r.width-after.width)<.1&&Math.abs(r.height-after.height)<.1&&Math.abs(r.x-after.x)<.1};"+
     "h.removeAttribute('data-bui-v3-focus-double-ring-candidate');return got;})()");
   const doubleContrast=contrast(doubleRing.color,doubleRing.bg);
   assert("Penpot-inspired opt-in two-layer focus candidate "+brand+"/"+mode,
     doubleRing.focused&&doubleRing.visible&&doubleRing.width>=2&&doubleRing.offset===1&&doubleRing.width+doubleRing.offset===3
     &&doubleRing.shadow!=="none"&&doubleRing.shadowSpread===1&&doubleRing.shadow.includes(doubleRing.bg)&&doubleContrast>=3&&doubleRing.stable,
     JSON.stringify({doubleRing,ratio:doubleContrast}));
   assert("existing Fluent focus2 contrast candidate >= 3:1 "+brand+"/"+mode,candidate.focusVisible&&candidate.outlineWidth>=2&&candidateRatio>=3&&candidate.semanticAlias===candidate.strokeSource&&candidate.componentAlias===candidate.strokeSource,JSON.stringify({candidate,ratio:candidateRatio}));
 }
 console.log("Interactive contextual focus host matrix:",JSON.stringify({groups:hostReviewMatrix.length,baselineFailures:hostReviewMatrix.reduce((sum,row)=>sum+row.baselineFailed,0),adaptedSuccess:hostReviewMatrix.reduce((sum,row)=>sum+row.adaptedPass,0),rows:hostReviewMatrix.filter(x=>x.brand==="default")}));
 console.log("Browser actual filled HOST source contrast:",JSON.stringify({total:coloredHostReport.length,
    selectedFailures:coloredHostReport.filter(x=>x.selectedRatio<3).length,
    inverseFailures:coloredHostReport.filter(x=>x.inverseRatio<3).length,
    examples:coloredHostReport.filter(x=>x.brand==="default").map(x=>({mode:x.mode,host:x.name,selected:+x.selectedRatio.toFixed(2),inverse:+x.inverseRatio.toFixed(2)}))}));
 console.log("Branded real Button appearance focus contrast:",JSON.stringify({samples:appearanceFocusReport.length,faces:appearanceFocusReport.flatMap(x=>x.buttons).filter(b=>b.faceOpaque).length,filledFaceBelow3:appearanceFocusReport.flatMap(x=>x.buttons).filter(b=>b.faceRatio!==null&&b.faceRatio<3).map(b=>({name:b.name,ratio:+b.faceRatio.toFixed(2)})).slice(0,20),hostFailures:appearanceFocusReport.flatMap(x=>x.buttons).filter(b=>b.backdropRatio<3||b.hoverRatio<3)}));
 await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface');"+(focusScopeBefore.brand===null?"h.removeAttribute('data-bui-brand');":"h.setAttribute('data-bui-brand','"+focusScopeBefore.brand+"');")+"h.setAttribute('data-bui-theme','"+focusScopeBefore.mode+"');})()");
 // #418: browser CSS zoom is a layout stress approximation, NOT actual
 // desktop page zoom or an assistive-technology certification.
 // 10 source brands x Light/Dark x LTR/RTL x CSS zoom 2/4 = 80 DOM samples.
 const zoomStress=[];
 await cdp.send("Emulation.setDeviceMetricsOverride",{width:1280,height:900,deviceScaleFactor:1,mobile:false});
 try {
   for(const brand of Object.keys(matrix))for(const mode of ["light","dark"])
     for(const direction of ["ltr","rtl"])for(const factor of [2,4]){
       const observed=await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface'),b=document.querySelector('#v3-focus-default');"+
         "h.dataset.buiBrand='"+brand+"';h.dataset.buiTheme='"+mode+"';h.dir='"+direction+"';h.style.zoom='"+factor+"';"+
         "h.removeAttribute('data-bui-v3-focus-contrast-candidate');"+
         "const measure=()=>{const r=b.getBoundingClientRect(),t=b.querySelector('.text'),tr=t?.getBoundingClientRect(),"+
         "icon=[...b.querySelectorAll('.bui-icon')].find(x=>getComputedStyle(x).display!=='none'&&x.getBoundingClientRect().width>8),"+
         "ir=icon?.getBoundingClientRect(),s=getComputedStyle(b);return {x:r.x,y:r.y,w:r.width,h:r.height,"+
         "tw:tr?.width,th:tr?.height,tx:tr?.x,ty:tr?.y,iw:ir?.width,ih:ir?.height,ix:ir?.x,iy:ir?.y,"+
         "focusVisible:b.matches(':focus-visible'),outlineWidth:parseFloat(s.outlineWidth),"+
         "outlineStyle:s.outlineStyle,outlineColor:s.outlineColor,textClipped:!!t&&(t.scrollWidth>t.clientWidth+1)};};"+
         "const before=measure();h.setAttribute('data-bui-v3-focus-contrast-candidate','');const after=measure();"+
         "return {focus:document.activeElement===b,dir:h.dir,zoom:getComputedStyle(h).zoom,mode:h.dataset.buiTheme,"+
         "brand:h.dataset.buiBrand,background:getComputedStyle(h).backgroundColor,before,after};})()");
       const {before,after}=observed;
       const stable=["x","y","w","h","tw","th","tx","ty","iw","ih","ix","iy"].every(k=>
         Number.isFinite(before[k])&&Number.isFinite(after[k])&&Math.abs(before[k]-after[k])<.6);
       const rect={left:after.x,top:after.y,right:after.x+after.w,bottom:after.y+after.h};
       const textInside=after.tx>=rect.left-.7&&after.tx+after.tw<=rect.right+.7
         &&after.ty>=rect.top-.7&&after.ty+after.th<=rect.bottom+.7;
       const iconInside=after.ix>=rect.left-.7&&after.ix+after.iw<=rect.right+.7
         &&after.iy>=rect.top-.7&&after.iy+after.ih<=rect.bottom+.7;
       const ratio=contrast(after.outlineColor,observed.background);
       const sample={brand,mode,direction,factor,zoomApplied:Number(observed.zoom)===factor,stable,textInside,iconInside,ratio,
         clipped:after.textClipped,focus:observed.focus&&after.focusVisible,
         width:after.w,height:after.h};
       zoomStress.push(sample);
       assert("candidate focus RTL/CSS zoom "+brand+"/"+mode+"/"+direction+"/"+factor,
         observed.focus&&after.focusVisible&&after.outlineStyle==="solid"&&after.outlineWidth>=2
         &&ratio>=3&&sample.zoomApplied&&stable&&textInside&&iconInside&&!after.textClipped,
         JSON.stringify({sample,details:sample.stable?null:observed}));
     }
 } finally {
   await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface');h.style.removeProperty('zoom');"+
     "h.removeAttribute('data-bui-v3-focus-contrast-candidate');h.dir='rtl';document.querySelector('#v3-focus-default')?.focus();})()");
   await cdp.send("Emulation.clearDeviceMetricsOverride");
 }
 console.log("v3 focus candidate CSS-zoom/RTL stress:",
   JSON.stringify({samples:zoomStress.length,issues:zoomStress.filter(s=>
     !s.zoomApplied||!s.stable||!s.focus||!s.textInside||!s.iconInside||s.clipped||s.ratio<3)}));
 // Actual narrow CSS viewport layout (not browser UI zoom). Every original
 // Button appearance is exercised while the Focus2 preview candidate is on.
 // 10 brands x 2 modes x 2 directions x 2 viewport widths; 6 native Buttons
 // per sample (480 individual rendered-button geometry observations).
 const doubleNarrowStress=[],narrowStress=[],appearanceNames=["default","primary","danger","outline","subtle","transparent"];
 try {
   for(const width of [320,400]){
     await cdp.send("Emulation.setDeviceMetricsOverride",
       {width,height:800,deviceScaleFactor:1,mobile:false});
     for(const brand of Object.keys(matrix))for(const mode of ["light","dark"])
       for(const direction of ["ltr","rtl"]){
         const observed=await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface');"+
           "h.dataset.buiBrand='"+brand+"';h.dataset.buiTheme='"+mode+"';h.dir='"+direction+"';"+
           "h.removeAttribute('style');h.setAttribute('data-bui-v3-focus-contrast-candidate','');"+
           "const names=['default','primary','danger','outline','subtle','transparent'];"+
           "const buttons=names.map(n=>{const b=document.querySelector('#v3-focus-'+n);"+
           "b.focus();const r=b.getBoundingClientRect(),text=b.querySelector('.text'),tr=text?.getBoundingClientRect(),"+
           "icon=[...b.querySelectorAll('.bui-icon')].find(x=>getComputedStyle(x).display!=='none'&&x.getBoundingClientRect().width>8),"+
           "ir=icon?.getBoundingClientRect(),s=getComputedStyle(b);return {name:n,visible:b.matches(':focus-visible'),"+
           "outline:parseFloat(s.outlineWidth),style:s.outlineStyle,color:s.outlineColor,"+
           "x:r.x,y:r.y,w:r.width,h:r.height,tx:tr?.x,ty:tr?.y,tw:tr?.width,th:tr?.height,"+
           "ix:ir?.x,iy:ir?.y,iw:ir?.width,ih:ir?.height,"+
           "overflow:!!text&&(text.scrollWidth>text.clientWidth+1)};});"+
           "return {viewport:document.documentElement.clientWidth,innerWidth:window.innerWidth,background:getComputedStyle(h).backgroundColor,"+
           "direction:h.dir,brand:h.dataset.buiBrand,mode:h.dataset.buiTheme,buttons};})()");
         const detail=observed.buttons.map(b=>{
           const textFit=Number.isFinite(b.tx)&&Number.isFinite(b.tw)&&b.tx>=b.x-1
             &&b.tx+b.tw<=b.x+b.w+1&&b.ty>=b.y-1&&b.ty+b.th<=b.y+b.h+1;
           const iconFit=Number.isFinite(b.ix)&&Number.isFinite(b.iw)&&b.ix>=b.x-1
             &&b.ix+b.iw<=b.x+b.w+1&&b.iy>=b.y-1&&b.iy+b.ih<=b.y+b.h+1;
           const inViewport=b.x>=-1&&b.x+b.w<=observed.viewport+1;
           const ratio=contrast(b.color,observed.background);
           return {name:b.name,textFit,iconFit,inViewport,focus:b.visible&&b.style==="solid"&&b.outline>=2,clipped:b.overflow,contrast:ratio};
         });
         const sample={brand,mode,direction,width,viewport:observed.viewport,
           passed:detail.every(b=>b.textFit&&b.iconFit&&b.inViewport&&b.focus&&!b.clipped&&b.contrast>=3),
           buttons:detail};
         narrowStress.push(sample);
         assert("focus2 actual narrow viewport "+brand+"/"+mode+"/"+direction+"/"+width,
           sample.passed&&Math.abs(observed.innerWidth-width)<=1&&observed.viewport<=width&&observed.viewport>=width-20,
           sample.passed&&Math.abs(observed.innerWidth-width)<=1&&observed.viewport<=width&&observed.viewport>=width-20?"6 native appearances OK":JSON.stringify({sample,innerWidth:observed.innerWidth}));
         // #418/#501: exact 3px outer / 1px inner Penpot-aligned focus
         // geometry across all six real Blazor appearances and BOTH
         // directions on a genuine 320/400px viewport. This second
         // attribute stays experimental and is removed before the next case.
         const doubleNarrow=await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface');"+
           "const names=['default','primary','danger','outline','subtle','transparent'];"+
           "const buttons=names.map(n=>document.querySelector('#v3-focus-'+n));"+
           "const before=buttons.map(b=>b.getBoundingClientRect());"+
           "h.removeAttribute('data-bui-v3-focus-contrast-candidate');"+
           "h.setAttribute('data-bui-v3-focus-double-ring-candidate','');"+
           "const bg=getComputedStyle(h).backgroundColor;"+
           "const observations=buttons.map((b,i)=>{b.focus();const s=getComputedStyle(b),r=b.getBoundingClientRect(),"+
           "shadow=s.boxShadow,spread=parseFloat(shadow.match(/(-?[0-9.]+)px\\s*$/)?.[1]),"+
           "w=parseFloat(s.outlineWidth),off=parseFloat(s.outlineOffset);"+
           "return {name:names[i],focus:b.matches(':focus-visible'),width:w,offset:off,"+
           "edge:w+off,spread,color:s.outlineColor,shadowBg:shadow.includes(bg),"+
           "stable:Math.abs(r.width-before[i].width)<.2&&Math.abs(r.height-before[i].height)<.2};});"+
           "h.removeAttribute('data-bui-v3-focus-double-ring-candidate');"+
           "h.setAttribute('data-bui-v3-focus-contrast-candidate','');"+
           "document.querySelector('#v3-focus-default').focus();"+
           "return {bg,observations};})()");
         const doubleItems=doubleNarrow.observations.map(o=>({...o,
           contrast:contrast(o.color,doubleNarrow.bg)}));
         const doublePass=doubleItems.every(o=>o.focus&&o.width===2&&o.offset===1
           &&o.edge===3&&o.spread===1&&o.shadowBg&&o.stable&&o.contrast>=3);
         doubleNarrowStress.push({brand,mode,direction,width,pass:doublePass});
         assert("Penpot #501 3px/1px ring on six native Buttons "+brand+"/"+mode+"/"+direction+"/"+width,
           doublePass, doublePass?"six ring geometries match":JSON.stringify(doubleItems));
       }
   }
 } finally {
   await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface');"+
     "h.removeAttribute('data-bui-v3-focus-contrast-candidate');h.dir='rtl';document.querySelector('#v3-focus-default')?.focus();})()");
   await cdp.send("Emulation.clearDeviceMetricsOverride");
 }
 console.log("v3 focus candidate actual narrow viewport stress:",
   JSON.stringify({samples:narrowStress.length,buttonObservations:narrowStress.length*appearanceNames.length,
     failed:narrowStress.filter(s=>!s.passed)}));
 console.log("Exact #501 Penpot 3px/1px ring geometry across six Buttons:",JSON.stringify({samples:doubleNarrowStress.length,buttonObservations:doubleNarrowStress.length*appearanceNames.length,failures:doubleNarrowStress.filter(s=>!s.pass)}));
 const under3=focusThemeSamples.filter(x=>x.ratio<3);
 if(under3.length)openAccessibilityGaps.push("Scoped Focus ring-to-surface contrast below 3:1 in "+under3.map(x=>x.brand+"/"+x.mode).join(",")+"; #418 candidate token approval required");
 console.log("Focus-ring scoped brand/mode contrast audit:",JSON.stringify({samples:focusThemeSamples.length,lowContrast:under3.map(x=>({brand:x.brand,mode:x.mode,ratio:+x.ratio.toFixed(2)})),minRatio:+Math.min(...focusThemeSamples.map(x=>x.ratio)).toFixed(2)}));
 console.log("Opt-in Fluent focus2 candidate contrast:",JSON.stringify({samples:candidateFocusSamples.length,minRatio:+Math.min(...candidateFocusSamples.map(x=>x.ratio)).toFixed(2),lowContrast:candidateFocusSamples.filter(x=>x.ratio<3)}));

 // Native system colors must override even the candidate source contrast.
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"forced-colors",value:"active"}]});
 const candidateForced=await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface');h.setAttribute('data-bui-v3-focus-contrast-candidate','');const b=document.querySelector('#v3-focus-default'),s=getComputedStyle(b);const got={forced:matchMedia('(forced-colors: active)').matches,focused:b.matches(':focus-visible'),varValue:getComputedStyle(h).getPropertyValue('--v3-lab-focus').trim(),color:s.outlineColor,width:parseFloat(s.outlineWidth)};h.removeAttribute('data-bui-v3-focus-contrast-candidate');return got;})()");
 assert("explicit Fluent focus candidate uses system Highlight in forced colors",candidateForced.forced&&candidateForced.focused&&candidateForced.varValue.toLowerCase()==="highlight"&&candidateForced.width>=2&&candidateForced.color!=="rgba(0, 0, 0, 0)",JSON.stringify(candidateForced));
 const dblForced=await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface');h.setAttribute('data-bui-v3-focus-double-ring-candidate','');const b=document.querySelector('#v3-focus-default'),s=getComputedStyle(b),val=getComputedStyle(h).getPropertyValue('--v3-lab-focus').trim();const got={forced:matchMedia('(forced-colors: active)').matches,visible:b.matches(':focus-visible'),token:val,outline:s.outlineColor,width:parseFloat(s.outlineWidth),offset:parseFloat(s.outlineOffset),shadow:s.boxShadow};h.removeAttribute('data-bui-v3-focus-double-ring-candidate');return got;})()");
 assert("two-layer candidate degrades safely to Highlight single outline in forced colors",
   dblForced.forced&&dblForced.visible&&dblForced.token.toLowerCase()==="highlight"
   &&dblForced.width>=2&&dblForced.offset===1&&dblForced.shadow==="none",JSON.stringify(dblForced));
 await cdp.send("Emulation.setEmulatedMedia",{features:[]});
 // #418/#501: computed outline geometry is insufficient if a following action
 // row paints OVER the bottom edge. Sample the *actual screenshot pixels* of
 // real keyboard-focused Blazor Buttons. Decode Chromium's viewport PNG in
 // the existing browser with Image/canvas (no external image packages).
 const paintSamples=[],paintOriginal=await cdp.js("(()=>{const h=document.querySelector('.v3-lab-surface');return {brand:h.getAttribute('data-bui-brand'),mode:h.getAttribute('data-bui-theme')};})()");
 await cdp.send("Emulation.setDeviceMetricsOverride",{width:1400,height:900,deviceScaleFactor:1,mobile:false});
 try {
   await cdp.js("document.querySelector('#v3-focus-start').focus()");
   const start=await matrixTab();
   assert("screenshot Focus2 starts on real keyboard-focused native Button",
     start.id==="v3-focus-default"&&start.visible,JSON.stringify(start));
   for(const mode of ["light","dark"]){
     const style=await cdp.js("(()=>{const h=document.querySelector('.v3-lab-surface');"+
       "h.dataset.buiBrand='default';h.dataset.buiTheme='"+mode+"';"+
       "h.setAttribute('data-bui-v3-focus-double-ring-candidate','');"+
       "const b=document.querySelector('#v3-focus-default');b.scrollIntoView({behavior:'instant',block:'center'});"+
       "const s=getComputedStyle(b);return {keyboard:document.activeElement===b&&b.matches(':focus-visible'),"+
       "outline:s.outlineColor,width:parseFloat(s.outlineWidth),offset:parseFloat(s.outlineOffset),"+
       "position:s.position,zIndex:s.zIndex};})()");
     await sleep(80);
     const shot=await cdp.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
     const pixels=await cdp.js("(async()=>{const im=new Image();"+
       "im.src='data:image/png;base64,"+shot.data+"';await im.decode();"+
       "const c=document.createElement('canvas');c.width=im.width;c.height=im.height;"+
       "const ctx=c.getContext('2d');ctx.drawImage(im,0,0);"+
       "const b=document.querySelector('#v3-focus-default'),r=b.getBoundingClientRect(),"+
       "x=Math.round(r.left+r.width/2),ty=Math.round(r.top-2),by=Math.round(r.bottom+2);"+
       "const pix=y=>Array.from(ctx.getImageData(x,y,1,1).data).slice(0,3);"+
       "const color=getComputedStyle(b).outlineColor,"+
       "expected=Array.from(color.matchAll(/[0-9]+/g),m=>Number(m[0])).slice(0,3);"+
       "return {x,ty,by,expected,top:pix(ty),bottom:pix(by)};})()");
     const topMatches=pixels.top.every((v,i)=>v===pixels.expected[i]),
       bottomMatches=pixels.bottom.every((v,i)=>v===pixels.expected[i]);
     const observation={mode,topMatches,bottomMatches,top:pixels.top,
       bottom:pixels.bottom,expected:pixels.expected,stacking:style.zIndex,
       keyboard:style.keyboard};
     paintSamples.push(observation);
     assert("actual painted Focus2 outer ring visible above AND below row "+mode,
       style.keyboard&&style.width===2&&style.offset===1&&style.position==="relative"&&
       Number(style.zIndex)>=1&&topMatches&&bottomMatches,JSON.stringify(observation));
   }
 } finally {
   await cdp.js("(()=>{const h=document.querySelector('.v3-lab-surface');"+
     "h.removeAttribute('data-bui-v3-focus-double-ring-candidate');"+
     (paintOriginal.brand===null?"h.removeAttribute('data-bui-brand');":
       "h.setAttribute('data-bui-brand','"+paintOriginal.brand+"');")+
     (paintOriginal.mode===null?"h.removeAttribute('data-bui-theme');":
       "h.setAttribute('data-bui-theme','"+paintOriginal.mode+"');")+
     "})()");
   await cdp.send("Emulation.clearDeviceMetricsOverride");
 }
 console.log("Focus2 actual screenshot top/bottom paint parity:",
   JSON.stringify({samples:paintSamples.length,failures:paintSamples.filter(x=>!x.topMatches||!x.bottomMatches)}));
 // User review #418: don't frame TextField with a Button-style outline.
 // Its actual Fluent/Bluent :focus-within::after underline is the visible
 // focus indicator. Verify it survives Light/Dark and emulated forced colors.
 const fieldFocusModes=[];
 for(const mode of ["light","dark"]){
   await cdp.js("(() => {const h=document.querySelector('.v3-lab-surface');h.dataset.buiTheme='"+mode+"';document.getElementById('v3-experiment-name').focus();})()");
   await new Promise(resolve=>setTimeout(resolve,350)); // let genuine underline animation settle
   const observed=await cdp.js("(() => {const input=document.getElementById('v3-experiment-name'),f=input.closest('.bui-field'),s=getComputedStyle(f),u=getComputedStyle(f,'::after'),b=document.getElementById('v3-token-action'),bs=getComputedStyle(b);return {mode:document.querySelector('.v3-lab-surface').dataset.buiTheme,focused:document.activeElement===input,within:f.matches(':focus-within'),outerOutline:s.outlineStyle,outerWidth:parseFloat(s.outlineWidth),underlineWidth:parseFloat(u.borderBottomWidth),underlineStyle:u.borderBottomStyle,underlineColor:u.borderBottomColor,underlineTransform:u.transform,buttonFocusRule:bs.getPropertyValue('--v3-lab-focus').trim()};})()");
   fieldFocusModes.push(observed);
   assert("TextField uses only native bottom focus stroke, no extra frame "+mode,
     observed.mode===mode&&observed.focused&&observed.within&&
     (observed.outerOutline==="none"||observed.outerWidth===0)&&
     observed.underlineWidth>=2&&observed.underlineStyle==="solid"&&
     !observed.underlineTransform.includes("matrix(0,")&&
     observed.underlineColor!=="rgba(0, 0, 0, 0)",JSON.stringify(observed));
 }
 await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"forced-colors",value:"active"}]});
 const forcedField=await cdp.js("(() => {const input=document.getElementById('v3-experiment-name'),f=input.closest('.bui-field'),s=getComputedStyle(f),u=getComputedStyle(f,'::after');return {forced:matchMedia('(forced-colors: active)').matches,within:f.matches(':focus-within'),outline:s.outlineStyle,width:parseFloat(s.outlineWidth),underlineColor:u.borderBottomColor,underlineStyle:u.borderBottomStyle,underlineWidth:parseFloat(u.borderBottomWidth),underlineTransform:u.transform};})()");
 assert("forced-colors TextField keeps own visible underline without an outer ring",
   forcedField.forced&&forcedField.within&&(forcedField.outline==="none"||forcedField.width===0)&&
   forcedField.underlineStyle==="solid"&&forcedField.underlineWidth>=2&&
   forcedField.underlineColor!=="rgba(0, 0, 0, 0)"&&
   !forcedField.underlineTransform.includes("matrix(0,"),JSON.stringify(forcedField));
 await cdp.send("Emulation.setEmulatedMedia",{features:[]});
 await cdp.js("(() => {document.getElementById('v3-experiment-name').blur();document.querySelector('.v3-lab-surface').dataset.buiTheme='light';})()");
 console.log("Native TextField underline-only focus (user review):",JSON.stringify({normal:fieldFocusModes,forced:forcedField}));
 if(interactiveServer){
   // Actual route-local service Dialog and a genuine cross-route navigation.
   // The dialog's pending task is separately asserted in HtmlRenderer NUnit.
   await cdp.js("document.querySelector('#v3-show-route-exit-modal')?.click()");
   const routeModal=await until(()=>cdp.js("(()=>{const d=document.querySelector('.dialog-wrapper .bui-dialog'),inside=d?.querySelector('#v3-dialog-route-leave');return d?.hasAttribute('data-bui-v3-keyboard-bound')&&inside?{role:d.getAttribute('role'),description:d.getAttribute('aria-describedby'),focus:document.activeElement===d,action:inside.id}:null;})()"),"route-local service modal appears",20000);
   assert("route-local service Dialog opens with focus and real navigation action",
     routeModal.role==="dialog"&&!!routeModal.description&&routeModal.focus&&routeModal.action==="v3-dialog-route-leave",JSON.stringify(routeModal));
   await cdp.js("document.querySelector('#v3-dialog-route-leave')?.click()");
   const destination=await until(async()=>{
     try{
       return await cdp.js("(()=>{const d=document.querySelector('[data-v3-route-after-dialog]');return d?{url:location.pathname,dialogs:document.querySelectorAll('.dialog-wrapper').length,old:!!document.querySelector('#v3-show-route-exit-modal'),action:!!d.querySelector('#v3-route-after-focus')}:null;})()");
     }catch{return null}
   },"real navigation disposes the route-local Dialog host",25000);
   assert("cross-route navigation removes old Dialog host without invoking Close",
     destination.url==="/v3/route-after-dialog"&&destination.dialogs===0&&!destination.old&&destination.action,JSON.stringify(destination));
   await cdp.js("document.querySelector('#v3-route-after-focus')?.focus()");
   const routeFocus=await cdp.js("(()=>({id:document.activeElement?.id,inside:!!document.activeElement?.closest('.bui-dialog')}))()");
   assert("destination focus stays outside the disposed Modal",
     routeFocus.id==="v3-route-after-focus"&&!routeFocus.inside,JSON.stringify(routeFocus));
 }
 const passCount=checks.filter(x=>x.pass).length;
 const browserLabel=/msedge|edge/i.test(chromePath)?"Edge":"Chrome";
 const summary={classification:interactiveServer?"actual Blazor InteractiveServer "+browserLabel+"/CDP interaction":"actual Blazor WebAssembly "+browserLabel+"/CDP interaction",passed:passCount,total:checks.length,failed:errors.length,brandModeSamples:combos.length,focusZoomSamples:zoomStress.length,focusZoomFailures:zoomStress.filter(x=>!x.zoomApplied||!x.stable||!x.focus||!x.textInside||!x.iconInside||x.clipped||x.ratio<3).length,narrowViewportSamples:narrowStress.length,narrowViewportFailures:narrowStress.filter(x=>!x.passed).length,doubleRingViewportSamples:doubleNarrowStress.length,doubleRingViewportFailures:doubleNarrowStress.filter(x=>!x.pass).length,paintedFocusSamples:paintSamples.length,paintedFocusFailures:paintSamples.filter(x=>!x.topMatches||!x.bottomMatches).length,brands:Object.keys(matrix).length,primaryTextContrastMin:Math.min(...checks.filter(x=>x.name.startsWith("primary Button text/source contrast")).map(x=>Number(x.notes.split(":")[0]))),observedUnfixedAccessibilityGaps:openAccessibilityGaps,errors,limits:"computed-style and real Blazor interaction smoke only; NOT full WCAG, AT, cross-browser, auto-render-mode, all-host or native OS certification"};
 if(process.env.BLUENT_V3_PROBE_VERBOSE==="1")summary.checks=checks;
 console.log(JSON.stringify(summary,null,2));
 if(errors.length)process.exitCode=1;
}catch(e){console.error("Probe error: "+String(e));if(interactiveServer&&app)console.error("SSR APP LOG: "+app.tail());if(cdp){try{console.error("Browser state: "+JSON.stringify(await cdp.js("({url:location.href,title:document.title,text:document.body?.innerText?.slice(0,1400),buttons:[...document.querySelectorAll(\"button\")].map(x=>({id:x.id,text:x.innerText})).slice(0,15)})")));}catch{}}console.error(JSON.stringify({checks,errors,events:cdp?.events?.slice(-12)},null,2));process.exitCode=1;}
finally{try{cdp?.close();}catch{}for(const p of children.reverse())if(p.pid&&p.exitCode===null){try{if(process.platform==="win32")execFileSync("taskkill",["/PID",String(p.pid),"/T","/F"],{stdio:"ignore",timeout:8000});else p.kill();}catch{try{p.kill();}catch{}}}try{rmSync(dir,{recursive:true,force:true});}catch{}}
