#!/usr/bin/env node
// #552 browser evidence: current Bluent Checkbox/Switch/RadioGroup semantics.
// Real Chromium CDP keyboard/pointer input; no product-source changes and no AT certification.
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,mkdir,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:net';
import {setTimeout as wait} from 'node:timers/promises';
const engine=(process.argv[2]||'chrome').toLowerCase();
if(!['chrome','edge'].includes(engine)) throw Error('Supported engines: chrome|edge');
const executable=engine==='chrome'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const root=resolve('.'),evidence=join(root,'docs/v3/quality/evidence'),profile=await mkdtemp(join(tmpdir(),'bluent552-label-link-badge-'));
const sourceRef='73155f02';
let browser,host,socket,sequence=0;const pending=new Map(),checks=[],cases=[];
const port=()=>new Promise((ok,no)=>{const s=createServer();s.on('error',no);s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>ok(n));});});
const poll=async(fn,ms=60000)=>{const end=Date.now()+ms;while(Date.now()<end){try{const v=await fn();if(v)return v;}catch{}await wait(250);}throw Error('Timed out waiting for demo/browser startup');};
const call=(method,params={})=>new Promise((ok,no)=>{const id=++sequence,t=setTimeout(()=>{pending.delete(id);no(Error(method+' timed out'));},20000);pending.set(id,{ok:v=>{clearTimeout(t);ok(v)},no:e=>{clearTimeout(t);no(e)}});socket.send(JSON.stringify({id,method,params}));});
const js=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value;};
const check=(name,pass,observed)=>{checks.push({name,pass:!!pass,observed});console.log(engine+' '+(pass?'PASS ':'FAIL ')+name);};
const waitFor=async selector=>{try{return await poll(()=>js(`!!document.querySelector(${JSON.stringify(selector)})`),30000)}catch(e){const diag=await js(`({url:location.href,ready:document.readyState,title:document.title,body:document.body?.innerText?.slice(0,1200),root:document.querySelector('#app')?.innerHTML?.slice(0,500),scripts:[...document.scripts].map(s=>s.src).filter(Boolean)})`).catch(x=>({diagError:x.message}));console.log(engine+' DOM DIAGNOSTIC '+JSON.stringify(diag));throw e;}};
const snapshotCheckbox=()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Indeterminate');const section=h?.nextElementSibling;const input=section?.querySelector('input[type="checkbox"]');const wrapper=input?.parentElement;const label=wrapper?.querySelector('label');return input?{wrapperClass:wrapper.className,id:input.id,checked:input.checked,indeterminate:input.indeterminate,ariaChecked:input.getAttribute('aria-checked'),role:input.getAttribute('role'),name:input.name,disabled:input.disabled,tabIndex:input.tabIndex,label:label?.textContent.trim()||'',labelFor:label?.htmlFor||'',stateText:[...(section?.querySelectorAll('pre')||[])].map(x=>x.textContent.trim())}:null;};
const snapshotSwitch=()=>{const wrappers=[...document.querySelectorAll('.bui-switch')];return wrappers.map((wrapper,index)=>{const input=wrapper.querySelector('input[type="checkbox"]');const label=input&&[...wrapper.querySelectorAll('label')].find(x=>x.htmlFor===input.id);return input?{index,id:input.id,checked:input.checked,indeterminate:input.indeterminate,ariaChecked:input.getAttribute('aria-checked'),role:input.getAttribute('role'),name:input.name,disabled:input.disabled,tabIndex:input.tabIndex,label:label?.textContent.trim()||'',labelFor:label?.htmlFor||'',wrapperClass:wrapper.className}:null;}).filter(Boolean);};
const snapshotRadios=()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Default');const section=h?.nextElementSibling;const list=section?.querySelector('.items-list');const group=list?.parentElement;if(!group)return null;const inputs=[...group.querySelectorAll('input[type="radio"]')];return {groupClass:group.className,groupRole:group.getAttribute('role'),groupAriaLabel:group.getAttribute('aria-label'),groupLabelledBy:group.getAttribute('aria-labelledby'),groupText:group.firstElementChild?.textContent.trim()||'',groupLabelTag:group.firstElementChild?.tagName||'',groupLabelFor:group.firstElementChild?.htmlFor||'',hasFieldset:!!group.querySelector('fieldset'),hasLegend:!!group.querySelector('legend'),options:inputs.map(input=>{const label=[...group.querySelectorAll('label')].find(x=>x.htmlFor===input.id&&x.textContent.trim());return {id:input.id,name:input.name,checked:input.checked,role:input.getAttribute('role'),ariaChecked:input.getAttribute('aria-checked'),disabled:input.disabled,tabIndex:input.tabIndex,label:label?.textContent.trim()||'',labelFor:label?.htmlFor||''};})};};
const snapshotOtp=()=>{const wrapper=document.querySelector('.bui-otp-field');const host=wrapper?.querySelector(':scope > .otp');if(!host)return null;const cells=[...host.querySelectorAll('.otp-cell-input')];const hidden=wrapper.querySelector('input[type="hidden"]');return {wrapperClass:wrapper.className,hostId:host.id,role:host.getAttribute('role'),ariaLabel:host.getAttribute('aria-label'),dataLength:host.getAttribute('data-otp-length'),dataAutoSubmit:host.getAttribute('data-otp-auto-submit'),dataBlazorEvent:host.getAttribute('data-otp-blazor-event'),cells:cells.map((input,index)=>({index,id:input.id,type:input.type,ariaLabel:input.getAttribute('aria-label'),inputMode:input.getAttribute('inputmode'),autocomplete:input.autocomplete,pattern:input.pattern,maxLength:input.maxLength,value:input.value,name:input.name,tabIndex:input.tabIndex,disabled:input.disabled,idx:input.getAttribute('data-idx')})),hidden:hidden?{id:hidden.id,type:hidden.type,name:hidden.name,value:hidden.value}:null,outputText:wrapper.nextElementSibling?.textContent.trim()||''};};
const axFor=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:false});const objectId=r.result?.objectId;if(!objectId)return null;const tree=await call('Accessibility.getPartialAXTree',{objectId,fetchRelatives:false});return (tree.nodes||[]).map(n=>({role:n.role?.value||null,name:n.name?.value||'',ignored:!!n.ignored,properties:Object.fromEntries((n.properties||[]).map(p=>[p.name,p.value?.value??p.value?.type??null]))}));};
const keypress=async(key,code,vk)=>{const p={key,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk};await call('Input.dispatchKeyEvent',{type:'keyDown',...p,...(key==='Enter'?{text:'\r',unmodifiedText:'\r'}:key===' '?{text:' ',unmodifiedText:' '}: {})});await call('Input.dispatchKeyEvent',{type:'keyUp',...p});await wait(260);};
const ensureUiMode=async mode=>{for(const target of [{index:0,checked:mode.theme==='dark'},{index:1,checked:mode.dir==='rtl'}]){const item=await js(`(()=>{const x=[...document.querySelectorAll('.bui-switch input[type=\"checkbox\"]')][${target.index}];return x?{id:x.id,checked:x.checked}:null})()`);if(!item)throw Error('Header theme/direction switch '+target.index+' not found');if(item.checked!==target.checked){await js(`document.getElementById(${JSON.stringify(item.id)})?.focus()`);await keypress(' ','Space',32);const domState=target.index===0?`document.documentElement.getAttribute('data-bui-theme')===${JSON.stringify(mode.theme)}`:`document.documentElement.dir===${JSON.stringify(mode.dir)}`;await poll(()=>js(`(()=>{const x=document.getElementById(${JSON.stringify(item.id)});return !!x&&x.checked===${target.checked}&&(${domState})})()`),10000);}}return js(`({theme:document.documentElement.getAttribute('data-bui-theme'),dir:document.documentElement.dir,forced:matchMedia('(forced-colors: active)').matches,themeBackground:getComputedStyle(document.documentElement).getPropertyValue('--colorNeutralBackground1').trim(),switches:[...document.querySelectorAll('.bui-switch input[type=\"checkbox\"]')].slice(0,2).map(x=>({id:x.id,checked:x.checked}))})`)};
const insertText=async text=>{await call('Input.insertText',{text});await wait(300);};
const clickAt=async box=>{await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:box.x,y:box.y});await call('Input.dispatchMouseEvent',{type:'mousePressed',x:box.x,y:box.y,button:'left',clickCount:1});await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:box.x,y:box.y,button:'left',clickCount:1});await wait(350);};
const clickFirstRadio=async()=>{const box=await js(`(()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Default');const i=h?.nextElementSibling?.querySelector('.items-list input[type="radio"]');const l=i&&[...i.parentElement.querySelectorAll('label')].find(x=>x.htmlFor===i.id&&x.textContent.trim());const e=l||i;if(!e)return null;e.scrollIntoView({block:'center'});const b=e.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}})()`);if(!box)throw Error('Could not locate the first RadioGroup option');await clickAt(box);};
const screenshot=async name=>{const png=(await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true})).data;const file='BLUENT-LABEL-LINK-BADGE-'+engine.toUpperCase()+'-'+name+'.png';await writeFile(join(evidence,file),Buffer.from(png,'base64'));return file;};
async function terminate(child){if(!child?.pid||child.exitCode!==null)return;const exited=new Promise(ok=>child.once('exit',ok));try{child.kill();}catch{}await Promise.race([exited,wait(2500)]);if(child.exitCode===null){try{child.kill('SIGKILL');}catch{}}}
async function closeBrowser(){try{const lines=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).trim().split(/\r?\n/);const version=await(await fetch('http://127.0.0.1:'+lines[0]+'/json/version')).json();await new Promise(resolve=>{const ws=new WebSocket(version.webSocketDebuggerUrl);let done=false;const finish=()=>{if(!done){done=true;resolve();}};ws.addEventListener('open',()=>{try{ws.send(JSON.stringify({id:9001,method:'Browser.close'}));}catch{}setTimeout(finish,300);},{once:true});ws.addEventListener('close',finish,{once:true});ws.addEventListener('error',finish,{once:true});setTimeout(finish,2000);});}catch{}}
try{
 await access(executable);
 await mkdir(evidence,{recursive:true});
 const p=await port(),base='http://127.0.0.1:'+p;
 host=spawn('dotnet',['run','--project',join(root,'src/Bluent.UI.Demo/Bluent.UI.Demo.csproj'),'--configuration','Debug','--no-build','--no-launch-profile','--urls',base],{cwd:root,windowsHide:true,stdio:'ignore'});
 await poll(async()=>{const r=await fetch(base+'/components/checkboxes');return r.status===200;},120000);
 browser=spawn(executable,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--disable-extensions','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
 const cdpPort=await poll(async()=>Number((await readFile(join(profile,'DevToolsActivePort'),'utf8')).trim().split(/\r?\n/)[0]),40000);
 const tabs=await(await fetch('http://127.0.0.1:'+cdpPort+'/json/list')).json();const tab=tabs.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);if(!tab)throw Error('No temporary browser page');
 socket=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((ok,no)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',no,{once:true});});
 socket.addEventListener('message',e=>{const v=JSON.parse(e.data),q=pending.get(v.id);if(q){pending.delete(v.id);v.error?q.no(Error(JSON.stringify(v.error))):q.ok(v.result||{});}});
 await call('Page.enable');await call('Runtime.enable');await call('DOM.enable');await call('Accessibility.enable');
 await call('Emulation.setDeviceMetricsOverride',{width:1280,height:960,deviceScaleFactor:1,mobile:false});
 const modes=[{name:'LIGHT-LTR',theme:'light',dir:'ltr',forced:false},{name:'DARK-RTL',theme:'dark',dir:'rtl',forced:false},{name:'FORCED-COLORS',theme:'light',dir:'ltr',forced:true}];
 for(const mode of modes){
  await call('Emulation.setEmulatedMedia',{features:mode.forced?[{name:'forced-colors',value:'active'},{name:'prefers-contrast',value:'more'}]:[]});
  for(const page of ['labels','links','badges']){
   await call('Page.navigate',{url:base+'/components/'+page});
   console.log(engine+' loading '+page+' '+mode.name+' url='+base+'/components/'+page);
   await waitFor(page==='labels'?'.bui-label':page==='links'?'.bui-link':'.bui-badge');
   const setup=await ensureUiMode(mode);
   await js('document.fonts.ready.then(()=>true)');
   setup.viewport=await js('({width:innerWidth,height:innerHeight})');
   check(mode.name+' '+page+' real header controls apply theme/direction and forced-colors media',setup.theme===mode.theme&&setup.dir===mode.dir&&setup.forced===mode.forced&&!!setup.themeBackground,setup);
   if(page==='checkboxes'){
    await js(`(()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Indeterminate');h?.nextElementSibling?.scrollIntoView({block:'center'});})()`);
    const before=await js(`(${snapshotCheckbox.toString()})()`);if(!before)throw Error('Indeterminate checkbox demo fixture not found');
    const ax=await axFor(`document.querySelector('h3') && [...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Indeterminate')?.nextElementSibling?.querySelector('input[type="checkbox"]')`);
    check(mode.name+' Checkbox mixed visual state exists',before.wrapperClass.split(/\s+/).includes('indeterminate'),before);
    check(mode.name+' Checkbox native input is not indeterminate and lacks mixed ARIA',before.indeterminate===false&&before.ariaChecked!=='mixed',before);
    check(mode.name+' Checkbox AX exposes checkbox role and computed label',ax?.[0]?.role==='checkbox'&&ax?.[0]?.name==='Indeterminate checkbox',ax);
    const image=await screenshot('CHECKBOX-'+mode.name);
    cases.push({page,mode:mode.name,setup,checkbox:{before,ax},screenshot:image});
    if(mode.name==='LIGHT-LTR'){
     const first=await js(`(()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Indeterminate');const i=h?.nextElementSibling?.querySelector('input[type="checkbox"]');i?.focus();return !!i&&document.activeElement===i})()`);
     check('Checkbox indeterminate fixture can receive native focus',first,before);
     await keypress(' ','Space',32);const after=await js(`(${snapshotCheckbox.toString()})()`);
     check('Native Space transitions indeterminate demo value to checked',after.checked===true&&after.wrapperClass.split(/\s+/).includes('checked')&&after.indeterminate===false,after);
     const switches=await js(`(${snapshotSwitch.toString()})()`);if(!switches.length)throw Error('Header Switch fixture not found');
     const switchAx=await axFor(`document.querySelector('.bui-switch input[type="checkbox"]')`);
     const initial=switches[0];
     check('Switch AX role is currently checkbox, not switch',switchAx?.[0]?.role==='checkbox',switchAx);
     check('Switch has a non-empty computed accessible name',!!switchAx?.[0]?.name,switchAx);
     await js(`(()=>{document.querySelector('.bui-switch input[type="checkbox"]')?.focus()})()`);
     await keypress(' ','Space',32);const toggled=(await js(`(${snapshotSwitch.toString()})()`))[0];
     check('Switch responds to native Space activation',toggled.checked!==initial.checked,toggled);
     await keypress(' ','Space',32);const restored=(await js(`(${snapshotSwitch.toString()})()`))[0];
     check('Switch can return to its initial state using native Space',restored.checked===initial.checked,restored);
     cases.push({page,mode:mode.name,switch:{before:initial,ax:switchAx,afterSpace:toggled,restored}});
    }
    }else if(page==='radios'){
    await js(`(()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Default');h?.nextElementSibling?.scrollIntoView({block:'center'});})()`);
    const before=await js(`(${snapshotRadios.toString()})()`);if(!before||before.options.length<2)throw Error('Default RadioGroup demo fixture not found');
    const groupAx=await axFor(`(()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Default');return h?.nextElementSibling?.querySelector('.items-list')?.parentElement})()`);
    const optionAx=[];for(const option of before.options){optionAx.push({id:option.id,ax:await axFor(`document.getElementById(${JSON.stringify(option.id)})`)});}
    check(mode.name+' RadioGroup options do not have a shared native name',before.options.every(x=>!x.name),before.options);
    check(mode.name+' RadioGroup wrapper is ignored in browser AX and has no group name',!before.groupRole&&!before.groupAriaLabel&&!before.groupLabelledBy&&!before.groupLabelFor&&!before.hasFieldset&&!before.hasLegend&&groupAx?.[0]?.role==='none'&&groupAx?.[0]?.ignored===true&&!groupAx?.[0]?.name,{before,groupAx});
    check(mode.name+' Radio options retain individual accessible names',optionAx.length===before.options.length&&optionAx.every((x,i)=>x.ax?.[0]?.role==='radio'&&x.ax?.[0]?.name===before.options[i].label),optionAx);
    const image=await screenshot('RADIOGROUP-'+mode.name);
    cases.push({page,mode:mode.name,setup,radioGroup:{before,groupAx,optionAx},screenshot:image});
    if(mode.name==='LIGHT-LTR'){
     await clickFirstRadio();
     const afterPointer=await js(`(${snapshotRadios.toString()})()`);
     check('Pointer activation selects first native radio and updates Blazor group',afterPointer.options[0].checked&&!afterPointer.options[1].checked,afterPointer.options);
     const firstId=afterPointer.options[0].id,secondId=afterPointer.options[1].id;
     await js(`document.getElementById(${JSON.stringify(firstId)})?.focus()`);
     await keypress('ArrowRight','ArrowRight',39);const afterArrow=await js(`(()=>({activeId:document.activeElement?.id,checked:[...document.querySelectorAll('h3 + section .items-list input[type="radio"]')].slice(0,2).map(x=>x.checked)}))()`);
     check('ArrowRight advances from the first radio to its second option',afterArrow.activeId===secondId&&afterArrow.checked[0]===false&&afterArrow.checked[1]===true,afterArrow);
     await js(`document.getElementById(${JSON.stringify(secondId)})?.focus()`);await keypress(' ','Space',32);const afterSpace=await js(`(${snapshotRadios.toString()})()`);
     check('Native Space on second option updates Blazor selection',afterSpace.options[1].checked&&!afterSpace.options[0].checked,afterSpace.options);
     const enumFirstId=await js(`(()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Enum');return h?.nextElementSibling?.querySelector('.items-list input[type="radio"]')?.id||null})()`);
     await js(`document.getElementById(${JSON.stringify(secondId)})?.focus()`);await keypress('ArrowRight','ArrowRight',39);const crossGroupArrow=await js(`(()=>({activeId:document.activeElement?.id,enumFirstId:${JSON.stringify(enumFirstId)},all:[...document.querySelectorAll('.items-list input[type="radio"]')].map(x=>({id:x.id,name:x.name,checked:x.checked,label:[...x.parentElement.querySelectorAll('label')].find(l=>l.htmlFor===x.id&&l.textContent.trim())?.textContent.trim()||''}))}))()`);crossGroupArrow.crossGroupArrowLeaked=crossGroupArrow.activeId===crossGroupArrow.enumFirstId;
     check('ArrowRight cross-group leakage is reproduced when radio names are empty',crossGroupArrow.crossGroupArrowLeaked&&crossGroupArrow.all.find(x=>x.id===secondId)?.checked===true&&crossGroupArrow.all.find(x=>x.id===enumFirstId)?.checked===true,crossGroupArrow);
     const tabObservation=await js(`(()=>{const inputs=[...document.querySelectorAll('h3 + section .items-list input[type="radio"]')].slice(0,2);inputs[0]?.focus();return {tabIndices:inputs.map(x=>x.tabIndex),ids:inputs.map(x=>x.id)}})()`);
     await keypress('Tab','Tab',9);const tabResult=await js('({activeId:document.activeElement?.id,activeTag:document.activeElement?.tagName})');
     check('Native Tab sequence records individual radio option stops',tabObservation.tabIndices.every(x=>x>=0)&&tabResult.activeId===secondId,{tabObservation,tabResult});
     cases.push({page,mode:mode.name,radioKeyboard:{afterPointer,afterArrow,afterSpace,crossGroupArrow,tabObservation,tabResult}});
    }
     }else if(page==='labels'){
      await js(`(()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Info');h?.scrollIntoView({block:'center'});})()`);
      const labelSnapshot=await js(`(()=>{const labels=[...document.querySelectorAll('label.bui-label')];const hReq=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Required');const req=hReq?.nextElementSibling?.querySelector('label.bui-label');const hInfo=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Info');const info=hInfo?.nextElementSibling?.querySelector('label.bui-label');const b=info?.querySelector('button');return {labels:labels.map(l=>({text:l.innerText.trim(),id:l.id,for:l.htmlFor,className:l.className,disabled:l.classList.contains('disabled')})),required:req?{text:req.innerText.trim(),for:req.htmlFor,targetExists:!!document.getElementById(req.htmlFor),className:req.className}:null,infoButton:b?{tag:b.tagName,ariaLabel:b.getAttribute('aria-label'),title:b.getAttribute('title'),text:b.innerText.trim(),tabIndex:b.tabIndex,type:b.type,className:b.className}:null};})()`);
      const infoExpression=`(()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Info');return h?.nextElementSibling?.querySelector('label.bui-label button')||null})()`;
      const infoAx=await axFor(infoExpression);
      check(mode.name+' Label default and required examples are present',labelSnapshot.labels.some(x=>x.text.includes('This is a label'))&&!!labelSnapshot.required,{labelSnapshot});
      check(mode.name+' Label Info trigger inherits unrelated label text as accessible name (gap reproduced)',!!labelSnapshot.infoButton&&infoAx?.[0]?.role==='button'&&infoAx?.[0]?.name==='This is a label',{infoButton:labelSnapshot.infoButton,infoAx});
      check(mode.name+' isolated Required label fixture has no matching target element',!!labelSnapshot.required&&!labelSnapshot.required.targetExists,labelSnapshot.required);
      const imageFile=await screenshot('LABEL-'+mode.name);cases.push({page,mode:mode.name,setup,labelSnapshot,infoAx,screenshot:imageFile});
     }else if(page==='links'){
      await js(`(()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Disable');h?.scrollIntoView({block:'center'});})()`);
      const linkSnapshot=await js(`(()=>{const get=(name)=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()===name);return h?.nextElementSibling?.querySelector('.bui-link')||null;};const map=e=>e?{tag:e.tagName,text:e.innerText.trim(),hrefAttribute:e.getAttribute('href'),type:e.getAttribute('type'),role:e.getAttribute('role'),ariaDisabled:e.getAttribute('aria-disabled'),disabledAttribute:e.hasAttribute('disabled'),tabIndex:e.tabIndex,className:e.className,rel:e.getAttribute('rel'),target:e.getAttribute('target')}:null;return {default:map(get('Default')),subtle:map(get('Subtle')),disabled:map(get('Disable'))};})()`);
      const defaultExpression=`(()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Default');return h?.nextElementSibling?.querySelector('.bui-link')||null})()`;
      const disabledExpression=`(()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Disable');return h?.nextElementSibling?.querySelector('.bui-link')||null})()`;
      const defaultAx=await axFor(defaultExpression),disabledAx=await axFor(disabledExpression);
      check(mode.name+' default and subtle links expose native anchors with text',linkSnapshot.default?.tag==='A'&&linkSnapshot.default?.hrefAttribute==='#'&&linkSnapshot.subtle?.tag==='A'&&linkSnapshot.subtle?.text==='Subtle link',{linkSnapshot,defaultAx});
      check(mode.name+' disabled Link is a focusable generic anchor with ignored disabled attr and no aria-disabled (gap reproduced)',linkSnapshot.disabled?.tag==='A'&&linkSnapshot.disabled.hrefAttribute===null&&linkSnapshot.disabled.ariaDisabled===null&&linkSnapshot.disabled.disabledAttribute===true&&linkSnapshot.disabled.tabIndex===0&&disabledAx?.[0]?.role==='generic'&&disabledAx?.[0]?.name==='',{disabled:linkSnapshot.disabled,disabledAx});
      const imageFile=await screenshot('LINK-'+mode.name);cases.push({page,mode:mode.name,setup,linkSnapshot,defaultAx,disabledAx,screenshot:imageFile});
     }else if(page==='badges'){
      await js(`(()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Color');h?.scrollIntoView({block:'center'});})()`);
      const badgeSnapshot=await js(`(()=>{const badges=[...document.querySelectorAll('.bui-badge')];const describe=e=>e?{tag:e.tagName,text:e.textContent.trim(),role:e.getAttribute('role'),ariaLabel:e.getAttribute('aria-label'),ariaLive:e.getAttribute('aria-live'),tabIndex:e.tabIndex,className:e.className,animationName:getComputedStyle(e).animationName,animationDuration:getComputedStyle(e).animationDuration,animationIterationCount:getComputedStyle(e).animationIterationCount,backgroundColor:getComputedStyle(e).backgroundColor,color:getComputedStyle(e).color}:null;return {count:badges.length,emptyBadge:describe(badges.find(e=>!e.textContent.trim())),countBadge:describe(badges.find(e=>e.textContent.trim()==='+99')),animatedBadge:describe(badges.find(e=>e.classList.contains('animated'))),prefersReducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};})()`);
      check(mode.name+' Badge count and animated-shadow fixtures are present',badgeSnapshot.count>0&&badgeSnapshot.countBadge?.text==='+99'&&badgeSnapshot.animatedBadge?.className.includes('animated'),badgeSnapshot);
      check(mode.name+' static count Badge is non-focusable and does not invent a role',badgeSnapshot.countBadge?.tag==='DIV'&&!badgeSnapshot.countBadge.role&&badgeSnapshot.countBadge.tabIndex<0,badgeSnapshot.countBadge);
      const imageFile=await screenshot('BADGE-'+mode.name);cases.push({page,mode:mode.name,setup,badgeSnapshot,screenshot:imageFile});
      if(mode.name==='LIGHT-LTR'){
       await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await wait(150);
       const reducedMotion=await js(`(()=>{const e=[...document.querySelectorAll('.bui-badge.animated')][0];const s=e?getComputedStyle(e):null;return {prefersReducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,animationName:s?.animationName||'none',animationDuration:s?.animationDuration||'0s',iterationCount:s?.animationIterationCount||'1',className:e?.className||''};})()`);
       check('Badge AnimateShadow remains animated under prefers-reduced-motion emulation (gap reproduced)',reducedMotion.prefersReducedMotion&&reducedMotion.animationName!=='none'&&reducedMotion.animationDuration!=='0s',reducedMotion);
       cases.push({page:'badges',mode:'REDUCED-MOTION',reducedMotion});await call('Emulation.setEmulatedMedia',{features:[]});
      }
     }else{

     await js(`(()=>{document.querySelector('.bui-otp-field > .otp')?.scrollIntoView({block:'center'});})()`);
     const before=await js(`(${snapshotOtp.toString()})()`);if(!before||before.cells.length!==4)throw Error('OTP Fields showcase fixture missing or unexpected cell count');
     const groupAx=await axFor(`document.querySelector('.bui-otp-field > .otp')`);
     const cellAx=[];for(const cell of before.cells){cellAx.push({index:cell.index,ax:await axFor(`document.querySelectorAll('.bui-otp-field .otp-cell-input')[${cell.index}]`)});}
     check(mode.name+' OTP group exposes group role and Verification code name',before.role==='group'&&before.ariaLabel==='Verification code'&&groupAx?.[0]?.role==='group'&&groupAx?.[0]?.name==='Verification code',{before,groupAx});
     check(mode.name+' OTP cells expose English positional labels and numeric one-time-code metadata',before.cells.every((x,i)=>x.ariaLabel===`Digit ${i+1} of 4`&&x.type==='text'&&x.inputMode==='numeric'&&x.autocomplete==='one-time-code'&&x.pattern==='\\d*'&&x.maxLength===1),before.cells);
     check(mode.name+' OTP browser AX exposes each cell as a named textbox',cellAx.length===4&&cellAx.every((x,i)=>x.ax?.[0]?.role==='textbox'&&x.ax?.[0]?.name===before.cells[i].ariaLabel),cellAx);
     check(mode.name+' OTP hidden bound input and displayed value start empty',before.hidden?.type==='hidden'&&before.hidden.value===''&&before.outputText==='OTP:',before);
     const image=await screenshot('OTP-'+mode.name);
     cases.push({page,mode:mode.name,setup,otp:{before,groupAx,cellAx},screenshot:image});
     if(mode.name==='LIGHT-LTR'){
      await js(`document.querySelectorAll('.bui-otp-field .otp-cell-input')[0]?.focus()`);await insertText('4');
      const afterFirst=await js(`(${snapshotOtp.toString()})()`);const activeAfterFirst=await js(`([...document.querySelectorAll('.bui-otp-field .otp-cell-input')].indexOf(document.activeElement))`);
      check('OTP typing one digit updates hidden binding and advances focus',afterFirst.cells[0].value==='4'&&afterFirst.hidden?.value==='4'&&afterFirst.outputText==='OTP: 4'&&activeAfterFirst===1,{afterFirst,activeAfterFirst});
      await insertText('2');const afterSecond=await js(`(${snapshotOtp.toString()})()`);const activeAfterSecond=await js(`([...document.querySelectorAll('.bui-otp-field .otp-cell-input')].indexOf(document.activeElement))`);
      check('OTP sequential typing updates two cells and bound value',afterSecond.cells[0].value==='4'&&afterSecond.cells[1].value==='2'&&afterSecond.hidden?.value==='42'&&afterSecond.outputText==='OTP: 42'&&activeAfterSecond===2,{afterSecond,activeAfterSecond});
      await js(`document.querySelectorAll('.bui-otp-field .otp-cell-input')[2]?.focus()`);await keypress('Backspace','Backspace',8);const afterBackspace=await js(`(${snapshotOtp.toString()})()`);const activeAfterBackspace=await js(`([...document.querySelectorAll('.bui-otp-field .otp-cell-input')].indexOf(document.activeElement))`);
      check('OTP Backspace on an empty cell clears the previous digit and moves focus back',afterBackspace.cells[0].value==='4'&&afterBackspace.cells[1].value===''&&afterBackspace.hidden?.value==='4'&&afterBackspace.outputText==='OTP: 4'&&activeAfterBackspace===1,{afterBackspace,activeAfterBackspace});
      const pasteEvent=await js(`(()=>{const first=document.querySelectorAll('.bui-otp-field .otp-cell-input')[0];const transfer=new DataTransfer();transfer.setData('text','7391');const event=new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:transfer});first.focus();first.dispatchEvent(event);return {defaultPrevented:event.defaultPrevented,clipboardText:event.clipboardData?.getData('text')||''}})()`);await wait(350);const afterPaste=await js(`(${snapshotOtp.toString()})()`);const activeAfterPaste=await js(`([...document.querySelectorAll('.bui-otp-field .otp-cell-input')].indexOf(document.activeElement))`);
      check('OTP synthetic paste distributes digits, updates hidden binding and focuses final cell',pasteEvent.defaultPrevented&&pasteEvent.clipboardText==='7391'&&afterPaste.cells.map(x=>x.value).join('')==='7391'&&afterPaste.hidden?.value==='7391'&&afterPaste.outputText==='OTP: 7391'&&activeAfterPaste===3,{pasteEvent,afterPaste,activeAfterPaste,syntheticClipboardEvent:true});
      await insertText('x');const afterInvalid=await js(`(${snapshotOtp.toString()})()`);
      check('OTP input handler strips non-digit text and updates bound value',afterInvalid.cells.map(x=>x.value).join('')==='739'&&afterInvalid.hidden?.value==='739'&&afterInvalid.outputText==='OTP: 739',{afterInvalid});
      await keypress('ArrowLeft','ArrowLeft',37);const activeAfterArrow=await js(`([...document.querySelectorAll('.bui-otp-field .otp-cell-input')].indexOf(document.activeElement))`);
      check('OTP ArrowLeft moves focus to the previous cell',activeAfterArrow===2,{activeAfterArrow});
      cases.push({page,mode:mode.name,otpKeyboard:{afterFirst,activeAfterFirst,afterSecond,activeAfterSecond,afterBackspace,activeAfterBackspace,pasteEvent,afterPaste,activeAfterPaste,afterInvalid,activeAfterArrow}});
     }
    }
  }
 }
 const result={issue:552,sourceRef,engine,host:'Bluent.UI.Demo WebAssembly, built from current task branch source with Debug configuration',scope:'Actual Chromium CDP DOM/AX-tree observations for Label, Link and Badge; forced-colors and reduced-motion are emulated; no native screen-reader or OS contrast certification; not Fluent parity acceptance.',createdAt:new Date().toISOString(),checks,cases,summary:{checks:checks.length,passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length,screenshots:cases.map(x=>x.screenshot).filter(Boolean)}};
 const file='BLUENT-LABEL-LINK-BADGE-'+engine.toUpperCase()+'.json';await writeFile(join(evidence,file),JSON.stringify(result,null,2)+'\n','utf8');
 console.log('SUMMARY '+JSON.stringify(result.summary));
 if(checks.some(x=>!x.pass))process.exitCode=1;
}catch(e){console.error('ERROR '+engine+' '+(e?.stack||e));process.exitCode=1;}
finally{
  try{socket?.close()}catch{}
  await closeBrowser();await terminate(browser);await terminate(host);await wait(350);
 try{await rm(profile,{recursive:true,force:true,maxRetries:10,retryDelay:250})}catch(e){console.error('Temporary browser profile cleanup failed: '+e.message);process.exitCode=1;}
}
