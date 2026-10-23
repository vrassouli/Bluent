import argparse, json, re
from pathlib import Path
import build_v3_fluent_token_theme_audit as token_audit
import build_v3_fluent_blazor_extensions_audit as blazor_audit

ROOT=Path(__file__).resolve().parents[2]
Q=ROOT/'docs/v3/quality'
MATRIX=Q/'FLUENT-PARITY-RETRO-AUDIT.json'
CANDIDATES=Q/'FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json'
JSON_OUT=Q/'FLUENT-PARITY-RESPONSIVE-RTL-AUDIT.json'
MD_OUT=Q/'FLUENT-PARITY-RESPONSIVE-RTL-AUDIT.md'
DATE='2026-10-22'
BASELINE='73155f02'
EVIDENCE={
'Button':['BLUENT-BUTTON-STATE-CHROME.json','BLUENT-BLAZOR-FOCUS-CHROME.json','BLUENT-LAB-P0-DARK-RTL-CHROME.json','BLUENT-LAB-P0-ZOOM-200-CHROME.json'],
'Icon':['BLUENT-CROSS-ICON-CHROME.json','BLUENT-ICON-CHROME-CANDIDATE-BROWSER.json','BLUENT-ICON-CHROME-RESPONSIVE-320-BROWSER.json','BLUENT-ICON-EDGE-RESPONSIVE-320-BROWSER.json'],
'Label':['BLUENT-LABEL-LINK-BADGE-CHROME.json'],
'Link':['BLUENT-LABEL-LINK-BADGE-CHROME.json'],
'Badge':['BLUENT-LABEL-LINK-BADGE-CHROME.json'],
'TextField':['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json'],
'NumericField':['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json'],
'Checkbox':['BLUENT-CONTROL-SEMANTICS-CHROME.json','BLUENT-CONTROL-SEMANTICS-EDGE.json'],
'Switch':['BLUENT-CONTROL-SEMANTICS-CHROME.json','BLUENT-CONTROL-SEMANTICS-EDGE.json'],
'RadioGroup':['BLUENT-CONTROL-SEMANTICS-CHROME.json','BLUENT-CONTROL-SEMANTICS-EDGE.json'],
'SelectField':['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json'],
'DateField':['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json'],
'TimeField':['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json'],
'MaskedField':['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json'],
'OtpField':['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json'],
'Slider':['BLUENT-LAB-P0-DARK-RTL-CHROME.json','BLUENT-LAB-P0-ZOOM-200-CHROME.json','BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json','BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json'],
'RangeSlider':['BLUENT-LAB-P0-DARK-RTL-CHROME.json','BLUENT-LAB-P0-ZOOM-200-CHROME.json','BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json','BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json'],
'FileSelect':['BLUENT-LAB-P0-DARK-RTL-CHROME.json','BLUENT-LAB-P0-ZOOM-200-CHROME.json','BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json','BLUENT-LAB-P0-FILE-UPLOAD-SERVER-CHROME.json'],
}
PHYSICAL=re.compile(r'(?i)(?:\b(?:margin|padding)-(?:left|right)\s*:|\b(?:left|right)\s*:|\bborder-(?:left|right)(?:-[\w-]+)?\s*:|\bborder-(?:top|bottom)-(?:left|right)-radius\s*:|\btext-align\s*:\s*(?:left|right)\b|\bfloat\s*:\s*(?:left|right)\b|\bbackground-position\s*:\s*(?:left|right)\b|translateX\s*\(|transform\s*:[^;]*translateX)')
LOGICAL=re.compile(r'(?i)(?:\b(?:margin|padding|inset|border)-inline(?:-start|-end)?\s*:|\btext-align\s*:\s*(?:start|end)\b|\bfloat\s*:\s*inline-(?:start|end)\b)')
BREAKPOINT=re.compile(r'(?i)(@media|@container|max-width\s*:|min-width\s*:|clamp\s*\()')
FIXED_DIM=re.compile(r'(?i)\b(?:width|min-width|max-width|height|min-height|max-height)\s*:\s*[^;]*(?:px|rem|em|vw|vh|%)')
RTL_SIGNAL=re.compile(r'(?i)(:dir\(\s*rtl\s*\)|\[dir\s*=\s*["\']?rtl|direction\s*:\s*rtl|isrtl|righttoleft|rtl)')
TERMS=('margin-left','margin-right','padding-left','padding-right','inset-inline','margin-inline','padding-inline','text-align: start','text-align: end','@media','max-width','min-width','dir=','RightToLeft','IsRtl')
FOLLOWUP={
'Icon':'The unchanged-source Chrome/Edge 320px run records Light/LTR and Dark/RTL: SVG 253x253px in a 253x16px wrapper, with no document overflow. The isolated CSS candidate now has live Chrome/Edge checks at 320px in both Light/LTR and Dark/RTL and measures 32x32px; it remains research-only and is not product or design approval.',
'SelectField':'Check native select arrow, popup alignment, label/error wrapping and keyboard focus in RTL at narrow widths.',
'DateField':'Check calendar popup anchoring, weekday order, selected-date focus and Min/Max messages in narrow RTL.',
'OtpField':'Check visual cell order versus digit entry and screen-reader reading order under RTL; preserve digit sequence intentionally.',
'Slider':'Check rail origin, thumb position and value mapping under RTL; define direction/value reversal from design rather than assuming it.',
'RangeSlider':'Check both thumbs, crossing behavior and focus order under RTL at narrow width; validate independently for each thumb.',
'FileSelect':'Check filename wrapping, remove-action placement, disabled state and overflow at narrow widths.',
'Button':'Check icon/label order, focus ring clipping and wrapping at narrow RTL and layout-reflow proxy.',
'Checkbox':'Check label/indicator order, required/error text and focus visibility at narrow RTL.',
'Switch':'Check label/track order and thumb geometry at narrow RTL; verify state does not depend on physical left/right.',
'RadioGroup':'Check option order, wrapping and keyboard focus order under RTL, not just the outer group direction.',
'TextField':'Check label, validation message, caret, adornments and width constraints in RTL at narrow sizes.',
'NumericField':'Check numeric text/caret direction, spin affordance and validation wrapping under RTL.',
'TimeField':'Check field alignment, localized formatting and popup/keyboard order under RTL.',
'MaskedField':'Check caret and literal positioning, digit conversion and mask progression under RTL.',
'Label':'Check association, required marker placement and wrapping in RTL.',
'Link':'Check underline/focus geometry and inline placement within RTL text flow.',
'Badge':'Check badge placement and wrapping in RTL; include reduced-motion state in the visual matrix.',
}
def readj(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def evidence_info(name):
    info=[]
    for filename in EVIDENCE[name]:
        p=Q/'evidence'/filename
        if not p.is_file(): raise ValueError(f'Missing browser evidence for {name}: {filename}')
        d=readj(p); labels=[]
        def all_strings(value):
            if isinstance(value,str):
                yield value.upper()
            elif isinstance(value,dict):
                for child in value.values(): yield from all_strings(child)
            elif isinstance(value,list):
                for child in value: yield from all_strings(child)
        labels=list(all_strings(d))
        if d.get('scenario'): labels.append(str(d['scenario']).upper())
        raw=' '.join(labels)
        info.append({'file':'evidence/'+filename,'engine':d.get('engine') or ('edge' if 'EDGE' in filename else 'chrome'),'scenario':d.get('scenario'),'rtlEvidence':'DARK-RTL' in raw,'narrowOrZoomEvidence':('ZOOM-200' in raw or 'MOBILE-320' in raw or ('320' in raw and 'MOBILE' in raw)),'forcedColorsEvidence':'FORCED-COLORS' in raw,'reducedMotionEvidence':'REDUCED-MOTION' in raw,'evidenceLabels':sorted(set(labels))[:12]})
    return info
def build():
    matrix=readj(MATRIX); cand=readj(CANDIDATES)
    mf={f['family']:f for f in matrix['families']}; cf={f['family']:f for f in cand['families']}
    if set(EVIDENCE)!=set(mf) or set(FOLLOWUP)!=set(mf) or set(token_audit.STYLE_MAP)!=set(mf): raise ValueError('Responsive/RTL audit must cover exactly all 18 families')
    families=[]
    for name in mf:
        styles=['src/Bluent.UI/Styles/'+p for p in token_audit.STYLE_MAP[name]]
        component_files=blazor_audit.component_sources([c['name'] for c in cf[name]['components']])
        physical=[]; logical=[]; breakpoints=[]; fixed=[]; rtl=[]
        for rel in styles:
            for n,line in enumerate((ROOT/rel).read_text(encoding='utf-8-sig',errors='replace').splitlines(),1):
                if line.strip().startswith('//'): continue
                row={'path':rel,'line':n,'excerpt':line.strip()[:160]}
                if PHYSICAL.search(line): physical.append(row)
                if LOGICAL.search(line): logical.append(row)
                if BREAKPOINT.search(line): breakpoints.append(row)
                if FIXED_DIM.search(line): fixed.append(row)
                if RTL_SIGNAL.search(line): rtl.append(row)
        for rel in component_files:
            for n,line in enumerate((ROOT/rel).read_text(encoding='utf-8-sig',errors='replace').splitlines(),1):
                if RTL_SIGNAL.search(line): rtl.append({'path':rel,'line':n,'excerpt':line.strip()[:160]})
        src_notes=[]
        for rel in styles+component_files:
            for n,line in enumerate((ROOT/rel).read_text(encoding='utf-8-sig',errors='replace').splitlines(),1):
                if any(t.lower() in line.lower() for t in TERMS):
                    src_notes.append({'path':rel,'line':n,'excerpt':line.strip()[:160]})
                    if len(src_notes)>=8: break
            if len(src_notes)>=8: break
        ev=evidence_info(name); f=mf[name]
        families.append({'family':name,'productIssue':f['productIssue'],'dimension':'responsiveRTL','dimensionStatus':'audited_gaps','styleFiles':styles,'componentSourceFiles':component_files,'physicalDirectionalDeclarations':physical,'logicalDirectionalDeclarations':logical,'breakpointAndReflowRules':breakpoints,'fixedDimensionRules':fixed,'explicitRtlSignals':rtl,'sourceSnippets':src_notes,'browserEvidence':ev,'hasRtlBrowserEvidence':any(x['rtlEvidence'] for x in ev),'hasNarrowOrZoomEvidence':any(x['narrowOrZoomEvidence'] for x in ev),'followUp':FOLLOWUP[name],'designApproval':f['designApproval'],'evidenceBundle':f['evidenceBundle']})
    ledger={'issue':552,'audit':'Responsive layout and RTL source/evidence inventory','reviewedOn':DATE,'sourceBaseline':BASELINE,'familyCount':18,'dimension':'responsiveRTL','dimensionStatus':'audited_gaps','parityAccepted':False,'noneApproved':True,'runtimeScope':'Source inventory plus existing Chrome/Edge browser evidence. Dark/RTL evidence is present for all 18 families; narrow/zoom proxy evidence is limited to a subset. The zoom-200 scenario is a layout-reflow proxy, not native browser UI zoom. No native OS/AT acceptance is claimed.','families':families,'acceptanceBoundary':'Physical directional declarations are review prompts, not automatic defects. RTL and narrow-layout acceptance requires comparison with the approved design and actual browser states; all family approvals remain pending.'}
    lines=['# Responsive layout and RTL audit - Issue #552','','Review date: '+DATE+'. Source baseline: '+BASELINE+'.','','## Scope','','This source/evidence inventory reviews physical versus logical directional CSS, breakpoints, fixed dimensions and explicit RTL signals across the 18 pilot families. It links existing browser evidence for dark RTL, forced colors, reduced motion and selected narrow/zoom scenarios.','','**Status: audited gaps, not accepted.** All 18 families have selected dark/RTL browser evidence, but the 320 CSS px and zoom/reflow evidence is not complete across all families. The existing zoom-200 scenario is a layout-reflow proxy, not native browser UI zoom. Physical left/right declarations may be intentional; each requires a design-backed decision rather than automatic replacement.','','## Summary','','| Family | Physical directional declarations | Logical directional declarations | Breakpoint/reflow rules | Explicit RTL signals | RTL browser evidence | Narrow/zoom evidence |','|---|---:|---:|---:|---:|---|---|']
    for f in families:
        lines.append(f"| {f['family']} | {len(f['physicalDirectionalDeclarations'])} | {len(f['logicalDirectionalDeclarations'])} | {len(f['breakpointAndReflowRules'])} | {len(f['explicitRtlSignals'])} | {'yes' if f['hasRtlBrowserEvidence'] else 'no'} | {'yes' if f['hasNarrowOrZoomEvidence'] else 'no'} |")
    lines+=['','## Family findings','']
    for f in families:
        note=(f"{len(f['physicalDirectionalDeclarations'])} physical directional declaration(s) need review for intentionality/logical-property parity." if f['physicalDirectionalDeclarations'] else ('No dedicated family stylesheet; direction depends on markup and parent layout.' if not f['styleFiles'] else 'No physical left/right declaration found in mapped family stylesheet; responsive/RTL runtime acceptance remains open.'))
        lines += [f"### {f['family']} (#{f['productIssue']})",'',f"**Source finding:** {note}",'',f"**Logical declarations:** {len(f['logicalDirectionalDeclarations'])}; **breakpoint/reflow rules:** {len(f['breakpointAndReflowRules'])}; **fixed dimensions:** {len(f['fixedDimensionRules'])}; **explicit RTL signals:** {len(f['explicitRtlSignals'])}.",'',f"**Follow-up:** {f['followUp']}",'','**Style files:** '+(', '.join(f"[{Path(p).name}](../../../{p})" for p in f['styleFiles']) if f['styleFiles'] else 'No dedicated family stylesheet.'),'','**Source anchors:** '+(', '.join(f"[{Path(x['path']).name}:L{x['line']}](../../../{x['path']}#L{x['line']})" for x in f['sourceSnippets'][:4]) if f['sourceSnippets'] else 'No matching source anchors in the reviewed file set.'),'','**Browser evidence:** '+', '.join(f"[{Path(x['file']).name}]({x['file']}) ({'RTL' if x['rtlEvidence'] else 'non-RTL'}; {'narrow/zoom proxy' if x['narrowOrZoomEvidence'] else 'no narrow/zoom scenario'})" for x in f['browserEvidence']),'']
    lines+=['## Acceptance boundary','','All 18 responsiveRTL dimensions are recorded as audited_gaps. This audit does not claim 320px/200% browser UI zoom coverage for every family, computed visual parity with the pinned Fluent runtime, or native OS/assistive-technology acceptance. Every family design approval remains pending and evidenceBundle remains null. No product source, CSS or public API changed.','']
    return ledger,'\n'.join(lines)
def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--write',action='store_true'); ap.add_argument('--check',action='store_true'); a=ap.parse_args()
    ledger,report=build()
    if a.write:
        JSON_OUT.write_text(json.dumps(ledger,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
        MD_OUT.write_text(report,encoding='utf-8')
    if a.check:
        if not JSON_OUT.exists() or readj(JSON_OUT)!=ledger: raise SystemExit('Responsive/RTL ledger stale')
        if not MD_OUT.exists() or MD_OUT.read_text(encoding='utf-8-sig')!=report: raise SystemExit('Responsive/RTL report stale')
    if not a.write and not a.check: print(f"Responsive/RTL audit: {ledger['familyCount']} families.")
if __name__=='__main__': main()
