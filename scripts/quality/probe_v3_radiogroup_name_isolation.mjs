#!/usr/bin/env node
// #552 audit-only probe for native radio name isolation on actual Bluent demo DOM.
// Names are injected into the temporary browser DOM only; this is not a product/API test or AT acceptance.
import {spawn} from "node:child_process";
import {mkdtemp,readFile,writeFile,mkdir,rm,access} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {createServer} from "node:net";
import {setTimeout as wait} from "node:timers/promises";

const engine=(process.argv[2]||"chrome").toLowerCase();
if(!["chrome","edge"].includes(engine)) throw Error("Supported engines: chrome|edge");
const executable=engine==="chrome"?"C:/Program Files/Google/Chrome/Application/chrome.exe":"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const root=resolve("."), evidence=join(root,"docs/v3/quality/evidence"), profile=await mkdtemp(join(tmpdir(),"bluent552-radio-name-"));
const sourceRef="73155f02";
let browser,host,socket,seq=0;
const pending=new Map(),checks=[];
const port=()=>new Promise((ok,no)=>{const s=createServer();s.on("error",no);s.listen(0,"127.0.0.1",()=>{const n=s.address().port;s.close(()=>ok(n));});});
const poll=async(fn,ms=60000)=>{const end=Date.now()+ms;while(Date.now()<end){try{const v=await fn();if(v)return v;}catch{}await wait(250);}throw Error("Timed out waiting for demo/browser startup");};
const call=(method,params={})=>new Promise((ok,no)=>{const id=++seq,t=setTimeout(()=>{pending.delete(id);no(Error(method+" timed out"));},20000);pending.set(id,{ok:v=>{clearTimeout(t);ok(v)},no:e=>{clearTimeout(t);no(e)}});socket.send(JSON.stringify({id,method,params}));});
const js=async expression=>{const r=await call("Runtime.evaluate",{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value;};
const check=(name,pass,observed)=>{checks.push({name,pass:!!pass,observed});console.log(engine+" "+(pass?"PASS ":"FAIL ")+name);};
async function terminate(child){if(!child?.pid)return;await new Promise(ok=>{const t=spawn("taskkill",["/PID",String(child.pid),"/T","/F"],{windowsHide:true,stdio:"ignore"});t.once("close",ok);t.once("error",ok);});}
const keypress=async(key,code,vk)=>{const p={key,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk};await call("Input.dispatchKeyEvent",{type:"keyDown",...p});await call("Input.dispatchKeyEvent",{type:"keyUp",...p});await wait(300);};
const clickAt=async box=>{await call("Input.dispatchMouseEvent",{type:"mouseMoved",x:box.x,y:box.y});await call("Input.dispatchMouseEvent",{type:"mousePressed",x:box.x,y:box.y,button:"left",clickCount:1});await call("Input.dispatchMouseEvent",{type:"mouseReleased",x:box.x,y:box.y,button:"left",clickCount:1});await wait(400);};
try {
  await access(executable); await mkdir(evidence,{recursive:true});
  const p=await port(),base="http://127.0.0.1:"+p;
  host=spawn("dotnet",["run","--project",join(root,"src/Bluent.UI.Demo/Bluent.UI.Demo.csproj"),"--configuration","Debug","--no-build","--no-launch-profile","--urls",base],{cwd:root,windowsHide:true,stdio:"ignore"});
  await poll(async()=>{const r=await fetch(base+"/components/radios");return r.status===200;},120000);
  browser=spawn(executable,["--headless=new","--no-sandbox","--disable-gpu","--no-first-run","--disable-extensions","--remote-debugging-port=0","--remote-allow-origins=*","--user-data-dir="+profile,"about:blank"],{windowsHide:true,stdio:"ignore"});
  const cdpPort=await poll(async()=>Number((await readFile(join(profile,"DevToolsActivePort"),"utf8")).trim().split(/\r?\n/)[0]),40000);
  const tabs=await(await fetch("http://127.0.0.1:"+cdpPort+"/json/list")).json();
  const tab=tabs.find(x=>x.type==="page"&&x.webSocketDebuggerUrl);if(!tab)throw Error("No temporary browser page");
  socket=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((ok,no)=>{socket.addEventListener("open",ok,{once:true});socket.addEventListener("error",no,{once:true});});
  socket.addEventListener("message",e=>{const v=JSON.parse(e.data),q=pending.get(v.id);if(q){pending.delete(v.id);v.error?q.no(Error(JSON.stringify(v.error))):q.ok(v.result||{});}});
  await call("Page.enable");await call("Runtime.enable");await call("DOM.enable");
  await call("Emulation.setDeviceMetricsOverride",{width:1280,height:960,deviceScaleFactor:1,mobile:false});
  await call("Page.navigate",{url:base+"/components/radios"});
  await poll(()=>js("!![...document.querySelectorAll('h3')].find(x=>x.textContent.trim()==='Default')?.nextElementSibling?.querySelector('.items-list input[type=radio]')"),60000);
  const groupSnapshot=()=>{const get=heading=>{const h=[...document.querySelectorAll("h3")].find(x=>x.textContent.trim()===heading);const group=h?.nextElementSibling?.querySelector(".items-list")?.parentElement;const inputs=[...(group?.querySelectorAll('input[type="radio"]')||[])];return {heading,groupText:group?.firstElementChild?.textContent.trim()||"",inputs:inputs.map(x=>({id:x.id,name:x.name,checked:x.checked,disabled:x.disabled,label:[...(group?.querySelectorAll("label")||[])].find(l=>l.htmlFor===x.id)?.textContent.trim()||""}))};};return {activeId:document.activeElement?.id,default:get("Default"),enum:get("Enum")};};
  const initial=await js("("+groupSnapshot.toString()+")()");
  if(initial.default.inputs.length<2||initial.enum.inputs.length<2)throw Error("Expected Default and Enum RadioGroup fixtures");
  check("default-options-start-without-native-names",initial.default.inputs.every(x=>x.name===""),initial.default);
  check("adjacent-demo-groups-start-without-native-names",initial.enum.inputs.every(x=>x.name===""),initial.enum);
  const assignments={default:initial.default.inputs.map(x=>x.id),enum:initial.enum.inputs.map(x=>x.id)};
  const injected=await js("(()=>{const a="+JSON.stringify(assignments)+";for(const id of a.default)document.getElementById(id)?.setAttribute('name','__probe_default_group');for(const id of a.enum)document.getElementById(id)?.setAttribute('name','__probe_enum_group');return ("+groupSnapshot.toString()+")();})()");
  check("temporary-distinct-name-per-group-is-applied",injected.default.inputs.every(x=>x.name==="__probe_default_group")&&injected.enum.inputs.every(x=>x.name==="__probe_enum_group"),injected);
  const firstId=injected.default.inputs[0].id,secondId=injected.default.inputs[1].id;
  const firstLabelBox=await js("(()=>{const id="+JSON.stringify(firstId)+";const l=[...document.querySelectorAll('label')].find(x=>x.htmlFor===id);if(!l)return null;l.scrollIntoView({block:'center'});const r=l.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()");
  if(!firstLabelBox)throw Error("Could not locate real label for first Default radio");
  await clickAt(firstLabelBox);
  const afterLabel=await js("("+groupSnapshot.toString()+")()");
  check("label-activation-selects-and-focuses-first-radio",afterLabel.default.inputs[0].checked&&!afterLabel.default.inputs[1].checked&&afterLabel.default.inputs[0].id===afterLabel.activeId,afterLabel);
  const secondLabelBox=await js("(()=>{const id="+JSON.stringify(secondId)+";const l=[...document.querySelectorAll('label')].find(x=>x.htmlFor===id);if(!l)return null;l.scrollIntoView({block:'center'});const r=l.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()");
  if(!secondLabelBox)throw Error("Could not locate real label for second Default radio");
  await clickAt(secondLabelBox);
  await js("document.getElementById("+JSON.stringify(secondId)+")?.focus()");
  const beforeArrow=await js("("+groupSnapshot.toString()+")()");
  const enumBefore=beforeArrow.enum.inputs.map(x=>x.checked);
  await keypress("ArrowRight","ArrowRight",39);
  const afterArrow=await js("(()=>{const groups=("+groupSnapshot.toString()+")();return {activeId:document.activeElement?.id,groups};})()");
  check("ArrowRight-wraps-within-the-named-default-group",afterArrow.activeId===firstId&&afterArrow.groups.default.inputs[0].checked&&!afterArrow.groups.default.inputs[1].checked,afterArrow);
  check("ArrowRight-does-not-select-or-focus-the-adjacent-enum-group",!assignments.enum.includes(afterArrow.activeId)&&JSON.stringify(afterArrow.groups.enum.inputs.map(x=>x.checked))===JSON.stringify(enumBefore),{enumBefore,after:afterArrow.groups.enum.inputs.map(x=>x.checked),activeId:afterArrow.activeId,enumIds:assignments.enum});
  const output={issue:552,sourceRef,engine,host:"Bluent.UI.Demo WebAssembly; current task-branch Debug build",createdAt:new Date().toISOString(),scope:"Actual rendered Default and Enum RadioGroup controls in the demo. The probe first records the missing native names, then injects distinct group names into the temporary browser DOM, uses real CDP pointer clicks on actual associated labels, and dispatches a real browser ArrowRight key event. This isolates the effect of native names only; it does not prove the Bluent public API offers a group name, does not mutate product source or send network requests, and is not native assistive-technology acceptance.",initial,injected,afterLabel,beforeArrow,afterArrow,summary:{checks:checks.length,passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length},checks};
  await writeFile(join(evidence,"BLUENT-RADIOGROUP-NAME-ISOLATION-"+engine.toUpperCase()+".json"),JSON.stringify(output,null,2)+"\n","utf8");
  console.log("SUMMARY "+JSON.stringify(output.summary));if(output.summary.failed)process.exitCode=1;
} catch(e) {console.error("ERROR "+engine+" "+(e?.stack||e));process.exitCode=1;}
finally {try{socket?.close()}catch{}await terminate(browser);await terminate(host);try{await rm(profile,{recursive:true,force:true,maxRetries:10,retryDelay:250})}catch(e){console.error("Temporary profile cleanup failed: "+e.message);process.exitCode=1;}}
