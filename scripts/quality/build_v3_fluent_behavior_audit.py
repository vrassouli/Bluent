import argparse, json
from pathlib import Path
import build_v3_fluent_blazor_extensions_audit as blazor_audit

ROOT=Path(__file__).resolve().parents[2]
Q=ROOT/'docs/v3/quality'
MATRIX=Q/'FLUENT-PARITY-RETRO-AUDIT.json'
CANDIDATES=Q/'FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json'
JSON_OUT=Q/'FLUENT-PARITY-BEHAVIOR-AUDIT.json'
MD_OUT=Q/'FLUENT-PARITY-BEHAVIOR-AUDIT.md'
DATE='2026-10-22'
BASELINE='73155f02'
A={
'Button':('Existing browser probes cover representative toggle/state and keyboard-focus paths.','The full OnClick callback-order, disabled/selected state and focus contract is not exercised across every appearance and published render mode.','Run a single state-transition matrix for click, toggle, disabled, focus and callback ordering in WASM and published InteractiveServer.'),
'Icon':('Cross-icon browser probes compare representative rendered size, alignment and inherited color.','Icon behavior is mostly static composition; dynamic accessible naming and native screen-reader behavior are not accepted by DOM/screenshot evidence.','Test informative versus decorative icons, dynamic icon changes, title/aria propagation and native AT.'),
'Label':('Browser evidence covers representative label rendering and association.','Required is a display marker, not a live EditContext/target-required state; dynamic target-ID changes and click-to-focus are not fully tested.','Exercise label click/focus, dynamic For changes, required/invalid state and localization in a real EditForm.'),
'Link':('Browser evidence covers representative anchor rendering and keyboard semantics.','Href plus OnClick/default-navigation ordering, modified clicks and published-server behavior remain unaccepted.','Test Href alone, callback alone and both together; verify Enter, modifier clicks and default navigation in WASM/server.'),
'Badge':('Browser evidence covers representative badge variants and animation.','Infinite shadow animation has no component-specific reduced-motion rule; interactive semantics are not accepted.','Test reduced-motion behavior and verify focus/click semantics only for variants intended to be interactive.'),
'TextField':('The field probe captures native input attributes and visual states.','A real EditForm value/validation/submit cycle is not in the evidence set; the visible input has an empty name.','Test ValueChanged, ValueExpression, bind event, validation messages, reset and form submission with a real EditForm.'),
'NumericField':('Chrome/Edge browser evidence shows keyboard-entered integer input updates the bound display.','Step has no effective behavior; decimal/float parsing, invalid text, limits, culture and validation remain untested.','Exercise integer/decimal/float values, invalid text, limits, Step, culture changes and EditForm validation.'),
'Checkbox':('Space toggles the native checkbox and the bound state changes.','The visual mixed state does not set native input.indeterminate and AX reports unchecked; required validation is not native.','Test mixed-state transitions, form reset, required validation and serialization; confirm aria-checked=mixed.'),
'Switch':('Space toggles the switch-like checkbox and bound state changes.','AX exposes checkbox rather than switch; inherited Size/Circular parameters have no effect.','Confirm the role contract, test checked/disabled transitions, keyboard and form binding, then native AT.'),
'RadioGroup':('Arrow navigation works within the first options of a group.','ArrowRight from the final option moves into the next RadioGroup; group wrapper is ignored and radio name is empty.','Isolate arrow-key navigation per group, provide group name/label and test tab stops, value updates and form submission.'),
'SelectField':('Native ArrowDown changes the selected option from Green to Blue.','Inherited BindValueEvent is not forwarded to the visible select; form name/validation behavior is not accepted.','Test bind-event choice, ValueChanged, disabled/required states, reset, EditContext and native form serialization.'),
'DateField':('The browser probe captures the native date input and field state.','Typed values can bypass Min/Max bounds; YearSelect format and mask disagree and nested bind-event behavior is incomplete.','Test typed and picker-selected dates at every bound, invalid input, calendar navigation and EditForm validation.'),
'TimeField':('The browser probe captures native time input and field state.','Culture is used for parsing but not consistently for formatting; nested bind-event and seconds behavior remain open.','Test locale-specific formatting/parsing, seconds, invalid input, keyboard/picker operation and EditForm validation.'),
'MaskedField':('Typing and bound display are exercised in Chrome and Edge.','A real browser failure reproduces leading-literal corruption: 09123456789 becomes 0991-234-5678; paste/backspace and digit conversion combinations remain open.','Fix mask literal indexing, then test typing, paste, backspace, deletion and Persian/Arabic digit conversion.'),
'OtpField':('Browser probes cover sequential typing, Backspace, ArrowLeft, synthetic paste and non-digit filtering.','Native clipboard/IME, dynamic length, localized labels and real form submission are not tested.','Test native paste/IME, length changes, event dispatch, password mode, localized labels and EditForm submission.'),
'Slider':('Pointer interaction changes the slider value in existing browser probes.','The visible div/thumb composition has no native slider role, tabindex or keyboard behavior.','Define role/ARIA and keyboard semantics; test pointer/keyboard bounds, callbacks, focus and published server mode.'),
'RangeSlider':('Pointer interaction covers representative two-thumb value updates.','The two-thumb composition lacks native keyboard semantics; crossing/collision and independent thumb focus/value rules are not accepted.','Specify crossing policy and per-thumb role/ARIA/keyboard behavior; test both thumbs and callbacks in WASM/server.'),
'FileSelect':('Browser probes cover file selection and a published-server upload path.','MaxFiles=2 accepts three files; Disabled affects the trigger only and the remove action has a glyph-only accessible name.','Enforce batch/cumulative limits, disable the actual input, add a localized remove label and test callback ordering/security.'),
}
TERMS=('EventCallback','ValueChanged','ValueExpression','BindValueEvent','InputFile','@onclick','@oninput','@onchange','EditContext','aria-','keydown','Arrow','MaxFiles','Required','Disabled','OnChange','OnClick','ValueRange','CurrentValue','OnParametersSet')
def readj(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def source_snippets(paths):
    out=[]
    for rel in paths:
        for n,line in enumerate((ROOT/rel).read_text(encoding='utf-8-sig',errors='replace').splitlines(),1):
            if any(t.lower() in line.lower() for t in TERMS):
                out.append({'path':rel,'line':n,'excerpt':line.strip()[:160]})
                if len(out)>=6: return out
    if not out:
        for rel in paths:
            for n,line in enumerate((ROOT/rel).read_text(encoding='utf-8-sig',errors='replace').splitlines(),1):
                if line.strip(): return [{'path':rel,'line':n,'excerpt':line.strip()[:160]}]
    return out
def build():
    matrix=readj(MATRIX); candidates=readj(CANDIDATES)
    mf={f['family']:f for f in matrix['families']}; cf={f['family']:f for f in candidates['families']}
    if set(A)!=set(mf) or set(A)!=set(cf): raise ValueError('Behavior audit must cover exactly all 18 families')
    families=[]
    for name,(observed,gap,followup) in A.items():
        source_files=blazor_audit.component_sources([c['name'] for c in cf[name]['components']])
        snippets=source_snippets(source_files); audit=blazor_audit.A[name]
        browser=['evidence/'+x for x in audit[5]]
        for rel in browser:
            if not (Q/rel).is_file(): raise ValueError(f'Missing browser evidence for {name}: {rel}')
        family_report='docs/v3/quality/'+audit[4]
        if not (ROOT/family_report).is_file(): raise ValueError(f'Missing family report for {name}')
        f=mf[name]
        families.append({'family':name,'productIssue':f['productIssue'],'dimension':'behavior','dimensionStatus':'audited_gaps','observedBehavior':observed,'knownGap':gap,'followUp':followup,'sourceFiles':source_files,'sourceSnippets':snippets,'familyReport':family_report,'browserEvidence':browser,'designApproval':f['designApproval'],'evidenceBundle':f['evidenceBundle']})
    ledger={'issue':552,'audit':'Interactive behavior and state-transition inventory','reviewedOn':DATE,'sourceBaseline':BASELINE,'familyCount':18,'dimension':'behavior','dimensionStatus':'audited_gaps','parityAccepted':False,'noneApproved':True,'runtimeScope':'Selected existing Chrome/Edge browser probes plus source review. This is not a complete state-transition matrix, not a full published InteractiveServer matrix, and not native OS/screen-reader acceptance. Known failing browser checks are preserved as findings, not converted to passes.','families':families,'acceptanceBoundary':'audited_gaps means interaction behavior was inventoried and gaps/evidence limits remain. It is not a pass or Fluent parity approval.'}
    lines=['# Interactive behavior audit - Issue #552','','Review date: '+DATE+'. Source baseline: '+BASELINE+'.','','## Scope','','This audit consolidates source findings and selected browser observations for click/navigation, value binding, keyboard and pointer operation, state transitions, input parsing, file selection and validation. It preserves known failures as findings and separates confirmed defects from untested acceptance gates.','','**Status: audited gaps, not accepted.** Browser probes cover selected interactions, not every state, render mode or native assistive technology. The current MaskedField leading-literal failure remains visible in the evidence.','','## Family findings','','| Family | Observed behavior | Known gap / evidence limit | Next acceptance step |','|---|---|---|---|']
    for f in families: lines.append(f"| [{f['family']}](#{f['family'].lower()}) | {f['observedBehavior']} | {f['knownGap']} | {f['followUp']} |")
    lines+=['','## Evidence and follow-up','']
    for f in families:
        lines += [f"### {f['family']} (#{f['productIssue']})",'',f"**Observed behavior:** {f['observedBehavior']}",'',f"**Known gap / evidence limit:** {f['knownGap']}",'',f"**Follow-up:** {f['followUp']}",'',"**Source files:** "+', '.join(f"[{Path(p).name}](../../../{p})" for p in f['sourceFiles']),'',"**Source anchors:** "+', '.join(f"[{Path(x['path']).name}:L{x['line']}](../../../{x['path']}#L{x['line']})" for x in f['sourceSnippets'][:3]),'',"**Browser evidence:** "+', '.join(f"[{Path(p).name}]({p})" for p in f['browserEvidence']),'',f"**Family audit:** [{Path(f['familyReport']).name}](../../../{f['familyReport']})",'']
    lines+=['## Acceptance boundary','','All 18 behavior dimensions are recorded as audited_gaps. Every family design approval remains pending and evidenceBundle remains null. No product source, CSS or public API changed. Confirmed behavior defects must be fixed only after design/API decisions and appropriate owner review; the audit does not authorize implementation.','']
    return ledger,'\n'.join(lines)
def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--write',action='store_true'); ap.add_argument('--check',action='store_true'); a=ap.parse_args()
    ledger,report=build()
    if a.write:
        JSON_OUT.write_text(json.dumps(ledger,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
        MD_OUT.write_text(report,encoding='utf-8')
    if a.check:
        if not JSON_OUT.exists() or readj(JSON_OUT)!=ledger: raise SystemExit('Behavior ledger stale')
        if not MD_OUT.exists() or MD_OUT.read_text(encoding='utf-8-sig')!=report: raise SystemExit('Behavior report stale')
    if not a.write and not a.check: print(f"Behavior audit: {ledger['familyCount']} families.")
if __name__=='__main__': main()
