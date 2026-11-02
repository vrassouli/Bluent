// #418 read-only native Penpot focus HOST context contrast specimens audit.
if(penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")
 throw Error("Wrong Bluent v3 design file");
const p=penpotUtils.getPageByName("07 · Accessibility & RTL");
const failures=[];let checks=0;
const ok=(pass,label)=>{checks++;if(!pass)failures.push(label)};
const near=(a,c)=>Number.isFinite(a)&&Number.isFinite(c)&&Math.abs(a-c)<.02;
const configs=[
 {board:"94a03b1b-8cb6-8091-8008-c96c96ea484f",count:29,
  cases:[
   ["LIGHT_NEUTRAL"," FOCUS RING"," button"," host","#1267B4","#FFFFFF","5.79","PASS"],
   ["LIGHT_BRAND"," FOCUS RING"," button"," host","#1267B4","#1267B4","1.00","FAIL"],
   ["DARK_BRAND"," FOCUS RING"," button"," host","#6790CF","#18599B","2.20","FAIL"]
  ]},
 {board:"94a03b1b-8cb6-8091-8008-c96d09329a0b",count:29,
  cases:[
   ["LIGHT_BRAND_INVERSE"," RING"," Button face"," HOST","#FFFFFF","#1267B4","5.79","PASS"],
   ["DARK_BRAND_INVERSE"," RING"," Button face"," HOST","#FFFFFF","#18599B","6.76","PASS"],
   ["DARK_INVERTED_INVERSE"," RING"," Button face"," HOST","#FFFFFF","#FFFFFF","1.00","FAIL"]
  ]}
];
const rows=[];
for(const cfg of configs){
 const b=p.getShapeById(cfg.board);
 ok(!!b&&b.type==="board",cfg.board+" editable native board");
 if(!b)continue;
 ok(b.children?.length===cfg.count,cfg.board+" native descendants");
 for(const [key,ringSuffix,faceSuffix,hostSuffix,ringColor,hostColor,ratio,status] of cfg.cases){
  const ring=b.children.find(s=>s.name===key+ringSuffix),
    face=b.children.find(s=>s.name===key+faceSuffix),
    host=b.children.find(s=>s.name===key+hostSuffix),
    caption=b.children.find(s=>s.name===key+" metric");
  ok(!!ring&&!!face&&!!host&&!!caption,key+" native shapes");
  if(!ring||!face||!host||!caption)continue;
  ok(ring.strokes?.[0]?.strokeColor?.toUpperCase()===ringColor,key+" real source ring color");
  ok(ring.strokes?.[0]?.strokeWidth===2,key+" 2px ring stroke");
  ok(near(face.x-ring.x,3)&&near(face.y-ring.y,3)
   &&near(ring.x+ring.width-face.x-face.width,3)
   &&near(ring.y+ring.height-face.y-face.height,3),
   key+" 4 symmetric vector edges match #501");
  ok(host.fills?.[0]?.fillColor?.toUpperCase()===hostColor,key+" outer host source fill");
  ok(caption.characters.includes(ratio)&&caption.characters.includes(status),
   key+" explicit pass/fail contrast evidence");
  rows.push({key,ring:ringColor,host:hostColor,status});
 }
}
return {file:penpot.currentFile.id,page:p.id,checks,passed:checks-failures.length,
 failures,pass:failures.length===0,boards:configs.map(c=>c.board),rows,
 scope:"Actual editable Penpot shapes and source-host contrast labels; no approved Button API or native AT certification"};
