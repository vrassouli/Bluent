#!/usr/bin/env python3
"""Source-only, deterministic CSS audit for Bluent v3 #417 (not runtime evidence)."""
import argparse
from collections import Counter
import json
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[2]
ROUTES=("Bluent.UI/Styles","Bluent.UI.Charts","Bluent.UI.Diagrams","Bluent.UI.Utilities")
def relative(p): return p.relative_to(ROOT).as_posix()
def audit():
    bases=[ROOT/"src"/r for r in ROUTES]
    files=sorted((f for b in bases if b.exists() for f in b.rglob("*.scss")),key=relative)
    total=Counter();defs=set();uses=set();bootstrap=[];root=[];detail=[]
    for f in files:
        content=f.read_text(encoding="utf-8-sig")
        clean=re.sub(r"/\*.*?\*/","",content,flags=re.S)
        clean=re.sub(r"(?m)^\s*//.*$","",clean)
        patterns={"legacy_imports":r"@import\s","sass_module_imports":r"@(?:use|forward)\s",
                  "literal_hex_colors":r"(?<![\w-])#[\da-fA-F]{3,8}\b",
                  "literal_dimensions":r"(?<![\w-])-?\d+(?:\.\d+)?(?:px|rem|em|vh|vw)\b",
                  "important":r"!important\b"}
        counts={key:len(re.findall(regex,clean)) for key,regex in patterns.items()}
        counts["lines"]=len(content.splitlines())
        for key,value in counts.items():total[key]+=value
        defs.update(re.findall(r"(?<![\w-])(--[\w-]+)\s*:",clean))
        uses.update(re.findall(r"var\(\s*(--[\w-]+)",clean))
        hits=re.findall(r"@(?:import|use|forward)\s+[\"']([^\"']+)[\"']",clean)
        for dep in hits:
            if "bootstrap" in dep.lower():bootstrap.append({"file":relative(f),"import":dep})
        if re.search(r"(?m)^\s*:root\s*\{",clean):root.append(relative(f))
        detail.append({"file":relative(f),**counts})
    position=[]
    for b in (ROOT/"src").glob("Bluent*.Scripts"):
        for f in (b/"src").rglob("*.ts"):
            if any(s in {"obj","bin","node_modules"} for s in f.parts):continue
            n=len(re.findall(r"getBoundingClientRect|offset(?:Width|Height|Top|Left)|getComputedStyle|style\.(?:left|top|right|bottom|transform|zIndex)",f.read_text(encoding="utf-8-sig",errors="replace")))
            if n:position.append({"file":relative(f),"signals":n})
    return {"note":"Lexical source signals, not resolved CSS/selector specificity, browser or accessibility proof.",
            "scss_file_count":len(files),"packages":dict(sorted(Counter(f.relative_to(ROOT).parts[1] for f in files).items())),
            "totals":dict(sorted(total.items())),"bootstrap_imports":bootstrap,"global_root_files":root,
            "defined_css_vars":len(defs),"referenced_css_vars":len(uses),
            "unresolved_css_vars":sorted(uses-defs),"javascript_positioning_candidates":position,
            "files":detail}
if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("--json",action="store_true");args=p.parse_args()
    result=audit()
    if args.json: print(json.dumps(result,indent=2))
    else:
        for key,value in result.items():
            if key not in ("files","unresolved_css_vars"):print(f"{key}: {value}")
        print(f"unresolved_css_var_count: {len(result['unresolved_css_vars'])}")
