"""#552 pinned Fluent React component API name candidates; no parity is inferred."""
import argparse, hashlib, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/"docs/v3/quality"
DIRECT=BASE/"FLUENT-PARITY-18-SOURCE-API.json"
INHERITED=BASE/"FLUENT-PARITY-18-INHERITED-API.json"
RESULT=BASE/"FLUENT-REACT-9.74.10-18-API-CANDIDATES.json"
REPORT=BASE/"FLUENT-REACT-9.74.10-18-API-CANDIDATES.md"
UMBRELLA_INTEGRITY="sha512-Guhlej7Rs7OdxiSn6DWHP8p4Elle+QIgmsIlXAruV9/ek1u+YnZFxW5EIeSYpyq/zXd+ujJ/PtQvi6g2oc4TLQ=="
ICON={"name":"@fluentui/react-icons","version":"2.0.344","integrity":"sha512-pvEVFOUrrtmIglqdfhDVX6XT80a5z9kX+Tso6NAzgmkko8nlURhOzNwvZZlsCK4yQseH/4NQdYoN8ijO7IHdNw=="}
MAP={
"Button":{"Button":[("Button","@fluentui/react-button","ButtonProps"),("ToggleButton","@fluentui/react-button","ToggleButtonProps"),("SplitButton","@fluentui/react-button","SplitButtonProps"),("CompoundButton","@fluentui/react-button","CompoundButtonProps"),("MenuButton","@fluentui/react-button","MenuButtonProps")]},
"Icon":{"Icon":[]},
"Label":{"Label":[("Label","@fluentui/react-label","LabelProps")]},
"Link":{"Link":[("Link","@fluentui/react-link","LinkProps")]},
"Badge":{"Badge":[("Badge","@fluentui/react-badge","BadgeProps"),("CounterBadge","@fluentui/react-badge","CounterBadgeProps"),("PresenceBadge","@fluentui/react-badge","PresenceBadgeProps")]},
"TextField":{"TextField":[("Input","@fluentui/react-input","InputProps"),("Field","@fluentui/react-field","FieldProps")]},
"NumericField":{"NumericField":[("SpinButton","@fluentui/react-spinbutton","SpinButtonProps"),("Field","@fluentui/react-field","FieldProps")]},
"Checkbox":{"Checkbox":[("Checkbox","@fluentui/react-checkbox","CheckboxProps"),("Field","@fluentui/react-field","FieldProps")]},
"Switch":{"Switch":[("Switch","@fluentui/react-switch","SwitchProps"),("Field","@fluentui/react-field","FieldProps")]},
"RadioGroup":{"RadioGroup":[("RadioGroup","@fluentui/react-radio","RadioGroupProps"),("Field","@fluentui/react-field","FieldProps")],"Radio":[("Radio","@fluentui/react-radio","RadioProps")]},
"SelectField":{"SelectField":[("Select","@fluentui/react-select","SelectProps"),("Dropdown","@fluentui/react-combobox","DropdownProps"),("Combobox","@fluentui/react-combobox","ComboboxProps"),("Field","@fluentui/react-field","FieldProps")]},
"DateField":{"DateField":[("Input","@fluentui/react-input","InputProps"),("Field","@fluentui/react-field","FieldProps")]},
"TimeField":{"TimeField":[("Input","@fluentui/react-input","InputProps"),("Field","@fluentui/react-field","FieldProps")]},
"MaskedField":{"MaskedField":[("Input","@fluentui/react-input","InputProps")]},
"OtpField":{"OtpField":[("Input","@fluentui/react-input","InputProps")]},
"Slider":{"Slider":[("Slider","@fluentui/react-slider","SliderProps"),("Field","@fluentui/react-field","FieldProps")]},
"RangeSlider":{"RangeSlider":[("Slider","@fluentui/react-slider","SliderProps")]},
"FileSelect":{"FileSelect":[("Input","@fluentui/react-input","InputProps"),("Field","@fluentui/react-field","FieldProps")]},
}
NOTES={
"Button":"Separate Button, ToggleButton, SplitButton, CompoundButton and MenuButton are alternatives, not a one-to-one class mapping.",
"Icon":"Fluent React Icons is a named-icon catalogue, not a generic Icon(Value, Variant) wrapper.",
"TextField":"Input is a primitive; Field is a separate label/validation wrapper.",
"NumericField":"SpinButton is the closest numeric control; Field is a separate wrapper.",
"RadioGroup":"RadioGroup and Radio are separate components.",
"SelectField":"Select, Dropdown and Combobox have distinct interaction models.",
"DateField":"No dedicated DatePicker export in this pinned umbrella; Input and Field are primitives only.",
"TimeField":"No dedicated TimePicker export in this pinned umbrella; Input and Field are primitives only.",
"MaskedField":"No dedicated masked-input export in this pinned umbrella; Input is a primitive only.",
"OtpField":"No dedicated OTP export in this pinned umbrella; Input is a primitive only.",
"RangeSlider":"No dedicated dual-thumb RangeSlider export; single Slider is not equivalent.",
"FileSelect":"No dedicated file-upload/FileSelect export; native Input type=file is a primitive only.",
}
def parse_declarations(path):
 lines=path.read_text(encoding="utf-8-sig").splitlines(); out={}; i=0
 while i<len(lines):
  m=re.match(r"^export declare (?:type|interface) (\w+)(?:\s|=|\{)",lines[i])
  if not m: i+=1; continue
  name=m.group(1); j=i+1
  while j<len(lines) and not re.match(r"^export declare (?:type|interface|const|function|class|enum)\b",lines[j]): j+=1
  names=[]
  for line in lines[i+1:j]:
   q=re.match(r"^ {4}([A-Za-z_$][\w$]*)\??:",line)
   if q: names.append(q.group(1))
  out[name]=sorted(set(names)); i=j
 return out
