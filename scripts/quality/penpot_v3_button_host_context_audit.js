// #501 / #418: read-only Penpot audit for 10 context-host focus specimens.
// Execute only inside CORRECT Bluent v3 Design System Penpot plugin.
// CI node --check proves syntax, never native design parity.
if (penpot.currentFile?.id !== "b64f6665-c9ab-80b5-8008-c4ac99d9d000") throw Error("Wrong file");
const page = penpotUtils.getPageById("535db143-a732-807e-8008-c64d2fb91b9a");
const board = page?.getShapeById("f4136a9a-101d-8004-8008-ca2956fe05f9");
const errors = [];
let checks = 0;
const check = (condition, description) => { checks++; if (!condition) errors.push(description); };
const close = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a-b)<0.02;
check(!!page && page.name.includes("Button Focus Visible"), "correct page");
check(board?.type === "board" && board.name.startsWith("RESEARCH · Host-aware branded Focus"), "actual editable board");
if (!board) return {pass:false,checks,errors};
check(board.children.length === 85, "85 editable shapes");
check(close(board.width,2040)&&close(board.height,1070), "board bounds");
const modes=["Light","Dark"],kinds=["Neutral","Brand","BrandHover","Danger","Inverted"];
const palette={Light:{hosts:["#FFFFFF","#1267B4","#18599B","#D13438","#292929"],rings:["#1267B4","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF"]},Dark:{hosts:["#292929","#18599B","#1267B4","#D13438","#FFFFFF"],rings:["#6790CF","#FFFFFF","#FFFFFF","#FFFFFF","#6790CF"]}};
const lum=h=>{let c=h.slice(1).match(/.{2}/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
const contrast=(a,b)=>{let x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
let results=[];
for(const mode of modes)for(let i=0;i<kinds.length;i++){
 const key=mode+" "+kinds[i],find=role=>board.children.find(s=>s.name===key+" "+role);
 const host=find("HOST"),ring=find("FOCUS RING"),face=find("button face"),label=find("button label"),token=find("token"),metric=find("ratio");
 check(!!host&&!!ring&&!!face&&!!label&&!!token&&!!metric,key+" native layers");
 if(!host||!ring||!face)continue;
 const hc=host.fills?.[0]?.fillColor?.toUpperCase(),rc=ring.strokes?.[0]?.strokeColor?.toUpperCase();
 check(hc===palette[mode].hosts[i],key+" host source color");
 check(rc===palette[mode].rings[i],key+" ring context color");
 check(ring.strokes?.[0]?.strokeWidth===2,key+" 2px ring");
 check(close(face.x-ring.x,3)&&close(face.y-ring.y,3)&&close(ring.width-face.width,6)&&close(ring.height-face.height,6),key+" symmetric 3px");
 const ratio=contrast(hc,rc);
 check(ratio>=3,key+" contrast >=3");
 check(metric?.characters?.includes(ratio.toFixed(2))&&metric?.characters?.includes("PASS"),key+" truthful metric");
 results.push({case:key,contrast:+ratio.toFixed(3),ring:rc,host:hc});
}
check(board.children.some(s=>s.name==="Scope"&&s.characters?.includes("DESIGN PROPOSAL")),"not approved public API");
check(board.children.some(s=>s.name==="Footer"&&s.characters?.includes("underline-only")),"TextField underline retained");
check(!!page.getShapeById("94a03b1b-8cb6-8091-8008-c8b9bae47e45"),"selected board intact");
check(!!page.getShapeById("6f4f48b4-7b1e-800e-8008-c9bc0d7c44fa"),"Danger selected intact");
return {pass:errors.length===0,checks,failures:errors,boardId:board.id,editableShapes:board.children.length,examples:results};
