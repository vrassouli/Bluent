// #418 native Penpot focus2 Light/Dark visual candidate read-only audit.
// Run INSIDE the connected Bluent v3 Design System Penpot plugin (not Node).
if(penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")throw Error("Wrong Penpot file");
const p=penpotUtils.getPageByName("32 · High contrast and reduced motion policy · #418"),
 b=p?.getShapeById("cd054205-a525-80d8-8008-c87438620de4");
if(!b)throw Error("Missing focus2 board");
let checks=0;const errors=[],assert=(cond,msg)=>{checks++;if(!cond)errors.push(msg)},
 find=name=>b.children.find(s=>s.name===name);
assert(b.children.length===24,"Expected 24 native editable shapes");
for(const [mode,bg,ring,gap] of [["Light","#FFFFFF","#000000","#FFFFFF"],["Dark","#292929","#FFFFFF","#292929"]]){
 const pfx=mode+" ",host=find(pfx+"host"),face=find(pfx+"button face"),
 label=find(pfx+"button text"),outer=find(pfx+"focus outer"),inner=find(pfx+"focus contrast gap");
 for(const [name,node] of [["host",host],["face",face],["label",label],["outer",outer],["gap",inner]])
   assert(!!node,mode+" missing "+name);
 if(!host||!face||!label||!outer||!inner)continue;
 assert(host.fills?.[0]?.fillColor?.toUpperCase()===bg,mode+" canvas mismatch");
 assert(face.fills?.[0]?.fillColor?.toUpperCase()==="#0F6CBD",mode+" example button");
 assert(label.type==="text"&&label.characters==="Primary action",mode+" label");
 assert(outer.strokes?.[0]?.strokeColor?.toUpperCase()===ring&&outer.strokes?.[0]?.strokeWidth===2,mode+" stroke");
 assert(inner.strokes?.[0]?.strokeColor?.toUpperCase()===gap&&inner.strokes?.[0]?.strokeWidth===1,mode+" contrast gap");
 assert(Math.abs(outer.x-(face.x-3))<.01&&Math.abs(outer.y-(face.y-3))<.01&&Math.abs(outer.width-(face.width+6))<.01&&Math.abs(outer.height-(face.height+6))<.01,mode+" outer ring bounds");
 assert(Math.abs(inner.x-(face.x-1))<.01&&Math.abs(inner.y-(face.y-1))<.01&&Math.abs(inner.width-(face.width+2))<.01&&Math.abs(inner.height-(face.height+2))<.01,mode+" gap ring bounds");
 assert(label.x>=face.x&&label.x+label.width<=face.x+face.width&&label.y>=face.y&&label.y+label.height<=face.y+face.height,mode+" text fits");
 assert(outer.type==="rectangle"&&inner.type==="rectangle",mode+" rings not native editable vectors");
 assert(outer.strokes?.[0]?.strokeAlignment==="inner"&&inner.strokes?.[0]?.strokeAlignment==="inner",
   mode+" expected inside-aligned Penpot vector strokes");
 assert(Math.abs(outer.x+outer.width/2-face.x-face.width/2)<.01
   &&Math.abs(outer.y+outer.height/2-face.y-face.height/2)<.01,mode+" outer not centered");
 assert(Math.abs(inner.x+inner.width/2-face.x-face.width/2)<.01
   &&Math.abs(inner.y+inner.height/2-face.y-face.height/2)<.01,mode+" inner not centered");
 assert(outer.borderRadius===face.borderRadius+3&&inner.borderRadius===face.borderRadius+1,
   mode+" ring corners not source driven");
}
assert(b.name.endsWith("unapproved"),"Proposal must be explicitly unapproved");
return {file:penpot.currentFile.id,page:p.id,board:b.id,checks,failures:errors,pass:errors.length===0,
 limitation:"Design-only fixed-color samples, not token-bound or accessibility acceptance"};
