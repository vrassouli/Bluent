// Execute in the connected project-owned Bluent v3 Penpot plugin context.
// #501: real local focus variant geometry/link evidence; NOT runtime a11y.
if (penpot.currentFile?.id !== "b64f6665-c9ab-80b5-8008-c4ac99d9d000") {
  throw Error("Wrong Penpot file: expected Bluent v3 Design System");
}
const page = penpotUtils.getPageByName("38 · Button Focus Visible states · #501");
const family = page?.getShapeById("535db143-a732-807e-8008-c64f10ae5f75");
const preview = page?.getShapeById("535db143-a732-807e-8008-c64f3402325d");
if (!family?.isVariantContainer() || !preview) throw Error("Missing native focus family/preview board");
const all = family.variants.variantComponents(), failures = [], appearances = ["Primary", "Secondary", "Outline", "Subtle", "Transparent"];
if (family.variants.properties.join("|") !== "Appearance|Focus") failures.push("Invalid axes");
if (all.length !== 10 || new Set(all.map(v => JSON.stringify(v.variantProps))).size !== 10) failures.push("Missing/duplicate variants");
for (const appearance of appearances) {
  const pair = ["Off","Visible"].map(focus => all.find(c => c.variantProps.Appearance === appearance && c.variantProps.Focus === focus));
  if (pair.some(x => !x)) { failures.push(appearance + ": missing variant"); continue; }
  const source = pair.map(x => x.mainInstance());
  const nested = source.map(root => root.children.find(x => x.name.startsWith("Linked")));
  if (nested.some(x => !x?.component())) failures.push(appearance + ": lost nested source link");
  const labels = nested.map(btn => btn?.children?.find(x => x.name === "Button label"));
  const normalized = labels.map((t, i) => t ? [t.x-source[i].x,t.y-source[i].y,t.width,t.height] : null);
  if (normalized.some(x => !x) || normalized[0].some((v,i) => Math.abs(v-normalized[1][i]) > 0.01)) failures.push(appearance + ": label reflow");
  if (source[1].children.filter(x => x.name.startsWith("Focus Visible")).length !== 2) failures.push(appearance + ": incomplete ring");
  if (source[0].children.some(x => x.name.startsWith("Focus Visible"))) failures.push(appearance + ": focus ring on Off variant");
}
const linked = preview.children.filter(x => x.name.startsWith("LINKED "));
if (linked.length !== 10 || linked.some(x => !all.some(v => v.id === x.component()?.id))) failures.push("Missing/unlinked previews");
return { issue: 501, page: page.id, family: family.id, variants: all.length, uniqueTuples: new Set(all.map(v => JSON.stringify(v.variantProps))).size, linkedPreviews: linked.length, pairsChecked: appearances.length, failures, pass: failures.length === 0 };

