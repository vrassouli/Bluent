#!/usr/bin/env node
// #552 focused native form-data probe for the current RadioGroup DOM.
// Uses a synthetic form association on actual rendered radio inputs; it does not submit a request,
// does not change product source, and is not native assistive-technology or full form-pipeline acceptance.
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,mkdir,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:net';
import {setTimeout as wait} from 'node:timers/promises';

const engine=(process.argv[2]||'chrome').toLowerCase();
if(!['chrome','edge'].includes(engine)) throw Error('Supported engines: chrome|edge');
const executable=engine==='chrome'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const root=resolve('.'),profile=await mkdtemp(join(tmpdir(),'bluent552-radio-form-'));
const out=join(root,'docs/v3/quality/evidence');
const sourceRef='73155f02';
let browser,host,socket,seq=0;const pending=new Map();
const port=()=>new Promise((ok,no)=>{const s=createServer();s.on('error',no);s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>ok(n));});});
const poll=async(fn,ms=60000)=>{const end=Date.now()+ms;while(Date.now()<end){try{const v=await fn();if(v)return v;}catch{}await wait(250);}throw Error('Timed out waiting for demo/browser startup');};
const call=(method,params={})=>new Promise((ok,no)=>{const id=++seq,t=setTimeout(()=>{pending.delete(id);no(Error(method+' timed out'));},20000);pending.set(id,{ok:v=>{clearTimeout(t);ok(v)},no:e=>{clearTimeout(t);no(e)}});socket.send(JSON.stringify({id,method,params}));});
const js=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value;};
async function terminate(child){if(!child?.pid)return;await new Promise(ok=>{const t=spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});t.once('close',ok);t.once('error',ok);});}

try{
 await access(executable);await mkdir(out,{recursive:true});
 const p=await port(),base='http://127.0.0.1:'+p;
 host=spawn('dotnet',['run','--project',join(root,'src/Bluent.UI.Demo/Bluent.UI.Demo.csproj'),'--configuration','Debug','--no-build','--no-launch-profile','--urls',base],{cwd:root,windowsHide:true,stdio:'ignore'});
 await poll(async()=>{const r=await fetch(base+'/components/radios');return r.status===200;},120000);
 browser=spawn(executable,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--disable-extensions','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
 const cdpPort=await poll(async()=>Number((await readFile(join(profile,'DevToolsActivePort'),'utf8')).trim().split(/\r?\n/)[0]),40000);
 const tabs=await(await fetch('http://127.0.0.1:'+cdpPort+'/json/list')).json();
 const tab=tabs.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);if(!tab)throw Error('No temporary browser page');
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((ok,no)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',no,{once:true});});
 socket.addEventListener('message',e=>{const v=JSON.parse(e.data),q=pending.get(v.id);if(q){pending.delete(v.id);v.error?q.no(Error(JSON.stringify(v.error))):q.ok(v.result||{});}});
 await call('Page.enable');await call('Runtime.enable');await call('DOM.enable');
 await call('Emulation.setDeviceMetricsOverride',{width:1280,height:960,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:base+'/components/radios'});
 await poll(()=>js("!![...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Default')?.nextElementSibling?.querySelector('.items-list input[type=radio]')"),60000);
 const expression = `(() => {
   const h=[...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Default');
   const group=h?.nextElementSibling?.querySelector('.items-list')?.parentElement;
   const inputs=[...(group?.querySelectorAll('input[type=radio]')||[])];
   if(inputs.length<2) throw new Error('Expected the two-option Default RadioGroup');
   const form=document.createElement('form');form.id='__radio-form-probe-'+Date.now();form.setAttribute('aria-hidden','true');form.style.cssText='position:absolute;left:-10000px;top:0';document.body.appendChild(form);
   const snapshot=()=>inputs.map((x,i)=>({index:i,id:x.id,nameAttribute:x.getAttribute('name'),nameProperty:x.name,valueAttribute:x.getAttribute('value'),valueProperty:x.value,checked:x.checked,disabled:x.disabled,formAttribute:x.getAttribute('form'),associatedForm:x.form?.id||null}));
   const data=()=>Array.from(new FormData(form).entries());
   const checks=[];
   for(let i=0;i<inputs.length;i++){inputs[i].setAttribute('form',form.id);inputs[i].checked=i===0;}
   const initial=snapshot(),initialData=data();
   checks.push({name:'default-name-omission',pass:inputs.every(x=>!x.name),observed:{inputs:initial,formData:initialData}});
   for(const x of inputs)x.setAttribute('name','choice');
   const namedOnly=snapshot(),namedOnlyData=data();
   checks.push({name:'native-default-value-when-only-name-is-present',pass:namedOnlyData.length===1&&namedOnlyData[0][0]==='choice'&&namedOnlyData[0][1]==='on'&&inputs.every(x=>x.getAttribute('value')===null),observed:{inputs:namedOnly,formData:namedOnlyData}});
   inputs[0].setAttribute('value','affirmative');inputs[1].setAttribute('value','negative');
   const explicitValue=snapshot(),explicitValueData=data();
   checks.push({name:'native-explicit-value-participates-in-FormData',pass:explicitValueData.length===1&&explicitValueData[0][0]==='choice'&&explicitValueData[0][1]==='affirmative',observed:{inputs:explicitValue,formData:explicitValueData}});
   const report={formId:form.id,groupText:group.firstElementChild?.textContent.trim()||'',checks,scope:'Browser FormData constructed from the actual rendered RadioGroup inputs, temporarily associated with a synthetic form through the native form attribute. The probe mutates only browser DOM attributes; it does not submit an HTTP request, prove a Blazor callback/validation pipeline, or provide native AT acceptance.'};
   form.remove();return report;
 })()`;
 const result=await js(expression);
 const output={issue:552,sourceRef,engine,host:'Bluent.UI.Demo WebAssembly, current task-branch build',createdAt:new Date().toISOString(),...result,summary:{checks:result.checks.length,passed:result.checks.filter(x=>x.pass).length,failed:result.checks.filter(x=>!x.pass).length}};
 await writeFile(join(out,'BLUENT-RADIOGROUP-FORM-'+engine.toUpperCase()+'.json'),JSON.stringify(output,null,2)+'\n','utf8');
 console.log(JSON.stringify(output,null,2));
 if(output.summary.failed)process.exitCode=1;
}catch(e){console.error('ERROR '+engine+' '+(e?.stack||e));process.exitCode=1;}
finally{try{socket?.close()}catch{}await terminate(browser);await terminate(host);try{await rm(profile,{recursive:true,force:true,maxRetries:10,retryDelay:250})}catch(e){console.error('Temporary browser profile cleanup failed: '+e.message);process.exitCode=1;}}
