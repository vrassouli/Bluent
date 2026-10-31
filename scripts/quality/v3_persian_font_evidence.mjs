// #418: classify headless Windows CDP Persian font telemetry honestly.
// A missing platform-font result must NOT be promoted to proven glyph rendering.
// This pure policy is exercised with positive and negative fixtures.
export function assessPersianFontEvidence(actualFonts, layout) {
  const semanticLayout=!!layout&&layout.lang==="fa"&&layout.rtl==="rtl"&&
    Number.isInteger(layout.chars)&&layout.chars>=30&&layout.zwnj===true&&
    typeof layout.fontFamily==="string"&&layout.fontFamily.trim().length>0&&
    Number.isFinite(layout.width)&&layout.width>0&&
    Number.isFinite(layout.height)&&layout.height>0&&
    Number.isFinite(layout.hostWidth)&&layout.hostWidth>0&&
    Number.isFinite(layout.hostHeight)&&layout.hostHeight>0&&
    layout.visible===true;
  const telemetered=Array.isArray(actualFonts)&&actualFonts.some(f=>
    typeof f.family==="string"&&f.family.trim().length>0&&
    Number.isFinite(f.glyphCount)&&f.glyphCount>0);
  const unavailable=Array.isArray(actualFonts)&&actualFonts.length===0;
  const evidenceLevel=telemetered?"platform-glyph-observed":
    unavailable?"semantic-layout-only":"invalid-or-incomplete";
  return {
    pass:semanticLayout&&(telemetered||unavailable),
    evidenceLevel,
    gap:unavailable?
      "Chromium platform-font CDP returned no Persian glyph-family telemetry; semantic text/layout passed but actual Persian font/glyph visual acceptance remains unverified":
      null
  };
}
