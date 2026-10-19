// Read-only actual Penpot #418 page-07 review audit; run in connected plugin.
if(penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")
  throw Error("Wrong Penpot file");
const p=penpotUtils.getPageByName("07 · Accessibility & RTL");
const orig=p.root.children.find(s=>s.id==="07c521b9-e441-80bd-8008-c4b32a4e1bec");
const b=p.getShapeById("94a03b1b-8cb6-8091-8008-c8ea9cc25c83");
const errors=[];let checks=0;
const ok=(v,msg)=>{checks++;if(!v)errors.push(msg)};
const near=(a,c)=>Number.isFinite(a)&&Number.isFinite(c)&&Math.abs(a-c)<.02;
ok(!!b&&b.type==="board"&&b.children.length===38,"native research board/child count");
if(!b)return {pass:false,checks,errors};
const find=name=>b.children.find(x=>x.name===name);
for(const [mode,color,ratio] of [
  ["LIGHT","#1267B4","5.79"],
  ["DARK_BASE","#18599B","2.04"],
  ["DARK_CANDIDATE","#4F82C8","3.71"]
]){
  const ring=find(mode+" BRAND BUTTON OUTER FOCUS"),face=find(mode+" Button face"),
    field=find(mode+" TextField face"),
    line=find(mode+" NATIVE FIELD BOTTOM UNDERLINE ONLY"),
    label=find(mode+" contrast label");
  ok(!!ring&&!!face&&!!field&&!!line&&!!label,mode+" visible native specimens");
  if(!ring||!face||!field||!line||!label)continue;
  ok(ring.strokes?.[0]?.strokeColor?.toUpperCase()===color,mode+" ring source color");
  ok(ring.strokes?.[0]?.strokeWidth===2,mode+" ring width");
  ok(near(face.x-ring.x,3)&&near(face.y-ring.y,3)
    &&near(ring.x+ring.width-face.x-face.width,3)
    &&near(ring.y+ring.height-face.y-face.height,3),mode+" symmetric ring bounds");
  ok(near(line.x,field.x)&&near(line.width,field.width)
    &&near(line.y+line.height,field.y+field.height)&&near(line.height,2),mode+" native bottom underline only");
  ok(label.characters.includes(ratio),mode+" documented contrast");
  ok(!b.children.some(x=>x.name===mode+" TEXTFIELD OUTER RING"),mode+" no extra outer field outline");
}
for(const [side,id] of [
  ["LTR","07c521b9-e441-80bd-8008-c4b32a9ad40a"],
  ["RTL","07c521b9-e441-80bd-8008-c4b32abc213f"]
]){
  const face=orig.children.find(x=>x.id===id),
        line=orig.children.find(x=>x.name==="SELECTED · "+side+" TextField bottom focus underline (no outer ring)");
  ok(!!face&&!!line,side+" real source underline");
  if(!face||!line)continue;
  ok(near(line.x,face.x)&&near(line.width,face.width)
    &&near(line.y+line.height,face.y+face.height)&&near(line.height,2),side+" original face edge");
  ok(line.fills?.[0]?.fillColor?.toUpperCase()==="#1267B4",side+" brand color");
}
const warning=b.children.find(x=>x.name==="Dark hover contrast warning · source audit");
ok(!!warning&&warning.characters.includes("2.65")&&warning.characters.includes("2.91")
 &&warning.characters.includes("NOT production-approved"),"Dark hover blocker on native board");
return {file:penpot.currentFile.id,page:p.id,board:b.id,checks,passed:checks-errors.length,
 failures:errors,pass:errors.length===0,scope:"Native static design and neutral-host source research only; no production CSS or real OS AT certification"};
