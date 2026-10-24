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
const hostingMode=process.argv[5]||'WebAssembly';
if(!['WebAssembly','Server'].includes(hostingMode))throw Error('Unknown browser hosting mode '+hostingMode);
const publishedRoot=process.env.BLUENT_V3_552_PUBLISHED_DIR||'';
if(hostingMode==='Server'&&!publishedRoot)throw Error('Server mode requires isolated published root from wrapper');
if(!['baseline','light-ltr','dark-rtl','dark-ltr','forced-colors','zoom-200','ax-keyboard','file-upload','pointer-scroll','button-keyboard'].includes(scenario))throw Error('Unsupported Bluent scenario '+scenario);
const chrome=process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile=await mkdtemp(join(tmpdir(),'bluent552-lab-comparison-'));
const uploadDir=scenario==='file-upload'?await mkdtemp(join(tmpdir(),'bluent552-file-fixture-')):null;
const pending=new Map(),measurements=[],checks=[];let serial=0,host,browser,socket;
const poll=async(fn,ms=70000)=>{const end=Date.now()+ms;while(Date.now()<end){try{const v=await fn();if(v)return v;}catch{}await wait(250);}throw Error('Timed out waiting for live Blazor Lab');};
const port=()=>new Promise((ok,no)=>{const s=createServer();s.on('error',no);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>ok(p));});});
const send=(method,params={})=>new Promise((ok,no)=>{const id=++serial,t=setTimeout(()=>{pending.delete(id);no(Error(method+' timed out'));},18000);pending.set(id,{ok:x=>{clearTimeout(t);ok(x)},no:e=>{clearTimeout(t);no(e)}});socket.send(JSON.stringify({id,method,params}));});
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value;};
const add=(label,ok,details)=>{checks.push({label,pass:!!ok,details});console.log('BLUENT '+(ok?'PASS':'FAIL')+' '+label);if(!ok)throw Error(label+': '+JSON.stringify(details));};
try{
 const p=await port(),url='http://127.0.0.1:'+p;
 const project=join(sourceRoot,'src/Bluent.UI.Demo/Bluent.UI.Demo.csproj');
 const route=hostingMode==='Server'?'/compatibility/component-lab-server':'/component-lab';
 if(hostingMode==='Server'){
   host=spawn('dotnet',[join(publishedRoot,'Bluent.UI.Demo.SSR.dll'),'--urls',url],{cwd:publishedRoot,stdio:'ignore',windowsHide:true,env:{...process.env,ASPNETCORE_ENVIRONMENT:'Production'}});
 }else{
   host=spawn('dotnet',['run','--project',project,'-c','Debug','--no-build','--no-launch-profile','--urls',url],{cwd:sourceRoot,stdio:'ignore',windowsHide:true});
 }
 await poll(async()=>{const r=await fetch(url+route);return r.status===200;},70000);
 browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--disable-extensions','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
 const bp=await poll(async()=>+(await readFile(join(profile,'DevToolsActivePort'),'utf8')).trim().split(/\r?\n/)[0],35000);
 const tabs=await(await fetch('http://127.0.0.1:'+bp+'/json/list')).json(),tab=tabs.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
 if(!tab)throw Error('No disposable CDP Chrome page');
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((ok,no)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',no,{once:true});});
 socket.addEventListener('message',e=>{const x=JSON.parse(e.data),q=pending.get(x.id);if(q){pending.delete(x.id);x.error?q.no(Error(JSON.stringify(x.error))):q.ok(x.result||{})}});
 await send('Page.enable');await send('Runtime.enable');await send('DOM.enable');await send('Accessibility.enable');
 const reflowProxy=scenario==='zoom-200';
 const size=reflowProxy?{width:620,height:570,deviceScaleFactor:2,mobile:false}:{width:1240,height:1140,deviceScaleFactor:1,mobile:false};
 await send('Emulation.setDeviceMetricsOverride',size);
 if(scenario==='forced-colors'||scenario==='ax-keyboard')await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'},{name:'prefers-contrast',value:'more'}]});
 await send('Page.navigate',{url:url+route});
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
  if(hostingMode==='Server'&&family!=='FileSelect'&&scenario!=='pointer-scroll'&&scenario!=='button-keyboard')continue;
  if(scenario==='pointer-scroll' && family!=='Slider' && family!=='RangeSlider')continue;
  if(scenario==='button-keyboard' && family!=='Button')continue;
  console.log('BLUENT FAMILY '+family+' host='+hostingMode+' at queue filter');
  await js(`(()=>{const el=document.getElementById('lab-queue-search');if(!el)throw Error('Missing Lab queue search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'${issue}');el.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await poll(()=>js("document.querySelectorAll('.lab-queue-row').length===1&&!!document.querySelector('.lab-queue-row button')"),hostingMode==='Server'?35000:15000);
  console.log('BLUENT FAMILY '+family+' filtered');
  await js("document.querySelector('.lab-queue-row button').click()");
  await poll(()=>js("!!document.querySelector("+JSON.stringify(selector)+")"),hostingMode==='Server'?35000:16000);
  console.log('BLUENT FAMILY '+family+' real specimen selected');
  const detail=await js(`(()=>{
   const e=document.querySelector(${JSON.stringify(selector)}),canvas=e.closest('.lab-canvas');
   if('${scenario}'!=='baseline'){
     if('${scenario}'!=='zoom-200'&&'${scenario}'!=='pointer-scroll'&&('${family}'==='Slider'||'${family}'==='RangeSlider'))e.style.width='260px';
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
  if (family === 'Button' && (scenario === 'light-ltr' || scenario === 'dark-rtl')) {
    await js("document.querySelector('.lab-canvas .bui-button')?.blur()");
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1,button:'none'});
    await wait(120);
    const cropMeta = await js(`(()=>{
      const e=document.querySelector('.lab-canvas .bui-button'),h=e.getBoundingClientRect(),cs=getComputedStyle(e);
      const range=document.createRange();range.selectNodeContents(e);const tr=range.getBoundingClientRect();
      const round=v=>Math.round(v*100)/100;
      return {x:h.x,y:h.y,width:h.width,height:h.height,text:e.innerText.trim(),theme:document.documentElement.getAttribute('data-bui-theme'),dir:document.documentElement.dir,hostTag:e.tagName,textRect:{left:round(tr.left-h.left),top:round(tr.top-h.top),width:round(tr.width),height:round(tr.height)},computedStyle:{fontFamily:cs.fontFamily,fontSize:cs.fontSize,fontWeight:cs.fontWeight,lineHeight:cs.lineHeight,letterSpacing:cs.letterSpacing,color:cs.color,backgroundColor:cs.backgroundColor,paddingInlineStart:cs.paddingInlineStart,paddingInlineEnd:cs.paddingInlineEnd,display:cs.display,boxSizing:cs.boxSizing,whiteSpace:cs.whiteSpace,textTransform:cs.textTransform,textAlign:cs.textAlign}};
    })()`);
    add('Primary Button crop is normalized 96x32 with Continue label',Math.abs(cropMeta.width-96)<0.1 && Math.abs(cropMeta.height-32)<0.1 && cropMeta.text==='Continue' && cropMeta.theme===(scenario.startsWith('dark')?'dark':'light') && cropMeta.dir===(scenario.endsWith('rtl')?'rtl':'ltr'),cropMeta);
    const cropCapture = await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true,clip:{x:Math.round(cropMeta.x),y:Math.round(cropMeta.y),width:96,height:32,scale:1}});
    const cropImage = 'BLUENT-LAB-BUTTON-'+scenario.toUpperCase()+'-PRIMARY-CROP-CHROME.png';
    await writeFile(join(evidenceRoot,cropImage),Buffer.from(cropCapture.data,'base64'));
    detail.primaryButtonCrop={file:cropImage,...cropMeta,note:'Real current-source Bluent Button host crop; pointer moved away and focus blurred before capture; 96x32 CSS pixels; diagnostics only.'};
  }
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
  if(scenario==='file-upload' && family==='FileSelect'){
    // All files below are disposable synthetic text files generated by the audit.
    const synthetic=['alpha.txt','beta.md','gamma.txt','delta.md','single-replacement.txt'];
    for(const name of synthetic)await writeFile(join(uploadDir,name),'Synthetic #552 harmless test file '+name+'\n');
    const grab=async()=>{
      const d=await js("(()=>{const f=id=>{const e=document.getElementById(id);return {accept:e.querySelector('input[type=file]')?.accept,multiple:e.querySelector('input[type=file]')?.multiple,chooseVisible:!!e.querySelector('.content > button'),removeButtons:[...e.querySelectorAll('.files button')].map(x=>({ariaLabel:x.getAttribute('aria-label'),title:x.getAttribute('title'),text:x.textContent?.trim()||'',tabIndex:x.tabIndex})),cardCount:e.querySelectorAll('.files .bui-card').length}};return {single:f('lab-file-single'),multi:f('lab-file-multi'),disabledButton:document.querySelector('#lab-file-disabled button')?.disabled,statusSingle:document.querySelector('.lab-file-single-status')?.textContent?.trim(),statusMulti:document.querySelector('.lab-file-multi-status')?.textContent?.trim()}})()");
      return d;
    };
    const sendFiles=async(selector,names)=>{
      const root=await send('DOM.getDocument',{depth:1});
      const node=await send('DOM.querySelector',{nodeId:root.root.nodeId,selector});
      if(!node.nodeId)throw Error('No actual file input '+selector);
      await send('DOM.setFileInputFiles',{nodeId:node.nodeId,files:names.map(n=>join(uploadDir,n))});
    };
    const until=async(cls,quantity)=>poll(async()=>{
      const t=await js("document.querySelector("+JSON.stringify(cls)+")?.textContent||''");
      return t.includes('Files: '+quantity+';')?true:false;
    },18000);
    const stages=[];
    stages.push({name:'initial',...await grab()});
    add('FileSelect native multiple and accept DOM contract observed',stages[0].single.multiple===false&&stages[0].multi.multiple===true&&stages[0].single.accept==='.txt'&&stages[0].multi.accept==='.txt,.md',stages[0]);
    add('Disabled FileSelect demo button disabled',stages[0].disabledButton===true);
    await sendFiles('#lab-file-single input[type=file]',['alpha.txt']);
    await until('.lab-file-single-status',1);
    stages.push({name:'single-first',...await grab()});
    add('Single FileSelect actual browser upload propagates callback name',stages.at(-1).statusSingle.includes('alpha.txt'));
    await sendFiles('#lab-file-single input[type=file]',['single-replacement.txt']);
    await poll(async()=>{const d=await grab();return d.statusSingle.includes('single-replacement.txt')&&d.statusSingle.includes('Files: 1;')?true:false;},18000);
    stages.push({name:'single-replaced',...await grab()});
    add('Subsequent single selection replaces prior file',!stages.at(-1).statusSingle.includes('alpha.txt'));
    await sendFiles('#lab-file-multi input[type=file]',['alpha.txt','beta.md']);
    await until('.lab-file-multi-status',2);
    stages.push({name:'multi-two',...await grab()});
    add('Two files selected and picker hidden at MaxFiles=2',stages.at(-1).statusMulti.includes('Files: 2;')&&!stages.at(-1).multi.chooseVisible&&stages.at(-1).multi.removeButtons.length===2,stages.at(-1));
    const root=await send('DOM.getDocument',{depth:1});
    const btn=await send('DOM.querySelector',{nodeId:root.root.nodeId,selector:'#lab-file-multi .files button'});
    if(!btn.nodeId)throw Error('No remove button found after selection');
    const desc=await send('DOM.describeNode',{nodeId:btn.nodeId});
    const ax=await send('Accessibility.getPartialAXTree',{backendNodeId:desc.node.backendNodeId,fetchRelatives:false});
    const removeAX=(ax.nodes||[]).map(n=>({role:n.role?.value||'',name:n.name?.value??'',ignored:!!n.ignored}));
    add('FileSelect remove action exposes icon-font glyph instead of meaningful accessible name (known gap)',removeAX.some(n=>n.role==='button'&&n.name.length>0&&[...n.name].every(c=>c.codePointAt(0)>=0xE000&&c.codePointAt(0)<=0xF8FF)),removeAX);
    await js("document.querySelector('#lab-file-multi .files button').click()");
    await until('.lab-file-multi-status',1);
    stages.push({name:'after-remove',...await grab()});
    add('Removing selected file restores picker',stages.at(-1).multi.chooseVisible&&stages.at(-1).multi.removeButtons.length===1,stages.at(-1));
    await sendFiles('#lab-file-multi input[type=file]',['gamma.txt','delta.md']);
    await until('.lab-file-multi-status',3);
    stages.push({name:'cumulative-overflow',...await grab()});
    add('Actual re-selection exceeds MaxFiles=2; existing cumulative limit gap',stages.at(-1).statusMulti.includes('Files: 3;')&&stages.at(-1).multi.removeButtons.length===3,stages.at(-1));
    detail.uploadEvidence={syntheticFileNames:synthetic,testedMaxFiles:2,stages,removeAX,limitations:'Real Chrome DOM.setFileInputFiles on hydrated Blazor WASM. Accept is a chooser hint, no server validation, real OS picker or native AT. Existing bug snapshot, NOT product acceptance.'};
  }

  if(scenario==='pointer-scroll' && (family==='Slider'||family==='RangeSlider')){
    const valueSelector=family==='Slider'?'.lab-slider-int-status':'.lab-range-int-status';
    // Real browser mouse input: observe source events and callback value without changing product.
    await js("(()=>{if(!window.__bluent552PointerEvents){window.__bluent552PointerEvents=[];document.addEventListener('pointerdown',e=>window.__bluent552PointerEvents.push({kind:'down',id:e.target.closest('.bui-slider,.bui-range-slider')?.id||null,screenX:e.screenX,clientX:e.clientX,screenY:e.screenY,clientY:e.clientY,scrollY}),true);document.addEventListener('pointermove',e=>{if(window.__bluent552PointerEvents.length<20)window.__bluent552PointerEvents.push({kind:'move',id:e.target.closest('.bui-slider,.bui-range-slider')?.id||null,screenX:e.screenX,clientX:e.clientX})},true)}})()");
    const readValue=()=>js("document.querySelector("+JSON.stringify(valueSelector)+")?.textContent?.trim()||''");
    const cases=[];
    for(const target of [{name:'normal',fraction:.75},{name:'scroll',fraction:.25}]){
      await js("document.querySelector("+JSON.stringify(selector)+").scrollIntoView({block:'center'})");
      if(target.name==='scroll')await js("(()=>{const e=document.querySelector("+JSON.stringify(selector)+");const c=e.closest('.page-content');if(c)c.scrollBy(0,130);else window.scrollBy(0,130)})()");

      const position=await js("(()=>{const e=document.querySelector("+JSON.stringify(selector)+"),r=e.querySelector('.rail').getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height,scrollY,scrollContainerTop:e.closest('.page-content')?.scrollTop||0,windowScreenX:screenX,windowScreenY:screenY}})()");
      const x=position.left+position.width*target.fraction,y=position.top+position.height/2;
      if(x<0||y<0||x>=size.width||y>=size.height)throw Error('Offscreen pointer audit '+JSON.stringify({family,target,x,y,position}));
      if(target.name==='scroll')add(family+' audit scroll scenario has nonzero scrollY',(position.scrollContainerTop>0||position.scrollY>0),position);
      const before=await readValue();
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:'none'});
      await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',buttons:1,clickCount:1});
      await wait(hostingMode==='Server'?650:320);
      const afterDown=await readValue();
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+9,y,button:'left',buttons:1});
      await wait(hostingMode==='Server'?650:320);
      const afterMove=await readValue();
      await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x+9,y,button:'left',buttons:0,clickCount:1});
      await wait(180);
      const afterUp=await readValue();
      const events=await js("window.__bluent552PointerEvents.splice(0)");
      const sample={case:target.name,position,targetFraction:target.fraction,before,afterDown,afterMove,afterUp,events};
      cases.push(sample);
      add(family+' '+target.name+' real Chrome pointerdown reached component',events.some(e=>e.kind==='down'&&e.id===selector.slice(1)),sample);
      console.log('BLUENT POINTER '+JSON.stringify({family,hostingMode,sample}));
    }
    detail.pointerScrollEvidence={cases,limitations:'Real headless Chrome CDP mouse and Blazor callbacks, actual viewport scroll; not OS touch/pen or design acceptance.'};
  }
  if(scenario==='button-keyboard' && family==='Button'){
    const inspect=()=>js("(()=>{const e=[...document.querySelectorAll('.lab-examples button')].find(b=>b.textContent.trim()==='Pin selection');if(!e)throw Error('Missing live Pin selection native Button');const r=e.getBoundingClientRect(),status=document.querySelector('.lab-toggle-status')?.textContent?.trim()||'';return {tag:e.tagName,role:e.getAttribute('role'),ariaPressed:e.getAttribute('aria-pressed'),toggled:e.classList.contains('toggled'),disabled:e.disabled,tabIndex:e.tabIndex,visible:r.width>0&&r.height>0,status,buttonName:e.textContent.trim(),disabledOther:[...document.querySelectorAll('.lab-examples button')].find(b=>b.textContent.trim()==='Unavailable')?.disabled,linkHref:[...document.querySelectorAll('.lab-examples a')].find(a=>a.textContent.trim()==='Open guide')?.getAttribute('href')||null}})()");
    const snap=[];
    const initial=await inspect();snap.push({step:'initial',...initial});
    add('Bluent Button toggle native DOM and callback baseline',initial.tag==='BUTTON'&&initial.visible&&initial.status.includes('Pinned: no; change callbacks: 0')&&!initial.toggled,initial);
    add('Bluent Button existing disabled and anchor compositions use native elements',initial.disabledOther===true&&!!initial.linkHref,initial);
    const focus=await js("(()=>{const e=[...document.querySelectorAll('.lab-examples button')].find(b=>b.textContent.trim()==='Pin selection');e.focus();return {focused:document.activeElement===e,tag:document.activeElement?.tagName}})()");
    add('Bluent toggle native button focusable in Chrome',focus.focused,focus);
    const root=await send('DOM.getDocument',{depth:1});
    const all=await send('DOM.querySelectorAll',{nodeId:root.root.nodeId,selector:'.lab-examples button'});
    const ax=await send('Accessibility.getFullAXTree');
    const toggleAX=(ax.nodes||[]).filter(n=>n.role?.value==='button'&&n.name?.value==='Pin selection').map(n=>({role:n.role.value,name:n.name.value,pressed:n.properties?.find(p=>p.name==='pressed')?.value?.value??null}));
    add('Chrome exposes named toggle as Button but no pressed semantic (known gap)',toggleAX.length===1&&toggleAX[0].pressed===null,toggleAX);
    const press=async(key,code,vkey)=>{
      await send('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:vkey,nativeVirtualKeyCode:vkey});
      if(key==='Enter')await send('Input.dispatchKeyEvent',{type:'char',key,code,text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:vkey,nativeVirtualKeyCode:vkey});
      await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:vkey,nativeVirtualKeyCode:vkey});
    };
    const preKey=await js("(()=>{const e=[...document.querySelectorAll('.lab-examples button')].find(b=>b.textContent.trim()==='Pin selection');window.__bluentKeyEvents=[];['keydown','keyup','click'].forEach(t=>document.addEventListener(t,ev=>{if(ev.target===e)window.__bluentKeyEvents.push({type:t,key:ev.key,code:ev.code})},true));e.focus();return {focused:document.activeElement===e,activeTag:document.activeElement?.tagName}})()");
    console.log('BUTTON PRE ENTER '+JSON.stringify(preKey));
    await press('Enter','Enter',13);
    console.log('BUTTON KEY EVENTS '+JSON.stringify(await js("window.__bluentKeyEvents")));
    console.log('BUTTON AFTER ENTER '+JSON.stringify(await inspect()));
    await poll(async()=>{const now=await inspect();return now.status.includes('Pinned: yes; change callbacks: 1')?true:false},hostingMode==='Server'?22000:12000);
    const entered=await inspect();snap.push({step:'enter',...entered});
    add('Real Enter key toggles Button and invokes one bound callback',entered.toggled&&entered.ariaPressed===null,entered);
    await js("(()=>{const e=[...document.querySelectorAll('.lab-examples button')].find(b=>b.textContent.trim()==='Pin selection');e.focus()})()");
    await press(' ','Space',32);
    await poll(async()=>{const now=await inspect();return now.status.includes('Pinned: no; change callbacks: 2')?true:false},hostingMode==='Server'?22000:12000);
    const spaced=await inspect();snap.push({step:'space',...spaced});
    add('Real Space key untoggles Button and invokes next bound callback',!spaced.toggled&&spaced.ariaPressed===null,spaced);
    detail.buttonToggleKeyboard={snap,toggleAX,focus,limitations:'Real Chrome keyboard on native Blazor Button and AX tree. aria-pressed missing in component. Does not certify actual native OS screen-reader or approved visual parity.'};
  }
  const capture=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:detail.canvas.x,y:detail.canvas.y,width:detail.canvas.width,height:detail.canvas.height,scale:1}});
  const img='BLUENT-LAB-'+family.toUpperCase()+(scenario==='baseline'?'':'-'+scenario.toUpperCase())+(hostingMode==='Server'?'-SERVER':'')+'-CHROME.png';
  await writeFile(join(evidenceRoot,img),Buffer.from(capture.data,'base64'));
  detail.image=img;
  if(scenario==='file-upload' && family==='FileSelect'){
    // Separate fresh component state; no action on the now-hidden picker.
    // This tests the independent "too many files in ONE native selection" path.
    console.log('BLUENT SINGLE BATCH '+hostingMode+' starting clean SSR/WASM navigation');
    await send('Page.navigate',{url:url+route});
    await poll(()=>js("document.querySelector('main.component-lab')?.getAttribute('data-lab-interactive')==='true'"),45000);
    await js("(()=>{const e=document.querySelector('#lab-queue-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'444');e.dispatchEvent(new Event('input',{bubbles:true}));})()");
    await poll(()=>js("document.querySelectorAll('.lab-queue-row').length===1&&!!document.querySelector('.lab-queue-row button')"),hostingMode==='Server'?35000:15000);
    await js("document.querySelector('.lab-queue-row button').click()");
    await poll(()=>js("!!document.querySelector('#lab-file-multi input[type=file]')"),hostingMode==='Server'?35000:16000);
    const oneInput=await send('DOM.getDocument',{depth:1});
    const oneId=await send('DOM.querySelector',{nodeId:oneInput.root.nodeId,selector:'#lab-file-multi input[type=file]'});
    if(!oneId.nodeId)throw Error('No clean FileSelect input for one-batch test');
    await send('DOM.setFileInputFiles',{nodeId:oneId.nodeId,files:['alpha.txt','beta.md','gamma.txt'].map(n=>join(uploadDir,n))});
    await poll(()=>js("document.querySelector('.lab-file-multi-status')?.textContent?.includes('Files: 3;')"),18000);
    const oneBatch=await js("(()=>{const c=document.querySelector('#lab-file-multi');return {maxFiles:2,status:document.querySelector('.lab-file-multi-status')?.textContent?.trim(),cards:c?.querySelectorAll('.files .bui-card').length||0,removeButtons:c?.querySelectorAll('.files button').length||0,nativeMultiple:c?.querySelector('input[type=file]')?.multiple,pickerVisible:!!c?.querySelector('.content > button')}})()");
    add('One native batch of three files exceeds MaxFiles=2 (independent gap)',oneBatch.cards===3&&oneBatch.nativeMultiple===true&&oneBatch.status.includes('Files: 3;'),oneBatch);
    detail.uploadEvidence.singleBatchOverflow=oneBatch;
    await js("document.querySelector('#lab-file-multi')?.scrollIntoView({block:'center'})");
    const oneShot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
    const oneImg='BLUENT-LAB-FILESELECT-ONE-BATCH-'+(hostingMode==='Server'?'SERVER-':'')+'CHROME.png';
    await writeFile(join(evidenceRoot,oneImg),Buffer.from(oneShot.data,'base64'));
    detail.uploadEvidence.singleBatchImage=oneImg;
  }
  measurements.push(detail);
 }
 const evidence={auditIssue:552,hostingMode,sourceBranch:'v3/issue-421-component-lab',sourceRef:'b9952aa93e89fd569de54080a7fdd06037b53a41',
 mode:hostingMode==='Server'?'real Chrome published Production Blazor InteractiveServer':'real Chrome Blazor WebAssembly Debug Lab',scenario,status:'Bluent_current_source_visual_baseline_NOT_fluent_parity',
 viewport:size,accessibilityMode,normalizedInScenario:scenario==='baseline'?null:{buttonWidth:96,sliderWidth:scenario==='zoom-200'?'natural intrinsic responsive width':'forced 260px',rtl:scenario.endsWith('rtl'),theme:scenario.startsWith('dark')?'dark':'light',claim:scenario==='ax-keyboard'?'Chrome AX tree plus real key event and runtime-only CSS candidate; NOT OS/AT or design signoff':scenario==='zoom-200'?'620 CSSpx DPR2 reflow proxy with natural Slider width, no native browser zoom or parity':scenario==='forced-colors'?'Real Chromium forced-colors CSS emulation only, no native OS HC or parity':'same nominal width and theme mode only; independent layouts, no pixel parity'},generatedAt:new Date().toISOString(),checks,measurements};
 await writeFile(join(evidenceRoot,'BLUENT-LAB-P0'+(scenario==='baseline'?'':'-'+scenario.toUpperCase())+(hostingMode==='Server'?'-SERVER':'')+'-CHROME.json'),JSON.stringify(evidence,null,2)+'\n');
 console.log('BLUENT SUMMARY '+JSON.stringify({checks:checks.length,screenshots:measurements.map(x=>x.image)}));
}catch(e){console.error('BLUENT ERROR',e?.stack||String(e));process.exitCode=1;}
finally{
 try{socket?.close()}catch{}
 if(host&&!host.killed){try{const k=spawn('taskkill',['/PID',String(host.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});await new Promise(ok=>k.once('close',ok));}catch{}host.kill();}
 if(browser&&!browser.killed){try{const k=spawn('taskkill',['/PID',String(browser.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});await new Promise(ok=>k.once('close',ok));}catch{}browser.kill();}
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
 await wait(900);
 if(uploadDir){try{await rm(uploadDir,{recursive:true,force:true,maxRetries:10,retryDelay:250})}catch(e){console.error('Owned file upload cleanup incomplete '+e.message);process.exitCode=1;}}
 try{await rm(profile,{recursive:true,force:true,maxRetries:12,retryDelay:250});}catch(e){console.error('Owned Chrome profile cleanup failed: '+e.message);process.exitCode=1;}
}