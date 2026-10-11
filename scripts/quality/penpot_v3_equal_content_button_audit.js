// Read-only actual Penpot comparison; run through Penpot execute_code.
// This verifies explicitly matching LABEL, ICON SLOT, geometry, and colors.
// Segoe UI is unavailable to the local editable fixture; icon vector
// primitive is deliberately NOT claimed to match the source icon path.
if(penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")throw Error("Wrong Penpot file");
const page=penpotUtils.getPageByName("24 · Button equal-content comparison");
const board=page?.getShapeById("e31294c6-7c55-805f-8008-c5afb988d983");
const localSet=page?.getShapeById("e31294c6-7c55-805f-8008-c5af7f698c58");
const upstreamFamily=penpot.library.connected.find(l=>l.name==="Microsoft Fluent 2 Web (Community)")?.components.find(c=>c.name==="Button");
if(!board||!localSet?.isVariantContainer()||!upstreamFamily)throw Error("Missing parity families");
const ref=upstreamFamily.variants.variantComponents(),local=localSet.variants.variantComponents();
const styles=[["Secondary (Default)","Secondary"],["Primary","Primary"],["Outline","Outline"],["Subtle","Subtle"],["Transparent","Transparent"]];
const states=["Rest","Disabled"],errors=[],results=[];let checks=0;
const approx=(a,b,label)=>{checks++;if(Math.abs(a-b)>0.75)errors.push(label+": "+a+" vs "+b);};
const eq=(a,b,label)=>{checks++;if(a!==b)errors.push(label+": "+String(a)+" vs "+String(b));};
const color=s=>typeof s==="string"?s.toLowerCase():null;
const find=(shape,name)=>shape?.children?.find(x=>x.name===name);
const findText=(root)=>{const stack=[root];while(stack.length){const s=stack.pop();if(s.type==="text"&&s.name==="Text")return s;stack.push(...(s.children||[]));}return null;};
const sourceIds=new Set(ref.map(x=>x.id)),localIds=new Set(local.map(x=>x.id));
for(const [u,l] of styles)for(const state of states){
 const a=ref.find(c=>c.variantProps.Layout==="Icon and label (Default)"&&c.variantProps.Size==="Medium (Default)"&&c.variantProps.State===state&&c.variantProps.Style===u);
 const b=local.find(c=>c.variantProps.Appearance===l&&c.variantProps.State===state);
 if(!a||!b){errors.push("Missing source/local "+l+"/"+state);continue;}
 const ra=a.mainInstance(),rb=b.mainInstance(),at=findText(ra),bt=find(rb,"Text / 14px equal-content"),ai=find(ra,"Placeholder"),bi=find(rb,"Icon slot 20x20"),av=find(ai,"Shape"),bv=find(bi,"Fluent glyph path / editable local copy"),border=find(rb,"Border / editable");
 const linkA=find(board,"CONTROLLED LINK · UPSTREAM · "+l+" · "+state),linkB=find(board,"CONTROLLED LINK · LOCAL · "+l+" · "+state);
 if(!at||!bt||!ai||!bi||!av||!bv||!border){errors.push("Missing anatomy "+l+"/"+state);continue;}
 eq(linkA?.isComponentInstance()&&sourceIds.has(linkA.component()?.id)&&linkA.component()?.id===a.id,true,"Imported link "+l+state);
 eq(linkB?.isComponentInstance()&&localIds.has(linkB.component()?.id)&&linkB.component()?.id===b.id,true,"Owned link "+l+state);
 eq(at.characters,bt.characters,"same-copy "+l+state);
 approx(ra.width,rb.width,"root width "+l+state);approx(ra.height,rb.height,"root height "+l+state);
 approx((at.x-ra.x),(bt.x-rb.x),"label x "+l+state);approx((at.y-ra.y),(bt.y-rb.y),"label y "+l+state);
 approx(at.width,bt.width,"label w "+l+state);approx(at.height,bt.height,"label h "+l+state);
 approx((ai.x-ra.x),(bi.x-rb.x),"icon slot x "+l+state);approx((ai.y-ra.y),(bi.y-rb.y),"icon slot y "+l+state);
 approx(ai.width,bi.width,"icon slot w "+l+state);approx(ai.height,bi.height,"icon slot h "+l+state);
 approx(av.width,bv.width,"icon shape w "+l+state);approx(av.height,bv.height,"icon shape h "+l+state);
 approx((av.x-ra.x),(bv.x-rb.x),"icon actual x "+l+state);approx((av.y-ra.y),(bv.y-rb.y),"icon actual y "+l+state);
 eq(color(ra.fills?.[0]?.fillColor),color(rb.fills?.[0]?.fillColor),"same background "+l+state);
 eq(color(ra.strokes?.[0]?.strokeColor),color(border.strokes?.[0]?.strokeColor),"same border "+l+state);
 eq(color(at.fills?.[0]?.fillColor),color(bt.fills?.[0]?.fillColor),"same label color "+l+state);
 eq(color(av.fills?.[0]?.fillColor),color(bv.fills?.[0]?.fillColor),"same icon color "+l+state);
 eq(av.type,bv.type,"exact icon element type "+l+state);
 const normalizedPath=path=>path.commands.map(command=>({command:command.command,coords:Object.entries(command.params).map(([key,value])=>[key,+(value-(/y/i.test(key)?path.y:path.x)).toFixed(3)])}));
 eq(JSON.stringify(normalizedPath(av)),JSON.stringify(normalizedPath(bv)),"vector-path topology/coordinates "+l+state);
 results.push({style:l,state,label:bt.characters,sourceFont:at.fontFamily,localFont:bt.fontFamily,
   sourceIconType:av.type,localIconType:bv.type,face:[rb.width,rb.height],
   importedLinked:true,nativeFixtureLinked:true});
}
eq(local.length,10,"native parity fixture variant count");
eq(results.length,10,"complete 10 pairs");
eq(new Set(local.map(x=>x.variantProps.Appearance+"/"+x.variantProps.State)).size,10,"unique native fixture axes");
return {fileId:penpot.currentFile.id,revision:penpot.currentFile.revn,
 nativeFixtureContainer:localSet.id,comparisonBoard:board.id,
 exactPairs:results.length,checks,errors,pass:errors.length===0,
 copyMismatches:results.filter(x=>x.label!=="Button").length,
 fontFamilyMismatches:results.filter(x=>x.sourceFont!==x.localFont).length,
 vectorTypeDifferences:results.filter(x=>x.sourceIconType!==x.localIconType).length,
 parityApproved:false,
 limitations:["Source Segoe UI vs owned Inter fallback","Editable exact native copy of the original Fluent vector path; original reference remains untouched","Only Medium icon+label Rest and Disabled visual states; no browser accessibility certification"],
 sample:results[0]};