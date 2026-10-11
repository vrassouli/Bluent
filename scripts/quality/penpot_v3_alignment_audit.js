// Run this file's source in the connected Penpot execute_code tool.
// Penpot geometry only: this does not certify optical glyph metrics, WCAG, or Blazor runtime.
if (penpot.currentFile?.id !== "b64f6665-c9ab-80b5-8008-c4ac99d9d000") {
  throw Error("Wrong Penpot file. Audit must run in the project-owned Bluent v3 Design System.");
}
const specs = [
  {name:"Button appearance", page:"19 · Bluent Button native variants", id:"e31294c6-7c55-805f-8008-c5900fba48e4", board:"e31294c6-7c55-805f-8008-c5907590b592", prefix:"LOCAL · Button ·", expected:25},
  {name:"Button size", page:"20 · Bluent Button sizes and layout", id:"e31294c6-7c55-805f-8008-c590d62d466d", board:"e31294c6-7c55-805f-8008-c590fe0982cf", prefix:"LOCAL · Button size ·", expected:6},
  {name:"TextField", page:"16 · Bluent TextField variants", id:"e31294c6-7c55-805f-8008-c51241e2236b", board:"e31294c6-7c55-805f-8008-c512bf412b37", prefix:"LOCAL · TextField ·", expected:10},
  {name:"Checkbox", page:"17 · Bluent Checkbox variants", id:"e31294c6-7c55-805f-8008-c512f68f2d1e", board:"e31294c6-7c55-805f-8008-c51334e865e4", prefix:"LOCAL · Checkbox ·", expected:12},
  {name:"Switch", page:"18 · Bluent Switch variants", id:"e31294c6-7c55-805f-8008-c51360ccbff0", board:"e31294c6-7c55-805f-8008-c5139a9544bf", prefix:"LOCAL · Switch ·", expected:12},
];
const maxDrift = 0.75;
const errors = [];
let comparisons = 0;
let inspected = 0;
const summary = [];
const get = (parent, name) => parent?.children?.find(s => s.name === name);
const approx = (a,b,desc) => { comparisons++; if (!Number.isFinite(a)||!Number.isFinite(b)||Math.abs(a-b)>maxDrift) errors.push(desc+": "+a+" vs "+b); };
const yc = s => s.y+s.height/2;
const xc = s => s.x+s.width/2;
const inside = (s,frame,desc) => {
  comparisons++;
  if (!s||!frame||s.x<frame.x-maxDrift||s.y<frame.y-maxDrift||
      s.x+s.width>frame.x+frame.width+maxDrift||s.y+s.height>frame.y+frame.height+maxDrift)
    errors.push(desc+": child exceeds control frame");
};
for(const cfg of specs) {
  const page = penpotUtils.getPageByName(cfg.page);
  const variant = page?.getShapeById(cfg.id);
  const matrix = page?.getShapeById(cfg.board);
  if (!variant?.isVariantContainer()||!matrix) {errors.push(cfg.name+": missing variant or preview board");continue;}
  const comps = variant.variants.variantComponents();
  const componentIds = new Set(comps.map(c=>c.id));
  const instances = matrix.children.filter(x=>x.name.startsWith(cfg.prefix));
  if (comps.length!==cfg.expected||instances.length!==cfg.expected)errors.push(cfg.name+": incorrect counts");
  const axisTuples=new Set(comps.map(c=>JSON.stringify(variant.variants.properties.map(k=>c.variantProps[k]))));
  if (axisTuples.size!==cfg.expected)errors.push(cfg.name+": duplicate/missing variant axes");
  for(const ins of instances)if(!ins.isComponentInstance()||!componentIds.has(ins.component()?.id))errors.push(cfg.name+": broken linked instance "+ins.name);
  for(const c of comps) {
    const root=c.mainInstance(),key=cfg.name+" "+JSON.stringify(c.variantProps);
    const state=c.variantProps;
    if(cfg.name==="Button appearance") {
      const face=get(root,"Button face"),label=get(root,"Button label");
      if(!face||!label){errors.push(key+": missing shapes");continue;}
      approx(xc(face),xc(label),key+" horizontal label");
      approx(yc(face),yc(label),key+" vertical label");
      inside(label,face,key+" label");
    }else if(cfg.name==="Button size"){
      const face=get(root,"Face"),content=get(root,"Content / centered geometry");
      const icon=content?.children?.find(s=>s.name.startsWith("Icon slot"));
      const label=get(content,"Label / centered");
      if(!face||!content||!icon){errors.push(key+": missing centered icon frame");continue;}
      if(content.flex)errors.push(key+": flex child positions are not stable in this Penpot plugin");
      inside(icon,face,key+" icon slot");
      approx(yc(icon),yc(face),key+" icon Y");
      if(state.Layout==="Icon only") {
        approx(xc(icon),xc(face),key+" icon X");
        if(label&&!label.hidden)errors.push(key+": icon-only unexpectedly shows text");
      }else{
        if(!label||label.hidden){errors.push(key+": missing visible label");continue;}
        inside(label,face,key+" label frame");
        approx(yc(label),yc(face),key+" label Y");
        approx((icon.x+label.x+label.width)/2,xc(face),key+" content group X");
        if(label.x-icon.x-icon.width<5)errors.push(key+": insufficient icon-label gap");
      }
      const h=get(icon,"Plus horizontal"),v=get(icon,"Plus vertical");
      if(!h||!v){errors.push(key+": vector icon missing");continue;}
      inside(h,icon,key+" plus-horizontal");
      inside(v,icon,key+" plus-vertical");
      approx(xc(h),xc(icon),key+" icon x strokes");
      approx(yc(h),yc(icon),key+" icon y strokes");
      approx(xc(v),xc(icon),key+" icon vertical x");
      approx(yc(v),yc(icon),key+" icon vertical y");
    }else if(cfg.name==="TextField") {
      const face=get(root,"Input surface"),label=get(root,"Placeholder"),caret=get(root,"Caret / focus intent");
      if(!face||!label){errors.push(key+": missing input surface/label");continue;}
      approx(yc(face),yc(label),key+" placeholder Y");
      inside(label,face,key+" placeholder");
      if(caret&&!caret.hidden)approx(yc(caret),yc(face),key+" caret Y");
    }else if(cfg.name==="Checkbox") {
      const frame=get(root,"Indicator"),mark=get(root,"Checkmark"),label=get(root,"Label"),ring=get(root,"Focus indicator ring");
      if(!frame||!mark||!label){errors.push(key+": missing checkbox shapes");continue;}
      approx(yc(label),yc(frame),key+" label Y");
      if(!mark.hidden){approx(xc(mark),xc(frame),key+" check glyph X");approx(yc(mark),yc(frame),key+" check glyph Y");inside(mark,frame,key+" check glyph");}
      if(ring){approx(xc(ring),xc(frame),key+" focus X");approx(yc(ring),yc(frame),key+" focus Y");}
    }else if(cfg.name==="Switch"){
      const frame=get(root,"Track"),knob=get(root,"Knob"),label=get(root,"Label"),ring=get(root,"Focus outline");
      if(!frame||!knob||!label){errors.push(key+": missing switch shapes");continue;}
      approx(yc(label),yc(frame),key+" label Y");
      approx(yc(knob),yc(frame),key+" knob Y");
      inside(knob,frame,key+" knob inside track");
      if(ring){approx(xc(ring),xc(frame),key+" focus X");approx(yc(ring),yc(frame),key+" focus Y");}
      const rtl=state.Direction==="RTL";
      comparisons++;
      if((rtl&&label.x+label.width>frame.x-maxDrift)||(!rtl&&label.x<frame.x+frame.width-maxDrift))
        errors.push(key+": label on wrong side for "+state.Direction);
      if(rtl&&label.direction!=="rtl")errors.push(key+": RTL language direction missing");
    }
    inspected++;
  }
  summary.push({family:cfg.name,variants:comps.length,linkedPreviewInstances:instances.length});
}
const local=penpot.library.local;
const prototypes=[
  ["DRAFT · Primary Button","Label · Button content",null],
  ["DRAFT · TextField","Placeholder","Input surface / tokenized"],
  ["DRAFT · Checkbox","Label / local","Checked / draft token fill"],
  ["DRAFT · Switch","Label / local","On track / token fill"],
];
for(const [name,labelName,faceName] of prototypes){
  const main=local.components.find(c=>c.name===name)?.mainInstance();
  if(!main){errors.push("Missing original local prototype "+name);continue;}
  const label=get(main,labelName),face=faceName?get(main,faceName):main;
  if(!label||!face){errors.push("Missing original prototype shapes "+name);continue;}
  approx(yc(label),yc(face),name+" vertical label");
  if(name==="DRAFT · Primary Button")approx(xc(label),xc(face),name+" horizontal label");
}
const sketch=penpotUtils.getPageByName("21 · Button Bluent-specific API anatomy")
  ?.getShapeById("e31294c6-7c55-805f-8008-c591278b98dd");
