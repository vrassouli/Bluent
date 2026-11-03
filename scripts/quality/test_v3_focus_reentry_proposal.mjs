// #552 research only: these are pure policy tests, not real Blazor/OS AT evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {rovingTabStops,findFocusTarget} from './fixtures/focus-navigation-core-prototype.mjs';
const entry=(id,flags={})=>({id,visible:true,presentInDom:true,navigable:true,disabled:false,...flags});
const tabs=()=>[entry('one'),entry('two'),entry('three')];
test('manual activation keeps arrow focus separate from selected tab',()=>{
 const next=findFocusTarget(tabs(),'one','ArrowRight');
 assert.equal(next,'two');
 assert.deepEqual(rovingTabStops(tabs(),next,'one',{focusWithin:true}),{one:-1,two:0,three:-1});
});
test('native Tab reentry proposal prioritizes selected tab over previous focus',()=>{
 assert.deepEqual(rovingTabStops(tabs(),'two','one',{focusWithin:false}),{one:0,two:-1,three:-1});
});
test('commit manual selection changes next Tab reentry to new selected ID',()=>{
 assert.deepEqual(rovingTabStops(tabs(),'one','three',{focusWithin:false}),{one:-1,two:-1,three:0});
});
test('disabled selected tab cannot stay reentry stop',()=>{
 const t=[entry('one',{disabled:true}),entry('two'),entry('three')];
 assert.deepEqual(rovingTabStops(t,'two','one',{focusWithin:false}),{one:-1,two:0,three:-1});
});
test('hidden selected and unmounted remembered focus fall back to survivor',()=>{
 const t=[entry('one',{presentInDom:false}),entry('two',{visible:false}),entry('three')];
 assert.deepEqual(rovingTabStops(t,'two','one',{focusWithin:false}),{one:-1,two:-1,three:0});
});
test('all disabled gives no fabricated roving entry',()=>{
 assert.deepEqual(rovingTabStops([entry('one',{disabled:true})],'one','one',{focusWithin:false}),{one:-1});
});
test('focusWithin requires boolean not a string',()=>{
 assert.throws(()=>rovingTabStops(tabs(),'two','one',{focusWithin:'false'}),/focusWithin must be boolean/);
});
test('stable ID retains selected tab despite reorder',()=>{
 const reordered=[entry('three'),entry('one'),entry('two')];
 assert.deepEqual(rovingTabStops(reordered,'two','one',{focusWithin:false}),{three:-1,one:0,two:-1});
});
