// #418 native Penpot TokenSet audit.
// Run the complete file inside Penpot execute_code with the source-owned Bluent v3 Design System open.
// The audit is read-only except for temporary Light/Dark theme activation. Original active themes are restored.
if (penpot.currentFile?.id !== "b64f6665-c9ab-80b5-8008-c4ac99d9d000") {
  throw new Error("Open Bluent v3 Design System before running this audit.");
}
const catalog = penpot.library.local.tokens;
const initialThemes = catalog.themes.filter(x => x.active).map(x => ({group:x.group,name:x.name}));
const errors = [];
let checks = 0;
const verify = (ok, message) => { checks++; if (!ok) errors.push(message); };
const source = {
  light: {
    "bluent.color.background1":"#FFFFFF","bluent.color.foreground1":"#242424","bluent.color.foreground4":"#707070",
    "bluent.color.brandBackground":"#1267B4","bluent.color.stroke1":"#D1D1D1","bluent.color.brandForeground1":"#1267B4",
    "bluent.source.onBrand":"#FFFFFF","bluent.source.strokeAccessible":"#616161","bluent.source.dangerForeground":"#B10E1C",
    "bluent.source.foregroundDisabled":"#BDBDBD","bluent.source.backgroundDisabled":"#F0F0F0",
    "bluent.source.paletteRedForeground1":"#BC2F32","bluent.source.focusStroke2":"#000000",
    "bluent.color.brandForegroundLink":"#18599B","bluent.color.brandForegroundLinkHover":"#1B4C82",
    "bluent.color.brandForegroundLinkPressed":"#193253"
  },
  dark: {
    "bluent.color.background1":"#292929","bluent.color.foreground1":"#FFFFFF","bluent.color.foreground4":"#999999",
    "bluent.color.brandBackground":"#18599B","bluent.color.stroke1":"#666666","bluent.color.brandForeground1":"#4F82C8",
    "bluent.source.onBrand":"#FFFFFF","bluent.source.strokeAccessible":"#ADADAD","bluent.source.dangerForeground":"#DC626D",
    "bluent.source.foregroundDisabled":"#5C5C5C","bluent.source.backgroundDisabled":"#141414",
    "bluent.source.paletteRedForeground1":"#E37D80","bluent.source.focusStroke2":"#FFFFFF",
    "bluent.color.brandForegroundLink":"#4F82C8","bluent.color.brandForegroundLinkHover":"#6790CF",
    "bluent.color.brandForegroundLinkPressed":"#3174C2"
  }
};
const semantic = {
  "bluent.semantic.surface.default":"bluent.color.background1",
  "bluent.semantic.text.primary":"bluent.color.foreground1",
  "bluent.semantic.text.placeholder":"bluent.color.foreground4",
  "bluent.semantic.action.background":"bluent.color.brandBackground",
  "bluent.semantic.action.foreground":"bluent.color.brandForeground1",
  "bluent.semantic.action.onBrand":"bluent.source.onBrand",
  "bluent.semantic.border.default":"bluent.color.stroke1",
  "bluent.semantic.border.strong":"bluent.source.strokeAccessible",
  "bluent.semantic.status.danger":"bluent.source.dangerForeground",
  "bluent.semantic.text.disabled":"bluent.source.foregroundDisabled",
  "bluent.semantic.surface.disabled":"bluent.source.backgroundDisabled",
  "bluent.semantic.border.focus":"bluent.color.brandBackground",
  "bluent.semantic.text.dangerAccessible":"bluent.source.paletteRedForeground1",
  "bluent.semantic.focusRing.strongCandidate":"bluent.source.focusStroke2",
  "bluent.semantic.link.foregroundRest":"bluent.color.brandForegroundLink",
  "bluent.semantic.link.foregroundHover":"bluent.color.brandForegroundLinkHover",
  "bluent.semantic.link.foregroundPressed":"bluent.color.brandForegroundLinkPressed"
};
const component = {
  "bluent.component.button.backgroundPrimary":"bluent.semantic.action.background",
  "bluent.component.button.foregroundPrimary":"bluent.semantic.action.onBrand",
  "bluent.component.button.foregroundDefault":"bluent.semantic.text.primary",
  "bluent.component.textField.background":"bluent.semantic.surface.default",
  "bluent.component.textField.stroke":"bluent.semantic.border.strong",
  "bluent.component.checkbox.checkedFill":"bluent.semantic.action.background",
  "bluent.component.switch.checkedTrack":"bluent.semantic.action.background",
  "bluent.component.badge.dangerForeground":"bluent.semantic.status.danger",
  "bluent.component.badge.dangerTextAccessible":"bluent.semantic.text.dangerAccessible",
  "bluent.component.button.focusOuterCandidate":"bluent.semantic.focusRing.strongCandidate",
  "bluent.component.link.foregroundRest":"bluent.semantic.link.foregroundRest",
  "bluent.component.link.foregroundHover":"bluent.semantic.link.foregroundHover",
  "bluent.component.link.foregroundPressed":"bluent.semantic.link.foregroundPressed"
};
const brands = ["default","excel","office","outlook","powerapps","powerbi","powerpoint","stream","teams","word"];
const paletteNames = [
  "bluent.preview.source.surface","bluent.preview.source.foreground","bluent.preview.source.brandBackground",
  "bluent.preview.source.onBrand","bluent.preview.palette.actionForegroundRest","bluent.preview.palette.linkForegroundRest",
  "bluent.preview.palette.linkForegroundHover","bluent.preview.palette.linkForegroundPressed"
];
const sharedSemantic = {
  "bluent.preview.semantic.surface.default":"{bluent.preview.source.surface}",
  "bluent.preview.semantic.text.primary":"{bluent.preview.source.foreground}",
  "bluent.preview.semantic.action.background":"{bluent.preview.source.brandBackground}",
  "bluent.preview.semantic.action.foreground":"{bluent.preview.source.onBrand}",
  "bluent.preview.semantic.action.foregroundRest":"{bluent.preview.palette.actionForegroundRest}",
  "bluent.preview.semantic.link.foregroundRest":"{bluent.preview.palette.linkForegroundRest}",
  "bluent.preview.semantic.link.foregroundHover":"{bluent.preview.palette.linkForegroundHover}",
  "bluent.preview.semantic.link.foregroundPressed":"{bluent.preview.palette.linkForegroundPressed}"
};
const sharedComponent = {
  "bluent.preview.component.button.backgroundPrimary":"{bluent.preview.semantic.action.background}",
  "bluent.preview.component.button.foregroundPrimary":"{bluent.preview.semantic.action.foreground}",
  "bluent.preview.component.input.background":"{bluent.preview.semantic.surface.default}",
  "bluent.preview.component.input.foreground":"{bluent.preview.semantic.text.primary}",
  "bluent.preview.component.button.foregroundAction":"{bluent.preview.semantic.action.foregroundRest}",
  "bluent.preview.component.link.foregroundRest":"{bluent.preview.semantic.link.foregroundRest}",
  "bluent.preview.component.link.foregroundHover":"{bluent.preview.semantic.link.foregroundHover}",
  "bluent.preview.component.link.foregroundPressed":"{bluent.preview.semantic.link.foregroundPressed}"
};
const tokenMap = sets => new Map(sets.flatMap(set => set.tokens.map(token => [token.name, token])));
try {
  for (const mode of ["light","dark"]) {
    const theme = catalog.themes.find(x => x.group === "Bluent v3 / Mode" && x.name.toLowerCase().startsWith(mode));
    verify(!!theme, "Missing mode theme " + mode);
    if (!theme) continue;
    if (!theme.active) theme.toggleActive();
    const active = tokenMap(theme.activeSets);
    for (const setName of [
      "bluent-v3/draft/" + mode,"bluent-v3/418/source/" + mode,
      "bluent-v3/418/semantic/" + mode,"bluent-v3/418/component/" + mode,
      "bluent-v3/418/a11y/" + mode,"bluent-v3/418/focus-candidate/" + mode,
      "bluent-v3/418/foundation/aliases","bluent-v3/418/foundation/semantic","bluent-v3/418/foundation/component"
    ]) verify(theme.activeSets.some(set => set.name === setName), "Missing mode TokenSet " + setName);
    for (const [name,value] of Object.entries(source[mode])) {
      const token = active.get(name);
      verify(!!token, "Missing source " + mode + "/" + name);
      if (token) verify((token.resolvedValueString || token.value || "").toUpperCase() === value,
        "Source value mismatch " + mode + "/" + name);
    }
    for (const [name,targetName] of Object.entries(semantic)) {
      const token = active.get(name);
      verify(!!token, "Missing semantic " + mode + "/" + name);
      if (token) {
        verify(token.value === "{" + targetName + "}", "Semantic alias mismatch " + mode + "/" + name);
        const target = active.get(targetName);
        verify(!!target, "Missing semantic target " + mode + "/" + targetName);
        if (target) verify(token.resolvedValueString === target.resolvedValueString, "Semantic resolved value mismatch " + mode + "/" + name);
      }
    }
    for (const [name,targetName] of Object.entries(component)) {
      const token = active.get(name);
      verify(!!token, "Missing component " + mode + "/" + name);
      if (token) {
        verify(token.value === "{" + targetName + "}", "Component alias mismatch " + mode + "/" + name);
        const target = active.get(targetName);
        verify(!!target, "Missing component target " + mode + "/" + targetName);
        if (target) verify(token.resolvedValueString === target.resolvedValueString, "Component resolved value mismatch " + mode + "/" + name);
      }
    }
  }
  const brandThemes = catalog.themes.filter(x => x.group === "Bluent v3 / Brand×Mode (Preview)");
  verify(brandThemes.length === 20, "Expected 20 Brand×Mode themes, found " + brandThemes.length);
  for (const brand of brands) for (const mode of ["light","dark"]) {
    const themeName = brand + " / " + mode;
    const theme = brandThemes.find(x => x.name === themeName);
    verify(!!theme, "Missing brand theme " + themeName);
    if (!theme) continue;
    const paletteName = "bluent-v3/418/brand-preview/" + brand + "/" + mode;
    const palette = catalog.sets.find(x => x.name === paletteName);
    verify(!!palette, "Missing palette set " + paletteName);
    if (palette) {
      verify(palette.tokens.length === 8, "Expected eight palette roles in " + paletteName);
      for (const name of paletteNames) verify(palette.tokens.some(x => x.name === name), "Missing " + name + " in " + paletteName);
      verify(theme.activeSets.some(x => x.id === palette.id), "Brand theme missing palette set " + paletteName);
    }
    for (const [setName,expected] of [
      ["bluent-v3/418/brand-preview/semantic",sharedSemantic],
      ["bluent-v3/418/brand-preview/component",sharedComponent]
    ]) {
      const set = catalog.sets.find(x => x.name === setName);
      verify(!!set, "Missing shared set " + setName);
      if (set) {
        verify(theme.activeSets.some(x => x.id === set.id), "Brand theme missing shared set " + setName);
        for (const [name,value] of Object.entries(expected)) {
          const token = set.tokens.find(x => x.name === name);
          verify(!!token, "Missing shared alias " + name);
          if (token) verify(token.value === value, "Incorrect shared alias " + name);
        }
      }
    }
  }
} finally {
  for (const prior of initialThemes) {
    const theme = catalog.themes.find(x => x.group === prior.group && x.name === prior.name);
    if (theme && !theme.active) theme.toggleActive();
  }
}
return {
  fileId:penpot.currentFile.id,
  revision:penpot.currentFile.revn,
  pass:errors.length === 0,
  checks,
  passed:checks-errors.length,
  failed:errors.length,
  errors,
  logicalTokenCounts:{source:16,semantic:17,component:13,total:46},
  nativeBrandThemes:20,
  brandPaletteTokenCountPerTheme:8,
  sharedBrandSemanticTokens:8,
  sharedBrandComponentTokens:8,
  restoredThemes:initialThemes
};