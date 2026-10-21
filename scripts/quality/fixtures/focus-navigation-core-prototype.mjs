/**
 * #552 FocusNavigationCore research PROTOTYPE ONLY: NOT Bluent product code.
 * Pure focus indexing policy: no DOM, Blazor, ARIA, JS interop or handlers.
 * Horizontal RTL visual-order rule is unapproved until #420/#465 review.
 */
export const KeyboardPolicyKeys=Object.freeze({horizontal:['ArrowLeft','ArrowRight'],vertical:['ArrowUp','ArrowDown'],boundaries:['Home','End']});
const verify=items=>{
 if(!Array.isArray(items))throw new TypeError('entries must be an array');
 const ids=new Set();
 for(const item of items){
  if(!item||typeof item.id!=='string'||!item.id.trim())throw new TypeError('stable nonempty string ID required');
  if(ids.has(item.id))throw new Error('Duplicate focus ID: '+item.id);
  ids.add(item.id);
  for(const key of ['visible','presentInDom','navigable','disabled'])
   if(typeof item[key]!=='boolean')throw new TypeError(item.id+'.'+key+' must be boolean');
 }
};
const candidates=(entries,policy)=>{
 if(!['skip','include-no-activate'].includes(policy))throw new RangeError('Unknown disabled policy');
 return entries.filter(e=>e.visible&&e.presentInDom&&e.navigable&&(policy==='include-no-activate'||!e.disabled));
};
export function findFocusTarget(entries,currentId,key,opts={}){
 verify(entries);
 const {axis='horizontal',rtl=false,wrap=true,disabledPolicy='skip',preferredId=null,lastKnownIndex=null}=opts;
 if(!['horizontal','vertical'].includes(axis))throw new RangeError('Unknown axis');
 if(typeof rtl!=='boolean'||typeof wrap!=='boolean')throw new TypeError('rtl and wrap must be booleans');
 if(lastKnownIndex!==null&&(!Number.isInteger(lastKnownIndex)||lastKnownIndex<0))throw new RangeError('Invalid lastKnownIndex');
 const allowed=candidates(entries,disabledPolicy);
 if(!allowed.length)return null;
 if(key==='Home')return allowed[0].id;
 if(key==='End')return allowed.at(-1).id;
 let delta=0;
 if(axis==='horizontal')delta=key==='ArrowRight'?(rtl?-1:1):key==='ArrowLeft'?(rtl?1:-1):0;
 else delta=key==='ArrowDown'?1:key==='ArrowUp'?-1:0;
 if(!delta)return null;
 const current=allowed.findIndex(x=>x.id===currentId);
 if(current<0){
  if(allowed.some(x=>x.id===preferredId))return preferredId;
  if(lastKnownIndex!==null)return allowed.map(x=>({id:x.id,pos:entries.indexOf(x)})).sort((a,b)=>Math.abs(a.pos-lastKnownIndex)-Math.abs(b.pos-lastKnownIndex)||a.pos-b.pos)[0].id;
  return allowed[0].id;
 }
 let next=current+delta;
 if(next<0)next=wrap?allowed.length-1:current;
 if(next>=allowed.length)next=wrap?0:current;
 return allowed[next].id;
}
export function rovingTabStops(entries,focusedId,selectedId,{focusWithin=true}={}){
 if(typeof focusWithin!=='boolean')throw new TypeError('focusWithin must be boolean');
 verify(entries);const c=candidates(entries,'skip');
 // Research hypothesis: while focus is inside, keep the roving focus target;
 // after actual focus exit, prefer selected tab for the next Tab entry.
 // Do NOT assume this policy is approved Fluent parity.
 const preference=focusWithin?[focusedId,selectedId]:[selectedId,focusedId];
 const chosen=preference.find(id=>c.some(x=>x.id===id))??c[0]?.id;
 return Object.fromEntries(entries.map(x=>[x.id,x.id===chosen?0:-1]));
}

export function canActivate(e){
 if(!e||typeof e!=='object')throw new TypeError('Focus entry required');
 return e.visible===true&&e.presentInDom===true&&e.navigable===true&&e.disabled===false;
}
