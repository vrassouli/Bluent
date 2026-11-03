// #552 Pure research tests: never count as live browser or component parity tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import {findFocusTarget as focus,rovingTabStops as stops,canActivate,KeyboardPolicyKeys} from './fixtures/focus-navigation-core-prototype.mjs';
const e=(id,o={})=>({id,visible:true,presentInDom:true,navigable:true,disabled:false,...o});
const four=()=>['a','b','c','d'].map(x=>e(x));
const move=(items,at,key,opts={})=>focus(items,at,key,opts);
const cases=[
['LTR next',()=>assert.equal(move(four(),'b','ArrowRight'),'c')],
['LTR previous',()=>assert.equal(move(four(),'b','ArrowLeft'),'a')],
['RTL next visual',()=>assert.equal(move(four(),'b','ArrowRight',{rtl:true}),'a')],
['RTL previous visual',()=>assert.equal(move(four(),'b','ArrowLeft',{rtl:true}),'c')],
['LTR left wrap',()=>assert.equal(move(four(),'a','ArrowLeft'),'d')],
['LTR right wrap',()=>assert.equal(move(four(),'d','ArrowRight'),'a')],
['RTL right wrap',()=>assert.equal(move(four(),'a','ArrowRight',{rtl:true}),'d')],
['RTL left wrap',()=>assert.equal(move(four(),'d','ArrowLeft',{rtl:true}),'a')],
['no wrap previous stays',()=>assert.equal(move(four(),'a','ArrowLeft',{wrap:false}),'a')],
['no wrap next stays',()=>assert.equal(move(four(),'d','ArrowRight',{wrap:false}),'d')],
['vertical Up',()=>assert.equal(move(four(),'b','ArrowUp',{axis:'vertical'}),'a')],
['vertical Down RTL unchanged',()=>assert.equal(move(four(),'b','ArrowDown',{axis:'vertical',rtl:true}),'c')],
['vertical wrap up',()=>assert.equal(move(four(),'a','ArrowUp',{axis:'vertical'}),'d')],
['vertical wrap down',()=>assert.equal(move(four(),'d','ArrowDown',{axis:'vertical'}),'a')],
['vertical does not handle right',()=>assert.equal(move(four(),'b','ArrowRight',{axis:'vertical'}),null)],
['horizontal does not handle down',()=>assert.equal(move(four(),'b','ArrowDown'),null)],
['Home LTR',()=>assert.equal(move(four(),'c','Home'),'a')],
['Home RTL boundary same',()=>assert.equal(move(four(),'c','Home',{rtl:true}),'a')],
['End RTL boundary same',()=>assert.equal(move(four(),'a','End',{rtl:true}),'d')],
['other native keys pass through',()=>{for(const k of ['Tab','Enter',' ','Escape'])assert.equal(move(four(),'a',k),null)}],
['disabled tab skipped',()=>assert.equal(move([e('a'),e('b',{disabled:true}),e('c')],'a','ArrowRight'),'c')],
['disabled menu can take arrow focus',()=>assert.equal(move([e('a'),e('b',{disabled:true}),e('c')],'a','ArrowRight',{disabledPolicy:'include-no-activate'}),'b')],
['disabled menu cannot activate',()=>assert.equal(canActivate(e('b',{disabled:true})),false)],
['enabled menu can activate',()=>assert.equal(canActivate(e('a')),true)],
['hidden and absent skipped',()=>assert.equal(move([e('a'),e('b',{visible:false}),e('c',{presentInDom:false}),e('d')],'a','ArrowRight'),'d')],
['non-navigable skipped',()=>assert.equal(move([e('a'),e('b',{navigable:false}),e('c')],'a','ArrowRight'),'c')],
['empty candidates null',()=>assert.equal(move([e('a',{visible:false})],'a','ArrowRight'),null)],
['prefer selected valid after removal',()=>assert.equal(move(four(),'gone','ArrowRight',{preferredId:'c'}),'c')],
['missing preferred falls back',()=>assert.equal(move(four(),'gone','ArrowLeft',{preferredId:'nope'}),'a')],
['nearest old index recovery',()=>assert.equal(move(four(),'gone','ArrowRight',{lastKnownIndex:2}),'c')],
['ties choose earlier',()=>assert.equal(move([e('a'),e('b',{visible:false}),e('c')],'gone','ArrowRight',{lastKnownIndex:1}),'a')],
['roving exactly one',()=>assert.deepEqual(stops(four(),'b','c'),{a:-1,b:0,c:-1,d:-1})],
['roving selected when focus missing',()=>assert.deepEqual(stops(four(),'gone','c'),{a:-1,b:-1,c:0,d:-1})],
['roving first surviving if both missing',()=>assert.deepEqual(stops([e('a',{disabled:true}),e('b')],'gone','gone'),{a:-1,b:0})],
['duplicate IDs rejected',()=>assert.throws(()=>move([e('a'),e('a')],'a','ArrowRight'),/Duplicate/)]
];
assert.equal(cases.length,35);
for(const [name,fn] of cases)test(name,fn);
