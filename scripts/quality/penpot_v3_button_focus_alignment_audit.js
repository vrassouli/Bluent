// Read-only Penpot geometry audit. Run through Penpot execute_code with the
// authentic Bluent v3 Design System file connected (not via Node directly).
// Focus geometry: outer pad 3px and contrast-gap pad 1px around the actual
// button border or face, equally on all four sides. No linked source detach.
if (penpot.currentFile?.id !== "b64f6665-c9ab-80b5-8008-c4ac99d9d000")
  throw Error("Wrong Penpot file");
const p07=penpotUtils.getPageByName("07 · Accessibility & RTL");
const p38=penpotUtils.getPageByName("38 · Button Focus Visible states · #501");
const b07=p07?.root?.children?.find(s=>s.id==="07c521b9-e441-80bd-8008-c4b32a4e1bec");
const find=(root,name)=>root?.children?.find(s=>s.name===name);
const errors=[],notes=[];let checks=0,focusPairs=0,labels=0,splitTargets=0;
const ok=(v,msg)=>{checks++;if(!v)errors.push(msg);};
const eq=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<.01;
ok(!!b07 && !!p38,"Expected canonical Bluent pages");
for (const [label,face] of [["LTR add","LTR button"],["RTL add","RTL button"],
                            ["LTR search","LTR input"],["RTL search","RTL input"],
                            ["Focusable label","Focus inner"]]) {
  const t=find(b07,label),f=find(b07,face);
  ok(!!t && !!f,"Page07 "+label+" missing");
  if(!t||!f)continue;
  ok(t.type==="text" && t.verticalAlign==="center","Page07 "+label+" vertical align");
  ok(eq(t.y,f.y) && eq(t.height,f.height),"Page07 "+label+" text box vs face");
  ok(eq(t.y+t.height/2,f.y+f.height/2),"Page07 "+label+" midpoint");
  labels++;
}
function ring(outer,gap,face,label) {
  ok(!!outer&&!!gap&&!!face,label+" missing Focus pieces");
  if(!outer||!gap||!face)return;
  for(const [s,pad,name] of [[outer,3,"outer"],[gap,1,"contrast gap"]]){
    ok(s.type==="rectangle"&&eq(s.x,face.x-pad)&&eq(s.y,face.y-pad)
      &&eq(s.width,face.width+pad*2)&&eq(s.height,face.height+pad*2),
      label+" "+name+" four-edge bounds not symmetric");
    ok(eq(s.x+s.width/2,face.x+face.width/2)
      &&eq(s.y+s.height/2,face.y+face.height/2),
      label+" "+name+" is off center");
    ok(eq(s.borderRadius,(face.borderRadius||0)+pad),label+" "+name+" corner radius");
  }
  ok(outer.strokes?.[0]?.strokeWidth===2 && gap.strokes?.[0]?.strokeWidth===1,
    label+" editable vector stroke width");
  focusPairs++;
}
const main=p38.getShapeById("535db143-a732-807e-8008-c64d9b8199bd");
for(const mode of ["Light","Dark"])for(const appearance of ["Primary","Secondary","Outline","Subtle","Transparent"]) {
  const key=(mode==="Light"?"FOCUS-LIGHT":"FOCUS-DARK-SURFACE")+" · "+appearance,
        label=mode==="Light"?mode:"Dark surface", specimen=find(main,key);
  ring(find(main,"Focus ring Outer · "+label+" · "+appearance),
       find(main,"Focus ring Contrast gap · "+label+" · "+appearance),
       find(specimen,"Button border"),"main/"+mode+"/"+appearance);
}
const native=p38.getShapeById("535db143-a732-807e-8008-c64f10ae5f75");
ok(native?.variants?.variantComponents()?.length===10,"Focus family changed from 10 native variants");
for(const b of native.children){
  const v=b.component()?.variantProps,linked=b.children.find(s=>s.name.startsWith("Linked ·"));
  if(v?.Focus==="Visible")ring(find(b,"Focus Visible Outer"),find(b,"Focus Visible Contrast gap"),
     find(linked,"Button border"),"native/"+v.Appearance);
  else if(v?.Focus==="Off")ok(!find(b,"Focus Visible Outer"),"Off variant gained ring "+v.Appearance);
}
const linked=p38.getShapeById("535db143-a732-807e-8008-c64f3402325d");
for(const b of linked.children.filter(s=>s.name.startsWith("LINKED")&&s.name.endsWith("Focus Visible"))){
  const source=b.children.find(s=>s.name.startsWith("Linked ·"));
  ring(find(b,"Focus Visible Outer"),find(b,"Focus Visible Contrast gap"),
       find(source,"Button border"),"linked/"+b.name);
}
const states=p38.getShapeById("cd054205-a525-80d8-8008-c84dc7f13d55");
for(const st of ["Hover","Pressed","Selected"])for(const a of ["Primary","Secondary","Outline","Subtle","Transparent"]){
  const source=find(states,"LINKED · "+a+" / "+st+" / Focus Visible");
  ring(find(states,"FOCUS / "+st+" / "+a+" / Outer"),
       find(states,"FOCUS / "+st+" / "+a+" / Contrast gap"),
       find(source,"Button border"),"state/"+st+"/"+a);
}
for(const a of ["Primary","Secondary","Outline","Subtle","Transparent"]){
  ok(!states.children.some(s=>s.name==="FOCUS / Disabled / "+a+" / Outer"),
     "Disabled state has focus ring "+a);
}
const responsive=p38.getShapeById("cd054205-a525-80d8-8008-c84ea8fb870b");
const sizes=responsive.children.filter(s=>s.name.startsWith("LINKED size"));
ok(sizes.length===6,"Six linked responsive size source specimens expected");
for(let i=0;i<sizes.length;i++)ring(find(responsive,"RING size "+i+" / Outer"),
  find(responsive,"RING size "+i+" / Gap"),find(sizes[i],"Face"),"size/"+i);
