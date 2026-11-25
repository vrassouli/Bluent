// Run through connected Penpot on the dedicated Bluent v3 Design System file.
// 20 static Penpot brand swatches must match CSS source-palette snapshot.
// This is not a switchable 10-brand Penpot theme implementation.
if(penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")throw Error("Wrong Penpot");
const p=penpotUtils.getPageByName("28 · Ten brands Light Dark matrix · #418");
const b=p?.getShapeById("acf5f619-7d81-80da-8008-c5cce3bd4593");
if(!b)throw Error("Missing matrix board");
const entries=[["default","#1267B4","#18599B"],["excel","#11783F","#146938"],["office","#B53406","#9C2F09"],["outlook","#1267B5","#18599C"],["powerapps","#8D4D8B","#823C81"],["powerbi","#7A6519","#6B5818"],["powerpoint","#B0391A","#983318"],["stream","#BD1D49","#A41B3F"],["teams","#5659BA","#4B4D9F"],["word","#2F61C1","#1A54B0"]];
const errors=[];let checks=0;
for(const [brand,light,dark] of entries){for(const [mode,hex] of [["light",light],["dark",dark]]){
 const s=b.children.find(x=>x.name==="Swatch "+brand+" / "+mode);
 const t=b.children.find(x=>x.name==="Value "+brand+" / "+mode);
 if(!s||!t){errors.push("Missing "+brand+"/"+mode);continue}
 checks+=3;
 if(s.fills?.[0]?.fillColor?.toUpperCase()!==hex)errors.push("Swatch mismatch "+brand+"/"+mode);
 if(t.characters!==hex)errors.push("Value label mismatch "+brand+"/"+mode);
 if(s.width!==145||s.height!==52)errors.push("Swatch dimensions mismatch "+brand+"/"+mode);
}}
return{file:penpot.currentFile.id,revision:penpot.currentFile.revn,pass:errors.length===0,errors,checks,
 sourceBrands:entries.length,sourceModePairs:entries.length*2,
 pageId:p.id,boardId:b.id,brandModesActuallySelectable:false,
 disclaimer:"Static source-color matrix; actual 10-brand themes/contrast/RTL remain open"};
