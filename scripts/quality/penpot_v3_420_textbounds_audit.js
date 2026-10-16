// #420 read-only native Penpot text-bounds acceptance audit.
// Run through the connected Penpot plugin; NEVER run as Node and claim design proof.
const fileId="b64f6665-c9ab-80b5-8008-c4ac99d9d000";
const pageId="ed5216bd-3d5b-8015-8008-cb247e27efb4";
const boardId="ed5216bd-3d5b-8015-8008-cb247e906204";
if(penpot.currentFile?.id!==fileId)throw Error("Wrong Bluent v3 file");
const page=penpotUtils.getPageById(pageId);
const board=penpotUtils.findShapeById(boardId);
if(!page||!board||board.type!=="board")throw Error("Source-owned #420 board missing");
const labels=penpotUtils.findShapes(s=>s.type==="text",board);
const tolerance=0.5;
const clipped=labels.filter(t=>!t.textBounds||
 t.textBounds.height>t.height+tolerance||
 t.textBounds.width>t.width+tolerance||
 t.y+t.height>board.y+board.height+tolerance);
const required=["title","section title 1","section title 2","section title 3","section title 4","step label 1.1","step label 4.3"];
const missing=required.filter(name=>!labels.some(t=>t.name===name));
if(board.children.length!==63||labels.length!==37||clipped.length||missing.length)
 throw Error(JSON.stringify({shapes:board.children.length,labels:labels.length,missing,clipped:clipped.map(t=>({name:t.name,height:t.height,text:t.textBounds?.height}))}));
return {page:page.name,board:board.name,shapes:board.children.length,labels:labels.length,clipped:0,missing:0,result:"PASS (37/37 real native text bounds); not human visual/AT review"};
