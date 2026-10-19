#!/usr/bin/env node
// #552 actual Bluent #421 Lab screenshot/measured-geometry comparison companion.
// Usage: node scripts/quality/probe_v3_bluent_lab_reference.mjs C:/Projects/Bluent-issue421
// Captures real source under a disposable host and isolated Chromium, not final parity.
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {createServer} from 'node:net';
import {setTimeout as wait} from 'node:timers/promises';
const sourceRoot=resolve(process.argv[2]||'C:/Projects/Bluent-issue421');
const evidenceRoot=resolve(process.argv[3]||'docs/v3/quality/evidence');
const scenario=process.argv[4]||'baseline';
if(!['baseline','light-ltr','dark-rtl','dark-ltr','forced-colors','zoom-200','ax-keyboard'].includes(scenario))throw Error('Unsupported Bluent scenario '+scenario);
const chrome=process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile=await mkdtemp(join(tmpdir(),'bluent552-lab-comparison-'));
const pending=new Map(),measurements=[],checks=[];let serial=0,host,browser,socket;
const poll=async(fn,ms=70000)=>{const end=Date.now()+ms;while(Date.now()<end){try{const v=await fn();if(v)return v;}catch{}await wait(250);}throw Error('Timed out waiting for live Blazor Lab');};
const port=()=>new Promise((ok,no)=>{const s=createServer();s.on('error',no);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>ok(p));});});
const send=(method,params={})=>new Promise((ok,no)=>{const id=++serial,t=setTimeout(()=>{pending.delete(id);no(Error(method+' timed out'));},18000);pending.set(id,{ok:x=>{clearTimeout(t);ok(x)},no:e=>{clearTimeout(t);no(e)}});socket.send(JSON.stringify({id,method,params}));});
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value;};
const add=(label,ok,details)=>{checks.push({label,pass:!!ok,details});console.log('BLUENT '+(ok?'PASS':'FAIL')+' '+label);if(!ok)throw Error(label+': '+JSON.stringify(details));};
try{
 const p=await port(),url='http://127.0.0.1:'+p;
 const project=join(sourceRoot,'src/Bluent.UI.Demo/Bluent.UI.Demo.csproj');
 host=spawn('dotnet',['run','--project',project,'-c','Debug','--no-build','--no-launch-profile','--urls',url],{cwd:sourceRoot,stdio:'ignore',windowsHide:true});
 await poll(async()=>{const r=await fetch(url+'/component-lab');return r.status===200;},70000);
 browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--disable-extensions','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
 const bp=await poll(async()=>+(await readFile(join(profile,'DevToolsActivePort'),'utf8')).trim().split(/\r?\n/)[0],35000);
 const tabs=await(await fetch('http://127.0.0.1:'+bp+'/json/list')).json(),tab=tabs.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
 if(!tab)throw Error('No disposable CDP Chrome page');
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((ok,no)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',no,{once:true});});
 socket.addEventListener('message',e=>{const x=JSON.parse(e.data),q=pending.get(x.id);if(q){pending.delete(x.id);x.error?q.no(Error(JSON.stringify(x.error))):q.ok(x.result||{})}});
 await send('Page.enable');await send('Runtime.enable');
 const reflowProxy=scenario==='zoom-200';
 const size=reflowProxy?{width:620,height:570,deviceScaleFactor:2,mobile:false}:{width:1240,height:1140,deviceScaleFactor:1,mobile:false};
 await send('Emulation.setDeviceMetricsOverride',size);
 if(scenario==='forced-colors'||scenario==='ax-keyboard')await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'},{name:'prefers-contrast',value:'more'}]});
 await send('Page.navigate',{url:url+'/component-lab'});
 await poll(()=>js("document.querySelector('main.component-lab')?.getAttribute('data-lab-interactive')==='true'"),45000);
 add('Live source Lab hydrated',true);
 const accessibilityMode=await js("(()=>({forcedColors:matchMedia('(forced-colors: active)').matches,contrastMore:matchMedia('(prefers-contrast: more)').matches,viewportWidth:innerWidth,viewportHeight:innerHeight,dpr:devicePixelRatio,documentScrollWidth:document.documentElement.scrollWidth,visualViewportScale:visualViewport?.scale||null}))()");
 if(scenario==='forced-colors'||scenario==='ax-keyboard')add('Real Chromium forced-colors emulation matched',accessibilityMode.forcedColors===true&&accessibilityMode.contrastMore===true,accessibilityMode);
 if(scenario==='zoom-200')add('200 percent layout reflow proxy (not native browser zoom)',accessibilityMode.viewportWidth===620&&accessibilityMode.dpr===2,accessibilityMode);
 if(scenario!=='baseline'){
   const mode=await js(`(()=>{
     const root=document.documentElement;
     root.setAttribute('data-bui-theme','${scenario.startsWith('dark')?'dark':'light'}');
     root.setAttribute('dir','${scenario.endsWith('rtl')?'rtl':'ltr'}');
     return {theme:root.getAttribute('data-bui-theme'),dir:root.getAttribute('dir')};
   })()`);
   add('Real Bluent theme/direction attributes set',mode.theme===(scenario.startsWith('dark')?'dark':'light')&&mode.dir===(scenario.endsWith('rtl')?'rtl':'ltr'),mode);
 }
 await mkdir(evidenceRoot,{recursive:true});
 for(const [family,issue,selector] of [
  ['Button',428,'.lab-canvas .bui-button'],
  ['Slider',442,'#lab-slider-int'],
  ['RangeSlider',443,'#lab-range-int'],
  ['FileSelect',444,'#lab-file-multi']
 ]){
  await js(`(()=>{const el=document.getElementById('lab-queue-search');if(!el)throw Error('Missing Lab queue search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'${issue}');el.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await poll(()=>js("document.querySelectorAll('.lab-queue-row').length===1&&!!document.querySelector('.lab-queue-row button')"),15000);
  await js("document.querySelector('.lab-queue-row button').click()");
  await poll(()=>js("!!document.querySelector("+JSON.stringify(selector)+")"),16000);
  const detail=await js(`(()=>{
   const e=document.querySelector(${JSON.stringify(selector)}),canvas=e.closest('.lab-canvas');
   if('${scenario}'!=='baseline'){
     if('${scenario}'!=='zoom-200'&&('${family}'==='Slider'||'${family}'==='RangeSlider'))e.style.width='260px';
     if('${family}'==='Button')e.style.width='96px';
   }
   const r=e.getBoundingClientRect(),style=getComputedStyle(e);
   canvas?.scrollIntoView({block:'start'});
   const c=canvas?.getBoundingClientRect(),parent=e.parentElement?.getBoundingClientRect(),thumbs=[...e.querySelectorAll('.thumb')],rail=e.querySelector('.rail'),railStyle=rail?getComputedStyle(rail):null;
   return {family:'${family}',issue:${issue},elementTag:e.tagName,cls:e.className,role:e.getAttribute('role'),ariaValueNow:e.getAttribute('aria-valuenow'),
     tabIndex:e.getAttribute('tabindex'),width:+r.width.toFixed(2),height:+r.height.toFixed(2),left:+r.left.toFixed(2),right:+r.right.toFixed(2),parentRight:parent?+parent.right.toFixed(2):null,parentWidth:parent?+parent.width.toFixed(2):null,background:style.backgroundColor,borderRadius:style.borderRadius,
     rail:railStyle?{backgroundImage:railStyle.backgroundImage,backgroundColor:railStyle.backgroundColor,width:+rail.getBoundingClientRect().width.toFixed(2),height:+rail.getBoundingClientRect().height.toFixed(2)}:null,thumbCount:thumbs.length,thumbs:thumbs.map(x=>({role:x.getAttribute('role'),tabIndex:x.getAttribute('tabindex'),ariaValueNow:x.getAttribute('aria-valuenow')})),
     canvas:{x:Math.max(0,c.left+scrollX),y:Math.max(0,c.top+scrollY),width:Math.max(1,Math.min(c.width,1080)),height:Math.max(1,Math.min(c.height,880))}};
   })()`);
  add(family+' actual Bluent specimen located',detail.width>0&&detail.height>0,detail);
  if(scenario==='ax-keyboard'){
    const full=await send('Accessibility.getFullAXTree');
    const ax=(full.nodes||[]).filter(n=>['button','slider','textField'].includes(n.role?.value)).map(n=>({
      role:n.role?.value,name:n.name?.value||'',value:n.value?.value??null
    }));
    detail.accessibilityTree= ax.slice(0,45);
    console.log('BLUENT AX '+family+' '+JSON.stringify({sliders:ax.filter(x=>x.role==='slider'),buttons:ax.filter(x=>x.role==='button').length}));
    if(family==='Slider'||family==='RangeSlider'){
      add(family+' is absent from browser AX slider-role tree (current gap)',ax.every(x=>x.role!=='slider'),ax.filter(x=>x.role==='slider'));
      await js("document.querySelector('#audit-only-forced-color-proposal')?.remove()");
      const sel=JSON.stringify(selector);
      const before=await js("(()=>{const e=document.querySelector("+sel+"),r=e.querySelector('.rail'),c=getComputedStyle(r);return {backgroundImage:c.backgroundImage,backgroundColor:c.backgroundColor,afterBg:getComputedStyle(r,'::after').backgroundColor}})()");
      add(family+' baseline forced-colors rail is transparent',before.backgroundImage==='none'&&['rgba(0, 0, 0, 0)','transparent'].includes(before.backgroundColor),before);
      const css=await readFile('scripts/quality/fixtures/v3-p0-forced-colors-rail-proposal.css','utf8');
      await js("(()=>{const x=document.createElement('style');x.id='audit-only-forced-color-proposal';x.textContent="+JSON.stringify(css)+";document.head.appendChild(x)})()");
      const after=await js("(()=>{const e=document.querySelector("+sel+"),r=e.querySelector('.rail'),c=getComputedStyle(r),a=getComputedStyle(r,'::after');return {backgroundImage:c.backgroundImage,backgroundColor:c.backgroundColor,afterBg:a.backgroundColor,afterWidth:a.width,afterContent:a.content}})()");
      detail.experimentalTrackProposal={before,after,claim:'runtime-only style injected into disposable browser; NOT product/design acceptance'};
      add(family+' experimental CSS restores solid visible rail paint',after.backgroundImage==='none'&&!['rgba(0, 0, 0, 0)','transparent'].includes(after.backgroundColor),after);
      add(family+' experimental CSS adds a visible highlighted progress segment',after.afterContent!=='none'&&after.afterWidth!=='0px'&&!['rgba(0, 0, 0, 0)','transparent'].includes(after.afterBg),after);
    }
  }
  if(scenario!=='baseline' && family==='Button'){
    const probe=await js("(()=>{const e=document.querySelector('.lab-canvas .bui-button');e.focus();const computed=getComputedStyle(e);return {id:e.id,cls:e.className,focused:document.activeElement===e,tabIndex:e.tabIndex,outlineStyle:computed.outlineStyle,outlineWidth:computed.outlineWidth,forcedColors:matchMedia('(forced-colors: active)').matches}})()");
    detail.buttonFocusProbe=probe;
    add('Native Bluent Button is focusable in actual Chromium',probe.focused===true&&probe.tabIndex===0,probe);
    if(scenario==='ax-keyboard'){
      await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
      await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
      const next=await js("({tag:document.activeElement?.tagName||'',id:document.activeElement?.id||'',cls:document.activeElement?.className||''})");
      detail.buttonTabProbe=next;
      add('Bluent Button real Tab advances focus',next.tag!==''&&next.tag!=='BODY'&&(next.id!==probe.id||next.cls!==probe.cls), next);
    }
  }
  if(scenario==='forced-colors' && (family==='Slider'||family==='RangeSlider')){
    const rail=detail.rail;
    add('Known forced-colors gradient-only rail becomes unpainted (a gap, not parity)',rail?.backgroundImage==='none'&&(rail.backgroundColor==='rgba(0, 0, 0, 0)'||rail.backgroundColor==='transparent'),rail);
  }
  if(scenario!=='baseline' && family==='Slider'){
    const probe=await js("(()=>{const e=document.getElementById('lab-slider-int');e.focus();const thumb=e.querySelector('.thumb');return {rootFocused:document.activeElement===e,rootTabIndex:e.tabIndex,rootRole:e.getAttribute('role'),thumbTabIndex:thumb?.tabIndex,thumbRole:thumb?.getAttribute('role'),thumbAriaValue:thumb?.getAttribute('aria-valuenow'),theme:document.documentElement.getAttribute('data-bui-theme'),direction:document.documentElement.dir}})()");
    detail.keyboardFocusProbe=probe;
    add('Existing Bluent Slider has no native keyboard focus target (confirmed GAP, not a11y approval)',probe.rootFocused===false&&probe.rootTabIndex===-1&&probe.thumbTabIndex===-1&&probe.thumbRole===null&&probe.rootRole===null,probe);
  }
  if(scenario==='ax-keyboard' && (family==='Slider'||family==='RangeSlider')){
    const valueBefore=await js("document.querySelector('.lab-canvas .lab-value-output')?.textContent||document.querySelector('.lab-canvas')?.innerText?.slice(0,300)");
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39,nativeVirtualKeyCode:39});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39,nativeVirtualKeyCode:39});
    const valueAfter=await js("document.querySelector('.lab-canvas .lab-value-output')?.textContent||document.querySelector('.lab-canvas')?.innerText?.slice(0,300)");
    detail.arrowRightProbe={valueBefore,valueAfter};
    add(family+' no native keyboard ArrowRight operation in current sample',valueBefore===valueAfter,detail.arrowRightProbe);
  }
  const capture=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:detail.canvas.x,y:detail.canvas.y,width:detail.canvas.width,height:detail.canvas.height,scale:1}});
  const img='BLUENT-LAB-'+family.toUpperCase()+(scenario==='baseline'?'':'-'+scenario.toUpperCase())+'-CHROME.png';
  await writeFile(join(evidenceRoot,img),Buffer.from(capture.data,'base64'));
  detail.image=img;measurements.push(detail);
 }
 const evidence={auditIssue:552,sourceBranch:'v3/issue-421-component-lab',sourceRef:'b9952aa93e89fd569de54080a7fdd06037b53a41',
 mode:'real Chrome Blazor WebAssembly Debug Lab',scenario,status:'Bluent_current_source_visual_baseline_NOT_fluent_parity',
 viewport:size,accessibilityMode,normalizedInScenario:scenario==='baseline'?null:{buttonWidth:96,sliderWidth:scenario==='zoom-200'?'natural intrinsic responsive width':'forced 260px',rtl:scenario.endsWith('rtl'),theme:scenario.startsWith('dark')?'dark':'light',claim:scenario==='ax-keyboard'?'Chrome AX tree plus real key event and runtime-only CSS candidate; NOT OS/AT or design signoff':scenario==='zoom-200'?'620 CSSpx DPR2 reflow proxy with natural Slider width, no native browser zoom or parity':scenario==='forced-colors'?'Real Chromium forced-colors CSS emulation only, no native OS HC or parity':'same nominal width and theme mode only; independent layouts, no pixel parity'},generatedAt:new Date().toISOString(),checks,measurements};
 await writeFile(join(evidenceRoot,'BLUENT-LAB-P0'+(scenario==='baseline'?'':'-'+scenario.toUpperCase())+'-CHROME.json'),JSON.stringify(evidence,null,2)+'\n');
 console.log('BLUENT SUMMARY '+JSON.stringify({checks:checks.length,screenshots:measurements.map(x=>x.image)}));
}catch(e){console.error('BLUENT ERROR',e?.stack||String(e));process.exitCode=1;}
finally{
 try{socket?.close()}catch{}
 if(host&&!host.killed){try{const k=spawn('taskkill',['/PID',String(host.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});await new Promise(ok=>k.once('close',ok));}catch{}host.kill();}
 if(browser&&!browser.killed){try{const k=spawn('taskkill',['/PID',String(browser.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});await new Promise(ok=>k.once('close',ok));}catch{}browser.kill();}
 await wait(900);
 try{await rm(profile,{recursive:true,force:true,maxRetries:12,retryDelay:250});}catch(e){console.error('Owned Chrome profile cleanup failed: '+e.message);process.exitCode=1;}
}