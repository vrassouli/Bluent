// Read-only audit for Penpot Bluent v3 #501 special Focus Visible board.
// Run inside the connected project-owned Penpot plug-in, NOT node.js.
if (penpot.currentFile?.id !== "b64f6665-c9ab-80b5-8008-c4ac99d9d000") throw Error("Wrong file");
const p = penpotUtils.getPageByName("38 · Button Focus Visible states · #501");
const b = p?.getShapeById("cd054205-a525-80d8-8008-c8513c9cdb13");
if (!b) throw Error("Missing Danger / Shape / Compound / Split board");
const issues = [];
let checks = 0;
function ok(test, why) { checks++; if (!test) issues.push(why); }
function get(n) { const s = b.children.find(x=>x.name===n); ok(!!s,"Missing "+n); return s; }
function close(a,c) { return Math.abs(a-c)<0.01; }
function ring(prefix,face,style) {
  const o=get(prefix+" / outer"),g=get(prefix+" / contrast");
  if (!o||!g||!face) return;
  if(style==="outer"){
    ok(close(o.x,face.x-6)&&close(o.y,face.y-6)&&close(o.width,face.width+12)&&close(o.height,face.height+12),prefix+" outer misfit");
    ok(close(g.x,face.x-3)&&close(g.y,face.y-3)&&close(g.width,face.width+6)&&close(g.height,face.height+6),prefix+" gap misfit");
  } else {
    ok(o.x>=face.x&&o.y>=face.y&&o.x+o.width<=face.x+face.width&&o.y+o.height<=face.y+face.height,prefix+" outer ring overlaps adjacent action");
    ok(g.x>=face.x&&g.y>=face.y&&g.x+g.width<=face.x+face.width&&g.y+g.height<=face.y+face.height,prefix+" contrast ring overlaps adjacent action");
  }
  ok(o.type==="rectangle"&&g.type==="rectangle"&&o.strokes?.[0]?.strokeWidth===2&&g.strokes?.[0]?.strokeWidth>=1,prefix+" strokes invalid");
}
const danger=get("Danger face"),dangerLabel=get("Danger text");
ok(danger?.type==="rectangle"&&danger.width===190&&danger.height===45&&danger.borderRadius===6,"Danger / Rounded geometry");
ok(dangerLabel?.type==="text"&&dangerLabel.characters==="Delete record","Danger label missing");
ring("Danger ring",danger,"outer");
for (const [name,radius] of [["Circular",23],["Square",0]]) {
  const face=get(name+" face"),glyph=get(name+" glyph");
  ok(face?.width===46&&face?.height===45&&face?.borderRadius===radius,name+" shape mismatch");
  ok(glyph?.characters==="+",name+" glyph mismatch");
  ring(name+" ring",face,"outer");
}
const compound=get("Compound face"),primary=get("Compound primary"),secondary=get("Compound secondary");
ok(compound?.width===244&&compound?.height===45,"Compound face geometry");
ok(primary?.characters==="Save changes"&&secondary?.characters==="Saved to workspace","Compound text mismatch");
ok(primary?.y < secondary?.y && secondary.y+secondary.height <= compound.y+compound.height,"Compound text not bounded");
ring("Compound ring",compound,"outer");
for (const dir of ["LTR","RTL"]) for (const target of ["Main","Menu"]) {
  const prefix="Split "+dir+" "+target,main=get(prefix+" main face"),menu=get(prefix+" menu face"),outer=get(prefix+" focus outer"),gap=get(prefix+" focus contrast"),head=get(prefix+" heading");
  if (!main||!menu) continue;
  ok(close(main.width,136)&&close(menu.width,44)&&close(main.y,menu.y),"Split segment sizes / baseline: "+prefix);
  ok(dir==="LTR" ? close(main.x+main.width,menu.x) : close(menu.x+menu.width,main.x),"Split LTR/RTL adjacency: "+prefix);
  ok(main.borderRadiusTopLeft===(dir==="LTR"?6:0)&&main.borderRadiusTopRight===(dir==="RTL"?6:0),"Split main outer corner parity: "+prefix);
  ok(menu.borderRadiusTopLeft===(dir==="RTL"?6:0)&&menu.borderRadiusTopRight===(dir==="LTR"?6:0),"Split menu outer corner parity: "+prefix);
  ok(head?.characters === dir+" · "+(target==="Main"?"Main action focused":"Menu action focused"),"Split label mismatch: "+prefix);
  if (outer&&gap) {
    const focused=target==="Main"?main:menu,sibling=target==="Main"?menu:main;
    ok(outer.x>=focused.x&&outer.x+outer.width<=focused.x+focused.width&&outer.y>=focused.y&&outer.y+outer.height<=focused.y+focused.height,"Split outer ring escapes target: "+prefix);
    ok(gap.x>=focused.x&&gap.x+gap.width<=focused.x+focused.width&&gap.y>=focused.y&&gap.y+gap.height<=focused.y+focused.height,"Split inner ring escapes target: "+prefix);
    ok(outer.x>=sibling.x+sibling.width || outer.x+outer.width<=sibling.x,"Split focus ring overlaps sibling: "+prefix);
    ok(outer.strokes?.[0]?.strokeWidth===2&&gap.strokes?.[0]?.strokeWidth===2,"Split ring stroke width: "+prefix);
  }
}
const original=penpotUtils.getPageByName("19 · Bluent Button native variants").root.children.find(s=>s.isVariantContainer?.());
const focusFamily=p.root.children.find(s=>s.isVariantContainer?.());
ok(original?.variants?.variantComponents()?.length===25,"Original #419 25 variants changed");
ok(focusFamily?.variants?.variantComponents()?.length===10,"Focus family 10 variants changed");
const dangerNative=p.getShapeById("cd054205-a525-80d8-8008-c853b7ac86f0");
ok(!!dangerNative?.isVariantContainer?.(),"Missing native Danger Focus family");
const dangerComponents=dangerNative?.variants?.variantComponents()||[];
ok(dangerNative?.variants?.properties?.join("|")==="Focus" && dangerComponents.length===2,"Danger Focus family axes/size");
const off=dangerComponents.find(c=>c.variantProps.Focus==="Off")?.mainInstance();
const vis=dangerComponents.find(c=>c.variantProps.Focus==="Visible")?.mainInstance();
ok(!!off&&!!vis,"Native Danger Off/Visible missing");
const relative=(root,name)=>{const s=root?.children?.find(x=>x.name===name);return s?[s.x-root.x,s.y-root.y,s.width,s.height]:null;};
const f0=relative(off,"Danger face"),f1=relative(vis,"Danger face"),t0=relative(off,"Danger label"),t1=relative(vis,"Danger label");
ok(!!f0&&!!f1&&f0.every((v,i)=>close(v,f1[i])),"Danger native Face reflow");
ok(!!t0&&!!t1&&t0.every((v,i)=>close(v,t1[i])),"Danger native Text reflow");
ok(off?.children?.filter(x=>x.name.startsWith("Focus ")).length===0,"Native Danger Off has focus decoration");
ok(vis?.children?.filter(x=>x.name.startsWith("Focus ")).length===2,"Native Danger Visible missing two strokes");
const visFace=vis?.children?.find(x=>x.name==="Danger face");
const visOuter=vis?.children?.find(x=>x.name==="Focus Outer"),visGap=vis?.children?.find(x=>x.name==="Focus Contrast gap");
ok(visFace&&visOuter&&close(visOuter.x,visFace.x-6)&&close(visOuter.y,visFace.y-6)&&close(visOuter.width,visFace.width+12),"Native Danger outer ring geometry");
ok(visFace&&visGap&&close(visGap.x,visFace.x-3)&&close(visGap.y,visFace.y-3)&&close(visGap.width,visFace.width+6),"Native Danger contrast ring geometry");
return {issue:501,file:penpot.currentFile.id,page:p.id,board:b.id,checks,failures:issues,pass:issues.length===0,
  scope:"Editable Penpot geometric design audit, not browser/AT/forced-colors compliance"};
