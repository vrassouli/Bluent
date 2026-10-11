// Run in the connected Penpot execute_code environment (not Node).
// This audits independently linked designs and IDENTIFIES gaps; it does not
// certify that Bluent matches imported Fluent, nor mutate the upstream kit.
if (penpot.currentFile?.id !== "b64f6665-c9ab-80b5-8008-c4ac99d9d000") {
  throw Error("Expected the project-owned Bluent v3 Design System file");
}
const page = penpotUtils.getPageByName("22 · Button Fluent parity review");
const board = page?.getShapeById("e31294c6-7c55-805f-8008-c5a91188deb7");
const connected = penpot.library.connected.find(l => l.name === "Microsoft Fluent 2 Web (Community)");
const sourceFamily = connected?.components.find(c => c.name === "Button");
const localFamily = penpotUtils.getPageByName("19 · Bluent Button native variants")
  ?.getShapeById("e31294c6-7c55-805f-8008-c5900fba48e4");
if (!board || !sourceFamily || !localFamily?.isVariantContainer())
  throw Error("Button reference/local design assets are missing");
const source = sourceFamily.variants.variantComponents();
const local = localFamily.variants.variantComponents();
const sourceIds = new Set(source.map(v => v.id));
const localIds = new Set(local.map(v => v.id));
const styles = [
  ["Secondary (Default)","Secondary"],
  ["Primary","Primary"],["Outline","Outline"],["Subtle","Subtle"],
  ["Transparent","Transparent"]
];
const states = ["Rest","Disabled"];
const structuralErrors = [];
const pairs = [];
function allText(root) {
  const result = [];
  function walk(s, depth) {
    if (s?.type === "text" && !s.hidden) result.push(s.characters);
    if(depth < 8) for(const child of s?.children||[])walk(child, depth+1);
  }
  walk(root,0);return result;
}
for(const [sourceStyle,localStyle] of styles) {
  for(const state of states) {
    const refVariant = source.find(v =>
      v.variantProps.Layout === "Icon and label (Default)" &&
      v.variantProps.Size === "Medium (Default)" &&
      v.variantProps.Style === sourceStyle &&
      v.variantProps.State === state);
    const ownVariant = local.find(v =>
      v.variantProps.Appearance === localStyle &&
      v.variantProps.State === state);
    if (!refVariant || !ownVariant) {
      structuralErrors.push("Missing variant "+sourceStyle+"/"+state);
      continue;
    }
    const upstream = board.children.find(s=>s.name ===
      "LINKED · UPSTREAM · "+localStyle+" · "+state);
    const bluent = board.children.find(s=>s.name ===
      "LINKED · BLUENT · "+localStyle+" · "+state);
    if (!upstream?.isComponentInstance() || !sourceIds.has(upstream.component()?.id) ||
        upstream.component()?.id !== refVariant.id)
      structuralErrors.push("Broken imported source link "+localStyle+"/"+state);
    if (!bluent?.isComponentInstance() || !localIds.has(bluent.component()?.id) ||
        bluent.component()?.id !== ownVariant.id)
      structuralErrors.push("Broken local component link "+localStyle+"/"+state);
    const refRoot = refVariant.mainInstance(), ownRoot=ownVariant.mainInstance();
    const ownFace = ownRoot?.children.find(s=>s.name==="Button face");
    if (!ownFace) {
      structuralErrors.push("Missing native face "+localStyle+"/"+state);
      continue;
    }
    pairs.push({
      style:localStyle,state,
      sourceComponentId:refVariant.id,localComponentId:ownVariant.id,
      refFrame:[refRoot.width,refRoot.height],
      localFace:[ownFace.width,ownFace.height],
      widthDifference:ownFace.width-refRoot.width,
      heightDifference:ownFace.height-refRoot.height,
      sourceCopy:allText(refRoot).join(" | "),
      localCopy:allText(ownRoot).join(" | "),
      sourceHasIllustratedIcon:!!refRoot.children.find(s=>s.name==="Placeholder"&&!s.hidden),
      localHasIcon:!!ownRoot.children.find(s=>s.name==="Icon")
    });
  }
}
if (source.length!==150 || local.length!==25)structuralErrors.push("Source/native variant inventory changed");
const unmatchedLabelPairs = pairs.filter(p=>p.sourceCopy!==p.localCopy).length;
const missingLocalIconPairs = pairs.filter(p=>p.sourceHasIllustratedIcon&&!p.localHasIcon).length;
const structuralPass = structuralErrors.length===0 && pairs.length===10;
return {
  fileId:penpot.currentFile.id,revision:penpot.currentFile.revn,
  boardId:board.id,structuralPass,structuralErrors,
  linkedReferenceLocalPairs:pairs.length,originalFluentVariants:source.length,
  localButtonVariants:local.length,unmatchedLabelPairs,
  missingLocalIconPairs,
  sizes:[...new Set(pairs.map(p=>JSON.stringify({
    reference:p.refFrame,nativeFace:p.localFace,
    delta:[p.widthDifference,p.heightDifference]
  })))].map(JSON.parse),
  parityApproved:false,
  gapPolicy:"Different example strings and icon contents prevent apples-to-apples pixel assertions",
  sample:pairs[0]
};