def load_packages(root,umbrella_path):
 root=Path(root); manifest=json.loads((root/"manifest.json").read_text(encoding="utf-8-sig"))
 umbrella=json.loads(Path(umbrella_path).read_text(encoding="utf-8-sig")); packages={}
 for x in manifest:
  d=root/x["directory"]; meta=json.loads((d/"package.json").read_text(encoding="utf-8-sig"))
  if meta["name"]!=x["name"] or meta["version"]!=x["version"]: raise ValueError("Package manifest drift")
  rng=umbrella.get("dependencies",{}).get(x["name"])
  if not rng or not rng.startswith("^"+x["version"]): raise ValueError("Pinned lower-bound mismatch: "+x["name"])
  packages[x["name"]]={"name":x["name"],"version":x["version"],"integrity":x["integrity"],"umbrellaDeclaredRange":rng,"declarations":parse_declarations(d/"index.d.ts")}
 packages[ICON["name"]]={**ICON,"umbrellaDeclaredRange":None,"declarations":{}}
 return umbrella,packages
def camel(s): return s[:1].lower()+s[1:]
def build(direct,inherited,umbrella,packages):
 if umbrella.get("name")!="@fluentui/react-components" or umbrella.get("version")!="9.74.10": raise ValueError("Unexpected umbrella pin")
 dr={f["family"]:f for f in direct["families"]}; ir={f["family"]:f for f in inherited["families"]}
 if set(MAP)!=set(dr) or len(dr)!=18: raise ValueError("Source family mismatch")
 families=[]
 pkg_for={"Button":"@fluentui/react-button","ToggleButton":"@fluentui/react-button","SplitButton":"@fluentui/react-button","CompoundButton":"@fluentui/react-button","MenuButton":"@fluentui/react-button","Label":"@fluentui/react-label","Link":"@fluentui/react-link","Badge":"@fluentui/react-badge","CounterBadge":"@fluentui/react-badge","PresenceBadge":"@fluentui/react-badge","Input":"@fluentui/react-input","SpinButton":"@fluentui/react-spinbutton","Checkbox":"@fluentui/react-checkbox","Switch":"@fluentui/react-switch","RadioGroup":"@fluentui/react-radio","Radio":"@fluentui/react-radio","Select":"@fluentui/react-select","Dropdown":"@fluentui/react-combobox","Combobox":"@fluentui/react-combobox","Slider":"@fluentui/react-slider","Field":"@fluentui/react-field"}
 for family,src in dr.items():
  ih={c["component"]:c for c in ir[family]["components"]}; components=[]
  for c in src["components"]:
   comp=c["component"]; local=ih[comp]; comparators=[]
   for up,pkgname,propsname in MAP[family][comp]:
    pkg=packages[pkgname]; decl=pkg["declarations"]; slotsname=propsname.removesuffix("Props")+"Slots"
    if propsname not in decl: raise ValueError("Missing declaration "+pkgname+"/"+propsname)
    propnames=decl[propsname]; slotnames=decl.get(slotsname,[])
    comparators.append({"component":up,"package":pkgname,"version":pkg["version"],"integrity":pkg["integrity"],"propsType":propsname,"explicitPropNames":propnames,"slotsType":slotsname if slotsname in decl else None,"explicitSlotNames":slotnames})
   lookup={}
   for cmp in comparators:
    for kind,field in (("prop","explicitPropNames"),("slot","explicitSlotNames")):
     for n in cmp[field]: lookup.setdefault(n,[]).append({"component":cmp["component"],"package":cmp["package"],"memberKind":kind})
   source=[("declared",p) for p in c["parameters"]]+[("local_inherited",p) for p in local["localInheritedParameters"]]; params=[]
   for origin,p in source:
    n=camel(p["name"])
    params.append({"name":p["name"],"kind":p["kind"],"csharpType":p["type"],"origin":origin,"sourceFile":p["declaredAt"],"sourceLine":p["line"],"normalizedName":n,"spellingCandidates":[{"name":n,**x} for x in lookup.get(n,[])],"comparisonStatus":"not_reviewed","featureSupport":"not_inferred"})
   components.append({"name":comp,"sourceDirectCount":len(c["parameters"]),"sourceLocalInheritedCount":len(local["localInheritedParameters"]),"externalFrameworkBoundary":local.get("externalFrameworkBaseBoundary",[]),"upstreamComparators":comparators,"parameters":params})
  families.append({"family":family,"productIssue":src["productIssue"],"components":components,"note":NOTES.get(family,"Name candidates only; semantic and behavioral review is pending."),"apiEquivalence":"not_reviewed","designApproval":"pending","parityAccepted":False})
 total=sum(len(c["parameters"]) for f in families for c in f["components"]); matched=sum(bool(p["spellingCandidates"]) for f in families for c in f["components"] for p in c["parameters"])
 data = {"schemaVersion":1,"auditIssue":552,"fluentReactPackage":"@fluentui/react-components","fluentReactVersion":umbrella["version"],"fluentReactIntegrity":UMBRELLA_INTEGRITY,"sourcePackageVersions":{n:{k:v for k,v in p.items() if k!="declarations"} for n,p in sorted(packages.items())},"scope":"Explicit component Props/Slots names compared with Bluent direct + locally inherited C# parameter occurrences. Native HTML/React inherited props and external Bluent base-class members are not fully expanded. Exact names are not semantic/API equivalence.","families":families,"totals":{"families":18,"components":sum(len(f["components"]) for f in families),"sourceParameterOccurrences":total,"parametersWithAtLeastOneNameCandidate":matched,"parametersWithoutNameCandidate":total-matched,"approvedMappings":0},"parityAccepted":False}
 data["snapshotSha256"]=hashlib.sha256(json.dumps(data,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode("utf-8")).hexdigest()
 return data
def render(d):
 t=d["totals"]; lines=["# #552 — Fluent React 9.74.10 API-name candidates for 18 Bluent families","",
 "**Pinned source-triage only — not Fluent 2 parity acceptance.** The umbrella package is pinned by npm tarball integrity. Thirteen component packages are pinned to exact versions at the lower bounds of the umbrella's declared dependency ranges; the umbrella does not lock a single transitive resolution.","",
 f"Across {t['families']} families and {t['components']} Bluent classes, this compares {t['sourceParameterOccurrences']} direct + locally inherited C# parameter occurrences against explicit React Props/Slots names. {t['parametersWithAtLeastOneNameCandidate']} occurrences have at least one spelling candidate; {t['parametersWithoutNameCandidate']} do not; 0 mappings are approved.","",
 "| Bluent family | Owner | Fluent React comparators | Relationship / caveat |","| --- | ---: | --- | --- |"]
 for f in d["families"]:
  names=sorted({c["component"] for x in f["components"] for c in x["upstreamComparators"]})
  lines.append(f"| {f['family']} | #{f['productIssue']} | {', '.join(names) if names else 'Icon catalogue / no 1:1 component'} | {f['note']} |")
 lines += ["","## Guardrails","",
 "- Package versions and npm integrity strings are retained in JSON. The component packages are a reproducible comparison set at the umbrella dependency lower bounds, not a claim that every consumer resolves to those exact transitive versions.",
 "- Explicit Props/Slots fields only are captured. Native HTML attributes inherited through React types and shared utility types are not exhaustively expanded.",
 "- A spelling match is a review lead, not a support guarantee; no spelling match does not prove missing capability. Events, enum semantics, accessibility, visual states, and external Bluent base-class members need manual review.",
 "- Icon is a named-icon catalogue vs generic wrapper. DateField, TimeField, MaskedField, OtpField, RangeSlider and FileSelect only have related primitives here; no direct equivalence is claimed.",
 "- The canonical #421 18-family acceptance matrix remains authoritative and unaccepted. No product code, design approval, owner issue status or stable Dev was changed.","",
 "Rebuild from exact npm tarballs with build_v3_fluent_react_crosswalk.py --write; validate the checked-in snapshot with --check. Raw third-party declarations are not committed.",""]
 return "\n".join(lines)
def validate(d,direct,inherited):
 if d.get("parityAccepted") is not False or d["totals"].get("approvedMappings")!=0: raise ValueError("Unauthorized parity approval")
 expected=hashlib.sha256(json.dumps({k:v for k,v in d.items() if k!="snapshotSha256"},ensure_ascii=False,sort_keys=True,separators=(",",":")).encode("utf-8")).hexdigest()
 if d.get("snapshotSha256")!=expected: raise ValueError("Snapshot digest drift")
 if d["fluentReactVersion"]!="9.74.10" or d["fluentReactIntegrity"]!=UMBRELLA_INTEGRITY: raise ValueError("Umbrella pin drift")
 dr={f["family"]:f for f in direct["families"]}
 if len(d["families"])!=18 or {f["family"] for f in d["families"]}!=set(MAP): raise ValueError("Family drift")
 for f in d["families"]:
  if f["productIssue"]!=dr[f["family"]]["productIssue"] or f["apiEquivalence"]!="not_reviewed" or f["designApproval"]!="pending": raise ValueError("Owner/status drift")
  for c in f["components"]:
   for p in c["parameters"]:
    if not (ROOT/p["sourceFile"]).exists() or p["sourceLine"]<=0: raise ValueError("Untraceable source parameter")
    if p["comparisonStatus"]!="not_reviewed" or p["featureSupport"]!="not_inferred": raise ValueError("Unauthorized parameter claim")
 total=sum(len(c["parameters"]) for f in d["families"] for c in f["components"]); matched=sum(bool(p["spellingCandidates"]) for f in d["families"] for c in f["components"] for p in c["parameters"])
 if total!=d["totals"]["sourceParameterOccurrences"] or matched!=d["totals"]["parametersWithAtLeastOneNameCandidate"]: raise ValueError("Count drift")
def main():
 p=argparse.ArgumentParser(); g=p.add_mutually_exclusive_group(required=True); g.add_argument("--write",action="store_true"); g.add_argument("--check",action="store_true"); p.add_argument("--source-dir",type=Path); p.add_argument("--umbrella",type=Path); a=p.parse_args()
 direct=json.loads(DIRECT.read_text(encoding="utf-8-sig")); inherited=json.loads(INHERITED.read_text(encoding="utf-8-sig"))
 if a.write:
  if not a.source_dir or not a.umbrella:p.error("--write needs --source-dir and --umbrella")
  umbrella,packages=load_packages(a.source_dir,a.umbrella); d=build(direct,inherited,umbrella,packages); RESULT.write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n",encoding="utf-8"); REPORT.write_text(render(d),encoding="utf-8")
 else:
  d=json.loads(RESULT.read_text(encoding="utf-8-sig")); validate(d,direct,inherited)
  if REPORT.read_text(encoding="utf-8-sig")!=render(d): raise ValueError("Report drift")
 print("PASS pinned Fluent React API candidates:",d["totals"])
if __name__=="__main__":main()
