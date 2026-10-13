// Read-only live Penpot audit for #501's *draft* native Focus token bindings.
// Requires the correct, active source-owned Bluent v3 Design System tab.
// Run twice, after switching Light · Draft then Dark · Draft. Restore Light.
if (penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")
  throw Error("Wrong project-owned Penpot file");
const catalog=penpot.library.local.tokens,sets=catalog.sets;
const light=sets.find(s=>s.name==="bluent-v3/418/focus-candidate/light");
const dark=sets.find(s=>s.name==="bluent-v3/418/focus-candidate/dark");
const modes=catalog.themes.filter(t=>t.group==="Bluent v3 / Mode");
const active=modes.filter(t=>t.active);
const errors=[];let checks=0;
const ok=(condition,message)=>{checks++;if(!condition)errors.push(message);};
ok(!!light&&!!dark,"Both independent opt-in Focus TokenSets must exist");
ok(active.length===1,"Exactly one original Mode theme should be active");
const expectedNames=[
  "bluent.source.focusStroke2",
  "bluent.semantic.focusRing.strongCandidate",
  "bluent.component.button.focusOuterCandidate",
  "bluent.semantic.focusRing.gapCandidate",
  "bluent.component.button.focusGapCandidate"
];
for(const [mode,set,color] of [["light",light,"#000000"],["dark",dark,"#FFFFFF"]]){
  if(!set)continue;
  const theme=modes.find(t=>t.name.toLowerCase().startsWith(mode));
  ok(!!theme&&theme.activeSets.some(s=>s.id===set.id),mode+" original theme lost candidate set");
  ok(set.tokens.length===5,mode+" expected exactly five tokens");
  for(const name of expectedNames)ok(!!set.tokens.find(t=>t.name===name),mode+" missing "+name);
  ok(set.tokens.find(t=>t.name===expectedNames[0])?.value?.toUpperCase()===color,mode+" source color");
  ok(set.tokens.find(t=>t.name===expectedNames[1])?.value==="{bluent.source.focusStroke2}",mode+" source-to-semantic");
  ok(set.tokens.find(t=>t.name===expectedNames[2])?.value==="{bluent.semantic.focusRing.strongCandidate}",mode+" semantic-to-button");
  ok(set.tokens.find(t=>t.name===expectedNames[3])?.value==="{bluent.semantic.surface.default}",mode+" inner-gap surface alias");
  ok(set.tokens.find(t=>t.name===expectedNames[4])?.value==="{bluent.semantic.focusRing.gapCandidate}",mode+" inner-gap component alias");
}
const page=penpotUtils.getPageByName("38 · Button Focus Visible states · #501");
ok(page?.id==="535db143-a732-807e-8008-c64d2fb91b9a","Wrong #501 design page");
const family=page.getShapeById("535db143-a732-807e-8008-c64f10ae5f75");
const danger=page.getShapeById("cd054205-a525-80d8-8008-c853b7ac86f0");
const focus=family.children.filter(s=>s.component()?.variantProps?.Focus==="Visible");
const nofocus=family.children.filter(s=>s.component()?.variantProps?.Focus==="Off");
const dvis=danger.children.filter(s=>s.component()?.variantProps?.Focus==="Visible");
const doff=danger.children.filter(s=>s.component()?.variantProps?.Focus==="Off");
ok(focus.length===5&&nofocus.length===5,"Five native Focus Off/Visible pairs must be retained");
ok(dvis.length===1&&doff.length===1,"Danger native pair must be retained");
const current=active[0]?.name.startsWith("Dark")?"dark":"light",activeSet=current==="light"?light:dark;
const expectedOuter=current==="light"?"#000000":"#FFFFFF";
const expectedGap=current==="light"?"#FFFFFF":"#292929";
const observed=[];
for(const node of [...focus,...dvis]){
  const outer=node.children.find(s=>s.name==="Focus Visible Outer"||s.name==="Focus Outer");
  const gap=node.children.find(s=>s.name==="Focus Visible Contrast gap"||s.name==="Focus Contrast gap");
  ok(!!outer&&!!gap,"Missing native editable Focus vectors on "+node.name);
  if(!outer||!gap)continue;
  ok(outer.tokens?.strokeColor==="bluent.component.button.focusOuterCandidate","Outer lacks token binding on "+node.name);
  ok(gap.tokens?.strokeColor==="bluent.component.button.focusGapCandidate","Gap lacks token binding on "+node.name);
  ok(outer.strokes?.[0]?.strokeWidth===2&&gap.strokes?.[0]?.strokeWidth===1,"Focus stroke widths drifted on "+node.name);
  ok(outer.strokes?.[0]?.strokeColor?.toUpperCase()===expectedOuter,"Rendered outer did not resolve "+current+" on "+node.name);
  ok(gap.strokes?.[0]?.strokeColor?.toUpperCase()===expectedGap,"Rendered gap did not resolve "+current+" on "+node.name);
  observed.push({variant:node.component()?.variantProps,outer:outer.strokes?.[0]?.strokeColor,gap:gap.strokes?.[0]?.strokeColor});
}
for(const node of [...nofocus,...doff]){
  ok(!node.children.some(s=>/^(Focus Visible Outer|Focus Outer)$/.test(s.name)),"Focus Off has ring "+node.name);
}
ok(activeSet?.tokens.find(t=>t.name==="bluent.component.button.focusOuterCandidate")?.resolvedValue?.toUpperCase()===expectedOuter,"Active component token resolution mismatch");
return {file:penpot.currentFile.id,page:page.id,activeMode:current,lightSet:light?.id,darkSet:dark?.id,
  checks,passed:checks-errors.length,failures:errors,pass:errors.length===0,observed,
  approval:"DRAFT only; inspect Light and Dark separately, then restore Light; no public CSS/token approval"};
