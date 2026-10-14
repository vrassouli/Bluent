// Read-only connected Penpot script. Paste/execute via Penpot Plugin API (not node).
// Requires the correct project-owned Bluent v3 Design System file.
if (penpot.currentFile?.id !== "b64f6665-c9ab-80b5-8008-c4ac99d9d000") {
  throw Error("Wrong Penpot file");
}
const p = penpotUtils.getPageByName("38 · Button Focus Visible states · #501");
const original = penpotUtils.getPageByName("19 · Bluent Button native variants").root.children.find(s => s.isVariantContainer?.());
const focus = p.root.children.find(s => s.isVariantContainer?.());
const interaction = p.getShapeById("cd054205-a525-80d8-8008-c84dc7f13d55");
const responsive = p.getShapeById("cd054205-a525-80d8-8008-c84ea8fb870b");
if (!original || !focus || !interaction || !responsive) throw Error("Missing source or new board");
const appearances = ["Primary","Secondary","Outline","Subtle","Transparent"];
const states = ["Hover","Pressed","Selected","Disabled"];
const originalIDs = new Set(original.variants.variantComponents().map(c => c.id));
const errors = [];
let interactionLinks = 0, interactionRings = 0, disabled = 0;
for (const state of states) for (const appearance of appearances) {
  const name = `LINKED · ${appearance} / ${state} / ${state === "Disabled" ? "Focus Off" : "Focus Visible"}`;
  const instance = interaction.children.find(s => s.name === name);
  if (!instance?.isComponentInstance?.() || !originalIDs.has(instance.component()?.id)) errors.push("Missing source link: " + name);
  else interactionLinks++;
  const rings = interaction.children.filter(s => s.name.startsWith(`FOCUS / ${state} / ${appearance} /`));
  if (state === "Disabled") {
    disabled++;
    if (rings.length) errors.push("Disabled has focus ring: " + appearance);
  } else {
    if (rings.length !== 2 || rings.some(r => r.type !== "rectangle" || r.width <= 0 || r.height <= 0)) errors.push("Invalid rings: " + name);
    interactionRings += rings.length;
  }
}
const sourceSize = penpotUtils.getPageByName("20 · Bluent Button sizes and layout").root.children.find(s => s.isVariantContainer?.());
const sourceRtl = penpotUtils.getPageByName("25 · Button Persian RTL typography").root.children.find(s => s.isVariantContainer?.());
let responsiveLinks = 0;
for (const [prefix, expected, f] of [["LINKED size",6,sourceSize],["LINKED Persian",6,sourceRtl]]) {
  const ids = new Set(f.variants.variantComponents().map(c => c.id));
  const linked = responsive.children.filter(s => s.name.startsWith(prefix));
  if (linked.length !== expected) errors.push("Wrong responsive count: " + prefix);
  for (const shape of linked) {
    if (!shape.isComponentInstance?.() || !ids.has(shape.component()?.id)) errors.push("Broken link: " + shape.name);
    else responsiveLinks++;
  }
}
const responsiveRings = responsive.children.filter(s => s.name.startsWith("RING "));
if (responsiveRings.length !== 24 || responsiveRings.some(r => r.type !== "rectangle" || r.width <= 0 || r.height <= 0)) errors.push("Invalid responsive rings");
if (original.variants.variantComponents().length !== 25) errors.push("Original family changed");
if (focus.variants.variantComponents().length !== 10) errors.push("Separate Focus family changed");
return { issue: 501, page: p.id, interactionBoard: interaction.id, responsiveBoard: responsive.id,
  originalVariants: original.variants.variantComponents().length, focusVariants: focus.variants.variantComponents().length,
  interactionLinks, interactionRings, disabledNoFocus: disabled,
  responsiveLinks, responsiveRings: responsiveRings.length, failures: errors, pass: errors.length === 0 };
