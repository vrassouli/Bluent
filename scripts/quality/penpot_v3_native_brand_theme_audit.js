// #418 live Penpot test; run in the connected Bluent v3 Design System.
// Validates the real native 20-option Brand×Mode theme axis, not just static
// specimen swatches. Existing Fluent imported library remains untouched.
// The mode group must be coordinated with the selected Brand×Mode theme.
if(penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")throw Error("Wrong Penpot file");
const catalog=penpot.library.local.tokens, group="Bluent v3 / Brand×Mode (Preview)";
const colors=[
  ["default","#1267B4","#18599B"],["excel","#11783F","#146938"],
  ["office","#B53406","#9C2F09"],["outlook","#1267B5","#18599C"],
  ["powerapps","#8D4D8B","#823C81"],["powerbi","#7A6519","#6B5818"],
  ["powerpoint","#B0391A","#983318"],["stream","#BD1D49","#A41B3F"],
  ["teams","#5659BA","#4B4D9F"],["word","#2F61C1","#1A54B0"]
];
const cmp=catalog.sets.find(x=>x.name==="bluent-v3/418/brand-preview/component");
const sem=catalog.sets.find(x=>x.name==="bluent-v3/418/brand-preview/semantic");
const tuples=[["bluent.preview.component.button.backgroundPrimary","brand"],
 ["bluent.preview.component.button.foregroundPrimary","onBrand"],
 ["bluent.preview.component.input.background","surface"],
 ["bluent.preview.component.input.foreground","foreground"]];
const errors=[],samples=[];let checks=0;
try{
 for(const [brand,lightColor,darkColor] of colors){
  for(const mode of ["light","dark"]){
   const theme=catalog.themes.find(x=>x.group===group&&x.name===brand+" / "+mode);
   if(!theme){errors.push("Missing theme "+brand+mode);continue}
   if(!theme.active)theme.toggleActive();
   const modeTheme=catalog.themes.find(x=>x.group==="Bluent v3 / Mode"&&x.name.toLowerCase().startsWith(mode));
   if(!modeTheme){errors.push("Missing base mode "+mode);continue}
   if(!modeTheme.active)modeTheme.toggleActive();
   const palette=catalog.sets.find(s=>s.name==="bluent-v3/418/brand-preview/"+brand+"/"+mode);
   if(!palette||palette.tokens.length!==4)errors.push("Missing or incomplete source palette "+brand+mode);
   if(!theme.activeSets.some(s=>s.id===palette?.id)||
      !theme.activeSets.some(s=>s.id===cmp?.id)||
      !theme.activeSets.some(s=>s.id===sem?.id))errors.push("Missing linked sources "+brand+mode);
   const expected={brand:mode==="light"?lightColor:darkColor,onBrand:"#FFFFFF",
     surface:mode==="light"?"#FFFFFF":"#292929",
     foreground:mode==="light"?"#242424":"#FFFFFF"};
   for(const [name,key] of tuples){
    const t=cmp?.tokens.find(x=>x.name===name);checks++;
    if(!t||t.resolvedValueString.toUpperCase()!==expected[key])errors.push(
      "Mismatch "+brand+"/"+mode+"/"+key+": "+t?.resolvedValueString+" instead of "+expected[key]);
   }
   samples.push({brand,mode,color:cmp.tokens[0]?.resolvedValueString});
  }
 }
}finally{
 const defaultBrand=catalog.themes.find(t=>t.group===group&&t.name==="default / light");
 const defaultMode=catalog.themes.find(t=>t.group==="Bluent v3 / Mode"&&t.name==="Light · Draft");
 if(defaultBrand&&!defaultBrand.active)defaultBrand.toggleActive();
 if(defaultMode&&!defaultMode.active)defaultMode.toggleActive();
}
const page=penpotUtils.getPageByName("29 · Live brand theme switching · #418");
const preview=page?.getShapeById("acf5f619-7d81-80da-8008-c5d0608ab738");
if(!preview||preview.children.length<14)errors.push("Missing component-bound live example board");
return{fileId:penpot.currentFile.id,revision:penpot.currentFile.revn,pass:errors.length===0,
 checks,errors,brands:colors.length,brandModeThemes:catalog.themes.filter(t=>t.group===group).length,
 activeThemes:catalog.themes.filter(t=>t.active).map(t=>t.name),
 paletteSets:catalog.sets.filter(s=>s.name.startsWith("bluent-v3/418/brand-preview/")&&
  !s.name.endsWith("/semantic")&&!s.name.endsWith("/component")).length,
 boundSpecimenBoardId:preview?.id,
 explanation:"Native Penpot themes and actual component alias values; browser/SSR/AT and full Fluent parity are separate."};
