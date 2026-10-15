// #418 repeatable Penpot-only, READ-ONLY typography binding audit.
// Execute as Penpot MCP execute_code body in the correct Bluent v3 file.
// Not font-stack approval, native Windows/AT certification or source-code parity.
const expectedFile="b64f6665-c9ab-80b5-8008-c4ac99d9d000";
const pageId="e775e67c-d9da-804b-8008-cb84059cbdab";
const boardId="e775e67c-d9da-804b-8008-cb8405b790a5";
if(penpot.currentFile?.id!==expectedFile)throw Error("Wrong Penpot file");
const page=penpotUtils.getPageById(pageId),board=page?.getShapeById(boardId);
if(!board||board.type!=="board")throw Error("Missing #418 font acceptance evidence board");
const errors=[],cases=[];
for(const size of [12,14,16,20]){
 for(const [lang,dir,font] of [["Latin","ltr","Inter"],["Persian RTL","rtl","Noto Sans Arabic"]]){
  const name=lang+" size "+size,t=board.children.find(x=>x.name===name);
  const token=size===14?"bluent.semantic.type.bodySize":
    "bluent.type.size."+({12:200,16:400,20:500}[size]);
  const pass=t?.type==="text"&&t.fontSize===String(size)&&
    t.tokens?.fontSize===token&&t.direction===dir&&t.fontFamily===font&&
    t.characters?.trim().length>4;
  cases.push({name,token,direction:dir,pass:!!pass});
  if(!pass)errors.push("Token-bound source specimen drift: "+name);
 }
}
const overflows=penpotUtils.analyzeDescendants(board,(_root,s)=>{
 const v=s.bounds;
 return v.x<board.x-1||v.y<board.y-1||
   v.x+v.width>board.x+board.width+1||
   v.y+v.height>board.y+board.height+1?s.name:null;
}).map(x=>x.result);
errors.push(...overflows.map(n=>"Out-of-board: "+n));
if(board.children.length!==30)errors.push("Unexpected shape count: "+board.children.length);
const font=penpotUtils.findTokenByName("bluent.type.family.base");
const observedFontSerialization={raw:font?.value,resolved:font?.resolvedValueString,
  reviewRequired:font?.resolvedValueString!=="Segoe UI"};
const note=board.children.find(s=>s.name==="Font family quoting defect / review required");
if(observedFontSerialization.reviewRequired&&!note?.characters.includes("Segoe,UI"))
 errors.push("Known multiword font token serialization defect must be disclosed on board");
if(!observedFontSerialization.reviewRequired&&note?.characters.includes("Segoe,UI"))
 errors.push("Stale font-family defect label: source token has been corrected");

if(!board.children.find(s=>s.name==="Eyebrow")?.characters.includes("NOT APPROVED"))
 errors.push("Draft/not-approved disclosure missing");
return {fileId:penpot.currentFile.id,pageId:page.id,boardId:board.id,
 revision:penpot.currentFile.revn,checks:cases.length,passed:cases.filter(c=>c.pass).length,
 shapeCount:board.children.length,overflows,fontSerialization:observedFontSerialization,
 errors,pass:errors.length===0,typographyApproved:false,
 classification:"Editable Penpot design token/specimen evidence ONLY; no final Persian font or AT approval"};
