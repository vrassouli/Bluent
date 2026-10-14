// Read-only live Penpot audit for native Bluent Button text/icon vertical
// centering, including source components and the page-07/34/35 review boards.
// Execute inside connected Bluent v3 Penpot plugin, not Node/CI.
if(penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")throw Error("Wrong Penpot file");
const get=(b,n)=>b?.children?.find(s=>s.name===n),
  page=n=>penpotUtils.getPageByName(n),failures=[];let checks=0,buttons=0;
const ok=(yes,msg)=>{checks++;if(!yes)failures.push(msg);},eq=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<.02;
const align=(txt,face,tag)=>{ok(!!txt&&!!face,tag+" missing text/face");if(!txt||!face)return;
  ok(txt.type==="text"&&txt.verticalAlign==="center",tag+" missing text verticalAlign=center");
  ok(eq(txt.y,face.y)&&eq(txt.height,face.height),tag+" y/height does not match face");
  ok(eq(txt.y+txt.height/2,face.y+face.height/2),tag+" center offset");
  buttons++;
};
const variant=(name,faceName,textName)=>{
  const b=page(name)?.root.children.find(s=>s.isVariantContainer?.());
  ok(!!b,name+" native variant container missing");
  return {b,faceName,textName};
};
const state=variant("19 · Bluent Button native variants","Button face","Button label");
ok(state.b?.variants?.variantComponents()?.length===25,"Page 19 source family must remain 25");
for(const instance of state.b?.children||[])align(get(instance,state.textName),get(instance,state.faceName),
  "19 "+JSON.stringify(instance.component()?.variantProps));
const sizes=variant("20 · Bluent Button sizes and layout","Face","Draft icon glyph");
ok(sizes.b?.variants?.variantComponents()?.length===6,"Page 20 size/layout source family must remain 6");
for(const instance of sizes.b?.children||[]){
  const props=instance.component()?.variantProps,face=get(instance,"Face"),icon=get(instance,"Draft icon glyph");
  const tag="20 "+JSON.stringify(props);align(icon,face,tag+" glyph");
  ok(!!icon&&!!face&&icon.x>=face.x-.02&&icon.x+icon.width<=face.x+face.width+.02,
    tag+" icon horizontally exceeds Button");
  if(props?.Layout==="Icon and label"){
    const caption=get(instance,"Caption");align(caption,face,tag+" caption");
    ok(!!caption&&!!face&&caption.x>=face.x-.02&&caption.x+caption.width<=face.x+face.width+.02,
      tag+" caption horizontally exceeds Button");
  }
}
const persian=variant("25 · Button Persian RTL typography","Button face","Persian label");
ok(persian.b?.variants?.variantComponents()?.length===6,"Page 25 Persian source family must remain 6");
for(const instance of persian.b?.children||[])align(get(instance,"Persian label"),get(instance,"Button face"),
  "25 "+JSON.stringify(instance.component()?.variantProps));
const b07=page("07 · Accessibility & RTL")?.root.children.find(s=>s.id==="07c521b9-e441-80bd-8008-c4b32a4e1bec");
for(const [label,face] of [["LTR add","LTR button"],["RTL add","RTL button"],
                            ["LTR search","LTR input"],["RTL search","RTL input"],
                            ["Focusable label","Focus inner"]])align(get(b07,label),get(b07,face),"07 "+label);
const b34=page("34 · Concurrent brand-scoped theme hosts · #418")?.root.children.find(s=>s.id==="acf5f619-7d81-80da-8008-c60b36beac74");
for(const side of ["Left","Right"])align(get(b34,side+" button label"),get(b34,side+" button"),"34 "+side);
const b35=page("35 · Persian validation states and reflow · #418")?.root.children.find(s=>s.id==="916ee53e-8991-8009-8008-c61c075e54cc");
for(const [label,face] of [["Left disabled label","Left disabled button"],
                           ["Right disabled label","Right disabled button"],
                           ["Reflow button label","Reflow wrapped action"]])align(get(b35,label),get(b35,face),"35 "+label);
return {file:penpot.currentFile.id,checks,alignedSamples:buttons,failures,pass:failures.length===0,
  scope:"Editable vector/text frame geometry; optical font glyph centering, browser/AT and source token sign-off remain separate"};