for(const dir of ["LTR","RTL"])for(const size of ["Small","Medium","Large"]){
  const key="Persian "+dir+" / "+size;
  ring(find(responsive,"RING "+key+" / Outer"),find(responsive,"RING "+key+" / Gap"),
    find(find(responsive,"LINKED "+key),"Button face"),"persian/"+key);
}
const special=p38.getShapeById("cd054205-a525-80d8-8008-c8513c9cdb13");
for(const name of ["Danger","Circular","Square","Compound"])
  ring(find(special,name+" ring / outer"),find(special,name+" ring / contrast"),
    find(special,name+" face"),"special/"+name);
for(const dir of ["LTR","RTL"])for(const target of ["Main","Menu"]){
  const pre="Split "+dir+" "+target,face=find(special,pre+" "+(target==="Main"?"main":"menu")+" face"),
    other=find(special,pre+" "+(target==="Main"?"menu":"main")+" face"),
    outer=find(special,pre+" focus outer"),gap=find(special,pre+" focus contrast");
  ok(!!face&&!!other&&!!outer&&!!gap,"Split missing "+pre);
  if(!face||!other||!outer||!gap)continue;
  ok(eq(outer.x,face.x+2)&&eq(outer.y,face.y+2)
     &&eq(outer.width,face.width-4)&&eq(outer.height,face.height-4),
     "Split inset focus asymmetric "+pre);
  ok(eq(gap.x,face.x+5)&&eq(gap.y,face.y+5)
     &&eq(gap.width,face.width-10)&&eq(gap.height,face.height-10),
     "Split inner focus asymmetric "+pre);
  ok(outer.x+outer.width<=other.x||outer.x>=other.x+other.width,
     "Split focus obscures neighbor "+pre);
  splitTargets++;
}
const danger=p38.getShapeById("cd054205-a525-80d8-8008-c853b7ac86f0");
ok(danger?.variants?.variantComponents()?.length===2,"Native Danger Focus family changed");
const dangerous=danger.children.find(s=>s.component()?.variantProps?.Focus==="Visible");
ring(find(dangerous,"Focus Outer"),find(dangerous,"Focus Contrast gap"),
     find(dangerous,"Danger face"),"nativeDanger");
const original=penpotUtils.getPageByName("19 · Bluent Button native variants")?.root?.children?.find(s=>s.isVariantContainer?.());
ok(original?.variants?.variantComponents()?.length===25,"Original #419 Button state variants changed");
ok(focusPairs===52,"Expected 52 tightly fitted ring pairs, found "+focusPairs);
ok(labels===5&&splitTargets===4,"Missing accessibility or Split specimens");
return {file:penpot.currentFile.id,pages:[p07.id,p38.id],checks,focusPairs,labels,splitTargets,
  failures:errors,pass:errors.length===0,
  scope:"Native vector/geometry-only, not approved #418 color tokens or browser/AT certification"};
