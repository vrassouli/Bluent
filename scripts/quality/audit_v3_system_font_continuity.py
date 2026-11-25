#!/usr/bin/env python3
"""#418 scoped system-font continuity contract; never reads/distributes font bytes."""
from __future__ import annotations
import json
from pathlib import Path
from generate_v3_scoped_brands import read_source, ROOT

POLICY_FILE=ROOT/"docs/v3/tokens/issue-418-system-font-continuity.json"
FONTS=ROOT/"src/Bluent.UI/wwwroot/fonts"
FONT_EXT={".woff",".woff2",".ttf",".otf",".eot"}
def validate(policy:dict, sources:dict, font_paths:list[str])->list[str]:
    errors=[]
    src=policy["source"]
    if policy.get("issue")!=418 or policy.get("contractVersion")!=1:
        errors.append("Unexpected #418 source contract version")
    if not src["stack"].startswith("'Segoe UI', "):
        errors.append("Segoe UI must remain first quoted system family")
    if len(src["brands"])!=10 or src["modes"]!=["light","dark"]:
        errors.append("10-brand Light/Dark policy changed")
    expected={(b,m) for b in src["brands"] for m in src["modes"]}
    if set(sources)!=expected:errors.append("Incomplete brand/mode matrix")
    for key in sorted(expected & set(sources)):
        if sources[key].get(src["variable"])!=src["stack"]:
            errors.append("CSS font fallback drift "+"/".join(key))
    penpot=policy["penpot"]
    if (penpot["tokenName"]!="bluent.type.family.base" or
        penpot["tokenSet"]!="bluent-v3/draft/typography" or
        penpot["quotedRawValue"]!='"Segoe UI"' or
        penpot["expectedResolvedValue"]!="Segoe UI"):
        errors.append("Penpot multiword family serialization changed")
    expectedFonts={policy["packaging"]["existingIconFontSubdirectory"]+"/"+f
                   for f in policy["packaging"]["expectedExistingIconFontFiles"]}
    if set(font_paths)!=expectedFonts:
        errors.append("Unexpected/new/missing font binaries: "+
                      str(sorted(set(font_paths)^expectedFonts)))
    if policy["packaging"]["noNewTextFonts"] is not True:
        errors.append("Unexpected bundled text font")
    if any(policy["acceptance"][key] is not False for key in
       ["finalPersianGlyphShapingApproved","nativeContrastThemesApproved",
        "screenReaderApproved","publicTypographyApiApproved"]):
        errors.append("Cannot certify native Persian/OS/AT or API via CSS source tests")
    return errors

def inspect()->dict:
    policy=json.loads(POLICY_FILE.read_text(encoding="utf-8"))
    src=policy["source"]
    matrix={(b,m):read_source(b,m) for b in src["brands"] for m in src["modes"]}
    fonts=sorted(p.relative_to(ROOT).as_posix()
       for p in FONTS.rglob("*") if p.is_file() and p.suffix.lower() in FONT_EXT)
    errors=validate(policy,matrix,fonts)
    return {"pass":not errors,"issue":418,"brandModeCombinations":len(matrix),
      "existingFontAssets":fonts,"penpotExpected":policy["penpot"]["expectedResolvedValue"],
      "nativeGlyphOrATApproved":False,"errors":errors}

if __name__=="__main__":
    v=inspect()
    print(json.dumps(v,indent=2,ensure_ascii=False))
    if v["errors"]:raise SystemExit(1)
