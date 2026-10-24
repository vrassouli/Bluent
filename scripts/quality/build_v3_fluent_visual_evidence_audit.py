import argparse, json
from pathlib import Path
import build_v3_fluent_token_theme_audit as token_audit
import build_v3_fluent_responsive_rtl_audit as rtl_audit
import build_v3_fluent_blazor_extensions_audit as blazor_audit
import build_v3_fluent_design_artifact_audit as design_audit

ROOT=Path(__file__).resolve().parents[2]
Q=ROOT/'docs/v3/quality'
MATRIX=Q/'FLUENT-PARITY-RETRO-AUDIT.json'
CANDIDATES=Q/'FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json'
JSON_OUT=Q/'FLUENT-PARITY-VISUAL-EVIDENCE-AUDIT.json'
MD_OUT=Q/'FLUENT-PARITY-VISUAL-EVIDENCE-AUDIT.md'
DATE='2026-10-24'
BASELINE='73155f02'
KEYS={'scenario','mode','screenshot','screenshots','name','label','state','variant','case','screenshotname','image','theme','dir','direction'}
def readj(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def collect_labels(obj,key=None):
    out=[]
    if isinstance(obj,dict):
        for k,v in obj.items():
            if isinstance(v,(dict,list)):
                out.extend(collect_labels(v,k.lower()))
            elif isinstance(v,str) and k.lower() in KEYS:
                out.append(v.upper())
    elif isinstance(obj,list):
        for v in obj: out.extend(collect_labels(v,key))
    elif isinstance(obj,str) and key in KEYS:
        out.append(obj.upper())
    return out
def evidence_info(name):
    out=[]
    filenames=list(rtl_audit.EVIDENCE[name])
    if name in {'Slider','RangeSlider','FileSelect'} and 'BLUENT-LAB-P0-CHROME.json' not in filenames:
        filenames.append('BLUENT-LAB-P0-CHROME.json')
    if name in {'Button','Slider','RangeSlider','FileSelect'} and 'BLUENT-LAB-P0-FORCED-COLORS-CHROME.json' not in filenames:
        filenames.append('BLUENT-LAB-P0-FORCED-COLORS-CHROME.json')
    for filename in filenames:
        p=Q/'evidence'/filename
        if not p.is_file(): raise ValueError(f'Missing visual evidence for {name}: {filename}')
        d=readj(p); labels=collect_labels(d); labels.append(filename.upper()); raw=' '.join(labels)
        out.append({'file':'evidence/'+filename,'engine':d.get('engine') or ('edge' if 'EDGE' in filename else 'chrome'),
          'labels':sorted(set(labels))[:20],
          'lightLtr':('LIGHT-LTR' in raw or ('LIGHT' in raw and 'LTR' in raw)),
          'darkRtl':('DARK-RTL' in raw or ('DARK' in raw and 'RTL' in raw)),
          'forcedColors':'FORCED-COLORS' in raw,
          'reducedMotion':'REDUCED-MOTION' in raw,
          'focusState':'FOCUS' in raw,
          'hoverState':'HOVER' in raw,
          'disabledState':'DISABLED' in raw,
          'pressedOrSelectedState':('PRESSED' in raw or 'SELECTED' in raw),
          'narrowOrZoomProxy':('ZOOM-200' in raw or 'MOBILE-320' in raw)})
    return out
def build():
    matrix=readj(MATRIX); cand=readj(CANDIDATES)
    mf={f['family']:f for f in matrix['families']}; cf={f['family']:f for f in cand['families']}
    design_ledger,_=design_audit.build()
    df={f['family']:f for f in design_ledger['families']}
    if set(rtl_audit.EVIDENCE)!=set(mf) or set(token_audit.STYLE_MAP)!=set(mf) or set(df)!=set(mf):
        raise ValueError('Visual evidence audit must cover exactly all 18 families')
    families=[]
    for name,f in mf.items():
        evidence=evidence_info(name)
        design=df[name]
        source_files=blazor_audit.component_sources([c['name'] for c in cf[name]['components']])
        style_files=['src/Bluent.UI/Styles/'+p for p in token_audit.STYLE_MAP[name]]
        if not any(x['lightLtr'] for x in evidence): raise ValueError(f'No Light/LTR screenshot evidence linked for {name}')
        if not any(x['darkRtl'] for x in evidence): raise ValueError(f'No Dark/RTL screenshot evidence linked for {name}')
        if not design['designPages']:
            visual_gap='No family-specific editable design artifact in the dated Penpot record; a design-to-browser comparison cannot be completed for this family.'
        elif name == 'Button':
            visual_gap='A narrow primary-Button host-crop pixel diagnostic exists for Light/LTR and Dark/RTL; no approved state-by-state Fluent/Penpot-to-browser comparison or design-owner sign-off exists.'
        elif design['designArtifactStatus']=='dedicated-review-board-incomplete-variant-coverage':
            visual_gap=f'An editable {name} review board exists, but its reusable variant set is explicitly incomplete; no approved state-by-state Fluent/Penpot-to-browser comparison or pixel-diff is recorded.'
        else:
            visual_gap='Draft design pages exist, but no approved state-by-state design-to-browser comparison or pixel-diff is recorded.'
        family_report='docs/v3/quality/'+blazor_audit.A[name][4]
        families.append({'family':name,'productIssue':f['productIssue'],'dimension':'visual','dimensionStatus':'audited_gaps','designArtifactStatus':design['designArtifactStatus'],'designPages':design['designPages'],'styleFiles':style_files,'sourceFiles':source_files,'visualGap':visual_gap,'followUp':('The unchanged-source route now has paired Chrome/Edge screenshots at 320 CSS px in Light/LTR and Dark/RTL. The SVG still paints at 253x253 px inside a 253x16 px wrapper, without document-level horizontal overflow. A complete same-state Fluent/Penpot comparison and design-owner approval remain open.' if name=='Icon' else ('Review the Slider design draft against the pinned Fluent range/slider contract, then capture matched screenshots and obtain design-owner approval; do not implement while the owning issue remains Backlog.' if name=='Slider' else ('Review the two-thumb RangeSlider draft against the pinned Fluent references and settle ordering/clamping/keyboard semantics before matched screenshot comparison; do not implement while the owning issue remains Backlog.' if name=='RangeSlider' else ('Review the primary-Button crop diagnostic against the approved Penpot appearance/state design, document font/token/geometry differences, and obtain design-owner approval; these crops cover only two visual modes.' if name=='Button' else 'Capture matching viewport, theme, direction, typography and component state; compare the editable Penpot specimen with the runtime screenshot, record each difference and obtain design-owner approval.')))),'browserEvidence':evidence,'coverage':{'lightLtr':any(x['lightLtr'] for x in evidence),'darkRtl':any(x['darkRtl'] for x in evidence),'forcedColors':any(x['forcedColors'] for x in evidence),'reducedMotion':any(x['reducedMotion'] for x in evidence),'focusState':any(x['focusState'] for x in evidence),'hoverState':any(x['hoverState'] for x in evidence),'disabledState':any(x['disabledState'] for x in evidence),'pressedOrSelectedState':any(x['pressedOrSelectedState'] for x in evidence),'narrowOrZoomProxy':any(x['narrowOrZoomProxy'] for x in evidence)},'familyReport':family_report,'designApproval':f['designApproval'],'evidenceBundle':f['evidenceBundle']})
    ledger={'issue':552,'audit':'Visual screenshot and design-comparison evidence coverage','reviewedOn':DATE,'sourceBaseline':BASELINE,'familyCount':18,'dimension':'visual','dimensionStatus':'audited_gaps','parityAccepted':False,'noneApproved':True,'penpotSnapshot':'evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-SNAPSHOT.json','runtimeScope':'Existing screenshot/browser evidence is inventoried for all families. Light/LTR and Dark/RTL evidence is linked for all 18; narrow/zoom proxy coverage is limited to a subset. A narrow same-size primary-Button host-crop pixel diagnostic exists for Light/LTR and Dark/RTL; no complete family/state-by-state pixel-diff or full side-by-side design comparison was performed. The zoom-200 scenario is a reflow proxy, not native browser UI zoom. Native OS high-contrast and assistive-technology acceptance are not represented. Dated Icon, Slider and RangeSlider review-board addenda update design traceability only; they add no matched browser/Fluent parity evidence.','coverageSummary':{key:sum(1 for f in families if f['coverage'][key]) for key in ['lightLtr','darkRtl','forcedColors','reducedMotion','focusState','hoverState','disabledState','pressedOrSelectedState','narrowOrZoomProxy']},'families':families,'acceptanceBoundary':'This is a visual evidence coverage audit, not a visual parity result. Seven families have a dedicated editable design artifact in the dated record; Icon, Slider and RangeSlider have incomplete review-only boards, four families have reusable local variant assets and eleven families lack a dedicated family-specific artifact. All design approvals remain pending.'}
    lines=['# Visual evidence coverage audit - Issue #552','','Review date: '+DATE+'. Source baseline: '+BASELINE+'.','','## Scope','','This audit inventories existing screenshots, browser visual modes, component style sources and the availability of family-specific editable Penpot design artifacts. Snapshot: [Penpot design-artifact snapshot](evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-SNAPSHOT.json).','','**Important:** this is an evidence coverage audit, not a visual parity verdict. Only the primary Button has a narrow 96×32 host-crop pixel diagnostic in Light/LTR and Dark/RTL; no complete family/state-by-state pixel-diff or approved side-by-side comparison was performed. Matching screenshots and token names do not prove Fluent visual parity. The zoom-200 scenario is a layout-reflow proxy, not native browser UI zoom.','','## Coverage summary','','| Evidence mode | Families with linked evidence |','|---|---:|']
    for key,label in [('lightLtr','Light / LTR'),('darkRtl','Dark / RTL'),('forcedColors','Forced-colors emulation'),('reducedMotion','Reduced-motion emulation'),('focusState','Focus state'),('hoverState','Hover state'),('disabledState','Disabled state'),('pressedOrSelectedState','Pressed/selected state'),('narrowOrZoomProxy','Narrow / zoom-reflow proxy')]:
        lines.append(f"| {label} | {ledger['coverageSummary'][key]} / 18 |")
    lines+=['','## Family findings','','| Family | Editable design artifact | Light/LTR | Dark/RTL | Forced colors | Focus | Hover | Disabled | Pressed/selected | Narrow/zoom proxy | Visual gap |','|---|---|---|---|---|---|---|---|---|---|---|']
    for f in families:
        c=f['coverage']; asset=('review board, incomplete variants' if f['designArtifactStatus']=='dedicated-review-board-incomplete-variant-coverage' else 'draft page(s)' if f['designPages'] else 'no dedicated family asset')
        lines.append(f"| {f['family']} | {asset} | {'yes' if c['lightLtr'] else 'no'} | {'yes' if c['darkRtl'] else 'no'} | {'yes' if c['forcedColors'] else 'no'} | {'yes' if c['focusState'] else 'no'} | {'yes' if c['hoverState'] else 'no'} | {'yes' if c['disabledState'] else 'no'} | {'yes' if c['pressedOrSelectedState'] else 'no'} | {'yes' if c['narrowOrZoomProxy'] else 'no'} | {f['visualGap']} |")
    lines+=['','## Per-family follow-up','']
    for f in families:
        lines += [f"### {f['family']} (#{f['productIssue']})",'',f"**Visual gap:** {f['visualGap']}",'',f"**Follow-up:** {f['followUp']}",'',"**Style sources:** "+(', '.join(f"[{Path(p).name}](../../../{p})" for p in f['styleFiles']) if f['styleFiles'] else 'No dedicated family stylesheet.'),'',"**Browser evidence:** "+', '.join(f"[{Path(x['file']).name}]({x['file']})" for x in f['browserEvidence']),'',f"**Family audit:** [{Path(f['familyReport']).name}](../../../{f['familyReport']})",'']
    lines+=['## Acceptance boundary','','All 18 visual dimensions remain audited_gaps. The Icon, Slider and RangeSlider review boards were added to design traceability only; they do not add matched Fluent screenshots, pixel-diff, native OS/AT coverage or approval. Separately, the primary Button has only a same-size RGB crop diagnostic for Light/LTR and Dark/RTL; other Button states and the remaining 17 families are not covered. Pixel-level/state-by-state Light/Dark/RTL/forced-colors comparison and design-owner sign-off remain open. Every family design approval is pending and evidenceBundle remains null. No product source, CSS or public API changed.','']
    return ledger,'\n'.join(lines)
def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--write',action='store_true'); ap.add_argument('--check',action='store_true'); a=ap.parse_args()
    ledger,report=build()
    if a.write:
        JSON_OUT.write_text(json.dumps(ledger,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
        MD_OUT.write_text(report,encoding='utf-8')
    if a.check:
        if not JSON_OUT.exists() or readj(JSON_OUT)!=ledger: raise SystemExit('Visual evidence ledger stale')
        if not MD_OUT.exists() or MD_OUT.read_text(encoding='utf-8-sig')!=report: raise SystemExit('Visual evidence report stale')
    if not a.write and not a.check: print(f"Visual evidence audit: {ledger['familyCount']} families.")
if __name__=='__main__': main()
