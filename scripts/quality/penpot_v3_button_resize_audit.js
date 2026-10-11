// Read-only live Penpot source/instance test; run in Penpot execute_code.
// The draft is responsive within documented icon/text minimums, not a
// browser CSS or accessibility certification.
if(penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")
  throw Error("Wrong Penpot file");
const mainPage=penpotUtils.getPageByName("20 · Bluent Button sizes and layout");
const labPage=penpotUtils.getPageByName("23 · Button resize stress laboratory");
const container=mainPage?.getShapeById("e31294c6-7c55-805f-8008-c590d62d466d");
const board=labPage?.getShapeById("e31294c6-7c55-805f-8008-c5aaa288cc59");
if(!container?.isVariantContainer()||!board)throw Error("Button source/stress board missing");
const sizes=["Small","Medium","Large"],layouts=["Icon and label","Icon only"],
cases=["normal","wide","compact"],errors=[],results=[];let checks=0;
const close=(a,b,msg,tolerance=0.75)=>{checks++;if(!Number.isFinite(a)||!Number.isFinite(b)||Math.abs(a-b)>tolerance)errors.push(msg+": "+a+" instead of "+b);};
const get=(parent,name)=>parent?.children?.find(s=>s.name===name);
for(const size of sizes)for(const layout of layouts){
  const c=container.variants.variantComponents().find(x=>x.variantProps.Size===size&&x.variantProps.Layout===layout);
  if(!c){errors.push("Missing size+layout variant "+size+"/"+layout);continue;}
  const src=c.mainInstance(),face=get(src,"Face"),sourceContents=get(src,"Content / centered geometry");
  if(!face||!sourceContents){errors.push("Missing source geometry "+size);continue;}
  checks+=2;
  const intendedConstraint=layout==="Icon only"?"center":"leftright";
  if(face.constraintsHorizontal!==intendedConstraint||
      sourceContents.constraintsHorizontal!==intendedConstraint)
    errors.push("Source face/container constraint does not match layout "+size+"/"+layout);
  for(const x of sourceContents.children){checks++;if(x.constraintsHorizontal!=="center")errors.push("Source content not centered: "+size+"/"+layout+"/"+x.name);}
  close(src.width,face.width+24,"Source width normalized "+size+"/"+layout);
  for(const stress of cases){
    const name="LINKED RESIZE · "+size+" · "+layout+" · "+stress;
    const ins=get(board,name);
    if(!ins?.isComponentInstance()||ins.component()?.id!==c.id){errors.push("Unlinked stress specimen "+name);continue;}
    const f=get(ins,"Face"),content=get(ins,"Content / centered geometry"),icon=content?.children.find(x=>x.name.startsWith("Icon slot")),label=get(content,"Label / centered");
    if(!f||!content||!icon){errors.push("Missing stress anatomy "+name);continue;}
    const left=f.x-ins.x,right=ins.x+ins.width-(f.x+f.width);
    if(layout==="Icon only"){
      // Icon-only is a true square/circular shape: it stays square on stretch.
      close(f.width,f.height,"Icon-only square shape "+name);
      close(left,right,"Icon-only symmetrical centering "+name);
    }else{
      // Text buttons can stretch while preserving symmetric design padding.
      close(left,12,"Left text-button padding "+name);
      close(right,12,"Right text-button padding "+name);
    }
    close(icon.y+icon.height/2,f.y+f.height/2,"Icon vertically centered "+name);
    const groupCenter=layout==="Icon only"?icon.x+icon.width/2:(icon.x+label.x+label.width)/2;
    close(groupCenter,f.x+f.width/2,"Content centered "+name);
    if(layout==="Icon and label"){
      if(!label||label.hidden){errors.push("Missing label "+name);continue;}
      close(label.y+label.height/2,f.y+f.height/2,"Label vertically centered "+name);
      checks++;
      if(label.x-icon.x-icon.width<5)errors.push("Label/icon gap too small "+name);
    } else {checks++;if(label&&!label.hidden)errors.push("Icon-only incorrectly has label "+name);}
    checks++;
    if(icon.x < f.x-.75 || icon.x+icon.width>f.x+f.width+.75 ||
        (layout==="Icon and label"&&(label.x < f.x-.75||label.x+label.width>f.x+f.width+.75)))
      errors.push("Content clips at tested width "+name);
    results.push({size,layout,mode:stress,rootWidth:+ins.width.toFixed(2),faceWidth:+f.width.toFixed(2)});
  }
}
return {fileId:penpot.currentFile.id,revision:penpot.currentFile.revn,
  sourceVariantFamily:container.id,stressBoardId:board.id,
  sourceVariants:container.variants.variantComponents().length,
  linkedStressSamples:results.length,
  geometricChecks:checks,errors,pass:errors.length===0,
  sampleWidths:results,
  limitations:["only tested widths (not arbitrary below-min widths)","no DOM/browser media queries or dynamic text measurement","does not prove optical font centering, keyboard or Fluent visual parity"]};