// Read-only Penpot audit for the maintainer-selected #501/#418 brand focus board.
// Execute INSIDE Penpot with Bluent v3 Design System file connected, not via Node.
// This audits the new decision board; original Focus2 research variants are untouched.
if(penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")
 throw Error("Wrong project-owned Penpot design file");
const p=penpotUtils.getPageByName("38 · Button Focus Visible states · #501");
const b=p?.getShapeById("94a03b1b-8cb6-8091-8008-c8b9bae47e45");
const errors=[];let checks=0;
const ok=(pass,name)=>{checks++;if(!pass)errors.push(name)};
const near=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<.02;
ok(!!b&&b.type==="board","actual editable decision board missing");
if(!b)return {pass:false,errors,checks};
ok(b.name==="REVIEW DECISION · Brand Button Focus + Field Underline · #418 #501","source board name");
ok(near(b.width,1480)&&near(b.height,720)&&b.children.length===28,"size and native child count");
const find=name=>b.children.find(s=>s.name===name);
const colors=[];
for(const [prefix,color] of [["LIGHT · SOURCE BRANDED","#1267B4"],["DARK · SOURCE BRANDED","#18599B"]]){
 const face=find(prefix+" Button Face"),ring=find(prefix+" BRAND FOCUS · SINGLE OUTLINE");
 const field=find(prefix+" Field Face"),underline=find(prefix+" FIELD FOCUS INDICATOR · BOTTOM ONLY");
 ok(!!face&&!!ring&&!!field&&!!underline,prefix+" editable geometry exists");
 if(!face||!ring||!field||!underline)continue;
 ok(ring.strokes?.[0]?.strokeWidth===2,prefix+" 2px Button focus outline");
 ok(ring.strokes?.[0]?.strokeColor?.toUpperCase()===color,prefix+" source brand color");
 ok(near(face.x-ring.x,3)&&near(face.y-ring.y,3)&&near(ring.x+ring.width-(face.x+face.width),3)&&near(ring.y+ring.height-(face.y+face.height),3),prefix+" all four Button ring edges");
 ok(near(underline.height,2)&&near(underline.x,field.x)&&near(underline.width,field.width)&&near(underline.y+underline.height,field.y+field.height),prefix+" underline at field bottom");
 ok(underline.fills?.[0]?.fillColor?.toUpperCase()===color,prefix+" native branded underline");
 ok(!b.children.some(s=>s.name===prefix+" FIELD OUTER FOCUS RING"),prefix+" no extra full field frame");
 if(prefix.startsWith("LIGHT"))ok(ring.tokens?.strokeColor==="bluent.semantic.border.focus","Light source semantic token attached");
 colors.push({mode:prefix,ring:ring.strokes?.[0]?.strokeColor,underline:underline.fills?.[0]?.fillColor,token:ring.tokens?.strokeColor});
}
ok(!!find("Decision footnote")&&!!find("DARK · SOURCE BRANDED caveat"),"experimental and dark contrast notes retained");
const original=p.getShapeById("535db143-a732-807e-8008-c64f10ae5f75");
ok(original?.variants?.variantComponents()?.length===10,"existing Focus2 candidate native family kept intact");
const danger=p.getShapeById("cd054205-a525-80d8-8008-c853b7ac86f0");
ok(danger?.variants?.variantComponents()?.length===2,"Danger candidate native family kept intact");
return {file:penpot.currentFile.id,page:p.id,board:b.id,checks,passed:checks-errors.length,failures:errors,colors,pass:errors.length===0,scope:"Selected visual direction only; brand-dark contrast and actual OS/AT still need approval"};
