#!/usr/bin/env node
// #552: actual published Fluent Web Components 3.1.3 package browser baseline.
// Build an isolated temp fixture first: npm install exact pinned WC/tokens/esbuild;
// esbuild entry-source.js --bundle --format=esm --outfile=entry.js.
// Never claim this reference's appearance/keyboard checks as Bluent parity.
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {createServer} from 'node:net';
import {setTimeout as wait} from 'node:timers/promises';

const root=resolve(process.argv[2]||'');
const output=resolve(process.argv[3]||'docs/v3/quality/evidence/FLUENT-WC-3.1.3-LIGHT-CHROME.png');
const scenario=process.argv[4]||'baseline';
if(!['baseline','light-ltr','dark-rtl','dark-ltr','forced-colors','zoom-200','ax-keyboard'].includes(scenario))throw Error('Unsupported reference scenario '+scenario);
const browserExe=process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile=await mkdtemp(join(tmpdir(),'bluent552-pinned-wc-chrome-'));
const audit=[],pending=new Map(),signals=[];let server,browser,socket,serial=0;
const assert=(name,ok,details)=>{audit.push({name,ok:!!ok,details});console.log('REF '+(ok?'PASS':'FAIL')+' '+name);if(!ok)throw Error(name+' '+JSON.stringify(details||''));};
const poll=async(fn,ms=35000)=>{const end=Date.now()+ms;while(Date.now()<end){try{const x=await fn();if(x)return x;}catch{}await wait(250);}throw Error('Timed out: '+fn.toString().slice(0,80));};
const allocate=()=>new Promise((res,rej)=>{const s=createServer();s.once('error',rej);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p));});});
const send=(method,params={})=>new Promise((res,rej)=>{const id=++serial;const timeout=setTimeout(()=>{pending.delete(id);rej(Error(method+' timed out'));},18000);pending.set(id,{res:v=>{clearTimeout(timeout);res(v);},rej:v=>{clearTimeout(timeout);rej(v)}});socket.send(JSON.stringify({id,method,params}));});
const js=async expression=>{const x=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(x.exceptionDetails)throw Error('Reference JS exception: '+(x.exceptionDetails.exception?.description||x.exceptionDetails.text));return x.result?.value;};
try{
 const port=await allocate();
 server=spawn('python',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',root],{stdio:'ignore',windowsHide:true});
 await poll(async()=>{const r=await fetch('http://127.0.0.1:'+port+'/index.html');return r.status===200;},12000);
 browser=spawn(browserExe,['--headless=new','--no-first-run','--no-default-browser-check','--no-sandbox','--disable-gpu','--disable-extensions',
  '--remote-allow-origins=*','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
 const browserPort=await poll(async()=>{const p=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).trim().split(/\r?\n/)[0];return +p||null;},35000);
 const tabs=await(await fetch('http://127.0.0.1:'+browserPort+'/json/list')).json();
 const tab=tabs.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
 if(!tab)throw Error('No isolated Chromium CDP tab');
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((res,rej)=>{socket.addEventListener('open',res,{once:true});socket.addEventListener('error',rej,{once:true});});
 socket.addEventListener('message',event=>{const m=JSON.parse(event.data),p=pending.get(m.id);if(m.method==='Runtime.exceptionThrown')signals.push('EXCEPTION '+(m.params?.exceptionDetails?.text||''));if(m.method==='Runtime.consoleAPICalled'&&m.params?.type==='error')signals.push('CONSOLE '+m.params?.args?.map(x=>x.value||x.description||'').join(' '));if(!p)return;pending.delete(m.id);m.error?p.rej(Error(JSON.stringify(m.error))):p.res(m.result||{});});
 await send('Page.enable');await send('Runtime.enable');
 const reflowProxy=scenario==='zoom-200';
 const size=reflowProxy?{width:620,height:570,deviceScaleFactor:2,mobile:false}:{width:1240,height:1140,deviceScaleFactor:1,mobile:false};
 await send('Emulation.setDeviceMetricsOverride',size);
 if(scenario==='forced-colors')await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'},{name:'prefers-contrast',value:'more'}]});
 await send('Page.navigate',{url:'http://127.0.0.1:'+port+'/index.html?scenario='+encodeURIComponent(scenario)});
 let loaded;
 try {loaded=await poll(()=>js("['fluent-button','fluent-toggle-button','fluent-compound-button','fluent-menu-button','fluent-slider'].every(t=>!!customElements.get(t))"),5000);}
 catch(e){console.error('REFERENCE DEBUG',JSON.stringify(await js("(()=>({url:location.href,readyState:document.readyState,title:document.title,defined:document.documentElement.dataset.officialDefined,tags:['fluent-button','fluent-toggle-button','fluent-compound-button','fluent-menu-button','fluent-slider'].map(x=>[x,!!customElements.get(x)]),body:document.body?.innerText?.slice(0,150)}))()"),null,2));console.error('REFERENCE SIGNALS',signals.slice(0,10));throw e;}
 assert('Official WC 3.1.3 tag definitions loaded',loaded);
 const pageBounds=await js("(()=>{const e=document.querySelector('main'),r=e.getBoundingClientRect();return {innerWidth,docWidth:document.documentElement.scrollWidth,scrollX,mainLeft:r.left,mainRight:r.right,mainWidth:r.width,dir:document.documentElement.dir,clientWidth:document.documentElement.clientWidth}})()");
 console.log('REF PAGE BOUNDS '+JSON.stringify(pageBounds));
 if(scenario!=='zoom-200')assert('Official reference viewport layout is within visible bounds',pageBounds.mainLeft>=0&&pageBounds.mainRight<=pageBounds.innerWidth&&pageBounds.docWidth<=pageBounds.innerWidth,pageBounds);
 if(scenario!=='baseline'){
   await js("(()=>{document.querySelector('#btn-primary').textContent='Continue';})()");
   const mode=await js("({theme:document.documentElement.dataset.officialTheme,dir:document.documentElement.dir,normalized:document.documentElement.dataset.normalizedFixture})");
   assert('Reference scenario uses real theme and direction',mode.theme===(scenario.startsWith('dark')?'webDarkTheme':'webLightTheme')&&mode.dir===(scenario.endsWith('rtl')?'rtl':'ltr')&&mode.normalized==='true',mode);
 }
 const accessibilityMode=await js("(()=>({forcedColors:matchMedia('(forced-colors: active)').matches,contrastMore:matchMedia('(prefers-contrast: more)').matches,viewportWidth:innerWidth,viewportHeight:innerHeight,dpr:devicePixelRatio,documentScrollWidth:document.documentElement.scrollWidth,visualViewportScale:visualViewport?.scale||null}))()");
 if(scenario==='forced-colors')assert('Real Chromium forced-colors emulation matched',accessibilityMode.forcedColors===true&&accessibilityMode.contrastMore===true,accessibilityMode);
 if(scenario==='zoom-200')assert('200 percent layout reflow proxy (not native browser zoom)',accessibilityMode.viewportWidth===620&&accessibilityMode.dpr===2,accessibilityMode);
 const measurement=await js(`(()=>{
 const ids=['btn-neutral','btn-primary','btn-outline','btn-subtle','btn-transparent','btn-disabled','btn-toggle','btn-toggle-on','btn-compound','btn-menu','ref-slider','ref-slider-step'];
 return ids.map(id=>{const e=document.getElementById(id),r=e.getBoundingClientRect(),s=getComputedStyle(e);
 const internal=e.shadowRoot?.querySelector('button,input,[role=slider]');
 const ir=internal?.getBoundingClientRect(),is=internal?getComputedStyle(internal):null;
 return {id,tag:e.localName,renderedWidth:+r.width.toFixed(2),renderedHeight:+r.height.toFixed(2),
 hostBorderRadius:s.borderRadius,hostColor:s.color,hostBackground:s.backgroundColor,
 internalTag:internal?.tagName||null,internalRole:internal?.getAttribute('role')||null,
 internalWidth:ir?+ir.width.toFixed(2):null,internalHeight:ir?+ir.height.toFixed(2):null,
 internalBorderRadius:is?.borderRadius||null,internalBackground:is?.backgroundColor||null,
 pressed:e.hasAttribute('pressed')?true:false,
 ariaLabel:e.getAttribute('aria-label'),value:e.value||null,shadowRoot:!!e.shadowRoot};
 });
 })()`);
 assert('Twelve official tagged samples visible at measured size',measurement.length===12&&measurement.every(x=>x.renderedWidth>0&&x.renderedHeight>0),measurement);
 assert('Fluent primary has real shadow rendered component',measurement.find(x=>x.id==='btn-primary')?.shadowRoot===true);
 const toggled=await js("(()=>{const x=document.getElementById('btn-toggle');x.click();return x.hasAttribute('pressed')||x.pressed===true})()");
 assert('Official ToggleButton responds to click with pressed state',toggled);
 if(scenario==='ax-keyboard'){
   await js("document.getElementById('btn-primary').focus()");
   await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
   await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
   const next=await js("({id:document.activeElement?.id||'',tag:document.activeElement?.tagName||''})");
   assert('Official Button Tab moves focus to a subsequent focusable control',next.id!==''&&next.id!=='btn-primary',next);
 }
 const before=await js("document.getElementById('ref-slider-step').value");
 await js("document.getElementById('ref-slider-step').focus()");
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39,nativeVirtualKeyCode:39});
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39,nativeVirtualKeyCode:39});
 let accessibilityTree=null;
 if(scenario==='ax-keyboard'){
   const full=await send('Accessibility.getFullAXTree');
   accessibilityTree=(full.nodes||[]).filter(n=>['slider','button'].includes(n.role?.value)).map(n=>({
     role:n.role?.value,name:n.name?.value||'',value:n.value?.value??null,
     focused:n.properties?.find(p=>p.name==='focused')?.value?.value??false
   }));
   const sliders=accessibilityTree.filter(n=>n.role==='slider');
   console.log('REF ACCESSIBILITY '+JSON.stringify(sliders));
   assert('Official WC exposes 2 native accessibility slider roles',sliders.length===2,sliders);
   assert('Official WC slider labels include Volume and Brightness',sliders.some(x=>x.name.includes('Volume'))&&sliders.some(x=>x.name.includes('Brightness')),sliders);
 }
 const after=await js("document.getElementById('ref-slider-step').value");
 assert('Official step slider responds to ArrowRight in actual Chromium',String(before)!==String(after),{before,after});
 // Capture the actual keyboard focus state separately from the rest-state baseline.
 const focusedImage=output.slice(0,-4)+'-KEYBOARD-FOCUS.png';
 const focusCapture=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
 await mkdir(resolve(output,'..'),{recursive:true});
 await writeFile(focusedImage,Buffer.from(focusCapture.data,'base64'));
 // Return fixture state to initial selection before screenshot.
 await js("(()=>{document.getElementById('btn-toggle').pressed=false;document.getElementById('ref-slider-step').value='40';document.activeElement?.blur();})()");
 await wait(500);
 const capture=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
 await mkdir(resolve(output,'..'),{recursive:true});
 await writeFile(output,Buffer.from(capture.data,'base64'));
 const evidence={auditIssue:552,officialPackage:'@fluentui/web-components',packageVersion:'3.1.3',
 browserName:/msedge/i.test(browserExe)?'Edge':'Chrome',scenario,pageBounds,accessibilityMode,accessibilityTree,fixture:'scripts/quality/fixtures/fluent-wc-3.1.3-reference.html',
 outputImage:output.split(/[\\/]/).slice(-1)[0],focusedImage:focusedImage.split(/[\\/]/).slice(-1)[0],viewport:size,
 inspectedAt:new Date().toISOString(),status:'official_baseline_only_no_bluent_parity',
 note:scenario==='zoom-200'?'Viewport 620 CSSpx and DPR2 is a 200% layout/reflow proxy; NOT native desktop browser zoom. Independent layout, NOT parity or OS/AT acceptance.':scenario==='forced-colors'?'Actual Chromium forced-colors CSS-media emulation; NOT real OS high-contrast settings or screen-reader acceptance.':'Real official WC specimen, independent layout. No native OS AT.',
 assertions:audit,geometry:measurement};
 console.log('REF SUMMARY '+JSON.stringify({checks:audit.length,png:output,buttons:measurement.filter(x=>x.tag.includes('button')).length}));
 const jsonOut=output.replace(/\.png$/i,'.json');await writeFile(jsonOut,JSON.stringify(evidence,null,2)+'\n');
}catch(e){console.error('REFERENCE FAIL:',e?.stack||String(e));process.exitCode=1;}
finally{
 try{socket?.close();}catch{}
 if(server&&!server.killed)server.kill();
 if(browser&&!browser.killed){
  try{const killer=spawn('taskkill',['/PID',String(browser.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});await new Promise(res=>killer.once('close',res));}catch{}
  browser.kill();
 }
 // Secondary cleanup: Chromium renderer/GPU processes can outlive the root PID.
 // Only touch Chrome/Edge child processes whose command line contains THIS GUID profile.
 if(process.platform==='win32'){
  const ownedProfilePath=profile.replace(/'/g,"''");
  const sweeperCommand="$p='"+ownedProfilePath+"'; Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' OR Name='msedge.exe'\" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($p) } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }";
  try {
   const sweeper=spawn('pwsh',['-NoLogo','-NoProfile','-NonInteractive','-Command',sweeperCommand],{stdio:'ignore',windowsHide:true});
   await Promise.race([new Promise(ok=>{sweeper.once('close',ok);sweeper.once('error',ok)}),wait(6500)]);
  } catch {}
 }
 await wait(1000);
 try{await rm(profile,{recursive:true,force:true,maxRetries:8,retryDelay:200})}catch(e){console.error('Reference-owned profile cleanup incomplete',e.message);process.exitCode=1;}
}