if(!sketch){errors.push("Missing editable API sketches");}
else {
  const button=get(sketch,"Visual button 5"),head=get(sketch,"Visual label 5"),sub=get(sketch,"Subtitle");
  if(!button||!head||!sub) errors.push("Compound button anatomy incomplete");
  else {
    inside(head,button,"Compound title");
    inside(sub,button,"Compound subtitle");
    comparisons++;
    if(head.y+head.height>sub.y+maxDrift)errors.push("Compound Button title/subtitle overlap");
  }
}
// Broader page sweep: catch text boxes overflowing project-owned main boards.
// This covers layout/annotation text as well as the reusable component matrices.
let projectBoards = 0;
let projectTextFrames = 0;
const inspectBoardText = (shape, board) => {
  if (shape.type === "text" && !shape.hidden) {
    projectTextFrames++;
    comparisons++;
    if (shape.x < board.x-1 || shape.y < board.y-1 ||
        shape.x+shape.width > board.x+board.width+1 ||
        shape.y+shape.height > board.y+board.height+1)
      errors.push("Text frame crosses authored board boundary: " +
                  board.name + " / " + shape.name);
  }
  for (const child of shape.children || [])
    if (!child.hidden) inspectBoardText(child,board);
};
for (const pageInfo of penpotUtils.getPages()) {
  const p = penpotUtils.getPageById(pageInfo.id);
  for (const shape of p.root.children) {
    if (shape.type === "board" && shape.name.startsWith("#419")) {
      projectBoards++;
      inspectBoardText(shape,shape);
    }
  }
}
return {
  fileId:penpot.currentFile.id, revision:penpot.currentFile.revn,
  inspectedNativeVariants:inspected, geometricChecks:comparisons,
  nativeFamilies:summary, originalDraftComponents:prototypes.length,
  additionalAPISketch:!!sketch,
  authoredBoards:projectBoards, authoredVisibleTextFrames:projectTextFrames, errors, pass:errors.length===0,
  scope:"Editable Bluent source geometry and link integrity; no typography optical/RTL screenreader/browser claims"
};