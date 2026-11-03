// #552 Wave I pure research fixture: not an application or Fluent parity test.
import test from 'node:test';
import assert from 'node:assert/strict';
import {FocusLifecycleResearch as Scope} from './fixtures/focus-lifecycle-prototype.mjs';
const e=(id,flags={})=>({id,visible:true,presentInDom:true,navigable:true,disabled:false,...flags});
const scope=()=>new Scope([e('a'),e('b'),e('c')],{selectedId:'a',triggerId:'trigger'});
const tests=[
['selected reentry default',()=>assert.equal(scope().tabStop(),'a')],
['focusin owns current focus stop',()=>{const s=scope();s.focusIn('b');assert.equal(s.tabStop(),'b')}],
['focusout internal not exterior',()=>{const s=scope();s.focusIn('b');assert.equal(s.focusOut({relatedWithin:true}),'internal');assert.equal(s.tabStop(),'b')}],
['focusout external prioritizes selected reentry',()=>{const s=scope();s.focusIn('b');s.focusOut({relatedWithin:false});assert.equal(s.tabStop(),'a')}],
['unknown focusout requests settle',()=>{const s=scope();s.focusIn('b');assert.equal(s.focusOut({}),'needs-active-element-check');assert.equal(s.unknownExit,true)}],
['unknown exit internal settle preserves b',()=>{const s=scope();s.focusIn('b');s.focusOut({});assert.equal(s.settle({activeWithin:true,activeId:'b'}),true);assert.equal(s.tabStop(),'b')}],
['unknown exit external settle restores selected',()=>{const s=scope();s.focusIn('b');s.focusOut({});s.settle({activeWithin:false,activeId:null});assert.equal(s.tabStop(),'a')}],
['settle without pending unknown is no-op',()=>assert.equal(scope().settle({activeWithin:false}),false)],
['disabled cannot take focusin',()=>{const s=scope();s.updateItems([e('a'),e('b',{disabled:true}),e('c')]);assert.equal(s.focusIn('b'),false)}],
['removed focused id falls back selected without auto focus',()=>{const s=scope();s.focusIn('b');s.updateItems([e('a'),e('c')]);assert.equal(s.focusedId,null);assert.equal(s.inside,false);assert.equal(s.tabStop(),'a')}],
['removed selected id falls back first survivor',()=>{const s=scope();s.updateItems([e('c'),e('b')]);assert.equal(s.tabStop(),'c')}],
['empty entries no synthetic focus stop',()=>{const s=scope();s.updateItems([]);assert.equal(s.tabStop(),null)}],
['hidden focused falls back without forcing focus',()=>{const s=scope();s.focusIn('b');s.updateItems([e('a'),e('b',{visible:false}),e('c')]);assert.equal(s.tabStop(),'a')}],
['unmounted focused falls back',()=>{const s=scope();s.focusIn('b');s.updateItems([e('a'),e('b',{presentInDom:false}),e('c')]);assert.equal(s.tabStop(),'a')}],
['request returns ticket from current epoch',()=>{const s=scope();let t=s.request('b');assert.equal(t.epoch,0);assert.equal(t.kind,'move')}],
['request refuses unknown id',()=>assert.equal(scope().request('missing'),null)],
['request refuses disabled',()=>{const s=scope();s.updateItems([e('a'),e('b',{disabled:true}),e('c')]);assert.equal(s.request('b'),null)}],
['postrender approval requires actual connected node',()=>{const s=scope();const t=s.request('b');assert.equal(s.authorize(t,{ownerHasFocus:true,connected:false}),false)}],
['postrender approval requires focus ownership',()=>{const s=scope();const t=s.request('b');assert.equal(s.authorize(t,{ownerHasFocus:false,connected:true}),false)}],
['postrender approval refuses user focus change',()=>{const s=scope();const t=s.request('b');assert.equal(s.authorize(t,{ownerHasFocus:true,connected:true,userMovedFocus:true}),false)}],
['postrender approval works when stable and connected',()=>{const s=scope();const t=s.request('b');assert.equal(s.authorize(t,{ownerHasFocus:true,connected:true}),true)}],
['no reuse of consumed ticket',()=>{const s=scope();const t=s.request('b');s.authorize(t,{ownerHasFocus:true,connected:true});assert.equal(s.authorize(t,{ownerHasFocus:true,connected:true}),false)}],
['focusin invalidates queued focus ticket',()=>{const s=scope();const t=s.request('b');s.focusIn('a');assert.equal(s.authorize(t,{ownerHasFocus:true,connected:true}),false)}],
['removal invalidates queued focus ticket',()=>{const s=scope();const t=s.request('b');s.updateItems([e('a'),e('c')]);assert.equal(s.authorize(t,{ownerHasFocus:true,connected:true}),false)}],
['newer request invalidates prior ticket',()=>{const s=scope();const a=s.request('b');const b=s.request('c');assert.equal(s.authorize(a,{ownerHasFocus:true,connected:true}),false);assert.equal(s.authorize(b,{ownerHasFocus:true,connected:true}),true)}],
['closing popup cancels move requests',()=>{const s=scope();const t=s.request('b');s.closePopup({activeInPopup:true});assert.equal(s.authorize(t,{ownerHasFocus:true,connected:true}),false)}],
['close with popup focus may propose restore',()=>{const s=scope();const t=s.closePopup({activeInPopup:true});assert.equal(t.kind,'restore');assert.equal(t.id,'trigger')}],
['close after focus left popup never restores',()=>assert.equal(scope().closePopup({activeOutside:true}),null)],
['close when focus not in popup never restores',()=>assert.equal(scope().closePopup({activeInPopup:false}),null)],
['restore requires connected trigger',()=>{const s=scope();const t=s.closePopup({activeInPopup:true});assert.equal(s.authorizeRestore(t,{focusStillOrphaned:true,triggerConnected:false}),false)}],
['restore requires no unrelated new focus',()=>{const s=scope();const t=s.closePopup({activeInPopup:true});assert.equal(s.authorizeRestore(t,{focusStillOrphaned:true,triggerConnected:true,userMovedFocus:true}),false)}],
['restore requires orphaned focus',()=>{const s=scope();const t=s.closePopup({activeInPopup:true});assert.equal(s.authorizeRestore(t,{focusStillOrphaned:false,triggerConnected:true}),false)}],
['restore succeeds only for safe trigger',()=>{const s=scope();const t=s.closePopup({activeInPopup:true});assert.equal(s.authorizeRestore(t,{focusStillOrphaned:true,triggerConnected:true}),true)}],
['restore consumed once',()=>{const s=scope();const t=s.closePopup({activeInPopup:true});s.authorizeRestore(t,{focusStillOrphaned:true,triggerConnected:true});assert.equal(s.authorizeRestore(t,{focusStillOrphaned:true,triggerConnected:true}),false)}],
['dispose prevents stale move',()=>{const s=scope();const t=s.request('a');s.dispose();assert.equal(s.authorize(t,{connected:true,ownerHasFocus:true}),false)}],
['dispose prevents stale restore',()=>{const s=scope();const t=s.closePopup({activeInPopup:true});s.dispose();assert.equal(s.authorizeRestore(t,{triggerConnected:true,focusStillOrphaned:true}),false)}],
['disposed ignores focusin',()=>{const s=scope();s.dispose();assert.equal(s.focusIn('a'),false)}],
['disposed ignores updates',()=>{const s=scope();s.dispose();assert.equal(s.updateItems([e('a')]),false)}],
['focusout after dispose ignored',()=>{const s=scope();s.dispose();assert.equal(s.focusOut({relatedWithin:false}),'ignored')}],
['close idempotent',()=>{const s=scope();s.closePopup({activeInPopup:true});assert.equal(s.closePopup({activeInPopup:true}),null)}],
['missing selected reentry prefers surviving last focus ID',()=>{const s=scope();s.focusIn('b');s.focusOut({relatedWithin:false});s.selectedId='gone';assert.equal(s.tabStop(),'b')}],
['unknown focusout canceled by a subsequent real focusin',()=>{const s=scope();s.focusIn('a');s.focusOut({});s.focusIn('b');assert.equal(s.unknownExit,false);assert.equal(s.settle({activeWithin:false}),false);assert.equal(s.tabStop(),'b')}],
];
assert.equal(tests.length,42);
for(const [name,fn] of tests)test(name,fn);
