// Read-only native Penpot geometry / source label audit for #418 experimental
// normal + hover brand Focus comparison, not proof of production accessibility.
if(penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")
 throw Error("Wrong project-owned file");
const p=penpotUtils.getPageByName("07 · Accessibility & RTL");
const b=p.getShapeById("94a03b1b-8cb6-8091-8008-c8efa7fd2435");
const errors=[];let checks=0;
const ok=(value,name)=>{checks++;if(!value)errors.push(name)};
const near=(a,c)=>Number.isFinite(a)&&Number.isFinite(c)&&Math.abs(a-c)<.02;
ok(b?.name==="RESEARCH · Dark brand ring on normal AND hover host · #418","native comparison board ID");
ok(b?.children?.length===30,"30 actual editable shapes");
if(!b)return {pass:false,checks,errors};
for(const [prefix,color,normal,hover] of [
  ["COMPOUND","#4F82C8","3.71","2.77"],
  ["BRAND_FG2","#6790CF","4.29","3.20"]
]){
 for(const state of ["NORMAL","HOVER"]){
  const ring=b.children.find(x=>x.name===prefix+" "+state+" keyboard focus");
  const face=b.children.find(x=>x.name===prefix+" "+state+" button face");
  const host=b.children.find(x=>x.name===prefix+" "+state+" host");
  ok(!!ring&&!!face&&!!host,prefix+" "+state+" native objects");
  if(!ring||!face||!host)continue;
  ok(ring.strokes?.[0]?.strokeWidth===2&&ring.strokes?.[0]?.strokeColor?.toUpperCase()===color,
     prefix+" "+state+" source color and 2px outline");
  ok(near(face.x-ring.x,3)&&near(face.y-ring.y,3)
    &&near(ring.x+ring.width-face.x-face.width,3)
    &&near(ring.y+ring.height-face.y-face.height,3),
     prefix+" "+state+" four-sided symmetric ring");
  ok(host.fills?.[0]?.fillColor?.toUpperCase()===(state==="NORMAL"?"#292929":"#3D3D3D"),
     prefix+" "+state+" real neutral-host source");
 }
 const n=b.children.find(x=>x.name===prefix+" NORMAL ratio");
 const h=b.children.find(x=>x.name===prefix+" HOVER ratio");
 ok(!!n&&n.characters.includes(normal),prefix+" normal contrast caption");
 ok(!!h&&h.characters.includes(hover),prefix+" hover contrast caption");
}
return {file:penpot.currentFile.id,page:p.id,board:b.id,checks,passed:checks-errors.length,
 failures:errors,pass:errors.length===0,
 scope:"Source-linked editable design specimens and selected backgrounds only; actual OS/AT not certified"};
