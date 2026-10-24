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
const root=resolve('.'),evidence=join(root,'docs/v3/quality/evidence'),profile=await mkdtemp(join(tmpdir(),'bluent552-control-semantics-'));
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
const screenshot=async name=>{const png=(await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true})).data;const file='BLUENT-CONTROL-SEMANTICS-'+engine.toUpperCase()+'-'+name+'.png';await writeFile(join(evidence,file),Buffer.from(png,'base64'));return file;};
async function terminate(child){if(!child?.pid)return;await new Promise(ok=>{const t=spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});t.once('close',ok);t.once('error',ok);});}
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
  for(const page of ['checkboxes','radios','fields']){
   await call('Page.navigate',{url:base+'/components/'+page});
   console.log(engine+' loading '+page+' '+mode.name+' url='+base+'/components/'+page);
   await waitFor(page==='checkboxes'?'h3 + section input[type="checkbox"]':page==='radios'?'h3 + section .items-list input[type="radio"]':'input[autocomplete="one-time-code"]');
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
 const result={issue:552,sourceRef,engine,host:'Bluent.UI.Demo WebAssembly, built from current task branch source with Debug configuration',scope:'Actual Chromium CDP DOM/AX-tree, pointer and keyboard observations; OTP paste path uses a synthetic ClipboardEvent, not the native OS clipboard; forced-colors is emulated; not Fluent parity acceptance, native OS contrast or screen-reader certification.',createdAt:new Date().toISOString(),checks,cases,summary:{checks:checks.length,passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length,screenshots:cases.map(x=>x.screenshot).filter(Boolean)}};
 const file='BLUENT-CONTROL-SEMANTICS-'+engine.toUpperCase()+'.json';await writeFile(join(evidence,file),JSON.stringify(result,null,2)+'\n','utf8');
 console.log('SUMMARY '+JSON.stringify(result.summary));
 if(checks.some(x=>!x.pass))process.exitCode=1;
}catch(e){console.error('ERROR '+engine+' '+(e?.stack||e));process.exitCode=1;}
finally{
 try{socket?.close()}catch{}
 await terminate(browser);await terminate(host);
 try{await rm(profile,{recursive:true,force:true,maxRetries:10,retryDelay:250})}catch(e){console.error('Temporary browser profile cleanup failed: '+e.message);process.exitCode=1;}
}
