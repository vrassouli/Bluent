#!/usr/bin/env node
// #552 / Icon #429: real unchanged WASM Icons page in isolated Chrome/Edge.
// This is a browser evidence probe, NOT an upstream parity/OS-AT test.
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:net';
import {setTimeout as wait} from 'node:timers/promises';
const engine=(process.argv[2]||'chrome').toLowerCase();
const runMode=(process.argv[3]||'baseline').toLowerCase();
const candidate=process.argv[3]==='candidate';
const responsive=runMode==='responsive-320';
if(!['baseline','candidate','responsive-320'].includes(runMode))throw Error('Mode must be baseline, candidate, or responsive-320');
const runSuffix=responsive?'-RESPONSIVE-320':candidate?'-CANDIDATE':'';
if (!['chrome','edge'].includes(engine)) throw Error('Engine must be chrome or edge');
const browserExe=engine==='chrome'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const root=resolve('.');
const destination=resolve('docs/v3/quality/evidence');
const profile=await mkdtemp(join(tmpdir(),'bluent552-icon-'));
const pending=new Map(),checks=[],scenarios=[];
let id=0,host,browser,ws;
const freePort=()=>new Promise((ok,no)=>{const s=createServer();s.on('error',no);s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>ok(port));});});
const poll=async(fn,timeout=45000)=>{const end=Date.now()+timeout;while(Date.now()<end){try{const v=await fn();if(v)return v;}catch{}await wait(250);}throw Error('Timed out polling hydrated demo');};
const send=(method,params={})=>new Promise((ok,no)=>{
  const seq=++id,t=setTimeout(()=>{pending.delete(seq);no(Error(method+' timed out'));},17000);
  pending.set(seq,{ok:x=>{clearTimeout(t);ok(x)},no:e=>{clearTimeout(t);no(e)}});
  ws.send(JSON.stringify({id:seq,method,params}));
});
const js=async(expression)=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value;};
const assert=(name,pass,detail)=>{checks.push({name,pass:!!pass});console.log(engine+' '+(pass?'PASS ':'FAIL ')+name);if(!pass)throw Error(name+': '+JSON.stringify(detail));};
function extract(){
 const find=name=>{
  const h=[...document.querySelectorAll('h4')].find(x=>x.textContent.trim()===name);
  const e=h?.parentElement?.querySelector('.bui-icon');
  if(!e)return {name,missing:true};
  const style=getComputedStyle(e),before=getComputedStyle(e,'::before'),rect=e.getBoundingClientRect();
  return {name,tag:e.tagName,classes:e.className,html:e.outerHTML.slice(0,700),
   css:{fontFamily:style.fontFamily,color:style.color,background:style.backgroundColor,beforeContent:before.content,beforeFontFamily:before.fontFamily},
   geometry:{width:rect.width,height:rect.height,left:rect.left},
   svg:!!e.querySelector('svg'),svgGeometry:e.querySelector('svg')?(()=>{const s=e.querySelector('svg'),b=s.getBoundingClientRect();return {width:+b.width.toFixed(2),height:+b.height.toFixed(2),cssWidth:getComputedStyle(s).width,cssHeight:getComputedStyle(s).height,viewBox:s.getAttribute('viewBox')};})():null,src:e.getAttribute('src'),alt:e.getAttribute('alt'),
   complete:e.tagName==='IMG'?e.complete:null,naturalWidth:e.tagName==='IMG'?e.naturalWidth:null,
   ariaHidden:e.getAttribute('aria-hidden'),role:e.getAttribute('role'),label:e.getAttribute('aria-label')};
 };
 const save=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Save');
 return {theme:document.documentElement.getAttribute('data-bui-theme'),direction:document.documentElement.dir,
  forcedColors:matchMedia('(forced-colors: active)').matches,
  fontReady:document.fonts.check('20px FluentSystemIcons-Resizable'),
  icons:['Default','Filled variant','SVG','Image'].map(find),
  save:{found:!!save,text:save?.textContent.trim(),hasIcon:!!save?.querySelector('.bui-icon')},
  viewport:{width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth}};
}
function measureCandidateContract(){
 const ns='http://www.w3.org/2000/svg';
 const host=document.createElement('div');
 host.id='bluent552-icon-contract-matrix';
 host.style.cssText='position:absolute;left:-2000px;top:0;visibility:hidden;font-size:20px;';
 document.body.appendChild(host);
 const make=(name,size,viewBox=true)=>{
  const wrapper=document.createElement('span');wrapper.className='bui-icon';wrapper.dataset.contractCase=name;
  if(size!==null)wrapper.style.cssText=`width:${size}px;height:${size}px`;
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('width','24');svg.setAttribute('height','24');
  if(viewBox)svg.setAttribute('viewBox','0 0 24 24');
  const path=document.createElementNS(ns,'path');path.setAttribute('d','M2 2 H22 V22 H2 Z');path.setAttribute('fill','currentColor');
  svg.appendChild(path);wrapper.appendChild(svg);host.appendChild(wrapper);
  const wr=wrapper.getBoundingClientRect(),sr=svg.getBoundingClientRect(),pr=path.getBoundingClientRect();
  return {name,size,viewBox,selectorMatched:wrapper.matches('span.bui-icon:has(> svg)'),
   wrapper:{width:wr.width,height:wr.height},svg:{width:sr.width,height:sr.height,cssWidth:getComputedStyle(svg).width,cssHeight:getComputedStyle(svg).height},
   path:{width:+pr.width.toFixed(3),height:+pr.height.toFixed(3),left:+pr.left.toFixed(3),top:+pr.top.toFixed(3)},
   pathExceedsSvg:pr.width>sr.width+0.5||pr.height>sr.height+0.5};
 };
 try{
  const sizes=[16,20,24,28,32].map(size=>make(`viewbox-${size}`,size,true));
  const implicit=make('implicit-1em',null,true);
  const noViewBox=[make('no-viewbox-16',16,false),make('no-viewbox-32',32,false)];
  const font=document.createElement('i');font.className='bui-icon';font.style.cssText='display:inline-block;width:32px;height:32px;font-size:28px';host.appendChild(font);
  const img=document.createElement('img');img.className='bui-icon';img.alt='';img.width=32;img.height=32;img.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22%3E%3Crect width=%221%22 height=%221%22/%3E%3C/svg%3E';host.appendChild(img);
  const nested=document.createElement('span');nested.className='bui-icon';const inner=document.createElement('span');const nestedSvg=document.createElementNS(ns,'svg');nestedSvg.setAttribute('viewBox','0 0 24 24');nestedSvg.appendChild(document.createElementNS(ns,'path'));inner.appendChild(nestedSvg);nested.appendChild(inner);host.appendChild(nested);
  return {supportsHas:CSS.supports('selector(span.bui-icon:has(> svg))'),
   directSvg:makeSelector(host.querySelector('[data-contract-case="viewbox-16"]')),
   explicitSizes:sizes,implicit,
   noViewBox:noViewBox,
   nonSvgTargets:{fontMatches:font.matches('span.bui-icon:has(> svg)'),fontWidth:getComputedStyle(font).width,imageMatches:img.matches('span.bui-icon:has(> svg)'),imageWidth:getComputedStyle(img).width},
   nestedSvg:{selectorMatched:nested.matches('span.bui-icon:has(> svg)'),svgDirectChild:nestedSvg.parentElement===nested}};
 }finally{host.remove();}
 function makeSelector(el){return el.matches('span.bui-icon:has(> svg)')&&!!el.querySelector(':scope > svg');}
}
async function axFor(name){
 const expr="([...document.querySelectorAll('h4')].find(x=>x.textContent.trim()==="+JSON.stringify(name)+")?.parentElement?.querySelector('.bui-icon'))";
 const r=await send('Runtime.evaluate',{expression:expr,returnByValue:false});
 if(!r.result?.objectId)return [];
 const a=await send('Accessibility.getPartialAXTree',{objectId:r.result.objectId,fetchRelatives:false});
 return (a.nodes||[]).map(x=>({role:x.role?.value??null,name:x.name?.value??null,ignored:x.ignored}));
}
async function killOwned(c){
 if(!c?.pid)return;
 await new Promise(ok=>{const p=spawn('taskkill',['/PID',String(c.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});p.once('close',ok);p.once('error',ok);});
}
try{
 await mkdir(destination,{recursive:true});
 const port=await freePort(),site='http://127.0.0.1:'+port+'/components/icons';
 host=spawn('dotnet',['run','--project',join(root,'src/Bluent.UI.Demo/Bluent.UI.Demo.csproj'),'-c','Debug','--no-build','--no-launch-profile','--urls','http://127.0.0.1:'+port],{cwd:root,stdio:'ignore',windowsHide:true});
 await poll(async()=>{const r=await fetch(site);return r.status===200;},60000);
 browser=spawn(browserExe,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--disable-extensions','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
 const debugPort=await poll(async()=>Number((await readFile(join(profile,'DevToolsActivePort'),'utf8')).trim().split(/\r?\n/)[0]),35000);
 const tabs=await(await fetch('http://127.0.0.1:'+debugPort+'/json/list')).json();
 const tab=tabs.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
 if(!tab)throw Error('No temporary browser page');
 ws=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((ok,no)=>{ws.addEventListener('open',ok,{once:true});ws.addEventListener('error',no,{once:true});});
 ws.addEventListener('message',event=>{const r=JSON.parse(event.data),q=pending.get(r.id);if(q){pending.delete(r.id);r.error?q.no(Error(JSON.stringify(r.error))):q.ok(r.result||{});}});
 await send('Page.enable');await send('Runtime.enable');await send('DOM.enable');await send('Accessibility.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1240,height:960,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:site});
 await poll(()=>js("(()=>[...document.querySelectorAll('h4')].some(x=>x.textContent.trim()==='Filled variant') && !!document.querySelector('img.bui-icon'))()"));
 await poll(()=>js("document.querySelector('img.bui-icon')?.complete && document.fonts.status==='loaded'"),20000);
 if(candidate){
  // RESEARCH ONLY: inject a separate stylesheet into the disposable browser, not the component.
  const css=await readFile(join(root,'scripts/quality/fixtures/v3-icon-svg-size-candidate.css'),'utf8');
  const inserted=await js("(()=>{const s=document.createElement('style');s.id='bluent552-icon-size-experiment';s.textContent="+JSON.stringify(css)+";document.head.appendChild(s);return s.isConnected})()");
  assert('separate CSS candidate injected into test page only',inserted,inserted);
 }
 let contractMatrix=null;
 if(candidate){
  contractMatrix=await js('('+measureCandidateContract.toString()+')()');
  assert('candidate :has direct-child selector is supported and matches actual SVG children',contractMatrix.supportsHas && contractMatrix.directSvg,contractMatrix);
  for(const sample of contractMatrix.explicitSizes){
   assert(sample.name+' wrapper and SVG both honor requested explicit size',sample.selectorMatched && sample.wrapper.width===sample.size && sample.wrapper.height===sample.size && sample.svg.width===sample.size && sample.svg.height===sample.size,sample);
  }
  assert('unsized wrapper resolves to inherited 1em dimensions',contractMatrix.implicit.selectorMatched && contractMatrix.implicit.wrapper.width===20 && contractMatrix.implicit.wrapper.height===20 && contractMatrix.implicit.svg.width===20 && contractMatrix.implicit.svg.height===20,contractMatrix.implicit);
  assert('missing viewBox remains size-constrained but preserves raw SVG user-unit geometry',contractMatrix.noViewBox.length===2 && contractMatrix.noViewBox[0].wrapper.width===16 && contractMatrix.noViewBox[0].svg.width===16 && contractMatrix.noViewBox[0].pathExceedsSvg && contractMatrix.noViewBox[1].wrapper.width===32 && contractMatrix.noViewBox[1].svg.width===32 && !contractMatrix.noViewBox[1].pathExceedsSvg,contractMatrix.noViewBox);
  assert('font and image icon targets are excluded from candidate selector and keep explicit width',!contractMatrix.nonSvgTargets.fontMatches && !contractMatrix.nonSvgTargets.imageMatches && contractMatrix.nonSvgTargets.fontWidth==='32px' && contractMatrix.nonSvgTargets.imageWidth==='32px',contractMatrix.nonSvgTargets);
  assert('nested descendant SVG does not activate direct-child candidate selector',!contractMatrix.nestedSvg.selectorMatched && !contractMatrix.nestedSvg.svgDirectChild,contractMatrix.nestedSvg);
 }
 const modeScenarios=responsive?[
  {name:'mobile-320-light-ltr',theme:'light',dir:'ltr',forced:false,viewport:320},
  {name:'mobile-320-dark-rtl',theme:'dark',dir:'rtl',forced:false,viewport:320}
 ]:[
  {name:'light-ltr',theme:'light',dir:'ltr',forced:false},
  {name:'dark-rtl',theme:'dark',dir:'rtl',forced:false},
  {name:'forced-colors',theme:'light',dir:'ltr',forced:true},
  ...(candidate?[{name:'mobile-320',theme:'light',dir:'ltr',forced:false,viewport:320},{name:'mobile-320-dark-rtl',theme:'dark',dir:'rtl',forced:false,viewport:320}]:[])
 ];
 for(const mode of modeScenarios){
  await send('Emulation.setDeviceMetricsOverride',{width:mode.viewport||1240,height:mode.viewport?740:960,deviceScaleFactor:1,mobile:false});
  await send('Emulation.setEmulatedMedia',{features:mode.forced?[{name:'forced-colors',value:'active'},{name:'prefers-contrast',value:'more'}]:[]});
  await js("(()=>{document.documentElement.setAttribute('data-bui-theme',"+JSON.stringify(mode.theme)+");document.documentElement.setAttribute('dir',"+JSON.stringify(mode.dir)+");})()");
  await js("document.fonts.ready.then(()=>true)");
  const observed=await js('('+extract.toString()+')()'),icons=Object.fromEntries(observed.icons.map(x=>[x.name,x]));
  assert(mode.name+' theme/direction/media',observed.theme===mode.theme&&observed.direction===mode.dir&&observed.forcedColors===mode.forced,observed);
  assert(mode.name+' source CSS glyph variants',icons['Default'].tag==='I'&&icons['Filled variant'].tag==='I'&&
   icons['Default'].classes.includes('_20_regular')&&icons['Filled variant'].classes.includes('_20_filled')&&
   icons['Default'].css.beforeContent!=='none'&&icons['Filled variant'].css.beforeContent!=='none'&&observed.fontReady,observed);
  assert(mode.name+' custom SVG component',icons.SVG.tag==='SPAN'&&icons.SVG.svg,icons.SVG);
  if(candidate){
   assert(mode.name+' actual 32px SVG and wrapper after isolated paint proposal',
     icons.SVG.svgGeometry.width===32 && icons.SVG.svgGeometry.height===32 &&
     icons.SVG.geometry.width===32 && icons.SVG.geometry.height===32,icons.SVG);
   assert(mode.name+' bundled font icons and image retain original rendered geometry',
     icons.Default.geometry.width===28 && icons['Filled variant'].geometry.width===28 &&
     icons.Image.geometry.width===32 && icons.Image.geometry.height===32,icons);
  }
  assert(mode.name+' custom Image loads',icons.Image.tag==='IMG'&&icons.Image.complete&&icons.Image.naturalWidth>0,icons.Image);
  assert(mode.name+' Button icon + textual name',observed.save.found&&observed.save.hasIcon&&observed.save.text==='Save',observed.save);
  const accessibility={};
  for(const name of ['Default','Filled variant','SVG','Image']) accessibility[name]=await axFor(name);
  await js("document.querySelector('h1')?.scrollIntoView({block:'start'})");
  const screenshot=(await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true})).data;
  const filename='BLUENT-ICON-'+engine.toUpperCase()+runSuffix+'-'+mode.name.toUpperCase()+'.png';
  await writeFile(join(destination,filename),Buffer.from(screenshot,'base64'));
  scenarios.push({...observed,scenario:mode.name,
   responsiveObservation:responsive?{horizontalOverflow:observed.viewport.documentWidth>observed.viewport.width,
    overflowPixels:Math.max(0,observed.viewport.documentWidth-observed.viewport.width)}:null,
   ax:accessibility,screenshot:filename});
 }
 let accessibilityExperiment=null;
 if(candidate){
  // Hypothesis-only ARIA choices, neither silently changes Bluent's contract.
  await js("document.querySelector('img.bui-icon').setAttribute('alt','')");
  const decorative=await axFor('Image');
  await js("document.querySelector('img.bui-icon').setAttribute('alt','PowerPoint file type')");
  const informative=await axFor('Image');
  await js("document.querySelector('img.bui-icon').removeAttribute('alt')");
  accessibilityExperiment={decorative,informative};
  assert('decorative empty alt removes meaningful image from Chrome AX',decorative.some(x=>x.ignored===true),decorative);
  assert('informative alt gives named image in Chrome AX',informative.some(x=>x.role==='image'&&x.name==='PowerPoint file type'&&!x.ignored),informative);
 }
 const data={auditIssue:552,ownerIssue:429,sourceRef:'1b023a5c',engine,candidate,runMode,responsive,contractMatrix,
  candidateStylesheet:candidate?'scripts/quality/fixtures/v3-icon-svg-size-candidate.css':null,
  accessibilityExperiment,host:'original Blazor WebAssembly Demo /components/icons, Debug real build',
  status:'browser source observation only NOT Fluent parity NOT native OS or screen-reader signoff',checks,scenarios};
 await writeFile(join(destination,'BLUENT-ICON-'+engine.toUpperCase()+runSuffix+'-BROWSER.json'),JSON.stringify(data,null,2)+'\n');
 console.log('SUMMARY '+JSON.stringify({engine,candidate,passed:checks.filter(x=>x.pass).length,total:checks.length,scenarios:scenarios.length}));
}catch(error){console.error('ERROR '+engine+' '+(error?.stack||error));process.exitCode=1;}
finally{
 try{ws?.close()}catch{}
 await killOwned(browser);await killOwned(host);
 // Match only the unique temporary profile; never terminate unrelated browser processes.
 if(process.platform==='win32'){
  const escaped=profile.replace(/'/g,"''");
  const command="$p='"+escaped+"'; Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' OR Name='msedge.exe'\" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($p) } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }";
  try{const cleanup=spawn('pwsh',['-NoProfile','-NonInteractive','-Command',command],{windowsHide:true,stdio:'ignore'});
   await Promise.race([new Promise(ok=>{cleanup.once('close',ok);cleanup.once('error',ok)}),wait(7000)]);}catch{}
 }
 await wait(700);
 try{await rm(profile,{recursive:true,force:true,maxRetries:12,retryDelay:250});}catch(e){console.error('Owned browser profile cleanup failed '+e.message);process.exitCode=1;}
}
