import argparse, json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
Q=ROOT/'docs/v3/quality'
MATRIX=Q/'FLUENT-PARITY-RETRO-AUDIT.json'
CANDIDATES=Q/'FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json'
JSON_OUT=Q/'FLUENT-PARITY-BLAZOR-EXTENSIONS-AUDIT.json'
MD_OUT=Q/'FLUENT-PARITY-BLAZOR-EXTENSIONS-AUDIT.md'
DATE='2026-10-22'
BASELINE='73155f02'

# binding model, source/browser finding, remaining gate, follow-up, family report, browser evidence
A={
'Button':('EventCallback-driven button; no InputBase value binding.','Click/toggle/focus evidence is selective, not a complete callback + disabled + state + native-AT matrix.','Published InteractiveServer callback lifecycle and native AT remain unaccepted.','Verify OnClick order, toggle state, disabled behavior and focus in WASM and published server mode.','FLUENT-PARITY-BUTTON-AUDIT.md',['BLUENT-BUTTON-STATE-CHROME.json','BLUENT-BLAZOR-FOCUS-CHROME.json','BLUENT-LAB-P0-BUTTON-KEYBOARD-SERVER-CHROME.json']),
'Icon':('IconDefinition and inline SVG composition; no InputBase.','Cross-icon/browser alignment is tested; accessible-name, SVG semantics and native AT are not certified.','Decorative versus informative semantics and native screen-reader behavior remain open.','Test labeled/decorative icons with native screen readers and verify aria/title attributes on the rendered SVG/root.','FLUENT-PARITY-ICON-AUDIT.md',['BLUENT-CROSS-ICON-CHROME.json','BLUENT-BUTTON-ICON-ALIGN-CHROME.json']),
'Label':('Native label association plus display-only required marker; no value binding.','Required is visual decoration; it is not automatically connected to target required state or EditContext validation.','Dynamic label-for association and required-state consistency remain open.','Verify changing target IDs and define whether Required is decorative or must track validation semantics.','FLUENT-PARITY-LABEL-AUDIT.md',['BLUENT-LABEL-LINK-BADGE-CHROME.json']),
'Link':('Native anchor navigation plus optional EventCallback; no InputBase.','Href + callback/default-navigation ordering is not accepted across keyboard and published server mode.','Modifier clicks, callback ordering and native AT remain open.','Test Href alone, callback alone, and both together in WASM and published server mode.','FLUENT-PARITY-LINK-AUDIT.md',['BLUENT-LABEL-LINK-BADGE-CHROME.json']),
'Badge':('Display/animation component; no InputBase.','AnimateShadow continues infinitely under reduced-motion emulation; native AT and interactive semantics remain open.','Reduced-motion and any interactive-variant semantics remain open.','Honor prefers-reduced-motion for infinite shadow animation and verify semantics for interactive variants.','FLUENT-PARITY-BADGE-AUDIT.md',['BLUENT-LABEL-LINK-BADGE-CHROME.json']),
'TextField':('InputBase<TValue> binding/validation with configurable bind event.','Browser DOM reports an empty input name; form serialization and EditContext validation are not covered.','Native name/form submission, validation and full InteractiveServer binding remain open.','Add a real EditForm fixture for ValueChanged, ValueExpression, validation, submit serialization and bind-event choice.','FLUENT-PARITY-TEXTFIELD-AUDIT.md',['BLUENT-LAB-P0-CHROME.json']),
'NumericField':('InputBase<TValue> numeric parse/format binding.','Step has no effective behavior; only integer typing is tested, not decimal/float parsing, invalid input, limits or serialization.','Step, culture, validation and form submission remain open.','Test integer/decimal/float, invalid text, limits, culture changes, EditContext and form serialization.','FLUENT-PARITY-TYPED-FIELDS-AUDIT.md',['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json']),
'Checkbox':('InputBase<TValue> checked-value binding over native checkbox.','Visual indeterminate does not set native input.indeterminate; browser AX reports unchecked; Required is a marker, not native required.','Mixed state, required validation, form serialization and native AT remain open.','Set/clear native indeterminate state and verify aria-checked=mixed, required validation, reset and form serialization.','FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md',['BLUENT-CONTROL-SEMANTICS-CHROME.json','BLUENT-CONTROL-SEMANTICS-EDGE.json']),
'Switch':('Checkbox-derived value binding with switch styling.','Browser AX exposes checkbox rather than switch; inherited Size and Circular have no effect in reviewed source.','Role/state announcements, inherited parameters, EditContext and native AT remain open.','Confirm role strategy; test checked/disabled announcements, keyboard, form binding and native AT.','FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md',['BLUENT-CONTROL-SEMANTICS-CHROME.json','BLUENT-CONTROL-SEMANTICS-EDGE.json']),
'RadioGroup':('Group value/callback plus child native radios; custom group semantics.','Wrapper is ignored in AX, radio name attributes are empty, and ArrowRight crosses into the next group.','Group naming, one-tab-stop navigation, form serialization and validation remain open.','Add group label/name; isolate arrow navigation; test real form serialization and EditContext validation.','FLUENT-PARITY-RADIOGROUP-AUDIT.md',['BLUENT-CONTROL-SEMANTICS-CHROME.json','BLUENT-CONTROL-SEMANTICS-EDGE.json']),
'SelectField':('Native select/InputBase-style binding with Bluent option composition.','Inherited BindValueEvent is not forwarded to the visible native select.','Bind-event contract, form name, validation and server mode remain open.','Forward or retire BindValueEvent and test callbacks, validation, reset and form serialization.','FLUENT-PARITY-TYPED-FIELDS-AUDIT.md',['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json']),
'DateField':('InputBase date parsing/validation around nested MaskedField.','BindValueEvent is not forwarded; DateClass is unused; YearSelect mask/format disagree; typed values bypass Min/Max.','Nested event propagation, bounds, date validation and server mode remain open.','Align mask/format/parser; forward or retire BindValueEvent; enforce typed Min/Max; test EditContext.','FLUENT-PARITY-TYPED-FIELDS-AUDIT.md',['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json']),
'TimeField':('InputBase time parsing around nested MaskedField.','BindValueEvent is not forwarded; supplied Culture affects parsing but not consistently formatting.','Culture formatting, validation and server mode remain open.','Use Culture for both formatting/parsing; test seconds, locales, invalid input and EditForm validation.','FLUENT-PARITY-TYPED-FIELDS-AUDIT.md',['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json']),
'MaskedField':('Explicit oninput mask engine updates Blazor current value.','BindValueEvent is unused; Chrome/Edge reproduce leading-literal corruption; digit-conversion flags are order-dependent.','Input event contract, paste/backspace, digit conversion and form binding remain open.','Fix literal indexing; test typing/paste/deletion and Persian/Arabic digits with combined conversion flags.','FLUENT-PARITY-TYPED-FIELDS-AUDIT.md',['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json']),
'OtpField':('Hidden bound value plus JS cell synchronization and event dispatch.','Synthetic paste is tested, not native clipboard/IME; labels are hard-coded English; inherited addons/size are no-ops.','Real form submit, native clipboard/IME, dynamic length, localization and native AT remain open.','Add EditForm fixture; test event variants, native paste/IME, length changes, password mode and screen readers.','FLUENT-PARITY-OTP-AUDIT.md',['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json']),
'Slider':('ValueChanged callback driven by pointer interop; no InputBase.','Div/thumb composition has no native slider role, tabindex or keyboard behavior.','ARIA values, keyboard, callback order and published server mode remain open.','Define native slider semantics and keyboard behavior; test bounds, callbacks and focus in WASM/server.','FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md',['BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json','BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json']),
'RangeSlider':('Two-value ValueRange callback driven by pointer interop; no InputBase.','Two-thumb composition has no native slider role/tabindex/keyboard; crossing and per-thumb focus semantics are unaccepted.','Independent thumb ARIA/keyboard, crossing policy and form integration remain open.','Specify crossing policy and per-thumb semantics; test keyboard, callbacks and form binding in WASM/server.','FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md',['BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json','BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json']),
'FileSelect':('Native InputFile plus batch/per-file EventCallbacks; no InputBase value model.','MaxFiles=2 accepts three files; Disabled affects trigger only; remove action has glyph-only name; Accept is not upload security.','Limit enforcement, native disabled semantics, callback order, upload security and native AT remain open.','Enforce batch/cumulative policy; disable actual input; localize remove name; test callbacks and server-side upload validation.','FLUENT-PARITY-FILESELECT-AUDIT.md',['BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json','BLUENT-LAB-P0-FILE-UPLOAD-SERVER-CHROME.json']),
}
TERMS=('InputBase','ValueChanged','ValueExpression','BindValueEvent','InputFile','AdditionalAttributes','@attributes','@oninput','@onchange','EditContext','EventCallback','OnClick','OnFileSelected','OnFileRemoved','MaxFiles','aria-checked','name=','Required','Disabled','ValueRange')

