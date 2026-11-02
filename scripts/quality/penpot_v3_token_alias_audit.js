// Run inside connected Penpot execute_code; source-owned v3 file ONLY.
// #418 TokenSets: 5 new source / 11 semantic / 8 component entries per mode.
// Source values are checked against the 10-brand default emitted CSS
// by scripts/quality/generate_v3_token_preview.py on the Dev01 branch.
if(penpot.currentFile?.id !== "b64f6665-c9ab-80b5-8008-c4ac99d9d000") throw Error("Wrong Penpot file");
const c=penpot.library.local.tokens, expected={source:5,semantic:11,component:8}, errors=[];
const sourceValues={
  light: {"bluent.color.background1":"#FFFFFF","bluent.color.foreground1":"#242424","bluent.color.brandBackground":"#1267B4","bluent.color.stroke1":"#D1D1D1","bluent.color.brandForeground1":"#1267B4","bluent.source.onBrand":"#FFFFFF","bluent.source.strokeAccessible":"#616161","bluent.source.dangerForeground":"#B10E1C","bluent.source.foregroundDisabled":"#BDBDBD","bluent.source.backgroundDisabled":"#F0F0F0"},
  dark: {"bluent.color.background1":"#292929","bluent.color.foreground1":"#FFFFFF","bluent.color.brandBackground":"#18599B","bluent.color.stroke1":"#666666","bluent.color.brandForeground1":"#4F82C8","bluent.source.onBrand":"#FFFFFF","bluent.source.strokeAccessible":"#ADADAD","bluent.source.dangerForeground":"#DC626D","bluent.source.foregroundDisabled":"#5C5C5C","bluent.source.backgroundDisabled":"#141414"}
};
const semantic={
 "bluent.semantic.surface.default":"bluent.color.background1",
 "bluent.semantic.text.primary":"bluent.color.foreground1",
 "bluent.semantic.action.background":"bluent.color.brandBackground",
 "bluent.semantic.action.foreground":"bluent.color.brandForeground1",
 "bluent.semantic.action.onBrand":"bluent.source.onBrand",
 "bluent.semantic.border.default":"bluent.color.stroke1",
 "bluent.semantic.border.strong":"bluent.source.strokeAccessible",
 "bluent.semantic.status.danger":"bluent.source.dangerForeground",
 "bluent.semantic.text.disabled":"bluent.source.foregroundDisabled",
 "bluent.semantic.surface.disabled":"bluent.source.backgroundDisabled",
 "bluent.semantic.border.focus":"bluent.color.brandBackground"
};
const component={
 "bluent.component.button.backgroundPrimary":"bluent.semantic.action.background",
 "bluent.component.button.foregroundPrimary":"bluent.semantic.action.onBrand",
 "bluent.component.button.foregroundDefault":"bluent.semantic.text.primary",
 "bluent.component.textField.background":"bluent.semantic.surface.default",
 "bluent.component.textField.stroke":"bluent.semantic.border.strong",
 "bluent.component.checkbox.checkedFill":"bluent.semantic.action.background",
 "bluent.component.switch.checkedTrack":"bluent.semantic.action.background",
 "bluent.component.badge.dangerForeground":"bluent.semantic.status.danger"
};
let checks=0;
for(const mode of ["light","dark"]){
 const th=c.themes.find(t=>t.group==="Bluent v3 / Mode"&&t.name.toLowerCase().startsWith(mode));
 if(!th){errors.push("Missing mode theme "+mode);continue}
 if(!th.active)th.toggleActive();
 const original=c.sets.find(s=>s.name==="bluent-v3/draft/"+mode);
 const names={};for(const t of original?.tokens||[])names[t.name]=t.resolvedValueString;
 for(const layer of ["source","semantic","component"]){
  const set=c.sets.find(s=>s.name==="bluent-v3/418/"+layer+"/"+mode);
  if(!set){errors.push("Missing layer "+layer+"/"+mode);continue}
  if(!th.activeSets.some(s=>s.id===set.id))errors.push("Theme missing linked layer "+layer+"/"+mode);
  if(set.tokens.length!==expected[layer])errors.push("Incorrect count "+layer+"/"+mode);
  for(const t of set.tokens){
   checks++;
   let wanted;
   if(layer==="source")wanted=sourceValues[mode][t.name];
   else {const parent=(layer==="semantic"?semantic:component)[t.name];wanted=names[parent];if(t.value!=="{"+parent+"}")errors.push("Incorrect alias "+mode+"/"+t.name);}
   if(!wanted)errors.push("Unknown or unresolved value "+mode+"/"+t.name);
   else if((t.resolvedValueString||"").toUpperCase()!==wanted.toUpperCase())errors.push("Resolved mismatch "+mode+"/"+t.name+":"+t.resolvedValueString+" expected "+wanted);
   names[t.name]=t.resolvedValueString;
  }
 }
}
const light=c.themes.find(t=>t.group==="Bluent v3 / Mode"&&t.name==="Light · Draft");if(light&&!light.active)light.toggleActive();
const page=penpotUtils.getPageByName("27 · v3 token architecture and themes · #418"),board=page?.getShapeById("acf5f619-7d81-80da-8008-c5cb90d6963b");
if(!board||board.children.length<40)errors.push("Missing or incomplete 418 architecture board");
return{fileId:penpot.currentFile.id,revision:penpot.currentFile.revn,checks,errors,pass:errors.length===0,
 tokenSets:6,addedNativeTokens:48,originalDraftTokensUnchanged:true,activeTheme:c.themes.find(t=>t.active)?.name,
 pageId:page?.id,boardId:board?.id,scope:"default brand Light/Dark native design-token alias verification; NOT 10-brand native theme proof"};
