// Read-only live Penpot #501 Danger state / Focus independence audit.
// Run ONLY inside Bluent v3 Design System Penpot plugin.
// Do not treat node --check of this file as an executed Penpot audit.
if(penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")
 throw Error("Wrong Penpot file");
const page=penpotUtils.getPageByName("38 · Button Focus Visible states · #501");
const board=page.getShapeById("6f4f48b4-7b1e-800e-8008-c9bc0d7c44fa");
const failed=[];let checks=0;
const ok=(yes,name)=>{checks++;if(!yes)failed.push(name)};
ok(board?.type==="board"&&board.name==="REVIEW · Danger selected contrast × Focus Visible · #501","native board");
ok(board?.children?.length===51,"native layer inventory 51");
const palettes={
 LIGHT:{OFF:["#D13438","#FFFFFF","4.93"],ON:["#FDF6F6","#751D1F","10.09"],
        HOVER:["#F1BBBC","#751D1F","6.44"],PRESSED:["#D13438","#FFFFFF","4.93"]},
 DARK:{OFF:["#D13438","#FFFFFF","4.93"],ON:["#3F1011","#F1BBBC","9.72"],
       HOVER:["#751D1F","#F1BBBC","6.44"],PRESSED:["#D13438","#FFFFFF","4.93"]}
};
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<.02;
for(const mode of ["LIGHT","DARK"]){
 const host=board?.children.find(x=>x.name===mode+" neutral host");
 ok(host?.fills?.[0]?.fillColor?.toUpperCase()===(mode==="LIGHT"?"#FFFFFF":"#292929"),mode+" source host");
 for(const state of ["OFF","ON","HOVER","PRESSED"]){
  const prefix=mode+" "+state;
  const button=board?.children.find(x=>x.name===prefix+" Button face");
  const text=board?.children.find(x=>x.name===prefix+" Persian text");
  const ratio=board?.children.find(x=>x.name===prefix+" contrast");
  const ring=board?.children.find(x=>x.name===prefix+" Focus outer");
  const [bg,fg,cr]=palettes[mode][state];
  ok(!!button&&!!text&&!!ratio,prefix+" native editable shapes");
  if(!button||!text||!ratio)continue;
  ok(button.fills?.[0]?.fillColor?.toUpperCase()===bg,prefix+" emitted background");
  ok(text.fills?.[0]?.fillColor?.toUpperCase()===fg,prefix+" emitted text");
  ok(text.characters.includes("خطر")&&text.direction==="rtl",prefix+" Persian RTL");
  ok(text.align==="center"&&text.verticalAlign==="center",prefix+" text centered");
  ok(near(text.x-button.x,2)&&near(text.y-button.y,0)&&near(text.width,button.width-4)
      &&near(text.height,button.height),prefix+" face/label bounds");
  ok(ratio.characters.includes(cr)&&ratio.characters.includes("PASS"),prefix+" contrast label");
  const visible=(state==="HOVER"||state==="PRESSED");
  ok(visible?!!ring:!ring,prefix+" Focus independent of Selected");
  if(visible&&ring){
   ok(ring.strokes?.[0]?.strokeWidth===2
    &&ring.strokes?.[0]?.strokeColor?.toUpperCase()===(mode==="LIGHT"?"#1267B4":"#6790CF"),
    prefix+" brand outer 2px stroke");
   ok(near(button.x-ring.x,3)&&near(button.y-ring.y,3)
    &&near(ring.width-button.width,6)&&near(ring.height-button.height,6),
    prefix+" symmetric 3px outer bounds");
  }
 }
}
ok(board?.getPluginData("sourceBoard")==="94a03b1b-8cb6-8091-8008-c986fd01b85f",
 "actual #418 palette native source board identity");
return {file:penpot.currentFile.id,page:page.id,board:board?.id,checks,
 passed:checks-failed.length,failures:failed,pass:failed.length===0,
 scope:"Live editable Penpot vector audit only; no public Button API approval"};
