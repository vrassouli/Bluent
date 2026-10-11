// Execute in the connected Bluent v3 Penpot design file.
// Inspects actual geometry, local source links, Persian text direction and
// native icon shapes; not a browser or screen-reader test.
if(penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")throw Error("Wrong Penpot design file");
const p=penpotUtils.getPageByName("25 · Button Persian RTL typography");
const vc=p?.getShapeById("e31294c6-7c55-805f-8008-c5b0d6e50880");
const board=p?.getShapeById("e31294c6-7c55-805f-8008-c5b10a9aeae4");
if(!vc?.isVariantContainer()||!board)throw Error("Missing Persian variant family/board");
const sizes=["Small","Medium","Large"],directions=["LTR","RTL"],
errors=[],samples=[];let checks=0;
const eq=(a,b,msg)=>{checks++;if(a!==b)errors.push(msg+" expected "+String(b)+" observed "+String(a));};
const near=(a,b,msg)=>{checks++;if(Math.abs(a-b)>0.75)errors.push(msg+" "+a+" vs "+b);};
const find=(p,name)=>p?.children?.find(s=>s.name===name);
for(const size of sizes)for(const direction of directions) {
 const c=vc.variants.variantComponents().find(v=>v.variantProps.Size===size&&v.variantProps.Direction===direction);
 if(!c){errors.push("Missing "+size+"/"+direction);continue;}
 const root=c.mainInstance(),face=find(root,"Button face"),slot=find(root,"Icon slot / 20"),label=find(root,"Persian label");
 const ins=find(board,"LINKED PERSIAN · "+size+" · "+direction);
 if(!face||!slot||!label||!ins){errors.push("Missing anatomy "+size+direction);continue;}
 eq(ins.isComponentInstance()&&ins.component()?.id===c.id,true,"source link "+size+direction);
 eq(label.characters,"ذخیره تغییرات","text "+size+direction);
 eq(label.direction,"rtl","Persian script language direction "+size+direction);
 eq(label.fontFamily,"Noto Sans Arabic","font candidate "+size+direction);
 near(face.height,{Small:24,Medium:32,Large:40}[size],"height "+size+direction);
 near(slot.width,{Small:16,Medium:20,Large:24}[size],"icon-size "+size+direction);
 near((label.y+label.height/2),(face.y+face.height/2),"label vertical center "+size+direction);
 near((slot.y+slot.height/2),(face.y+face.height/2),"icon vertical center "+size+direction);
 const start=Math.min(label.x,slot.x),end=Math.max(label.x+label.width,slot.x+slot.width);
 near((start+end)/2,face.x+face.width/2,"icon-label group center "+size+direction);
 const actualGap=direction==="RTL"?slot.x-(label.x+label.width):label.x-(slot.x+slot.width);
 near(actualGap,10,"icon gap "+size+direction);
 eq(direction==="RTL"?slot.x>label.x:slot.x<label.x,true,"mirrored icon placement "+size+direction);
 checks++;
 if(start<face.x-0.75||end>face.x+face.width+0.75)errors.push("Content crosses face "+size+direction);
 const h=find(slot,"Plus horizontal"),v=find(slot,"Plus vertical");
 if(!h||!v){errors.push("Missing vector icon "+size+direction);continue;}
 near(h.x+h.width/2,slot.x+slot.width/2,"horizontal vector x "+size+direction);
 near(h.y+h.height/2,slot.y+slot.height/2,"horizontal vector y "+size+direction);
 near(v.x+v.width/2,slot.x+slot.width/2,"vertical vector x "+size+direction);
 near(v.y+v.height/2,slot.y+slot.height/2,"vertical vector y "+size+direction);
 samples.push({size,direction,controlHeight:face.height,iconSlot:slot.width,gap:actualGap,font:label.fontFamily,linked:true});
}
eq(vc.variants.variantComponents().length,6,"number of Persian variants");
eq(new Set(vc.variants.variantComponents().map(c=>c.variantProps.Size+"/"+c.variantProps.Direction)).size,6,"unique Size×Direction");
return {fileId:penpot.currentFile.id,revision:penpot.currentFile.revn,
 family:vc.id,board:board.id,variants:vc.variants.variantComponents().length,
 verifiedLinkedSamples:samples.length,checks,errors,pass:errors.length===0,
 draftOnly:true,limitations:["Noto Sans Arabic is a visual draft font, not final product font","Browser actual dir/keyboard/a11y and long text responsive minWidth untested"],
 examples:samples};