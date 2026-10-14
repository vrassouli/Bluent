// Read-only canonical Penpot v3 Danger state design audit (run IN Penpot).
if(penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")throw Error("Wrong Bluent design file");
const page=penpotUtils.getPageByName("07 · Accessibility & RTL"),b=page.getShapeById("94a03b1b-8cb6-8091-8008-c986fd01b85f"),errors=[];let checks=0;
const ok=(value,description)=>{checks++;if(!value)errors.push(description)};
ok(b?.type==="board"&&b.name==="REVIEW · Danger toggled contrast across Light and Dark · #418","canonical native board");
ok(b?.children?.length===60,"native 60 shape inventory");
const cases=[["LIGHT","OFF","#D13438","#FFFFFF",4.93],["LIGHT","ON","#FDF6F6","#751D1F",10.09],["LIGHT","HOVER","#F1BBBC","#751D1F",6.44],["LIGHT","PRESSED","#D13438","#FFFFFF",4.93],["DARK","OFF","#D13438","#FFFFFF",4.93],["DARK","ON","#3F1011","#F1BBBC",9.72],["DARK","HOVER","#751D1F","#F1BBBC",6.44],["DARK","PRESSED","#D13438","#FFFFFF",4.93]];
for(const [mode,state,bg,fg,ratio] of cases){
 const button=b.children.find(x=>x.name===mode+" "+state+" button");
 const label=b.children.find(x=>x.name===mode+" "+state+" button label");
 const caption=b.children.find(x=>x.name===mode+" "+state+" ratio");
 ok(!!button&&!!label&&!!caption,mode+"/"+state+" native shapes");
 if(!button||!label||!caption)continue;
 ok(button.fills?.[0]?.fillColor?.toUpperCase()===bg,mode+"/"+state+" real emitted background");
 ok(label.fills?.[0]?.fillColor?.toUpperCase()===fg,mode+"/"+state+" real emitted text");
 ok(label.characters.includes("خطر")&&label.direction==="rtl",mode+"/"+state+" Persian RTL label");
 ok(label.align==="center"&&label.verticalAlign==="center",mode+"/"+state+" two-axis label alignment");
 ok(Math.abs(label.x-button.x-2)<.05&&Math.abs(label.y-button.y)<.05
 &&Math.abs(label.width-button.width+4)<.05&&Math.abs(label.height-button.height)<.05,
 mode+"/"+state+" centered bounds");
 ok(caption.characters.includes(ratio.toFixed(2))&&caption.characters.includes("PASS"),mode+"/"+state+" contrast evidence");
}
const broken=b.children.find(x=>x.name==="Original BAD Danger toggled white label");
const face=b.children.find(x=>x.name==="Original BAD Danger toggled button");
const note=b.children.find(x=>x.name==="Original BUG ratio");
ok(!!broken&&!!face&&!!note,"original bad specimen retained");
ok(broken?.fills?.[0]?.fillColor?.toUpperCase()==="#FFFFFF"&&face?.fills?.[0]?.fillColor?.toUpperCase()==="#FDF6F6","original bad source colors");
ok(note?.characters.includes("1.07")&&note?.characters.includes("FAIL"),"old failure accurately captioned");
return {file:penpot.currentFile.id,page:page.id,board:b.id,checks,passed:checks-errors.length,errors,pass:errors.length===0,scope:"native design QA only, no public v3 Button acceptance"};
