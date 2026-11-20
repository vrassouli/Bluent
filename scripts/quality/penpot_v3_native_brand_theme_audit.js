// #418 live Penpot acceptance audit; run in the connected Bluent v3 Design System.
// Validates native source -> semantic -> component aliases across 10 brands x Light/Dark.
// The imported Fluent reference library remains read-only.
if(penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")throw Error("Wrong Penpot file");
const catalog=penpot.library.local.tokens;
const group="Bluent v3 / Brand×Mode (Preview)";
// brand, BrandBackground Light/Dark, Action Rest Light, Link Rest/Hover/Pressed Light,
// then independently derived Dark Action Rest / Link Rest / Hover / Pressed candidates.
const colors=[
 ["default","#1267B4","#18599B","#1267B4","#18599B","#1B4C82","#193253","#6793CF","#6793CF","#6A93D0","#6094D0"],
 ["excel","#11783F","#146938","#11783F","#146938","#165A31","#153D23","#5B9F71","#5B9F71","#60A072","#5A9F73"],
 ["office","#B53406","#9C2F09","#B53406","#9C2F09","#842A0B","#561F0B","#E56E46","#E56E46","#E86C40","#DC744D"],
 ["outlook","#1267B5","#18599C","#1267B5","#18599C","#1B4C83","#193254","#5394DD","#5394DD","#5E92DE","#4197DB"],
 ["powerapps","#8D4D8B","#823C81","#8D4D8B","#823C81","#762B76","#4E1E4E","#B082AD","#B082AD","#B082AD","#B082AE"],
 ["powerbi","#7A6519","#6B5818","#7A6519","#6B5818","#5B4C17","#3E3313","#A79036","#A79036","#AC8F1A","#A3904A"],
 ["powerpoint","#B0391A","#983318","#B0391A","#983318","#802D16","#532112","#D8765A","#D8765A","#DA7555","#D6775E"],
 ["stream","#BD1D49","#A41B3F","#BD1D49","#A41B3F","#8A1C36","#591925","#D77382","#D77382","#D9727F","#D67386"],
 ["teams","#5659BA","#4B4D9F","#5659BA","#4B4D9F","#414286","#2C2C54","#8A89D7","#8A89D7","#8B89D8","#898AD6"],
 ["word","#2F61C1","#1A54B0","#2F61C1","#1A54B0","#1D4794","#1C2F5D","#788FD4","#788FD4","#7A8ED4","#7490D4"]
];
const cmp=catalog.sets.find(s=>s.name==="bluent-v3/418/brand-preview/component");
const sem=catalog.sets.find(s=>s.name==="bluent-v3/418/brand-preview/semantic");
const paletteRoleTokens=[
 "bluent.preview.palette.actionForegroundRest",
 "bluent.preview.palette.linkForegroundRest",
 "bluent.preview.palette.linkForegroundHover",
 "bluent.preview.palette.linkForegroundPressed"
];
const componentRoles=[
 ["bluent.preview.component.button.backgroundPrimary","brand"],
 ["bluent.preview.component.button.foregroundPrimary","onBrand"],
 ["bluent.preview.component.input.background","surface"],
 ["bluent.preview.component.input.foreground","foreground"],
 ["bluent.preview.component.button.foregroundAction","actionForeground"],
 ["bluent.preview.component.link.foregroundRest","linkForegroundRest"],
 ["bluent.preview.component.link.foregroundHover","linkForegroundHover"],
 ["bluent.preview.component.link.foregroundPressed","linkForegroundPressed"]
];
const baseRoles=[
 {mode:"light",source:"bluent-v3/418/source/light",semantic:"bluent-v3/418/semantic/light",component:"bluent-v3/418/component/light"},
 {mode:"dark",source:"bluent-v3/418/source/dark",semantic:"bluent-v3/418/semantic/dark",component:"bluent-v3/418/component/dark"}
];
const baseChains=[
 ["bluent.semantic.link.foregroundRest","bluent.source.brandForegroundLink","bluent.component.link.foregroundRest"],
 ["bluent.semantic.link.foregroundHover","bluent.source.brandForegroundLinkHover","bluent.component.link.foregroundHover"],
 ["bluent.semantic.link.foregroundPressed","bluent.source.brandForegroundLinkPressed","bluent.component.link.foregroundPressed"]
];
const modeSetNames={light:"bluent-v3/draft/light",dark:"bluent-v3/draft/dark"};
const sharedFoundationSetNames=[
 "bluent-v3/draft/typography","bluent-v3/draft/spacing-scale","bluent-v3/draft/spacing-vertical",
 "bluent-v3/draft/layout","bluent-v3/draft/stroke-width","bluent-v3/draft/motion",
 "bluent-v3/draft/density","bluent-v3/draft/elevation","bluent-v3/418/foundation/aliases",
 "bluent-v3/418/foundation/semantic","bluent-v3/418/foundation/component"
];
const foundationSamples=[
 ["bluent-v3/draft/typography","bluent.type.size.100",10],
 ["bluent-v3/draft/typography","bluent.type.size.300",14],
 ["bluent-v3/draft/typography","bluent.type.size.1000",68],
 ["bluent-v3/draft/typography","bluent.type.lineHeight.1000",92],
 ["bluent-v3/draft/typography","bluent.type.weight.bold",700],
 ["bluent-v3/draft/spacing-scale","bluent.space.xxxxxl",64],
 ["bluent-v3/draft/spacing-vertical","bluent.space.vertical.xxxxxl",64],
 ["bluent-v3/draft/layout","bluent.radius.large",8],
 ["bluent-v3/draft/motion","bluent.motion.ultraSlowMs",500],
 ["bluent-v3/draft/motion","bluent.motion.reducedMs",0],
 ["bluent-v3/draft/density","bluent.field.minHeight.medium",32],
 ["bluent-v3/draft/density","bluent.density.compactGap",8],
 ["bluent-v3/draft/density","bluent.density.regularGap",12],
 ["bluent-v3/draft/density","bluent.density.comfortableGap",16],
 ["bluent-v3/draft/layout","bluent.radius.codeLarge",6],
 ["bluent-v3/draft/layout","bluent.radius.large",8],
 ["bluent-v3/draft/layout","bluent.radius.xlarge",12],
 ["bluent-v3/418/foundation/semantic","bluent.semantic.field.minHeight.medium",32],
 ["bluent-v3/418/foundation/semantic","bluent.semantic.density.gap.compact",8],
 ["bluent-v3/418/foundation/semantic","bluent.semantic.density.gap.regular",12],
 ["bluent-v3/418/foundation/semantic","bluent.semantic.density.gap.comfortable",16],
 ["bluent-v3/418/foundation/semantic","bluent.semantic.radius.large",8],
 ["bluent-v3/418/foundation/semantic","bluent.semantic.radius.xlarge",12],
 ["bluent-v3/418/foundation/semantic","bluent.semantic.radius.legacyCodeLarge",6],
 ["bluent-v3/418/foundation/component","bluent.component.textField.minHeight.medium",32],
 ["bluent-v3/418/foundation/component","bluent.component.control.gap",12]
];
const shadowSamples=[
 ["bluent.shadow.neutral.64",8,0,32,64,"bluent.color.neutralShadowAmbient","bluent.color.neutralShadowKey"],
 ["bluent.shadow.brand.8",2,0,4,8,"bluent.color.brandShadowAmbient","bluent.color.brandShadowKey"]
];
const errors=[],samples=[];let checks=0;
try{
 // Every real mode/brand theme must contain exactly one matching Light/Dark source set.
 // It must also link every shared, source-backed foundation set used by the alias chain.
 const foundationThemes=catalog.themes.filter(t=>t.group==="Bluent v3 / Mode"||t.group===group);
 for(const theme of foundationThemes){
  const mode=theme.group==="Bluent v3 / Mode"?(theme.name.startsWith("Dark")?"dark":"light"):(theme.name.endsWith("/ dark")?"dark":"light");
  const correct=catalog.sets.find(s=>s.name===modeSetNames[mode]);
  const wrong=catalog.sets.find(s=>s.name===modeSetNames[mode==="dark"?"light":"dark"]);
  checks+=2;
  if(!correct||!theme.activeSets.some(s=>s.id===correct.id))errors.push("Theme missing matching "+mode+" source set: "+theme.name);
  if(wrong&&theme.activeSets.some(s=>s.id===wrong.id))errors.push("Theme has both Light/Dark source sets active: "+theme.name);
  for(const setName of sharedFoundationSetNames){
   const set=catalog.sets.find(s=>s.name===setName);checks++;
   if(!set||!theme.activeSets.some(s=>s.id===set.id))errors.push("Theme missing foundation set "+setName+": "+theme.name);
  }
  for(const [setName,tokenName,expected] of foundationSamples){
   const set=catalog.sets.find(s=>s.name===setName),token=set?.tokens.find(t=>t.name===tokenName);checks++;
   if(!token||Number(token.resolvedValue)!==expected)errors.push("Foundation token resolution "+theme.name+"/"+tokenName+": "+token?.resolvedValue+" != "+expected);
  }
  for(const [tokenName,blur,offsetX,offsetY,spread,ambientName,keyName] of shadowSamples){
   const set=catalog.sets.find(s=>s.name==="bluent-v3/draft/elevation"),token=set?.tokens.find(t=>t.name===tokenName);checks++;
   const layers=token?.value;
   if(!Array.isArray(layers)||layers.length!==2||layers[0].blur!==String(blur)||layers[0].offsetX!==String(offsetX)||layers[0].offsetY!=="0"||layers[0].spread!=="0"||layers[0].color!=="{"+ambientName+"}"||layers[1].offsetY!==String(offsetY)||layers[1].blur!==String(spread)||layers[1].color!=="{"+keyName+"}")errors.push("Shadow source geometry/alpha references are not intact: "+theme.name+"/"+tokenName);
  }
 }
 const foundationSemantic=catalog.sets.find(s=>s.name==="bluent-v3/418/foundation/semantic");
 const foundationComponent=catalog.sets.find(s=>s.name==="bluent-v3/418/foundation/component");
 checks+=2;
 if(foundationSemantic?.tokens.length!==95)errors.push("Expected 95 native Penpot semantic aliases (9 cubic-bezier curves remain CSS-only); actual: "+foundationSemantic?.tokens.length);
 if(foundationComponent?.tokens.length!==14)errors.push("Expected 14 component consumption candidates; actual: "+foundationComponent?.tokens.length);
 // Validate the canonical source -> semantic -> component chain in the main Light/Dark sets.
 for(const entry of baseRoles){
  const sourceSet=catalog.sets.find(s=>s.name===entry.source);
  const semanticSet=catalog.sets.find(s=>s.name===entry.semantic);
  const componentSet=catalog.sets.find(s=>s.name===entry.component);
  for(const [semanticName,sourceName,componentName] of baseChains){
   const sourceToken=sourceSet?.tokens.find(t=>t.name===sourceName);
   const semanticToken=semanticSet?.tokens.find(t=>t.name===semanticName);
   const componentToken=componentSet?.tokens.find(t=>t.name===componentName);
   checks+=3;
   if(!sourceToken)errors.push("Missing source "+entry.mode+"/"+sourceName);
   if(!semanticToken||semanticToken.value!=="{"+sourceName+"}")errors.push("Bad semantic alias "+entry.mode+"/"+semanticName);
   if(!componentToken||componentToken.value!=="{"+semanticName+"}")errors.push("Bad component alias "+entry.mode+"/"+componentName);
  }
 }
 for(const row of colors){
  const [brand,brandLight,brandDark,actionLight,linkRestLight,linkHoverLight,linkPressedLight,actionDark,linkRestDark,linkHoverDark,linkPressedDark]=row;
  for(const mode of ["light","dark"]){
   const theme=catalog.themes.find(t=>t.group===group&&t.name===brand+" / "+mode);
   const modeTheme=catalog.themes.find(t=>t.group==="Bluent v3 / Mode"&&t.name.toLowerCase().startsWith(mode));
   if(!theme){errors.push("Missing theme "+brand+"/"+mode);continue;}
   if(!modeTheme){errors.push("Missing base mode "+mode);continue;}
   if(!theme.active)theme.toggleActive();
   if(!modeTheme.active)modeTheme.toggleActive();
   const expectedModeSet=catalog.sets.find(s=>s.name===modeSetNames[mode]);
   const oppositeModeSet=catalog.sets.find(s=>s.name===modeSetNames[mode==="dark"?"light":"dark"]);
   checks+=2;
   if(!expectedModeSet||!theme.activeSets.some(s=>s.id===expectedModeSet.id))errors.push("Wrong brand mode source set "+brand+"/"+mode);
   if(oppositeModeSet&&theme.activeSets.some(s=>s.id===oppositeModeSet.id))errors.push("Both mode source sets active "+brand+"/"+mode);
   const palette=catalog.sets.find(s=>s.name==="bluent-v3/418/brand-preview/"+brand+"/"+mode);
   if(!palette||palette.tokens.length!==8)errors.push("Missing or incomplete source palette "+brand+"/"+mode);
   if(!theme.activeSets.some(s=>s.id===palette?.id)||!theme.activeSets.some(s=>s.id===cmp?.id)||!theme.activeSets.some(s=>s.id===sem?.id))errors.push("Missing linked sources "+brand+"/"+mode);
   const roleValues=mode==="light"?[actionLight,linkRestLight,linkHoverLight,linkPressedLight]:[actionDark,linkRestDark,linkHoverDark,linkPressedDark];
   const expected={
    brand:mode==="light"?brandLight:brandDark,
    onBrand:"#FFFFFF",
    surface:mode==="light"?"#FFFFFF":"#292929",
    foreground:mode==="light"?"#242424":"#FFFFFF",
    actionForeground:roleValues[0],linkForegroundRest:roleValues[1],
    linkForegroundHover:roleValues[2],linkForegroundPressed:roleValues[3]
   };
   for(let i=0;i<paletteRoleTokens.length;i++){
    const token=palette?.tokens.find(t=>t.name===paletteRoleTokens[i]);
    checks++;
    if(!token||token.resolvedValueString?.toUpperCase()!==roleValues[i].toUpperCase())errors.push("Palette mismatch "+brand+"/"+mode+"/"+paletteRoleTokens[i]+": "+token?.resolvedValueString+" != "+roleValues[i]);
   }
   for(const [name,key] of componentRoles){
    const token=cmp?.tokens.find(t=>t.name===name);checks++;
    if(!token||token.resolvedValueString?.toUpperCase()!==expected[key].toUpperCase())errors.push("Component mismatch "+brand+"/"+mode+"/"+name+": "+token?.resolvedValueString+" != "+expected[key]);
   }
   samples.push({brand,mode,linkRoles:componentRoles.slice(4).map(([name])=>cmp.tokens.find(t=>t.name===name)?.resolvedValueString)});
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
return {fileId:penpot.currentFile.id,revision:penpot.currentFile.revn,pass:errors.length===0,checks,errors,brands:colors.length,brandModeThemes:catalog.themes.filter(t=>t.group===group).length,modeSourceSetExclusive:true,foundationSharedSets:sharedFoundationSetNames.length,foundationResolvedSamples:foundationSamples.length,shadowSourceGeometrySamples:shadowSamples.length,foundationSemanticAliases:foundationSemantic?.tokens.length,foundationComponentCandidates:foundationComponent?.tokens.length,linkRoleLayers:{source:3,semantic:3,component:3},activeThemes:catalog.themes.filter(t=>t.active).map(t=>({group:t.group,name:t.name})),boundSpecimenBoardId:preview?.id};