def readj(path): return json.loads(path.read_text(encoding='utf-8-sig'))
def component_sources(names):
    base=ROOT/'src/Bluent.UI/Components'; out=[]
    for name in names:
        matches=[p for p in base.rglob('*') if p.is_file() and p.name in {f'{name}.razor',f'{name}.razor.cs',f'{name}.cs'}]
        if not matches: raise ValueError(f'No source file found for component {name}')
        out.extend(p.relative_to(ROOT).as_posix() for p in matches)
    return sorted(set(out))
def snippets(paths):
    out=[]
    for rel in paths:
        for n,line in enumerate((ROOT/rel).read_text(encoding='utf-8-sig',errors='replace').splitlines(),1):
            if any(t in line for t in TERMS):
                out.append({'path':rel,'line':n,'excerpt':line.strip()[:160]})
                if len(out)>=6: return out
    if not out:
        for rel in paths:
            for n,line in enumerate((ROOT/rel).read_text(encoding='utf-8-sig',errors='replace').splitlines(),1):
                if line.strip(): return [{'path':rel,'line':n,'excerpt':line.strip()[:160]}]
    return out
def build():
    matrix=readj(MATRIX); cand=readj(CANDIDATES)
    mf={x['family']:x for x in matrix['families']}; cf={x['family']:x for x in cand['families']}
    if set(A)!=set(mf) or set(A)!=set(cf): raise ValueError('Audit must cover exactly all 18 matrix families')
    families=[]
    for name,(binding,finding,gate,followup,report,evidence) in A.items():
        sf=component_sources([c['name'] for c in cf[name]['components']]); se=snippets(sf)
        for e in evidence:
            if not (Q/'evidence'/e).is_file(): raise ValueError(f'Missing browser evidence: {e}')
        if not (Q/report).is_file(): raise ValueError(f'Missing family report: {report}')
        f=mf[name]
        families.append({'family':name,'productIssue':f['productIssue'],'dimension':'BlazorExtensions','dimensionStatus':'audited_gaps','bindingModel':binding,'sourceFinding':finding,'remainingGate':gate,'followUp':followup,'sourceFiles':sf,'sourceSnippets':se,'familyReport':'docs/v3/quality/'+report,'browserEvidence':['evidence/'+e for e in evidence],'designApproval':f['designApproval'],'evidenceBundle':f['evidenceBundle']})
    ledger={'issue':552,'audit':'Blazor binding, validation, event and interop surface','reviewedOn':DATE,'sourceBaseline':BASELINE,'familyCount':18,'dimension':'BlazorExtensions','dimensionStatus':'audited_gaps','parityAccepted':False,'noneApproved':True,'runtimeScope':'Source review plus selected existing Chrome/Edge probes. Not a complete EditContext/form-serialization suite, not a full published InteractiveServer matrix, and not native OS/screen-reader acceptance.','families':families,'acceptanceBoundary':'audited_gaps means the family was reviewed and gaps/evidence limits remain; it is not a pass or parity approval.'}
    lines=['# Blazor extension surface audit - Issue #552','','Review date: '+DATE+'. Source baseline: '+BASELINE+'.','','## Scope','','This cross-family audit covers Blazor binding, validation, EventCallback and JavaScript interop. It distinguishes InputBase-backed fields from native event callbacks, custom value models and file/OTP interop. Source anchors and selected browser evidence are linked per family.','','**Status: audited gaps, not accepted.** Selected WebAssembly and published-server probes do not establish a complete cross-render-mode contract. No native OS or assistive-technology certification is claimed.','','## Family findings','','| Family | Blazor contract | Source finding / evidence gap | Remaining acceptance |','|---|---|---|---|']
    for f in families: lines.append(f"| [{f['family']}](#{f['family'].lower()}) | {f['bindingModel']} | {f['sourceFinding']} | {f['remainingGate']} |")
    lines+=['','## Evidence and follow-up','']
    for f in families:
        lines += [f"### {f['family']} (#{f['productIssue']})",'',f"**Binding model:** {f['bindingModel']}",'',f"**Source finding:** {f['sourceFinding']}",'',f"**Remaining gate:** {f['remainingGate']}",'',f"**Follow-up:** {f['followUp']}",'',"**Source files:** "+', '.join(f"[{Path(p).name}](../../../{p})" for p in f['sourceFiles']),'',"**Source anchors:** "+', '.join(f"[{Path(s['path']).name}:L{s['line']}](../../../{s['path']}#L{s['line']})" for s in f['sourceSnippets'][:3]),'',"**Browser evidence:** "+', '.join(f"[{Path(p).name}]({p})" for p in f['browserEvidence']),'',f"**Family report:** [{Path(f['familyReport']).name}](../../../{f['familyReport']})",'']
    lines+=['## Acceptance boundary','','All 18 BlazorExtensions dimensions are recorded as audited_gaps. Every family design approval remains pending and evidenceBundle remains null. No product source, CSS or public API changed. Form serialization, EditContext validation, callback order, published InteractiveServer behavior and native AT must be tested where applicable before #552 can close.','']
    return ledger,'\n'.join(lines)
def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--write',action='store_true'); ap.add_argument('--check',action='store_true'); a=ap.parse_args()
    ledger,report=build()
    if a.write:
        JSON_OUT.write_text(json.dumps(ledger,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
        MD_OUT.write_text(report,encoding='utf-8')
    if a.check:
        if not JSON_OUT.exists() or readj(JSON_OUT)!=ledger: raise SystemExit('Blazor extension ledger stale')
        if not MD_OUT.exists() or MD_OUT.read_text(encoding='utf-8-sig')!=report: raise SystemExit('Blazor extension report stale')
    if not a.write and not a.check: print(f"Blazor extension audit: {ledger['familyCount']} families.")
if __name__=='__main__': main()
